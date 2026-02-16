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
    ShieldIcon,
    MenuIcon,
    CloseIcon
} from "./Icons";

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [profileCompleted, setProfileCompleted] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            try {
                const user = await getCurrentUser();
                setProfileCompleted(user?.profile_completed || false);
            } catch (err) {
                setProfileCompleted(false);
            }
        };
        checkProfile();
    }, [location.pathname]);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

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
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-14">
                    {/* Logo/Brand — compact */}
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/home");
                        }}
                        className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition flex-shrink-0"
                    >
                        <WalletIcon className="w-7 h-7" />
                        <span className="hidden sm:inline">WealthTracker</span>
                    </a>

                    {/* Desktop Navigation — compact with smaller gaps */}
                    <div className="hidden lg:flex items-center space-x-1">
                        {navItems.map((item) => {
                            const IconComponent = item.icon;
                            const isLocked = item.requiresProfile && !profileCompleted;
                            const active = isActive(item.path);
                            return (
                                <a
                                    key={item.path}
                                    href="#"
                                    onClick={(e) => handleNavClick(e, item)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isLocked
                                        ? "text-gray-400 cursor-not-allowed"
                                        : active
                                            ? "text-indigo-600 bg-indigo-50"
                                            : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                                        }`}
                                    title={isLocked ? "Complete risk assessment to access" : item.name}
                                >
                                    {isLocked ? (
                                        <LockIcon className="w-4 h-4" />
                                    ) : (
                                        <IconComponent className="w-4 h-4" />
                                    )}
                                    <span className="hidden xl:inline">{item.name}</span>
                                </a>
                            );
                        })}
                    </div>

                    {/* Right side — Logout + Mobile hamburger */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleLogout}
                            className="hidden lg:flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white font-medium py-1.5 px-3 rounded-lg transition duration-200 text-sm"
                        >
                            <LogoutIcon className="w-4 h-4" />
                            Logout
                        </button>

                        {/* Mobile hamburger button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition"
                        >
                            {mobileMenuOpen ? (
                                <CloseIcon className="w-6 h-6" />
                            ) : (
                                <MenuIcon className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation — slide-down menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-100 pb-4 pt-2 animate-slideDown">
                        <div className="flex flex-col space-y-1">
                            {navItems.map((item) => {
                                const IconComponent = item.icon;
                                const isLocked = item.requiresProfile && !profileCompleted;
                                const active = isActive(item.path);
                                return (
                                    <a
                                        key={item.path}
                                        href="#"
                                        onClick={(e) => handleNavClick(e, item)}
                                        className={`flex items-center gap-3 py-2.5 px-4 rounded-lg font-medium transition-colors ${isLocked
                                            ? "text-gray-400 cursor-not-allowed bg-gray-50"
                                            : active
                                                ? "text-indigo-600 bg-indigo-50"
                                                : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                                            }`}
                                    >
                                        {isLocked ? (
                                            <LockIcon className="w-5 h-5" />
                                        ) : (
                                            <IconComponent className="w-5 h-5" />
                                        )}
                                        {item.name}
                                    </a>
                                );
                            })}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full text-left text-white py-2.5 px-4 font-medium bg-red-500 hover:bg-red-600 rounded-lg transition duration-200 mt-2"
                            >
                                <LogoutIcon className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
