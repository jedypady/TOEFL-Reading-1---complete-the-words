import React from 'react';
import { PassageData } from '../types';
import WordInput from './WordInput';

interface PassageDisplayProps {
    passageData: PassageData;
    userAnswers: string[];
    isChecking: boolean;
    onAnswerChange: (index: number, value: string) => void;
}

const PassageDisplay: React.FC<PassageDisplayProps> = ({ passageData, userAnswers, isChecking, onAnswerChange }) => {
    const { passage, words } = passageData;

    // Use a regex to find placeholders (a word followed by at least two underscores).
    // This is more robust than matching the exact 'incomplete' string from the data,
    // ensuring that visual blanks in the passage become interactive.
    const placeholderRegex = /(\b[a-zA-Z'-]+_{2,}\b)/g;
    const passageParts = passage.split(placeholderRegex);

    let wordInputIndex = 0;

    const elements = passageParts.map((part, index) => {
        // The regex captures are at odd indices in the split array.
        if (index % 2 === 1) {
            const wordDetail = words[wordInputIndex];
            
            // Failsafe: If there are more placeholders in the passage than words in the data array,
            // render the placeholder as text to avoid crashing.
            if (!wordDetail) {
                return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
            }

            const currentWordIndex = wordInputIndex;
            wordInputIndex++;

            return (
                <WordInput
                    key={`word-input-${currentWordIndex}`}
                    wordDetail={wordDetail}
                    userAnswer={userAnswers[currentWordIndex]}
                    isChecking={isChecking}
                    onChange={(e) => onAnswerChange(currentWordIndex, e.target.value)}
                />
            );
        }

        // The text segments are at even indices.
        return <React.Fragment key={`text-${index}`}>{part}</React.Fragment>;
    });

    return (
        <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            {elements}
        </p>
    );
};

export default PassageDisplay;
