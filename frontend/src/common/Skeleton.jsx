// Base skeleton pulse animation component
const SkeletonPulse = ({ className = "" }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

// Skeleton for stat cards (used in dashboard and other pages)
export const CardSkeleton = () => (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
            <div className="flex-1">
                <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
            </div>
        </div>
    </div>
);

// Skeleton for table rows
export const TableRowSkeleton = ({ columns = 5 }) => (
    <tr className="animate-pulse">
        {[...Array(columns)].map((_, i) => (
            <td key={i} className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
            </td>
        ))}
    </tr>
);

// Skeleton for a full table
export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Table Header Skeleton */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
            <div className="flex gap-4">
                {[...Array(columns)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
                ))}
            </div>
        </div>
        {/* Table Body Skeleton */}
        <div className="divide-y divide-gray-100">
            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="px-6 py-4 flex gap-4 animate-pulse">
                    {[...Array(columns)].map((_, colIndex) => (
                        <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

// Dashboard Page Skeleton
export const DashboardSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        {/* Navbar Skeleton */}
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="flex gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Card Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded w-64"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>

            {/* Stats Sections */}
            {[...Array(3)].map((_, sectionIndex) => (
                <div key={sectionIndex} className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <CardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            ))}
        </main>
    </div>
);

// Goals Page Skeleton
export const GoalsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        {/* Navbar Skeleton */}
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="flex gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded w-36 animate-pulse"></div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                {[...Array(4)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Table Skeleton */}
            <TableSkeleton rows={5} columns={6} />
        </main>
    </div>
);

// Investments Page Skeleton
export const InvestmentsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        {/* Navbar Skeleton */}
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="flex gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[...Array(3)].map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>

            {/* Table Skeleton */}
            <TableSkeleton rows={5} columns={7} />
        </main>
    </div>
);

// Transactions Page Skeleton
export const TransactionsSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        {/* Navbar Skeleton */}
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="flex gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded w-40 animate-pulse"></div>
            </div>

            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
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
        {/* Navbar Skeleton */}
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                    <div className="flex gap-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>

            {/* Profile Card Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-pulse">
                <div className="flex justify-between items-center mb-6">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                            <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>

            {/* Security Card Skeleton */}
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-40"></div>
                    <div className="h-10 bg-gray-200 rounded w-36"></div>
                </div>
            </div>
        </main>
    </div>
);

// Table Content Skeleton (for inside table components)
export const TableContentSkeleton = ({ rows = 5, columns = 5, message = "Loading..." }) => (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 animate-pulse">
        <div className="space-y-4">
            {/* Header shimmer */}
            <div className="flex gap-4 pb-4 border-b border-gray-100">
                {[...Array(columns)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded flex-1"></div>
                ))}
            </div>
            {/* Rows shimmer */}
            {[...Array(rows)].map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-4 py-2">
                    {[...Array(columns)].map((_, colIndex) => (
                        <div key={colIndex} className="h-4 bg-gray-200 rounded flex-1"></div>
                    ))}
                </div>
            ))}
        </div>
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
    TableContentSkeleton
};
