import { Home, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { SidebarProvider } from '@/shared/ui/sidebar';
import { render, screen, waitFor } from '@/shared/testing/render';

import { AppSidebar, type SidebarNavItem } from './AppSidebar';

const items: SidebarNavItem[] = [
  { title: 'Users', icon: Users, path: '/users' },
  { title: 'Home', icon: Home, path: '/', showFilter: true, filterLabel: 'Only mine' },
];

const renderSidebar = () =>
  render(
    <SidebarProvider>
      <AppSidebar items={items} />
    </SidebarProvider>,
  );

const navButtons = (container: HTMLElement): HTMLElement[] =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-sidebar="menu-button"]'));

describe('AppSidebar', () => {
  it('opens on the first nav item', () => {
    renderSidebar();

    expect(screen.getByText('Users content')).toBeInTheDocument();
  });

  it('switches the content pane when another nav item is chosen', async () => {
    const { user, container } = renderSidebar();

    await user.click(navButtons(container)[1]);

    await waitFor(() => expect(screen.getByText('Home content')).toBeInTheDocument());
  });

  it('shows the filter switch only for items that ask for one', async () => {
    const { user, container } = renderSidebar();

    expect(screen.queryByText('Only mine')).not.toBeInTheDocument();

    await user.click(navButtons(container)[1]);

    const filter = await screen.findByRole('switch');
    expect(screen.getByText('Only mine')).toBeInTheDocument();
    expect(filter).not.toBeChecked();

    await user.click(filter);
    expect(filter).toBeChecked();
  });

  it('keeps what was typed in the search box', async () => {
    const { user } = renderSidebar();

    const search = screen.getByPlaceholderText('Type to search...');
    await user.type(search, 'ada');

    expect(search).toHaveValue('ada');
  });
});
