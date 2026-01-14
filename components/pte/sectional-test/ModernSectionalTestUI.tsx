"use client";

import React, { useState, useEffect } from 'react';
import {
    Mic, Pencil, BookOpen, Headphones, Clock, ChevronLeft, Check,
    AlertCircle, Play, Pause, Volume2, Flag, Grid3X3, X, ArrowRight,
    BarChart3, GripVertical, Trophy, Target, RotateCcw, Home, Menu,
    Award, Zap, CheckCircle2, Image as ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Reorder Component
const ReorderParagraphs = ({ color, items, setItems }: { color: string, items: any[], setItems: any }) => {
    const move = (i: number, dir: number) => {
        const newItems = [...items];
        const j = i + dir;
        if (j >= 0 && j < items.length) {
            [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
            setItems(newItems);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                Reorder the paragraphs into correct sequence:
            </p>
            {items.map((item, i) => (
                <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                    borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                }}>
                    <GripVertical size={16} color="rgba(255,255,255,0.3)" />
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '6px', background: `${color}20`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 600, fontSize: '12px', color: color, flexShrink: 0,
                    }}>{i + 1}</div>
                    <p style={{ flex: 1, fontSize: '13px', lineHeight: 1.5, color: 'rgba(255,255,255,0.8)', margin: 0 }}>{item.text}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <button onClick={() => move(i, -1)} disabled={i === 0}
                            style={{
                                width: '22px', height: '22px', borderRadius: '4px', background: i === 0 ? 'transparent' : 'rgba(255,255,255,0.05)',
                                border: 'none', cursor: i === 0 ? 'not-allowed' : 'pointer', color: i === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: '12px'
                            }}>↑</button>
                        <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                            style={{
                                width: '22px', height: '22px', borderRadius: '4px', background: i === items.length - 1 ? 'transparent' : 'rgba(255,255,255,0.05)',
                                border: 'none', cursor: i === items.length - 1 ? 'not-allowed' : 'pointer', color: i === items.length - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)', fontSize: '12px'
                            }}>↓</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Multiple Choice
const MultipleChoice = ({ multiple, color, options, selected, setSelected }: { multiple: boolean, color: string, options: any[], selected: any, setSelected: any }) => {
    const toggle = (id: string) => {
        if (multiple) {
            const set = new Set(selected || []);
            if (set.has(id)) set.delete(id);
            else set.add(id);
            setSelected(Array.from(set));
        } else {
            setSelected(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {options.map(opt => {
                const isSelected = multiple ? (selected || []).includes(opt.id) : selected === opt.id;
                return (
                    <button key={opt.id} onClick={() => toggle(opt.id)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '10px', textAlign: 'left',
                        background: isSelected ? `${color}15` : 'rgba(255,255,255,0.02)', border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.08)'}`, cursor: 'pointer',
                    }}>
                        <div style={{
                            width: '20px', height: '20px', borderRadius: multiple ? '4px' : '50%', flexShrink: 0,
                            border: `2px solid ${isSelected ? color : 'rgba(255,255,255,0.3)'}`, background: isSelected ? color : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{isSelected && <Check size={12} color="white" />}</div>
                        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>{opt.text}</span>
                    </button>
                );
            })}
        </div>
    );
};

// Fill Blanks Dropdown
const FillBlanks = ({ color, passage, blanks, answers, setAnswers }: { color: string, passage: string, blanks: any[], answers: any, setAnswers: any }) => {
    const Select = ({ id, options }: { id: string, options: string[] }) => (
        <select value={answers[id] || ''} onChange={e => setAnswers({ ...answers, [id]: e.target.value })} style={{
            padding: '4px 10px', borderRadius: '6px', background: answers[id] ? `${color}20` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${answers[id] ? color : 'rgba(255,255,255,0.2)'}`, color: answers[id] ? color : 'rgba(255,255,255,0.6)',
            fontSize: '13px', cursor: 'pointer', outline: 'none', minWidth: '120px',
        }}>
            <option value="">Select...</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
    );

    // This is a simplified version of parsing the passage for blanks.
    // In a real app, you'd replace tokens like [[blank_0]] with the Select component.
    return (
        <p style={{ fontSize: '14px', lineHeight: 2.2, color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            {/* For demonstration we use the user's hardcoded logic if no dynamic data is passed */}
            {passage || "Climate change is a significant challenge. The [...] of greenhouse gases has led to rising temperatures. Scientists have [...] numerous impacts including extreme weather."}
            {/* In the actual implementation, we would split and intersperse selects */}
        </p>
    );
};

// Results Screen
export const ModernResultsScreen = ({ onRestart, scores, overallScore }: { onRestart: () => void, scores: any, overallScore: number }) => {
    const getColor = (s: number) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
    const overall = overallScore;

    const SECTIONS_META: any = {
        speaking: { name: 'Speaking', icon: Mic, color: '#6366f1', gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' },
        writing: { name: 'Writing', icon: Pencil, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' },
        reading: { name: 'Reading', icon: BookOpen, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' },
        listening: { name: 'Listening', icon: Headphones, color: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' },
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                    width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)'
                }}>
                    <Trophy size={36} color="white" />
                </div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: '0 0 8px' }}>Test Completed!</h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>Here&apos;s your performance summary</p>
            </div>

            <div style={{
                width: '100%', maxWidth: '420px', padding: '28px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)', marginBottom: '20px', textAlign: 'center'
            }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Overall Score</div>
                <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto 16px' }}>
                    <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                        <circle cx="70" cy="70" r="60" fill="none" stroke={getColor(overall)} strokeWidth="10"
                            strokeDasharray={`${overall * 3.77} 377`} strokeLinecap="round" />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '40px', fontWeight: 700, color: getColor(overall), fontFamily: 'monospace' }}>{overall}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>out of 90</div>
                    </div>
                </div>
                <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', borderRadius: '16px',
                    background: `${getColor(overall)}20`, border: `1px solid ${getColor(overall)}40`
                }}>
                    <Award size={16} color={getColor(overall)} />
                    <span style={{ fontSize: '13px', fontWeight: 600, color: getColor(overall) }}>{overall >= 79 ? 'Superior' : overall >= 65 ? 'Proficient' : 'Developing'}</span>
                </div>
            </div>

            <div style={{ width: '100%', maxWidth: '420px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {Object.entries(scores).map(([key, score]: [string, any]) => {
                    const s = SECTIONS_META[key];
                    if (!s) return null;
                    const Icon = s.icon;
                    return (
                        <div key={key} style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: s.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={16} color="white" />
                                </div>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{s.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
                                <span style={{ fontSize: '24px', fontWeight: 700, color: s.color, fontFamily: 'monospace' }}>{score}</span>
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>/90</span>
                            </div>
                            <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                <div style={{ width: `${(score / 90) * 100}%`, height: '100%', borderRadius: '2px', background: s.gradient }} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={onRestart} style={{
                    padding: '12px 24px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                    <Home size={16} /> Home
                </button>
                <button onClick={() => window.location.reload()} style={{
                    padding: '12px 24px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)'
                }}>
                    <RotateCcw size={16} /> Try Again
                </button>
            </div>
        </div>
    );
};

// Main Component
export default function ModernSectionalTestUI({
    sectionData,
    currentQuestion,
    currentIndex,
    totalQuestions,
    timerSeconds,
    onNext,
    onPrev,
    onNav,
    isSubmitting,
    isRecording,
    setIsRecording,
    isPlaying,
    setIsPlaying,
    isPaused,
    setIsPaused,
    textAnswer,
    setTextAnswer,
    audioProgress = 0,
    waveHeights = Array(25).fill(20),
    wordCount = 0,
    showGrid,
    setShowGrid,
    mobileMenu,
    setMobileMenu
}: any) {
    const router = useRouter();

    const section = sectionData;
    const question = currentQuestion;
    const completed = currentIndex;
    const progress = (completed / totalQuestions) * 100;
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timerProgress = (timerSeconds / (section.totalTime * 60)) * 100;
    const isWarning = minutes < 5;

    const type = (question.type || "").toLowerCase();

    const needsAudio = ['repeat', 'retell', 'short', 'summarize spoken', 'fill', 'highlight', 'missing', 'dictation'].some(t => type.includes(t));
    const needsRecording = ['read aloud', 'repeat', 'describe', 'retell', 'short'].some(t => type.includes(t));
    const needsText = ['read aloud', 'summarize written', 'fill', 'multiple', 'choice'].some(t => type.includes(t));
    const needsTextInput = ['summarize written', 'essay', 'summarize spoken', 'dictation', 'email'].some(t => type.includes(t));
    const needsReorder = type.includes('reorder') || type.includes('re-order');
    const needsMC = ['multiple', 'choice', 'highlight summary', 'select missing word'].some(t => type.includes(t));
    const needsDropdowns = type.includes('fill') && (type.includes('blanks') || type.includes('dropdown') || type.includes('drag'));
    const needsImage = type.includes('describe image');

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a14', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
            <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 900px) { .sidebar { display: none !important; } .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>

            <div style={{ position: 'absolute', inset: 0, background: section.bgGlow, pointerEvents: 'none', transition: 'background 0.5s' }} />

            {mobileMenu && <div onClick={() => setMobileMenu(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 150 }} />}

            {/* Nav */}
            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,10,20,0.9)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => setMobileMenu(!mobileMenu)} className="mobile-btn" style={{ display: 'none', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: 'white' }}>
                        <Menu size={18} />
                    </button>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '18px'
                    }}>P</div>
                    <div className="nav-title" style={{ display: 'block' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>PedagogistsPTE</div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Academic Mastery</div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '10px',
                        background: isWarning ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', border: isWarning ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                            <svg width="28" height="28" style={{ transform: 'rotate(-90deg)' }}>
                                <circle cx="14" cy="14" r="10" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                                <circle cx="14" cy="14" r="10" fill="none" stroke={isWarning ? '#ef4444' : section.color} strokeWidth="2"
                                    strokeDasharray={`${timerProgress * 0.628} 62.8`} strokeLinecap="round" />
                            </svg>
                            <Clock size={10} color={isWarning ? '#ef4444' : section.color} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: 600, color: isWarning ? '#ef4444' : 'white' }}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </div>
                    </div>
                    <button onClick={() => setIsPaused(!isPaused)} style={{
                        padding: '8px 14px', borderRadius: '8px', background: isPaused ? section.color : 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontWeight: 500, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        {isPaused ? <Play size={12} /> : <Pause size={12} />}
                        <span className="nav-title">{isPaused ? 'Start' : 'Pause'}</span>
                    </button>
                </div>
            </nav>

            <div className="main-grid" style={{ display: 'grid', gridTemplateColumns: '200px 1fr 240px', gap: '14px', padding: '14px', maxWidth: '1300px', margin: '0 auto' }}>
                {/* Left Sidebar */}
                <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Section Progress</div>
                    <div style={{
                        position: 'relative', padding: '12px', borderRadius: '12px', border: `2px solid ${section.color}`,
                        background: `${section.color}15`, cursor: 'default', textAlign: 'left'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '10px', background: section.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 4px 16px ${section.color}40`
                            }}><section.icon size={18} color="white" /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: section.color, marginBottom: '2px' }}>{section.name}</div>
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{totalQuestions} questions</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <BarChart3 size={12} color="rgba(255,255,255,0.5)" />
                            <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>Batch Progress</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '18px', fontWeight: 600, color: 'white' }}>{Math.round(progress)}%</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{completed}/{totalQuestions}</span>
                        </div>
                        <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', borderRadius: '3px', background: section.gradient }} />
                        </div>
                    </div>
                </aside>

                {/* Main */}
                <main style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)', padding: '18px', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 100px)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '6px', background: `${section.color}15`, marginBottom: '6px' }}>
                                <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: section.color }} />
                                <span style={{ fontSize: '11px', fontWeight: 500, color: section.color }}>{question.type}</span>
                            </div>
                            <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>Question {currentIndex + 1} of {totalQuestions}</h1>
                        </div>
                        <button style={{ padding: '6px 12px', borderRadius: '6px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: '11px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Flag size={10} /> Flag
                        </button>
                    </div>

                    <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <AlertCircle size={12} color={section.color} />
                            <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Instructions</span>
                        </div>
                        <p style={{ fontSize: '12px', lineHeight: 1.5, color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                            {question.instructions || 'Follow the instructions for this question type.'}
                        </p>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto' }}>
                        {needsAudio && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <button onClick={() => setIsPlaying(!isPlaying)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: section.color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${section.color}50`, flexShrink: 0 }}>
                                    {isPlaying ? <Pause size={16} color="white" /> : <Play size={16} color="white" style={{ marginLeft: '2px' }} />}
                                </button>
                                <div style={{ flex: 1 }}>
                                    <div style={{ height: '5px', borderRadius: '3px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                        <div style={{ width: `${audioProgress}%`, height: '100%', borderRadius: '3px', background: section.color }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.4)' }}>
                                        <span>{Math.floor(audioProgress * 1.5 / 60)}:{String(Math.floor(audioProgress * 1.5) % 60).padStart(2, '0')}</span>
                                        <span>2:30</span>
                                    </div>
                                </div>
                                <Volume2 size={14} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
                            </div>
                        )}

                        {needsImage && question.imageUrl && (
                            <div style={{
                                width: '100%', minHeight: '200px', borderRadius: '14px', background: `linear-gradient(135deg, ${section.color}10, ${section.color}05)`, border: `1px solid ${section.color}30`,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px'
                            }}>
                                <img src={question.imageUrl} alt="PTE Question" style={{ maxHeight: '300px', maxWidth: '100%', borderRadius: '8px' }} />
                                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>{question.title}</span>
                            </div>
                        )}

                        {needsText && question.content && (
                            <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ fontSize: '14px', lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', margin: 0 }}>{question.content}</p>
                            </div>
                        )}

                        {needsDropdowns && (
                            <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <FillBlanks color={section.color} passage={question.content} blanks={question.blanks} answers={textAnswer} setAnswers={setTextAnswer} />
                            </div>
                        )}

                        {needsMC && (
                            <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <MultipleChoice options={question.options} multiple={question.type.includes('Multiple')} color={section.color} selected={textAnswer} setSelected={setTextAnswer} />
                            </div>
                        )}

                        {needsReorder && (
                            <div style={{ padding: '16px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <ReorderParagraphs color={section.color} items={textAnswer || []} setItems={setTextAnswer} />
                            </div>
                        )}

                        {needsRecording && (
                            <div style={{ padding: '20px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '8px',
                                    background: isRecording ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.03)', border: isRecording ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)'
                                }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isRecording ? '#ef4444' : 'rgba(255,255,255,0.3)', animation: isRecording ? 'pulse 1s infinite' : 'none' }} />
                                    <span style={{ fontSize: '12px', fontWeight: 500, color: isRecording ? '#ef4444' : 'rgba(255,255,255,0.5)' }}>{isRecording ? 'Recording...' : 'Ready'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', height: '36px' }}>
                                    {waveHeights.map((h: number, i: number) => <div key={i} style={{ width: '3px', height: `${isRecording ? h : 20}%`, background: isRecording ? section.color : 'rgba(255,255,255,0.2)', borderRadius: '2px', transition: 'height 0.1s' }} />)}
                                </div>
                                <button onClick={() => setIsRecording(!isRecording)} style={{
                                    width: '56px', height: '56px', borderRadius: '50%', background: isRecording ? '#ef4444' : section.gradient, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: isRecording ? '0 0 0 5px rgba(239,68,68,0.2), 0 6px 20px rgba(239,68,68,0.4)' : `0 0 0 5px ${section.color}20, 0 6px 20px ${section.color}40`
                                }}>
                                    <Mic size={24} color="white" />
                                </button>
                            </div>
                        )}

                        {needsTextInput && (
                            <div style={{ position: 'relative', flex: 1 }}>
                                <textarea placeholder="Type your response here..." value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                                    style={{
                                        width: '100%', height: '100%', minHeight: '160px', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: 1.6, resize: 'none', outline: 'none', fontFamily: 'inherit'
                                    }} />
                                <div style={{ position: 'absolute', bottom: '10px', right: '10px', fontFamily: 'monospace', fontSize: '10px', color: wordCount < 25 ? '#f59e0b' : wordCount > 75 ? '#ef4444' : '#10b981' }}>
                                    {wordCount} words
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: '8px' }}>
                        <button onClick={onPrev} disabled={currentIndex === 0}
                            style={{
                                padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                color: currentIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white', fontWeight: 500, fontSize: '12px', cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                            <ChevronLeft size={14} /> Previous
                        </button>
                        <button onClick={() => setShowGrid(true)} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Grid3X3 size={12} /> Nav
                        </button>
                        <button onClick={onNext} disabled={isSubmitting}
                            style={{ padding: '10px 16px', borderRadius: '10px', background: section.gradient, border: 'none', color: 'white', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: `0 4px 14px ${section.color}40` }}>
                            {isSubmitting ? 'Saving...' : (currentIndex === totalQuestions - 1 ? 'Finish' : 'Next')} <ArrowRight size={14} />
                        </button>
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Grid3X3 size={12} color={section.color} /> Batch Overview
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                            {Array.from({ length: totalQuestions }).map((_, i) => {
                                const isCompleted = i < currentIndex;
                                const isCurrent = i === currentIndex;
                                const st = isCompleted ? { border: '#10b981', bg: 'rgba(16,185,129,0.2)', color: '#10b981' }
                                    : isCurrent ? { border: section.color, bg: `${section.color}20`, color: section.color }
                                        : { border: 'rgba(255,255,255,0.2)', bg: 'transparent', color: 'rgba(255,255,255,0.5)' };
                                return (
                                    <button key={i} onClick={() => onNav(i)} style={{
                                        width: '30px', height: '30px', borderRadius: '6px', border: `2px solid ${st.border}`,
                                        background: st.bg, color: st.color, fontFamily: 'monospace', fontSize: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {isCompleted ? <Check size={10} /> : i + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '14px', background: `linear-gradient(135deg, ${section.color}10, transparent)`, border: `1px solid ${section.color}30` }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: section.color, marginBottom: '6px' }}>💡 Pro Tip</div>
                        <p style={{ fontSize: '10px', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                            {question.type.includes('Read') && 'Read naturally with proper intonation.'}
                            {question.type.includes('Repeat') && 'Focus on content words and rhythm.'}
                            {question.type.includes('Describe') && 'Start with overview, then details.'}
                            {question.type.includes('Re-order') && 'Look for topic sentences and transitions.'}
                            {question.type.includes('Multiple') && 'Read all options carefully.'}
                            {question.type.includes('Essay') && 'Plan: intro, body paragraphs, conclusion.'}
                            {question.type.includes('Fill') && 'Use context and grammar clues.'}
                            {question.type.includes('Dictation') && 'Write exactly what you hear.'}
                            {!['Read', 'Repeat', 'Describe', 'Re-order', 'Multiple', 'Essay', 'Fill', 'Dictation'].some(t => question.type.includes(t)) && 'Take your time and review before submitting.'}
                        </p>
                    </div>
                </aside>
            </div>

            {showGrid && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
                    <div style={{ background: '#1a1a2e', borderRadius: '18px', padding: '20px', maxWidth: '380px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', margin: 0 }}>Question Navigator</h3>
                            <button onClick={() => setShowGrid(false)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><X size={14} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                            {Array.from({ length: totalQuestions }).map((_, i) => {
                                const isCompleted = i < currentIndex;
                                const isCurrent = i === currentIndex;
                                const st = isCompleted ? { border: '#10b981', bg: 'rgba(16,185,129,0.2)', color: '#10b981' }
                                    : isCurrent ? { border: section.color, bg: `${section.color}20`, color: section.color }
                                        : { border: 'rgba(255,255,255,0.2)', bg: 'transparent', color: 'rgba(255,255,255,0.5)' };
                                return (
                                    <button key={i} onClick={() => { onNav(i); setShowGrid(false); }} style={{
                                        width: '36px', height: '36px', borderRadius: '8px', border: `2px solid ${st.border}`,
                                        background: st.bg, color: st.color, fontFamily: 'monospace', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {isCompleted ? <Check size={12} /> : i + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', gap: '14px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                            {[{ color: '#10b981', label: 'Done' }, { color: section.color, label: 'Current' }, { color: 'rgba(255,255,255,0.2)', label: 'Upcoming' }].map(item => (
                                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color }} />
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
