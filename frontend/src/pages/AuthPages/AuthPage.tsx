import { useState } from "react";

import LoginForm from "../../components/Auth/LoginForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import { User } from "lucide-react";
import ServiceProviderRegisterForm from "../../components/Auth/ServiceProviderRegisterForm";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [serviceProviderRegister, setServiceProviderRegister] = useState(false);

  return (
    <div className="min-h-screen bg-white flex  justify-center p-4 mt-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">FixLink</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Toggle Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
            <button
              onClick={() => {
                setShowLogin(true);
                setServiceProviderRegister(false);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                showLogin
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !showLogin
                  ? "bg-white text-blue-600 shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* LOGIN FORM */}
          {showLogin && <LoginForm />}

          {/* REGISTER FORM */}
          {!showLogin && !serviceProviderRegister && <RegisterForm />}

          {!showLogin && serviceProviderRegister && (
            <ServiceProviderRegisterForm />
          )}
        </div>

        <div className="flex items-center justify-center w-full ">
          <button
            onClick={() => {
              setServiceProviderRegister(!serviceProviderRegister);
              setShowLogin(false);
              window.scrollTo(0, 0);
            }}
            className="text-center text-md text-white mt-6 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Register as a{" "}
            {serviceProviderRegister ? "User" : "Service Provider"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {showLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="text-blue-600 font-semibold"
          >
            {showLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
