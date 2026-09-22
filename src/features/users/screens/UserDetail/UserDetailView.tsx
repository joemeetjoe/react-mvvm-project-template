import type { ReactElement } from 'react';

import { InfoCard } from '@/shared/components/InfoCard';
import type { InfoCardSection } from '@/shared/components/InfoCard';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Text } from '@/shared/ui/typography';

import type { UserEditForm, UserUpdateDraft } from './useUserEditForm';

export type UserDetailViewProps = {
  title: string;
  sections: InfoCardSection[];
  isEditing: boolean;
  isSaving: boolean;
  saveError: string | null;
  form: UserEditForm;
  roleOptions: readonly string[];
  statusOptions: readonly string[];
  onBack: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

type EditableField = {
  name: keyof UserUpdateDraft;
  label: string;
} & ({ kind: 'text' } | { kind: 'select'; options: readonly string[] });

const buildEditableFields = (
  roleOptions: readonly string[],
  statusOptions: readonly string[],
): EditableField[] => [
  { name: 'firstName', label: 'First Name', kind: 'text' },
  { name: 'lastName', label: 'Last Name', kind: 'text' },
  { name: 'email', label: 'Email', kind: 'text' },
  { name: 'role', label: 'Role', kind: 'select', options: roleOptions },
  { name: 'status', label: 'Status', kind: 'select', options: statusOptions },
  { name: 'department', label: 'Department', kind: 'text' },
];

export const UserDetailView = ({
  title,
  sections,
  isEditing,
  isSaving,
  saveError,
  form,
  roleOptions,
  statusOptions,
  onBack,
  onEdit,
  onCancel,
}: UserDetailViewProps): ReactElement => {
  const editableFields = buildEditableFields(roleOptions, statusOptions);

  return (
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
              {editableFields.map((editable) => (
                <form.Field key={editable.name} name={editable.name}>
                  {(field) => (
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={field.name}>{editable.label}</Label>
                      {editable.kind === 'select' ? (
                        <Select
                          value={field.state.value}
                          onValueChange={(value) => field.handleChange(value)}
                        >
                          <SelectTrigger id={field.name} onBlur={field.handleBlur}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {editable.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                        />
                      )}
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
};
