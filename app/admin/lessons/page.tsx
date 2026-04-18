'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, FileText, Loader2, BookOpen, Layers, Edit } from 'lucide-react';
import { LessonEditorModal } from '@/src/components/LessonEditorModal';

export default function LessonsManagement() {
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [orgId, setOrgId] = useState<string>('');
  
  // Data States
  const [courses, setCourses] = useState<any[]>([]);
  const [chapters, setChapters] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  
  // Selection States
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedChapterId, setSelectedChapterId] = useState('');

  // Form State
  const [newLesson, setNewLesson] = useState({ title: '', order: 1, type: 'text', content: '' });
  const [saving, setSaving] = useState(false);

  // Editor Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const adminDoc = await getDoc(doc(db, 'users', user.uid));
        if (adminDoc.exists()) {
          const profile = adminDoc.data();
          setAdminProfile(profile);
          setOrgId(profile.orgId || '');
          fetchCourses(profile.orgId);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCourses = async (currentOrgId: string) => {
    try {
      const q = query(collection(db, 'courses'), where("orgId", "==", currentOrgId));
      const snap = await getDocs(q);
      setCourses(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourseId || !orgId) {
      setChapters([]);
      return;
    }
    const fetchChapters = async () => {
      const q = query(
        collection(db, 'chapters'),
        where("courseId", "==", selectedCourseId),
        where("orgId", "==", orgId)
      );
      const snap = await getDocs(q);
      const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetched.sort((a: any, b: any) => a.order - b.order);
      setChapters(fetched);
    };
    fetchChapters();
  }, [selectedCourseId, orgId]);

  useEffect(() => {
    if (!selectedChapterId || !orgId) {
      setLessons([]);
      return;
    }
    fetchLessons();
  }, [selectedChapterId, orgId]);

  const fetchLessons = async () => {
    if (!selectedChapterId || !orgId) return;
    const q = query(
      collection(db, 'lessons'),
      where("chapterId", "==", selectedChapterId),
      where("orgId", "==", orgId)
    );
    const snap = await getDocs(q);
    const fetched = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    fetched.sort((a: any, b: any) => a.order - b.order);
    setLessons(fetched);
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId || !selectedCourseId || !selectedChapterId) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'lessons'), {
        ...newLesson,
        courseId: selectedCourseId,
        chapterId: selectedChapterId,
        orgId: orgId,
        createdAt: serverTimestamp()
      });
      setNewLesson({ title: '', order: lessons.length + 1, type: 'text', content: '' });
      fetchLessons();
    } catch (error) {
      console.error("Error adding lesson:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCourseId(e.target.value);
    setSelectedChapterId('');
  };

  const openEditor = (lesson: any) => {
    setEditingLesson(lesson);
    setIsEditorOpen(true);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
            <FileText className="w-7 h-7 text-blue-600" /> Διαχείριση Ενοτήτων
          </h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Επιλέξτε μάθημα και κεφάλαιο για να προσθέσετε ύλη.</p>
        </div>

        <div className="flex-1 flex flex-col sm:flex-row gap-4 justify-end">
          <div className="w-full sm:w-64">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Βημα 1: Μαθημα
            </label>
            <select 
              value={selectedCourseId}
              onChange={handleCourseChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 bg-slate-50"
            >
              <option value="">Επιλέξτε Μαθημα...</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> Βημα 2: Κεφαλαιο
            </label>
            <select 
              disabled={!selectedCourseId}
              value={selectedChapterId}
              onChange={(e) => setSelectedChapterId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 bg-slate-50 disabled:opacity-50"
            >
              <option value="">Επιλέξτε Κεφαλαιο...</option>
              {chapters.map(ch => <option key={ch.id} value={ch.id}>{ch.order}. {ch.title}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold mb-6 text-slate-700 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" /> Νέα Ενότητα
          </h3>
          <form onSubmit={handleAddLesson} className="space-y-5">
            <div>
              <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Τίτλος Ενότητας</label>
              <input 
                type="text" required value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                disabled={!selectedChapterId}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:bg-slate-50"
                placeholder="π.χ. Θεωρία 1: Εισαγωγή"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Σειρά</label>
                <input 
                  type="number" min="1" required value={newLesson.order}
                  onChange={(e) => setNewLesson({...newLesson, order: parseInt(e.target.value)})}
                  disabled={!selectedChapterId}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase mb-2">Τύπος</label>
                <select 
                  value={newLesson.type}
                  onChange={(e) => setNewLesson({...newLesson, type: e.target.value})}
                  disabled={!selectedChapterId}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium disabled:opacity-50 disabled:bg-slate-50"
                >
                  <option value="text">Κείμενο (Θεωρία)</option>
                  <option value="video">Βίντεο (URL)</option>
                  <option value="pdf">Αρχείο PDF</option>
                  <option value="quiz">Άσκηση / Quiz</option>
                </select>
              </div>
            </div>

            <button 
              disabled={!selectedChapterId || saving}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex justify-center items-center gap-2 mt-4"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'ΠΡΟΣΘΗΚΗ ΕΝΟΤΗΤΑΣ'}
            </button>
            {!selectedChapterId && (
              <p className="text-xs text-amber-600 font-bold text-center mt-2">
                Επιλέξτε μάθημα και κεφάλαιο πρώτα.
              </p>
            )}
          </form>
        </div>

        <div className="xl:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">#</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Τιτλος Ενοτητας</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Τυπος</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => (
                    <tr key={lesson.id} className="border-b border-slate-100 hover:bg-blue-50/50 transition-colors group">
                      <td className="p-5 font-black text-slate-400">{lesson.order}</td>
                      <td className="p-5 font-bold text-slate-800">{lesson.title}</td>
                      <td className="p-5">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                          {lesson.type}
                        </span>
                      </td>
                      <td className="p-5 text-right flex items-center justify-end gap-2">
                        <button 
                          onClick={() => openEditor(lesson)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Επεξεργασία Περιεχομένου"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={async () => {
                            if(confirm('Διαγραφή αυτής της ενότητας;')) {
                              await deleteDoc(doc(db, 'lessons', lesson.id));
                              fetchLessons();
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Διαγραφή"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {lessons.length === 0 && selectedChapterId && (
              <div className="p-16 text-center">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Το κεφάλαιο δεν έχει ύλη ακόμα.</p>
              </div>
            )}
            
            {!selectedChapterId && (
              <div className="p-16 text-center">
                <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">Επιλέξτε ένα Κεφάλαιο από το μενού πάνω για να δείτε την ύλη του.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LessonEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => { setIsEditorOpen(false); setEditingLesson(null); }} 
        lesson={editingLesson} 
        onUpdate={fetchLessons} 
      />
    </div>
  );
}