import React, { useState } from "react";
import { Mail, Lock, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function LoginForm() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const { login } = useAuthStore();

  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginEmail || !loginPassword) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await login(loginEmail, loginPassword);
      if (response?.success == "Login Successful") navigate("/");
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLoginSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-(--text) mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--muted)" />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-12 pr-12 py-3 border-2 border-(--border) rounded-xl focus:border-(--accent)"
            />
            {/* <button className="absolute right-4 top-1/2 -translate-y-1/2">
              <EyeOff className="w-5 h-5 text-(--muted)" />
            </button> */}
          </div>
        </div>

        <hr className="opacity-20" />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-(--accent) text-(--primary) py-3 rounded-xl font-semibold disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              Logging in...
            </span>
          ) : (
            "Log In"
          )}
        </button>
      </form>
    </>
  );
}

export default LoginForm;
