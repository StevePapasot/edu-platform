import React from 'react';
import {
  Calculator, Atom, FlaskConical, Dna, BookOpen,
  Landmark, Languages, Dumbbell, Laptop, Palette, GraduationCap,
  Globe, Users, Zap, Wrench, Briefcase, Heart
} from 'lucide-react';

interface SubjectIconProps {
  subjectName: string;
  className?: string;
}

export const SubjectIcon: React.FC<SubjectIconProps> = ({ subjectName, className = "w-16 h-16" }) => {
  // Μαγικό trick: Αφαιρεί τους τόνους (π.χ. το "Μαθηματικά" γίνεται "μαθηματικα") για να μην σκάει ποτέ το matching!
  const norm = subjectName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const getIcon = () => {
    if (norm.includes('φυσικ') && norm.includes('αγωγ')) return Dumbbell;
    if (norm.includes('μαθηματικ')) return Calculator;
    if (norm.includes('φυσικ')) return Atom;
    if (norm.includes('χημει')) return FlaskConical;
    if (norm.includes('βιολογ')) return Dna;
    if (norm.includes('ελληνικ') || norm.includes('γλωσσ') || norm.includes('λογοτεχν')) return BookOpen;
    if (norm.includes('αρχαι')) return Landmark;
    if (norm.includes('ιστορι')) return Landmark;
    if (norm.includes('αγγλικ') || norm.includes('γαλλικ') || norm.includes('γερμανικ')) return Languages;
    if (norm.includes('πληροφορ')) return Laptop;
    if (norm.includes('γεωγραφ')) return Globe;
    if (norm.includes('κοινωνικ')) return Users;
    if (norm.includes('ηλεκτρ') || norm.includes('εγκαταστασ')) return Zap;
    if (norm.includes('μηχανολ') || norm.includes('κατασκευ')) return Wrench;
    if (norm.includes('οικονομ') || norm.includes('επιχειρ')) return Briefcase;
    if (norm.includes('υγει') || norm.includes('νοσηλ')) return Heart;
    if (norm.includes('καλλιτεχν')) return Palette;
    
    return GraduationCap;
  };

  const Icon = getIcon();
  
  return <Icon className={className} strokeWidth={1.5} />;
};