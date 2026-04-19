import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { isServiceProviderProfileComplete } from "../utils/serviceProviderProfile";

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const { user, checking } = useAuthStore();

  // Wait until auth bootstrap completes to avoid wrong redirects.
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

  // Force incomplete provider profiles to finish onboarding first.
  if (
    user?.role === "serviceProvider" &&
    !isServiceProviderProfileComplete(user)
  ) {
    return <Navigate to="/serviceprovider/complete-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
