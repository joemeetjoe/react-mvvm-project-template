import type { Locator, Page } from '@playwright/test';

/** The `/` screen (`src/features/auth/screens/Login`). */
export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;

  readonly passwordInput: Locator;

  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
