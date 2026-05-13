'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MonitorPlay, ChevronLeft, Loader2, Video } from 'lucide-react';
import { auth, db } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { courseService } from '@/src/services/courseService';
import { greekEducationData } from '@/src/data/greekEducation';

// Ορίζουμε τι περιμένουμε να έχει ένα Live Room για να μην βγάζει error το build
interface LiveRoom {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
  courseId: string;
  courseDetails?: any;
}

export default function StudentLivePage() {
  const [loading, setLoading] = useState(true);
  const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const profile = await courseService.getUserProfile(user.uid);
          
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          let currentOrgId = (profile as any)?.orgId;
          if (userDocSnap.exists() && userDocSnap.data().orgId) {
             currentOrgId = userDocSnap.data().orgId;
          }
          if (!currentOrgId) {
            setLoading(false);
            return;
          }
          
          const category = greekEducationData.find(c => c.id === profile?.schoolType);
          const studentGradeId = category?.grades.find(g => g.id === profile?.grade)?.id;

          const [coursesSnap, roomsSnap] = await Promise.all([
            getDocs(query(collection(db, 'courses'), where('orgId', '==', currentOrgId))),
            getDocs(query(collection(db, 'live_rooms'), where('orgId', '==', currentOrgId)))
          ]);

          const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          const activeRooms = roomsSnap.docs
            .map(d => {
              const roomData = d.data();
              const courseInfo = courses.find(c => c.id === roomData.courseId);
              return { 
                id: d.id, 
                title: roomData.title || '',
                url: roomData.url || '',
                isActive: roomData.isActive || false,
                courseId: roomData.courseId || '',
                courseDetails: courseInfo 
              } as LiveRoom;
            })
            .filter(room => room.isActive && room.courseDetails?.gradeId === studentGradeId);

          setLiveRooms(activeRooms);
        } catch (e) {
          console.error("Error fetching live rooms:", e);
        }
        setLoading(false);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans relative selection:bg-blue-500/30">
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none -z-10"></div>
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-bold mb-8 transition-colors group">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Επιστροφή στο Dashboard
        </button>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-500/20 mb-12 relative overflow-hidden">
          <MonitorPlay className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-white/20">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> Live Ηλεκτρονικη Ταξη
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Ζωντανά Μαθήματα</h1>
            <p className="text-blue-100 text-lg max-w-xl font-medium">Εδώ βρίσκονται όλες οι ψηφιακές αίθουσες των καθηγητών σου. Μπες στο μάθημα με ένα κλικ!</p>
          </div>
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <Video className="w-6 h-6 text-blue-500" /> Διαθέσιμες Αίθουσες Καθηγητών
        </h3>

        {liveRooms.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 py-24 text-center flex flex-col items-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-slate-300" />
            </div>
            <h4 className="text-2xl font-black text-slate-800 tracking-tight">Δεν βρέθηκαν Αίθουσες</h4>
            <p className="text-slate-500 font-medium mt-2">Αυτή τη στιγμή κανένας καθηγητής δεν έχει ανοιχτή ζωντανή κλήση για την τάξη σου.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveRooms.map(room => (
              <div key={room.id} className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">{room.courseDetails?.title || 'ΜΑΘΗΜΑ'}</p>
                    <h4 className="text-2xl font-black text-slate-800 tracking-tight">{room.title}</h4>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <MonitorPlay className="w-6 h-6" />
                  </div>
                </div>

                <a 
                  href={room.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-full py-4 bg-slate-900 hover:bg-blue-600 text-white text-center text-sm font-black rounded-xl transition-all duration-300 shadow-md hover:shadow-blue-500/30"
                >
                  ΣΥΝΔΕΣΗ ΣΤΟ ΜΑΘΗΜΑ
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}