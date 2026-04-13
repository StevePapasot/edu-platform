/*
  # Study System Database Schema

  ## New Tables
  
  ### `chapters`
  - `id` (uuid, primary key) - Unique identifier for each chapter
  - `title` (text) - Chapter title (e.g., "Εναλλασσόμενο Ρεύμα")
  - `order_index` (integer) - Display order of chapters
  - `course_name` (text) - Course identifier (e.g., "Ηλεκτροτεχνία Γ' ΕΠΑΛ")
  - `created_at` (timestamptz) - Timestamp of creation

  ### `lessons`
  - `id` (uuid, primary key) - Unique identifier for each lesson
  - `chapter_id` (uuid, foreign key) - References chapters table
  - `title` (text) - Lesson title (e.g., "1.1 Ορισμοί")
  - `order_index` (integer) - Display order within chapter
  - `theory_content` (text) - Theory content in markdown/HTML
  - `created_at` (timestamptz) - Timestamp of creation

  ### `quiz_questions`
  - `id` (uuid, primary key) - Unique identifier for each question
  - `lesson_id` (uuid, foreign key) - References lessons table
  - `question` (text) - The question text
  - `options` (jsonb) - Array of answer options
  - `correct_answer` (integer) - Index of correct answer (0-based)
  - `explanation` (text) - Explanation for the correct answer
  - `order_index` (integer) - Display order within lesson
  - `created_at` (timestamptz) - Timestamp of creation

  ### `user_progress`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (text) - Firebase user ID
  - `lesson_id` (uuid, foreign key) - References lessons table
  - `completed` (boolean) - Whether lesson is completed
  - `completed_at` (timestamptz) - When lesson was completed
  - `created_at` (timestamptz) - Timestamp of creation
  - Unique constraint on (user_id, lesson_id)

  ## Security
  - Enable RLS on all tables
  - Users can read all chapters, lessons, and quiz questions
  - Users can only read/write their own progress
*/

-- Create chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  order_index integer NOT NULL,
  course_name text NOT NULL DEFAULT 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  TO authenticated
  USING (true);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  order_index integer NOT NULL,
  theory_content text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  TO authenticated
  USING (true);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer integer NOT NULL,
  explanation text DEFAULT '',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (true);

-- Create user progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.jwt()->>'sub');

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.jwt()->>'sub')
  WITH CHECK (user_id = auth.jwt()->>'sub');

-- Insert sample data for Ηλεκτροτεχνία Γ' ΕΠΑΛ

-- Chapter 1: Εναλλασσόμενο Ρεύμα
INSERT INTO chapters (title, order_index, course_name) VALUES
  ('Εναλλασσόμενο Ρεύμα', 1, 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ'),
  ('Κυκλώματα R-L-C', 2, 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ'),
  ('Τριφασικά Συστήματα', 3, 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ')
ON CONFLICT DO NOTHING;

-- Get chapter IDs for lessons
DO $$
DECLARE
  chapter1_id uuid;
  chapter2_id uuid;
  chapter3_id uuid;
  lesson1_id uuid;
BEGIN
  -- Get chapter IDs with LIMIT 1
  SELECT id INTO chapter1_id FROM chapters WHERE title = 'Εναλλασσόμενο Ρεύμα' AND course_name = 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ' LIMIT 1;
  SELECT id INTO chapter2_id FROM chapters WHERE title = 'Κυκλώματα R-L-C' AND course_name = 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ' LIMIT 1;
  SELECT id INTO chapter3_id FROM chapters WHERE title = 'Τριφασικά Συστήματα' AND course_name = 'Ηλεκτροτεχνία Γ'' ΕΠΑΛ' LIMIT 1;

  -- Insert lessons for Chapter 1
  IF chapter1_id IS NOT NULL THEN
    INSERT INTO lessons (chapter_id, title, order_index, theory_content) VALUES
      (chapter1_id, '1.1 Ορισμοί και Βασικές Έννοιες', 1, '<h2>Ορισμοί και Βασικές Έννοιες</h2><p>Το <strong>εναλλασσόμενο ρεύμα (AC)</strong> είναι η μορφή ηλεκτρικής ενέργειας που χρησιμοποιείται ευρέως στα σύγχρονα ηλεκτρικά δίκτυα.</p><h3>Βασικά Χαρακτηριστικά:</h3><ul><li><strong>Συχνότητα (f):</strong> Μετριέται σε Hertz (Hz). Στην Ελλάδα: 50 Hz</li><li><strong>Περίοδος (T):</strong> Ο χρόνος για έναν πλήρη κύκλο, T = 1/f</li><li><strong>Πλάτος:</strong> Η μέγιστη τιμή του ρεύματος ή της τάσης</li><li><strong>Φάση:</strong> Η θέση του κύματος σε συγκεκριμένη χρονική στιγμή</li></ul><h3>Νόμος του Ohm για AC:</h3><p>Ο νόμος του Ohm ισχύει και στο εναλλασσόμενο ρεύμα:</p><p><strong>V = I × R</strong></p><p>Όπου:<br>- V: Τάση (Volts)<br>- I: Ένταση ρεύματος (Amperes)<br>- R: Αντίσταση (Ohms)</p>'),
      (chapter1_id, '1.2 Επαγωγική Αντίσταση', 2, '<h2>Επαγωγική Αντίσταση (Inductive Reactance)</h2><p>Η <strong>επαγωγική αντίσταση (XL)</strong> είναι η αντίσταση που προσφέρει ένα πηνίο στη ροή του εναλλασσόμενου ρεύματος.</p><h3>Τύπος:</h3><p><strong>XL = 2πfL</strong></p><p>Όπου:<br>- XL: Επαγωγική αντίσταση (Ohms)<br>- f: Συχνότητα (Hz)<br>- L: Συντελεστής αυτεπαγωγής (Henry)</p><h3>Χαρακτηριστικά:</h3><ul><li>Αυξάνεται με τη συχνότητα</li><li>Το ρεύμα υστερεί της τάσης κατά 90°</li><li>Δεν καταναλώνει ισχύ (μόνο αποθηκεύει)</li></ul>'),
      (chapter1_id, '1.3 Χωρητική Αντίσταση', 3, '<h2>Χωρητική Αντίσταση (Capacitive Reactance)</h2><p>Η <strong>χωρητική αντίσταση (XC)</strong> είναι η αντίσταση που προσφέρει ένας πυκνωτής στη ροή του εναλλασσόμενου ρεύματος.</p><h3>Τύπος:</h3><p><strong>XC = 1/(2πfC)</strong></p><p>Όπου:<br>- XC: Χωρητική αντίσταση (Ohms)<br>- f: Συχνότητα (Hz)<br>- C: Χωρητικότητα (Farad)</p>')
    ON CONFLICT DO NOTHING;

    -- Insert quiz question for lesson 1.1
    SELECT id INTO lesson1_id FROM lessons WHERE chapter_id = chapter1_id AND title = '1.1 Ορισμοί και Βασικές Έννοιες' LIMIT 1;
    
    IF lesson1_id IS NOT NULL THEN
      INSERT INTO quiz_questions (lesson_id, question, options, correct_answer, explanation, order_index) VALUES
        (lesson1_id, 'Ποια είναι η μονάδα μέτρησης της σύνθετης αντίστασης (Ζ);', 
         '["Ω (Ohm)", "H (Henry)", "F (Farad)", "A (Ampere)"]'::jsonb, 
         0, 
         'Η σύνθετη αντίσταση (impedance Z) μετριέται σε Ohm (Ω), όπως και η κανονική αντίσταση. Το Henry μετρά επαγωγή, το Farad μετρά χωρητικότητα, και το Ampere μετρά ένταση ρεύματος.',
         1),
        (lesson1_id, 'Ποια είναι η συχνότητα του ηλεκτρικού δικτύου στην Ελλάδα;', 
         '["50 Hz", "60 Hz", "100 Hz", "220 Hz"]'::jsonb, 
         0, 
         'Στην Ελλάδα και στην υπόλοιπη Ευρώπη, η συχνότητα του ηλεκτρικού δικτύου είναι 50 Hz. Στις ΗΠΑ χρησιμοποιείται 60 Hz.',
         2)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  -- Insert lessons for Chapter 2
  IF chapter2_id IS NOT NULL THEN
    INSERT INTO lessons (chapter_id, title, order_index, theory_content) VALUES
      (chapter2_id, '2.1 Σειριακά Κυκλώματα RLC', 1, '<h2>Σειριακά Κυκλώματα RLC</h2><p>Ένα σειριακό κύκλωμα RLC περιέχει αντίσταση (R), πηνίο (L) και πυκνωτή (C) συνδεδεμένα σε σειρά.</p>'),
      (chapter2_id, '2.2 Παράλληλα Κυκλώματα RLC', 2, '<h2>Παράλληλα Κυκλώματα RLC</h2><p>Σε παράλληλα κυκλώματα, τα στοιχεία R, L και C συνδέονται παράλληλα.</p>')
    ON CONFLICT DO NOTHING;
  END IF;

  -- Insert lessons for Chapter 3
  IF chapter3_id IS NOT NULL THEN
    INSERT INTO lessons (chapter_id, title, order_index, theory_content) VALUES
      (chapter3_id, '3.1 Εισαγωγή στα Τριφασικά', 1, '<h2>Εισαγωγή στα Τριφασικά Συστήματα</h2><p>Τα τριφασικά συστήματα χρησιμοποιούνται ευρέως στη βιομηχανία για τη μεταφορά ηλεκτρικής ενέργειας.</p>'),
      (chapter3_id, '3.2 Σύνδεση Αστέρα και Τριγώνου', 2, '<h2>Συνδέσεις Αστέρα (Y) και Τριγώνου (Δ)</h2><p>Υπάρχουν δύο βασικές μέθοδοι σύνδεσης τριφασικών φορτίων.</p>')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
