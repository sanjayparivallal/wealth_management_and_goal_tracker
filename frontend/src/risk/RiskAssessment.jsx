import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getRiskQuestions, submitRiskAssessment } from "../api/api";
import { getCurrentUser } from "../api/auth";
import { toast } from "react-toastify";
import Navbar from "../common/Navbar";
import RiskQuestion from "./RiskQuestion";
import { RiskIcon, RefreshIcon } from "../common/Icons";

export default function RiskAssessment() {
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});  // Changed to object for easy lookup
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(null);
    const [showKycQuestion, setShowKycQuestion] = useState(false);
    const [kycStatus, setKycStatus] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [questionsResponse, userData] = await Promise.all([
                getRiskQuestions(),
                getCurrentUser()
            ]);
            // api.js returns the full response data { questions: [] }
            setQuestions(questionsResponse.questions || []);
            setUser(userData);
        } catch (err) {
            toast.error("Failed to load assessment data");
            navigate("/home");
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = async (questionId, score) => {
        // Store answer in object format for easy lookup and update
        const newAnswers = { ...answers, [questionId]: score };
        setAnswers(newAnswers);

        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // Show KYC question before final submission
            setShowKycQuestion(true);
        }
    };

    const handlePrevious = () => {
        if (showKycQuestion) {
            setShowKycQuestion(false);
        } else if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleKycSelect = async (status) => {
        setKycStatus(status);
        // Convert answers object to array format for submission
        const answersArray = Object.entries(answers).map(([questionId, score]) => ({
            questionId: parseInt(questionId),
            score
        }));
        await handleSubmit(answersArray, status);
    };

    const handleSubmit = async (finalAnswers, selectedKycStatus) => {
        setSubmitting(true);
        try {
            // We need user ID. Since backend requires user_id in body, we use the fetched user.id
            if (!user || !user.id) {
                throw new Error("User identification failed");
            }

            // api.js submitRiskAssessment(answers, userId, kycStatus)
            const result = await submitRiskAssessment(finalAnswers, user.id, selectedKycStatus);

            toast.success("Assessment Complete! Your profile has been updated.");

            // Wait a moment before redirecting
            setTimeout(() => {
                navigate("/home");
            }, 2000);

        } catch (err) {
            toast.error(err.message);
            // If failed, maybe reset or allow retry? 
            // For now, let's just stop loading so they can maybe try again or refreshing is needed.
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-600">
                    <RefreshIcon className="w-10 h-10 mx-auto mb-2 animate-spin text-indigo-600" />
                    <span className="text-xl font-semibold">Loading Assessment...</span>
                </div>
            </div>
        );
    }

    // Calculate progress including KYC step
    const totalSteps = questions.length + 1; // +1 for KYC question
    const currentProgress = showKycQuestion ? questions.length : currentStep;
    const progress = (currentProgress / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <RiskIcon className="w-10 h-10 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Risk Profile Assessment</h1>
                    </div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Please answer the following questions to help us understand your investment style and risk tolerance.
                        This will help us personalize your financial goals.
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8 max-w-2xl mx-auto">
                    <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                        <span>
                            {showKycQuestion
                                ? `KYC Verification (Final Step)`
                                : `Question ${currentStep + 1} of ${questions.length}`
                            }
                        </span>
                        <span>{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Question Card */}
                {submitting ? (
                    <div className="text-center py-12">
                        <RefreshIcon className="w-12 h-12 mx-auto mb-4 animate-spin text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-900">Analyzing your profile...</h3>
                    </div>
                ) : showKycQuestion ? (
                    /* KYC Status Question */
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            KYC Verification Status
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Please confirm your KYC (Know Your Customer) verification status.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => handleKycSelect("verified")}
                                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-200 group ${kycStatus === "verified"
                                    ? "border-green-500 bg-green-50"
                                    : "border-gray-100 hover:border-green-500 hover:bg-green-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className={`w-6 h-6 ${kycStatus === "verified" ? "text-green-600" : "text-gray-400 group-hover:text-green-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <span className={`font-medium ${kycStatus === "verified" ? "text-green-700" : "text-gray-700 group-hover:text-green-700"}`}>
                                            Yes, KYC Verified
                                        </span>
                                        <p className="text-sm text-gray-500">My identity documents have been verified</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleKycSelect("unverified")}
                                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all duration-200 group ${kycStatus === "unverified"
                                        ? "border-red-500 bg-red-50"
                                        : "border-gray-100 hover:border-red-500 hover:bg-red-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className={`w-6 h-6 ${kycStatus === "unverified" ? "text-red-600" : "text-gray-400 group-hover:text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <span className={`font-medium ${kycStatus === "unverified" ? "text-red-700" : "text-gray-700 group-hover:text-red-700"}`}>
                                            No, Not Verified
                                        </span>
                                        <p className="text-sm text-gray-500">I haven't completed KYC verification yet</p>
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Previous Button */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <button
                                onClick={handlePrevious}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous Question
                            </button>
                        </div>
                    </div>
                ) : (
                    currentStep < questions.length && (
                        <RiskQuestion
                            question={questions[currentStep]}
                            onAnswer={handleAnswer}
                            onPrevious={handlePrevious}
                            canGoBack={currentStep > 0}
                            selectedScore={answers[questions[currentStep]?.question_id]}
                        />
                    )
                )}
            </main>
        </div>
    );
}
