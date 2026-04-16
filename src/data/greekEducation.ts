import {
  BookOpen,
  Calculator,
  Atom,
  FlaskConical,
  Globe,
  Landmark,
  Languages,
  Music,
  Palette,
  Dumbbell,
  Code,
  Zap,
  Wrench,
  Hammer,
  Car,
  Laptop,
  Users,
  Briefcase,
  Heart,
  ChefHat,
  Leaf,
  Scroll,
  History,
  Compass,
  Anchor,
  Server,
  ShieldCheck,
  Activity,
  Apple,
  type LucideIcon,
} from 'lucide-react';

export interface Subject {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
}

export interface Orientation {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Sector {
  id: string;
  name: string;
  subjects: Subject[];
}

export interface Grade {
  id: string;
  name: string;
  displayName: string;
  subjects?: Subject[];
  orientations?: Orientation[];
  sectors?: Sector[];
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  grades: Grade[];
}

export const greekEducationData: Category[] = [
  {
    id: 'gymnasio',
    name: 'ΓΥΜΝΑΣΙΟ',
    displayName: 'Γυμνάσιο',
    grades: [
      {
        id: 'a-gymnasio',
        name: "Α'",
        displayName: "Α' Γυμνασίου",
        subjects: [
          { id: 'math-a-gym', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
          { id: 'physics-a-gym', name: 'Φυσική', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
          { id: 'arxaia-a-gym', name: 'Αρχαία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
          { id: 'greek-a-gym', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
          { id: 'english-a-gym', name: 'Αγγλικά', icon: Languages, color: 'bg-purple-500', gradient: 'from-fuchsia-400 to-pink-600' },
          { id: 'history-a-gym', name: 'Ιστορία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
        ],
      },
      {
        id: 'b-gymnasio',
        name: "Β'",
        displayName: "Β' Γυμνασίου",
        subjects: [
          { id: 'math-b-gym', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
          { id: 'physics-b-gym', name: 'Φυσική', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
          { id: 'arxaia-b-gym', name: 'Αρχαία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
          { id: 'chemistry-b-gym', name: 'Χημεία', icon: FlaskConical, color: 'bg-violet-500', gradient: 'from-lime-400 to-green-600' },
          { id: 'greek-b-gym', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
          { id: 'history-b-gym', name: 'Ιστορία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
        ],
      },
      {
        id: 'c-gymnasio',
        name: "Γ'",
        displayName: "Γ' Γυμνασίου",
        subjects: [
          { id: 'math-c-gym', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
          { id: 'physics-c-gym', name: 'Φυσική', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
          { id: 'arxaia-c-gym', name: 'Αρχαία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
          { id: 'chemistry-c-gym', name: 'Χημεία', icon: FlaskConical, color: 'bg-violet-500', gradient: 'from-lime-400 to-green-600' },
          { id: 'biology-c-gym', name: 'Βιολογία', icon: Leaf, color: 'bg-emerald-500', gradient: 'from-emerald-400 to-green-600' },
          { id: 'greek-c-gym', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
          { id: 'history-c-gym', name: 'Ιστορία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
        ],
      },
    ],
  },
  {
    id: 'gel',
    name: 'ΓΕΛ',
    displayName: 'Γενικό Λύκειο',
    grades: [
      {
        id: 'a-gel',
        name: "Α'",
        displayName: "Α' Λυκείου",
        subjects: [
          { id: 'math-a-gel', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
          { id: 'physics-a-gel', name: 'Φυσική', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
          { id: 'chemistry-a-gel', name: 'Χημεία', icon: FlaskConical, color: 'bg-violet-500', gradient: 'from-lime-400 to-green-600' },
          { id: 'greek-a-gel', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
          { id: 'ancient-greek-a-gel', name: 'Αρχαία Ελληνικά', icon: Landmark, color: 'bg-stone-500', gradient: 'from-slate-500 to-gray-700' },
          { id: 'history-a-gel', name: 'Ιστορία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
          { id: 'informatics-a-gel', name: 'Πληροφορική', icon: Code, color: 'bg-indigo-500', gradient: 'from-sky-400 to-blue-600' },
        ],
      },
      {
        id: 'b-gel',
        name: "Β'",
        displayName: "Β' Λυκείου",
        orientations: [
          {
            id: 'general-b-gel',
            name: 'Γενική Παιδεία',
            subjects: [
              { id: 'math-gen-b-gel', name: 'Μαθηματικά Γενικής', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
              { id: 'physics-gen-b-gel', name: 'Φυσική Γενικής', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
              { id: 'chemistry-b-gel', name: 'Χημεία', icon: FlaskConical, color: 'bg-violet-500', gradient: 'from-lime-400 to-green-600' },
              { id: 'greek-b-gel', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
              { id: 'history-b-gel', name: 'Ιστορία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
            ]
          },
          {
            id: 'humanities-b-gel',
            name: 'Ανθρωπιστικών Σπουδών',
            subjects: [
              { id: 'ancient-greek-b-gel-hum', name: 'Αρχαία Κατεύθυνσης', icon: Landmark, color: 'bg-stone-600', gradient: 'from-stone-500 to-stone-800' },
              { id: 'latin-b-gel-hum', name: 'Λατινικά', icon: Scroll, color: 'bg-rose-500', gradient: 'from-rose-400 to-rose-700' },
            ],
          },
          {
            id: 'science-b-gel',
            name: 'Θετικών Σπουδών',
            subjects: [
              { id: 'math-b-gel-sci', name: 'Μαθηματικά Κατεύθυνσης', icon: Calculator, color: 'bg-red-600', gradient: 'from-red-500 to-red-800' },
              { id: 'physics-b-gel-sci', name: 'Φυσική Κατεύθυνσης', icon: Atom, color: 'bg-blue-700', gradient: 'from-blue-600 to-blue-900' },
            ],
          },
        ],
      },
      {
        id: 'c-gel',
        name: "Γ'",
        displayName: "Γ' Λυκείου",
        orientations: [
          {
            id: 'humanities-c-gel',
            name: 'Ανθρωπιστικών Σπουδών',
            subjects: [
              { id: 'greek-c-gel-hum', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
              { id: 'ancient-greek-c-gel-hum', name: 'Αρχαία Ελληνικά', icon: Landmark, color: 'bg-stone-500', gradient: 'from-slate-500 to-gray-700' },
              { id: 'history-c-gel-hum', name: 'Ιστορία', icon: History, color: 'bg-amber-500', gradient: 'from-yellow-500 to-amber-700' },
              { id: 'latin-c-gel-hum', name: 'Λατινικά', icon: Scroll, color: 'bg-rose-500', gradient: 'from-rose-400 to-rose-700' },
            ],
          },
          {
            id: 'science-c-gel',
            name: 'Θετικών Σπουδών',
            subjects: [
              { id: 'math-c-gel-sci', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
              { id: 'physics-c-gel-sci', name: 'Φυσική', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
              { id: 'chemistry-c-gel-sci', name: 'Χημεία', icon: FlaskConical, color: 'bg-violet-500', gradient: 'from-lime-400 to-green-600' },
              { id: 'biology-c-gel-sci', name: 'Βιολογία', icon: Leaf, color: 'bg-emerald-500', gradient: 'from-emerald-400 to-green-600' },
            ],
          },
          {
            id: 'economics-c-gel',
            name: 'Οικονομικών Σπουδών',
            subjects: [
              { id: 'math-c-gel-econ', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
              { id: 'economics-c-gel-econ', name: 'Οικονομικά', icon: Briefcase, color: 'bg-cyan-500', gradient: 'from-sky-400 to-blue-600' },
              { id: 'tech-c-gel-econ', name: 'Πληροφορική', icon: Users, color: 'bg-sky-500', gradient: 'from-sky-400 to-blue-600' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'epal',
    name: 'ΕΠΑΛ',
    displayName: 'Επαγγελματικό Λύκειο',
    grades: [
      {
        id: 'a-epal',
        name: "Α'",
        displayName: "Α' ΕΠΑΛ",
        subjects: [
          { id: 'math-a-epal', name: 'Μαθηματικά', icon: Calculator, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
          { id: 'physics-a-epal', name: 'Φυσική', icon: Atom, color: 'bg-blue-500', gradient: 'from-cyan-400 to-blue-600' },
          { id: 'greek-a-epal', name: 'Νέα Ελληνικά', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
          { id: 'history-a-epal', name: 'Ιστορία', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
          { id: 'chemistry-a-epal', name: 'Χημεία', icon: BookOpen, color: 'bg-green-500', gradient: 'from-purple-400 to-indigo-600' },
        ],
      },
      {
        id: 'b-epal',
        name: "Β'",
        displayName: "Β' ΕΠΑΛ",
        sectors: [
           {
            id: 'gen-b-epal',
            name: 'Γενικής',
            subjects: [
              { id: 'greek-b-epal', name: 'Νέα Ελληνικά', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'math-b-epal', name: 'Μαθηματικά', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'physics-b-epal', name: 'Φυσική', icon: Wrench, color: 'bg-gray-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },

 {
            id: 'geo-b-epal',
            name: 'Γεωπονίας',
            subjects: [
              { id: 'agricultural-b-epal', name: 'Αρχές Αγροτικής Ανάπτυξης', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'plant-b-epal', name: 'Φυτική Παραγωγή', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'animals-b-epal', name: 'Ζωική Παραγωγή', icon: Wrench, color: 'bg-gray-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },
 {
            id: 'tech-b-epal',
            name: 'Ηλεκτρολογία, Ηλεκτρονικής & Αυτοματισμού',
            subjects: [
              { id: 'circuits-b-epal', name: 'Ηλεκτροτεχνία', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'installations-b-epal', name: 'Εσωτερικές Ηλεκτρολογικές Εγκαταστάσεις & Ηλεκτρολογικό Υλικό', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'electronics-b-epal', name: 'Αναλογικά & Ψηφιακά Ηλεκτρονικά', icon: Wrench, color: 'bg-gray-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },

           {
            id: 'mech-b-epal',
            name: 'Μηχανολογίας',
            subjects: [
              { id: 'thermo-b-epal', name: 'Στοιχεία Τεχνικής Θερμοδυναμικής', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'condition-b-epal', name: 'Μηχανική Αντοχή Υλικών', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'mechanical-constructions-b-epal', name: 'Τεχνολογία Μηχανολογικών Κατασκευών', icon: Wrench, color: 'bg-gray-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },
          
          {
            id: 'management-b-epal',
            name: 'Διοίκηση & Οικονομία',
            subjects: [
              { id: 'count-b-epal', name: 'Λογιστική', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'marketing-b-epal', name: 'Μαρκετινγκ', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'logistics-b-epal', name: 'Logistics', icon: Wrench, color: 'bg-gray-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },
          {
            id: 'construction-b-epal',
            name: 'Δομικών Έργων',
            subjects: [
              { id: 'const-b-epal', name: 'Οικοδομικό Σχέδιο', icon: Heart, color: 'bg-rose-500', gradient: 'from-rose-400 to-pink-600' },
              { id: 'topography-b-epal', name: 'Τοπογραφία', icon: Users, color: 'bg-cyan-500', gradient: 'from-sky-400 to-blue-600' },
              { id: 'buildings-b-epal', name: 'Κτηριακά Έργα', icon: Users, color: 'bg-cyan-500', gradient: 'from-sky-400 to-blue-600' },
            ],
          },


          // ... μέσα στο array των τομέων της Β' ΕΠΑΛ
{
  id: 'maritime-b-epal',
  name: 'Ναυτιλιακών Επαγγελμάτων',
  subjects: [
    { id: 'navigation-b-epal', name: 'Ναυσιπλοΐα Ι - Ναυτική Μετεωρολογία', icon: Compass, color: 'bg-blue-700', gradient: 'from-blue-600 to-blue-900' },
    { id: 'maritime-elec-b-epal', name: 'Ηλεκτρολογικές Εγκαταστάσεις Πλοίου Ι', icon: Zap, color: 'bg-yellow-600', gradient: 'from-yellow-500 to-orange-700' },
    { id: 'maritime-mech-b-epal', name: 'Ναυτική Μηχανολογία - Εφαρμογές', icon: Anchor, color: 'bg-slate-700', gradient: 'from-slate-500 to-slate-900' },
  ],
},
{
  id: 'it-b-epal',
  name: 'Πληροφορικής',
  subjects: [
    { id: 'prog-principles-b-epal', name: 'Αρχές Προγραμματισμού Υπολογιστών', icon: Code, color: 'bg-indigo-600', gradient: 'from-indigo-500 to-purple-700' },
    { id: 'hardware-networks-b-epal', name: 'Υλικό και Δίκτυα Υπολογιστών', icon: Server, color: 'bg-cyan-600', gradient: 'from-cyan-500 to-blue-700' },
    { id: 'os-security-b-epal', name: 'Λειτουργικά Συστήματα & Ασφάλεια', icon: ShieldCheck, color: 'bg-red-600', gradient: 'from-red-500 to-dark-900' },
  ],
},
{
  id: 'health-b-epal',
  name: 'Υγείας - Πρόνοιας - Ευεξίας',
  subjects: [
    { id: 'anatomy-b-epal', name: 'Ανατομία - Φυσιολογία Ι', icon: Activity, color: 'bg-rose-600', gradient: 'from-rose-500 to-red-800' },
    { id: 'health-nutrition-b-epal', name: 'Υγεία και Διατροφή', icon: Apple, color: 'bg-green-600', gradient: 'from-green-500 to-emerald-800' },
    { id: 'interpersonal-b-epal', name: 'Διαπροσωπικές Σχέσεις', icon: Users, color: 'bg-purple-600', gradient: 'from-purple-500 to-indigo-800' },
  ],
},


          
          {
            id: 'arts-b-epal',
            name: 'Τομέας Εφαρμοσμένων Τεχνών',
            subjects: [
              { id: 'free-sketch-b-epal', name: 'Ελεύθερο Σχέδιο', icon: ChefHat, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
              { id: 'sketch-b-epal-sub', name: 'Γραμμικό Σχέδιο', icon: Globe, color: 'bg-teal-500', gradient: 'from-sky-400 to-blue-600' },
              { id: 'art-history-b-epal-sub', name: 'Ιστορία Τέχνης', icon: Globe, color: 'bg-teal-500', gradient: 'from-sky-400 to-blue-600' }
            ],
          },
        ],
      },
      {
        id: 'c-epal',
        name: "Γ'",
        displayName: "Γ' ΕΠΑΛ",
        sectors: [
           {
            id: 'general-c-epal',
            name: 'Γενικής Παιδείας',
            subjects: [
              { id: 'greek-c-epal', name: 'Νεα Ελληνικά', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'maths-c-epal', name: 'Μαθηματικά', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },

          {
            id: 'elec-c-epal',
            name: 'Ηλεκτρολογίας, Ηλεκτρονικής & Αυτοματισμού',
            subjects: [
              { id: 'elec-c-epal', name: 'Ηλεκτροτεχνία ΙΙ', icon: Heart, color: 'bg-rose-500', gradient: 'from-rose-400 to-pink-600' },
              { id: 'motors-c-epal', name: 'Ηλεκτρικές Μηχανές', icon: Users, color: 'bg-cyan-500', gradient: 'from-sky-400 to-blue-600' },
            ],
          },
          
          {
            id: 'geo-c-epal',
            name: 'Γεωπονίας Τροφίμων & Περιβάλλοντος',
            subjects: [
              { id: 'modern-geo-c-epal', name: 'Σύγχρόνες Γεωργικές Επιχειρήσεις', icon: Zap, color: 'bg-yellow-500', gradient: 'from-slate-600 to-gray-900' },
              { id: 'biological-c-epal', name: 'Αρχές Βιολογικής Γεωργίας', icon: Laptop, color: 'bg-blue-500', gradient: 'from-slate-600 to-gray-900' },
            ],
          },
          {
            id: 'management-c-epal',
            name: 'Διοικηση & Οικονομίας',
            subjects: [
              { id: 'econ-c-epal', name: 'ΑΟΘ', icon: Heart, color: 'bg-rose-500', gradient: 'from-rose-400 to-pink-600' },
              { id: 'management-c-epal', name: 'Αρχές Οργάνωσης & Διοίκησης', icon: Users, color: 'bg-cyan-500', gradient: 'from-sky-400 to-blue-600' },
            ],
          },

           {
            id: 'rest-c-epal',
            name: 'Λοιπά',
            subjects: [
              { id: 'art-c-epal', name: 'Ιστορία της Τέχνης', icon: Heart, color: 'bg-rose-500', gradient: 'from-rose-400 to-pink-600' },
            ],
          },      
            {
            id: 'construction-c-epal',
            name: 'Δομικών Έργων, Δομημένου Περιβάλλοντος & Αρχιτεκτονικού Σχεδιασμού',
            subjects: [
              { id: 'construction-c-epal', name: 'Οικοδομική', icon: Heart, color: 'bg-rose-500', gradient: 'from-rose-400 to-pink-600' },
              { id: 'architecture-c-epal', name: 'Αρχιτεκτονικό Σχέδιο', icon: Users, color: 'bg-cyan-500', gradient: 'from-sky-400 to-blue-600' },
            ],
          },          
          {
            id: 'tourism-c-epal',
            name: 'Τουρισμού & Εστίασης',
            subjects: [
              { id: 'cooking-c-epal', name: 'Μαγειρική', icon: ChefHat, color: 'bg-orange-500', gradient: 'from-orange-400 to-red-600' },
              { id: 'tourism-c-epal-sub', name: 'Τουρισμός', icon: Globe, color: 'bg-teal-500', gradient: 'from-sky-400 to-blue-600' },
            ],
          },
        ],
      },
    ],
  },
];

export function findUserGrade(schoolType: string, grade: string): { categoryId: string; gradeId: string } | null {
  const categoryMap: Record<string, string> = {
    "Α' Γυμνασίου": 'a-gymnasio',
    "Β' Γυμνασίου": 'b-gymnasio',
    "Γ' Γυμνασίου": 'c-gymnasio',
    "Α' Λυκείου": 'a-gel',
    "Β' Λυκείου": 'b-gel',
    "Γ' Λυκείου": 'c-gel',
    "Α' Επαγγελματικού": 'a-epal',
    "Β' Επαγγελματικού": 'b-epal',
    "Γ' Επαγγελματικού": 'c-epal',
  };

  const gradeId = categoryMap[grade];
  if (!gradeId) return null;

  if (gradeId.includes('gymnasio')) return { categoryId: 'gymnasio', gradeId };
  if (gradeId.includes('gel')) return { categoryId: 'gel', gradeId };
  if (gradeId.includes('epal')) return { categoryId: 'epal', gradeId };

  return null;
}