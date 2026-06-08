import { Outlet } from 'react-router-dom';

// Этот layout просто рендерит дочерние маршруты без дополнительной обертки,
// позволяя им занять всю ширину и высоту экрана.
export const AuthLayout = () => {
  return <Outlet />;
};