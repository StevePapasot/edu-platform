'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/lib/firebase';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { courseService } from '@/src/services/courseService';
import { CheckCircle2, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

type Status = 'idle' | 'checking' | 'ready' | 'running' | 'done' | 'error' | 'unauthorized';

export default function FixOrderPage() {
  const [status, setStatus] = useState<Status>('checking');
  const [log, setLog] = useState<string[]>([]);
  const [counts, setCounts] = useState({ chapters: 0, lessons: 0 });

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setStatus('unauthorized'); return; }
      const role = await courseService.getUserRole(user.uid);
      if (role !== 'admin' && role !== 'superAdmin') {
        setStatus('unauthorized');
        return;
      }
      setStatus('ready');
    });
    return () => unsub();
  }, []);

  const runFix = async () => {
    setStatus('running');
    setLog([]);
    
    try {
      const batch = writeBatch(db);
      let chapterCount = 0;
      let lessonCount = 0;

      // ── CHAPTERS ──────────────────────────────────────────
      addLog('Φόρτωση κεφαλαίων...');
      const chapSnap = await getDocs(collection(db, 'chapters'));
      
      // Group chapters by courseId
      const chapsByCourse: Record<string, any[]> = {};
      chapSnap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() } as any;
        const key = data.courseId || 'unknown';
        if (!chapsByCourse[key]) chapsByCourse[key] = [];
        chapsByCourse[key].push(data);
      });

      // Sort each group by createdAt and assign order 1,2,3...
      Object.entries(chapsByCourse).forEach(([courseId, chaps]) => {
        chaps.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return aTime - bTime;
        });
        chaps.forEach((chap, index) => {
          batch.update(doc(db, 'chapters', chap.id), { order: index + 1 });
          chapterCount++;
        });
      });

      addLog(`✓ ${chapterCount} κεφάλαια βρέθηκαν`);

      // ── LESSONS ───────────────────────────────────────────
      addLog('Φόρτωση ενοτήτων...');
      const lesSnap = await getDocs(collection(db, 'lessons'));

      // Group lessons by chapterId
      const lessByChapter: Record<string, any[]> = {};
      lesSnap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() } as any;
        const key = data.chapterId || 'unknown';
        if (!lessByChapter[key]) lessByChapter[key] = [];
        lessByChapter[key].push(data);
      });

      // Sort each group by createdAt and assign order 1,2,3...
      Object.entries(lessByChapter).forEach(([chapterId, lessons]) => {
        lessons.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return aTime - bTime;
        });
        lessons.forEach((lesson, index) => {
          batch.update(doc(db, 'lessons', lesson.id), { order: index + 1 });
          lessonCount++;
        });
      });

      addLog(`✓ ${lessonCount} ενότητες βρέθηκαν`);

      // ── COMMIT ────────────────────────────────────────────
      addLog('Αποθήκευση...');
      await batch.commit();

      setCounts({ chapters: chapterCount, lessons: lessonCount });
      addLog('✓ Ολοκληρώθηκε επιτυχώς!');
      setStatus('done');

    } catch (err: any) {
      addLog(`❌ Σφάλμα: ${err.message}`);
      setStatus('error');
    }
  };

  if (status === 'checking') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (status === 'unauthorized') return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <p className="font-bold text-slate-700">Δεν έχετε πρόσβαση σε αυτή τη σελίδα.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg p-10 max-w-lg w-full">
        
        <h1 className="text-2xl font-black text-slate-800 mb-2">
          Διόρθωση Σειράς Περιεχομένου
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Αυτό το εργαλείο διορθώνει μια εφάπαξ τη σειρά εμφάνισης κεφαλαίων και ενοτήτων. 
          Τρέξτε το μόνο μία φορά.
        </p>

        {status === 'done' ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <p className="font-black text-xl text-slate-800">Έτοιμο!</p>
            <p className="text-slate-500 text-sm">
              {counts.chapters} κεφάλαια και {counts.lessons} ενότητες ενημερώθηκαν.
            </p>
            <p className="text-xs text-slate-400 bg-slate-50 rounded-xl p-3">
              Μπορείτε τώρα να διαγράψετε αυτή τη σελίδα από το Bolt.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">
                Η σειρά θα καθοριστεί από την ημερομηνία δημιουργίας κάθε στοιχείου. 
                Το παλαιότερο θα εμφανίζεται πρώτο.
              </p>
            </div>

            {log.length > 0 && (
              <div className="bg-slate-900 rounded-xl p-4 mb-6 font-mono text-xs text-slate-300 space-y-1">
                {log.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}

            <button
              onClick={runFix}
              disabled={status === 'running'}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {status === 'running' ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Εκτέλεση...</>
              ) : (
                'Εκτέλεση Διόρθωσης'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}