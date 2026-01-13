import { useState } from "react";

function RiskQuestion({ question, options, onAnswer }) {
  const [selectedIndex, setSelectedIndex] = useState(null);

  const handleSelect = (score, index) => {
    setSelectedIndex(index);
    onAnswer(score);
  };

  const optionLabels = ['A', 'B', 'C'];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-blue-500">
      <div className="flex items-start space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 leading-tight">{question}</h3>
      </div>

      <div className="space-y-3">
        {options.map((opt, index) => {
          const isSelected = selectedIndex === index;

          return (
            <button
              key={index}
              onClick={() => handleSelect(opt.score, index)}
              className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all transform
                flex items-center space-x-4 group
                ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-600 shadow-lg scale-[1.02]"
                    : "bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300 hover:shadow-md"
                }
              `}
            >
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                }
              `}>
                {optionLabels[index]}
              </div>
              <span className={`flex-1 font-medium ${
                isSelected ? "text-white" : "text-gray-700"
              }`}>
                {opt.text}
              </span>
              {isSelected && (
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default RiskQuestion;
