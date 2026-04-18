'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Target, Video, Lightbulb, User, LogOut, Settings, Bell, ExternalLink,
  LayoutDashboard, X, Compass, ChevronLeft, ChevronRight, Trophy,
  CheckCircle2, XCircle, RotateCcw, MonitorPlay, Award, ShieldCheck,
  Palette, Gift, Plus, Minus, HelpCircle, BookOpen
} from 'lucide-react';

import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { courseService } from '@/src/services/courseService';
import { greekEducationData, findUserGrade, type Category, type Grade, type Subject } from '@/src/data/greekEducation';
import { SubjectCard } from '@/src/components/SubjectCard';

const OnboardingModal = dynamic(() => import('@/components/OnboardingModal').then(mod => mod.OnboardingModal), { ssr: false });

const challengesData = [
  { category: "Μαθηματικά", q: "Η εξίσωση ax² + bx + c = 0 (a≠0) έχει δύο άνισες πραγματικές ρίζες όταν:", options: ["Δ = 0", "Δ > 0", "Δ < 0", "Δ ≥ 0"], correct: 1 },
  { category: "Μαθηματικά", q: "Το ανάπτυγμα της ταυτότητας (a - b)² είναι:", options: ["a² - b²", "a² + 2ab + b²", "a² - 2ab + b²", "a² + b²"], correct: 2 },
  { category: "Φυσική", q: "Σύμφωνα με τον 2ο Νόμο του Νεύτωνα, η συνισταμένη των δυνάμεων που ασκούνται σε ένα σώμα ισούται με:", options: ["m · u", "m · a", "m · g · h", "½ m · u²"], correct: 1 }
];

const faqs = [
  { q: "Πώς μπορώ να ξεκινήσω την εγγραφή μου;", a: "Είναι πολύ απλό! Πατάς το κουμπί 'Είσοδος' πάνω δεξιά και δημιουργείς τον λογαριασμό σου δωρεάν." },
  { q: "Είναι η πλατφόρμα δωρεάν για όλους;", a: "Ναι! Η πρόσβαση στα βασικά εργαλεία και την ύλη είναι δωρεάν. Ορισμένοι οργανισμοί παρέχουν επιπλέον υλικό." },
  { q: "Πώς μπορώ να παρακολουθήσω τα Live Μαθήματα;", a: "Αφού συνδεθείς στο Dashboard σου, θα βρεις την ενότητα 'Ζωντανά Μαθήματα'. Εκεί εμφανίζονται οι σύνδεσμοι." },
  { q: "Αποθηκεύεται η πρόοδός μου αυτόματα;", a: "Φυσικά! Κάθε φορά που ολοκληρώνεις μια ενότητα, η πλατφόρμα ενημερώνει το ποσοστό προόδου σου." }
];

const affiliatePartners = [
  { name: 'Udemy', description: 'Μάθε προγραμματισμό και νέες δεξιότητες.', url: 'https://www.udemy.com/?aff=YOUR_LINK', color: 'from-purple-600 to-indigo-600', icon: MonitorPlay },
  { name: 'Coursera', description: 'Κορυφαίες πιστοποιήσεις.', url: 'https://www.coursera.org/?aff=YOUR_LINK', color: 'from-blue-600 to-cyan-600', icon: Award },
  { name: 'Canva Pro', description: 'Φτιάξε εύκολα τις καλύτερες εργασίες.', url: 'https://www.canva.com/?aff=YOUR_LINK', color: 'from-pink-500 to-rose-500', icon: Palette },
  { name: 'NordVPN', description: 'Ασφαλές σερφάρισμα και προστασία.', url: 'https://nordvpn.com/?aff=YOUR_LINK', color: 'from-teal-500 to-emerald-600', icon: ShieldCheck }
];

const guidanceSlides = [
  {
    tag: 'ΟΔΗΓΟΣ', title: 'Πώς να χρησιμοποιήσεις την Πλατφόρμα', color: 'text-blue-400', bgBadge: 'bg-blue-500/20',
    steps: [
      'Διάλεξε την τάξη και την κατεύθυνσή σου από το μενού της αρχικής σελίδας.',
      'Κάνε κλικ στο μάθημα που θέλεις για να δεις όλη την ύλη οργανωμένη σε κεφάλαια.',
      'Κάνε Εγγραφή (είναι δωρεάν), για να αποθηκεύεται η πρόοδός σου στο Dashboard!'
    ]
  },
  {
    tag: 'ΣΥΜΒΟΥΛΗ', title: 'Tips Διαβάσματος', color: 'text-emerald-400', bgBadge: 'bg-emerald-500/20',
    steps: [
      'Κάνε διαλείμματα. Δοκίμασε τον κανόνα 25 λεπτά διάβασμα, 5 λεπτά διάλειμμα.',
      'Μην παπαγαλίζεις! Προσπάθησε να εξηγήσεις αυτό που διάβασες με δικά σου λόγια.',
      'Κλείσε το κινητό όσο διαβάζεις για να διατηρήσεις την απόλυτη συγκέντρωση.'
    ]
  }
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuidanceModalOpen, setIsGuidanceModalOpen] = useState(false);
  const [currentGuidanceSlide, setCurrentGuidanceSlide] = useState(0); 
  const [isChallengesModalOpen, setIsChallengesModalOpen] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(greekEducationData[0]);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(greekEducationData[0].grades[0]);
  const [selectedOrientation, setSelectedOrientation] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [userGradeInfo, setUserGradeInfo] = useState<{ categoryId: string; gradeId: string } | null>(null);
  
  const [newsfeed, setNewsfeed] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const role = await courseService.getUserRole(user.uid);
          setIsAdmin(role === 'admin' || role === 'superAdmin');
          const profile = await courseService.getUserProfile(user.uid);
          if (profile?.grade) {
            const info = findUserGrade(profile.schoolType || '', profile.grade);
            if (info) setUserGradeInfo(info);
          }
        } catch (e) { console.error("User data error", e); }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLiveNews = async () => {
      try {
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent('https://www.esos.gr/rss.xml')}`);
        const data = await response.json();
        if (data.status === 'ok') {
          setNewsfeed(data.items.slice(0, 4).map((item: any, idx: number) => ({
            id: idx, title: item.title,
            date: new Date(item.pubDate).toLocaleDateString('el-GR', { day: 'numeric', month: 'short' }),
            link: item.link, 
            type: item.title.toUpperCase().includes('ΑΠΕΡΓΙΑ') ? 'alert' : 'info'
          })));
        }
      } catch (error) {
        setNewsfeed([{ id: 1, title: 'Υπ. Παιδείας: Νέα εγκύκλιος', date: 'Σήμερα', link: '#', type: 'info' }]);
      } finally {
        setLoadingNews(false);
      }
    };
    fetchLiveNews();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const getDisplaySubjects = (): Subject[] => {
    let subjects: Subject[] = [];
    if (selectedGrade.subjects) subjects = [...selectedGrade.subjects];
    if (selectedGrade.orientations && selectedOrientation) {
      const ori = selectedGrade.orientations.find(o => o.id === selectedOrientation);
      if (ori) subjects = [...subjects, ...ori.subjects];
    }
    if (selectedGrade.sectors && selectedSector) {
      const sec = selectedGrade.sectors.find(s => s.id === selectedSector);
      if (sec) subjects = [...subjects, ...sec.subjects];
    }
    return subjects;
  };

  const handleQuizAnswer = (index: number) => {
    if (showQuizResult) return; 
    setSelectedAnswer(index);
    setShowQuizResult(true);
    if (index === challengesData[currentQuizIndex].correct) setQuizScore(prev => prev + 1);
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIndex < challengesData.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowQuizResult(false);
    } else {
      setQuizFinished(true);
    }
  };

  const resetQuiz = () => { setCurrentQuizIndex(0); setQuizScore(0); setSelectedAnswer(null); setShowQuizResult(false); setQuizFinished(false); };
  const handleNextSlide = () => setCurrentGuidanceSlide((prev) => (prev === guidanceSlides.length - 1 ? 0 : prev + 1));
  const handlePrevSlide = () => setCurrentGuidanceSlide((prev) => (prev === 0 ? guidanceSlides.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-lg shadow-sm border-b border-gray-100 sticky top-0 z-[9999] h-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
          <a href="/" className="text-2xl font-black text-blue-900 tracking-tight cursor-pointer">
            EduPlatform
          </a>
          
          <div className="flex items-center gap-3">
            {!loading && currentUser ? (
              <>
                {isAdmin && (
                  <a href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-blue-900 text-white rounded-lg shadow-md hover:bg-blue-800 transition-all cursor-pointer">
                    <Settings className="w-4 h-4" /> <span className="hidden sm:inline">Admin</span>
                  </a>
                )}
                <a href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-all cursor-pointer">
                  <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                </a>
                <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : !loading && (
              <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-blue-900 text-white rounded-xl font-bold hover:shadow-xl transition-all cursor-pointer">
                Είσοδος
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-white py-16 sm:py-24 border-b border-gray-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black text-blue-950 mb-6 tracking-tight">
            ΚΑΤΑΚΤΗΣΕ ΤΗΝ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">ΓΝΩΣΗ.</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Μάθε τις δεξιότητες του μέλλοντος με την ένταση του σήμερα.
          </p>
          <button
            onClick={() => currentUser ? window.location.href='/dashboard' : setIsModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold px-10 py-5 rounded-2xl text-lg shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
          >
            ΞΕΚΙΝΗΣΕ ΤΗ ΜΑΘΗΣΗ
          </button>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {greekEducationData.map((category) => (
                  <button key={category.id} onClick={() => { setSelectedCategory(category); setSelectedGrade(category.grades[0]); setSelectedOrientation(null); setSelectedSector(null); }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all cursor-pointer ${selectedCategory.id === category.id ? 'bg-blue-950 text-white shadow-lg transform scale-105' : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200'}`}>
                    {category.displayName}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 inline-flex flex-wrap gap-2">
              {selectedCategory.grades.map((grade) => (
                  <button key={grade.id} onClick={() => { setSelectedGrade(grade); setSelectedOrientation(grade.orientations?.[0]?.id || null); setSelectedSector(grade.sectors?.[0]?.id || null); }}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${selectedGrade.id === grade.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
                    {grade.name}
                  </button>
              ))}
            </div>

            {selectedGrade.orientations && selectedGrade.orientations.length > 0 && (
              <div className="mb-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-5">
                <label className="block text-sm font-bold text-blue-900 mb-3 uppercase tracking-wider">Επίλεξε Κατεύθυνση:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedGrade.orientations.map((o) => (
                    <button key={o.id} onClick={() => setSelectedOrientation(o.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${selectedOrientation === o.id ? 'bg-blue-900 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-blue-50 border border-gray-200'}`}>{o.name}</button>
                  ))}
                </div>
              </div>
            )}

            {selectedGrade.sectors && selectedGrade.sectors.length > 0 && (
              <div className="mb-8 bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
                <label className="block text-sm font-bold text-amber-900 mb-3 uppercase tracking-wider">Επίλεξε Τομέα:</label>
                <div className="flex flex-wrap gap-2">
                  {selectedGrade.sectors.map((s) => (
                    <button key={s.id} onClick={() => setSelectedSector(s.id)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${selectedSector === s.id ? 'bg-amber-700 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-amber-50 border border-gray-200'}`}>{s.name}</button>
                  ))}
                </div>
              </div>
            )}

            <section>
              <h3 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Μαθήματα {selectedGrade.displayName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {getDisplaySubjects().map((subject) => (
                  <SubjectCard key={subject.id} subject={{ id: subject.id, title: subject.name, progress: 0 }} gradeId={selectedGrade.id} isPublic={true} />
                ))}
              </div>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
              <div className="flex items-center justify-between mb-6 mt-2">
                <div className="flex items-center gap-4"><div className="bg-indigo-50 p-3 rounded-2xl text-indigo-600"><Bell className="w-6 h-6" /></div><h3 className="text-xl font-black text-gray-900 tracking-tight">ΕΚΠΑΙΔΕΥΤΙΚΑ ΝΕΑ</h3></div>
              </div>
              <div className="space-y-4">
                {newsfeed.map((news) => (
                  <a key={news.id} href={news.link} target="_blank" rel="noopener noreferrer" className="group block p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm ${news.type === 'alert' ? 'bg-red-500' : 'bg-blue-400'}`} />
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 line-clamp-2">{news.title}</h4>
                        <div className="flex items-center justify-between mt-1.5"><span className="text-xs font-medium text-gray-400 uppercase">{news.date}</span></div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-sm font-black text-gray-400 mb-5 uppercase tracking-widest text-center">ΕΡΓΑΛΕΙΑ ΜΑΘΗΣΗΣ</h3>
              <div className="grid grid-cols-1 gap-3">
                <button onClick={() => { setIsGuidanceModalOpen(true); setCurrentGuidanceSlide(0); }} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-slate-50 group cursor-pointer">
                  <div className="bg-yellow-500 p-3 rounded-xl"><Lightbulb className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-700">ΚΑΘΟΔΗΓΗΣΗ</span>
                </button>
                <button onClick={() => { setIsChallengesModalOpen(true); resetQuiz(); }} className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:bg-slate-50 group cursor-pointer">
                  <div className="bg-orange-500 p-3 rounded-xl"><Target className="w-5 h-5 text-white" /></div><span className="font-bold text-gray-700">ΠΡΟΚΛΗΣΕΙΣ</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-5 justify-center"><Gift className="w-5 h-5 text-fuchsia-500" /><h3 className="text-sm font-black text-gray-400 uppercase tracking-widest text-center">ΧΡΗΣΙΜΑ ΕΡΓΑΛΕΙΑ</h3></div>
              <div className="grid grid-cols-1 gap-4">
                {affiliatePartners.map((partner, index) => {
                  const Icon = partner.icon;
                  return (
                    <a key={index} href={partner.url} target="_blank" rel="noopener noreferrer" className="group relative rounded-2xl border border-slate-100 p-4 hover:border-slate-200 bg-white block">
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 p-2.5 rounded-xl bg-gradient-to-br ${partner.color} text-white shadow-md`}><Icon className="w-5 h-5" /></div>
                        <div className="flex-1"><h4 className="font-black text-slate-800">{partner.name}</h4><p className="text-xs text-slate-500 mt-1">{partner.description}</p></div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SPLIT FAQ SECTION */}
      <section className="bg-white py-24 sm:py-32 border-t border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 rounded-l-[100px] -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            <div className="lg:col-span-5 lg:sticky lg:top-24">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase mb-6"><HelpCircle className="w-4 h-4" /> Συχνες Ερωτησεις</div>
              <h2 className="text-4xl font-black text-slate-900 leading-[1.1] mb-6">Όλα όσα πρέπει <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">να γνωρίζεις.</span></h2>
              <a href="mailto:info@eduplatform.gr" className="inline-flex items-center gap-2 font-bold text-slate-800 hover:text-blue-600 transition-colors group">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors"><ChevronRight className="w-5 h-5 text-slate-600" /></div> Επικοινώνησε μαζί μας
              </a>
            </div>
            <div className="lg:col-span-7 space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className={`bg-white rounded-[2rem] border transition-all ${openFaqIndex === index ? 'border-blue-200 shadow-xl' : 'border-slate-100 shadow-sm'}`}>
                  <button onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)} className="w-full px-6 py-6 text-left flex items-center justify-between cursor-pointer">
                    <span className="font-bold text-lg text-slate-800">{faq.q}</span>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${openFaqIndex === index ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                      {openFaqIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    </div>
                  </button>
                  {openFaqIndex === index && <div className="px-6 pb-6 text-slate-500 font-medium">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FULL MODERN FOOTER */}
      <footer className="relative bg-[#020617] pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 justify-between items-start gap-12 pb-16 border-b border-white/10">
            <div className="space-y-6">
              <h3 className="text-3xl font-black text-white tracking-tighter">Edu<span className="text-blue-500">Platform</span></h3>
              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">Η τεχνολογία στην υπηρεσία της μάθησης. Σχεδιασμένο για την επόμενη γενιά μαθητών στην Ελλάδα.</p>
            </div>
            <div className="flex flex-wrap gap-x-16 gap-y-8 md:justify-end">
              <div className="space-y-4"><h4 className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">Νομικά</h4><ul className="space-y-3"><li><a href="/terms" className="text-slate-300 hover:text-white text-sm font-bold">Όροι Χρήσης & GDPR</a></li></ul></div>
              <div className="space-y-4"><h4 className="text-indigo-400 font-black uppercase tracking-[0.2em] text-[10px]">Υποστήριξη</h4><ul className="space-y-3"><li><a href="mailto:info@eduplatform.gr" className="text-slate-300 hover:text-white text-sm font-bold">Επικοινωνία</a></li></ul></div>
            </div>
          </div>
          <div className="pt-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col gap-1 text-center md:text-left">
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">© 2026 EduPlatform • Built for Excellence</p>
               <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Designed & Coded in Greece</p>
            </div>
            <a href="https://www.linkedin.com/in/stavros-papasotiropoulos-b35302200/" target="_blank" rel="noopener noreferrer" className="group relative block transition-transform hover:-translate-y-2 cursor-pointer">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
                <div className="flex flex-col items-end"><span className="text-[9px] font-black text-blue-400/80 uppercase tracking-[0.2em]">Architected By</span><span className="text-sm font-black text-white">Stavros Papasotiropoulos</span></div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]"><span className="text-white font-black text-lg">SP</span></div>
              </div>
            </a>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {isModalOpen && (
        <OnboardingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAuthSuccess={() => { window.location.href='/dashboard'; }} />
      )}

      {isChallengesModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-lg" onClick={() => setIsChallengesModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl min-h-[500px] flex flex-col justify-center animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setIsChallengesModalOpen(false)} className="absolute -top-12 right-0 text-white/60 hover:text-white p-2 cursor-pointer"><X className="w-8 h-8" /></button>
            <div className="relative w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl p-8 sm:p-10 flex flex-col h-full">
              {!quizFinished ? (
                <>
                  <div className="flex justify-between mb-8"><div className="bg-white/10 px-4 py-2 rounded-xl text-white font-bold">Ερώτηση {currentQuizIndex + 1}</div><div className="bg-white/10 px-4 py-2 rounded-xl text-yellow-400 font-bold">Σκορ: {quizScore}</div></div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">{challengesData[currentQuizIndex].q}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {challengesData[currentQuizIndex].options.map((opt, i) => (
                      <button key={i} onClick={() => handleQuizAnswer(i)} disabled={showQuizResult} className="p-5 rounded-2xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 text-left cursor-pointer">{opt}</button>
                    ))}
                  </div>
                  {showQuizResult && <button onClick={handleNextQuizQuestion} className="mt-8 bg-white text-slate-900 font-black px-8 py-3 rounded-full mx-auto block cursor-pointer hover:bg-slate-200">ΕΠΟΜΕΝΗ ΕΡΩΤΗΣΗ</button>}
                </>
              ) : (
                <div className="text-center py-10"><h2 className="text-4xl font-black text-white mb-6">Τέλος! Σκορ: {quizScore}</h2><button onClick={resetQuiz} className="bg-white px-10 py-4 rounded-full font-black cursor-pointer">ΠΑΙΞΕ ΞΑΝΑ</button></div>
              )}
            </div>
          </div>
        </div>
      )}

      {isGuidanceModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsGuidanceModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
            <button onClick={() => setIsGuidanceModalOpen(false)} className="absolute -top-12 right-0 text-white/60 p-2 cursor-pointer hover:text-white"><X className="w-8 h-8" /></button>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-12 text-white">
              <h2 className="text-4xl font-black mb-8 flex items-center gap-3">
                <Compass className="w-8 h-8 text-blue-400" />
                {guidanceSlides[currentGuidanceSlide].title}
              </h2>
              <ul className="space-y-5 text-white/90 font-medium text-lg leading-relaxed">
                {guidanceSlides[currentGuidanceSlide].steps.map((step, i) => (
                  <li key={i} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center font-bold flex-shrink-0">{i + 1}</div>
                    <p>{step}</p>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between mt-12">
                <button onClick={() => setCurrentGuidanceSlide(p => p === 0 ? guidanceSlides.length - 1 : p - 1)} className="p-4 bg-white/5 hover:bg-white/20 rounded-full cursor-pointer"><ChevronLeft /></button>
                <button onClick={() => setCurrentGuidanceSlide(p => p === guidanceSlides.length - 1 ? 0 : p + 1)} className="p-4 bg-white/5 hover:bg-white/20 rounded-full cursor-pointer"><ChevronRight /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}