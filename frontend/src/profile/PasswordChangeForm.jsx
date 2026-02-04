import { isPasswordStrong } from "../common/PasswordInput";
import { LockIcon, ShieldIcon, CheckIcon } from "../common/Icons";
import { useState } from "react";

export default function PasswordChangeForm({ formData, setFormData, onSubmit, onCancel }) {
    const isNewPasswordStrong = isPasswordStrong(formData.new_password);
    const passwordsMatch = formData.new_password === formData.confirm_password && formData.confirm_password !== "";
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const EyeIcon = ({ show }) => (
        show ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
        )
    );

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {/* Current Password - Floating Label with Show/Hide */}
            <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <LockIcon className="w-5 h-5" />
                </div>
                <input
                    type={showCurrentPassword ? "text" : "password"}
                    id="current_password"
                    value={formData.current_password}
                    onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                    className="peer w-full pl-11 pr-12 pt-5 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-transparent"
                    placeholder="Current Password"
                    required
                />
                <label
                    htmlFor="current_password"
                    className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-500 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs"
                >
                    Current Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <EyeIcon show={showCurrentPassword} />
                </button>
            </div>

            {/* New Password - Floating Label with Show/Hide */}
            <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    formData.new_password && isNewPasswordStrong 
                        ? 'text-green-500' 
                        : formData.new_password && !isNewPasswordStrong 
                            ? 'text-amber-400' 
                            : 'text-gray-400'
                }`}>
                    <ShieldIcon className="w-5 h-5" />
                </div>
                <input
                    type={showNewPassword ? "text" : "password"}
                    id="new_password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    className={`peer w-full pl-11 pr-12 pt-5 pb-2 border rounded-lg focus:outline-none focus:ring-1 transition-all placeholder-transparent ${
                        formData.new_password && !isNewPasswordStrong 
                            ? 'border-amber-300 bg-amber-50 focus:border-amber-500 focus:ring-amber-500' 
                            : formData.new_password && isNewPasswordStrong 
                                ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="New Password"
                    required
                />
                <label
                    htmlFor="new_password"
                    className={`absolute left-11 top-1/2 -translate-y-1/2 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs ${
                        formData.new_password && isNewPasswordStrong 
                            ? 'text-green-600 peer-focus:text-green-600' 
                            : formData.new_password && !isNewPasswordStrong 
                                ? 'text-amber-500 peer-focus:text-amber-500' 
                                : 'text-gray-500 peer-focus:text-blue-500'
                    }`}
                >
                    New Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <EyeIcon show={showNewPassword} />
                </button>
                {formData.new_password && !isNewPasswordStrong && (
                    <p className="mt-1 text-xs text-amber-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        8+ chars with uppercase, lowercase, number & special char
                    </p>
                )}
                {formData.new_password && isNewPasswordStrong && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Strong password
                    </p>
                )}
            </div>

            {/* Confirm Password - Floating Label with Show/Hide */}
            <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    formData.confirm_password && passwordsMatch 
                        ? 'text-green-500' 
                        : formData.confirm_password && !passwordsMatch 
                            ? 'text-red-400' 
                            : 'text-gray-400'
                }`}>
                    <CheckIcon className="w-5 h-5" />
                </div>
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    className={`peer w-full pl-11 pr-12 pt-5 pb-2 border rounded-lg focus:outline-none focus:ring-1 transition-all placeholder-transparent ${
                        formData.confirm_password && !passwordsMatch 
                            ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500' 
                            : formData.confirm_password && passwordsMatch 
                                ? 'border-green-300 bg-green-50 focus:border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                    placeholder="Confirm New Password"
                    required
                />
                <label
                    htmlFor="confirm_password"
                    className={`absolute left-11 top-1/2 -translate-y-1/2 transition-all duration-200 peer-focus:top-2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs ${
                        formData.confirm_password && passwordsMatch 
                            ? 'text-green-600 peer-focus:text-green-600' 
                            : formData.confirm_password && !passwordsMatch 
                                ? 'text-red-500 peer-focus:text-red-500' 
                                : 'text-gray-500 peer-focus:text-blue-500'
                    }`}
                >
                    Confirm New Password
                </label>
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <EyeIcon show={showConfirmPassword} />
                </button>
                {formData.confirm_password && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Passwords do not match
                    </p>
                )}
                {formData.confirm_password && passwordsMatch && (
                    <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Passwords match
                    </p>
                )}
            </div>

            <div className="flex gap-4 mt-6">
                <button
                    type="submit"
                    disabled={!isNewPasswordStrong || !passwordsMatch}
                    className={`flex-1 py-3 rounded-lg font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                        isNewPasswordStrong && passwordsMatch
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    <ShieldIcon className="w-5 h-5" />
                    Change Password
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition duration-200 shadow-md hover:shadow-lg"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
