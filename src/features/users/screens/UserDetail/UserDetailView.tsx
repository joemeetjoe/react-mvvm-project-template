import type { ReactElement } from 'react';

import { InfoCard } from '@/shared/components/InfoCard';
import type { InfoCardSection } from '@/shared/components/InfoCard';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Text } from '@/shared/ui/typography';

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
      <Card>
        <CardContent>
          <form
            className="flex flex-col gap-4 pt-6"
            onSubmit={(event) => {
              event.preventDefault();
              void form.handleSubmit();
            }}
          >
            {editableFields.map(({ name, label }) => (
              <form.Field key={name} name={name}>
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <Label htmlFor={field.name}>{label}</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value as typeof field.state.value)
                      }
                    />
                    {field.state.meta.errors.length > 0 && (
                      <Text variant="destructive">
                        {field.state.meta.errors.map((error) => error?.message).join(', ')}
                      </Text>
                    )}
                  </div>
                )}
              </form.Field>
            ))}

            {saveError && (
              <Alert variant="destructive">
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    ) : (
      <>
        <InfoCard title={title} sections={sections} />
        <Button onClick={onEdit}>Edit</Button>
      </>
    )}
  </section>
);
