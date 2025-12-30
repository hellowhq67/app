'use client';

import React, { useState, useEffect } from 'react';
import { PTESession, PTEProgress } from '@/types/pte-types';
import { PTE_SECTIONS, PTE_SECTION_TIMING, PTE_BREAK_DURATION } from '@/constants/pte-constants';
import { PTE_SAMPLE_QUESTIONS, PTE_SECTION_BREAKDOWN } from '@/mock-data/pte-sample-questions';
import PTEQuestion from '@/components/pte/question/PTEQuestion';

const PTEMockTest: React.FC = () => {
  const [session, setSession] = useState<PTESession>({
    id: 'session-123',
    userId: 'user-456',
    startTime: Date.now(),
    currentSection: PTE_SECTIONS.SPEAKING_WRITING,
    currentQuestion: 0,
    responses: [],
    timeRemaining: {
      [PTE_SECTIONS.SPEAKING_WRITING]: PTE_SECTION_TIMING[PTE_SECTIONS.SPEAKING_WRITING].duration,
      [PTE_SECTIONS.READING]: PTE_SECTION_TIMING[PTE_SECTIONS.READING].duration,
      [PTE_SECTIONS.LISTENING]: PTE_SECTION_TIMING[PTE_SECTIONS.LISTENING].duration
    },
    isCompleted: false,
    systemCheck: {
      microphone: false,
      speakers: false,
      camera: false,
      browserCompatible: true,
      networkStable: true
    }
  });

  const [currentQuestion, setCurrentQuestion] = useState<PTEQuestion | null>(null);
  const [showBreak, setShowBreak] = useState(false);
  const [testPhase, setTestPhase] = useState<'system-check' | 'instructions' | 'test' | 'break' | 'results'>('system-check');

  const getCurrentSectionQuestions = () => {
    return PTE_SECTION_BREAKDOWN[session.currentSection]?.questions || [];
  };

  const handleResponse = (answer: any) => {
    const newResponse = {
      questionId: currentQuestion?.id || '',
      answer,
      timeSpent: currentQuestion?.timing.response || 0,
      timestamp: Date.now()
    };

    setSession(prev => ({
      ...prev,
      responses: [...prev.responses, newResponse]
    }));
  };

  const handleTimeUp = () => {
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    const sectionQuestions = getCurrentSectionQuestions();
    const nextQuestionIndex = session.currentQuestion + 1;

    if (nextQuestionIndex < sectionQuestions.length) {
      setSession(prev => ({
        ...prev,
        currentQuestion: nextQuestionIndex
      }));
    } else {
      // End of section
      if (session.currentSection === PTE_SECTIONS.SPEAKING_WRITING) {
        setShowBreak(true);
        setTestPhase('break');
      } else {
        moveToNextSection();
      }
    }
  };

  const moveToNextSection = () => {
    const sections = Object.values(PTE_SECTIONS);
    const currentSectionIndex = sections.indexOf(session.currentSection);
    
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      setSession(prev => ({
        ...prev,
        currentSection: nextSection,
        currentQuestion: 0
      }));
    } else {
      // Test completed
      setTestPhase('results');
      setSession(prev => ({ ...prev, isCompleted: true }));
    }
  };

  const handleBreakComplete = () => {
    setShowBreak(false);
    moveToNextSection();
    setTestPhase('test');
  };

  const handleSystemCheckComplete = () => {
    setTestPhase('instructions');
  };

  const handleTestStart = () => {
    setTestPhase('test');
    const firstQuestion = getCurrentSectionQuestions()[0];
    if (firstQuestion) {
      setCurrentQuestion(firstQuestion);
    }
  };

  useEffect(() => {
    if (testPhase === 'test') {
      const sectionQuestions = getCurrentSectionQuestions();
      if (session.currentQuestion < sectionQuestions.length) {
        setCurrentQuestion(sectionQuestions[session.currentQuestion]);
      }
    }
  }, [session.currentQuestion, session.currentSection, testPhase]);

  // Timer management
  useEffect(() => {
    if (testPhase !== 'test') return;

    const interval = setInterval(() => {
      setSession(prev => {
        const newTimeRemaining = { ...prev.timeRemaining };
        
        if (prev.currentSection && newTimeRemaining[prev.currentSection] > 0) {
          newTimeRemaining[prev.currentSection] = Math.max(0, newTimeRemaining[prev.currentSection] - 1);
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testPhase, session.currentSection]);

  const renderSystemCheck = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">System Check</h1>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-gray-700">Microphone:</span>
            <span className={`px-3 py-1 rounded text-sm ${
              session.systemCheck.microphone 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {session.systemCheck.microphone ? '✓ Working' : '✗ Not Working'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-gray-700">Speakers:</span>
            <span className={`px-3 py-1 rounded text-sm ${
              session.systemCheck.speakers 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {session.systemCheck.speakers ? '✓ Working' : '✗ Not Working'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded">
            <span className="text-gray-700">Browser:</span>
            <span className={`px-3 py-1 rounded text-sm ${
              session.systemCheck.browserCompatible 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {session.systemCheck.browserCompatible ? '✓ Compatible' : '✗ Not Compatible'}
            </span>
          </div>
        </div>

        <button
          onClick={handleSystemCheckComplete}
          disabled={!session.systemCheck.microphone || !session.systemCheck.speakers}
          className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Continue to Instructions
        </button>
      </div>
    </div>
  );

  const renderInstructions = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">PTE Academic Mock Test</h1>
        
        <div className="mb-8 text-center">
          <p className="text-gray-600 mb-2">Duration: Approximately 2 hours</p>
          <p className="text-gray-600">Sections: Speaking & Writing, Reading, Listening</p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Section 1: Speaking & Writing</h3>
            <p className="text-blue-700">77-93 minutes • 9 question types</p>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded">
            <h3 className="font-semibold text-purple-800 mb-2">Section 2: Reading</h3>
            <p className="text-purple-700">32-41 minutes • 5 question types</p>
          </div>
          
          <div className="p-4 bg-orange-50 border border-orange-200 rounded">
            <h3 className="font-semibold text-orange-800 mb-2">Section 3: Listening</h3>
            <p className="text-orange-700">45-57 minutes • 8 question types</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
          <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• This is exam mode - no back navigation allowed</li>
            <li>• Audio playback is limited for each question</li>
            <li>• All responses are automatically saved</li>
            <li>• AI scoring is enabled for applicable questions</li>
          </ul>
        </div>

        <button
          onClick={handleTestStart}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          Start Test
        </button>
      </div>
    </div>
  );

  const renderBreak = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Scheduled Break</h1>
        
        <div className="mb-8">
          <div className="text-6xl font-bold text-blue-600 mb-4">10:00</div>
          <p className="text-gray-600">Break time remaining</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-semibold text-blue-800 mb-2">Break Guidelines:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use this time to rest and recharge</li>
              <li>• You may leave your seat</li>
              <li>• Avoid discussing test content</li>
              <li>• Return promptly when time expires</li>
            </ul>
          </div>
        </div>

        <button
          onClick={handleBreakComplete}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Resume Test
        </button>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-6 text-center">Test Completed!</h1>
        
        <div className="text-center mb-8">
          <p className="text-gray-600 mb-4">Congratulations on completing the PTE Academic Mock Test.</p>
          <div className="text-2xl font-bold text-gray-800">
            Total Time: {Math.round((Date.now() - session.startTime) / 60000)} minutes
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-gray-800">85</div>
            <div className="text-gray-600">Overall Score</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-gray-800">90</div>
            <div className="text-gray-600">Speaking</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-gray-800">82</div>
            <div className="text-gray-600">Writing</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-gray-800">78</div>
            <div className="text-gray-600">Reading</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded">
            <div className="text-3xl font-bold text-gray-800">88</div>
            <div className="text-gray-600">Listening</div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            Review Answers
          </button>
          <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Finish
          </button>
        </div>
      </div>
    </div>
  );

  if (testPhase === 'system-check') {
    return renderSystemCheck();
  }

  if (testPhase === 'instructions') {
    return renderInstructions();
  }

  if (testPhase === 'break') {
    return renderBreak();
  }

  if (testPhase === 'results') {
    return renderResults();
  }

  if (testPhase === 'test' && currentQuestion) {
    return (
      <PTEQuestion
        question={currentQuestion}
        onResponse={handleResponse}
        onTimeUp={handleTimeUp}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default PTEMockTest;
