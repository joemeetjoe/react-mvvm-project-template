import { Outlet } from '@tanstack/react-router';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center">
      <Outlet />
    </div>
  );
};
