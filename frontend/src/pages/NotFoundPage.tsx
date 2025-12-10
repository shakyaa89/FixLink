import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-10 text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12" />
          </div>
        </div>

        <h1 className="text-5xl font-bold text-gray-900 mb-4">404</h1>

        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>

        <p className="text-gray-600 mb-8">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        <Link
          to="/"
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition shadow-lg hover:shadow-xl hover:scale-105"
        >
          Go to Home
        </Link>
      </div>

      <p className="mt-6 text-gray-500 text-sm">
        FixLink © {new Date().getFullYear()}
      </p>
    </div>
  );
}
