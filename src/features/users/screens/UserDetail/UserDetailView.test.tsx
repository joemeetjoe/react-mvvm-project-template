import { beforeEach, describe, expect, it, vi } from 'vitest';

import { render, renderHook, screen, waitFor } from '@/shared/testing/render';

import { UserDetailView } from './UserDetailView';
import type { UserDetailViewProps } from './UserDetailView';
import type { UserEditForm } from './useUserEditForm';
import { useUserEditForm } from './useUserEditForm';

const buildForm = async (): Promise<UserEditForm> => {
  const { result } = renderHook(() =>
    useUserEditForm(
      {
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: 'ada.lovelace@example.com',
        role: 'admin',
        status: 'active',
        department: 'Engineering',
      },
      vi.fn(),
    ),
  );

  await waitFor(() => {
    expect(result.current).not.toBeNull();
  });

  return result.current!;
};

let form: UserEditForm;

const buildProps = (overrides: Partial<UserDetailViewProps> = {}): UserDetailViewProps => ({
  title: 'Ada Lovelace',
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: [{ id: 'email', label: 'Email', value: 'ada.lovelace@example.com' }],
    },
  ],
  isEditing: false,
  isSaving: false,
  saveError: null,
  form,
  onBack: vi.fn(),
  onEdit: vi.fn(),
  onCancel: vi.fn(),
  ...overrides,
});

describe('UserDetailView', () => {
  beforeEach(async () => {
    form = await buildForm();
  });

  it('renders the info card with the given title and sections', () => {
    render(<UserDetailView {...buildProps()} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('ada.lovelace@example.com')).toBeInTheDocument();
  });

  it('calls onBack when the back button is clicked', async () => {
    const onBack = vi.fn();
    const { user } = render(<UserDetailView {...buildProps({ onBack })} />);

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('shows an Edit button and calls onEdit when clicked', async () => {
    const onEdit = vi.fn();
    const { user } = render(<UserDetailView {...buildProps({ onEdit })} />);

    await user.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders form fields from the form prop when editing', () => {
    render(<UserDetailView {...buildProps({ isEditing: true })} />);

    expect(screen.getByLabelText('First Name')).toHaveValue('Ada');
    expect(screen.getByLabelText('Email')).toHaveValue('ada.lovelace@example.com');
    expect(screen.queryByText('Personal Information')).not.toBeInTheDocument();
  });

  it('disables Save and Cancel, and shows saving text, while isSaving is true', () => {
    render(<UserDetailView {...buildProps({ isEditing: true, isSaving: true })} />);

    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('enables Save when not saving', () => {
    render(<UserDetailView {...buildProps({ isEditing: true, isSaving: false })} />);

    expect(screen.getByRole('button', { name: /^save$/i })).toBeEnabled();
  });

  it('shows the save error message when present', () => {
    render(
      <UserDetailView
        {...buildProps({ isEditing: true, saveError: 'Could not save changes.' })}
      />,
    );

    expect(screen.getByText('Could not save changes.')).toBeInTheDocument();
  });

  it('calls onCancel when Cancel is clicked', async () => {
    const onCancel = vi.fn();
    const { user } = render(<UserDetailView {...buildProps({ isEditing: true, onCancel })} />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
