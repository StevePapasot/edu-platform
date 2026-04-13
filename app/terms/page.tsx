'use client';

import Link from 'next/link'; // <--- ΑΥΤΟ ΕΛΕΙΠΕ!
import { ChevronLeft, ShieldCheck, FileText, Lock, Globe, Mail } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* NAVIGATION */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-blue-900 hover:text-blue-700 transition-colors font-black text-xl">
            <ChevronLeft className="w-5 h-5" /> EduPlatform
          </Link>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Νομικα Εγγραφα</span>
        </div>
      </nav>

      {/* HEADER */}
      <div className="bg-blue-900 py-16 sm:py-24 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tight">Όροι Χρήσης & Πολιτική Απορρήτου</h1>
          <p className="text-blue-100 text-lg font-medium opacity-80">Τελευταία ενημέρωση: 11 Απριλίου 2026</p>
        </div>
      </div>

      {/* CONTENT */}
      <main className="max-w-4xl mx-auto px-4 -mt-10">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 sm:p-12 space-y-12">
          
          <section className="space-y-4">
            <div className="flex items-center gap-3 text-blue-600 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg"><Globe className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">1. Γενικοί Όροι</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Καλώς ήρθατε στο EduPlatform. Η χρήση της πλατφόρμας μας συνεπάγεται την πλήρη αποδοχή των παρακάτω όρων. Η πλατφόρμα παρέχει εκπαιδευτικό υλικό και εργαλεία για μαθητές Γυμνασίου και Λυκείου.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg"><FileText className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">2. Πνευματική Ιδιοκτησία</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Όλο το περιεχόμενο (βίντεο, PDF, σημειώσεις, κουίζ) αποτελεί πνευματική ιδιοκτησία του EduPlatform και των δημιουργών του. Απαγορεύεται αυστηρά η αναπαραγωγή, διανομή ή πώληση του υλικού χωρίς γραπτή άδεια.
            </p>
          </section>

          <section className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100">
            <div className="flex items-center gap-3 text-fuchsia-600 mb-6">
              <div className="p-2 bg-fuchsia-50 rounded-lg"><ShieldCheck className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">3. Affiliate Links & Διαφημίσεις</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium italic">
              Η πλατφόρμα μας περιέχει συνδέσμους συνεργατών (Affiliate Links) από τρίτους παρόχους (π.χ. Udemy, Coursera, κλπ). Εάν κάνετε μια αγορά μέσω αυτών των συνδέσμων, ενδέχεται να λάβουμε μια μικρή προμήθεια χωρίς καμία επιπλέον επιβάρυνση για εσάς.
            </p>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 mb-6">
              <div className="p-2 bg-emerald-50 rounded-lg"><Lock className="w-6 h-6" /></div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">4. Πολιτική Απορρήτου (GDPR)</h2>
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              Σεβόμαστε τα προσωπικά σας δεδομένα. Συλλέγουμε μόνο τα απαραίτητα στοιχεία (Email, Όνομα) για τη δημιουργία του λογαριασμού σας και την παρακολούθηση της προόδου σας.
            </p>
          </section>

          <div className="pt-10 border-t border-slate-100 flex flex-col items-center gap-4">
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Εχετε αποριες;</p>
            <a href="mailto:info@eduplatform.gr" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">
              <Mail className="w-5 h-5" /> ΕΠΙΚΟΙΝΩΝΙΑ
            </a>
          </div>

          {/* FOOTER ΜΕΣΑ ΣΤΗ ΣΕΛΙΔΑ TERMS */}
          <footer className="mt-10 pt-8 border-t border-slate-50 flex flex-col items-center gap-2">
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Developed by Stavros Papasotiropoulos</p>
          </footer>

        </div>
      </main>
    </div>
  );
}