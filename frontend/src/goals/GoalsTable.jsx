import { 
    HomeIcon, 
    ShieldIcon, 
    StarIcon, 
    GiftIcon, 
    TargetIcon,
    EditIcon,
    TrashIcon
} from "../common/Icons";
import { TableContentSkeleton } from "../common/Skeleton";

export default function GoalsTable({ goals, onEdit, onDelete, loading }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return <TableContentSkeleton rows={4} columns={6} />;
    }

    if (goals.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <div className="text-center text-gray-600">
                    <TargetIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No goals yet. Create your first financial goal!</p>
                </div>
            </div>
        );
    }

    const getGoalTypeIcon = (type) => {
        const iconClass = "w-6 h-6";
        switch (type) {
            case "retirement":
                return <GiftIcon className={`${iconClass} text-orange-500`} />;
            case "education":
                return <StarIcon className={`${iconClass} text-purple-500`} />;
            case "home":
                return <HomeIcon className={`${iconClass} text-blue-500`} />;
            case "emergency":
                return <ShieldIcon className={`${iconClass} text-red-500`} />;
            case "vacation":
                return <GiftIcon className={`${iconClass} text-green-500`} />;
            default:
                return <TargetIcon className={`${iconClass} text-gray-500`} />;
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700">
                        <tr className="divide-x divide-blue-500/30">
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                Goal Type
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                Target Amount
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                Target Date
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                Monthly Contribution
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {goals.map((goal, index) => (
                            <tr key={goal.id} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} hover:bg-blue-50 transition-all duration-200 divide-x divide-gray-100`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            {getGoalTypeIcon(goal.goal_type)}
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900 capitalize">
                                            {goal.goal_type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900 font-bold bg-green-50 px-3 py-1 rounded-lg">
                                        {formatCurrency(goal.target_amount)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">
                                            {new Date(goal.target_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-900 font-medium">
                                        {formatCurrency(goal.monthly_contribution)}
                                        <span className="text-xs text-gray-500 ml-1">/mo</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2 ${
                                        goal.status === "active"
                                            ? "border-green-400 text-green-700"
                                            : goal.status === "completed"
                                                ? "border-blue-400 text-blue-700"
                                                : "border-yellow-400 text-yellow-700"
                                    }`}>
                                        <span className={`relative flex h-2.5 w-2.5`}>
                                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                                goal.status === "active" ? "bg-green-400" 
                                                : goal.status === "completed" ? "bg-blue-400" 
                                                : "bg-yellow-400"
                                            }`}></span>
                                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                                                goal.status === "active" ? "bg-green-500" 
                                                : goal.status === "completed" ? "bg-blue-500" 
                                                : "bg-yellow-500"
                                            }`}></span>
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-wide">{goal.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onEdit(goal)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold text-xs"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => onDelete(goal.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-xs"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>






    );
}
