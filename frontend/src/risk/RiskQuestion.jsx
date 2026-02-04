export default function RiskQuestion({ question, onAnswer, onPrevious, canGoBack, selectedScore }) {
    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                {question.question}
            </h3>

            <div className="space-y-4">
                {question.options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => onAnswer(question.question_id, option.score)}
                        className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-200 group ${
                            selectedScore === option.score
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-100 hover:border-blue-500 hover:bg-blue-50"
                        }`}
                    >
                        <span className={`font-medium ${
                            selectedScore === option.score
                                ? "text-blue-700"
                                : "text-gray-700 group-hover:text-blue-700"
                        }`}>
                            {option.text}
                        </span>
                    </button>
                ))}
            </div>

            {/* Previous Button */}
            {canGoBack && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={onPrevious}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous Question
                    </button>
                </div>
            )}
        </div>
    );
}
