'use client';

import { useState, useEffect } from 'react';
import { X, Save, Loader2, Wand2, AlignLeft, Youtube, FileText as FilePdf, HelpCircle, Upload } from 'lucide-react';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import RichTextEditor from '@/src/components/RichTextEditor';
import { QuizBuilder, type QuizQuestion } from '@/src/components/QuizBuilder';

interface LessonEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson: any; 
  onUpdate: () => void; 
}

export function LessonEditorModal({ isOpen, onClose, lesson, onUpdate }: LessonEditorModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfFileName, setPdfFileName] = useState('');

  useEffect(() => {
    if (isOpen && lesson) {
      setTitle(lesson.title || '');
      setContent(lesson.content || '');
      setQuestions(Array.isArray(lesson.questions) ? lesson.questions : []);
      setPdfFileName('');
    }
  }, [isOpen, lesson]);

  if (!isOpen || !lesson) return null;

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Ο τίτλος δεν μπορεί να είναι κενός.');
      return;
    }

    if (lesson.type === 'quiz') {
      if (questions.length === 0) {
        toast.error('Το quiz πρέπει να έχει τουλάχιστον μία ερώτηση.');
        return;
      }
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text.trim()) {
          toast.error(`Η ερώτηση ${i + 1} δεν έχει κείμενο.`);
          return;
        }
        if (q.choices.some(c => !c.trim())) {
          toast.error(`Η ερώτηση ${i + 1} έχει κενές επιλογές.`);
          return;
        }
      }
    }

    setSaving(true);
    try {
      const lessonRef = doc(db, 'lessons', lesson.id);
      const updateData: any = {
        title: title.trim()
      };

      if (lesson.type === 'quiz') {
        updateData.questions = questions;
      } else {
        updateData.content = content;
      }

      await updateDoc(lessonRef, updateData);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error('Σφάλμα κατά την αποθήκευση.');
    } finally {
      setSaving(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Παρακαλώ επιλέξτε αρχείο PDF.');
      return;
    }
    setPdfUploading(true);
    setPdfFileName(file.name);
    try {
      const cloudName = 'dz4xlea6a';
      const uploadPreset = 'eduplatform_pdfs';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        setContent(data.secure_url);
      } else {
        toast.error('Αποτυχία ανεβάσματος PDF.');
        setPdfFileName('');
      }
    } catch (error) {
      console.error('PDF upload error:', error);
      toast.error('Σφάλμα ανεβάσματος.');
      setPdfFileName('');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const promptStr = `Είσαι καθηγητής. Γράψε αναλυτική και κατανοητή εκπαιδευτική θεωρία για μαθητές, με θέμα "${title}". Χώρισε το κείμενο σε παραγράφους, χρησιμοποίησε HTML μορφοποίηση (π.χ. <strong>, <h3>, <ul>, <li>, <br>) όπου χρειάζεται για ευκολότερη ανάγνωση, και κράτα ένα φιλικό ύφος.`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptStr })
      });

      const data = await res.json();

      if (res.ok) {
        setContent(data.text);
      } else {
        toast.error("Σφάλμα AI: " + data.error);
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      toast.error('Αποτυχία σύνδεσης με το Gemini AI.');
    } finally {
      setGenerating(false);
    }
  };

  const getTypeInfo = () => {
    switch (lesson.type) {
      case 'text': return { icon: <AlignLeft className="w-5 h-5" />, label: 'Συγγραφή Θεωρίας' };
      case 'video': return { icon: <Youtube className="w-5 h-5 text-red-500" />, label: 'Link Βίντεο (YouTube)' };
      case 'pdf': return { icon: <FilePdf className="w-5 h-5 text-red-400" />, label: 'Αρχείο PDF' };
      case 'quiz': return { icon: <HelpCircle className="w-5 h-5 text-amber-500" />, label: 'Επεξεργασία Quiz' };
      default: return { icon: <AlignLeft className="w-5 h-5" />, label: 'Περιεχόμενο' };
    }
  };

  const typeInfo = getTypeInfo();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {typeInfo.icon}
            <div>
              <h3 className="font-black text-slate-800">Επεξεργασία Ενότητας</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{typeInfo.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto bg-slate-50/50 space-y-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Τίτλος Ενότητας</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Τίτλος ενότητας"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            />
          </div>

          {lesson.type === 'text' && (
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
          )}

          {lesson.type === 'text' && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <RichTextEditor 
                value={content || ''} 
                onChange={(val) => setContent(val)} 
              />
            </div>
          )}

          {lesson.type === 'quiz' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200">
              <QuizBuilder 
                questions={questions} 
                onChange={setQuestions}
                topicHint={title}
              />
            </div>
          )}

          {lesson.type === 'video' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">YouTube / Vimeo URL</label>
              <input
                type="url"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="π.χ. https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          )}

          {lesson.type === 'pdf' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Τρέχον PDF</label>
                {content ? (
                  <a href={content} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline break-all">
                    {content}
                  </a>
                ) : (
                  <p className="text-xs text-slate-400 italic">Δεν υπάρχει PDF ακόμη.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Αλλαγή / Ανέβασμα Νέου PDF</label>
                <label className="block cursor-pointer">
                  <div className="w-full px-4 py-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-50 flex items-center justify-center gap-3 font-bold text-slate-700">
                    {pdfUploading ? (
                      <><Loader2 className="w-5 h-5 animate-spin text-blue-600" /><span>Ανέβασμα...</span></>
                    ) : pdfFileName ? (
                      <><FilePdf className="w-5 h-5 text-green-600" /><span className="text-green-700">✓ {pdfFileName}</span></>
                    ) : (
                      <><Upload className="w-5 h-5 text-blue-600" /><span>Επιλογή νέου αρχείου PDF...</span></>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
                  />
                </label>
              </div>
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
            disabled={saving || pdfUploading}
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