import type { ReactElement } from 'react';
import { Link } from '@tanstack/react-router';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

import type { User } from '../../data-layer/entities/user/userSchema';

export type UserListViewProps = {
  users: User[];
};

export const UserListView = ({ users }: UserListViewProps): ReactElement => (
  <section className="space-y-4">
    <h1 className="text-2xl font-semibold tracking-tight">Users</h1>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5}>No users to show.</TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link to="/users/$userId" params={{ userId: user.id }}>
                  {`${user.firstName} ${user.lastName}`}
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.department}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.status}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  </section>
);
