
import React, { useState, useEffect, useCallback } from 'react';
import { generatePassage } from './services/geminiService';
import { PassageData } from './types';
import PassageDisplay from './components/PassageDisplay';

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600 dark:text-gray-300">Generating a new academic passage...</p>
    </div>
);

const ErrorDisplay: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
    <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-700 dark:text-red-300 mb-4">An error occurred: {message}</p>
        <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
            Try Again
        </button>
    </div>
);


const App: React.FC = () => {
    const [passageData, setPassageData] = useState<PassageData | null>(null);
    const [userAnswers, setUserAnswers] = useState<string[]>([]);
    const [isChecking, setIsChecking] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPassage = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setIsChecking(false);
        setPassageData(null);
        try {
            const data = await generatePassage();
            setPassageData(data);
            setUserAnswers(new Array(data.words.length).fill(''));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPassage();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    const handleCheckAnswers = () => {
        setIsChecking(true);
    };
    
    const handleNewPassage = () => {
        fetchPassage();
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600 dark:text-indigo-400">TOEFL Word Completion Practice</h1>
                    <p className="mt-2 text-md text-gray-600 dark:text-gray-400">Fill in the missing letters and test your academic vocabulary.</p>
                </header>

                <main className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8">
                    {isLoading && <LoadingSpinner />}
                    {error && !isLoading && <ErrorDisplay message={error} onRetry={fetchPassage} />}
                    {passageData && !isLoading && (
                        <div>
                            <PassageDisplay 
                                passageData={passageData}
                                userAnswers={userAnswers}
                                isChecking={isChecking}
                                onAnswerChange={handleAnswerChange}
                            />
                             <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={handleCheckAnswers}
                                    disabled={isChecking}
                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 disabled:bg-indigo-400 dark:disabled:bg-indigo-800 disabled:cursor-not-allowed transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Check Answers
                                </button>
                                <button
                                    onClick={handleNewPassage}
                                    className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    New Passage
                                </button>
                            </div>
                        </div>
                    )}
                </main>
                 <footer className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                    <p>Powered by Google's Gemini API.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
