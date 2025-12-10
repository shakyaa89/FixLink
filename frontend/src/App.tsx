import HomePage from "./pages/HomePage";
import "./index.css";
import "./App.css";
import Footer from "./components/Footer";
import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { Toaster } from "react-hot-toast";
import UnprotectedRoute from "./routes/UnprotectedRoute";
import Navbar from "./components/Navbar/Navbar";
import { Loader2 } from "lucide-react";
import UserNavbar from "./components/Navbar/UserNavbar";
import UserProtectedRoute from "./routes/UserProtectedRoute";
import CreateJobPage from "./pages/UserPages/CreateJobPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserDashboard from "./pages/UserPages/UserDashboard";
import MyJobsPage from "./pages/UserPages/MyJobsPage";

function App() {
  const { user, checkAuth, checking } = useAuthStore();

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
      {!user ? <Navbar /> : <UserNavbar />}
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

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
