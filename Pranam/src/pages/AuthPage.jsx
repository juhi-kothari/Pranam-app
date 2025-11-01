import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ⬅️ import context
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [info, setInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login } = useAuth(); // ⬅️ from context
  const navigate = useNavigate();

  // Check if redirected from admin panel
  useEffect(() => {
    const redirectTo = localStorage.getItem('redirectAfterLogin');
    if (redirectTo === '/admin') {
      setInfo("Admin access required. Please login with admin credentials.");
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    // Clear messages when user starts typing
    if (error) setError("");
    if (info) setInfo("");
    if (success) setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInfo("");

    if (mode === "signup" && form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.email || !form.password || (mode === "signup" && !form.name)) {
      setError("Please fill in all required fields");
      return;
    }

    console.log('📝 Form validation passed, starting login...');
    console.log('📋 Form data:', { email: form.email, password: form.password ? '***' : 'empty', mode });

    setLoading(true);

    const url =
      mode === "signin"
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`;

    console.log('🌐 API URL:', url);

    try {
      console.log('🔐 Attempting login with:', { email: form.email, mode });

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await response.json();
      console.log('📋 Login response:', { status: response.status, success: data.success, data });
      setLoading(false);

      if (!response.ok) {
        setError(
          data.msg || data.message || data.errors?.[0]?.msg || "Something went wrong"
        );
        return;
      }

      // ✅ Save user in AuthContext
      const userData = data.data?.user || data.user;
      const token = data.data?.token || data.token;

      if (token) {
        console.log('💾 Saving user to AuthContext:', userData);
        login({
          name: userData?.name || form.name,
          email: userData?.email || form.email,
          role: userData?.role || 'user',
          token: token,
        });
      }

      setSuccess(
        mode === "signin"
          ? "Successfully logged in! Redirecting..."
          : "Account created successfully! Redirecting..."
      );

      setTimeout(() => {
        // Check if there's a stored redirect destination
        const redirectTo = localStorage.getItem('redirectAfterLogin');
        console.log('🔄 Redirect destination:', redirectTo);

        if (redirectTo) {
          localStorage.removeItem('redirectAfterLogin');
          console.log('🎯 Redirecting to:', redirectTo);
          navigate(redirectTo);
        } else if (userData?.role === 'admin') {
          console.log('🎯 Admin user - redirecting to admin dashboard');
          navigate('/admin');
        } else {
          console.log('🏠 Redirecting to home');
          navigate('/');
        }
      }, 1000);
    } catch (err) {
      setLoading(false);
      setError("Server error. Please make sure the backend is running on localhost:5000");
      console.error("Error:", err);
    }
  };

  const renderInput = (id, label, type = "text", showToggle = false) => (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} *
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={form[id]}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:outline-none focus:border-yellow-500"
        />
        {showToggle && (
          <button
            type="button"
            onClick={() =>
              id === "password"
                ? setShowPassword(!showPassword)
                : setShowConfirmPassword(!showConfirmPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800 font-medium"
          >
            {id === "password"
              ? showPassword
                ? <EyeOff size={20} />
                : <Eye size={20} />
              : showConfirmPassword
              ? <EyeOff size={20} />
              : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-full flex items-center justify-center bg-white px-12">
        <div className="max-w-md w-full space-y-6">
          <h2 className="text-3xl font-semibold text-gray-800">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {info && (
            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md text-sm">
              {info}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === "signup" && renderInput("name", "Full Name")}
            {renderInput("email", "Email Address", "email")}
            {renderInput(
              "password",
              "Password",
              showPassword ? "text" : "password",
              true
            )}
            {mode === "signup" &&
              renderInput(
                "confirmPassword",
                "Confirm Password",
                showConfirmPassword ? "text" : "password",
                true
              )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#BCC571] text-white px-6 py-3 rounded-md text-sm font-semibold hover:bg-[#a9b45d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-6"
            >
              {loading ? "Please wait..." : mode === "signin" ? "LOGIN" : "SIGN UP"}
            </button>
          </form>

          <button
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setSuccess("");
            }}
            className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
          >
            {mode === "signin"
              ? "CREATE NEW ACCOUNT"
              : "ALREADY HAVE AN ACCOUNT? LOGIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
