import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import ProfileForm from "./ProfileForm";
import PasswordChangeForm from "./PasswordChangeForm";
import { getProfile, updateProfile, changePassword } from "../api/profile";
import { UserIcon, EditIcon, ShieldIcon, CheckIcon } from "../common/Icons";
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
        <div className="min-h-screen bg-gray-50/50 font-sans">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-5">
                        <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
                            <div className="p-3 bg-indigo-50 rounded-xl">
                                <UserIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
                            <p className="text-gray-500 font-medium">Manage your personal information and security</p>
                        </div>
                    </div>

                    {!editing && (
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 transition-all duration-200 shadow-sm"
                            >
                                <ShieldIcon className="w-4 h-4" />
                                Change Password
                            </button>
                            <button
                                onClick={() => setEditing(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                <EditIcon className="w-4 h-4" />
                                Edit Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {editing ? (
                        <div className="p-8">
                            <div className="mb-6 pb-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900">Edit Personal Details</h2>
                                <p className="text-sm text-gray-500 mt-1">Update your name and contact information</p>
                            </div>
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
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {/* Personal Details Section */}
                            <div className="p-8">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                    Personal Details
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent group-hover:border-gray-200 transition-colors">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                {profile?.name.charAt(0).toUpperCase()}
                                            </div>
                                            <p className="text-gray-900 font-medium text-lg">{profile?.name}</p>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent group-hover:border-gray-200 transition-colors">
                                            <p className="text-gray-900 font-medium text-lg truncate">{profile?.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Verification Status Section */}
                            <div className="p-8 bg-gray-50/30">
                                <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-500 rounded-full"></span>
                                    Account Status
                                </h2>
                                <div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">KYC Verification</label>
                                            <div className="flex items-center gap-3">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border ${profile?.kyc_status === 'verified'
                                                        ? 'bg-green-50 text-green-700 border-green-100'
                                                        : profile?.kyc_status === 'pending'
                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                                            : 'bg-red-50 text-red-700 border-red-100'
                                                    }`}>
                                                    {profile?.kyc_status === 'verified' && (
                                                        <CheckIcon className="w-4 h-4" />
                                                    )}
                                                    {profile?.kyc_status === 'pending' && (
                                                        <svg className="w-4 h-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                    {(profile?.kyc_status === 'not_verified' || profile?.kyc_status === 'unverified') && (
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    )}
                                                    {profile?.kyc_status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown'}
                                                </span>
                                                {profile?.kyc_status !== 'verified' && (
                                                    <p className="text-sm text-gray-500">
                                                        Complete identity verification to unlock full features.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl animate-scaleIn">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <ShieldIcon className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                                <p className="text-sm text-gray-500">Ensure your account stays secure</p>
                            </div>
                        </div>
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
