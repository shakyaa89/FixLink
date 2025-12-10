import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";

type Props = {
  children: ReactNode;
};

const UnprotectedRoute = ({ children }: Props) => {
  const { user, checking } = useAuthStore();

  if (checking) return null;

  if (user && !checking) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default UnprotectedRoute;
