'use client';

import React, { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Loader2 } from 'lucide-react';

// Φόρτωση του Editor
const ReactQuill = dynamic(() => import('react-quill'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const quillRef = useRef<any>(null);
  
  // Η ΜΑΓΙΚΗ ΛΥΣΗ: Λέμε στο TypeScript "Είναι any, μην το ελέγχεις!"
  const QuillAny = ReactQuill as any; 

  // Μηχανισμός ανεβάσματος στο Cloudinary
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (!file) return;

      // Τα στοιχεία σου!
      const cloudName = 'dz4xlea6a';
      const uploadPreset = 'eduplatform_images';

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        
        if (data.secure_url) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          quill.insertEmbed(range.index, 'image', data.secure_url);
          quill.setSelection(range.index + 1);
        }
      } catch (error) {
        console.error('Σφάλμα ανεβάσματος:', error);
        alert('Αποτυχία ανεβάσματος. Δοκιμάστε ξανά.');
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['image', 'video', 'link'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), []);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <style>{`
        .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #e2e8f0; background: #f8fafc; font-family: inherit; }
        .ql-container.ql-snow { border: none; font-family: inherit; font-size: 16px; height: 45vh; min-height: 300px; }
        .ql-editor { padding: 1.5rem; }
        .ql-editor img { border-radius: 12px; margin: 1rem 0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); max-width: 100%; }
      `}</style>
      
      <QuillAny 
        ref={quillRef}
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules}
      />
    </div>
  );
}