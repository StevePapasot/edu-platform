import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface SubjectCardProps {
  subject: {
    id: string;
    title: string;
    progress?: number;
  };
  gradeId: string;
  isPublic?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, gradeId, isPublic = false }) => {
  const norm = subject.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  const getStyle = () => {
    if (norm.includes('μαθηματικ')) return 'bg-gradient-to-br from-orange-400 to-red-600 shadow-orange-200';
    if (norm.includes('φυσικ') && !norm.includes('αγωγ')) return 'bg-gradient-to-br from-blue-500 to-indigo-800 shadow-blue-200';
    if (norm.includes('χημει')) return 'bg-gradient-to-br from-emerald-400 to-teal-700 shadow-emerald-200';
    if (norm.includes('βιολογ')) return 'bg-gradient-to-br from-lime-400 to-green-700 shadow-green-200';
    if (norm.includes('ελληνικ') || norm.includes('γλωσσ')) return 'bg-gradient-to-br from-purple-500 to-fuchsia-700 shadow-purple-200';
    if (norm.includes('αρχαι') || norm.includes('ιστορι')) return 'bg-gradient-to-br from-amber-500 to-orange-800 shadow-amber-200';
    if (norm.includes('αγγλικ')) return 'bg-gradient-to-br from-pink-400 to-rose-600 shadow-pink-200';
    if (norm.includes('φυσικ') && norm.includes('αγωγ')) return 'bg-gradient-to-br from-cyan-400 to-blue-600 shadow-cyan-200';
    if (norm.includes('πληροφορ')) return 'bg-gradient-to-br from-slate-600 to-gray-900 shadow-slate-200';
    
    return 'bg-gradient-to-br from-sky-400 to-blue-600 shadow-blue-200';
  };

  const bgClass = getStyle();

  return (
    <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 group flex flex-col h-full transform hover:-translate-y-1 font-sans">
      
      {/* Header */}
      <div className={`h-32 w-full ${bgClass} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/geometric.png')] mix-blend-overlay"></div>
      </div>

      {/* Πληροφορίες & Κουμπί */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-extrabold text-gray-800 mb-6 line-clamp-2 min-h-[3.5rem] tracking-tight">
          {subject.title}
        </h3>
        
        {/* ΛΟΓΙΚΗ ΕΜΦΑΝΙΣΗΣ (Public vs Private) */}
        {!isPublic ? (
          <div className="mt-auto mb-6">
            <div className="flex justify-between items-center text-sm font-bold text-gray-500 mb-2">
              <span>Πρόοδος</span>
              <span className="text-blue-600">{subject.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden shadow-inner">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${subject.progress || 0}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="mt-auto mb-6">
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Ανακαλύψτε την ύλη, τις ενότητες και τους εκπαιδευτικούς στόχους του μαθήματος.
            </p>
          </div>
        )}

        {/* Δυναμικό Κουμπί */}
        <Link 
          href={isPublic ? `/syllabus?subject=${subject.id}&grade=${gradeId}` : `/dashboard/course/${subject.id}`}
          className="flex items-center justify-between w-full px-5 py-3.5 bg-gray-50 text-gray-700 rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 group/btn border border-gray-200 hover:border-transparent shadow-sm"
        >
          <span>{isPublic ? 'Δείτε την Ύλη' : 'Συνέχεια'}</span>
          <div className="bg-white group-hover/btn:bg-blue-500 rounded-full p-1.5 transition-colors shadow-sm">
            {isPublic ? (
              <BookOpen className="w-4 h-4 text-blue-600 group-hover/btn:text-white" />
            ) : (
              <ArrowRight className="w-4 h-4 text-blue-600 group-hover/btn:text-white" />
            )}
          </div>
        </Link>
      </div>
    </div>
  );
};