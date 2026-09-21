import type { Locator, Page } from '@playwright/test';

/** The `/users` screen (`src/features/users/screens/UserList`). */
export class UsersListPage {
  readonly page: Page;

  readonly heading: Locator;

  readonly pageIndicator: Locator;

  readonly nextPageButton: Locator;

  readonly previousPageButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Users' });
    this.pageIndicator = page.getByText(/Page \d+ of \d+/);
    this.nextPageButton = page.getByRole('button', { name: 'Next' });
    this.previousPageButton = page.getByRole('button', { name: 'Previous' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/users');
  }

  /** The sortable column header button, e.g. "Name" or "Email". */
  columnHeaderButton(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  columnHeader(name: string): Locator {
    return this.page.getByRole('columnheader', { name });
  }

  userLink(name: string): Locator {
    return this.page.getByRole('link', { name });
  }

  /** The name link in the first data row (row 0 is the header row). */
  firstDataRowLink(): Locator {
    return this.page.getByRole('row').nth(1).getByRole('link');
  }

  async sortBy(columnName: string): Promise<void> {
    await this.columnHeaderButton(columnName).click();
  }

  async goToNextPage(): Promise<void> {
    await this.nextPageButton.click();
  }

  async openUser(name: string): Promise<void> {
    await this.userLink(name).click();
  }
}
