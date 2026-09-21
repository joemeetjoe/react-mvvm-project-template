import type { ReactElement } from 'react';

import { InfoCard } from '@/shared/components/InfoCard';
import type { InfoCardSection } from '@/shared/components/InfoCard';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

import type { UserEditForm } from './useUserEditForm';

export type UserDetailViewProps = {
  title: string;
  sections: InfoCardSection[];
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  form: UserEditForm;
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

const editableFields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'email', label: 'Email' },
  { name: 'role', label: 'Role' },
  { name: 'status', label: 'Status' },
  { name: 'department', label: 'Department' },
] as const;

export const UserDetailView = ({
  title,
  sections,
  isEditing,
  isSaving,
  saveError,
  form,
  onBack,
  onEdit,
  onCancel,
}: UserDetailViewProps): ReactElement => (
  <section className="space-y-4">
    <Button variant="ghost" onClick={onBack}>
      ← Back to users
    </Button>

    {isEditing ? (
      <form
        className="space-y-4 rounded-lg border p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        {editableFields.map(({ name, label }) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <div className="space-y-1">
                <Label htmlFor={field.name}>{label}</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value as typeof field.state.value)}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.map((error) => error?.message).join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        ))}

        {saveError && <p className="text-sm text-destructive">{saveError}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        </div>
      </form>
    ) : (
      <>
        <InfoCard title={title} sections={sections} />
        <Button onClick={onEdit}>Edit</Button>
      </>
    )}
  </section>
);
