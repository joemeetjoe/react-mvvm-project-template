import { describe, expect, it } from 'vitest';

import { render, screen } from '@/shared/testing/render';

import { InfoCard } from './InfoCard';
import type { InfoCardProps } from './InfoCard';

const props: InfoCardProps = {
  title: 'Ada Lovelace',
  sections: [
    {
      id: 'personal',
      title: 'Personal Information',
      fields: [
        { id: 'email', label: 'Email', value: 'ada.lovelace@example.com' },
        { id: 'department', label: 'Department', value: 'Engineering' },
      ],
    },
    {
      id: 'metadata',
      title: 'Metadata',
      fields: [{ id: 'id', label: 'User ID', value: 'USR-001' }],
    },
  ],
};

describe('InfoCard', () => {
  it('renders the title', () => {
    render(<InfoCard {...props} />);

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('renders every section title', () => {
    render(<InfoCard {...props} />);

    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Metadata')).toBeInTheDocument();
  });

  it('renders every field label and value', () => {
    render(<InfoCard {...props} />);

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('ada.lovelace@example.com')).toBeInTheDocument();
    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('User ID')).toBeInTheDocument();
    expect(screen.getByText('USR-001')).toBeInTheDocument();
  });

  it('renders no sections when none are given', () => {
    render(<InfoCard title="Empty" sections={[]} />);

    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(screen.queryByText('Personal Information')).not.toBeInTheDocument();
  });
});
