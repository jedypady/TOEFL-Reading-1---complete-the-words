import React from 'react';
import { WordDetail } from '../types';

interface WordInputProps {
    wordDetail: WordDetail;
    userAnswer: string;
    isChecking: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const WordInput: React.FC<WordInputProps> = ({ wordDetail, userAnswer, isChecking, onChange }) => {
    const { incomplete, complete } = wordDetail;
    const parts = incomplete.split(/_+/);
    const firstHalf = parts[0] || '';
    const secondHalf = parts[1] || '';

    const missingPart = complete.substring(
        firstHalf.length,
        secondHalf ? complete.length - secondHalf.length : complete.length
    );
    const missingLength = missingPart.length;
    
    const isWordCorrect = userAnswer.toLowerCase() === missingPart.toLowerCase();

    if (missingLength <= 0) {
        return <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{firstHalf}{secondHalf}</span>;
    }

    return (
        <span className="inline-flex items-baseline mx-1 whitespace-nowrap gap-2">
            <span className="inline-flex items-center align-baseline">
                <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{firstHalf}</span>
                <div className="relative inline-flex align-baseline focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-gray-800 rounded-sm transition-shadow">
                    {/* Visual Layer */}
                    <div className="flex gap-0.5" aria-hidden="true">
                        {Array.from({ length: missingLength }).map((_, index) => {
                            const charToDisplay = userAnswer[index]; // Always show user's input

                            let charColor = 'text-transparent';
                            let borderColor = 'border-gray-400 dark:border-gray-500';

                            if (isChecking) {
                                if (isWordCorrect) {
                                    borderColor = 'border-green-500';
                                    charColor = 'text-green-600 dark:text-green-500 font-bold';
                                } else { // Word is incorrect
                                    borderColor = 'border-red-500';
                                    charColor = 'text-red-600 dark:text-red-500 font-bold';
                                }
                            } else { // Not checking
                                if (userAnswer[index]) {
                                    charColor = 'text-indigo-600 dark:text-indigo-400 font-bold';
                                }
                            }

                            return (
                                <span
                                    key={index}
                                    className={`flex items-center justify-center text-lg font-mono border-b-2 border-dashed ${borderColor} transition-colors duration-300`}
                                    style={{ width: '1ch', height: '28px' }}
                                >
                                    <span className={`${charColor} transition-colors duration-300`}>
                                        {charToDisplay || '\u00A0'} {/* Non-breaking space for height */}
                                    </span>
                                </span>
                            );
                        })}
                    </div>

                    {/* Functional Input Layer - captures typing */}
                    <input
                        type="text"
                        value={userAnswer}
                        onChange={onChange}
                        maxLength={missingLength}
                        className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-indigo-600 text-lg font-mono p-0 m-0"
                        aria-label={`Complete the word ${firstHalf}...${secondHalf}`}
                        autoCapitalize="none"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                        disabled={isChecking}
                    />
                </div>
                {secondHalf && <span className="text-lg font-bold text-indigo-700 dark:text-indigo-300">{secondHalf}</span>}
            </span>
            {isChecking && !isWordCorrect && (
                 <span className="text-green-600 dark:text-green-500 text-sm font-medium">
                    (Correct answer: {complete})
                </span>
            )}
        </span>
    );
};

export default WordInput;
