import { describe, expect, it } from 'vitest';

import { renderRoute, screen } from '@/shared/testing/render';

describe('/users', () => {
  it('renders a row for every user the API returns', async () => {
    renderRoute({ initialRoute: '/users' });

    expect(await screen.findByRole('row', { name: /Ada Lovelace/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Grace Hopper/ })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Alan Turing/ })).toBeInTheDocument();
  });
});
