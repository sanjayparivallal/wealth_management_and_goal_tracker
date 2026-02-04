import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import ProfileForm from "./ProfileForm";
import PasswordChangeForm from "./PasswordChangeForm";
import { getProfile, updateProfile, changePassword } from "../api/profile";
import { UserIcon, EditIcon, ShieldIcon } from "../common/Icons";
import { ProfileSkeleton } from "../common/Skeleton";

export default function Profile() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [profileData, setProfileData] = useState({
        name: "",
        email: ""
    });

    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: ""
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
            setProfileData({
                name: data.name,
                email: data.email
            });
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileData);
            toast.success("Profile updated successfully");
            setEditing(false);
            fetchProfile();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error("New passwords do not match");
            return;
        }

        try {
            await changePassword({
                current_password: passwordData.current_password,
                new_password: passwordData.new_password
            });
            toast.success("Password changed successfully");
            setShowPasswordModal(false);
            setPasswordData({
                current_password: "",
                new_password: "",
                confirm_password: ""
            });
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return <ProfileSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <UserIcon className="w-8 h-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                </div>

                {/* Profile Details Card */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                        {!editing && (
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setEditing(true)}
                                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                                >
                                    <EditIcon className="w-4 h-4" />
                                    Edit Profile
                                </button>
                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
                                >
                                    <ShieldIcon className="w-4 h-4" />
                                    Change Password
                                </button>
                            </div>
                        )}
                    </div>

                    {editing ? (
                        <ProfileForm
                            formData={profileData}
                            setFormData={setProfileData}
                            onSubmit={handleProfileUpdate}
                            onCancel={() => {
                                setEditing(false);
                                setProfileData({
                                    name: profile.name,
                                    email: profile.email
                                });
                            }}
                        />
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Name</label>
                                <p className="mt-1 text-lg text-gray-900">{profile?.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Email</label>
                                <p className="mt-1 text-lg text-gray-900">{profile?.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">KYC Status</label>
                                <span className={`inline-flex items-center gap-2 mt-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                                    profile?.kyc_status === 'verified' 
                                        ? 'bg-green-100 text-green-700' 
                                        : profile?.kyc_status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                }`}>
                                    {profile?.kyc_status === 'verified' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    {profile?.kyc_status === 'pending' && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    {(profile?.kyc_status === 'not_verified' || profile?.kyc_status === 'unverified') && (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    {profile?.kyc_status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
                        <PasswordChangeForm
                            formData={passwordData}
                            setFormData={setPasswordData}
                            onSubmit={handlePasswordChange}
                            onCancel={() => {
                                setShowPasswordModal(false);
                                setPasswordData({
                                    current_password: "",
                                    new_password: "",
                                    confirm_password: ""
                                });
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
