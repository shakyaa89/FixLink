import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { isServiceProviderProfileComplete } from "../utils/serviceProviderProfile";

type Props = {
  children: ReactNode;
};

const AdminProtectedRoute = ({ children }: Props) => {
  const { user, checking } = useAuthStore();

  // Wait for auth bootstrap to finish before applying redirects.
  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-(--accent)" />
      </div>
    );
  }

  if (!user && !checking) {
    return <Navigate to="/auth" replace />;
  }

  // Service providers with incomplete profile are forced to onboarding.
  if (
    user?.role === "serviceProvider" &&
    !isServiceProviderProfileComplete(user)
  ) {
    return <Navigate to="/serviceprovider/complete-profile" replace />;
  }

  // Only admins can access this route tree.
  if (user?.role !== "admin") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;
