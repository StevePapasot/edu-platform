'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, Loader2, Users, BookOpen, Trophy, Activity,
  Search, ArrowUpDown, BarChart3, TrendingUp, GraduationCap
} from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { greekEducationData } from '@/src/data/greekEducation';
import toast from 'react-hot-toast';

interface StudentRow {
  uid: string;
  email: string;
  grade: string;
  gradeName: string;
  lessonsCompleted: number;
  quizAverage: number | null;
  quizCount: number;
  lastActivity: Date | null;
}

interface CourseStats {
  id: string;
  title: string;
  gradeId: string;
  totalLessons: number;
  completions: number;
  avgProgress: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [courseStats, setCourseStats] = useState<CourseStats[]>([]);
  const [totalLessonsInOrg, setTotalLessonsInOrg] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'email' | 'lessonsCompleted' | 'quizAverage' | 'lastActivity'>('lessonsCompleted');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 20;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/'); return; }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) { router.push('/'); return; }

        const userData = userDoc.data();
        const role = userData.role;
        if (role !== 'admin' && role !== 'superAdmin') {
          router.push('/dashboard');
          return;
        }

        const currentOrgId = userData.orgId;
        if (!currentOrgId) {
          toast.error('Δεν βρέθηκε οργανισμός.');
          router.push('/admin');
          return;
        }

        setOrgId(currentOrgId);

        // Fetch org name
        const orgSnap = await getDocs(query(collection(db, 'organizations'), where('orgId', '==', currentOrgId)));
        if (!orgSnap.empty) setOrgName(orgSnap.docs[0].data().name);

        // Fetch all data in parallel
        const [studentsSnap, coursesSnap, lessonsSnap, progressSnap] = await Promise.all([
          getDocs(query(collection(db, 'users'), where('orgId', '==', currentOrgId), where('role', '==', 'student'))),
          getDocs(query(collection(db, 'courses'), where('orgId', '==', currentOrgId))),
          getDocs(query(collection(db, 'lessons'), where('orgId', '==', currentOrgId))),
          // We need all progress — fetch by each course
          Promise.resolve(null) // placeholder, we'll handle below
        ]);

        const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        const lessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
        setTotalLessonsInOrg(lessons.length);

        // Fetch all progress for org's courses (batch in groups of 30 for 'in' query limit)
        const courseIds = courses.map(c => c.id);
        let allProgress: any[] = [];

        if (courseIds.length > 0) {
          // Batch courseIds in groups of 30 (Firestore 'in' limit)
          for (let i = 0; i < courseIds.length; i += 30) {
            const batch = courseIds.slice(i, i + 30);
            const progressBatchSnap = await getDocs(
              query(collection(db, 'userProgress'), where('courseId', 'in', batch))
            );
            allProgress.push(...progressBatchSnap.docs.map(d => ({ id: d.id, ...d.data() })));
          }
        }

        // Build student rows
        const studentRows: StudentRow[] = studentsSnap.docs.map(sDoc => {
          const sData = sDoc.data();
          const studentProgress = allProgress.filter(p => p.userId === sDoc.id);

          // Quiz stats
          const quizAttempts = studentProgress
            .filter(p => p.quizAttempt && p.quizAttempt.percentage !== undefined)
            .map(p => p.quizAttempt.percentage);

          const quizAvg = quizAttempts.length > 0
            ? Math.round(quizAttempts.reduce((a: number, b: number) => a + b, 0) / quizAttempts.length)
            : null;

          // Last activity
          const timestamps = studentProgress
            .filter(p => p.completedAt)
            .map(p => {
              const ts = p.completedAt;
              if (ts?.toDate) return ts.toDate();
              if (ts?.seconds) return new Date(ts.seconds * 1000);
              return null;
            })
            .filter(Boolean) as Date[];

          const lastActivity = timestamps.length > 0
            ? new Date(Math.max(...timestamps.map(t => t.getTime())))
            : null;

          // Grade display name
          let gradeName = sData.grade || '-';
          const cat = greekEducationData.find(c => c.id === sData.schoolType);
          if (cat) {
            const grd = cat.grades.find(g => g.id === sData.grade);
            if (grd) gradeName = `${cat.name} - ${grd.name}`;
          }

          return {
            uid: sDoc.id,
            email: sData.email || '-',
            grade: sData.grade || '-',
            gradeName,
            lessonsCompleted: studentProgress.length,
            quizAverage: quizAvg,
            quizCount: quizAttempts.length,
            lastActivity
          };
        });

        setStudents(studentRows);

        // Build course stats
        const cStats: CourseStats[] = courses.map(course => {
          const courseLessons = lessons.filter(l => l.courseId === course.id);
          const courseProgress = allProgress.filter(p => p.courseId === course.id);

          // Unique students who completed at least 1 lesson in this course
          const uniqueStudents = new Set(courseProgress.map(p => p.userId));

          // Avg progress per student
          let avgProgress = 0;
          if (courseLessons.length > 0 && uniqueStudents.size > 0) {
            const totalPct = Array.from(uniqueStudents).reduce((sum, uid) => {
              const completed = courseProgress.filter(p => p.userId === uid).length;
              return sum + Math.round((completed / courseLessons.length) * 100);
            }, 0);
            avgProgress = Math.round(totalPct / uniqueStudents.size);
          }

          return {
            id: course.id,
            title: course.title,
            gradeId: course.gradeId,
            totalLessons: courseLessons.length,
            completions: courseProgress.length,
            avgProgress
          };
        });

        setCourseStats(cStats);

      } catch (error) {
        console.error('Analytics fetch error:', error);
        toast.error('Σφάλμα φόρτωσης δεδομένων.');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Sorting
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
    setCurrentPage(1);
  };

  // Filtered + sorted students
  const filteredStudents = students
    .filter(s => s.email.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'email': aVal = a.email; bVal = b.email; break;
        case 'lessonsCompleted': aVal = a.lessonsCompleted; bVal = b.lessonsCompleted; break;
        case 'quizAverage': aVal = a.quizAverage ?? -1; bVal = b.quizAverage ?? -1; break;
        case 'lastActivity': aVal = a.lastActivity?.getTime() ?? 0; bVal = b.lastActivity?.getTime() ?? 0; break;
      }
      if (sortField === 'email') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );

  // Overview stats
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.lessonsCompleted > 0).length;
  const totalCompletions = students.reduce((sum, s) => sum + s.lessonsCompleted, 0);
  const allQuizAvgs = students.filter(s => s.quizAverage !== null).map(s => s.quizAverage!);
  const orgQuizAvg = allQuizAvgs.length > 0
    ? Math.round(allQuizAvgs.reduce((a, b) => a + b, 0) / allQuizAvgs.length)
    : null;

  if (loading) return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-500 font-bold">Φόρτωση Analytics...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans">

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/admin')} className="p-2 -ml-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Teacher Analytics</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{orgName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* OVERVIEW CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Μαθητές</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{totalStudents}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{activeStudents} ενεργοί</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ολοκληρώσεις</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{totalCompletions}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">από {totalLessonsInOrg} ενότητες</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <Trophy className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quiz μ.ο.</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{orgQuizAvg !== null ? `${orgQuizAvg}%` : '-'}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">{allQuizAvgs.length} quiz γραμμένα</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ενεργοί</span>
            </div>
            <p className="text-4xl font-black text-slate-900">{totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0}%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">ολοκλήρωσαν ≥1 ενότητα</p>
          </div>
        </div>

        {/* COURSE STATS */}
        <div className="mb-10">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Στατιστικά ανά Μάθημα
          </h2>
          {courseStats.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <p className="text-slate-500 font-medium">Δεν υπάρχουν μαθήματα ακόμα.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseStats.map(cs => (
                <div key={cs.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-black text-slate-800 leading-snug">{cs.title}</h4>
                      <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{cs.gradeId}</span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Ενότητες</span>
                      <span className="font-black text-slate-700">{cs.totalLessons}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Ολοκληρώσεις</span>
                      <span className="font-black text-slate-700">{cs.completions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Μ.Ο. Πρόοδος</span>
                      <span className="font-black text-blue-600">{cs.avgProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-1">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${cs.avgProgress}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* STUDENT TABLE */}
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <GraduationCap className="w-5 h-5 text-indigo-500" />
              Πίνακας Μαθητών
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Αναζήτηση email..."
                className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium w-64"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">
                {searchTerm ? 'Δεν βρέθηκαν μαθητές.' : 'Δεν υπάρχουν μαθητές στον οργανισμό ακόμα.'}
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left px-6 py-4">
                          <button onClick={() => toggleSort('email')} className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700">
                            Email <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-left px-4 py-4">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Τάξη</span>
                        </th>
                        <th className="text-center px-4 py-4">
                          <button onClick={() => toggleSort('lessonsCompleted')} className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 mx-auto">
                            Ενότητες <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-center px-4 py-4">
                          <button onClick={() => toggleSort('quizAverage')} className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 mx-auto">
                            Quiz μ.ο. <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                        <th className="text-right px-6 py-4">
                          <button onClick={() => toggleSort('lastActivity')} className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-700 ml-auto">
                            Τελ. Δραστηριότητα <ArrowUpDown className="w-3 h-3" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedStudents.map((s, idx) => (
                        <tr key={s.uid} className={`border-b border-slate-50 hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-50/30'}`}>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700 text-sm">{s.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{s.gradeName}</span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`text-sm font-black ${s.lessonsCompleted > 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                              {s.lessonsCompleted}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            {s.quizAverage !== null ? (
                              <span className={`text-sm font-black px-2.5 py-1 rounded-lg ${
                                s.quizAverage >= 80 ? 'bg-green-50 text-green-700' :
                                s.quizAverage >= 60 ? 'bg-blue-50 text-blue-700' :
                                s.quizAverage >= 40 ? 'bg-amber-50 text-amber-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {s.quizAverage}%
                              </span>
                            ) : (
                              <span className="text-sm text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-xs font-medium text-slate-500">
                              {s.lastActivity
                                ? s.lastActivity.toLocaleDateString('el-GR', { day: 'numeric', month: 'short', year: 'numeric' })
                                : '-'
                              }
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-xs font-bold text-slate-400">
                    {filteredStudents.length} μαθητές — σελίδα {currentPage} από {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                    >
                      Προηγ.
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-all"
                    >
                      Επόμ.
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </div>
  );
}