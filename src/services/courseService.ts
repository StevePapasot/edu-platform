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