// The subset of Vite's `import.meta.env` the app reads. Taking it as a
// parameter keeps every caller testable without stubbing globals.
export type AppEnv = {
  DEV: boolean;
  VITE_API_MOCK?: string;
};

/** True only in a dev build that has explicitly opted into the MSW worker. */
export const isApiMocked = (env: AppEnv = import.meta.env): boolean =>
  env.DEV && env.VITE_API_MOCK === 'true';
