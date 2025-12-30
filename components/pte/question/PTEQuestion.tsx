'use client';

import React from 'react';
import { PTEQuestion } from '@/types/pte-types';
import PTETimer from '../timer/PTETimer';
import PTAudioPlayer from '../audio/PTAudioPlayer';
import PTERecorder from '../recording/PTERecorder';
import PTETextArea from '../text/PTETextArea';
import PTEMultipleChoice from '../mcq/PTEMultipleChoice';
import PTEDragDrop from '../dragdrop/PTEDragDrop';
import PTEHighlight from '../highlight/PTEHighlight';
import { PTE_QUESTION_TYPES, PTE_AI_SCORED_QUESTIONS } from '@/constants/pte-constants';

interface PTEQuestionProps {
  question: PTEQuestion;
  onResponse: (answer: any) => void;
  onTimeUp: () => void;
  className?: string;
}

const PTEQuestion: React.FC<PTEQuestionProps> = ({
  question,
  onResponse,
  onTimeUp,
  className = ''
}) => {
  const hasAIScoring = PTE_AI_SCORED_QUESTIONS.includes(question.type as any);

  const renderQuestionContent = () => {
    switch (question.type) {
      // Speaking Questions
      case PTE_QUESTION_TYPES.READ_ALOUD:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Read Aloud</h3>
              <p className="text-gray-700 leading-relaxed">{question.content.text}</p>
            </div>
            <PTERecorder
              maxDuration={question.timing.response}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
              onError={(error) => console.error('Recording error:', error)}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.REPEAT_SENTENCE:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Repeat Sentence</h3>
              <p className="text-blue-800">Listen carefully and repeat the sentence exactly as you hear it.</p>
            </div>
            <PTAudioPlayer
              audioUrl={question.content.audioUrl!}
              maxPlays={question.audioRestrictions?.maxPlays || 1}
              onEnded={() => {
                // Auto-start recording after audio ends
                setTimeout(() => {
                  // Start recording logic here
                }, 500);
              }}
            />
            <PTERecorder
              maxDuration={question.timing.response}
              autoStart={false}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.DESCRIBE_IMAGE:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Describe Image</h3>
              <p className="text-blue-800">Study the image for 25 seconds, then describe it in detail.</p>
            </div>
            <div className="flex justify-center mb-4">
              <img
                src={question.content.imageUrl!}
                alt="Describe this image"
                className="max-w-full max-h-96 border border-gray-300 rounded-lg shadow-lg"
              />
            </div>
            <PTERecorder
              maxDuration={question.timing.response}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.RETELL_LECTURE:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Re-tell Lecture</h3>
              <p className="text-blue-800">Listen to the lecture and retell it in your own words.</p>
            </div>
            {question.content.videoUrl ? (
              <div className="flex justify-center mb-4">
                <video
                  src={question.content.videoUrl}
                  controls={false}
                  className="max-w-full max-h-96 border border-gray-300 rounded-lg shadow-lg"
                />
              </div>
            ) : (
              <PTAudioPlayer
                audioUrl={question.content.audioUrl!}
                maxPlays={question.audioRestrictions?.maxPlays || 1}
              />
            )}
            <PTERecorder
              maxDuration={question.timing.response}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.ANSWER_SHORT_QUESTION:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Answer Short Question</h3>
              <p className="text-blue-800">Listen to the question and provide a brief answer.</p>
            </div>
            <PTAudioPlayer
              audioUrl={question.content.audioUrl!}
              maxPlays={question.audioRestrictions?.maxPlays || 1}
            />
            <PTERecorder
              maxDuration={question.timing.response}
              autoStart={true}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.RESPOND_TO_SITUATION:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Respond to a Situation</h3>
              <p className="text-blue-800 mb-2">Read the situation and respond appropriately:</p>
              <div className="bg-white p-3 border border-gray-200 rounded">
                <p className="text-gray-800">{question.content.situation}</p>
              </div>
            </div>
            <PTERecorder
              maxDuration={question.timing.response}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.SUMMARIZE_GROUP_DISCUSSION:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Summarize Group Discussion</h3>
              <p className="text-blue-800 mb-2">Listen to the discussion and summarize the key points.</p>
              <div className="bg-white p-3 border border-gray-200 rounded">
                <p className="text-sm text-gray-600 mb-1">
                  Topic: {question.content.discussion?.topic}
                </p>
                <p className="text-sm text-gray-600">
                  Speakers: {question.content.discussion?.speakers}
                </p>
              </div>
            </div>
            <PTAudioPlayer
              audioUrl={question.content.discussion?.audioUrl!}
              maxPlays={question.audioRestrictions?.maxPlays || 1}
            />
            <PTERecorder
              maxDuration={question.timing.response}
              onRecordingComplete={(audioUrl) => onResponse({ audioUrl })}
            />
          </div>
        );

      // Writing Questions
      case PTE_QUESTION_TYPES.SUMMARIZE_WRITTEN_TEXT:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Summarize Written Text</h3>
              <p className="text-green-800">Read the text and summarize it in one sentence.</p>
            </div>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-800 leading-relaxed">{question.content.text}</p>
            </div>
            <PTETextArea
              wordCount={question.wordCount}
              onChange={(text) => onResponse({ text })}
              onSave={(text) => console.log('Auto-saved:', text)}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.ESSAY:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Essay</h3>
              <p className="text-green-800">Write an essay of 200-300 words on the following topic:</p>
            </div>
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium text-gray-800 mb-2">Topic:</h4>
              <p className="text-gray-800">{question.content.question}</p>
            </div>
            <PTETextArea
              wordCount={question.wordCount}
              onChange={(text) => onResponse({ text })}
              onSave={(text) => console.log('Auto-saved essay:', text)}
              showWordCount={true}
              showCharCount={false}
            />
          </div>
        );

      // Reading Questions
      case PTE_QUESTION_TYPES.FILL_IN_BLANKS_DROPDOWN:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Fill in the Blanks</h3>
              <p className="text-purple-800">Select the correct word for each blank from the dropdown menu.</p>
            </div>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
              <div className="text-gray-800 leading-relaxed">
                {question.content.blanks?.map((blank, index) => (
                  <span key={blank.id}>
                    {blank.position > 0 && ' '}
                    <select
                      className="mx-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        const answer = { [blank.id]: e.target.value };
                        onResponse(answer);
                      }}
                    >
                      <option value="">--- Select ---</option>
                      {blank.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case PTE_QUESTION_TYPES.MC_MULTIPLE_ANSWERS_READING:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Multiple Choice - Multiple Answers</h3>
              <p className="text-purple-800">Select all correct answers.</p>
            </div>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-800 leading-relaxed mb-4">{question.content.passage}</p>
              <p className="font-medium text-gray-800 mb-3">{question.content.question}</p>
              <PTEMultipleChoice
                options={question.content.options || []}
                isMultiple={true}
                onChange={(selectedIds) => onResponse({ selectedIds })}
              />
            </div>
          </div>
        );

      case PTE_QUESTION_TYPES.REORDER_PARAGRAPHS:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Reorder Paragraphs</h3>
              <p className="text-purple-800">Arrange the sentences in the correct order.</p>
            </div>
            <PTEDragDrop
              items={question.content.sentences?.map((sentence, index) => ({
                id: `sentence-${index}`,
                content: sentence,
                originalIndex: index
              })) || []}
              onReorder={(newOrder) => onResponse({ reorderedSentences: newOrder })}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.FILL_IN_BLANKS_DRAG_DROP:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Fill in the Blanks</h3>
              <p className="text-purple-800">Drag words from the box below to complete the text.</p>
            </div>
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded">
              <div className="text-gray-800 leading-relaxed mb-4">
                {question.content.text?.split('___').map((part, index) => (
                  <span key={index}>
                    {part}
                    {index < (question.content.blanks?.length || 0) && (
                      <span className="inline-block mx-1 px-2 py-1 border-b-2 border-blue-400 min-w-20 text-center">
                        {'___'}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
            <PTEDragDrop
              items={question.content.wordBank?.map((word, index) => ({
                id: `word-${index}`,
                content: word,
                originalIndex: index
              })) || []}
              dropZones={question.content.blanks?.map((blank, index) => ({
                id: `blank-${index}`,
                accepts: ['word'],
                items: []
              })) || []}
              onDrop={(zoneId, items) => {
                const answer = { [zoneId]: items[0]?.content || '' };
                onResponse(answer);
              }}
            />
          </div>
        );

      // Listening Questions
      case PTE_QUESTION_TYPES.SUMMARIZE_SPOKEN_TEXT:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Summarize Spoken Text</h3>
              <p className="text-orange-800">Listen to the recording and write a 50-70 word summary.</p>
            </div>
            <PTAudioPlayer
              audioUrl={question.content.audioUrl!}
              maxPlays={question.audioRestrictions?.maxPlays || 2}
            />
            <PTETextArea
              wordCount={question.wordCount}
              onChange={(text) => onResponse({ text })}
              onSave={(text) => console.log('Auto-saved summary:', text)}
            />
          </div>
        );

      case PTE_QUESTION_TYPES.HIGHLIGHT_CORRECT_SUMMARY:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Highlight Correct Summary</h3>
              <p className="text-orange-800">Listen and select the correct summary.</p>
            </div>
            <PTAudioPlayer
              audioUrl={question.content.audioUrl!}
              maxPlays={question.audioRestrictions?.maxPlays || 2}
            />
            <div className="space-y-3">
              {question.content.summaries?.map((summary, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded cursor-pointer hover:border-blue-400 hover:bg-blue-50"
                  onClick={() => onResponse({ selectedSummary: summary })}
                >
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 mr-2">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-gray-800">{summary}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case PTE_QUESTION_TYPES.HIGHLIGHT_INCORRECT_WORDS:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-orange-50 border border-orange-200 rounded">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Highlight Incorrect Words</h3>
              <p className="text-orange-800">Listen and highlight words in the transcript that are different from the audio.</p>
            </div>
            <PTAudioPlayer
              audioUrl={question.content.audioUrl!}
              maxPlays={question.audioRestrictions?.maxPlays || 2}
            />
            <PTEHighlight
              text={question.content.transcript || ''}
              isMultiple={true}
              onChange={(highlights) => onResponse({ highlightedWords: highlights })}
            />
          </div>
        );

      default:
        return (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Question Type Not Implemented</h3>
            <p className="text-yellow-800">This question type ({question.type}) is not yet implemented.</p>
          </div>
        );
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Question Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Question {question.number}
            </h1>
            <p className="text-sm text-gray-600">
              {question.type.replace('_', ' ').toUpperCase()}
              {hasAIScoring && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                  AI Scored
                </span>
              )}
            </p>
          </div>
          
          <PTETimer
            totalTime={question.timing.total}
            remainingTime={question.timing.response}
            isRunning={true}
            onTimeUp={onTimeUp}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-4xl mx-auto p-6">
        {renderQuestionContent()}
      </div>

      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Question {question.number} of {question.totalQuestions || 20}
          </div>
          
          <div className="space-x-3">
            <button
              disabled
              className="px-4 py-2 bg-gray-200 text-gray-400 rounded cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => {
                // Submit current response and move to next
                console.log('Moving to next question');
              }}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTEQuestion;
