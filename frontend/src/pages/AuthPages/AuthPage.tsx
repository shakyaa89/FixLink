import { useState } from "react";

import LoginForm from "../../components/Auth/LoginForm";
import RegisterForm from "../../components/Auth/RegisterForm";
import { User } from "lucide-react";
import ServiceProviderRegisterForm from "../../components/Auth/ServiceProviderRegisterForm";

export default function AuthPage() {
  const [showLogin, setShowLogin] = useState(true);
  const [serviceProviderRegister, setServiceProviderRegister] = useState(false);

  return (
    <div className="min-h-screen bg-(--primary) flex  justify-center p-4 pt-20">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-(--accent) rounded-full mb-4">
            <User className="w-8 h-8 text-(--primary)" />
          </div>
          <h1 className="text-3xl font-bold text-(--text)">FixLink</h1>
        </div>

        <div className="bg-(--primary) rounded-3xl shadow-xl p-8">
          {/* Toggle Tabs */}
          <div className="flex bg-(--secondary) rounded-xl p-1 mb-8">
            <button
              onClick={() => {
                setShowLogin(true);
                setServiceProviderRegister(false);
              }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                showLogin
                  ? "bg-(--primary) text-(--accent) shadow-md"
                  : "text-(--text) hover:text-(--text)"
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setShowLogin(false)}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                !showLogin
                  ? "bg-(--primary) text-(--accent) shadow-md"
                  : "text-(--text) hover:text-(--text)"
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
            className="text-center text-md text-(--primary) mt-6 px-6 py-2 rounded-lg bg-(--accent) hover:bg-(--accent-hover) transition duration-300 ease-in-out"
          >
            Register as a{" "}
            {serviceProviderRegister ? "User" : "Service Provider"}
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-(--text) mt-6">
          {showLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setShowLogin(!showLogin)}
            className="text-(--accent) font-semibold"
          >
            {showLogin ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
