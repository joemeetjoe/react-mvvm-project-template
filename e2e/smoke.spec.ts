import { expect, test } from '@playwright/test';

import { LoginPage } from './pages/LoginPage';
import { NavbarPage } from './pages/NavbarPage';
import { UserDetailPage } from './pages/UserDetailPage';
import { UsersListPage } from './pages/UsersListPage';

test('log in, browse users, edit a user, and log out', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const navbar = new NavbarPage(page);
  const usersListPage = new UsersListPage(page);
  const userDetailPage = new UserDetailPage(page);

  await test.step('log in', async () => {
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'any-password');
    await expect(usersListPage.heading).toBeVisible();
  });

  await test.step('see the users list', async () => {
    await expect(page).toHaveURL(/\/users/);
    await expect(usersListPage.userLink('Ada Lovelace')).toBeVisible();
  });

  await test.step('sort the list', async () => {
    await expect(usersListPage.columnHeader('Name')).toHaveAttribute('aria-sort', 'ascending');

    await usersListPage.sortBy('Name');

    await expect(usersListPage.columnHeader('Name')).toHaveAttribute('aria-sort', 'descending');
  });

  await test.step('page the list', async () => {
    await expect(usersListPage.pageIndicator).toHaveText('Page 1 of 2');

    await usersListPage.goToNextPage();

    await expect(usersListPage.pageIndicator).toHaveText('Page 2 of 2');
    await expect(usersListPage.previousPageButton).toBeEnabled();
  });

  // Captured from whichever row lands first after sorting/paging above, so
  // this journey doesn't depend on where a specific fixture user sorts to.
  let openedUserName = '';

  await test.step('open a user', async () => {
    await usersListPage.previousPageButton.click();

    const firstRowLink = usersListPage.firstDataRowLink();

    openedUserName = (await firstRowLink.innerText()).trim();
    await firstRowLink.click();

    await expect(page).toHaveURL(/\/users\/USR-\d+/);
    await expect(page.getByText(openedUserName, { exact: true })).toBeVisible();
  });

  await test.step('edit and save', async () => {
    await userDetailPage.startEditing();
    await userDetailPage.setFirstName('Updated');
    await userDetailPage.save();

    await expect(page.getByText(/^Updated /)).toBeVisible();
    await expect(userDetailPage.editButton).toBeVisible();
  });

  await test.step('log out', async () => {
    await userDetailPage.backButton.click();
    await expect(usersListPage.heading).toBeVisible();

    await navbar.logout();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(page).toHaveURL('/');
  });
});
