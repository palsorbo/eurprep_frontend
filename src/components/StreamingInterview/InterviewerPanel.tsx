import React from 'react';
import InterviewerAvatar from './InterviewerAvatar';

interface Interviewer {
    id: number;
    name: string;
    gender: string;
}

interface InterviewerPanelProps {
    interviewers: Interviewer[];
    activeInterviewerId: number | null;
    currentQuestion: string;
    isQuestionVisible: boolean;
}

const InterviewerPanel: React.FC<InterviewerPanelProps> = ({
    interviewers,
    activeInterviewerId,
    currentQuestion,
    isQuestionVisible
}) => {
    return (
        <div className="w-full py-6">
            <div className="flex justify-center items-center space-x-8 sm:space-x-12 lg:space-x-16 xl:space-x-20">
                {interviewers.map((interviewer) => {
                    const isActive = activeInterviewerId === interviewer.id;
                    const isSpeaking = Boolean(isActive && isQuestionVisible && currentQuestion);

                    return (
                        <div key={interviewer.id} className="flex-shrink-0">
                            <InterviewerAvatar
                                id={interviewer.id}
                                name={interviewer.name}
                                gender={interviewer.gender as 'male' | 'female'}
                                isActive={isActive}
                                isSpeaking={isSpeaking}
                                questionText={isSpeaking ? currentQuestion : undefined}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default InterviewerPanel;
