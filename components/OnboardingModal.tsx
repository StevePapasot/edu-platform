'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User as UserIcon, BookOpen, GraduationCap, ChevronRight, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { courseService } from '@/src/services/courseService';
import { greekEducationData, type Category, type Grade } from '@/src/data/greekEducation';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

type AuthMode = 'login' | 'signup' | 'details' | 'forgot-password' | 'email-sent';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedOrientation, setSelectedOrientation] = useState<string | null>(null);
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        await courseService.createUserProfile(userCredential.user.uid, email);
        setMode('details');
        setLoading(false);
      } else if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const profile = await courseService.getUserProfile(userCredential.user.uid);
        if (profile && profile.grade) {
          if (onAuthSuccess) onAuthSuccess();
        } else {
          setMode('details');
          setLoading(false);
        }
      } else if (mode === 'forgot-password') {
        // ΛΟΓΙΚΗ ΓΙΑ ΞΕΧΑΣΜΕΝΟ ΚΩΔΙΚΟ
        if (!email) {
          setError('Παρακαλώ εισάγετε το email σας.');
          setLoading(false);
          return;
        }
        await sendPasswordResetEmail(auth, email);
        setMode('email-sent');
        setLoading(false);
      }
    } catch (err: any) {
      if (mode === 'forgot-password') {
        setError('Αποτυχία αποστολής. Ελέγξτε αν το email είναι σωστό.');
      } else {
        setError('Λάθος στοιχεία σύνδεσης. Δοκιμάστε ξανά.');
      }
      setLoading(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!inviteCode) {
      setError('Παρακαλώ εισάγετε τον κωδικό του φροντιστηρίου σας.');
      return;
    }

    if (!selectedCategory || !selectedGrade) {
      setError('Παρακαλώ επιλέξτε κατηγορία και τάξη.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Επαλήθευση κωδικού ΚΑΙ status φροντιστηρίου
      const orgsRef = collection(db, 'organizations');
      const q = query(orgsRef, where("inviteCode", "==", inviteCode.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Ο κωδικός φροντιστηρίου δεν είναι έγκυρος.');
        setLoading(false);
        return;
      }

      const orgDoc = querySnapshot.docs[0];
      const orgData = orgDoc.data();

      // ΕΛΕΓΧΟΣ STATUS
      if (orgData.status !== 'active') {
        setError('Η πρόσβαση για αυτό το φροντιστήριο είναι προσωρινά απενεργοποιημένη.');
        setLoading(false);
        return;
      }

      // 2. Αποθήκευση στο προφίλ
      const user = auth.currentUser;
      if (!user) throw new Error('Δεν βρέθηκε χρήστης.');

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        schoolType: selectedCategory.id,
        grade: selectedGrade.id,
        orientation: selectedOrientation || null,
        sector: selectedSector || null,
        orgId: orgData.orgId,
        institutionName: orgData.name,
        createdAt: new Date()
      });

      if (onAuthSuccess) onAuthSuccess(); 
    } catch (err: any) {
      setError('Αποτυχία αποθήκευσης. Δοκιμάστε ξανά.');
      setLoading(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setError('');
    setMode(newMode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-100" onClick={(e) => e.stopPropagation()}>
        <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 w-full"></div>
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full z-10" disabled={loading}>
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600 transform -rotate-6 transition-transform">
              {mode === 'details' ? <GraduationCap className="w-8 h-8" /> : mode === 'email-sent' ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <BookOpen className="w-8 h-8" />}
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {mode === 'login' && 'Καλώς ήρθες!'}
              {mode === 'signup' && 'Ξεκίνα Τώρα'}
              {mode === 'details' && 'Η Τάξη Σου'}
              {mode === 'forgot-password' && 'Επαναφορά Κωδικού'}
              {mode === 'email-sent' && 'Το Email Στάλθηκε!'}
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
          
          {/* LOGIN & SIGNUP ΦΟΡΜΑ */}
          {(mode === 'login' || mode === 'signup') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Όνομα</label>
                  <div className="relative border border-slate-200 rounded-2xl bg-slate-50 p-3.5 flex items-center gap-3">
                    <UserIcon className="w-5 h-5 text-slate-400" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-transparent outline-none w-full font-medium" placeholder="π.χ. Γιάννης" required />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email</label>
                <div className="relative border border-slate-200 rounded-2xl bg-slate-50 p-3.5 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent outline-none w-full font-medium" placeholder="email@school.gr" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Κωδικός</label>
                <div className="relative border border-slate-200 rounded-2xl bg-slate-50 p-3.5 flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-transparent outline-none w-full font-medium" placeholder="••••••••" required />
                </div>
                {/* Κουμπί Ξέχασα τον κωδικό */}
                {mode === 'login' && (
                  <div className="flex justify-end mt-2">
                    <button type="button" onClick={() => switchMode('forgot-password')} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                      Ξέχασες τον κωδικό σου;
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {mode === 'login' ? 'Σύνδεση' : 'Εγγραφή'}
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="text-sm font-bold text-slate-500 hover:text-blue-600">
                   {mode === 'login' ? 'Δεν έχεις λογαριασμό; Κάνε εγγραφή' : 'Έχεις ήδη λογαριασμό; Συνδέσου'}
                </button>
              </div>
            </form>
          )}

          {/* ΦΟΡΜΑ ΕΠΑΝΑΦΟΡΑΣ ΚΩΔΙΚΟΥ */}
          {mode === 'forgot-password' && (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-left-4">
              <p className="text-sm text-slate-600 font-medium text-center mb-4">
                Συμπλήρωσε το email σου και θα σου στείλουμε έναν σύνδεσμο για να φτιάξεις νέο κωδικό.
              </p>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email</label>
                <div className="relative border border-slate-200 rounded-2xl bg-slate-50 p-3.5 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-transparent outline-none w-full font-medium" placeholder="email@school.gr" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
                Αποστολή Email
              </button>
              <div className="text-center mt-4">
                <button type="button" onClick={() => switchMode('login')} className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 w-full">
                  <ArrowLeft className="w-4 h-4" /> Επιστροφή στη Σύνδεση
                </button>
              </div>
            </form>
          )}

          {/* ΟΘΟΝΗ ΕΠΙΤΥΧΙΑΣ ΑΠΟΣΤΟΛΗΣ EMAIL */}
          {mode === 'email-sent' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 text-center px-4">
               <p className="text-slate-600 font-medium">
                 Στείλαμε οδηγίες επαναφοράς κωδικού στο <strong>{email}</strong>.
                 <br/><br/>
                 Ελέγξτε τα εισερχόμενά σας (και τον φάκελο ανεπιθύμητων / spam).
               </p>
               <button type="button" onClick={() => switchMode('login')} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-lg">
                 Επιστροφή στη Σύνδεση
               </button>
            </div>
          )}

          {/* ΛΕΠΤΟΜΕΡΕΙΕΣ ΜΑΘΗΤΗ (Φροντιστήριο / Τάξη) */}
          {mode === 'details' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 text-center">Κωδικός Φροντιστηρίου</label>
                <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toUpperCase())} className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-2xl focus:border-blue-600 outline-none font-black tracking-widest text-center text-xl" placeholder="ΚΩΔΙΚΟΣ" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Τύπος Σχολείου</label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {greekEducationData.map((category) => (
                    <button key={category.id} onClick={() => { setSelectedCategory(category); setSelectedGrade(null); }} className={`py-3 px-1 font-bold rounded-xl border transition-all ${selectedCategory?.id === category.id ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCategory && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-bold text-slate-700 mb-3">Τάξη</label>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedCategory.grades.map((grade) => (
                      <button key={grade.id} onClick={() => setSelectedGrade(grade)} className={`py-3 px-2 text-sm font-bold rounded-xl border transition-all ${selectedGrade?.id === grade.id ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>
                        {grade.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={handleSaveDetails} disabled={!selectedCategory || !selectedGrade || !inviteCode || loading} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                Ολοκλήρωση <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};