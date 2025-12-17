import HomePage from "./pages/HomePage";
import "./index.css";
import "./App.css";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPages/AuthPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";
import UnprotectedRoute from "./routes/UnprotectedRoute";
import Navbar from "./components/Navbar/Navbar";
import { Loader2 } from "lucide-react";
import UserProtectedRoute from "./routes/UserProtectedRoute";
import CreateJobPage from "./pages/UserPages/CreateJobPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserDashboard from "./pages/UserPages/UserDashboard";
import MyJobsPage from "./pages/UserPages/MyJobsPage";
import Messages from "./pages/UserPages/Messages";
import ReviewsPage from "./pages/UserPages/ReviewsPage";
import ProfilePage from "./pages/UserPages/ProfilePage";
import DisputesPage from "./pages/UserPages/DisputesPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import ServiceProviderRoute from "./routes/ServiceProviderRoute";
import Dashboard from "./pages/ServiceProviderPages/ServiceProviderDashboard";
import ServiceProviderDashboard from "./pages/ServiceProviderPages/ServiceProviderDashboard";

function App() {
  const { checkAuth, checking } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (checking) {
    return (
      <>
        <div className="h-screen flex items-center justify-center">
          <Loader2 className="animate-spin" size={40} />
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster position="top-center" />
      <Navbar />

      <main className="grow">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route
            path="/auth"
            element={
              <UnprotectedRoute>
                <AuthPage />
              </UnprotectedRoute>
            }
          />

          <Route
            path="/user/create-job"
            element={
              <UserProtectedRoute>
                <CreateJobPage />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/user/dashboard"
            element={
              <UserProtectedRoute>
                <UserDashboard />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/user/jobs"
            element={
              <UserProtectedRoute>
                <MyJobsPage />
              </UserProtectedRoute>
            }
          />

          <Route
            path="/serviceprovider/dashboard"
            element={
              <ServiceProviderRoute>
                <ServiceProviderDashboard />
              </ServiceProviderRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reviews"
            element={
              <ProtectedRoute>
                <ReviewsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/disputes"
            element={
              <ProtectedRoute>
                <DisputesPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
