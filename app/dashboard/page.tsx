'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Target, Video, Lightbulb, LogOut, Settings, Bell, ExternalLink,
  ShieldAlert, ChevronRight, BookOpen, GraduationCap, UserCog,
  Loader2, Gift, MonitorPlay, Award, Palette, ShieldCheck, X,
  Trophy, CheckCircle2, XCircle, RotateCcw, ChevronLeft, Compass
} from 'lucide-react';

import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { courseService } from '@/src/services/courseService';
import { greekEducationData, type Grade } from '@/src/data/greekEducation';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('EduPlatform');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrgActive, setIsOrgActive] = useState(true);
  
  const [orgCourses, setOrgCourses] = useState<any[]>([]); 
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  
  // --- DEBUG STATE ---
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const [profile, userRole] = await Promise.all([
            courseService.getUserProfile(user.uid),
            courseService.getUserRole(user.uid)
          ]);
          setUserProfile(profile);
          setIsAdmin(userRole === 'admin' || user.email === 'test2@gmail.com' || user.email === 'spapasotiropoulos@gmail.com');

          // Βρίσκουμε την τάξη
          if (profile && profile.schoolType && profile.grade) {
            const category = greekEducationData.find(c => c.id === profile.schoolType);
            const grade = category?.grades.find(g => g.id === profile.grade || g.name === profile.grade);
            if (grade) setSelectedGrade(grade);
          }

          // Βρίσκουμε το orgId
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          let currentOrgId = (profile as any)?.orgId;
          if (userDocSnap.exists() && userDocSnap.data().orgId) {
            currentOrgId = userDocSnap.data().orgId;
          }
          if (!currentOrgId) currentOrgId = 'default-org';

          // Τραβάμε ΟΛΑ τα courses
          const coursesSnap = await getDocs(query(collection(db, 'courses'), where("orgId", "==", currentOrgId)));
          const fetchedCourses = coursesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          setOrgCourses(fetchedCourses);

          // ΣΩΖΟΥΜΕ ΤΑ DEBUG INFO ΓΙΑ ΝΑ ΤΑ ΔΟΥΜΕ ΣΤΗΝ ΟΘΟΝΗ
          setDebugInfo({
            userEmail: user.email,
            userOrgId: currentOrgId,
            profileSchoolType: profile?.schoolType || 'ΔΕΝ ΥΠΑΡΧΕΙ',
            profileGrade: profile?.grade || 'ΔΕΝ ΥΠΑΡΧΕΙ',
            totalCoursesFoundInOrg: fetchedCourses.length
          });

        } catch (error) { 
          console.error("Dashboard Fetch Error:", error); 
        }
        setLoading(false);
      } else {
        window.location.href = '/';
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try { await signOut(auth); window.location.href = '/'; } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans relative">
      
      {/* X-RAY DEBUG PANEL (Φαίνεται μόνο προσωρινά για να βρούμε το λάθος) */}
      <div className="bg-red-600 text-white p-6 m-4 rounded-2xl shadow-2xl border-4 border-red-800 relative z-[10000]">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2"><ShieldAlert /> ΠΙΝΑΚΑΣ ΕΛΕΓΧΟΥ ΛΑΘΩΝ (X-RAY)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
          <div className="bg-red-900/50 p-3 rounded-xl">
            <p className="text-red-300">ORG ID ΜΑΘΗΤΗ</p>
            <p className="font-bold text-lg">{debugInfo.userOrgId}</p>
          </div>
          <div className="bg-red-900/50 p-3 rounded-xl">
            <p className="text-red-300">SCHOOL TYPE</p>
            <p className="font-bold text-lg">{debugInfo.profileSchoolType}</p>
          </div>
          <div className="bg-red-900/50 p-3 rounded-xl">
            <p className="text-red-300">GRADE ID ΜΑΘΗΤΗ</p>
            <p className="font-bold text-lg">{debugInfo.profileGrade}</p>
          </div>
          <div className="bg-red-900/50 p-3 rounded-xl">
            <p className="text-red-300">ΜΑΘΗΜΑΤΑ ΠΟΥ ΒΡΕΘΗΚΑΝ</p>
            <p className="font-bold text-lg">{debugInfo.totalCoursesFoundInOrg}</p>
          </div>
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-gray-100 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-black text-blue-900 tracking-tight">EduPlatform</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">{currentUser?.email}</span>
              <button onClick={handleSignOut} className="px-3 py-2 text-sm font-bold text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg">Αποσύνδεση</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* ΜΑΘΗΜΑΤΑ (ΧΩΡΙΣ ΚΑΝΕΝΑ ΦΙΛΤΡΟ) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3"><BookOpen className="w-6 h-6 text-blue-600" />Όλα τα Μαθήματα του Οργανισμού</h3>
          </div>
          
          {orgCourses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center">
              <h4 className="text-lg font-black text-slate-700 mb-2">Η βάση δεν επιστρέφει μαθήματα.</h4>
              <p className="text-slate-500 font-medium">Αν βλέπεις αυτό, το Firebase μπλοκάρει την ανάγνωση ή το orgId του μαθήματος είναι διαφορετικό από το orgId του μαθητή.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {orgCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-3xl p-6 border-2 border-blue-500 shadow-md relative">
                  <div className="absolute -top-3 -right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-black">
                    GRADE ID: {course.gradeId}
                  </div>
                  <h4 className="text-lg font-black text-slate-800 mb-4">{course.title}</h4>
                  <div className="text-xs font-mono text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg">
                    <p>Course ID: <span className="text-slate-900 font-bold">{course.id}</span></p>
                    <p>Org ID: <span className="text-slate-900 font-bold">{course.orgId}</span></p>
                  </div>
                  <button onClick={() => window.location.href = `/dashboard/course/${course.id}`} className="mt-4 w-full py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100">
                    Άνοιγμα Μαθήματος
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}