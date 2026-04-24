'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Target, Video, Lightbulb, LogOut, Settings, Bell, ExternalLink,
  ShieldAlert, ChevronRight, BookOpen, GraduationCap, UserCog,
  Loader2, Gift, MonitorPlay, Award, Palette, ShieldCheck, X,
  Trophy, CheckCircle2, XCircle, RotateCcw, ChevronLeft, Compass
} from 'lucide-react';a

import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, getCountFromServer } from 'firebase/firestore';
import { greekEducationData, type Grade } from '@/src/data/greekEducation';
import { SubjectCard } from '@/src/components/SubjectCard';
import { SettingsModal } from '@/src/components/SettingsModal';

const challengesData = [
  { category: "Μαθηματικά", q: "Η εξίσωση ax² + bx + c = 0 (a≠0) έχει δύο άνισες πραγματικές ρίζες όταν:", options: ["Δ = 0", "Δ > 0", "Δ < 0", "Δ ≥ 0"], correct: 1 },
  { category: "Μαθηματικά", q: "Το ανάπτυγμα της ταυτότητας (a - b)² είναι:", options: ["a² - b²", "a² + 2ab + b²", "a² - 2ab + b²", "a² + b²"], correct: 2 },
  { category: "Φυσική", q: "Σύμφωνα με τον 2ο Νόμο του Νεύτωνα, η συνισταμένη των δυνάμεων που ασκούνται σε ένα σώμα ισούται με:", options: ["m · u", "m · a", "m · g · h", "½ m · u²"], correct: 1 },
  { category: "Βιολογία", q: "Ποιο κυτταρικό οργανίδιο αποτελεί το «εργοστάσιο παραγωγής ενέργειας» του κυττάρου;", options: ["Πυρήνας", "Ριβόσωμα", "Μιτοχόνδριο", "Σύμπλεγμα Golgi"], correct: 2 },
  { category: "Χημεία", q: "Ποιο είναι το pH ενός απολύτως ουδέτερου υδατικού διαλύματος στους 25°C;", options: ["0", "7", "14", "10"], correct: 1 }
];

const affiliatePartners = [
  { name: 'Udemy', description: 'Μάθε προγραμματισμό και νέες δεξιότητες.', url: 'https://www.udemy.com/?aff=YOUR_LINK', color: 'from-purple-600 to-indigo-600', icon: MonitorPlay },
  { name: 'Coursera', description: 'Πιστοποιήσεις από κορυφαία πανεπιστήμια.', url: 'https://www.coursera.org/?aff=YOUR_LINK', color: 'from-blue-600 to-cyan-600', icon: Award },
  { name: 'Canva Pro', description: 'Φτιάξε εύκολα τις καλύτερες εργασίες.', url: 'https://www.canva.com/?aff=YOUR_LINK', color: 'from-pink-500 to-rose-500', icon: Palette },
  { name: 'NordVPN', description: 'Ασφαλές σερφάρισμα και προστασία.', url: 'https://nordvpn.com/?aff=YOUR_LINK', color: 'from-teal-500 to-emerald-600', icon: ShieldCheck }
];

const guidanceSlides = [
  {
    tag: 'ΟΔΗΓΟΣ', title: 'Πώς να χρησιμοποιήσεις την Πλατφόρμα', icon: Compass, color: 'text-blue-400',
    steps: [
      'Διάλεξε την τάξη και την κατεύθυνσή σου από το μενού της αρχικής σελίδας.',
      'Κάνε κλικ στο μάθημα που θέλεις για να δεις όλη την ύλη οργανωμένη σε κεφάλαια.',
      'Κάνε Εγγραφή (είναι δωρεάν), για να αποθηκεύεται η πρόοδός σου στο προσωπικό σου Dashboard!'
    ]
  },
  {
    tag: 'ΣΥΜΒΟΥΛΗ', title: 'Tips Διαβάσματος', icon: BookOpen, color: 'text-emerald-400',
    steps: [
      'Κάνε διαλείμματα. Δοκίμασε τον κανόνα "25 λεπτά διάβασμα, 5 λεπτά διάλειμμα".',
      'Μην παπαγαλίζεις! Προσπάθησε να εξηγήσεις αυτό που διάβασες με δικά σου λόγια.',
      'Κλείσε το κινητό ή βάλ\' το σε άλλο δωμάτιο όσο διαβάζεις για συγκέντρωση.'
    ]
  }
];

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('EduPlatform');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrgActive, setIsOrgActive] = useState(true);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [orgCourses, setOrgCourses] = useState<any[]>([]); 

  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  
  const [newsfeed, setNewsfeed] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [currentGuidanceSlide, setCurrentGuidanceSlide] = useState(0); 
  const [isChallengesModalOpen, setIsChallengesModalOpen] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Single read — derive everything from one document
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (!userDocSnap.exists()) {
            router.push('/');
            return;
          }
          const userData = userDocSnap.data();
          const userRole = userData.role || 'student';
          const currentOrgId = userData.orgId || 'default-org';

          const profile = {
            uid: userData.uid,
            email: userData.email,
            role: userRole,
            schoolType: userData.schoolType,
            grade: userData.grade,
            orientation: userData.orientation,
            sector: userData.sector,
            orgId: currentOrgId,
            createdAt: userData.createdAt,
            progress: userData.progress || {},
          };

          setUserProfile(profile);
          setIsAdmin(userRole === 'admin' || userRole === 'superAdmin');

          if (currentOrgId) {
            const orgsRef = collection(db, 'organizations');
            const qOrg = query(orgsRef, where("orgId", "==", currentOrgId));
            const orgSnap = await getDocs(qOrg);

            if (!orgSnap.empty) {
              const orgData = orgSnap.docs[0].data();
              setOrgName(orgData.name); 
              if (orgData.status !== 'active') { setIsOrgActive(false); setLoading(false); return; }
            }

            const [coursesSnap, progressSnap] = await Promise.all([
  getDocs(query(collection(db, 'courses'), where("orgId", "==", currentOrgId))),
  getDocs(query(collection(db, 'userProgress'), where("userId", "==", user.uid)))
]);

// Count lessons per course using getCountFromServer — no content downloaded
const fetchedCourses = await Promise.all(
  coursesSnap.docs.map(async (courseDoc) => {
    const courseData = courseDoc.data();
    const lessonCountSnap = await getCountFromServer(
      query(collection(db, 'lessons'), where("courseId", "==", courseDoc.id))
    );
    const total = lessonCountSnap.data().count;
    const completedCount = progressSnap.docs.filter(
      p => p.data().courseId === courseDoc.id
    ).length;
    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
    return { id: courseDoc.id, ...courseData, progress: percentage };
  })
);
setOrgCourses(fetchedCourses);
          }

          // Set grade from profile
          if (profile.schoolType && profile.grade) {
            const category = greekEducationData.find(c => c.id === profile.schoolType);
            const grade = category?.grades.find(g => g.id === profile.grade || g.name === profile.grade);
            if (category && grade) {
              setSelectedGrade(grade);
              setSelectedOrientation(profile.orientation || null);
              setSelectedSector(profile.sector || null);
            } else { setSelectedGrade(greekEducationData[0].grades[0]); }
          } else { setSelectedGrade(greekEducationData[0].grades[0]); }

        } catch (error) { 
          console.error("Dashboard Fetch Error:", error); 
          setSelectedGrade(greekEducationData[0].grades[0]); 
        }
        setLoading(false);
      } else {
        router.push('/');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://www.esos.gr/rss.xml')}`);
        const data = await response.json();
        if (data.status === 'ok' && data.items) {
          setNewsfeed(data.items.slice(0, 4).map((item: any, idx: number) => ({
            id: idx, title: item.title,
            date: new Date(item.pubDate).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' }),
            link: item.link, type: item.title.toUpperCase().includes('ΕΚΤΑΚΤΟ') ? 'alert' : 'info'
          })));
        }
      } catch (e) { console.error(e); } finally { setLoadingNews(false); }
    };
    fetchLiveNews();
  }, []);

  const handleSignOut = async () => {
    try { await signOut(auth); router.push('/'); } catch (e) { console.error(e); }
  };

  const handleQuizAnswer = (i: number) => { if (showQuizResult) return; setSelectedAnswer(i); setShowQuizResult(true); if (i === challengesData[currentQuizIndex].correct) setQuizScore(p => p + 1); };
  const handleNextQuizQuestion = () => { if (currentQuizIndex < challengesData.length - 1) { setCurrentQuizIndex(p => p + 1); setSelectedAnswer(null); setShowQuizResult(false); } else { setQuizFinished(true); } };
  const resetQuiz = () => { setCurrentQuizIndex(0); setQuizScore(0); setSelectedAnswer(null); setShowQuizResult(false); setQuizFinished(false); };
  const handleNextSlide = () => setCurrentGuidanceSlide(p => p === guidanceSlides.length - 1 ? 0 : p + 1);
  const handlePrevSlide = () => setCurrentGuidanceSlide(p => p === 0 ? guidanceSlides.length - 1 : p - 1);

  const userEmail = currentUser?.email || '';
  const rawName = userEmail.split('@')[0];
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';
  
  const displayCourses = orgCourses.filter(course => 
    course.gradeId === selectedGrade?.id || course.gradeId === selectedGrade?.name || course.gradeId === selectedGrade?.displayName
  );
  
  const completedCoursesCount = displayCourses.filter(c => c.progress === 100).length;

  if (!isOrgActive) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-red-100">
          <ShieldAlert className="w-20 h-20 text-red-600 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 mb-4">Πρόσβαση σε Αναστολή</h2>
          <button onClick={handleSignOut} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Επιστροφή</button>
        </div>
      </div>
    );
  }

  if (loading || !selectedGrade) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans relative selection:bg-blue-500/30">
      
      <div className="fixed top-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/50 sticky top-0 z-[9999] w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button onClick={() => router.push('/')} className="cursor-pointer relative z-50 bg-transparent border-none p-0 flex items-center group">
              <h1 className="text-2xl font-black text-blue-900 group-hover:text-blue-700 transition-colors tracking-tight">EduPlatform</h1>
            </button>
            <div className="flex items-center gap-4 relative z-50">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Συνδεδεμένος ως</span>
                <span className="text-sm font-bold text-slate-700">{userEmail}</span>
              </div>
              <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-slate-100 hover:text-blue-600 rounded-lg transition-all group cursor-pointer active:scale-95">
                <UserCog className="w-4 h-4 group-hover:rotate-12 transition-transform" /><span className="hidden sm:inline">Ρυθμίσεις</span>
              </button>
              {isAdmin && (
                <button onClick={() => router.push('/admin')} className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-sm cursor-pointer active:scale-95">
                  <Settings className="w-4 h-4" /><span className="hidden sm:inline">Admin Panel</span>
                </button>
              )}
              <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all group cursor-pointer active:scale-95">
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform" /><span className="hidden sm:inline">Αποσύνδεση</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <div className="mb-10 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Καλώς ήρθες, <span className="text-blue-600">{displayName}</span>! 👋</h2>
            <p className="text-lg text-gray-500 font-medium">Τάξη: <span className="text-indigo-600 font-bold">{selectedGrade.displayName || selectedGrade.name}</span></p>
            <div className="flex items-center gap-2 mt-4">
              <div className="bg-slate-100 px-3 py-1 rounded-lg"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">{orgName || 'ΕΚΠΑΙΔΕΥΤΙΚΟΣ ΟΡΓΑΝΙΣΜΟΣ'}</span></div>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-emerald-700 uppercase">Active Profile</span>
              </div>
            </div>
          </div>
          <div className="relative z-10 bg-blue-600 px-8 py-6 rounded-3xl border border-blue-400 shadow-xl shadow-blue-100 text-white min-w-[240px]">
            <div className="text-xs font-bold opacity-80 mb-1 uppercase tracking-widest">ΣΗΜΕΡΙΝΟΣ ΣΤΟΧΟΣ</div>
            <div className="text-3xl font-black tracking-tighter">
              {completedCoursesCount} / {displayCourses.length} <span className="text-lg font-medium opacity-90 ml-1">Μαθήματα</span>
            </div>
            <div className="mt-3 w-full bg-blue-400/30 h-1.5 rounded-full overflow-hidden">
              <div className="bg-white h-full transition-all duration-1000" style={{ width: `${displayCourses.length > 0 ? (completedCoursesCount / displayCourses.length) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            
            {selectedGrade.orientations && selectedGrade.orientations.length > 0 && (
              <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4"><GraduationCap className="w-5 h-5 text-blue-600" /><label className="text-sm font-black text-blue-900 uppercase tracking-wider">Επίλεξε την Κατεύθυνσή σου:</label></div>
                <div className="flex flex-wrap gap-2">
                  {selectedGrade.orientations.map(o => (
                    <button key={o.id} onClick={() => setSelectedOrientation(o.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${selectedOrientation === o.id ? 'bg-blue-900 text-white shadow-md transform scale-105' : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-900 border border-gray-200'}`}>{o.name}</button>
                  ))}
                </div>
              </div>
            )}

            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3"><BookOpen className="w-6 h-6 text-blue-600" />Τα Μαθήματά σου</h3>
                <div className="h-px flex-1 bg-slate-200 ml-6 hidden sm:block"></div>
              </div>
              
              {displayCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8 text-slate-300" /></div>
                  <h4 className="text-lg font-black text-slate-700 mb-2">Δεν υπάρχουν μαθήματα</h4>
                  <p className="text-slate-500 font-medium">Ο καθηγητής σου δεν έχει ανεβάσει ακόμα ύλη για την τάξη σου.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {displayCourses.map((course) => (
                    <div 
                      key={course.id} 
                      onClick={() => router.push(`/dashboard/course/${course.id}`)} 
                      className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <h4 className="text-lg font-black text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {course.title}
                        </h4>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>ΠΡΟΟΔΟΣ</span><span className="text-slate-600">{course.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="flex items-center gap-4"><div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Bell className="w-6 h-6" /></div><h3 className="text-xl font-black text-gray-900 tracking-tight uppercase">ΝΕΑ</h3></div>
              </div>
              <div className="space-y-4">
                {!loadingNews && newsfeed.map(news => (
                  <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="group block p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all duration-200 cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${news.type === 'alert' ? 'bg-red-500 shadow-red-200' : 'bg-sky-400 shadow-sky-200'}`} />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">{news.title}</h4>
                        <div className="flex items-center justify-between mt-1.5"><span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">{news.date}</span><ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-indigo-500 transition-colors" /></div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-xs font-black text-gray-400 mb-6 uppercase tracking-[0.2em] text-center border-b border-slate-50 pb-4">ΕΡΓΑΛΕΙΑ ΜΑΘΗΣΗΣ</h3>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => router.push('/dashboard/live')} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-slate-50 transition-all hover:shadow-md group w-full cursor-pointer">
                  <div className="bg-red-500 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Video className="w-5 h-5 text-white" /></div>
                  <span className="font-bold text-gray-700 text-left text-sm uppercase tracking-tight">ΖΩΝΤΑΝΑ ΜΑΘΗΜΑΤΑ</span><ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-600 transition-colors" />
                </button>
                <button onClick={() => { setIsChallengesModalOpen(true); resetQuiz(); }} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-slate-50 transition-all hover:shadow-md group w-full cursor-pointer">
                  <div className="bg-orange-500 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Target className="w-5 h-5 text-white" /></div>
                  <span className="font-bold text-gray-700 text-left text-sm uppercase tracking-tight">ΠΡΟΚΛΗΣΕΙΣ</span><ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-600 transition-colors" />
                </button>
                <button onClick={() => { setIsGuidanceModalOpen(true); setCurrentGuidanceSlide(0); }} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-slate-50 transition-all hover:shadow-md group w-full cursor-pointer">
                  <div className="bg-yellow-500 p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform"><Lightbulb className="w-5 h-5 text-white" /></div>
                  <span className="font-bold text-gray-700 text-left text-sm uppercase tracking-tight">ΚΑΘΟΔΗΓΗΣΗ</span><ChevronRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-600 transition-colors" />
                </button>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center justify-center gap-3 mb-6 relative z-10"><div className="p-2 bg-slate-800 rounded-lg"><Gift className="w-4 h-4 text-fuchsia-400" /></div><h3 className="text-xs font-black text-slate-300 uppercase tracking-widest">ΧΟΡΗΓΟΙ & ΠΡΟΣΦΟΡΕΣ</h3></div>
              <div className="grid grid-cols-1 gap-3 relative z-10">
                {affiliatePartners.map((partner, index) => {
                  const Icon = partner.icon;
                  return (
                    <a key={index} href={partner.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 transition-all duration-300 cursor-pointer">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${partner.color} text-white shadow-lg group-hover:scale-110 transition-transform`}><Icon className="w-5 h-5" /></div>
                      <div className="flex-1"><h4 className="text-sm font-bold text-slate-200 group-hover:text-white flex items-center gap-2">{partner.name}</h4><p className="text-[11px] font-medium text-slate-400 line-clamp-1">{partner.description}</p></div>
                      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-white" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12 border-t border-slate-200/60">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="space-y-2 text-center md:text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">EduPlatform Dashboard</p>
          </div>
          <a href="https://www.linkedin.com/in/stavros-papasotiropoulos-b35302200/" target="_blank" rel="noopener noreferrer" className="group relative block cursor-pointer">
            <div className="relative bg-white/80 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
               <div className="text-right">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Developed By</p>
                  <p className="text-xs font-black text-slate-800 group-hover:text-blue-600">Stavros Papasotiropoulos</p>
               </div>
               <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-xs group-hover:bg-blue-600 transition-colors">SP</div>
            </div>
          </a>
        </div>
      </footer>

      {isChallengesModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg transition-opacity" onClick={() => setIsChallengesModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl min-h-[500px] flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setIsChallengesModalOpen(false)} className="absolute -top-12 right-0 text-white/60 hover:text-white p-2 z-50 cursor-pointer"><X className="w-8 h-8" /></button>
            <div className="relative w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl p-8 sm:p-10 flex flex-col h-full">
              {!quizFinished ? (
                <>
                  <div className="flex items-center justify-between mb-8">
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-white font-bold">Ερώτηση {currentQuizIndex + 1} / {challengesData.length}</div>
                    <div className="bg-white/10 px-4 py-2 rounded-xl text-yellow-400 font-bold flex items-center gap-2"><Trophy className="w-4 h-4"/> Σκορ: {quizScore}</div>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">{challengesData[currentQuizIndex].q}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {challengesData[currentQuizIndex].options.map((opt, i) => {
                      const isSelected = selectedAnswer === i;
                      const isCorrect = challengesData[currentQuizIndex].correct === i;
                      let buttonStyle = "bg-white/5 hover:bg-white/10 border-white/10 text-white";
                      if (showQuizResult) {
                        if (isCorrect) buttonStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-300";
                        else if (isSelected) buttonStyle = "bg-rose-500/20 border-rose-500/50 text-rose-300";
                        else buttonStyle = "bg-white/5 border-white/5 text-white/30 opacity-50"; 
                      }
                      return (
                        <button key={i} onClick={() => handleQuizAnswer(i)} disabled={showQuizResult} className={`p-5 rounded-2xl border text-left font-bold transition-all duration-300 cursor-pointer ${buttonStyle}`}>
                          <div className="flex justify-between items-center"><span>{opt}</span>{showQuizResult && isCorrect && <CheckCircle2 className="w-5 h-5" />}{showQuizResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}</div>
                        </button>
                      );
                    })}
                  </div>
                  {showQuizResult && <button onClick={handleNextQuizQuestion} className="mt-8 bg-white text-slate-900 font-black px-8 py-3 rounded-full mx-auto block cursor-pointer hover:bg-slate-200">ΕΠΟΜΕΝΗ ΕΡΩΤΗΣΗ</button>}
                </>
              ) : (
                <div className="text-center py-10">
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h2 className="text-4xl font-black text-white mb-6">Τέλος! Σκορ: {quizScore}</h2>
                  <button onClick={resetQuiz} className="bg-white text-slate-900 px-10 py-4 rounded-full font-black cursor-pointer flex items-center justify-center gap-2 mx-auto hover:bg-slate-200"><RotateCcw className="w-5 h-5"/> ΠΑΙΞΕ ΞΑΝΑ</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isGuidanceModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={() => setIsGuidanceModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setIsGuidanceModalOpen(false)} className="absolute -top-12 right-0 text-white/60 p-2 cursor-pointer hover:text-white"><X className="w-8 h-8" /></button>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 text-white">
              <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
                {(() => { const Icon = guidanceSlides[currentGuidanceSlide]?.icon || Compass; return <Icon className={`w-8 h-8 ${guidanceSlides[currentGuidanceSlide].color}`} />; })()} 
                {guidanceSlides[currentGuidanceSlide].title}
              </h2>
              <ul className="space-y-5 text-white/90 font-medium text-lg leading-relaxed">
                {guidanceSlides[currentGuidanceSlide].steps?.map((step: string, i: number) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                    <p>{step}</p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-12">
                <button onClick={handlePrevSlide} className="p-4 bg-white/5 hover:bg-white/20 rounded-full cursor-pointer"><ChevronLeft /></button>
                <button onClick={handleNextSlide} className="p-4 bg-white/5 hover:bg-white/20 rounded-full cursor-pointer"><ChevronRight /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} userProfile={userProfile} userId={currentUser?.uid} onUpdate={() => router.refresh()} />
      )}
    </div>
  );
}