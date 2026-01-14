
import React from 'react';
import { cn } from '@/lib/utils';
import { UserProfile } from '@/lib/types';

interface ScoreReportProps {
    user: {
        name: string;
        photoUrl?: string;
        candidateId?: string; // e.g. PLT000044285
        registrationId?: string; // e.g. 210780539
        dob?: string;
        gender?: string;
        country?: string;
        residence?: string;
    };
    test: {
        date: string;
        centerId: string;
        centerName: string;
        reportCode: string;
        validUntil: string;
    };
    scores: {
        overall: number;
        listening: number;
        reading: number;
        speaking: number;
        writing: number;
    };
}

export const PteScoreReport = ({ user, test, scores }: ScoreReportProps) => {
    return (
        <div className="w-[210mm] min-h-[297mm] bg-white text-[#1e1e1e] font-sans mx-auto p-0 shadow-lg print:shadow-none print:w-full">
            {/* Header */}
            <div className="bg-[#43A095] h-32 relative px-10 flex items-center justify-between print:print-color-adjust-exact">
                <div className="flex items-center gap-4">
                    <div className="bg-white rounded-full p-2 h-14 w-14 flex items-center justify-center">
                        {/* Simple Logo Placeholder */}
                        <span className="text-[#43A095] text-3xl font-bold">P</span>
                    </div>
                    <div className="text-white">
                        <h1 className="text-2xl font-light tracking-wide">
                            <span className="font-bold">Pearson</span> | PTE Academic | Score Report
                        </h1>
                    </div>
                </div>
            </div>

            <div className="px-10 py-2 bg-[#43A095]/80 text-right print:print-color-adjust-exact">
                <span className="text-white text-sm font-medium">Score Report Code: {test.reportCode}</span>
            </div>

            <div className="p-10">
                {/* Candidate Info Header */}
                <div className="flex items-start justify-between mb-12 relative">
                    <div className="flex gap-6">
                        <div className="w-24 h-32 bg-gray-200 overflow-hidden relative border border-gray-300">
                            {user.photoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.photoUrl} alt="Candidate" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">Photo</div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-3xl font-medium text-gray-800 mb-2">{user.name}</h2>
                            <div className="space-y-1 text-sm text-gray-600">
                                <p><span className="font-bold text-gray-800 w-28 inline-block">Test Taker ID:</span> {user.candidateId || 'PLT00000000'}</p>
                                <p><span className="font-bold text-gray-800 w-28 inline-block">Registration ID:</span> {user.registrationId || '000000000'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="flex flex-col items-center">
                        <div className="bg-[#007377] text-white text-xs font-bold py-1 px-4 rounded-t-lg w-32 text-center uppercase print:print-color-adjust-exact">
                            Overall Score
                        </div>
                        <div className="w-32 h-24 bg-[#9E0059] flex items-center justify-center rounded-b-3xl print:print-color-adjust-exact">
                            <span className="text-white text-5xl font-bold">{scores.overall}</span>
                        </div>
                    </div>

                    {/* Side Vertical Text */}
                    <div className="absolute right-[-40px] top-20 rotate-90 origin-top-left text-[10px] text-gray-500 font-mono tracking-widest whitespace-nowrap">
                        Testtaker - {user.name}, {user.registrationId}
                    </div>
                </div>

                {/* Breakdown Circles */}
                <div className="mb-12">
                    <h3 className="text-xl font-bold text-gray-700 mb-6 border-b pb-2">Communicative Skills</h3>
                    <div className="flex justify-center gap-12">
                        {[
                            { label: 'Listening', score: scores.listening, color: 'border-[#1F2F54]' },
                            { label: 'Reading', score: scores.reading, color: 'border-[#C1D129]' },
                            { label: 'Speaking', score: scores.speaking, color: 'border-[#6B6B6B]' },
                            { label: 'Writing', score: scores.writing, color: 'border-[#9E0059]' },
                        ].map(skill => (
                            <div key={skill.label} className="flex flex-col items-center gap-2">
                                <div className={cn("w-20 h-20 rounded-full border-[6px] flex items-center justify-center text-2xl font-bold text-gray-700 bg-white", skill.color)}>
                                    {skill.score}
                                </div>
                                <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{skill.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Skills Breakdown & Personal Details Grid */}
                <div className="grid grid-cols-2 gap-16 mb-12">
                    {/* Left: Bar Chart */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Skills Breakdown</h3>
                        <div className="relative pt-6">
                            {/* Axis Line */}
                            <div className="absolute top-0 bottom-0 right-[40px] w-px bg-gray-300"></div>
                            <span className="absolute top-0 right-[10px] text-xs font-bold text-[#0077C8]">{scores.overall} Overall</span>

                            <div className="space-y-4">
                                {[
                                    { label: 'Listening', score: scores.listening, color: 'bg-[#1F2F54]', valColor: 'text-[#1F2F54]' },
                                    { label: 'Reading', score: scores.reading, color: 'bg-[#C1D129]', valColor: 'text-[#C1D129]' },
                                    { label: 'Speaking', score: scores.speaking, color: 'bg-[#6B6B6B]', valColor: 'text-[#6B6B6B]' },
                                    { label: 'Writing', score: scores.writing, color: 'bg-[#9E0059]', valColor: 'text-[#9E0059]' },
                                ].map(skill => (
                                    <div key={skill.label} className="flex items-center gap-3">
                                        <div className="w-24 text-right text-xs font-semibold text-gray-600">{skill.label}</div>
                                        <div className={cn("text-xs font-bold w-6 text-right", skill.valColor)}>{skill.score}</div>
                                        <div className="flex-1 h-6 bg-gray-100 relative rounded-sm overflow-hidden">
                                            <div
                                                className={cn("h-full print:print-color-adjust-exact", skill.color)}
                                                style={{ width: `${(skill.score / 90) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Candidate Info */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-6 border-b pb-2">Candidate Information</h3>
                        <div className="space-y-3 text-sm">
                            <div className="grid grid-cols-[140px_1fr]">
                                <span className="font-bold text-gray-800">Date of Birth:</span>
                                <span className="text-gray-600">{user.dob || '01 Jan 2000'}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr]">
                                <span className="font-bold text-gray-800">Gender:</span>
                                <span className="text-gray-600">{user.gender || 'Unknown'}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr]">
                                <span className="font-bold text-gray-800">Country of Citizenship:</span>
                                <span className="text-gray-600">{user.country || 'Unknown'}</span>
                            </div>
                            <div className="grid grid-cols-[140px_1fr]">
                                <span className="font-bold text-gray-800">Country of Residence:</span>
                                <span className="text-gray-600">{user.residence || 'Unknown'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-16">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 border-b pb-2">Test Centre Information</h3>
                    <div className="grid grid-cols-2 gap-10 text-sm">
                        <div className="space-y-2">
                            <p><span className="font-bold text-gray-800">Test Centre Country:</span> {user.country || 'Global'}</p>
                            <p><span className="font-bold text-gray-800">Test Centre ID:</span> {test.centerId}</p>
                            <p><span className="font-bold text-gray-800">Test Centre:</span> {test.centerName}</p>
                        </div>
                        <div className="space-y-2">
                            <p><span className="font-bold text-gray-800">Test Date:</span> {test.date}</p>
                            <p><span className="font-bold text-gray-800">Valid Until:</span> {test.validUntil}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="h-4 bg-[#43A095] mt-auto absolute bottom-0 w-full print:print-color-adjust-exact"></div>
        </div>
    );
};
