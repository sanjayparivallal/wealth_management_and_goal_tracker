import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth";
import { toast } from "react-toastify";
import PasswordInput, { isPasswordStrong } from "../common/PasswordInput";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isStrongPassword = isPasswordStrong(password);

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
        <div className="w-full md:w-1/2 p-8">
          <div className="max-w-md mx-auto">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Account</h2>
              <p className="text-gray-600 text-sm">Start your wealth management journey today</p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit} autoComplete="on">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl
                           focus:outline-none focus:border-blue-500 transition-colors"
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  tabIndex={1}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl
                           focus:outline-none focus:border-blue-500 transition-colors"
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  tabIndex={2}
                  required
                />
              </div>

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                placeholder="Create a strong password"
                showRulesOnFocus={true}
              />

              <button
                type="submit"
                disabled={!isStrongPassword || loading}
                tabIndex={4}
                className={`w-full py-2.5 rounded-xl font-semibold shadow-lg transition-all transform
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
