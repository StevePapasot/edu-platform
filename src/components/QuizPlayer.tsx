'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, Send, Loader2, Award, AlertCircle } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import type { QuizQuestion } from '@/src/components/QuizBuilder';

interface QuizPlayerProps {
  lessonId: string;
  courseId: string;
  userId: string;
  questions: QuizQuestion[];
  onComplete?: () => void;
}

interface QuizAttempt {
  score: number;
  total: number;
  percentage: number;
  answers: number[];
  attemptedAt: any;
}

export function QuizPlayer({ lessonId, courseId, userId, questions, onComplete }: QuizPlayerProps) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<QuizAttempt | null>(null);
  const [loadingAttempt, setLoadingAttempt] = useState(true);

  useEffect(() => {
    const loadPreviousAttempt = async () => {
      try {
        const progressRef = doc(db, 'userProgress', `${userId}_${lessonId}`);
        const snap = await getDoc(progressRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.quizAttempt) {
            setLastAttempt(data.quizAttempt as QuizAttempt);
          }
        }
      } catch (error) {
        console.error('Error loading quiz attempt:', error);
      } finally {
        setLoadingAttempt(false);
      }
    };
    loadPreviousAttempt();
  }, [userId, lessonId]);

  const handleSelect = (questionIndex: number, choiceIndex: number) => {
    if (submitted) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = choiceIndex;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    const unanswered = answers.findIndex(a => a === null);
    if (unanswered !== -1) {
      toast.error(`Δεν έχεις απαντήσει την ερώτηση ${unanswered + 1}.`);
      return;
    }

    setSubmitting(true);

    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctIndex) score++;
    });
    const percentage = Math.round((score / questions.length) * 100);

    const attempt: QuizAttempt = {
      score,
      total: questions.length,
      percentage,
      answers: answers as number[],
      attemptedAt: serverTimestamp()
    };

    try {
      const progressRef = doc(db, 'userProgress', `${userId}_${lessonId}`);
      await setDoc(progressRef, {
        userId,
        lessonId,
        courseId,
        completed: true,
        completedAt: serverTimestamp(),
        quizAttempt: attempt
      }, { merge: true });

      setLastAttempt({ ...attempt, attemptedAt: new Date() });
      setSubmitted(true);
      onComplete?.();
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.error('Σφάλμα κατά την υποβολή.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers(questions.map(() => null));
    setSubmitted(false);
  };

  if (loadingAttempt) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (lastAttempt && !submitted && answers.every(a => a === null)) {
    const getScoreColor = () => {
      if (lastAttempt.percentage >= 80) return 'from-green-500 to-emerald-600';
      if (lastAttempt.percentage >= 60) return 'from-blue-500 to-indigo-600';
      if (lastAttempt.percentage >= 40) return 'from-amber-500 to-orange-600';
      return 'from-rose-500 to-red-600';
    };

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-br ${getScoreColor()} rounded-3xl p-8 text-white text-center shadow-xl`}>
          <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <p className="text-sm font-black uppercase tracking-widest opacity-90 mb-2">Τελευταία Προσπάθεια</p>
          <p className="text-6xl font-black mb-2">{lastAttempt.percentage}%</p>
          <p className="text-lg font-bold opacity-90">{lastAttempt.score} από {lastAttempt.total} σωστά</p>
        </div>
        
        <button
          onClick={handleRetry}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-0.5"
        >
          <RotateCcw className="w-5 h-5" /> Επανάληψη Quiz
        </button>

        <button
          onClick={() => {
            setAnswers(lastAttempt.answers);
            setSubmitted(true);
          }}
          className="w-full py-4 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-black text-sm uppercase tracking-widest border-2 border-slate-200 transition-all"
        >
          Προβολή Απαντήσεων
        </button>
      </div>
    );
  }

  if (submitted && lastAttempt) {
    const getScoreColor = () => {
      if (lastAttempt.percentage >= 80) return 'from-green-500 to-emerald-600';
      if (lastAttempt.percentage >= 60) return 'from-blue-500 to-indigo-600';
      if (lastAttempt.percentage >= 40) return 'from-amber-500 to-orange-600';
      return 'from-rose-500 to-red-600';
    };

    return (
      <div className="space-y-6">
        <div className={`bg-gradient-to-br ${getScoreColor()} rounded-3xl p-8 text-white text-center shadow-xl`}>
          <Award className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <p className="text-sm font-black uppercase tracking-widest opacity-90 mb-2">Το Αποτέλεσμά σου</p>
          <p className="text-7xl font-black mb-2">{lastAttempt.percentage}%</p>
          <p className="text-lg font-bold opacity-90">{lastAttempt.score} από {lastAttempt.total} σωστά</p>
        </div>

        <div className="space-y-4">
          <h4 className="font-black text-slate-800 text-lg">Αναλυτική Προβολή</h4>
          
          {questions.map((q, qIndex) => {
            const userAnswer = answers[qIndex];
            const isCorrect = userAnswer === q.correctIndex;
            
            return (
              <div key={q.id} className={`bg-white rounded-2xl p-5 border-2 ${isCorrect ? 'border-green-200' : 'border-red-200'} shadow-sm`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ερώτηση {qIndex + 1}</p>
                    <p className="font-bold text-slate-800">{q.text}</p>
                  </div>
                </div>

                <div className="space-y-2 ml-13">
                  {q.choices.map((choice, cIndex) => {
                    const isUserChoice = userAnswer === cIndex;
                    const isCorrectChoice = q.correctIndex === cIndex;
                    let bgClass = 'bg-slate-50 text-slate-500';
                    let iconEl = null;
                    
                    if (isCorrectChoice) {
                      bgClass = 'bg-green-50 text-green-800 border-2 border-green-300';
                      iconEl = <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
                    } else if (isUserChoice && !isCorrectChoice) {
                      bgClass = 'bg-red-50 text-red-800 border-2 border-red-300';
                      iconEl = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
                    }

                    return (
                      <div key={cIndex} className={`${bgClass} p-3 rounded-xl flex items-center gap-3 font-medium text-sm`}>
                        <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0">
                          {String.fromCharCode(65 + cIndex)}
                        </span>
                        <span className="flex-1">{choice}</span>
                        {iconEl}
                        {isUserChoice && <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Η απάντησή σου</span>}
                      </div>
                    );
                  })}
                </div>

                {q.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Εξήγηση</p>
                      <p className="text-sm text-blue-900 font-medium">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRetry}
          className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all hover:-translate-y-0.5"
        >
          <RotateCcw className="w-5 h-5" /> Νέα Προσπάθεια
        </button>
      </div>
    );
  }

  const answeredCount = answers.filter(a => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm sticky top-24 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Πρόοδος</span>
          <span className="text-sm font-black text-blue-600">{answeredCount} / {questions.length}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {questions.map((q, qIndex) => (
        <div key={q.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3 mb-5">
            <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full flex-shrink-0">Q{qIndex + 1}</span>
            <p className="font-bold text-slate-800 text-lg leading-relaxed">{q.text}</p>
          </div>

          <div className="space-y-2">
            {q.choices.map((choice, cIndex) => {
              const isSelected = answers[qIndex] === cIndex;
              return (
                <button
                  key={cIndex}
                  onClick={() => handleSelect(qIndex, cIndex)}
                  className={`w-full text-left p-4 rounded-xl flex items-center gap-3 font-medium transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-2 border-blue-500 text-blue-900 shadow-md'
                      : 'bg-slate-50 border-2 border-transparent hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0 ${
                    isSelected ? 'bg-blue-500 text-white' : 'bg-white text-slate-400'
                  }`}>
                    {String.fromCharCode(65 + cIndex)}
                  </span>
                  <span className="flex-1">{choice}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl transition-all ${
          allAnswered && !submitting
            ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:-translate-y-0.5'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        {submitting ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Υποβολή...</>
        ) : (
          <><Send className="w-5 h-5" /> Υποβολή Quiz</>
        )}
      </button>

      {!allAnswered && (
        <p className="text-center text-sm text-slate-500 font-medium">
          Απάντησε σε όλες τις ερωτήσεις για να υποβάλεις.
        </p>
      )}
    </div>
  );
}