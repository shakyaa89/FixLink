import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { isServiceProviderProfileComplete } from "../utils/serviceProviderProfile";

type Props = {
  children: ReactNode;
};

const UnprotectedRoute = ({ children }: Props) => {
  const { user, checking } = useAuthStore();

  // Wait for auth state before deciding whether to redirect.
  if (checking) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-(--accent)" />
      </div>
    );
  }

  if (user && !checking) {
    // Logged-in providers with incomplete profiles are routed to onboarding.
    if (
      user.role === "serviceProvider" &&
      !isServiceProviderProfileComplete(user)
    ) {
      return <Navigate to="/serviceprovider/complete-profile" replace />;
    }
    // Other logged-in users should not stay on public-only pages.
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default UnprotectedRoute;
