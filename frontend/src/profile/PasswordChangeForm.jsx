import { isPasswordStrong } from "../common/PasswordInput";
import { ShieldIcon, LockIcon } from "../common/Icons";
import PasswordInput from "../common/PasswordInput";

export default function PasswordChangeForm({ formData, setFormData, onSubmit, onCancel }) {
    const isNewPasswordStrong = isPasswordStrong(formData.new_password);
    const passwordsMatch = formData.new_password === formData.confirm_password && formData.confirm_password !== "";

    return (
        <form onSubmit={onSubmit} className="space-y-6 animate-fadeIn">

            {/* Current Password */}
            <PasswordInput
                label="Current Password"
                value={formData.current_password}
                onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                placeholder="Enter current password"
                showRulesOnFocus={false}
            />

            {/* New Password */}
            <div>
                <PasswordInput
                    label="New Password"
                    value={formData.new_password}
                    onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                    placeholder="Enter new password"
                    showRulesOnFocus={true}
                />
            </div>

            {/* Confirm Password */}
            <div>
                <PasswordInput
                    label="Confirm New Password"
                    value={formData.confirm_password}
                    onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                    placeholder="Confirm new password"
                    showRulesOnFocus={false}
                />

                {/* Match Validation Message */}
                {formData.confirm_password && (
                    <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordsMatch ? (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Passwords match
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Passwords do not match
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-gray-100">
                <button
                    type="submit"
                    disabled={!isNewPasswordStrong || !passwordsMatch}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${isNewPasswordStrong && passwordsMatch
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 hover:shadow-md hover:-translate-y-0.5'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    <ShieldIcon className="w-4 h-4" />
                    Update Password
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 py-2.5 px-4 bg-white border border-gray-200 text-gray-600 rounded-xl font-semibold hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 shadow-sm"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
