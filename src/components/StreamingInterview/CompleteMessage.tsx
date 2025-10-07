import React from 'react';
import { PartyPopper } from 'lucide-react';

const CompleteMessage: React.FC = () => {
    return (
        <div className="mt-12 p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200 text-center w-full">
            <div className="flex justify-center mb-4">
                <PartyPopper className="w-16 h-16 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-4">Interview Completed!</h3>
            <p className="text-green-700 text-lg mb-4">
                Great job! Your interview has been completed successfully.
            </p>
            <p className="text-gray-600">
                Redirecting to your results page...
            </p>
            <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            </div>
        </div>
    );
};

export default CompleteMessage;
