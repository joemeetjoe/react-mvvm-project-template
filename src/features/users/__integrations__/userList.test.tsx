import { HttpResponse, delay, http } from 'msw';
import { describe, expect, it } from 'vitest';

import { renderRoute, screen, waitFor, within } from '@/shared/testing/render';
import { server } from '@/shared/testing/server';

import { userFixtures } from '../data-layer/entities/user/userFixtures';

describe('/users', () => {
  it('renders a row for every user the API returns', async () => {
    renderRoute({ initialRoute: '/users' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Grace Hopper/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Alan Turing/ })).toBeInTheDocument();
  });

  it('redirects to login instead of showing the list when the visitor is not signed in', async () => {
    renderRoute({ initialRoute: '/users', session: null });

    expect(await screen.findByText(/enter your credentials/i)).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();
  });

  it('shows the skeleton while the loader is pending', async () => {
    server.use(
      http.get('*/api/users', async () => {
        await delay(100);

        return HttpResponse.json({ users: userFixtures.slice(0, 10), total: userFixtures.length });
      }),
    );

    renderRoute({ initialRoute: '/users' });

    expect(await screen.findByLabelText('Loading users')).toBeInTheDocument();
    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading users')).not.toBeInTheDocument();
  });

  it('shows the route error component when the request fails', async () => {
    server.use(http.get('*/api/users', () => new HttpResponse(null, { status: 500 })));

    renderRoute({ initialRoute: '/users' });

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getAllByText(/status 500/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();
  });

  it('shows the route error component when the payload does not parse', async () => {
    server.use(http.get('*/api/users', () => HttpResponse.json([{ id: 'USR-001' }])));

    renderRoute({ initialRoute: '/users' });

    expect(await screen.findByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getAllByText(/did not match the expected shape/i).length).toBeGreaterThan(0);
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();
  });

  it('opens a user detail page when a row is clicked, and returns to the list on back', async () => {
    const { user } = renderRoute({ initialRoute: '/users' });

    const row = await screen.findByRole('row', { name: /Ada Lovelace/ });

    await user.click(within(row).getByRole('link', { name: /Ada Lovelace/ }));

    expect(await screen.findByText('ada.lovelace@example.com')).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
  });

  it('shows the route error component when the user id is unknown', async () => {
    renderRoute({ initialRoute: '/users/USR-404' });

    expect(await screen.findByRole('heading', { name: /not found/i })).toBeInTheDocument();
  });

  it('shows the skeleton while the detail loader is pending', async () => {
    const [user] = userFixtures;

    server.use(
      http.get('*/api/users/:id', async () => {
        await delay(100);

        return HttpResponse.json(user);
      }),
    );

    renderRoute({ initialRoute: `/users/${user.id}` });

    expect(await screen.findByLabelText('Loading user')).toBeInTheDocument();
    expect(await screen.findByText(user.email)).toBeInTheDocument();
    expect(screen.queryByLabelText('Loading user')).not.toBeInTheDocument();
  });

  it('sorts by clicking a column header and updates the URL', async () => {
    const { user, router } = renderRoute({ initialRoute: '/users' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Name' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ sort: 'firstName', direction: 'desc' });
    });
    expect(await screen.findByRole('row', { name: /Shafi Goldwasser/ })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();
  });

  it('pages through the list by clicking Next and updates the URL', async () => {
    const { user, router } = renderRoute({ initialRoute: '/users' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ page: 2 });
    });
    expect(await screen.findByRole('row', { name: /Katherine Johnson/ })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();
  });

  it('loading a URL with page and sort search params shows that page in that order', async () => {
    renderRoute({ initialRoute: '/users?sort=email&direction=asc&page=2&pageSize=10' });

    expect(await screen.findByRole('row', { name: /Katherine Johnson/ })).toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /Ada Lovelace/ })).not.toBeInTheDocument();
  });

  it('falls back to the defaults when search params are invalid instead of erroring', async () => {
    renderRoute({ initialRoute: '/users?sort=not-a-field&page=-5&pageSize=999' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it('preserves list state across back and forward navigation', async () => {
    const { user, router } = renderRoute({ initialRoute: '/users' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(await screen.findByRole('row', { name: /Katherine Johnson/ })).toBeInTheDocument();

    router.history.back();
    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();

    router.history.forward();
    expect(await screen.findByRole('row', { name: /Katherine Johnson/ })).toBeInTheDocument();
  });

  it('edits a user and shows the saved values immediately', async () => {
    const [firstUser] = userFixtures;
    const { user } = renderRoute({ initialRoute: `/users/${firstUser.id}` });

    expect(await screen.findByText(firstUser.email)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^edit$/i }));

    const firstNameInput = screen.getByLabelText('First Name');

    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Augusta');

    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(`Augusta ${firstUser.lastName}`)).toBeInTheDocument();
    expect(screen.queryByLabelText('First Name')).not.toBeInTheDocument();
  });
});
