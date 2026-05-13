'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2, Wand2, GripVertical, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export interface QuizQuestion {
  id: string;
  text: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
}

interface QuizBuilderProps {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
  topicHint?: string;
}

export function QuizBuilder({ questions, onChange, topicHint }: QuizBuilderProps) {
  const [generating, setGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(5);

  const generateId = () => `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const addQuestion = () => {
    const newQ: QuizQuestion = {
      id: generateId(),
      text: '',
      choices: ['', '', '', ''],
      correctIndex: 0,
      explanation: ''
    };
    onChange([...questions, newQ]);
  };

  const updateQuestion = (id: string, patch: Partial<QuizQuestion>) => {
    onChange(questions.map(q => q.id === id ? { ...q, ...patch } : q));
  };

  const updateChoice = (id: string, choiceIndex: number, value: string) => {
    onChange(questions.map(q => {
      if (q.id !== id) return q;
      const newChoices = [...q.choices];
      newChoices[choiceIndex] = value;
      return { ...q, choices: newChoices };
    }));
  };

  const removeQuestion = (id: string) => {
    if (!confirm('Διαγραφή αυτής της ερώτησης;')) return;
    onChange(questions.filter(q => q.id !== id));
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex(q => q.id === id);
    if (index === -1) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const newArr = [...questions];
    [newArr[index], newArr[newIndex]] = [newArr[newIndex], newArr[index]];
    onChange(newArr);
  };

  const handleAIGenerate = async () => {
    const topic = aiTopic.trim() || topicHint?.trim();
    if (!topic) {
      toast.error('Γράψε ένα θέμα για το AI.');
      return;
    }
    setGenerating(true);
    try {
      const prompt = `Είσαι εκπαιδευτικός βοηθός. Δημιούργησε ${aiCount} ερωτήσεις πολλαπλής επιλογής στα Ελληνικά με θέμα: "${topic}".

Επέστρεψε ΜΟΝΟ έγκυρο JSON array σε αυτήν ακριβώς τη μορφή (χωρίς markdown, χωρίς εξηγήσεις, χωρίς \`\`\`json):
[
  {
    "text": "Το κείμενο της ερώτησης;",
    "choices": ["Επιλογή Α", "Επιλογή Β", "Επιλογή Γ", "Επιλογή Δ"],
    "correctIndex": 0,
    "explanation": "Σύντομη εξήγηση γιατί η σωστή απάντηση είναι σωστή."
  }
]

Κανόνες:
- Ακριβώς 4 επιλογές ανά ερώτηση
- correctIndex είναι αριθμός 0, 1, 2 ή 3
- Κάθε ερώτηση πρέπει να έχει σύντομη εξήγηση
- Οι ερωτήσεις να καλύπτουν διαφορετικές πτυχές του θέματος`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error('Σφάλμα AI: ' + (data.error || 'Άγνωστο σφάλμα'));
        return;
      }

      let cleanText = data.text.trim();
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

      const parsed = JSON.parse(cleanText);
      if (!Array.isArray(parsed)) {
        throw new Error('Η απάντηση του AI δεν είναι λίστα.');
      }

      const newQuestions: QuizQuestion[] = parsed.map((q: any) => ({
        id: generateId(),
        text: String(q.text || ''),
        choices: Array.isArray(q.choices) && q.choices.length === 4 
          ? q.choices.map((c: any) => String(c)) 
          : ['', '', '', ''],
        correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 
          ? q.correctIndex 
          : 0,
        explanation: String(q.explanation || '')
      }));

      onChange([...questions, ...newQuestions]);
      setAiTopic('');
      toast.success(`Δημιουργήθηκαν ${newQuestions.length} ερωτήσεις!`);
    } catch (error: any) {
      console.error('AI quiz generation error:', error);
      toast.error('Αποτυχία δημιουργίας: ' + (error.message || 'Το AI επέστρεψε μη έγκυρη μορφή.'));
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100 p-5 rounded-2xl space-y-3">
        <div className="flex items-center gap-2 font-black text-purple-700 text-sm">
          <Wand2 className="w-5 h-5" />
          Δημιουργία με AI
        </div>
        <input
          type="text"
          value={aiTopic}
          onChange={(e) => setAiTopic(e.target.value)}
          placeholder={topicHint ? `π.χ. ${topicHint}` : 'Γράψε θέμα (π.χ. Εναλλασσόμενο ρεύμα)'}
          className="w-full px-4 py-3 rounded-xl border border-purple-200 outline-none focus:ring-2 focus:ring-purple-400 font-medium bg-white"
        />
        <div className="flex gap-2 items-center">
          <select
            value={aiCount}
            onChange={(e) => setAiCount(Number(e.target.value))}
            className="px-4 py-3 rounded-xl border border-purple-200 bg-white font-bold text-purple-700 outline-none cursor-pointer"
          >
            <option value={3}>3 ερωτήσεις</option>
            <option value={5}>5 ερωτήσεις</option>
            <option value={10}>10 ερωτήσεις</option>
          </select>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={generating}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
          >
            {generating ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Δημιουργία...</>
            ) : (
              <><Wand2 className="w-5 h-5" /> Δημιουργία</>
            )}
          </button>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="p-10 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <p className="text-slate-500 font-medium mb-4">Δεν έχεις προσθέσει ερωτήσεις ακόμα.</p>
          <button
            type="button"
            onClick={addQuestion}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black inline-flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" /> Πρώτη Ερώτηση
          </button>
        </div>
      )}

      {questions.map((q, qIndex) => (
        <div key={q.id} className="bg-white border-2 border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
          
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 text-xs font-black px-3 py-1.5 rounded-full">Q{qIndex + 1}</span>
              <div className="flex gap-1">
                <button 
                  type="button"
                  onClick={() => moveQuestion(q.id, 'up')} 
                  disabled={qIndex === 0}
                  className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                  title="Μετακίνηση πάνω"
                >
                  ↑
                </button>
                <button 
                  type="button"
                  onClick={() => moveQuestion(q.id, 'down')} 
                  disabled={qIndex === questions.length - 1}
                  className="p-1 text-slate-400 hover:text-blue-600 disabled:opacity-30"
                  title="Μετακίνηση κάτω"
                >
                  ↓
                </button>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => removeQuestion(q.id)} 
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              title="Διαγραφή"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Ερώτηση</label>
            <textarea
              value={q.text}
              onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
              placeholder="Γράψε την ερώτηση εδώ..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Επιλογές (κλικ στο κουμπί για να ορίσεις τη σωστή)</label>
            <div className="space-y-2">
              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQuestion(q.id, { correctIndex: cIndex })}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all flex-shrink-0 ${
                      q.correctIndex === cIndex 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                    title={q.correctIndex === cIndex ? 'Σωστή απάντηση' : 'Κλικ για να ορίσεις ως σωστή'}
                  >
                    {q.correctIndex === cIndex ? <Check className="w-5 h-5" /> : String.fromCharCode(65 + cIndex)}
                  </button>
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => updateChoice(q.id, cIndex, e.target.value)}
                    placeholder={`Επιλογή ${String.fromCharCode(65 + cIndex)}`}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Εξήγηση (προαιρετικό)</label>
            <textarea
              value={q.explanation || ''}
              onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
              placeholder="Γιατί είναι σωστή η σωστή απάντηση..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>

        </div>
      ))}

      {questions.length > 0 && (
        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 hover:border-slate-400 transition-all"
        >
          <Plus className="w-5 h-5" /> Προσθήκη Ερώτησης
        </button>
      )}

      {questions.length > 0 && (
        <p className="text-xs text-slate-500 text-center font-bold">
          {questions.length} {questions.length === 1 ? 'ερώτηση' : 'ερωτήσεις'} συνολικά
        </p>
      )}
    </div>
  );
}