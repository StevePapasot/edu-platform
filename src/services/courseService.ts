import { db } from '@/src/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';

export interface Chapter {
  id: string;
  title: string;
  orderIndex: number;
  courseName: string;
  createdAt?: any;
}

export interface Lesson {
  id: string;
  chapterId: string;
  title: string;
  orderIndex: number;
  theoryContent: string;
  createdAt?: any;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  orderIndex: number;
}

export interface UserProgress {
  lessonId: string;
  completed: boolean;
  completedAt: Date | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'admin';
  schoolType?: string;
  grade?: string;
  createdAt?: any;
  progress?: Record<string, UserProgress>;
}

export interface CourseInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const courseService = {
  async initializeCourseData() {
    const courseName = 'Ηλεκτροτεχνία Γ\' ΕΠΑΛ';

    const chaptersData: Omit<Chapter, 'id'>[] = [
      { title: 'Εναλλασσόμενο Ρεύμα', orderIndex: 1, courseName },
      { title: 'Κυκλώματα R-L-C', orderIndex: 2, courseName },
      { title: 'Τριφασικά Συστήματα', orderIndex: 3, courseName },
    ];

    const chapter1Ref = doc(collection(db, 'chapters'));
    const chapter2Ref = doc(collection(db, 'chapters'));
    const chapter3Ref = doc(collection(db, 'chapters'));

    await setDoc(chapter1Ref, { ...chaptersData[0], createdAt: serverTimestamp() });
    await setDoc(chapter2Ref, { ...chaptersData[1], createdAt: serverTimestamp() });
    await setDoc(chapter3Ref, { ...chaptersData[2], createdAt: serverTimestamp() });

    const lessonsData = [
      {
        chapterId: chapter1Ref.id,
        title: '1.1 Ορισμοί και Βασικές Έννοιες',
        orderIndex: 1,
        theoryContent: '<h2>Ορισμοί και Βασικές Έννοιες</h2><p>Το <strong>εναλλασσόμενο ρεύμα (AC)</strong> είναι η μορφή ηλεκτρικής ενέργειας που χρησιμοποιείται ευρέως στα σύγχρονα ηλεκτρικά δίκτυα.</p><h3>Βασικά Χαρακτηριστικά:</h3><ul><li><strong>Συχνότητα (f):</strong> Μετριέται σε Hertz (Hz). Στην Ελλάδα: 50 Hz</li><li><strong>Περίοδος (T):</strong> Ο χρόνος για έναν πλήρη κύκλο, T = 1/f</li><li><strong>Πλάτος:</strong> Η μέγιστη τιμή του ρεύματος ή της τάσης</li><li><strong>Φάση:</strong> Η θέση του κύματος σε συγκεκριμένη χρονική στιγμή</li></ul><h3>Νόμος του Ohm για AC:</h3><p>Ο νόμος του Ohm ισχύει και στο εναλλασσόμενο ρεύμα:</p><p><strong>V = I × R</strong></p><p>Όπου:<br>- V: Τάση (Volts)<br>- I: Ένταση ρεύματος (Amperes)<br>- R: Αντίσταση (Ohms)</p>',
      },
      {
        chapterId: chapter1Ref.id,
        title: '1.2 Επαγωγική Αντίσταση',
        orderIndex: 2,
        theoryContent: '<h2>Επαγωγική Αντίσταση (Inductive Reactance)</h2><p>Η <strong>επαγωγική αντίσταση (XL)</strong> είναι η αντίσταση που προσφέρει ένα πηνίο στη ροή του εναλλασσόμενου ρεύματος.</p><h3>Τύπος:</h3><p><strong>XL = 2πfL</strong></p><p>Όπου:<br>- XL: Επαγωγική αντίσταση (Ohms)<br>- f: Συχνότητα (Hz)<br>- L: Συντελεστής αυτεπαγωγής (Henry)</p><h3>Χαρακτηριστικά:</h3><ul><li>Αυξάνεται με τη συχνότητα</li><li>Το ρεύμα υστερεί της τάσης κατά 90°</li><li>Δεν καταναλώνει ισχύ (μόνο αποθηκεύει)</li></ul>',
      },
      {
        chapterId: chapter1Ref.id,
        title: '1.3 Χωρητική Αντίσταση',
        orderIndex: 3,
        theoryContent: '<h2>Χωρητική Αντίσταση (Capacitive Reactance)</h2><p>Η <strong>χωρητική αντίσταση (XC)</strong> είναι η αντίσταση που προσφέρει ένας πυκνωτής στη ροή του εναλλασσόμενου ρεύματος.</p><h3>Τύπος:</h3><p><strong>XC = 1/(2πfC)</strong></p><p>Όπου:<br>- XC: Χωρητική αντίσταση (Ohms)<br>- f: Συχνότητα (Hz)<br>- C: Χωρητικότητα (Farad)</p>',
      },
      {
        chapterId: chapter2Ref.id,
        title: '2.1 Σειριακά Κυκλώματα RLC',
        orderIndex: 1,
        theoryContent: '<h2>Σειριακά Κυκλώματα RLC</h2><p>Ένα σειριακό κύκλωμα RLC περιέχει αντίσταση (R), πηνίο (L) και πυκνωτή (C) συνδεδεμένα σε σειρά.</p><h3>Χαρακτηριστικά:</h3><ul><li>Το ρεύμα είναι το ίδιο σε όλα τα στοιχεία</li><li>Η συνολική τάση είναι το διανυσματικό άθροισμα των επιμέρους τάσεων</li><li>Η σύνθετη αντίσταση υπολογίζεται ως Z = √(R² + (XL - XC)²)</li></ul>',
      },
      {
        chapterId: chapter2Ref.id,
        title: '2.2 Παράλληλα Κυκλώματα RLC',
        orderIndex: 2,
        theoryContent: '<h2>Παράλληλα Κυκλώματα RLC</h2><p>Σε παράλληλα κυκλώματα, τα στοιχεία R, L και C συνδέονται παράλληλα.</p><h3>Χαρακτηριστικά:</h3><ul><li>Η τάση είναι η ίδια σε όλα τα στοιχεία</li><li>Το συνολικό ρεύμα είναι το διανυσματικό άθροισμα των επιμέρους ρευμάτων</li></ul>',
      },
      {
        chapterId: chapter3Ref.id,
        title: '3.1 Εισαγωγή στα Τριφασικά',
        orderIndex: 1,
        theoryContent: '<h2>Εισαγωγή στα Τριφασικά Συστήματα</h2><p>Τα τριφασικά συστήματα χρησιμοποιούνται ευρέως στη βιομηχανία για τη μεταφορά ηλεκτρικής ενέργειας.</p><h3>Πλεονεκτήματα:</h3><ul><li>Οικονομικότερη μεταφορά ενέργειας</li><li>Πιο σταθερή παροχή ισχύος</li><li>Καλύτερη απόδοση κινητήρων</li></ul>',
      },
      {
        chapterId: chapter3Ref.id,
        title: '3.2 Σύνδεση Αστέρα και Τριγώνου',
        orderIndex: 2,
        theoryContent: '<h2>Συνδέσεις Αστέρα (Y) και Τριγώνου (Δ)</h2><p>Υπάρχουν δύο βασικές μέθοδοι σύνδεσης τριφασικών φορτίων.</p><h3>Σύνδεση Αστέρα (Y):</h3><ul><li>Τα φορτία συνδέονται σε έναν κοινό κόμβο</li><li>Vγραμμής = √3 × Vφάσης</li></ul><h3>Σύνδεση Τριγώνου (Δ):</h3><ul><li>Τα φορτία σχηματίζουν κλειστό βρόχο</li><li>Iγραμμής = √3 × Iφάσης</li></ul>',
      },
    ];

    for (const lessonData of lessonsData) {
      const lessonRef = doc(collection(db, 'lessons'));
      await setDoc(lessonRef, { ...lessonData, createdAt: serverTimestamp() });

      if (lessonData.chapterId === chapter1Ref.id && lessonData.orderIndex === 1) {
        const questionsData = [
          {
            lessonId: lessonRef.id,
            question: 'Ποια είναι η μονάδα μέτρησης της σύνθετης αντίστασης (Ζ);',
            options: ['Ω (Ohm)', 'H (Henry)', 'F (Farad)', 'A (Ampere)'],
            correctAnswer: 0,
            explanation: 'Η σύνθετη αντίσταση (impedance Z) μετριέται σε Ohm (Ω), όπως και η κανονική αντίσταση. Το Henry μετρά επαγωγή, το Farad μετρά χωρητικότητα, και το Ampere μετρά ένταση ρεύματος.',
            orderIndex: 1,
          },
          {
            lessonId: lessonRef.id,
            question: 'Ποια είναι η συχνότητα του ηλεκτρικού δικτύου στην Ελλάδα;',
            options: ['50 Hz', '60 Hz', '100 Hz', '220 Hz'],
            correctAnswer: 0,
            explanation: 'Στην Ελλάδα και στην υπόλοιπη Ευρώπη, η συχνότητα του ηλεκτρικού δικτύου είναι 50 Hz. Στις ΗΠΑ χρησιμοποιείται 60 Hz.',
            orderIndex: 2,
          },
        ];

        for (const questionData of questionsData) {
          const questionRef = doc(collection(db, 'quizQuestions'));
          await setDoc(questionRef, questionData);
        }
      }
    }
  },

  async getChapters(courseName: string): Promise<Chapter[]> {
    const q = query(
      collection(db, 'chapters'),
      where('courseName', '==', courseName)
    );
    const snapshot = await getDocs(q);
    const chapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
    return chapters.sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getLessons(): Promise<Lesson[]> {
    const snapshot = await getDocs(collection(db, 'lessons'));
    const lessons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lesson));
    return lessons.sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getQuizQuestions(lessonId: string): Promise<QuizQuestion[]> {
    const q = query(
      collection(db, 'quizQuestions'),
      where('lessonId', '==', lessonId)
    );
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizQuestion));
    return questions.sort((a, b) => a.orderIndex - b.orderIndex);
  },

  async getUserProgress(userId: string): Promise<Map<string, UserProgress>> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const progressMap = new Map<string, UserProgress>();

      if (data.progress) {
        Object.entries(data.progress).forEach(([lessonId, progress]: [string, any]) => {
          progressMap.set(lessonId, {
            lessonId,
            completed: progress.completed || false,
            completedAt: progress.completedAt?.toDate() || null,
          });
        });
      }

      return progressMap;
    }

    return new Map();
  },

  async markLessonComplete(userId: string, lessonId: string): Promise<void> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    const progressUpdate = {
      completed: true,
      completedAt: serverTimestamp(),
    };

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        [`progress.${lessonId}`]: progressUpdate,
      });
    } else {
      await setDoc(docRef, {
        progress: {
          [lessonId]: progressUpdate,
        },
      });
    }
  },

  async createUserProfile(uid: string, email: string): Promise<void> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      await setDoc(docRef, {
        uid,
        email,
        role: 'student',
        createdAt: serverTimestamp(),
        progress: {},
      });
    }
  },

  async getUserRole(uid: string): Promise<'student' | 'admin' | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.role || 'student';
    }

    return null;
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid: data.uid,
        email: data.email,
        role: data.role || 'student',
        schoolType: data.schoolType,
        grade: data.grade,
        createdAt: data.createdAt,
        progress: data.progress || {},
      };
    }

    return null;
  },

  async getCourses(): Promise<CourseInfo[]> {
    return [
      {
        id: 'elektrotexnia-g-epal',
        name: 'Ηλεκτροτεχνία Γ\' ΕΠΑΛ',
        description: 'Πλήρες μάθημα ηλεκτροτεχνίας για την Γ\' τάξη ΕΠΑΛ',
        icon: 'zap',
      },
    ];
  },

  // Admin CRUD Operations

  // Chapter CRUD
  async createChapter(chapterData: Omit<Chapter, 'id'>): Promise<void> {
    const docRef = doc(collection(db, 'chapters'));
    await setDoc(docRef, chapterData);
  },

  async updateChapter(id: string, chapterData: Partial<Omit<Chapter, 'id'>>): Promise<void> {
    const docRef = doc(db, 'chapters', id);
    await updateDoc(docRef, chapterData);
  },

  async deleteChapter(id: string): Promise<void> {
    const docRef = doc(db, 'chapters', id);
    await deleteDoc(docRef);
  },

  // Lesson CRUD
  async createLesson(lessonData: Omit<Lesson, 'id'>): Promise<void> {
    const docRef = doc(collection(db, 'lessons'));
    await setDoc(docRef, lessonData);
  },

  async updateLesson(id: string, lessonData: Partial<Omit<Lesson, 'id'>>): Promise<void> {
    const docRef = doc(db, 'lessons', id);
    await updateDoc(docRef, lessonData);
  },

  async deleteLesson(id: string): Promise<void> {
    const docRef = doc(db, 'lessons', id);
    await deleteDoc(docRef);
  },

  // Quiz Question CRUD
  async createQuizQuestion(quizData: Omit<QuizQuestion, 'id'>): Promise<void> {
    const docRef = doc(collection(db, 'quizQuestions'));
    await setDoc(docRef, quizData);
  },

  async updateQuizQuestion(id: string, quizData: Partial<Omit<QuizQuestion, 'id'>>): Promise<void> {
    const docRef = doc(db, 'quizQuestions', id);
    await updateDoc(docRef, quizData);
  },

  async deleteQuizQuestion(id: string): Promise<void> {
    const docRef = doc(db, 'quizQuestions', id);
    await deleteDoc(docRef);
  },
};
