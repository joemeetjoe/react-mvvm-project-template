import type { Locator, Page } from '@playwright/test';

/** The app navbar (`src/app/layouts/AppNavbar.tsx`), present on every protected screen. */
export class NavbarPage {
  readonly page: Page;

  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByRole('button', { name: /log out/i });
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }
}
