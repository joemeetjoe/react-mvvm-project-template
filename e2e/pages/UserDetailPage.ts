import type { Locator, Page } from '@playwright/test';

/** The `/users/$userId` screen (`src/features/users/screens/UserDetail`). */
export class UserDetailPage {
  readonly page: Page;

  readonly backButton: Locator;

  readonly editButton: Locator;

  readonly saveButton: Locator;

  readonly cancelButton: Locator;

  readonly firstNameInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.backButton = page.getByRole('button', { name: /back to users/i });
    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.firstNameInput = page.getByLabel('First Name');
  }

  async startEditing(): Promise<void> {
    await this.editButton.click();
  }

  async setFirstName(value: string): Promise<void> {
    await this.firstNameInput.fill(value);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }
}
