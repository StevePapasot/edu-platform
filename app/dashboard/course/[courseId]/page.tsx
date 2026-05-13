'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ChevronLeft, BookOpen, Layers, PlayCircle, FileText, Loader2, Lock, ChevronDown, ChevronUp, Video } from 'lucide-react';
import Link from 'next/link';

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);

        if (!courseSnap.exists()) {
          setLoading(false);
          return; 
        }

        const courseData = courseSnap.data();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        // ΔΙΟΡΘΩΣΗ 1: Ασφαλής ανάγνωση του orgId με fallback
        const userOrgId = (userDoc.exists() && userDoc.data().orgId) ? userDoc.data().orgId : null;

        if (!userOrgId && userDoc.data()?.role !== 'superAdmin') {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        if (courseData.orgId !== userOrgId && userDoc.data()?.role !== 'admin') {
          setAuthorized(false);
          setLoading(false);
          return;
        }

        setAuthorized(true);
        setCourse({ id: courseSnap.id, ...courseData });

        // ΔΙΟΡΘΩΣΗ 2: Προσθήκη του orgId στα queries για να τα επιτρέψει το Firebase
        const chaptersQ = query(
          collection(db, 'chapters'), 
          where("courseId", "==", courseId),
          where("orgId", "==", userOrgId)
        );
        const chaptersSnap = await getDocs(chaptersQ);
        const fetchedChapters = chaptersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedChapters.sort((a: any, b: any) => a.order - b.order); 
        setChapters(fetchedChapters);

        const lessonsQ = query(
          collection(db, 'lessons'), 
          where("courseId", "==", courseId),
          where("orgId", "==", userOrgId)
        );
        const lessonsSnap = await getDocs(lessonsQ);
        const fetchedLessons = lessonsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        fetchedLessons.sort((a: any, b: any) => a.order - b.order);
        setLessons(fetchedLessons);

        if (fetchedChapters.length > 0) {
          setOpenChapterId(fetchedChapters[0].id);
        }

      } catch (error) {
        console.error("Error fetching course data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [courseId, router]);

  const toggleChapter = (chapterId: string) => {
    setOpenChapterId(openChapterId === chapterId ? null : chapterId);
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  if (!authorized || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center">
          <Lock className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Δεν υπάρχει πρόσβαση</h2>
          <p className="text-slate-500 mb-8 font-medium">Το μάθημα δεν βρέθηκε ή δεν έχετε δικαίωμα προβολής.</p>
          <Link href="/dashboard" className="inline-block px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold">Επιστροφή</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* HEADER ΜΑΘΗΜΑΤΟΣ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <ChevronLeft className="w-6 h-6" />
            </Link>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{course.title}</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Επισκοπηση Υλης</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-500" /> 
            Ύλη Μαθήματος
          </h2>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 border-dashed p-16 text-center">
            <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Άδειο Μάθημα</h3>
            <p className="text-slate-500 font-medium">Ο καθηγητής δεν έχει ανεβάσει ακόμα ύλη.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {chapters.map((chapter) => {
              const chapterLessons = lessons.filter(l => l.chapterId === chapter.id);
              const isOpen = openChapterId === chapter.id;

              return (
                <div key={chapter.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* ΚΕΦΑΛΑΙΟ (Κλικ για άνοιγμα/κλείσιμο) */}
                  <div 
                    onClick={() => toggleChapter(chapter.id)}
                    className="p-6 cursor-pointer flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-slate-200 text-slate-500'}`}>
                        <span className="font-black">{chapter.order || '-'}</span>
                      </div>
                      <div>
                        <h3 className={`text-lg font-bold transition-colors ${isOpen ? 'text-blue-700' : 'text-slate-800'}`}>
                          {chapter.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">
                          {chapterLessons.length} Ενοτητες
                        </p>
                      </div>
                    </div>
                    <div className="p-2 text-slate-400">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* ΕΝΟΤΗΤΕΣ */}
                  {isOpen && (
                    <div className="border-t border-slate-100 bg-white">
                      {chapterLessons.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-sm font-medium">
                          Δεν υπάρχουν ενότητες σε αυτό το κεφάλαιο.
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {chapterLessons.map((lesson, idx) => (
                            <Link 
                              key={lesson.id}
                              href={`/dashboard/lesson/${lesson.id}`}
                              className={`p-5 flex items-center justify-between hover:bg-blue-50/50 transition-colors group text-left ${idx !== chapterLessons.length - 1 ? 'border-b border-slate-50' : ''}`}
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-slate-100 text-slate-400 rounded-xl group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                                  {lesson.type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-700 group-hover:text-blue-700 transition-colors">
                                    {lesson.order ? `${lesson.order}. ` : ''}{lesson.title}
                                  </h4>
                                </div>
                              </div>
                              <PlayCircle className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}