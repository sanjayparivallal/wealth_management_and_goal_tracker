import { useNavigate, useLocation } from "react-router-dom";
import { logoutUser, getCurrentUser } from "../api/auth";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import {
    DashboardIcon,
    TargetIcon,
    InvestmentIcon,
    TransactionIcon,
    UserIcon,
    LogoutIcon,
    WalletIcon,
    LockIcon,
    TrendingUpIcon,
    ShieldIcon
} from "./Icons";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileCompleted, setProfileCompleted] = useState(true);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const user = await getCurrentUser();
                setProfileCompleted(user?.profile_completed || false);
            } catch (err) {
                // If error, assume not completed
                setProfileCompleted(false);
            }
        };
        checkProfile();
    }, [location.pathname]); // Re-check when route changes

    const handleLogout = () => {
        logoutUser();
        toast.success("Logout successful");
        setTimeout(() => {
            navigate("/login");
        }, 800);
    };

    const handleNavClick = (e, item) => {
        e.preventDefault();
        if (item.requiresProfile && !profileCompleted) {
            toast.warning("Please complete your risk assessment first");
            navigate("/risk-assessment");
            return;
        }
        navigate(item.path);
    };

    const navItems = [
        { name: "Dashboard", path: "/home", icon: DashboardIcon, requiresProfile: false },
        { name: "Goals", path: "/goals", icon: TargetIcon, requiresProfile: true },
        { name: "Investments", path: "/investments", icon: InvestmentIcon, requiresProfile: true },
        { name: "Transactions", path: "/transactions", icon: TransactionIcon, requiresProfile: true },
        { name: "Simulations", path: "/simulations", icon: TrendingUpIcon, requiresProfile: false },
        { name: "Recommendations", path: "/recommendations", icon: ShieldIcon, requiresProfile: true },
        { name: "Profile", path: "/profile", icon: UserIcon, requiresProfile: false }
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <div className="flex items-center">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate("/home");
                            }}
                            className="flex items-center gap-2 text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition"
                        >
                            <WalletIcon className="w-8 h-8" />
                            <span>Wealth Management</span>
                        </a>
                    </div>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isLocked = item.requiresProfile && !profileCompleted;
                            return (
                                <a
                                    key={item.path}
                                    href="#"
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={`flex items-center gap-2 font-medium transition-colors duration-200 ${isLocked
                                        ? "text-gray-400 cursor-not-allowed"
                                        : isActive(item.path)
                                            ? "text-indigo-600 border-b-2 border-indigo-600 pb-1"
                                            : "text-gray-600 hover:text-indigo-600"
                                        }`}
                                    title={isLocked ? "Complete risk assessment to access" : ""}
                                >
                                    {isLocked ? (
                                        <LockIcon className="w-4 h-4" />
                                    ) : (
                                        <IconComponent className="w-5 h-5" />
                                    )}
                                    {item.name}
                                </a>
                            );
                        })}
                    </div>

                    {/* Logout Link */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 shadow-sm"
                    >
                        <LogoutIcon className="w-5 h-5" />
                        Logout
                    </button>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-4">
                    <div className="flex flex-col space-y-2">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isLocked = item.requiresProfile && !profileCompleted;
                            return (
                                <a
                                    key={item.path}
                                    href="#"
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={`flex items-center gap-2 py-2 font-medium transition-colors ${isLocked
                                        ? "text-gray-400 cursor-not-allowed pl-4 bg-gray-50"
                                        : isActive(item.path)
                                            ? "text-indigo-600 border-l-4 border-indigo-600 pl-4 bg-indigo-50"
                                            : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50 pl-4"
                                        }`}
                                >
                                    {isLocked ? (
                                        <LockIcon className="w-4 h-4" />
                                    ) : (
                                        <IconComponent className="w-5 h-5" />
                                    )}
                                    {item.name}
                                </a>
                            );
                        })}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-left w-full text-white py-2 font-medium hover:bg-red-600 pl-4 bg-red-500 rounded-lg transition duration-200 mt-2"
                        >
                            <LogoutIcon className="w-5 h-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
