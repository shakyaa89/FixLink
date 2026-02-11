import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { isServiceProviderProfileComplete } from "../utils/serviceProviderProfile";

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const { user, checking } = useAuthStore();

  if (checking) return null;

  if (!user && !checking) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role === "serviceProvider" && !isServiceProviderProfileComplete(user)) {
    return <Navigate to="/serviceprovider/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
