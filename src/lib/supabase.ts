import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Chapter {
  id: string;
  title: string;
  order_index: number;
  course_name: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  order_index: number;
  theory_content: string;
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  lesson_id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  order_index: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}
