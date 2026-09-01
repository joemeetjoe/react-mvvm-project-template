export const usersDetailConfig = {
  title: 'User Details',
  sections: [
    {
      title: 'Personal Information',
      fields: [
        { key: 'firstName', label: 'First Name', editable: true },
        { key: 'lastName', label: 'Last Name', editable: true },
        { key: 'email', label: 'Email', editable: true },
      ],
    },
    {
      title: 'Role & Access',
      fields: [
        { key: 'role', label: 'Role', editable: true },
        { key: 'status', label: 'Status', editable: true },
        { key: 'department', label: 'Department', editable: true },
      ],
    },
    {
      title: 'Metadata',
      fields: [
        { key: 'id', label: 'User ID', editable: false },
        { key: 'createdAt', label: 'Created', editable: false },
        { key: 'updatedAt', label: 'Last Updated', editable: false },
      ],
    },
  ],
};
