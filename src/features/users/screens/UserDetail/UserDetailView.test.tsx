import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { UserDetailView } from './UserDetailView';
import type { UserDetailViewProps } from './UserDetailView';

const props: UserDetailViewProps = {
  title: 'Ada Lovelace',
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: [{ id: 'email', label: 'Email', value: 'ada.lovelace@example.com' }],
    },
  ],
  onBack: vi.fn(),
};

describe('UserDetailView', () => {
  it('renders the info card with the given title and sections', () => {
    render(<UserDetailView {...props} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('ada.lovelace@example.com')).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const onBack = vi.fn();
    const { user } = render(<UserDetailView {...props} onBack={onBack} />);

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
