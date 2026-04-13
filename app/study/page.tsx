'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  CircleCheck as CheckCircle,
  Circle,
  Menu,
  X,
  Award,
} from 'lucide-react';
import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  courseService,
  Chapter,
  Lesson,
  QuizQuestion,
  UserProgress,
} from '@/src/services/courseService';

export default function StudyPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map());
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'theory' | 'quiz'>('theory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await courseService.createUserProfile(user.uid, user.email || '');
        loadData(user.uid);
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadData = async (userId: string) => {
    try {
      const courseName = 'Ηλεκτροτεχνία Γ\' ΕΠΑΛ';

      const [chaptersData, lessonsData, progressData] = await Promise.all([
        courseService.getChapters(courseName),
        courseService.getLessons(),
        courseService.getUserProgress(userId),
      ]);

      console.log('Chapters loaded:', chaptersData);
      console.log('Lessons loaded:', lessonsData);

      setChapters(chaptersData);
      setLessons(lessonsData);
      setUserProgress(progressData);

      if (lessonsData && lessonsData.length > 0) {
        const firstLesson = lessonsData[0];
        setSelectedLesson(firstLesson);
        loadQuizQuestions(firstLesson.id);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadQuizQuestions = async (lessonId: string) => {
    try {
      const questions = await courseService.getQuizQuestions(lessonId);
      setQuizQuestions(questions);
    } catch (error) {
      console.error('Error loading quiz questions:', error);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    loadQuizQuestions(lesson.id);
    setActiveTab('theory');
    setSidebarOpen(false);
  };

  const handleMarkComplete = async () => {
    if (!currentUser || !selectedLesson) return;

    try {
      await courseService.markLessonComplete(currentUser.uid, selectedLesson.id);

      const newProgress = new Map(userProgress);
      newProgress.set(selectedLesson.id, {
        lessonId: selectedLesson.id,
        completed: true,
        completedAt: new Date(),
      });
      setUserProgress(newProgress);
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const getLessonsByChapter = (chapterId: string) => {
    return lessons.filter((l) => l.chapterId === chapterId);
  };

  const isLessonComplete = (lessonId: string) => {
    return userProgress.get(lessonId)?.completed || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Φόρτωση...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-blue-900 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-blue-900 mb-2">
            Απαιτείται Σύνδεση
          </h2>
          <p className="text-gray-600 mb-4">
            Παρακαλώ συνδεθείτε για να έχετε πρόσβαση στα μαθήματα
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            Επιστροφή στην Αρχική
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <Link href="/dashboard" className="cursor-pointer">
                <h1 className="text-xl font-bold text-blue-900 hover:text-blue-700 transition-colors">
                  EduPlatform
                </h1>
              </Link>
            </div>
            <div className="text-sm text-gray-600">{currentUser.email}</div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out flex flex-col mt-16 lg:mt-0`}
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-blue-900">
              Ηλεκτροτεχνία Γ' ΕΠΑΛ
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {chapters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  Δεν υπάρχουν διαθέσιμα κεφάλαια
                </p>
              </div>
            ) : (
              chapters.map((chapter) => {
                const chapterLessons = getLessonsByChapter(chapter.id);
                const completedCount = chapterLessons.filter((l) =>
                  isLessonComplete(l.id)
                ).length;

                return (
                  <div key={chapter.id} className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {chapter.title}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {completedCount}/{chapterLessons.length}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {chapterLessons.map((lesson) => {
                        const isComplete = isLessonComplete(lesson.id);
                        const isSelected = selectedLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonSelect(lesson)}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                              isSelected
                                ? 'bg-blue-50 border border-blue-200'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            )}
                            <span
                              className={`text-sm ${
                                isSelected
                                  ? 'font-semibold text-blue-900'
                                  : 'text-gray-700'
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden mt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {chapters.length === 0 && lessons.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center max-w-md">
                <BookOpen className="w-16 h-16 text-blue-900 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Δεν υπάρχουν διαθέσιμα μαθήματα
                </h2>
                <p className="text-gray-600 mb-6">
                  Τα δεδομένα του μαθήματος δεν έχουν αρχικοποιηθεί ακόμα. Κάντε κλικ στο κουμπί παρακάτω για να ξεκινήσετε.
                </p>
                <Link
                  href="/init-data"
                  className="inline-block px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
                >
                  Αρχικοποίηση Δεδομένων
                </Link>
              </div>
            </div>
          ) : selectedLesson ? (
            <div className="max-w-4xl mx-auto p-6">
              {/* Lesson Header */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-blue-900 mb-2">
                      {selectedLesson.title}
                    </h1>
                    {userProgress.get(selectedLesson.id)?.completed && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Award className="w-5 h-5" />
                        <span className="text-sm font-medium">Ολοκληρωμένο</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleMarkComplete}
                    disabled={userProgress.get(selectedLesson.id)?.completed}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      userProgress.get(selectedLesson.id)?.completed
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {userProgress.get(selectedLesson.id)?.completed
                      ? 'Ολοκληρωμένο'
                      : 'Σημείωση ως Ολοκληρωμένο'}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('theory')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                      activeTab === 'theory'
                        ? 'text-blue-900 border-blue-900'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Θεωρία
                  </button>
                  <button
                    onClick={() => setActiveTab('quiz')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                      activeTab === 'quiz'
                        ? 'text-blue-900 border-blue-900'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                    }`}
                  >
                    Ασκήσεις
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'theory' ? (
                <TheoryTab content={selectedLesson.theoryContent} />
              ) : (
                <QuizTab questions={quizQuestions} />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Επιλέξτε ένα μάθημα για να ξεκινήσετε</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TheoryTab({ content }: { content: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div
        className="prose prose-slate max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}

function QuizTab({ questions }: { questions: QuizQuestion[] }) {
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, number>>(
    new Map()
  );
  const [showExplanations, setShowExplanations] = useState<Set<string>>(new Set());

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    const newAnswers = new Map(selectedAnswers);
    newAnswers.set(questionId, answerIndex);
    setSelectedAnswers(newAnswers);
  };

  const toggleExplanation = (questionId: string) => {
    const newExplanations = new Set(showExplanations);
    if (newExplanations.has(questionId)) {
      newExplanations.delete(questionId);
    } else {
      newExplanations.add(questionId);
    }
    setShowExplanations(newExplanations);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">
          Δεν υπάρχουν διαθέσιμες ασκήσεις για αυτό το μάθημα
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {questions.map((question, qIndex) => {
        const selectedAnswer = selectedAnswers.get(question.id);
        const isAnswered = selectedAnswer !== undefined;
        const isCorrect = selectedAnswer === question.correctAnswer;

        return (
          <div
            key={question.id}
            className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-900"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {qIndex + 1}. {question.question}
            </h3>

            <div className="space-y-3 mb-4">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const showFeedback = isAnswered;

                let optionClass = 'border-gray-200 hover:border-blue-300';
                if (showFeedback) {
                  if (isSelected && isCorrect) {
                    optionClass = 'border-green-500 bg-green-50';
                  } else if (isSelected && !isCorrect) {
                    optionClass = 'border-red-500 bg-red-50';
                  } else if (isCorrectAnswer) {
                    optionClass = 'border-green-500 bg-green-50';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(question.id, index)}
                    disabled={isAnswered}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionClass} ${
                      isAnswered ? 'cursor-default' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? showFeedback && isCorrect
                              ? 'border-green-500 bg-green-500'
                              : showFeedback && !isCorrect
                              ? 'border-red-500 bg-red-500'
                              : 'border-blue-900 bg-blue-900'
                            : 'border-gray-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-4">
                <div
                  className={`p-4 rounded-lg ${
                    isCorrect ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <p
                    className={`font-medium ${
                      isCorrect ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {isCorrect ? 'Σωστή απάντηση!' : 'Λάθος απάντηση'}
                  </p>
                </div>

                <button
                  onClick={() => toggleExplanation(question.id)}
                  className="mt-3 text-blue-900 font-medium hover:underline"
                >
                  {showExplanations.has(question.id)
                    ? 'Απόκρυψη Εξήγησης'
                    : 'Δείτε την Εξήγηση'}
                </button>

                {showExplanations.has(question.id) && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-800">{question.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
