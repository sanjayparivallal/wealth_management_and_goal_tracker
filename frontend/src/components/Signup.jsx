import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth";
import { toast } from "react-toastify";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [loading, setLoading] = useState(false);

  // Password rules
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const hasLength = password.length >= 8;

  const isStrongPassword =
    hasUpper && hasLower && hasNumber && hasSpecial && hasLength;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isStrongPassword) {
      toast.warning("Please ensure your password meets all requirements.");
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      const res = await signupUser({ name, email, password });
      if (res) {
        toast.success("Signup successful 🎉 Redirecting to login...");
        setName("");
        setEmail("");
        setPassword("");
        setShowRules(false);
        
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || "Signup failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left Side - Registration Form */}
        <div className="w-full md:w-1/2 p-12">
          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
              <p className="text-gray-600">Start your wealth management journey today</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl
                           focus:outline-none focus:border-blue-500 transition-colors"
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  tabIndex={1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl
                           focus:outline-none focus:border-blue-500 transition-colors"
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  tabIndex={2}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={password}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl
                             focus:outline-none focus:border-blue-500 transition-colors"
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setShowRules(true)}
                    autoComplete="new-password"
                    tabIndex={3}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {showRules && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        hasLength ? "bg-green-500" : "bg-gray-300"
                      }`}>
                        {hasLength && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${hasLength ? "text-gray-700" : "text-gray-500"}`}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        hasUpper ? "bg-green-500" : "bg-gray-300"
                      }`}>
                        {hasUpper && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${hasUpper ? "text-gray-700" : "text-gray-500"}`}>
                        One uppercase letter (A-Z)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        hasLower ? "bg-green-500" : "bg-gray-300"
                      }`}>
                        {hasLower && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${hasLower ? "text-gray-700" : "text-gray-500"}`}>
                        One lowercase letter (a-z)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        hasNumber ? "bg-green-500" : "bg-gray-300"
                      }`}>
                        {hasNumber && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${hasNumber ? "text-gray-700" : "text-gray-500"}`}>
                        One number (0-9)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                        hasSpecial ? "bg-green-500" : "bg-gray-300"
                      }`}>
                        {hasSpecial && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${hasSpecial ? "text-gray-700" : "text-gray-500"}`}>
                        One special character (!@#$%)
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!isStrongPassword || loading}
                tabIndex={4}
                className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all transform
                  ${
                    isStrongPassword && !loading
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white hover:shadow-xl hover:scale-[1.02]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Benefits Section */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-cyan-500 p-12 flex-col justify-center text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4">Join Us Today</h1>
            <p className="text-xl opacity-90">Start managing your wealth smarter</p>
          </div>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Secure & Private</h3>
                <p className="text-sm opacity-80">Your financial data is protected</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Easy to Use</h3>
                <p className="text-sm opacity-80">Simple dashboard for everyone</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-xl mb-1">Track Progress</h3>
                <p className="text-sm opacity-80">See how you're doing anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
