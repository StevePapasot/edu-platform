'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ChevronLeft, BookOpen, Loader2, Lock, FileText, Youtube, HelpCircle, CheckCircle2, Download } from 'lucide-react';
import Link from 'next/link';
import { QuizPlayer } from '@/src/components/QuizPlayer';

export default function LessonStudyPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [lesson, setLesson] = useState<any>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }
      setUserId(user.uid);

      try {
        const lessonRef = doc(db, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);

        if (!lessonSnap.exists()) {
          setLoading(false);
          return;
        }

        const lessonData = lessonSnap.data();
        setCourseId(lessonData.courseId);

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userOrgId = (userDoc.exists() && userDoc.data().orgId) 
          ? userDoc.data().orgId 
          : null;
        const userRole = userDoc.data()?.role;

        if (
          lessonData.orgId !== userOrgId &&
          userRole !== 'admin' &&
          userRole !== 'superAdmin'
        ) {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        const progressRef = doc(db, 'userProgress', `${user.uid}_${lessonId}`);
        const progressSnap = await getDoc(progressRef);
        setIsCompleted(progressSnap.exists());

        setAuthorized(true);
        setLesson({ id: lessonSnap.id, ...lessonData });

      } catch (error) {
        console.error("Error fetching lesson:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [lessonId, router]);

  const toggleComplete = async () => {
    if (!userId || !lesson) return;
    setCompleting(true);
    
    const progressRef = doc(db, 'userProgress', `${userId}_${lessonId}`);

    try {
      if (isCompleted) {
        await deleteDoc(progressRef);
        setIsCompleted(false);
      } else {
        await setDoc(progressRef, {
          userId,
          lessonId,
          courseId: lesson.courseId,
          completed: true,
          completedAt: serverTimestamp()
        });
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  if (!authorized || !lesson) return <div className="p-20 text-center font-bold">Δεν έχετε πρόσβαση.</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={courseId ? `/dashboard/course/${courseId}` : '/dashboard'} className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              {lesson.type === 'quiz' ? <HelpCircle className="w-5 h-5 text-amber-600" /> 
               : lesson.type === 'pdf' ? <FileText className="w-5 h-5 text-red-600" />
               : lesson.type === 'video' ? <Youtube className="w-5 h-5 text-red-500" />
               : <FileText className="w-5 h-5 text-indigo-600" />}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{lesson.title}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ενοτητα {lesson.order}</p>
            </div>
          </div>

          {isCompleted && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full border border-green-100">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-wider">Ολοκληρωθηκε</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* VIDEO */}
        {lesson.type === 'video' && (
          <div className="bg-slate-900 rounded-3xl p-8 text-center mt-8">
            <Youtube className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <a href={lesson.content} target="_blank" rel="noreferrer" className="text-blue-400 underline font-medium">Άνοιγμα Βίντεο</a>
          </div>
        )}

        {/* PDF */}
        {lesson.type === 'pdf' && (
          <div className="mt-8 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <iframe
                src={lesson.content}
                className="w-full h-[80vh] border-0"
                title={lesson.title}
              />
            </div>
            <div className="flex justify-center">
              
                href={lesson.content}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-lg"
              >
                <Download className="w-5 h-5" />
                ΚΑΤΕΒΑΣΜΑ PDF
              </a>
            </div>
          </div>
        )}

        {/* QUIZ */}
        {lesson.type === 'quiz' && userId && (
          <div className="mt-8">
            {Array.isArray(lesson.questions) && lesson.questions.length > 0 ? (
              <QuizPlayer 
                lessonId={lesson.id}
                courseId={lesson.courseId}
                userId={userId}
                questions={lesson.questions}
                onComplete={() => setIsCompleted(true)}
              />
            ) : (
              <div className="bg-amber-50 border-2 border-dashed border-amber-200 rounded-3xl p-12 text-center">
                <HelpCircle className="w-16 h-16 text-amber-400 mx-auto mb-4" />
                <p className="font-black text-amber-700 text-xl">Το Quiz δεν έχει ερωτήσεις ακόμα.</p>
                <p className="text-amber-600 font-medium mt-2">Επικοινώνησε με τον καθηγητή σου.</p>
              </div>
            )}
          </div>
        )}

        {/* TEXT (default) */}
        {(lesson.type === 'text' || !lesson.type) && (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 mt-8">
            <div 
              className="prose max-w-none text-slate-700 leading-relaxed font-medium"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
          </div>
        )}

        {/* COMPLETE BUTTON — hidden for quiz (QuizPlayer handles its own completion) */}
        {lesson.type !== 'quiz' && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={toggleComplete}
              disabled={completing}
              className={`
                flex items-center gap-3 px-10 py-5 rounded-2xl font-black transition-all transform hover:-translate-y-1 active:scale-95 shadow-xl
                ${isCompleted 
                  ? 'bg-white text-green-600 border-2 border-green-500 shadow-green-100' 
                  : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}
              `}
            >
              {completing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
              {isCompleted ? 'ΟΛΟΚΛΗΡΩΜΕΝΗ (ΚΛΙΚ ΓΙΑ ΑΚΥΡΩΣΗ)' : 'ΜΑΡΚΑΡΙΣΜΑ ΩΣ ΟΛΟΚΛΗΡΩΜΕΝΗ'}
            </button>
          </div>
        )}

      </main>
    </div>
  );
}