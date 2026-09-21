import { describe, expect, it } from 'vitest';

import { userListSearchSchema } from './userListRoute';

describe('userListSearchSchema', () => {
  it('defaults sort, direction, page, pageSize and filters when nothing is given', () => {
    expect(userListSearchSchema.parse({})).toEqual({
      sort: 'firstName',
      direction: 'asc',
      page: 1,
      pageSize: 10,
      search: '',
      role: '',
      status: '',
      department: '',
    });
  });

  it('accepts valid search params', () => {
    expect(
      userListSearchSchema.parse({ sort: 'email', direction: 'desc', page: 2, pageSize: 20 }),
    ).toEqual({
      sort: 'email',
      direction: 'desc',
      page: 2,
      pageSize: 20,
      search: '',
      role: '',
      status: '',
      department: '',
    });
  });

  it('falls back to the default sort field when it is not sortable', () => {
    expect(userListSearchSchema.parse({ sort: 'notAField' }).sort).toBe('firstName');
  });

  it('falls back to the default direction when it is invalid', () => {
    expect(userListSearchSchema.parse({ direction: 'sideways' }).direction).toBe('asc');
  });

  it('falls back to the default page when it is not a positive integer', () => {
    expect(userListSearchSchema.parse({ page: 0 }).page).toBe(1);
    expect(userListSearchSchema.parse({ page: 'not-a-number' }).page).toBe(1);
  });

  it('falls back to the default page size when it is not one of the allowed sizes', () => {
    expect(userListSearchSchema.parse({ pageSize: 7 }).pageSize).toBe(10);
    expect(userListSearchSchema.parse({ pageSize: 'lots' }).pageSize).toBe(10);
  });

  it('coerces string search params from the URL', () => {
    expect(userListSearchSchema.parse({ page: '3', pageSize: '20' })).toMatchObject({
      page: 3,
      pageSize: 20,
    });
  });

  it('accepts valid filter params', () => {
    expect(
      userListSearchSchema.parse({
        search: 'ada',
        role: 'admin',
        status: 'active',
        department: 'Engineering',
      }),
    ).toMatchObject({
      search: 'ada',
      role: 'admin',
      status: 'active',
      department: 'Engineering',
    });
  });

  it('falls back to no filter when role or status is not one of the known values', () => {
    expect(userListSearchSchema.parse({ role: 'wizard' }).role).toBe('');
    expect(userListSearchSchema.parse({ status: 'napping' }).status).toBe('');
  });
});
