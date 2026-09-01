import { useParams } from '@tanstack/react-router';
import { DetailTemplate } from '@/infrastructure/templates/DetailTemplate';
import { useUsersDetailVM } from '../vm/detailVM';
import { usersDetailConfig } from './detailConfig';
import type { User } from '../model/types';

function buildSections(user: User) {
  return usersDetailConfig.sections.map((section) => ({
    title: section.title,
    fields: section.fields.map((field) => ({
      id: field.key,
      label: field.label,
      value: String((user as any)[field.key] ?? ''),
      editable: field.editable,
    })),
  }));
}

export const UsersDetailPage = () => {
  const { userId } = useParams({ strict: false });
  const vm = useUsersDetailVM(userId);

  if (vm.computed.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading user details...</div>
      </div>
    );
  }

  if (vm.query.error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-semibold text-red-800">Error loading user details</h2>
        <p className="text-sm text-red-600 mt-2">{vm.query.error.message}</p>
      </div>
    );
  }

  const user = vm.query.data;
  const sections = user ? buildSections(user) : [];

  return (
    <DetailTemplate
      title={usersDetailConfig.title}
      sections={sections}
      isEditing={vm.state.isEditing}
      onEdit={vm.actions.edit}
      onSave={vm.actions.save}
      onCancel={vm.actions.cancel}
      onFieldChange={(field, value) => {
        console.log(`Field changed: ${field} = ${value}`);
      }}
    />
  );
};
