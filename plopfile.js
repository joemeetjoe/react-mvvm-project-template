import fs from 'node:fs';

// -----------------------------------------------------------------------
// Tiny case helpers (no dependency beyond plop itself — see CONTRIBUTING).
// -----------------------------------------------------------------------

/** Splits "InvoiceItems", "invoice-items", "invoice_items" into ['invoice', 'items']. */
const splitWords = (input) =>
  String(input)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase());

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const pascalCase = (input) => splitWords(input).map(capitalize).join('');

const camelCase = (input) => {
  const pascal = pascalCase(input);

  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

const kebabCase = (input) => splitWords(input).join('-');

const constantCase = (input) => splitWords(input).join('_').toUpperCase();

const titleCase = (input) => splitWords(input).map(capitalize).join(' ');

// -----------------------------------------------------------------------
// Registration-point paths and their stable anchor comments.
// -----------------------------------------------------------------------

const ROUTER_PATH = 'src/app/router/router.tsx';
const ROUTER_IMPORT_ANCHOR = '// plop:route-import';
const ROUTER_REGISTER_ANCHOR = '// Add new feature routes here';

const MOCK_HANDLERS_PATH = 'src/app/mocks/handlers.ts';
const TEST_HANDLERS_PATH = 'src/shared/testing/server.ts';
const HANDLER_IMPORT_ANCHOR = '// plop:handler-import';

const SIDEBAR_PATH = 'src/app/layouts/sidebarConfig.ts';
const SIDEBAR_ICON_ANCHOR = '// plop:sidebar-icon-import';
const SIDEBAR_ITEM_ANCHOR = '// Add new feature nav items here';
const SIDEBAR_ICON_NAME = 'List';

/**
 * Wires the generated route factory into `app/router/router.tsx`: one import
 * line above the import anchor, one `createXListRoute(protectedLayoutRoute)`
 * call above the registration anchor. Idempotent — reruns for the same
 * entity are a no-op instead of a duplicate import.
 */
const insertRouteRegistration = (answers) => {
  const { entityPascal, entityCamel, featureKebab } = answers;
  const routeFactory = `create${entityPascal}ListRoute`;
  const importLine = `import { ${routeFactory} } from '@/features/${featureKebab}/routes/${entityCamel}ListRoute';`;

  let content = fs.readFileSync(ROUTER_PATH, 'utf8');

  if (content.includes(importLine)) {
    return `skipped ${ROUTER_PATH} (already imports ${routeFactory})`;
  }

  if (!content.includes(ROUTER_IMPORT_ANCHOR) || !content.includes(ROUTER_REGISTER_ANCHOR)) {
    throw new Error(`${ROUTER_PATH} is missing its plop anchor comments`);
  }

  content = content.replace(ROUTER_IMPORT_ANCHOR, `${importLine}\n${ROUTER_IMPORT_ANCHOR}`);
  content = content.replace(
    ROUTER_REGISTER_ANCHOR,
    `${routeFactory}(protectedLayoutRoute),\n      ${ROUTER_REGISTER_ANCHOR}`,
  );

  fs.writeFileSync(ROUTER_PATH, content);

  return `updated ${ROUTER_PATH}`;
};

/**
 * Aggregates the generated entity's MSW handlers into the given file (the
 * dev-worker's `handlers.ts` or the test `server.ts`) — same shape, both call
 * sites. Idempotent per entity.
 */
const insertHandlerRegistration = (filePath) => (answers) => {
  const { entityCamel, featureKebab } = answers;
  const handlersName = `${entityCamel}Handlers`;
  const importLine = `import { ${handlersName} } from '@/features/${featureKebab}/data-layer/entities/${entityCamel}/${entityCamel}Handlers';`;

  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(importLine)) {
    return `skipped ${filePath} (already imports ${handlersName})`;
  }

  if (!content.includes(HANDLER_IMPORT_ANCHOR)) {
    throw new Error(`${filePath} is missing the "${HANDLER_IMPORT_ANCHOR}" anchor comment`);
  }

  const arrayPattern = /export const handlers = \[/;

  if (!arrayPattern.test(content)) {
    throw new Error(`${filePath} is missing "export const handlers = [...]"`);
  }

  content = content.replace(HANDLER_IMPORT_ANCHOR, `${importLine}\n${HANDLER_IMPORT_ANCHOR}`);
  content = content.replace(arrayPattern, `export const handlers = [...${handlersName}, `);

  fs.writeFileSync(filePath, content);

  return `updated ${filePath}`;
};

/**
 * Adds an optional nav entry to the sidebar. Reuses a single generic icon
 * import across every generated feature so two generator runs never declare
 * the same local binding twice.
 */
const insertSidebarNavItem = (answers) => {
  const { titleCasePlural, pluralKebab } = answers;

  let content = fs.readFileSync(SIDEBAR_PATH, 'utf8');

  if (!content.includes(SIDEBAR_ICON_ANCHOR) || !content.includes(SIDEBAR_ITEM_ANCHOR)) {
    throw new Error(`${SIDEBAR_PATH} is missing its plop anchor comments`);
  }

  const iconImportLine = `import { ${SIDEBAR_ICON_NAME} } from 'lucide-react';`;

  if (!content.includes(iconImportLine)) {
    content = content.replace(SIDEBAR_ICON_ANCHOR, `${iconImportLine}\n${SIDEBAR_ICON_ANCHOR}`);
  }

  const navItem =
    `{\n    title: '${titleCasePlural}',\n    icon: ${SIDEBAR_ICON_NAME},\n` +
    `    path: '/${pluralKebab}',\n  },\n  ${SIDEBAR_ITEM_ANCHOR}`;

  content = content.replace(SIDEBAR_ITEM_ANCHOR, navItem);

  fs.writeFileSync(SIDEBAR_PATH, content);

  return `updated ${SIDEBAR_PATH}`;
};

/** @param {import('node-plop').NodePlopAPI} plop */
export default function (plop) {
  plop.setGenerator('new-feature', {
    description:
      'Scaffold a feature: data-layer, a read-only list screen, a route, and a failing integration test',
    prompts: [
      {
        type: 'input',
        name: 'feature',
        message: 'Feature name (plural, e.g. "invoices"):',
        validate: (input) => (input && input.trim().length > 0) || 'Feature name is required',
      },
      {
        type: 'input',
        name: 'entity',
        message: 'Entity name (singular, e.g. "invoice"):',
        validate: (input) => (input && input.trim().length > 0) || 'Entity name is required',
      },
    ],
    actions: (answers) => {
      const featureRaw = answers.feature;
      const entityRaw = answers.entity;

      const featureKebab = kebabCase(featureRaw);
      const pluralCamel = camelCase(featureRaw);
      const pluralKebab = featureKebab;
      const titleCasePlural = titleCase(featureRaw);
      const entityCamel = camelCase(entityRaw);
      const entityPascal = pascalCase(entityRaw);
      const entityConstant = constantCase(entityRaw);

      // Mutate the shared answers object so both file templates and the
      // custom registration actions below see the same derived names.
      Object.assign(answers, {
        featureKebab,
        pluralCamel,
        pluralKebab,
        titleCasePlural,
        entityCamel,
        entityPascal,
        entityConstant,
      });

      const featureDir = `src/features/${featureKebab}`;
      const entityDir = `${featureDir}/data-layer/entities/${entityCamel}`;
      const screenDir = `${featureDir}/screens/${entityPascal}List`;

      return [
        {
          type: 'add',
          path: `${entityDir}/${entityCamel}Schema.ts`,
          templateFile: 'plop-templates/new-feature/entitySchema.ts.hbs',
        },
        {
          type: 'add',
          path: `${entityDir}/${entityCamel}Api.ts`,
          templateFile: 'plop-templates/new-feature/entityApi.ts.hbs',
        },
        {
          type: 'add',
          path: `${entityDir}/${entityCamel}Fixtures.ts`,
          templateFile: 'plop-templates/new-feature/entityFixtures.ts.hbs',
        },
        {
          type: 'add',
          path: `${entityDir}/${entityCamel}Handlers.ts`,
          templateFile: 'plop-templates/new-feature/entityHandlers.ts.hbs',
        },
        {
          type: 'add',
          path: `${entityDir}/${entityCamel}Queries.ts`,
          templateFile: 'plop-templates/new-feature/entityQueries.ts.hbs',
        },
        {
          type: 'add',
          path: `${screenDir}/${entityPascal}ListView.tsx`,
          templateFile: 'plop-templates/new-feature/listView.tsx.hbs',
        },
        {
          type: 'add',
          path: `${screenDir}/use${entityPascal}ListViewModel.ts`,
          templateFile: 'plop-templates/new-feature/listViewModel.ts.hbs',
        },
        {
          type: 'add',
          path: `${screenDir}/index.tsx`,
          templateFile: 'plop-templates/new-feature/screenIndex.tsx.hbs',
        },
        {
          type: 'add',
          path: `${screenDir}/${entityPascal}ListSkeleton.tsx`,
          templateFile: 'plop-templates/new-feature/listSkeleton.tsx.hbs',
        },
        {
          type: 'add',
          path: `${featureDir}/routes/${entityCamel}ListRoute.tsx`,
          templateFile: 'plop-templates/new-feature/listRoute.tsx.hbs',
        },
        {
          type: 'add',
          path: `${featureDir}/__integrations__/${entityCamel}List.test.tsx`,
          templateFile: 'plop-templates/new-feature/integrationTest.test.tsx.hbs',
        },
        { type: 'insert-route-registration' },
        { type: 'insert-mock-handler' },
        { type: 'insert-test-handler' },
        { type: 'insert-sidebar-nav-item' },
      ];
    },
  });

  plop.setActionType('insert-route-registration', (answers) => insertRouteRegistration(answers));
  plop.setActionType('insert-mock-handler', (answers) =>
    insertHandlerRegistration(MOCK_HANDLERS_PATH)(answers),
  );
  plop.setActionType('insert-test-handler', (answers) =>
    insertHandlerRegistration(TEST_HANDLERS_PATH)(answers),
  );
  plop.setActionType('insert-sidebar-nav-item', (answers) => insertSidebarNavItem(answers));
}
