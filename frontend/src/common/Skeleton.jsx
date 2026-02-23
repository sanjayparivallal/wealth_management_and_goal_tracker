// Base skeleton pulse animation component
const SkeletonPulse = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Reusable Navbar Skeleton (matches new 7-item layout)
const NavbarSkeleton = () => (
    <div className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
                {/* Logo Skeleton */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse hidden sm:block"></div>
                </div>

                {/* Desktop Nav Items Skeleton - 7 items */}
                <div className="hidden lg:flex items-center space-x-1">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse"></div>
                    ))}
                </div>

                {/* Right Side / Mobile Menu Skeleton */}
                <div className="flex items-center gap-2">
                    <div className="h-8 w-20 bg-gray-200 rounded-lg animate-pulse hidden lg:block"></div>
                    <div className="h-9 w-9 bg-gray-200 rounded-lg animate-pulse lg:hidden"></div>
                </div>
            </div>
        </div>
    </div>
);

// Skeleton for stat cards (used in dashboard and other pages)
export const CardSkeleton = ({ className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse ${className}`}>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-xl w-12 h-12"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-24"></div>
                <div className="h-7 bg-gray-200 rounded w-32"></div>
            </div>
        </div>
    </div>
);

// Skeleton for table rows
export const TableRowSkeleton = ({ columns = 5 }) => (
    <tr className="animate-pulse border-b border-gray-50 last:border-0">
        {[...Array(columns)].map((_, i) => (
            <td key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-100 rounded w-full"></div>
            </td>
        ))}
    </tr>
);

// Skeleton for a full table
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
            <div className="flex gap-4">
                {[...Array(columns)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                ))}
            </div>
        </div>
        {/* Table Body Skeleton */}
        <div className="divide-y divide-gray-50">
            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4 flex gap-4 animate-pulse">
                    {[...Array(columns)].map((_, colIndex) => (
                        <div key={colIndex} className="h-4 bg-gray-100 rounded flex-1"></div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// Dashboard content-only skeleton (no Navbar) — for use inside page shell
export const DashboardContentSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {/* Welcome Section Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-3">
                    <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                    <div className="h-5 bg-gray-100 rounded-lg w-96 max-w-full"></div>
                </div>
                <div className="hidden md:flex items-center gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 w-20 bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-80">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-6 bg-gray-200 rounded w-48"></div>
                        <div className="h-8 bg-gray-100 rounded w-24"></div>
                    </div>
                    <div className="h-56 bg-gray-100 rounded-xl w-full"></div>
                </div>
            ))}
        </div>

        {/* Stats Cards — 3 rows of 4 */}
        {[...Array(3)].map((_, row) => (
            <div key={row} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
        ))}
    </div>
);

// Dashboard Page Skeleton (full page including Navbar)
export const DashboardSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <NavbarSkeleton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Welcome Section Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-3">
                        <div className="h-8 bg-gray-200 rounded-lg w-64"></div>
                        <div className="h-5 bg-gray-100 rounded-lg w-96 max-w-full"></div>
                    </div>
                    <div className="h-10 w-32 bg-gray-200 rounded-xl"></div>
                </div>
            </div>

            {/* Quick Stats Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                            <div className="w-20 h-6 bg-gray-100 rounded-full"></div>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="h-4 bg-gray-100 rounded w-24"></div>
                            <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                        <div className="h-10 bg-gray-50 rounded-xl w-full"></div>
                    </div>
                ))}
            </div>

            {/* Charts Section Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse h-96">
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="h-8 bg-gray-100 rounded w-24"></div>
                        </div>
                        <div className="h-64 bg-gray-100 rounded-xl w-full"></div>
                    </div>
                ))}
            </div>
        </main>
    </div>
);

// Goals content-only skeleton (no Navbar)
export const GoalsContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-11 bg-gray-200 rounded-xl w-40"></div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        {/* Table */}
        <TableSkeleton rows={5} columns={6} />
    </div>
);

// Goals Page Skeleton (full page)
export const GoalsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <NavbarSkeleton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-5 bg-gray-100 rounded w-64 animate-pulse"></div>
                </div>
                <div className="h-11 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Table Skeleton */}
            <TableSkeleton rows={5} columns={6} />
        </main>
    </div>
);

// Investments content-only skeleton (no Navbar)
export const InvestmentsContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="h-8 bg-gray-200 rounded w-56"></div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 h-14"></div>
        {/* Table */}
        <TableSkeleton rows={5} columns={7} />
    </div>
);

// Investments Page Skeleton (full page)
export const InvestmentsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <NavbarSkeleton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-5 bg-gray-100 rounded w-64 animate-pulse"></div>
                </div>
                <div className="h-11 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Table Skeleton */}
            <TableSkeleton rows={5} columns={7} />
        </main>
    </div>
);

// Transactions content-only skeleton (no Navbar)
export const TransactionsContentSkeleton = () => (
    <div className="space-y-6 animate-pulse">
        {/* Header */}
        <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-56"></div>
            <div className="flex gap-3">
                <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
            </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 h-14"></div>
        {/* Table */}
        <TableSkeleton rows={6} columns={6} />
    </div>
);

// Transactions Page Skeleton (full page)
export const TransactionsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <NavbarSkeleton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="space-y-2">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="h-5 bg-gray-100 rounded w-64 animate-pulse"></div>
                </div>
                <div className="h-11 bg-gray-200 rounded-xl w-40 animate-pulse"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Table Skeleton */}
            <TableSkeleton rows={6} columns={6} />
        </main>
    </div>
);

// Profile Page Skeleton
export const ProfileSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <NavbarSkeleton />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Profile Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6 animate-pulse">
                <div className="flex justify-between items-center mb-8">
                    <div className="h-7 bg-gray-200 rounded w-48"></div>
                    <div className="h-5 bg-gray-100 rounded w-24"></div>
                </div>
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-3">
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                            <div className="h-4 bg-gray-100 rounded w-64"></div>
                        </div>
                    </div>
                    <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                    <div className="h-12 bg-gray-50 rounded-xl w-full"></div>
                </div>
            </div>

            {/* Security Card Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-7 bg-gray-200 rounded w-40"></div>
                    <div className="h-11 bg-gray-200 rounded-xl w-36"></div>
                </div>
            </div>
        </main>
    </div>
);

// Recommendations Page Skeleton
export const RecommendationsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <NavbarSkeleton />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-64"></div>
                            <div className="h-4 bg-gray-100 rounded w-48"></div>
                        </div>
                    </div>
                    <div className="hidden md:block space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-24 ml-auto"></div>
                        <div className="h-8 bg-gray-200 rounded w-32 ml-auto"></div>
                    </div>
                </div>
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse h-80">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-5 h-5 bg-gray-200 rounded"></div>
                            <div className="h-6 bg-gray-200 rounded w-48"></div>
                        </div>
                        <div className="h-48 w-48 mx-auto bg-gray-100 rounded-full"></div>
                        <div className="mt-6 space-y-2">
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                            <div className="h-4 bg-gray-50 rounded w-full"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Suggestions Skeleton */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-6">
                    <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-56"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 h-32 border border-gray-100">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </main>
    </div>
);

// Table Content Skeleton (for inside table components)
export const TableContentSkeleton = ({ rows = 5, columns = 5 }) => (
    <div className="animate-pulse space-y-4">
        {/* Header shimmer */}
        <div className="flex gap-4 pb-4 border-b border-gray-100">
            {[...Array(columns)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
        </div>
        {/* Rows shimmer */}
        {[...Array(rows)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4 py-3 border-b border-gray-50 last:border-0">
                {[...Array(columns)].map((_, colIndex) => (
                    <div key={colIndex} className="h-4 bg-gray-100 rounded flex-1"></div>
                ))}
            </div>
        ))}
    </div>
);

export default {
    CardSkeleton,
    TableRowSkeleton,
    TableSkeleton,
    DashboardSkeleton,
    GoalsSkeleton,
    InvestmentsSkeleton,
    TransactionsSkeleton,
    ProfileSkeleton,
    RecommendationsSkeleton,
    TableContentSkeleton
};
