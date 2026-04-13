'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, User, ChevronRight } from 'lucide-react';
import { syllabusData } from '@/src/data/syllabusData';

function SyllabusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const subjectId = searchParams.get('subject');
  const gradeId = searchParams.get('grade');

  // Αναζήτηση της ύλης στα δεδομένα μας
  const currentSyllabus = syllabusData.find(
    (s) => s.subjectId === subjectId && s.gradeId === gradeId
  );

  // Περίπτωση που η ύλη δεν έχει καταχωρηθεί ακόμα
  if (!currentSyllabus) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <BookOpen className="w-20 h-20 text-slate-300 mb-6" />
        <h2 className="text-3xl font-black text-slate-800 mb-2">Η ύλη ετοιμάζεται...</h2>
        <p className="text-slate-500 mb-8 max-w-md">
          Οι καθηγητές μας επεξεργάζονται το υλικό για αυτό το μάθημα. Παρακαλώ επιστρέψτε σε λίγο!
        </p>
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Επιστροφή</span>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Hero Section - Εντυπωσιακή Κεφαλίδα */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        {/* Διακοσμητικά στοιχεία φόντου */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-blue-200 hover:text-white mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Πίσω στα μαθήματα</span>
          </button>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-blue-100 text-sm font-bold mb-6 tracking-wider uppercase">
            <BookOpen className="w-4 h-4" />
            <span>Αναλυτικη Υλη</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
            {currentSyllabus.title}
          </h1>
          <h2 className="text-xl md:text-2xl text-blue-200 font-bold mb-6">
            {currentSyllabus.gradeName}
          </h2>
          <p className="text-lg text-blue-100/80 max-w-2xl leading-relaxed">
            {currentSyllabus.description}
          </p>
        </div>
      </div>

      {/* Λίστα Κεφαλαίων */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="space-y-6">
          {currentSyllabus.chapters.map((chapter, index) => (
            <div key={chapter.id} className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 transform transition-all hover:-translate-y-1">
              
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl flex-shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                    {chapter.title}
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    {chapter.description}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Ενότητες:</h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chapter.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Παρότρυνση για Εγγραφή (CTA) */}
        <div className="mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl shadow-orange-200 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/geometric.png')] mix-blend-overlay"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black mb-4">Είσαι έτοιμος να ξεκινήσεις;</h3>
            <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto font-medium">
              Δημιούργησε έναν δωρεάν λογαριασμό και απόκτησε πρόσβαση σε όλο το εκπαιδευτικό υλικό και τις ασκήσεις.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-2xl font-black text-lg hover:bg-orange-50 transition-colors shadow-xl"
            >
              <User className="w-6 h-6" />
              <span>Κάνε Εγγραφή Τώρα</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper με Suspense για τη χρήση searchParams
export default function SyllabusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Φόρτωση ύλης...</div>}>
      <SyllabusContent />
    </Suspense>
  );
}