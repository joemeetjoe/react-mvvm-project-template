import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { FilterCard } from './FilterCard';
import type { FilterFieldConfig } from './FilterCard';

const fields: FilterFieldConfig[] = [
  { id: 'search', label: 'Search', kind: 'text', placeholder: 'Name or email' },
  {
    id: 'role',
    label: 'Role',
    kind: 'select',
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'user', label: 'User' },
    ],
  },
];

const baseProps = {
  fields,
  values: { search: '', role: '' },
  onValueChange: vi.fn(),
  onSubmit: vi.fn(),
  onClear: vi.fn(),
  hasActiveFilters: false,
};

describe('FilterCard', () => {
  it('renders a labelled input for every field, prefilled from values', () => {
    render(<FilterCard {...baseProps} values={{ search: 'ada', role: 'admin' }} />);

    expect(screen.getByLabelText('Search')).toHaveValue('ada');
    expect(screen.getByLabelText('Role')).toHaveTextContent('Admin');
  });

  it('calls onValueChange when a text field changes', async () => {
    const onValueChange = vi.fn();

    const { user } = render(<FilterCard {...baseProps} onValueChange={onValueChange} />);

    await user.type(screen.getByLabelText('Search'), 'a');

    expect(onValueChange).toHaveBeenCalledWith('search', 'a');
  });

  it('calls onValueChange when a select field changes', async () => {
    const onValueChange = vi.fn();

    const { user } = render(<FilterCard {...baseProps} onValueChange={onValueChange} />);

    await user.click(screen.getByLabelText('Role'));
    await user.click(await screen.findByRole('option', { name: 'User' }));

    expect(onValueChange).toHaveBeenCalledWith('role', 'user');
  });

  it('reports the empty string when the "all" option of a select field is chosen', async () => {
    const onValueChange = vi.fn();

    const { user } = render(
      <FilterCard {...baseProps} values={{ search: '', role: 'admin' }} onValueChange={onValueChange} />,
    );

    await user.click(screen.getByLabelText('Role'));
    await user.click(await screen.findByRole('option', { name: 'All Role' }));

    expect(onValueChange).toHaveBeenCalledWith('role', '');
  });

  it('calls onSubmit when the form is submitted', async () => {
    const onSubmit = vi.fn();

    const { user } = render(<FilterCard {...baseProps} onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: /apply/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onClear when the clear button is clicked', async () => {
    const onClear = vi.fn();

    const { user } = render(
      <FilterCard {...baseProps} hasActiveFilters onClear={onClear} />,
    );

    await user.click(screen.getByRole('button', { name: /clear/i }));

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('disables the clear button when there are no active filters', () => {
    render(<FilterCard {...baseProps} hasActiveFilters={false} />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeDisabled();
  });

  it('enables the clear button when there are active filters', () => {
    render(<FilterCard {...baseProps} hasActiveFilters />);

    expect(screen.getByRole('button', { name: /clear/i })).toBeEnabled();
  });

  it('disables the submit button when isSubmitDisabled is true', () => {
    render(<FilterCard {...baseProps} isSubmitDisabled />);

    expect(screen.getByRole('button', { name: /apply/i })).toBeDisabled();
  });

  it('falls back to an empty value when a field is missing from values', () => {
    render(<FilterCard {...baseProps} values={{}} />);

    expect(screen.getByLabelText('Search')).toHaveValue('');
    expect(screen.getByLabelText('Role')).toHaveTextContent('All Role');
  });

  it('uses a custom allLabel for the "all" option of a select field', () => {
    render(
      <FilterCard
        {...baseProps}
        fields={[
          {
            id: 'role',
            label: 'Role',
            kind: 'select',
            options: [{ value: 'admin', label: 'Admin' }],
            allLabel: 'Any role',
          },
        ]}
        values={{ role: '' }}
      />,
    );

    expect(screen.getByLabelText('Role')).toHaveTextContent('Any role');
  });
});
