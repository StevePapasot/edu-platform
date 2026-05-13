'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  BookOpen, LogOut, LayoutDashboard, ShieldCheck, Loader2, 
  Video, Plus, Trash2, Layers, FileText, FolderTree, Sparkles, MonitorPlay,
  ChevronRight, ArrowRight, Settings, Globe, Zap, HelpCircle, Edit
} from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where, getDoc, writeBatch } from 'firebase/firestore';
import { courseService } from '@/src/services/courseService';
import { greekEducationData, type Category, type Grade, type Subject } from '@/src/data/greekEducation';
import { LessonEditorModal } from '@/src/components/LessonEditorModal';
import { QuizBuilder, type QuizQuestion } from '@/src/components/QuizBuilder';
import toast from 'react-hot-toast';

import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => <div className="h-64 bg-slate-50 animate-pulse rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 font-bold">Φόρτωση Editor...</div>
});

export default function AdminConsole() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'courses' | 'chapters' | 'units' | 'live'>('courses');
  
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]); 
  const [liveRooms, setLiveRooms] = useState<any[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<Category>(greekEducationData[0]);
  const [selectedGrade, setSelectedGrade] = useState<Grade>(greekEducationData[0].grades[0]);
  const [selectedOrientation, setSelectedOrientation] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  const [chapterTitle, setChapterTitle] = useState('');
  const [selectedCourseForChapter, setSelectedCourseForChapter] = useState('');

  const [unitTitle, setUnitTitle] = useState('');
  const [selectedCourseForUnit, setSelectedCourseForUnit] = useState('');
  const [selectedChapterForUnit, setSelectedChapterForUnit] = useState('');
  const [unitType, setUnitType] = useState('video');
  const [unitContent, setUnitContent] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');

  const [liveTitle, setLiveTitle] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [selectedCourseForLive, setSelectedCourseForLive] = useState('');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await courseService.getUserRole(user.uid);
          if (role === 'admin' || role === 'superAdmin') {
            setIsAdmin(true);
            setTeacherId(user.uid);

            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().orgId) {
              const currentRealOrgId = userDoc.data().orgId;
              setOrgId(currentRealOrgId);
              fetchData(currentRealOrgId);
            } else {
              toast.error('Δεν βρέθηκε οργανισμός. Ολοκλήρωσε πρώτα την εγγραφή σου.');
              router.push('/dashboard');
              return;
            }
          } else { router.push('/dashboard'); }
        } catch (e) { router.push('/dashboard'); }
      } else { router.push('/'); }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (currentOrgId: string) => {
    try {
      const [cSnap, chSnap, uSnap, lSnap] = await Promise.all([
        getDocs(query(collection(db, 'courses'), where('orgId', '==', currentOrgId))),
        getDocs(query(collection(db, 'chapters'), where('orgId', '==', currentOrgId))),
        getDocs(query(collection(db, 'lessons'), where('orgId', '==', currentOrgId))),
        getDocs(query(collection(db, 'live_rooms'), where('orgId', '==', currentOrgId))) 
      ]);
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setChapters(chSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setUnits(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLiveRooms(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Error fetching data:", e); }
  };

  const getAvailableSubjects = (): Subject[] => {
    if (!selectedGrade) return [];
    if (selectedGrade.subjects && (!selectedOrientation && !selectedSector)) return selectedGrade.subjects;
    if (selectedGrade.orientations && selectedOrientation) {
      return selectedGrade.orientations.find(o => o.id === selectedOrientation)?.subjects || [];
    }
    if (selectedGrade.sectors && selectedSector) {
      return selectedGrade.sectors.find(s => s.id === selectedSector)?.subjects || [];
    }
    return selectedGrade.subjects || [];
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !orgId) return;
    try {
      await addDoc(collection(db, 'courses'), {
        title: selectedSubject.name,
        categoryId: selectedCategory.id,
        gradeId: selectedGrade.id,
        orientationId: selectedOrientation,
        sectorId: selectedSector, 
        orgId: orgId,
        createdAt: serverTimestamp()
      });
      fetchData(orgId);
      toast.success('Το μάθημα ενεργοποιήθηκε επιτυχώς!');
    } catch (e) { toast.error('Σφάλμα κατά την αποθήκευση.'); }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle || !selectedCourseForChapter || !orgId) return;
    try {
      const existingCount = chapters.filter(
        c => c.courseId === selectedCourseForChapter
      ).length;
      await addDoc(collection(db, 'chapters'), {
        title: chapterTitle,
        courseId: selectedCourseForChapter,
        orgId: orgId,
        order: existingCount + 1,
        createdAt: serverTimestamp()
      });
      setChapterTitle('');
      fetchData(orgId);
      toast.success('Το κεφάλαιο προστέθηκε!');
    } catch (e) { toast.error('Σφάλμα αποθήκευσης.'); }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitTitle || !selectedChapterForUnit || !orgId) return;
    
    if ((unitType === 'video' || unitType === 'pdf') && !unitContent) {
      toast.error('Παρακαλώ εισάγετε περιεχόμενο.');
      return;
    }

    if (unitType === 'quiz') {
      if (quizQuestions.length === 0) {
        toast.error('Πρόσθεσε τουλάχιστον μία ερώτηση στο quiz.');
        return;
      }
      for (let i = 0; i < quizQuestions.length; i++) {
        const q = quizQuestions[i];
        if (!q.text.trim()) {
          toast.error(`Η ερώτηση ${i + 1} δεν έχει κείμενο.`);
          return;
        }
        if (q.choices.some(c => !c.trim())) {
          toast.error(`Η ερώτηση ${i + 1} έχει κενές επιλογές.`);
          return;
        }
      }
    }

    try {
      const existingCount = units.filter(
        u => u.chapterId === selectedChapterForUnit
      ).length;
      
      const lessonData: any = { 
        title: unitTitle,
        courseId: selectedCourseForUnit,
        chapterId: selectedChapterForUnit,
        type: unitType,
        content: unitType === 'quiz' ? '' : unitContent,
        orgId: orgId,
        order: existingCount + 1,
        createdAt: serverTimestamp()
      };

      if (unitType === 'quiz') {
        lessonData.questions = quizQuestions;
      }

      await addDoc(collection(db, 'lessons'), lessonData);
      
      setUnitTitle('');
      setUnitContent('');
      setPdfFileName('');
      setQuizQuestions([]);
      fetchData(orgId);
      toast.success('Η ενότητα αποθηκεύτηκε!');
    } catch (e) { 
      console.error(e);
      toast.error('Σφάλμα αποθήκευσης.'); 
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Παρακαλώ επιλέξτε αρχείο PDF.');
      return;
    }
    setPdfUploading(true);
    setPdfFileName(file.name);
    try {
      const cloudName = 'dz4xlea6a';
      const uploadPreset = 'eduplatform_pdfs';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setUnitContent(data.secure_url);
      } else {
        toast.error('Αποτυχία ανεβάσματος PDF.');
        setPdfFileName('');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      toast.error('Σφάλμα ανεβάσματος.');
      setPdfFileName('');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleAddLiveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle || !liveUrl || !selectedCourseForLive || !orgId || !teacherId) return;
    try {
      await addDoc(collection(db, 'live_rooms'), { 
        title: liveTitle,
        url: liveUrl,
        courseId: selectedCourseForLive, 
        teacherId: teacherId,
        orgId: orgId,
        isActive: true,
        createdAt: serverTimestamp()
      });
      setLiveTitle('');
      setLiveUrl('');
      fetchData(orgId);
      toast.success('Η αίθουσα Zoom αποθηκεύτηκε!');
    } catch (e) { toast.error('Σφάλμα αποθήκευσης.'); }
  };

  const handleDelete = async (coll: string, id: string) => {
    if (!confirm('Είσαι σίγουρος για τη διαγραφή; Αυτή η ενέργεια δεν αναιρείται.')) return;
    
    try {
      const batch = writeBatch(db);

      if (coll === 'courses') {
        const chaptersSnap = await getDocs(query(collection(db, 'chapters'), where('courseId', '==', id)));
        chaptersSnap.docs.forEach(d => batch.delete(d.ref));

        const lessonsSnap = await getDocs(query(collection(db, 'lessons'), where('courseId', '==', id)));
        for (const lessonDoc of lessonsSnap.docs) {
          batch.delete(lessonDoc.ref);
          const progressSnap = await getDocs(query(collection(db, 'userProgress'), where('lessonId', '==', lessonDoc.id)));
          progressSnap.docs.forEach(p => batch.delete(p.ref));
        }

        const liveSnap = await getDocs(query(collection(db, 'live_rooms'), where('courseId', '==', id)));
        liveSnap.docs.forEach(d => batch.delete(d.ref));

        batch.delete(doc(db, 'courses', id));

      } else if (coll === 'chapters') {
        const lessonsSnap = await getDocs(query(collection(db, 'lessons'), where('chapterId', '==', id)));
        for (const lessonDoc of lessonsSnap.docs) {
          batch.delete(lessonDoc.ref);
          const progressSnap = await getDocs(query(collection(db, 'userProgress'), where('lessonId', '==', lessonDoc.id)));
          progressSnap.docs.forEach(p => batch.delete(p.ref));
        }
        batch.delete(doc(db, 'chapters', id));

      } else if (coll === 'lessons') {
        const progressSnap = await getDocs(query(collection(db, 'userProgress'), where('lessonId', '==', id)));
        progressSnap.docs.forEach(p => batch.delete(p.ref));
        batch.delete(doc(db, 'lessons', id));

      } else {
        batch.delete(doc(db, coll, id));
      }

      await batch.commit();
      fetchData(orgId!);

    } catch (e) { 
      toast.error('Σφάλμα κατά τη διαγραφή.'); 
      console.error(e);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
      <Loader2 className="animate-spin text-blue-500 w-16 h-16 mb-4"/>
      <p className="text-blue-200 font-bold animate-pulse">Φόρτωση Builder Pro...</p>
    </div>
  );
  
  if (!isAdmin) return null;

  const inputClassName = "w-full mt-2 px-5 py-4 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm appearance-none cursor-pointer";
  const labelClassName = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2";
  const glassCardClassName = "bg-white/90 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)] border-2 border-white ring-1 ring-slate-200/50 relative overflow-hidden transition-all duration-500";

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans relative selection:bg-blue-500/30 overflow-hidden">
      
      <div className="fixed top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 to-indigo-400/0 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[700px] h-[700px] bg-gradient-to-tr from-indigo-400/10 to-purple-400/0 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      <svg className="fixed top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none z-0" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      <aside className="w-72 bg-[#020617] text-slate-300 flex flex-col fixed h-full shadow-2xl z-50 border-r border-slate-800 transition-all duration-500">
        <div className="p-8 border-b border-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl animate-pulse"></div>
          <div className="flex items-center gap-3 text-white font-black text-3xl tracking-tighter relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span>Builder<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pro</span></span>
          </div>
          <div className="mt-5 flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-xl">
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
               ID: <span className="text-blue-400">{orgId}</span>
             </p>
          </div>
        </div>
        
        <nav className="p-6 flex-1 space-y-2 relative z-10">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 ml-2 opacity-50">Ροή Εργασιών</p>
          
          <button onClick={() => setActiveView('courses')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'courses' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}>
            <BookOpen className={`w-5 h-5 ${activeView === 'courses' ? 'text-white' : 'text-blue-500'}`} /> 1. Μαθήματα
          </button>
          
          <button onClick={() => setActiveView('chapters')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'chapters' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}>
            <FolderTree className={`w-5 h-5 ${activeView === 'chapters' ? 'text-white' : 'text-indigo-500'}`} /> 2. Κεφάλαια
          </button>
          
          <button onClick={() => setActiveView('units')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'units' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-[1.02]' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}>
            <Layers className={`w-5 h-5 ${activeView === 'units' ? 'text-white' : 'text-purple-500'}`} /> 3. Ύλη & Υλικό
          </button>
          
          <div className="my-6 border-t border-slate-800/50 mx-2"></div>
          
          <button onClick={() => setActiveView('live')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'live' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-red-900/50 scale-[1.02]' : 'hover:bg-slate-800/50 text-rose-400 hover:text-rose-300'}`}>
            <MonitorPlay className="w-5 h-5" /> 4. Live (Zoom)
          </button>
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-3 bg-slate-900/30">
          <button onClick={() => router.push('/dashboard')} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-400 border border-white/5 transition-all">
            <LayoutDashboard className="w-4 h-4" /> Student View
          </button>
          <button onClick={() => signOut(auth).then(() => router.push('/'))} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-all">
            <LogOut className="w-4 h-4" /> Έξοδος
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1 p-8 lg:p-14 overflow-y-auto h-screen relative z-10 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
               <Zap className="w-3 h-3 fill-current" /> Admin Control Center
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-slate-900 pb-2">
              {activeView === 'courses' && 'Ενεργοποίηση Μαθημάτων'}
              {activeView === 'chapters' && 'Δομή Κεφαλαίων'}
              {activeView === 'units' && 'Ανέβασμα Υλικού'}
              {activeView === 'live' && 'Live Μαθήματα'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            <div className="lg:col-span-5 space-y-8">
              
              {activeView === 'courses' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none"><BookOpen size={120} /></div>
                  <form onSubmit={handleAddCourse} className="space-y-6 relative z-10">
                    <div>
                      <label className={labelClassName}><Globe className="w-3 h-3" /> Τύπος Σχολείου</label>
                      <select value={selectedCategory.id} onChange={(e) => { const cat = greekEducationData.find(c => c.id === e.target.value)!; setSelectedCategory(cat); setSelectedGrade(cat.grades[0]); }} className={inputClassName}>
                        {greekEducationData.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}><ChevronRight className="w-3 h-3" /> Επιλογή Τάξης</label>
                      <select value={selectedGrade.id} onChange={(e) => { const grade = selectedCategory.grades.find(g => g.id === e.target.value)!; setSelectedGrade(grade); }} className={inputClassName}>
                        {selectedCategory.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    {selectedGrade.orientations && (
                      <div className="animate-in zoom-in-95 duration-300">
                        <label className={labelClassName}><ArrowRight className="w-3 h-3" /> Κατεύθυνση</label>
                        <select value={selectedOrientation || ''} onChange={(e) => setSelectedOrientation(e.target.value)} className={`${inputClassName} bg-blue-50/50 border-blue-200/50 text-blue-900`}>
                          <option value="">-- Χωρίς Κατεύθυνση --</option>
                          {selectedGrade.orientations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedGrade.sectors && (
                      <div className="animate-in zoom-in-95 duration-300">
                        <label className={labelClassName}><ArrowRight className="w-3 h-3" /> Τομέας ΕΠΑΛ</label>
                        <select value={selectedSector || ''} onChange={(e) => setSelectedSector(e.target.value)} className={`${inputClassName} bg-amber-50/50 border-amber-200/50 text-amber-900`}>
                          <option value="">-- Χωρίς Τομέα --</option>
                          {selectedGrade.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={labelClassName}><Zap className="w-3 h-3" /> Επιλογή Μαθήματος</label>
                      <select value={selectedSubject?.id || ''} onChange={(e) => setSelectedSubject(getAvailableSubjects().find(s => s.id === e.target.value) || null)} className={`${inputClassName} border-2 border-blue-500/30 bg-white font-black text-blue-600`}>
                        <option value="">-- Διάλεξε Μάθημα --</option>
                        {getAvailableSubjects().map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </select>
                    </div>
                    <button type="submit" disabled={!orgId} className="w-full py-5 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_15px_40px_-12px_rgba(37,99,235,0.4)] hover:shadow-[0_20px_50px_-12px_rgba(37,99,235,0.6)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 disabled:opacity-50">
                      ΕΝΕΡΓΟΠΟΙΗΣΗ ΜΑΘΗΜΑΤΟΣ
                    </button>
                  </form>
                </div>
              )}

              {activeView === 'chapters' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <form onSubmit={handleAddChapter} className="space-y-6 relative z-10">
                    <div>
                      <label className={labelClassName}>Επιλογή Μαθήματος</label>
                      <select required value={selectedCourseForChapter} onChange={(e) => setSelectedCourseForChapter(e.target.value)} className={inputClassName}>
                        <option value="">-- Διάλεξε Μάθημα --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.gradeId})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Τίτλος Κεφαλαίου</label>
                      <input type="text" required value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="π.χ. Κεφάλαιο 1: Θεωρία Κυκλωμάτων" className={`${inputClassName} bg-white border-2 border-blue-500/10`}/>
                    </div>
                    <button type="submit" disabled={!orgId} className="w-full py-5 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50">
                      ΔΗΜΙΟΥΡΓΙΑ ΚΕΦΑΛΑΙΟΥ
                    </button>
                  </form>
                </div>
              )}

              {activeView === 'units' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <form onSubmit={handleAddUnit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClassName}>Μάθημα</label>
                        <select required value={selectedCourseForUnit} onChange={(e) => setSelectedCourseForUnit(e.target.value)} className={inputClassName}>
                          <option value="">-- Μάθημα --</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelClassName}>Κεφάλαιο</label>
                        <select required value={selectedChapterForUnit} onChange={(e) => setSelectedChapterForUnit(e.target.value)} disabled={!selectedCourseForUnit} className={inputClassName}>
                          <option value="">-- Κεφάλαιο --</option>
                          {chapters.filter(ch => ch.courseId === selectedCourseForUnit).map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className={labelClassName}>Τύπος Περιεχομένου</label>
                      <select 
                        value={unitType} 
                        onChange={(e) => { setUnitType(e.target.value); setUnitContent(''); setPdfFileName(''); setQuizQuestions([]); }} 
                        className={inputClassName}
                      >
                        <option value="video">🎥 Βίντεο (YouTube / Vimeo URL)</option>
                        <option value="text">📝 Κείμενο (Θεωρία)</option>
                        <option value="pdf">📄 Αρχείο PDF</option>
                        <option value="quiz">❓ Άσκηση / Quiz</option>
                      </select>
                    </div>

                    <input type="text" required value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} placeholder="Τίτλος Ενότητας (π.χ. 1.1 Βασικοί Ορισμοί)" className={inputClassName}/>
                    
                    {unitType === 'video' && (
                      <input type="url" required value={unitContent} onChange={(e) => setUnitContent(e.target.value)} placeholder="YouTube / Vimeo URL" className={`${inputClassName} bg-blue-50/30 border-blue-500/20`}/>
                    )}

                    {unitType === 'text' && (
                      <div className="h-80 mb-14 overflow-hidden rounded-[1.5rem] border-2 border-slate-100 shadow-inner bg-white">
                        <ReactQuill theme="snow" value={unitContent} onChange={setUnitContent} className="h-full" />
                      </div>
                    )}

                    {unitType === 'pdf' && (
                      <div className="space-y-3">
                        <label className="block cursor-pointer">
                          <div className={`${inputClassName} bg-blue-50/30 border-blue-500/20 flex items-center justify-center gap-3 hover:bg-blue-50`}>
                            {pdfUploading ? (
                              <><Loader2 className="w-5 h-5 animate-spin text-blue-600" /><span>Ανέβασμα...</span></>
                            ) : unitContent ? (
                              <><FileText className="w-5 h-5 text-green-600" /><span className="text-green-700">✓ {pdfFileName || 'PDF ανέβηκε'}</span></>
                            ) : (
                              <><FileText className="w-5 h-5 text-blue-600" /><span>Επιλογή αρχείου PDF...</span></>
                            )}
                          </div>
                          <input 
                            type="file" 
                            accept="application/pdf"
                            className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
                          />
                        </label>
                        {unitContent && (
                          <p className="text-xs text-slate-500 font-medium truncate px-2">URL: {unitContent}</p>
                        )}
                      </div>
                    )}

                    {unitType === 'quiz' && (
                      <div>
                        <QuizBuilder 
                          questions={quizQuestions} 
                          onChange={setQuizQuestions}
                          topicHint={unitTitle}
                        />
                      </div>
                    )}
                    
                    <button type="submit" disabled={!orgId} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
                      ΑΠΟΘΗΚΕΥΣΗ ΥΛΙΚΟΥ
                    </button>
                  </form>
                </div>
              )}

              {activeView === 'live' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500 border-rose-100`}>
                  <form onSubmit={handleAddLiveRoom} className="space-y-6 relative z-10">
                    <div className="bg-rose-50 p-5 rounded-[1.5rem] border border-rose-100 flex gap-4">
                       <div className="bg-white p-3 rounded-xl shadow-sm h-fit"><MonitorPlay className="text-rose-500" /></div>
                       <p className="text-[11px] font-bold text-rose-900 leading-relaxed uppercase tracking-tighter">Το Link κλειδώνει πάνω στον οργανισμό σου. Μόνο οι δικοί σου μαθητές θα μπορούν να συνδεθούν.</p>
                    </div>
                    <div>
                      <label className={labelClassName}>Επιλογή Μαθήματος</label>
                      <select required value={selectedCourseForLive} onChange={(e) => setSelectedCourseForLive(e.target.value)} className={inputClassName}>
                        <option value="">-- Διάλεξε Μάθημα --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <input type="text" required value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} placeholder="Τίτλος Αίθουσας" className={inputClassName}/>
                    <input type="url" required value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="Zoom / Teams / Webex URL" className={`${inputClassName} border-rose-500/20 focus:border-rose-500`}/>
                    <button type="submit" disabled={!orgId} className="w-full py-5 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 transition-all shadow-[0_15px_30px_-10px_rgba(225,29,72,0.4)] disabled:opacity-50">
                      ΕΝΑΡΞΗ LIVE ΣΥΝΑΝΤΗΣΗΣ
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="lg:col-span-7">
              <div className={`${glassCardClassName} animate-in fade-in slide-in-from-right-8 duration-500 min-h-[600px] flex flex-col`}>
                <div className="flex items-center justify-between mb-10">
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                     <Layers className="text-blue-500 w-8 h-8" />
                     {activeView === 'courses' && 'Τα Μαθήματά σου'}
                     {activeView === 'chapters' && 'Δομή Κεφαλαίων'}
                     {activeView === 'units' && 'Αρχεία Ύλης'}
                     {activeView === 'live' && 'Ενεργές Αίθουσες'}
                   </h3>
                   <div className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                     {courses.length} Στοιχεία
                   </div>
                </div>

                <div className="flex-1 space-y-4">
                  {activeView === 'courses' && courses.map(c => (
                    <div key={c.id} className="group flex items-center justify-between p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner border border-blue-100/50">
                          <BookOpen className="w-7 h-7"/>
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-xl tracking-tight leading-none mb-2">{c.title}</p>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-black text-blue-500 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-blue-100">{c.gradeId}</span>
                             <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-slate-100">{c.categoryId}</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDelete('courses', c.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Trash2 className="w-6 h-6"/>
                      </button>
                    </div>
                  ))}

                  {activeView === 'chapters' && !selectedCourseForChapter && (
                    <div className="p-16 text-center">
                      <FolderTree className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Επίλεξε μάθημα για να δεις τα κεφάλαιά του.</p>
                    </div>
                  )}

                  {activeView === 'chapters' && selectedCourseForChapter && (() => {
                    const parentCourse = courses.find(c => c.id === selectedCourseForChapter);
                    const courseChapters = chapters
                      .filter(ch => ch.courseId === selectedCourseForChapter)
                      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                    
                    if (courseChapters.length === 0) {
                      return (
                        <div className="p-16 text-center">
                          <Layers className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-slate-500 font-medium">Το μάθημα <strong>{parentCourse?.title}</strong> δεν έχει κεφάλαια ακόμα.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="mb-8">
                        <h4 className="font-black text-slate-400 mb-4 ml-2 text-[11px] uppercase tracking-[0.3em] flex items-center gap-3">
                          <div className="w-8 h-[2px] bg-slate-200"></div>{parentCourse?.title || 'Άγνωστο Μάθημα'}
                        </h4>
                        <div className="grid grid-cols-1 gap-3 pl-4 border-l-2 border-slate-100 ml-2">
                          {courseChapters.map(ch => (
                            <div key={ch.id} className="flex items-center justify-between p-5 bg-white border border-slate-100 shadow-sm rounded-2xl hover:border-indigo-200 transition-all group">
                               <span className="font-bold text-slate-700 text-lg">{ch.order ? `${ch.order}. ` : ''}{ch.title}</span>
                               <button onClick={() => handleDelete('chapters', ch.id)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5"/></button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {activeView === 'units' && !selectedCourseForUnit && (
                    <div className="p-16 text-center">
                      <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Επίλεξε μάθημα για να δεις την ύλη του.</p>
                    </div>
                  )}

                  {activeView === 'units' && selectedCourseForUnit && chapters
                    .filter(ch => ch.courseId === selectedCourseForUnit)
                    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
                    .map(chapter => {
                    const chapterUnits = units
                      .filter(u => u.chapterId === chapter.id)
                      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
                    if (chapterUnits.length === 0) return null;
                    return (
                      <div key={chapter.id} className="mb-10 animate-in fade-in duration-500">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-4">Κεφάλαιο: {chapter.title}</p>
                        <div className="space-y-3">
                          {chapterUnits.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    u.type === 'video' ? 'bg-blue-50 text-blue-600' 
                                    : u.type === 'pdf' ? 'bg-red-50 text-red-600' 
                                    : u.type === 'quiz' ? 'bg-amber-50 text-amber-600'
                                    : 'bg-emerald-50 text-emerald-600'
                                  }`}>
                                    {u.type === 'video' ? <Video size={20}/> 
                                     : u.type === 'pdf' ? <FileText size={20}/>
                                     : u.type === 'quiz' ? <HelpCircle size={20}/>
                                     : <FileText size={20}/>}
                                  </div>
                                  <div>
                                    <span className="font-bold text-slate-700">{u.title}</span>
                                    {u.type === 'quiz' && u.questions && (
                                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{u.questions.length} ερωτήσεις</p>
                                    )}
                                  </div>
                               </div>
                               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <button 
                                   onClick={() => { setEditingLesson(u); setIsEditorOpen(true); }}
                                   className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                   title="Επεξεργασία"
                                 >
                                   <Edit className="w-5 h-5"/>
                                 </button>
                                 <button 
                                   onClick={() => handleDelete('lessons', u.id)} 
                                   className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                   title="Διαγραφή"
                                 >
                                   <Trash2 className="w-5 h-5"/>
                                 </button>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {activeView === 'live' && liveRooms.map(r => (
                    <div key={r.id} className="group flex items-center justify-between p-6 bg-white rounded-[2rem] border border-rose-100 shadow-sm hover:shadow-xl hover:border-rose-300 transition-all duration-300">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center animate-pulse border border-rose-100">
                            <MonitorPlay className="w-7 h-7"/>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1 block">Live Room</span>
                            <p className="font-black text-slate-800 text-xl tracking-tight leading-none">{r.title}</p>
                          </div>
                       </div>
                       <button onClick={() => handleDelete('live_rooms', r.id)} className="p-4 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"><Trash2 className="w-6 h-6"/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <LessonEditorModal 
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setEditingLesson(null); }}
        lesson={editingLesson}
        onUpdate={() => orgId && fetchData(orgId)}
      />
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}