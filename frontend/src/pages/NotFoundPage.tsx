import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-(--secondary) flex flex-col items-center justify-center px-4">
      <div className="bg-(--primary) shadow-lg rounded-2xl p-10 text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-(--text) mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-(--text) mb-2">
          Page Not Found
        </h2>

        <p className="text-(--muted) mb-8">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="px-8 py-3 bg-(--accent) hover:bg-(--accent-hover) text-(--primary) rounded-lg font-semibold transition shadow-lg hover:shadow-xl hover:scale-105"
        >
          Go to Home
        </Link>
      </div>

      <p className="mt-6 text-(--muted) text-sm">
        FixLink © {new Date().getFullYear()}
      </p>
    </div>
  );
}
