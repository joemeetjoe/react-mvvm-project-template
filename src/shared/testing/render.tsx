import type { ReactElement } from 'react';
import { render as rtlRender } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';

export type RenderResult = ReturnType<typeof rtlRender> & {
  user: ReturnType<typeof userEvent.setup>;
};

/**
 * Renders a component on its own, with no providers. Views are pure, so this
 * is all a View test needs — and it keeps `@testing-library/react` imported in
 * exactly one place.
 */
export const render = (ui: ReactElement): RenderResult => ({
  user: userEvent.setup(),
  ...rtlRender(ui),
});
