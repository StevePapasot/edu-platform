'use client';

import React, { useState, Suspense } from 'react';
import { auth } from '@/src/lib/firebase';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const oobCode = searchParams.get('oobCode');

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) {
      setStatus('error');
      setErrorMessage('Ο σύνδεσμος είναι άκυρος ή έχει λήξει.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus('success');
      setTimeout(() => router.push('/'), 3000); // Επιστροφή στην αρχική μετά από 3 δευτερόλεπτα
    } catch (error: any) {
      setStatus('error');
      setErrorMessage('Αποτυχία αλλαγής κωδικού. Δοκίμασε ξανά.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
        <h2 className="text-2xl font-bold">Επιτυχία!</h2>
        <p className="text-slate-600">Ο κωδικός σου άλλαξε. Σε μεταφέρουμε στην αρχική σελίδα...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 ml-1">Νέος Κωδικός</label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="password" 
            placeholder="••••••••"
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-medium"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
      </div>

      {status === 'error' && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100">
          <AlertCircle className="w-5 h-5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
      >
        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
        <span>Ενημέρωση Κωδικού</span>
      </button>
    </form>
  );
}

// Χρησιμοποιούμε Suspense επειδή το useSearchParams το απαιτεί στο Next.js App Router
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-slate-100 relative">
        <div className="h-2 bg-blue-600 absolute top-0 left-0 right-0 rounded-t-3xl"></div>
        <div className="text-center mb-8">
           <h1 className="text-2xl font-black text-slate-900">Ορισμός Κωδικού</h1>
        </div>
        <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin mx-auto" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}