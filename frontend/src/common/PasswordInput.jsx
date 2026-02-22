import { useState } from "react";

export default function PasswordInput({
    value,
    onChange,
    placeholder = "Enter password",
    label = "Password",
    showRulesOnFocus = true,
    required = true,
    autoComplete = "new-password",
    id = "password",
    name = "password"
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showRules, setShowRules] = useState(false);

    // Password rules
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
    const hasLength = value.length >= 8;

    const isStrongPassword = hasUpper && hasLower && hasNumber && hasSpecial && hasLength;

    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    placeholder={placeholder}
                    value={value}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 pr-12"
                    onChange={onChange}
                    onFocus={() => showRulesOnFocus && setShowRules(true)}
                    onBlur={() => setShowRules(false)}
                    autoComplete={autoComplete}
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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

            {/* Password strength indicator */}
            {showRules && showRulesOnFocus && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                        <PasswordRule passed={hasLength} text="8+ characters" />
                        <PasswordRule passed={hasUpper} text="Uppercase (A-Z)" />
                        <PasswordRule passed={hasLower} text="Lowercase (a-z)" />
                        <PasswordRule passed={hasNumber} text="Number (0-9)" />
                        <PasswordRule passed={hasSpecial} text="Special char (!@#$%)" className="col-span-2" />
                    </div>
                </div>
            )}
        </div>
    );
}

function PasswordRule({ passed, text, className = "" }) {
    return (
        <div className={`flex items-center space-x-1.5 ${className}`}>
            <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? "bg-green-500" : "bg-gray-300"
                }`}>
                {passed && (
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            <span className={`text-xs ${passed ? "text-gray-700" : "text-gray-500"}`}>{text}</span>
        </div>
    );
}

// Export helper to check password strength
export function isPasswordStrong(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasLength = password.length >= 8;
    return hasUpper && hasLower && hasNumber && hasSpecial && hasLength;
}
