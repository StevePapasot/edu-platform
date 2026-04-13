'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Wand2, AlignLeft, Youtube, FileText as FilePdf, HelpCircle } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import RichTextEditor from '@/src/components/RichTextEditor';

interface LessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: any; 
  onUpdate: () => void; 
}

export function LessonEditorModal({ isOpen, onClose, lesson, onUpdate }: LessonEditorModalProps) {
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && lesson) {
      setContent(lesson.content || '');
    }
  }, [isOpen, lesson]);

  if (!isOpen || !lesson) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const lessonRef = doc(db, 'lessons', lesson.id);
      await updateDoc(lessonRef, {
        content: content
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving lesson content:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      let promptStr = '';
      if (lesson.type === 'quiz') {
        promptStr = `Είσαι καθηγητής. Δημιούργησε ένα εκπαιδευτικό quiz για μαθητές με θέμα "${lesson.title}". Φτιάξε 3 ερωτήσεις πολλαπλής επιλογής (με 4 πιθανές απαντήσεις η καθεμία, Α, Β, Γ, Δ). Στο τέλος δώσε ξεκάθαρα τις σωστές απαντήσεις. Χρησιμοποίησε HTML μορφοποίηση (όπως <b>, <br>, <ul>, <li>) για να είναι όμορφο.`;
      } else {
        promptStr = `Είσαι καθηγητής. Γράψε αναλυτική και κατανοητή εκπαιδευτική θεωρία για μαθητές, με θέμα "${lesson.title}". Χώρισε το κείμενο σε παραγράφους, χρησιμοποίησε HTML μορφοποίηση (π.χ. <strong>, <h3>, <ul>, <li>, <br>) όπου χρειάζεται για ευκολότερη ανάγνωση, και κράτα ένα φιλικό ύφος.`;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptStr })
      });

      const data = await res.json();

      if (res.ok) {
        setContent(data.text);
      } else {
        alert("Σφάλμα AI: " + data.error);
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Αποτυχία σύνδεσης με το Gemini AI.");
    } finally {
      setGenerating(false);
    }
  };

  const getTypeInfo = () => {
    switch (lesson.type) {
      case 'text': return { icon: <AlignLeft className="w-5 h-5" />, label: 'Συγγραφή Θεωρίας' };
      case 'video': return { icon: <Youtube className="w-5 h-5 text-red-500" />, label: 'Link Βίντεο (YouTube)' };
      case 'pdf': return { icon: <FilePdf className="w-5 h-5 text-red-400" />, label: 'Link Αρχείου PDF' };
      case 'quiz': return { icon: <HelpCircle className="w-5 h-5 text-green-500" />, label: 'Δημιουργία Quiz' };
      default: return { icon: <AlignLeft className="w-5 h-5" />, label: 'Περιεχόμενο' };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              {typeInfo.icon} {lesson.title}
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{typeInfo.label}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50">
          
          {(lesson.type === 'text' || lesson.type === 'quiz') && (
            <div className="mb-4">
              <button 
                onClick={handleGenerateAI}
                disabled={generating}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Το Gemini AI σκέφτεται...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 animate-pulse" />
                    Γράψε το με Gemini AI
                  </>
                )}
              </button>
            </div>
          )}

          {lesson.type === 'text' || lesson.type === 'quiz' ? (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <RichTextEditor 
                value={content || ''} 
                onChange={(val) => setContent(val)} 
              />
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Επικόλληση Συνδέσμου (URL)</label>
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="π.χ. https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          )}

        </div>

        <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 flex-shrink-0">
          <button 
            onClick={onClose}
            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
          >
            Ακύρωση
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Αποθήκευση
          </button>
        </div>

      </div>
    </div>
  );
}