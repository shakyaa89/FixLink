import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuthStore } from "../store/authStore";
import { isServiceProviderProfileComplete } from "../utils/serviceProviderProfile";

type Props = {
  children: ReactNode;
};

const UserProtectedRoute = ({ children }: Props) => {
  const { user, checking } = useAuthStore();

  if (checking) return null;

  if (!user && !checking) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.role === "serviceProvider" && !isServiceProviderProfileComplete(user)) {
    return <Navigate to="/serviceprovider/complete-profile" replace />;
  }

  if (user?.role !== "user") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default UserProtectedRoute;
