import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, symlink, unlink } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  checkArchitecture,
  ConfigurationError,
  RULES,
} from "../architecture/check.mjs";

const execFileAsync = promisify(execFile);
const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../..");
const fixturesRoot = path.join(repositoryRoot, "tooling/architecture-fixtures");
const checker = path.join(repositoryRoot, "tooling/architecture/check.mjs");

const fixtureCases = [
  [RULES.BACKEND_REFERENCE, "forbidden-backend-reference"],
  [RULES.GARFEX_PACKAGE, "forbidden-garfex-package"],
  [RULES.EXTERNAL_SOURCE, "external-source-reference"],
  [RULES.MANIFEST_DEPENDENCY, "backend-manifest-dependency"],
  [RULES.ESCAPING_CONFIG, "escaping-workspace-config"],
  [RULES.GIT_DEPENDENCY, "counterpart-git-dependency"],
  [RULES.HEADLESS_HOST, "headless-host-dependency"],
  [RULES.HEADLESS_HOST, "surface-pi-dependency"],
  [RULES.FRONTEND_FRAMEWORK, "frontend-framework-structure"],
  [RULES.FAKE_EXTERNAL_ARTIFACT, "fake-external-artifact"],
];

test("controlled valid fixture permits ordinary external packages and internal paths", async () => {
  assert.deepEqual(
    await checkArchitecture(path.join(fixturesRoot, "valid")),
    [],
  );
});

for (const [rule, fixture] of fixtureCases) {
  test(`${rule} reports its controlled violation fixture`, async () => {
    const violations = await checkArchitecture(
      path.join(fixturesRoot, "violations", fixture),
    );
    assert.ok(
      violations.some((violation) => violation.rule === rule),
      JSON.stringify(violations, null, 2),
    );
  });
}

test("forbidden-backend-reference covers source syntax and generated binding directories", async () => {
  const root = path.join(
    fixturesRoot,
    "violations",
    "forbidden-backend-reference",
  );
  const violations = await checkArchitecture(root);
  const backendReferences = violations.filter(
    ({ rule }) => rule === RULES.BACKEND_REFERENCE,
  );
  assert.equal(backendReferences.length, 8);
  assert.ok(
    backendReferences.some(({ file }) => file === "generated/backend.ts"),
  );
  assert.ok(
    backendReferences.some(
      ({ file, detail }) =>
        file === "process-paths.ts" && detail.includes("garfex-platform"),
    ),
  );
  assert.ok(
    backendReferences.some(
      ({ file, detail }) =>
        file === "process-paths.ts" &&
        detail.includes("resource-master/internals"),
    ),
  );
});

test("source string literals reject escaping filesystem access without treating product prose as a path", async () => {
  const external = await checkArchitecture(
    path.join(fixturesRoot, "violations", "external-source-reference"),
  );
  assert.equal(
    external.filter(({ rule }) => rule === RULES.EXTERNAL_SOURCE).length,
    2,
  );
  assert.ok(
    external.some(
      ({ file, detail }) =>
        file === "filesystem.ts" && detail.includes("outside-ui-source.json"),
    ),
  );
  assert.deepEqual(
    await checkArchitecture(path.join(fixturesRoot, "valid")),
    [],
  );
});

test("general executable configuration rejects counterpart and escaping paths without scanning prose", async () => {
  const violations = await checkArchitecture(
    path.join(fixturesRoot, "violations", "general-config-coupling"),
  );
  const expectedFiles = [
    ".toolrc",
    "build.yaml",
    "pipeline.yml",
    "runner.conf",
    "runner.jsonc",
    "run.sh",
    "runtime.ini",
    "settings.json",
    "tooling.toml",
  ];

  for (const file of expectedFiles) {
    assert.ok(
      violations.some(
        ({ file: violationFile, rule }) =>
          violationFile === file &&
          (rule === RULES.BACKEND_REFERENCE || rule === RULES.ESCAPING_CONFIG),
      ),
      `${file}: ${JSON.stringify(violations, null, 2)}`,
    );
  }
  assert.ok(violations.some(({ rule }) => rule === RULES.BACKEND_REFERENCE));
  assert.ok(violations.some(({ rule }) => rule === RULES.ESCAPING_CONFIG));
  assert.deepEqual(
    await checkArchitecture(path.join(fixturesRoot, "valid")),
    [],
  );
});

test("package executable and nested configuration strings reject counterpart or escaping source paths", async () => {
  const root = path.join(
    fixturesRoot,
    "violations",
    "backend-manifest-dependency",
  );
  const violations = await checkArchitecture(root);
  const manifestDependencies = violations.filter(
    ({ rule }) => rule === RULES.MANIFEST_DEPENDENCY,
  );
  assert.equal(manifestDependencies.length, 6);
  assert.ok(
    manifestDependencies.some(({ detail }) =>
      detail.startsWith("forbidden manifest configuration: scripts.backend="),
    ),
  );
  assert.ok(
    manifestDependencies.some(({ detail }) =>
      detail.startsWith("forbidden manifest configuration: scripts.external="),
    ),
  );
  assert.ok(
    manifestDependencies.some(({ detail }) =>
      detail.startsWith(
        "forbidden manifest configuration: tooling.resourceMasterConfig=",
      ),
    ),
  );
});

test("escaping-workspace-config covers references, path mappings, extends forms, and workspace paths", async () => {
  const root = path.join(
    fixturesRoot,
    "violations",
    "escaping-workspace-config",
  );
  const violations = await checkArchitecture(root);
  assert.equal(
    violations.filter(({ rule }) => rule === RULES.ESCAPING_CONFIG).length,
    5,
  );
  assert.ok(
    violations.some(({ detail }) =>
      detail.startsWith("extended config escapes root:"),
    ),
  );
});

test("lockfiles reject counterpart Git, @garfex, and escaping file/link bindings", async () => {
  const root = path.join(fixturesRoot, "violations", "lockfile-coupling");
  const violations = await checkArchitecture(root);
  assert.ok(
    violations.some(
      ({ rule, file }) =>
        rule === RULES.GIT_DEPENDENCY && file === "pnpm-lock.yaml",
    ),
  );
  assert.ok(
    violations.some(
      ({ rule, file }) =>
        rule === RULES.MANIFEST_DEPENDENCY && file === "package-lock.json",
    ),
  );
  assert.ok(
    violations.some(
      ({ rule, file }) => rule === RULES.GARFEX_PACKAGE && file === "yarn.lock",
    ),
  );
  assert.ok(
    violations.some(
      ({ rule, file }) =>
        rule === RULES.MANIFEST_DEPENDENCY && file === "yarn.lock",
    ),
  );
});

test("package and Git fixtures cover source/package gates and both counterpart Git forms", async () => {
  const garfexPackage = await checkArchitecture(
    path.join(fixturesRoot, "violations", "forbidden-garfex-package"),
  );
  assert.equal(
    garfexPackage.filter(({ rule }) => rule === RULES.GARFEX_PACKAGE).length,
    2,
  );

  const git = await checkArchitecture(
    path.join(fixturesRoot, "violations", "counterpart-git-dependency"),
  );
  assert.equal(
    git.filter(({ rule }) => rule === RULES.GIT_DEPENDENCY).length,
    2,
  );
});

test("escaping-symlink rejects a temporary link outside the scan root", async () => {
  const root = path.join(fixturesRoot, "violations", ".temporary-symlink");
  const link = path.join(root, "outside");
  await mkdir(root, { recursive: true });
  await symlink(repositoryRoot, link, "dir");
  try {
    const violations = await checkArchitecture(root);
    assert.ok(violations.some(({ rule }) => rule === RULES.ESCAPING_SYMLINK));
  } finally {
    await unlink(link);
  }
});

test("checker accepts only the repository and roots inside its controlled fixture tree", async () => {
  const outsideRoot = path.dirname(repositoryRoot);
  const counterpartRoot = path.resolve(repositoryRoot, "../garfex-platform");

  for (const refusedRoot of [outsideRoot, counterpartRoot]) {
    await assert.rejects(checkArchitecture(refusedRoot), (error) => {
      assert.ok(error instanceof ConfigurationError);
      assert.match(error.message, /must be the garfex-platform-ui repository/);
      return true;
    });
  }

  assert.deepEqual(
    await checkArchitecture(path.join(fixturesRoot, "valid")),
    [],
  );
  assert.ok(
    (
      await checkArchitecture(
        path.join(fixturesRoot, "violations", "forbidden-garfex-package"),
      )
    ).length > 0,
  );
});

test("default repository scan skips controlled violations and normal build outputs", async () => {
  const violations = await checkArchitecture(repositoryRoot);
  assert.deepEqual(violations, []);
});

test("CLI returns a distinct configuration error exit code", async () => {
  const violationRoot = path.join(
    fixturesRoot,
    "violations",
    "forbidden-garfex-package",
  );
  await assert.rejects(
    execFileAsync(process.execPath, [checker, "--root", violationRoot], {
      cwd: repositoryRoot,
    }),
    (error) => {
      assert.equal(error.code, 1);
      return true;
    },
  );

  const missingRoot = path.join(fixturesRoot, "does-not-exist");
  await assert.rejects(
    execFileAsync(process.execPath, [checker, "--root", missingRoot], {
      cwd: repositoryRoot,
    }),
    (error) => {
      assert.equal(error.code, 2);
      assert.match(error.stderr, /configuration-error:/);
      return true;
    },
  );

  for (const refusedRoot of [
    path.dirname(repositoryRoot),
    path.resolve(repositoryRoot, "../garfex-platform"),
  ]) {
    await assert.rejects(
      execFileAsync(process.execPath, [checker, "--root", refusedRoot], {
        cwd: repositoryRoot,
      }),
      (error) => {
        assert.equal(error.code, 2);
        assert.match(error.stderr, /must be the garfex-platform-ui repository/);
        return true;
      },
    );
  }
});
