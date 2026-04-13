'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, BookOpen, Trash2, Save, Loader2, CheckCircle2, UserCircle } from 'lucide-react';
import { greekEducationData } from '@/src/data/greekEducation';

export default function AdminCoursesPage() {
  const [adminProfile, setAdminProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Αρχικοποίηση με τις πρώτες τιμές του αρχείου σου
  const initialCategory = greekEducationData[0];
  const initialGrade = initialCategory.grades[0];
  const initialSubject = initialGrade.subjects?.[0];

  const [newCourse, setNewCourse] = useState({
    title: '',
    schoolType: initialCategory.id,
    gradeId: initialGrade.id,
    pathwayId: '', // Εδώ αποθηκεύουμε την Κατεύθυνση ή τον Τομέα
    subjectId: initialSubject?.id || '', // Το συγκεκριμένο μάθημα
    description: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUserId(user.uid); // Κρατάμε το ID του Καθηγητή
        const adminDoc = await getDoc(doc(db, 'users', user.uid));
        if (adminDoc.exists()) {
          const profile = adminDoc.data();
          setAdminProfile(profile);
          fetchCourses(profile.orgId, user.uid); // Στέλνουμε και το User ID για το φιλτράρισμα
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchCourses = async (orgId: string, userId: string) => {
    try {
      const q = query(collection(db, 'courses'), where("orgId", "==", orgId));
      const querySnapshot = await getDocs(q);
      
      // ΦΙΛΤΡΑΡΙΣΜΑ: Κρατάμε ΜΟΝΟ τα μαθήματα που έφτιαξε αυτός ο καθηγητής!
      const fetched = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter((course: any) => course.createdBy === userId);
        
      setCourses(fetched);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminProfile?.orgId || !currentUserId) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'courses'), {
        ...newCourse,
        orgId: adminProfile.orgId, 
        institutionName: adminProfile.institutionName,
        createdBy: currentUserId, // Η "ΣΤΑΜΠΑ" ΤΟΥ ΚΑΘΗΓΗΤΗ!
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setNewCourse({ ...newCourse, title: '', description: '' });
      fetchCourses(adminProfile.orgId, currentUserId);
    } catch (error) {
      console.error("Error adding course:", error);
    } finally {
      setSaving(false);
    }
  };

  // --- ΕΞΥΠΝΗ ΛΟΓΙΚΗ ΓΙΑ ΤΑ DROPDOWNS ---
  const activeCategory = greekEducationData.find(c => c.id === newCourse.schoolType) || greekEducationData[0];
  const activeGrade = activeCategory.grades.find(g => g.id === newCourse.gradeId) || activeCategory.grades[0];
  const isGelOrientations = activeGrade.orientations && activeGrade.orientations.length > 0;
  const isEpalSectors = activeGrade.sectors && activeGrade.sectors.length > 0;
  const pathways: any[] = isGelOrientations ? activeGrade.orientations! : (isEpalSectors ? activeGrade.sectors! : []);
  const activePathway = pathways.find(p => p.id === newCourse.pathwayId) || pathways[0];
  const availableSubjects = activePathway ? activePathway.subjects : (activeGrade.subjects || []);

  const handleSchoolTypeChange = (catId: string) => {
    const cat = greekEducationData.find(c => c.id === catId);
    if (!cat) return;
    const firstGrade = cat.grades[0];
    const firstPathway = firstGrade.orientations?.[0] || firstGrade.sectors?.[0];
    const firstSubj = firstPathway ? firstPathway.subjects[0] : firstGrade.subjects?.[0];

    setNewCourse({
      ...newCourse,
      schoolType: catId,
      gradeId: firstGrade.id,
      pathwayId: firstPathway?.id || '',
      subjectId: firstSubj?.id || ''
    });
  };

  const handleGradeChange = (gId: string) => {
    const grade = activeCategory.grades.find(g => g.id === gId);
    if (!grade) return;
    const firstPathway = grade.orientations?.[0] || grade.sectors?.[0];
    const firstSubj = firstPathway ? firstPathway.subjects[0] : grade.subjects?.[0];

    setNewCourse({
      ...newCourse,
      gradeId: gId,
      pathwayId: firstPathway?.id || '',
      subjectId: firstSubj?.id || ''
    });
  };

  const handlePathwayChange = (pId: string) => {
    const pathway = pathways.find(p => p.id === pId);
    const firstSubj = pathway?.subjects[0];
    
    setNewCourse({
      ...newCourse,
      pathwayId: pId,
      subjectId: firstSubj?.id || ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Διαχείριση Ύλης</h1>
            <p className="text-slate-500 font-medium">
              Οργανισμός: <span className="text-blue-600 font-bold">{adminProfile?.institutionName}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <UserCircle className="w-4 h-4" /> Προσωπικός Χώρος
            </div>
            <div className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-200">
              <CheckCircle2 className="w-4 h-4" /> Multi-tenant Active
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <Plus className="w-5 h-5 text-blue-600" /> Νέο Μάθημα
            </h2>
            <form onSubmit={handleAddCourse} className="space-y-4">
              
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Τύπος Σχολείου</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
                  value={newCourse.schoolType}
                  onChange={(e) => handleSchoolTypeChange(e.target.value)}
                >
                  {greekEducationData.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Τάξη</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
                  value={newCourse.gradeId}
                  onChange={(e) => handleGradeChange(e.target.value)}
                >
                  {activeCategory.grades.map(grade => (
                    <option key={grade.id} value={grade.id}>{grade.name}</option>
                  ))}
                </select>
              </div>

              {/* ΕΜΦΑΝΙΖΕΤΑΙ ΜΟΝΟ ΑΝ ΥΠΑΡΧΕΙ ΚΑΤΕΥΘΥΝΣΗ/ΤΟΜΕΑΣ */}
              {pathways.length > 0 && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">
                    {isGelOrientations ? 'Κατεύθυνση' : 'Τομέας / Ειδικότητα'}
                  </label>
                  <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
                    value={newCourse.pathwayId || (pathways[0]?.id)}
                    onChange={(e) => handlePathwayChange(e.target.value)}
                  >
                    {pathways.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {/* ΤΟ ΕΠΙΣΗΜΟ ΜΑΘΗΜΑ */}
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Επίσημο Μάθημα</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium bg-slate-50"
                  value={newCourse.subjectId || (availableSubjects[0]?.id)}
                  onChange={(e) => setNewCourse({...newCourse, subjectId: e.target.value})}
                >
                  {availableSubjects.map((subj: any) => (
                    <option key={subj.id} value={subj.id}>{subj.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Ονομασία (Τίτλος στο Φροντιστήριο)</label>
                <input 
                  type="text" 
                  required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  placeholder="π.χ. Μαθηματικά Τμήμα Α1"
                />
              </div>

              <button 
                disabled={saving}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-50 mt-4"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                ΔΗΜΙΟΥΡΓΙΑ ΜΑΘΗΜΑΤΟΣ
              </button>
            </form>
          </div>

          {/* ΛΙΣΤΑ ΜΑΘΗΜΑΤΩΝ */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <BookOpen className="w-5 h-5 text-blue-600" /> Τα Μαθήματά Μου ({courses.length})
            </h2>
            
            {courses.length === 0 ? (
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-sm">
                Δεν έχετε δημιουργήσει μαθήματα ακόμα.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between group hover:border-blue-300 transition-all">
                    <div>
                      <h4 className="font-bold text-slate-800">{course.title}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">
                        {course.schoolType} | {course.gradeId}
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        if(confirm('Διαγραφή;')) {
                          await deleteDoc(doc(db, 'courses', course.id));
                          fetchCourses(adminProfile.orgId, currentUserId!);
                        }
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}