'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  BookOpen, LogOut, LayoutDashboard, ShieldCheck, Loader2, 
  Video, Plus, Trash2, Layers, FileText, FolderTree, Sparkles, MonitorPlay
} from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import { courseService } from '@/src/services/courseService';
import { greekEducationData, type Category, type Grade, type Subject } from '@/src/data/greekEducation';

import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function AdminConsole() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'courses' | 'chapters' | 'units' | 'live'>('courses');
  
  // --- CORE IDENTITY STATE ---
  const [orgId, setOrgId] = useState<string | null>(null);
  const [teacherId, setTeacherId] = useState<string | null>(null);

  // --- DATA STATE ---
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]); 
  const [liveRooms, setLiveRooms] = useState<any[]>([]);

  // --- FORM STATES ---
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

  const [liveTitle, setLiveTitle] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [selectedCourseForLive, setSelectedCourseForLive] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const role = await courseService.getUserRole(user.uid);
          if (role === 'admin' || user.email === 'test2@gmail.com' || user.email === 'spapasotiropoulos@gmail.com') {
            setIsAdmin(true);
            setTeacherId(user.uid);

            // Τραβάμε το orgId απευθείας από το document του χρήστη
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists() && userDoc.data().orgId) {
              const currentRealOrgId = userDoc.data().orgId;
              setOrgId(currentRealOrgId);
              fetchData(currentRealOrgId);
            } else {
              setOrgId('default-org');
              fetchData('default-org');
            }
          } else { window.location.href = '/dashboard'; }
        } catch (e) { window.location.href = '/dashboard'; }
      } else { window.location.href = '/'; }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchData = async (currentOrgId: string) => {
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
  };

  const getAvailableSubjects = (): Subject[] => {
    if (selectedGrade.subjects && (!selectedOrientation && !selectedSector)) return selectedGrade.subjects;
    if (selectedGrade.orientations && selectedOrientation) return selectedGrade.orientations.find(o => o.id === selectedOrientation)?.subjects || [];
    if (selectedGrade.sectors && selectedSector) return selectedGrade.sectors.find(s => s.id === selectedSector)?.subjects || [];
    return [];
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !orgId) return;
    await addDoc(collection(db, 'courses'), {
      title: selectedSubject.name, categoryId: selectedCategory.id, gradeId: selectedGrade.id,
      orientationId: selectedOrientation, sectorId: selectedSector, 
      orgId: orgId,
      createdAt: serverTimestamp()
    });
    fetchData(orgId); alert('Το μάθημα ενεργοποιήθηκε!');
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterTitle || !selectedCourseForChapter || !orgId) return;
    await addDoc(collection(db, 'chapters'), {
      title: chapterTitle, courseId: selectedCourseForChapter, orgId, createdAt: serverTimestamp()
    });
    setChapterTitle(''); fetchData(orgId); alert('Το κεφάλαιο προστέθηκε!');
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitTitle || !selectedChapterForUnit || !orgId) return;
    await addDoc(collection(db, 'lessons'), { 
      title: unitTitle, courseId: selectedCourseForUnit, chapterId: selectedChapterForUnit,
      type: unitType, content: unitContent, orgId, createdAt: serverTimestamp()
    });
    setUnitTitle(''); setUnitContent(''); fetchData(orgId); alert('Η ενότητα αποθηκεύτηκε!');
  };

  const handleAddLiveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle || !liveUrl || !selectedCourseForLive || !orgId || !teacherId) return;
    await addDoc(collection(db, 'live_rooms'), { 
      title: liveTitle, url: liveUrl, courseId: selectedCourseForLive, 
      teacherId: teacherId, orgId: orgId, isActive: true, createdAt: serverTimestamp()
    });
    setLiveTitle(''); setLiveUrl(''); fetchData(orgId); alert('Η αίθουσα Zoom αποθηκεύτηκε!');
  };

  const handleDelete = async (coll: string, id: string) => {
    if(confirm('Σίγουρα θέλεις να γίνει διαγραφή;')) {
      await deleteDoc(doc(db, coll, id));
      fetchData(orgId!);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#020617]"><Loader2 className="animate-spin text-blue-500 w-12 h-12"/></div>;
  if (!isAdmin) return null;

  const inputClassName = "w-full mt-2 px-5 py-4 bg-slate-50/50 hover:bg-slate-100/50 border border-slate-200/80 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-300 shadow-sm appearance-none cursor-pointer";
  const labelClassName = "text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1";
  const glassCardClassName = "bg-white/90 backdrop-blur-3xl p-8 lg:p-10 rounded-[2.5rem] shadow-[0_0_50px_-12px_rgba(59,130,246,0.15)] border-2 border-white ring-1 ring-slate-200/50 relative overflow-hidden hover:shadow-[0_0_60px_-15px_rgba(59,130,246,0.25)] transition-all duration-500";

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans relative selection:bg-blue-500/30">
      
      {/* BACKGROUND DECORATIONS */}
      <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#020617] text-slate-300 flex flex-col fixed h-full shadow-2xl z-50 border-r border-slate-800">
        <div className="p-8 border-b border-slate-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl"></div>
          <div className="flex items-center gap-3 text-white font-black text-3xl tracking-tighter relative z-10">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20"><ShieldCheck className="w-7 h-7 text-white" /></div>
            <span>Builder<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Pro</span></span>
          </div>
          <div className="mt-4 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-white/5 p-2 rounded-lg border border-white/5">
             ACTIVE ORG: <span className="text-blue-400 ml-1">{orgId}</span>
          </div>
        </div>
        
        <nav className="p-6 flex-1 space-y-2">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-5 ml-2">Ροη Εργασιας</p>
          <button onClick={() => setActiveView('courses')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'courses' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><BookOpen className="w-5 h-5" /> 1. Μαθήματα</button>
          <button onClick={() => setActiveView('chapters')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'chapters' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><FolderTree className="w-5 h-5" /> 2. Κεφάλαια</button>
          <button onClick={() => setActiveView('units')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'units' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 scale-105' : 'hover:bg-slate-800/50 text-slate-400 hover:text-white'}`}><Layers className="w-5 h-5" /> 3. Ύλη (Υλικό)</button>
          <div className="my-4 border-t border-slate-800"></div>
          <button onClick={() => setActiveView('live')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all duration-300 ${activeView === 'live' ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-red-900/50 scale-105' : 'hover:bg-slate-800/50 text-rose-400 hover:text-rose-300'}`}><MonitorPlay className="w-5 h-5" /> 4. Live (Zoom)</button>
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-3 bg-slate-900/50">
          <button onClick={() => window.location.href='/dashboard'} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all"><LayoutDashboard className="w-4 h-4 text-emerald-400" /> Student View</button>
          <button onClick={() => {signOut(auth); window.location.href='/';}} className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-xl font-bold text-rose-400 hover:bg-rose-500/10 transition-all"><LogOut className="w-4 h-4" /> Έξοδος</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-72 flex-1 p-8 lg:p-14 overflow-y-auto h-screen relative z-10">
        <div className="max-w-[1400px] mx-auto">
          
          <div className="mb-12">
            <h2 className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 pb-2">
              {activeView === 'courses' && '1. Ενεργοποίηση Μαθημάτων'}
              {activeView === 'chapters' && '2. Δημιουργία Κεφαλαίων'}
              {activeView === 'units' && '3. Ανέβασμα Υλικού & Ενοτήτων'}
              {activeView === 'live' && '4. Διαχείριση Live Μαθημάτων'}
            </h2>
            <p className="text-slate-500 font-medium text-lg mt-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {activeView === 'courses' && 'Επίλεξε τις τάξεις και τα μαθήματα που θέλεις να βλέπουν οι μαθητές με χειρουργική ακρίβεια.'}
              {activeView === 'chapters' && 'Δώσε δομή στα μαθήματά σου φτιάχνοντας τα κεφάλαια της ύλης.'}
              {activeView === 'units' && 'Ανέβασε τα βίντεο σου ή γράψε πλούσιο κείμενο με τον ενσωματωμένο Editor.'}
              {activeView === 'live' && 'Κλείδωσε το Zoom link πάνω στον οργανισμό σου.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* ΑΡΙΣΤΕΡΗ ΣΤΗΛΗ: ΟΙ ΦΟΡΜΕΣ */}
            <div className="lg:col-span-5">
              
              {activeView === 'courses' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <form onSubmit={handleAddCourse} className="space-y-6 relative z-10">
                    <div>
                      <label className={labelClassName}>Σχολείο</label>
                      <select value={selectedCategory.id} onChange={(e) => { const cat = greekEducationData.find(c => c.id === e.target.value)!; setSelectedCategory(cat); setSelectedGrade(cat.grades[0]); }} className={inputClassName}>
                        {greekEducationData.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Τάξη</label>
                      <select value={selectedGrade.id} onChange={(e) => { const grade = selectedCategory.grades.find(g => g.id === e.target.value)!; setSelectedGrade(grade); }} className={inputClassName}>
                        {selectedCategory.grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    {selectedGrade.orientations && (
                      <div>
                        <label className={labelClassName}>Κατεύθυνση</label>
                        <select value={selectedOrientation || ''} onChange={(e) => setSelectedOrientation(e.target.value)} className={`${inputClassName} bg-blue-50/50 border-blue-200/50 text-blue-900 focus:border-blue-400 focus:ring-blue-500/20`}>
                          <option value="">Επίλεξε Κατεύθυνση</option>
                          {selectedGrade.orientations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                      </div>
                    )}
                    {selectedGrade.sectors && (
                      <div>
                        <label className={labelClassName}>Τομέας</label>
                        <select value={selectedSector || ''} onChange={(e) => setSelectedSector(e.target.value)} className={`${inputClassName} bg-amber-50/50 border-amber-200/50 text-amber-900 focus:border-amber-400 focus:ring-amber-500/20`}>
                          <option value="">Επίλεξε Τομέα</option>
                          {selectedGrade.sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={labelClassName}>Μάθημα</label>
                      <select value={selectedSubject?.id || ''} onChange={(e) => setSelectedSubject(getAvailableSubjects().find(s => s.id === e.target.value) || null)} className={`${inputClassName} border-2 border-blue-500/30 focus:border-blue-600 bg-white`}>
                        <option value="">Επίλεξε Μάθημα</option>
                        {getAvailableSubjects().map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                      </select>
                    </div>
                    <button type="submit" disabled={!orgId} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black rounded-2xl shadow-[0_10px_40px_-10px_rgba(37,99,235,0.6)] hover:shadow-[0_10px_40px_-5px_rgba(37,99,235,0.8)] active:scale-[0.98] transition-all duration-300 disabled:opacity-50">ΠΡΟΣΘΗΚΗ ΜΑΘΗΜΑΤΟΣ</button>
                  </form>
                </div>
              )}

              {activeView === 'chapters' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <form onSubmit={handleAddChapter} className="space-y-6 relative z-10">
                    <div>
                      <label className={labelClassName}>Επίλεξε Μάθημα</label>
                      <select required value={selectedCourseForChapter} onChange={(e) => setSelectedCourseForChapter(e.target.value)} className={inputClassName}>
                        <option value="">-- Διάλεξε Μάθημα --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title} ({c.gradeId})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Τίτλος Κεφαλαίου</label>
                      <input type="text" required value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="π.χ. Κεφάλαιο 1" className={`${inputClassName} bg-white border-2 border-blue-500/20`}/>
                    </div>
                    <button type="submit" disabled={!orgId} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl disabled:opacity-50">ΔΗΜΙΟΥΡΓΙΑ ΚΕΦΑΛΑΙΟΥ</button>
                  </form>
                </div>
              )}

              {activeView === 'units' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <form onSubmit={handleAddUnit} className="space-y-6 relative z-10">
                    <div>
                      <label className={labelClassName}>Μάθημα</label>
                      <select required value={selectedCourseForUnit} onChange={(e) => setSelectedCourseForUnit(e.target.value)} className={inputClassName}>
                        <option value="">-- Διάλεξε Μάθημα --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Κεφάλαιο</label>
                      <select required value={selectedChapterForUnit} onChange={(e) => setSelectedChapterForUnit(e.target.value)} disabled={!selectedCourseForUnit} className={inputClassName}>
                        <option value="">-- Διάλεξε Κεφάλαιο --</option>
                        {chapters.filter(ch => ch.courseId === selectedCourseForUnit).map(ch => <option key={ch.id} value={ch.id}>{ch.title}</option>)}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setUnitType('video')} className={`flex-1 py-4 rounded-xl text-sm font-bold border transition-all ${unitType === 'video' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-500'}`}>Video</button>
                      <button type="button" onClick={() => setUnitType('text')} className={`flex-1 py-4 rounded-xl text-sm font-bold border transition-all ${unitType === 'text' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'bg-white text-slate-500'}`}>Text</button>
                    </div>
                    <input type="text" required value={unitTitle} onChange={(e) => setUnitTitle(e.target.value)} placeholder="Τίτλος Ενότητας" className={inputClassName}/>
                    {unitType === 'video' ? (
                      <input type="url" required value={unitContent} onChange={(e) => setUnitContent(e.target.value)} placeholder="YouTube Link" className={inputClassName}/>
                    ) : (
                      <div className="h-64 mb-12 overflow-hidden rounded-2xl border bg-white">
                        <ReactQuill theme="snow" value={unitContent} onChange={setUnitContent} className="h-full" />
                      </div>
                    )}
                    <button type="submit" disabled={!orgId} className="w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-black rounded-2xl shadow-xl disabled:opacity-50">ΑΠΟΘΗΚΕΥΣΗ ΥΛΙΚΟΥ</button>
                  </form>
                </div>
              )}

              {activeView === 'live' && (
                <div className={`${glassCardClassName} animate-in fade-in slide-in-from-left-8 duration-500`}>
                  <form onSubmit={handleAddLiveRoom} className="space-y-6 relative z-10">
                    <div>
                      <label className={labelClassName}>Επίλεξε Μάθημα</label>
                      <select required value={selectedCourseForLive} onChange={(e) => setSelectedCourseForLive(e.target.value)} className={`${inputClassName} focus:border-rose-500`}>
                        <option value="">-- Διάλεξε Μάθημα --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClassName}>Τίτλος Αίθουσας</label>
                      <input type="text" required value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} placeholder="Αίθουσα Zoom" className={inputClassName}/>
                    </div>
                    <div>
                      <label className={labelClassName}>Link Συνάντησης</label>
                      <input type="url" required value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} placeholder="https://zoom.us/..." className={inputClassName}/>
                    </div>
                    <button type="submit" disabled={!orgId} className="w-full py-4 mt-4 bg-gradient-to-r from-rose-500 to-red-600 text-white text-sm font-black rounded-2xl shadow-xl disabled:opacity-50">ΑΝΟΙΓΜΑ ΑΙΘΟΥΣΑΣ</button>
                  </form>
                </div>
              )}

            </div>

            {/* ΔΕΞΙΑ ΣΤΗΛΗ: ΟΙ ΛΙΣΤΕΣ */}
            <div className="lg:col-span-7">
              <div className={`${glassCardClassName} animate-in fade-in slide-in-from-right-8 duration-500 min-h-[600px] flex flex-col`}>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8">
                  {activeView === 'courses' && 'Τα Μαθήματά σου'}
                  {activeView === 'chapters' && 'Δομή Κεφαλαίων'}
                  {activeView === 'units' && 'Αρχεία Ύλης'}
                  {activeView === 'live' && 'Οι Ενεργές Αίθουσες σου'}
                </h3>

                <div className="flex-1 space-y-4">
                  {/* COURSES LIST */}
                  {activeView === 'courses' && courses.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm group hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"><BookOpen className="w-6 h-6"/></div>
                        <div>
                          <p className="font-black text-slate-800 text-lg tracking-tight">{c.title}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{c.gradeId}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDelete('courses', c.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  ))}

                  {/* CHAPTERS LIST */}
                  {activeView === 'chapters' && chapters.map(ch => (
                    <div key={ch.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm group">
                       <span className="font-bold text-slate-700">{ch.title}</span>
                       <button onClick={() => handleDelete('chapters', ch.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  ))}

                  {/* UNITS LIST */}
                  {activeView === 'units' && units.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border shadow-sm group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${u.type === 'video' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {u.type === 'video' ? <Video size={16}/> : <FileText size={16}/>}
                          </div>
                          <span className="font-bold text-slate-700">{u.title}</span>
                       </div>
                       <button onClick={() => handleDelete('lessons', u.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  ))}

                  {/* LIVE ROOMS LIST */}
                  {activeView === 'live' && liveRooms.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-rose-100 shadow-sm group hover:border-rose-300 transition-all">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center animate-pulse"><MonitorPlay className="w-6 h-6"/></div>
                          <span className="font-black text-slate-800">{r.title}</span>
                       </div>
                       <button onClick={() => handleDelete('live_rooms', r.id)} className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}