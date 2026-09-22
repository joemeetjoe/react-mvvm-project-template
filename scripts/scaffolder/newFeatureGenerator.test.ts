// @vitest-environment node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import nodePlop from 'node-plop';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');

const FEATURE = 'invoices';
const ENTITY = 'invoice';
const FEATURE_DIR = path.join(repoRoot, 'src/features', FEATURE);
const INTEGRATION_TEST = path.join(FEATURE_DIR, '__integrations__/invoiceList.test.tsx');

const REGISTRATION_FILES = [
  'src/app/router/router.tsx',
  'src/app/mocks/handlers.ts',
  'src/shared/testing/server.ts',
  'src/app/layouts/sidebarConfig.ts',
].map((relPath) => path.join(repoRoot, relPath));

const EXPECTED_FILES = [
  'data-layer/entities/invoice/invoiceSchema.ts',
  'data-layer/entities/invoice/invoiceApi.ts',
  'data-layer/entities/invoice/invoiceFixtures.ts',
  'data-layer/entities/invoice/invoiceHandlers.ts',
  'data-layer/entities/invoice/invoiceQueries.ts',
  'screens/InvoiceList/InvoiceListView.tsx',
  'screens/InvoiceList/useInvoiceListViewModel.ts',
  'screens/InvoiceList/index.tsx',
  'screens/InvoiceList/InvoiceListSkeleton.tsx',
  'routes/invoiceListRoute.tsx',
  '__integrations__/invoiceList.test.tsx',
];

type ExecError = Error & { stdout?: Buffer | string; stderr?: Buffer | string };

const runAllowingFailure = (command: string, args: string[]): { failed: boolean; output: string } => {
  try {
    const output = execFileSync(command, args, { cwd: repoRoot, encoding: 'utf8' });

    return { failed: false, output };
  } catch (error) {
    const execError = error as ExecError;
    const output = `${execError.stdout ?? ''}${execError.stderr ?? ''}`;

    return { failed: true, output };
  }
};

describe('new-feature generator', () => {
  const registrationSnapshots = new Map<string, string>();

  beforeAll(() => {
    if (fs.existsSync(FEATURE_DIR)) {
      throw new Error(
        `${FEATURE_DIR} already exists — remove it before running the generator test.`,
      );
    }

    for (const file of REGISTRATION_FILES) {
      registrationSnapshots.set(file, fs.readFileSync(file, 'utf8'));
    }
  });

  afterAll(() => {
    // Guaranteed cleanup: delete the sample feature and restore every
    // registration point to its pre-run contents, so the working tree is
    // clean whether the assertions above passed or failed.
    fs.rmSync(FEATURE_DIR, { recursive: true, force: true });

    for (const [file, content] of registrationSnapshots) {
      fs.writeFileSync(file, content);
    }
  });

  it(
    'generates a feature that lints and typechecks, with an integration test that fails for the right reason',
    async () => {
      const plop = await nodePlop(path.join(repoRoot, 'plopfile.js'));
      const generator = plop.getGenerator('new-feature');

      const { failures } = await generator.runActions({ feature: FEATURE, entity: ENTITY });

      expect(failures).toEqual([]);

      for (const relPath of EXPECTED_FILES) {
        expect(fs.existsSync(path.join(FEATURE_DIR, relPath)), relPath).toBe(true);
      }

      // Registration points were wired up, not just documented.
      const routerContent = fs.readFileSync(path.join(repoRoot, 'src/app/router/router.tsx'), 'utf8');
      expect(routerContent).toContain('createInvoiceListRoute');

      const mockHandlersContent = fs.readFileSync(
        path.join(repoRoot, 'src/app/mocks/handlers.ts'),
        'utf8',
      );
      expect(mockHandlersContent).toContain('invoiceHandlers');

      const testServerContent = fs.readFileSync(
        path.join(repoRoot, 'src/shared/testing/server.ts'),
        'utf8',
      );
      expect(testServerContent).toContain('invoiceHandlers');

      // Lint: the full rule set, including boundaries and the View
      // no-external-dependencies rule.
      const eslint = new ESLint({ cwd: repoRoot });
      const lintResults = await eslint.lintFiles([`${FEATURE_DIR}/**/*.{ts,tsx}`]);
      const lintErrors = lintResults.flatMap((result) =>
        result.messages.filter((message) => message.severity === 2),
      );
      expect(lintErrors, JSON.stringify(lintErrors, null, 2)).toEqual([]);

      // Typecheck: the generated files must compile as part of the real project.
      const typecheck = runAllowingFailure('npx', ['tsc', '-b', '--force']);
      expect(typecheck.failed, typecheck.output).toBe(false);

      // The generated integration test must fail for the right reason: the
      // placeholder screen doesn't render the fetched invoices yet, not a
      // compile, lint, or import error.
      const integrationTest = runAllowingFailure('npx', ['vitest', 'run', INTEGRATION_TEST]);

      expect(integrationTest.failed, integrationTest.output).toBe(true);
      expect(integrationTest.output).toContain(
        'Unable to find an element with the text: /First Invoice/',
      );
      expect(integrationTest.output).not.toMatch(/SyntaxError|Cannot find module|TypeError:/);
    },
    180_000,
  );
});
