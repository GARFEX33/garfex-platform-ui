#!/usr/bin/env node

import { lstat, readFile, readlink, readdir, realpath } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const RULES = Object.freeze({
  BACKEND_REFERENCE: "forbidden-backend-reference",
  GARFEX_PACKAGE: "forbidden-garfex-package",
  EXTERNAL_SOURCE: "external-source-reference",
  MANIFEST_DEPENDENCY: "backend-manifest-dependency",
  ESCAPING_CONFIG: "escaping-workspace-config",
  GIT_DEPENDENCY: "counterpart-git-dependency",
  ESCAPING_SYMLINK: "escaping-symlink",
  HEADLESS_HOST: "headless-host-dependency",
  FRONTEND_FRAMEWORK: "frontend-framework-structure",
  FAKE_EXTERNAL_ARTIFACT: "fake-external-artifact",
});

export class ConfigurationError extends Error {}

const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".ts",
  ".tsx",
  ".mts",
  ".cts",
]);
const GENERAL_CONFIG_EXTENSIONS = new Set([
  ".json",
  ".jsonc",
  ".yaml",
  ".yml",
  ".toml",
  ".ini",
  ".conf",
  ".sh",
  ".bash",
  ".zsh",
]);
const ALWAYS_IGNORED = new Set([
  ".git",
  ".codegraph",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".next",
  ".nuxt",
]);
const IMPORT_PATTERNS = [
  /\b(?:import|export)\s+(?:type\s+)?(?:[^"'`]*?\s+from\s*)?["'`]([^"'`]+)["'`]/g,
  /\bimport\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /\brequire\s*\(\s*["'`]([^"'`]+)["'`]\s*\)/g,
  /\/\/\/\s*<reference\s+(?:path|types)=["']([^"']+)["']/g,
];
const BACKEND_REFERENCE =
  /(?:^|[\\/@])garfex-platform(?:[\\/]|$)|(?:^|[\\/])apps[\\/]backend(?:[\\/]|$)|(?:^|[\\/])resource-master[\\/](?:public|internal|internals)(?:[\\/]|$)|(?:^|[\\/])convex[\\/](?:_generated|generated)(?:[\\/]|$)|(?:^|[\\/])(?:backend|resource-master)[\\/].*(?:schema|private)/i;
const COUNTERPART =
  /(?:^|[\\/:@"'\s])garfex-platform(?:\.git)?(?=[\\/#"'\s]|$)|apps[\\/]backend|resource-master/i;
const GIT_VALUE =
  /^(?:git(?:\+[^:]+)?:|github:|gitlab:|bitbucket:|https?:\/\/.*\.git(?:#|$)|ssh:)/i;
const LOCKFILES = new Set(["pnpm-lock.yaml", "package-lock.json", "yarn.lock"]);
const DEPENDENCY_SECTIONS = new Set([
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "optionalDependencies",
  "resolutions",
  "overrides",
]);
const CHECKER_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = path.resolve(CHECKER_DIRECTORY, "../..");
const FIXTURES_ROOT = path.join(
  REPOSITORY_ROOT,
  "tooling/architecture-fixtures",
);

function inside(root, candidate) {
  const relative = path.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== ".." &&
      !path.isAbsolute(relative))
  );
}

function relativeName(root, filename) {
  return path.relative(root, filename).split(path.sep).join("/") || ".";
}

function add(violations, rule, root, filename, detail) {
  violations.push({ rule, file: relativeName(root, filename), detail });
}

function sourceSpecifiers(text) {
  const found = [];
  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    for (const match of text.matchAll(pattern)) found.push(match[1]);
  }
  return found;
}

function withoutSourceComments(text) {
  let cleaned = "";
  let quote;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quote) {
      cleaned += character;
      if (character === "\\") {
        cleaned += text[index + 1] ?? "";
        index += 1;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      cleaned += character;
      continue;
    }
    if (character === "/" && text[index + 1] === "/") {
      const end = text.indexOf("\n", index + 2);
      if (end === -1) break;
      cleaned += "\n";
      index = end;
      continue;
    }
    if (character === "/" && text[index + 1] === "*") {
      const end = text.indexOf("*/", index + 2);
      if (end === -1) break;
      cleaned += text.slice(index, end + 2).replace(/[^\n]/g, " ");
      index = end + 1;
      continue;
    }
    cleaned += character;
  }

  return cleaned;
}

function sourceOperationalStrings(text) {
  const found = [];
  const source = withoutSourceComments(text);
  const patterns = [
    /\b(?:spawn|spawnSync|execFile|execFileSync|exec|execSync|fork|readFile|readFileSync|writeFile|writeFileSync|open|openSync|access|accessSync|stat|statSync|lstat|lstatSync|readdir|readdirSync|realpath|realpathSync|readlink|readlinkSync|chdir)\s*\(\s*["'`]([^"'`]+)["'`]/g,
    /\b[\w$]*(?:path|file|dir|root|config|script|command|executable|backend|resourceMaster)[\w$]*\s*(?:=|:)\s*["'`]([^"'`]+)["'`]/gi,
  ];
  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) found.push(match[1]);
  }
  return found;
}

function filesystemPathCandidates(value) {
  return (
    value
      .match(
        /(?:^|[\s=,:;"'])(\.{1,2}[\\/][^\s"'`;|&()]+|[A-Za-z]:[\\/][^\s"'`;|&()]+|\/[A-Za-z0-9._-][^\s"'`;|&()]*)/g,
      )
      ?.map((candidate) => candidate.trim().replace(/^[=,:;"']+/, "")) ?? []
  );
}

function stripJsonComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "")
    .replace(/,\s*([}\]])/g, "$1");
}

function parseJson(text, filename) {
  try {
    return JSON.parse(stripJsonComments(text));
  } catch (error) {
    throw new ConfigurationError(`Cannot parse ${filename}: ${error.message}`);
  }
}

function sourceReferenceEscapes(root, filename, specifier) {
  if (path.isAbsolute(specifier) || path.win32.isAbsolute(specifier))
    return true;
  if (!specifier.startsWith(".")) return false;
  return !inside(root, path.resolve(path.dirname(filename), specifier));
}

function scanSource(root, filename, text, violations) {
  const normalizedFile = relativeName(root, filename);
  const isHeadless = /(^|\/)surface\//.test(normalizedFile);

  if (
    isHeadless &&
    (/(^|\/)surface\/(?:domain|application|repositories|widgets)(?:\/|$)/i.test(
      normalizedFile,
    ) ||
      /\/(?:UiPort|HostPort|GarfexSelectList)\.[^.]+$/i.test(normalizedFile))
  ) {
    add(
      violations,
      RULES.FRONTEND_FRAMEWORK,
      root,
      filename,
      "generic frontend framework or domain/repository structure",
    );
  }

  if (
    isHeadless &&
    (/(^|\/)surface\/.*\/(?:dtos?|schemas?|generated|backend)(?:\/|$)/i.test(
      normalizedFile,
    ) ||
      /\/(?:Mock|Fake).*(?:Dto|Client|Repository)\.[^.]+$/i.test(
        normalizedFile,
      ))
  ) {
    add(
      violations,
      RULES.FAKE_EXTERNAL_ARTIFACT,
      root,
      filename,
      "fake or backend-shaped external artifact in reusable Surface code",
    );
  }

  const references = new Set([
    ...sourceSpecifiers(text),
    ...sourceOperationalStrings(text),
  ]);

  for (const reference of references) {
    if (/^@garfex(?:\/|$)/i.test(reference)) {
      add(
        violations,
        RULES.GARFEX_PACKAGE,
        root,
        filename,
        `@garfex package reference: ${reference}`,
      );
    }
    if (BACKEND_REFERENCE.test(reference)) {
      add(
        violations,
        RULES.BACKEND_REFERENCE,
        root,
        filename,
        `backend source reference: ${reference}`,
      );
    }
    for (const candidate of filesystemPathCandidates(reference)) {
      if (sourceReferenceEscapes(root, filename, candidate)) {
        add(
          violations,
          RULES.EXTERNAL_SOURCE,
          root,
          filename,
          `source reference escapes root: ${candidate}`,
        );
      }
    }
    if (
      isHeadless &&
      (/^@earendil-works\/pi-(?:tui|coding-agent)(?:\/|$)/i.test(reference) ||
        /(?:^|[\\/])(?:hosts?|pi)(?:[\\/]|$)/i.test(reference))
    ) {
      add(
        violations,
        RULES.HEADLESS_HOST,
        root,
        filename,
        `headless Surface references host runtime: ${reference}`,
      );
    }
  }
}

function dependencyEntries(manifest) {
  const entries = [];
  for (const section of DEPENDENCY_SECTIONS) {
    const values = manifest?.[section];
    if (!values || typeof values !== "object" || Array.isArray(values))
      continue;
    for (const [name, value] of Object.entries(values))
      entries.push([name, String(value)]);
  }
  return entries;
}

function localDependencyEscapes(root, filename, value) {
  const match = /^(?:file:|link:|workspace:)?(.+)$/i.exec(value);
  const target = match?.[1];
  if (
    !target ||
    (!target.startsWith(".") &&
      !path.isAbsolute(target) &&
      !path.win32.isAbsolute(target))
  )
    return false;
  return !inside(root, path.resolve(path.dirname(filename), target));
}

function nestedManifestStrings(value, keys = []) {
  if (typeof value === "string") return [[keys.join("."), value]];
  if (!value || typeof value !== "object") return [];

  const entries = [];
  for (const [key, nestedValue] of Object.entries(value)) {
    if (keys.length === 0 && DEPENDENCY_SECTIONS.has(key)) continue;
    entries.push(...nestedManifestStrings(nestedValue, [...keys, key]));
  }
  return entries;
}

function manifestStringRequiresExternalSource(root, filename, value) {
  return filesystemPathCandidates(value).some((candidate) =>
    sourceReferenceEscapes(root, filename, candidate),
  );
}

function scanManifest(root, filename, text, violations) {
  const manifest = parseJson(text, relativeName(root, filename));
  for (const [name, value] of dependencyEntries(manifest)) {
    if (/^@garfex(?:\/|$)/i.test(name) || /^@garfex(?:\/|$)/i.test(value)) {
      add(
        violations,
        RULES.GARFEX_PACKAGE,
        root,
        filename,
        `@garfex dependency: ${name}`,
      );
    }
    if (
      COUNTERPART.test(name) ||
      COUNTERPART.test(value) ||
      localDependencyEscapes(root, filename, value)
    ) {
      add(
        violations,
        RULES.MANIFEST_DEPENDENCY,
        root,
        filename,
        `forbidden dependency: ${name}=${value}`,
      );
    }
    if (GIT_VALUE.test(value) && COUNTERPART.test(value)) {
      add(
        violations,
        RULES.GIT_DEPENDENCY,
        root,
        filename,
        `counterpart Git dependency: ${value}`,
      );
    }
  }

  for (const [field, value] of nestedManifestStrings(manifest)) {
    if (
      COUNTERPART.test(value) ||
      manifestStringRequiresExternalSource(root, filename, value)
    ) {
      add(
        violations,
        RULES.MANIFEST_DEPENDENCY,
        root,
        filename,
        `forbidden manifest configuration: ${field}=${value}`,
      );
    }
  }
}

function configPathEscapes(root, filename, value) {
  return (
    typeof value === "string" &&
    !inside(
      root,
      path.resolve(path.dirname(filename), value.replace(/\*+.*$/, "")),
    )
  );
}

function scanTsconfig(root, filename, text, violations) {
  const config = parseJson(text, relativeName(root, filename));
  const extendedConfigs = Array.isArray(config.extends)
    ? config.extends
    : [config.extends];
  for (const extendedConfig of extendedConfigs) {
    if (configPathEscapes(root, filename, extendedConfig)) {
      add(
        violations,
        RULES.ESCAPING_CONFIG,
        root,
        filename,
        `extended config escapes root: ${extendedConfig}`,
      );
    }
  }
  for (const reference of config.references ?? []) {
    if (configPathEscapes(root, filename, reference?.path)) {
      add(
        violations,
        RULES.ESCAPING_CONFIG,
        root,
        filename,
        `project reference escapes root: ${reference.path}`,
      );
    }
  }
  for (const [alias, targets] of Object.entries(
    config.compilerOptions?.paths ?? {},
  )) {
    for (const target of Array.isArray(targets) ? targets : []) {
      if (configPathEscapes(root, filename, target)) {
        add(
          violations,
          RULES.ESCAPING_CONFIG,
          root,
          filename,
          `path mapping escapes root: ${alias} -> ${target}`,
        );
      }
    }
  }
}

function scanWorkspace(root, filename, text, violations) {
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*-?\s*["']?([^\s"'#]+)["']?\s*(?:#.*)?$/.exec(line);
    const value = match?.[1];
    if (
      value &&
      (value.startsWith(".") || path.isAbsolute(value)) &&
      configPathEscapes(root, filename, value)
    ) {
      add(
        violations,
        RULES.ESCAPING_CONFIG,
        root,
        filename,
        `workspace path escapes root: ${value}`,
      );
    }
  }
}

function scanGitmodules(root, filename, text, violations) {
  if (COUNTERPART.test(text)) {
    add(
      violations,
      RULES.GIT_DEPENDENCY,
      root,
      filename,
      "counterpart submodule or Git URL",
    );
  }
}

function generalConfigStrings(text, extension) {
  if (extension === ".json" || extension === ".jsonc") {
    try {
      const config = JSON.parse(stripJsonComments(text));
      return nestedManifestStrings(config).map(([, value]) => value);
    } catch {
      // Non-authoritative examples and templates may be JSON-like rather than parseable.
    }
  }

  const values = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith(";")) continue;

    const withoutComment = line.replace(/\s+#.*$/, "");
    const assignment = /^[-\w."']+\s*(?:=|:)\s*(.+)$/.exec(withoutComment);
    const listItem = /^-\s+(.+)$/.exec(withoutComment);
    const value = assignment?.[1] ?? listItem?.[1] ?? withoutComment;
    values.push(value.replace(/^(["'])(.*)\1\s*,?$/, "$2"));
  }
  return values;
}

function isGeneralConfig(basename, extension) {
  return (
    GENERAL_CONFIG_EXTENSIONS.has(extension) ||
    /^\.[a-z0-9_-]+rc(?:\..+)?$/i.test(basename) ||
    /(?:^|[._-])(?:config|rc)(?:[._-]|$)/i.test(basename)
  );
}

function counterpartPathValues(value) {
  if (/^(?:https?|registry):/i.test(value) && !GIT_VALUE.test(value)) return [];
  const candidates = new Set(filesystemPathCandidates(value));
  for (const token of value.match(/[^\s"'`;|&()]+[\\/][^\s"'`;|&()]*/g) ?? []) {
    candidates.add(token.replace(/^[=,:]+|[,]+$/g, ""));
  }
  return [...candidates].filter(
    (candidate) =>
      BACKEND_REFERENCE.test(candidate) || COUNTERPART.test(candidate),
  );
}

function scanGeneralConfig(root, filename, text, extension, violations) {
  for (const value of generalConfigStrings(text, extension)) {
    for (const candidate of counterpartPathValues(value)) {
      add(
        violations,
        RULES.BACKEND_REFERENCE,
        root,
        filename,
        `backend configuration path: ${candidate}`,
      );
    }
    for (const candidate of filesystemPathCandidates(value)) {
      if (
        candidate !== "/dev/null" &&
        sourceReferenceEscapes(root, filename, candidate)
      ) {
        add(
          violations,
          RULES.ESCAPING_CONFIG,
          root,
          filename,
          `configuration path escapes root: ${candidate}`,
        );
      }
    }
  }
}

function scanLockfile(root, filename, text, violations) {
  if (/@garfex(?:\/|%2f)/i.test(text)) {
    add(
      violations,
      RULES.GARFEX_PACKAGE,
      root,
      filename,
      "@garfex package binding in lockfile",
    );
  }

  const localBindings = new Set(
    text.match(/\b(?:file|link):[^\s"',}\]]+/gi) ?? [],
  );
  for (const binding of localBindings) {
    if (localDependencyEscapes(root, filename, binding)) {
      add(
        violations,
        RULES.MANIFEST_DEPENDENCY,
        root,
        filename,
        `lockfile resolution escapes root: ${binding}`,
      );
    }
  }

  const gitBindings = new Set(
    text.match(
      /(?:git\+(?:https?|ssh):\/\/|git:\/\/|github:|gitlab:|bitbucket:|https?:\/\/|ssh:\/\/)[^\s"',}\]]+/gi,
    ) ?? [],
  );
  for (const binding of gitBindings) {
    if (GIT_VALUE.test(binding) && COUNTERPART.test(binding)) {
      add(
        violations,
        RULES.GIT_DEPENDENCY,
        root,
        filename,
        `counterpart Git binding in lockfile: ${binding}`,
      );
    }
  }
}

function shouldSkip(relative, name, defaultRoot) {
  if (ALWAYS_IGNORED.has(name)) return true;
  if (defaultRoot && relative === "tooling/architecture-fixtures/violations")
    return true;
  return false;
}

export async function checkArchitecture(rootArgument) {
  const root = path.resolve(rootArgument);
  if (root !== REPOSITORY_ROOT && !inside(FIXTURES_ROOT, root)) {
    throw new ConfigurationError(
      `Scan root must be the garfex-platform-ui repository or a controlled architecture fixture: ${root}`,
    );
  }

  let canonicalRoot;
  let canonicalRepositoryRoot;
  let canonicalFixturesRoot;
  try {
    [canonicalRoot, canonicalRepositoryRoot, canonicalFixturesRoot] =
      await Promise.all([
        realpath(root),
        realpath(REPOSITORY_ROOT),
        realpath(FIXTURES_ROOT),
      ]);
    if (!(await lstat(canonicalRoot)).isDirectory())
      throw new Error("not a directory");
  } catch (error) {
    throw new ConfigurationError(
      `Scan root is not a readable directory: ${root} (${error.message})`,
    );
  }

  if (
    canonicalRoot !== canonicalRepositoryRoot &&
    !inside(canonicalFixturesRoot, canonicalRoot)
  ) {
    throw new ConfigurationError(
      `Scan root must be the garfex-platform-ui repository or a controlled architecture fixture: ${root}`,
    );
  }

  const defaultRoot = canonicalRoot === canonicalRepositoryRoot;
  const violations = [];
  const walk = async (directory) => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      throw new ConfigurationError(
        `Cannot read ${relativeName(canonicalRoot, directory)}: ${error.message}`,
      );
    }

    for (const entry of entries) {
      const filename = path.join(directory, entry.name);
      const relative = relativeName(canonicalRoot, filename);
      if (shouldSkip(relative, entry.name, defaultRoot)) continue;

      if (entry.isSymbolicLink()) {
        let target;
        try {
          target = await realpath(filename);
        } catch {
          target = path.resolve(
            path.dirname(filename),
            await readlink(filename),
          );
        }
        if (!inside(canonicalRoot, target)) {
          add(
            violations,
            RULES.ESCAPING_SYMLINK,
            canonicalRoot,
            filename,
            `symlink target escapes root: ${target}`,
          );
        }
        continue;
      }
      if (entry.isDirectory()) {
        await walk(filename);
        continue;
      }
      if (!entry.isFile()) continue;

      const basename = entry.name;
      const extension = path.extname(basename);
      const generalConfig = isGeneralConfig(basename, extension);
      const relevant =
        SOURCE_EXTENSIONS.has(extension) ||
        generalConfig ||
        basename === "package.json" ||
        /^tsconfig(?:\..+)?\.json$/.test(basename) ||
        basename === "pnpm-workspace.yaml" ||
        basename === "pnpm-workspace.yml" ||
        basename === ".gitmodules" ||
        LOCKFILES.has(basename);
      if (!relevant) continue;

      const text = await readFile(filename, "utf8");
      if (SOURCE_EXTENSIONS.has(extension))
        scanSource(canonicalRoot, filename, text, violations);
      if (
        generalConfig &&
        basename !== "package.json" &&
        !/^tsconfig(?:\..+)?\.json$/.test(basename) &&
        basename !== "pnpm-workspace.yaml" &&
        basename !== "pnpm-workspace.yml" &&
        !LOCKFILES.has(basename)
      )
        scanGeneralConfig(canonicalRoot, filename, text, extension, violations);
      if (basename === "package.json")
        scanManifest(canonicalRoot, filename, text, violations);
      if (/^tsconfig(?:\..+)?\.json$/.test(basename))
        scanTsconfig(canonicalRoot, filename, text, violations);
      if (
        basename === "pnpm-workspace.yaml" ||
        basename === "pnpm-workspace.yml"
      )
        scanWorkspace(canonicalRoot, filename, text, violations);
      if (basename === ".gitmodules")
        scanGitmodules(canonicalRoot, filename, text, violations);
      if (LOCKFILES.has(basename))
        scanLockfile(canonicalRoot, filename, text, violations);
    }
  };

  await walk(canonicalRoot);
  return violations.sort(
    (a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule),
  );
}

function parseArguments(argv) {
  if (argv.length === 0) return { root: REPOSITORY_ROOT };
  if (argv.length === 2 && argv[0] === "--root") return { root: argv[1] };
  throw new ConfigurationError(
    "Usage: node tooling/architecture/check.mjs [--root <directory>]",
  );
}

export async function main(argv = process.argv.slice(2)) {
  try {
    const options = parseArguments(argv);
    const violations = await checkArchitecture(options.root);
    if (violations.length === 0) {
      console.log("Architecture check passed.");
      return 0;
    }
    for (const violation of violations) {
      console.error(
        `${violation.rule}: ${violation.file}: ${violation.detail}`,
      );
    }
    console.error(
      `Architecture check failed with ${violations.length} violation(s).`,
    );
    return 1;
  } catch (error) {
    if (error instanceof ConfigurationError) {
      console.error(`configuration-error: ${error.message}`);
      return 2;
    }
    throw error;
  }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  process.exitCode = await main();
}
