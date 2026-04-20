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
  role: 'student' | 'admin' | 'superAdmin';
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

  async initializeCourseData(): Promise<void> {
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
        theoryContent: '<h2>Ορισμοί και Βασικές Έννοιες</h2><p>Το <strong>εναλλασσόμενο ρεύμα (AC)</strong> είναι η μορφή ηλεκτρικής ενέργειας που χρησιμοποιείται ευρέως στα σύγχρονα ηλεκτρικά δίκτυα.</p>',
      },
      {
        chapterId: chapter1Ref.id,
        title: '1.2 Επαγωγική Αντίσταση',
        orderIndex: 2,
        theoryContent: '<h2>Επαγωγική Αντίσταση (Inductive Reactance)</h2><p>Η <strong>επαγωγική αντίσταση (XL)</strong> είναι η αντίσταση που προσφέρει ένα πηνίο στη ροή του εναλλασσόμενου ρεύματος.</p>',
      },
      {
        chapterId: chapter1Ref.id,
        title: '1.3 Χωρητική Αντίσταση',
        orderIndex: 3,
        theoryContent: '<h2>Χωρητική Αντίσταση (Capacitive Reactance)</h2><p>Η <strong>χωρητική αντίσταση (XC)</strong> είναι η αντίσταση που προσφέρει ένας πυκνωτής στη ροή του εναλλασσόμενου ρεύματος.</p>',
      },
      {
        chapterId: chapter2Ref.id,
        title: '2.1 Σειριακά Κυκλώματα RLC',
        orderIndex: 1,
        theoryContent: '<h2>Σειριακά Κυκλώματα RLC</h2><p>Ένα σειριακό κύκλωμα RLC περιέχει αντίσταση (R), πηνίο (L) και πυκνωτή (C) συνδεδεμένα σε σειρά.</p>',
      },
      {
        chapterId: chapter2Ref.id,
        title: '2.2 Παράλληλα Κυκλώματα RLC',
        orderIndex: 2,
        theoryContent: '<h2>Παράλληλα Κυκλώματα RLC</h2><p>Σε παράλληλα κυκλώματα, τα στοιχεία R, L και C συνδέονται παράλληλα.</p>',
      },
      {
        chapterId: chapter3Ref.id,
        title: '3.1 Εισαγωγή στα Τριφασικά',
        orderIndex: 1,
        theoryContent: '<h2>Εισαγωγή στα Τριφασικά Συστήματα</h2><p>Τα τριφασικά συστήματα χρησιμοποιούνται ευρέως στη βιομηχανία για τη μεταφορά ηλεκτρικής ενέργειας.</p>',
      },
      {
        chapterId: chapter3Ref.id,
        title: '3.2 Σύνδεση Αστέρα και Τριγώνου',
        orderIndex: 2,
        theoryContent: '<h2>Συνδέσεις Αστέρα (Y) και Τριγώνου (Δ)</h2><p>Υπάρχουν δύο βασικές μέθοδοι σύνδεσης τριφασικών φορτίων.</p>',
      },
    ];

    for (const lessonData of lessonsData) {
      const lessonRef = doc(collection(db, 'lessons'));
      await setDoc(lessonRef, { ...lessonData, createdAt: serverTimestamp() });
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
  await setDoc(docRef, {
    progress: {
      [lessonId]: {
        completed: true,
        completedAt: serverTimestamp(),
      },
    },
  }, { merge: true });
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

  async getUserRole(uid: string): Promise<'student' | 'admin' | 'superAdmin' | null> {
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