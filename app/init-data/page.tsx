'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CircleCheck as CheckCircle, Circle as XCircle, Loader } from 'lucide-react';
import { courseService } from '@/src/services/courseService';

export default function InitDataPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const handleInitialize = async () => {
    setStatus('loading');
    setError('');

    try {
      await courseService.initializeCourseData();
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-blue-900 mb-4">
          Initialize Course Data
        </h1>

        <p className="text-gray-600 mb-6">
          Click the button below to initialize the course data in Firestore. This only needs to be done once.
        </p>

        {status === 'idle' && (
          <button
            onClick={handleInitialize}
            className="w-full px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
          >
            Initialize Data
          </button>
        )}

        {status === 'loading' && (
          <div className="flex items-center justify-center gap-3 py-4">
            <Loader className="w-6 h-6 text-blue-900 animate-spin" />
            <span className="text-gray-600">Initializing data...</span>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-green-600 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Data initialized successfully!</span>
            </div>
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium text-center"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 text-red-600 p-4 bg-red-50 rounded-lg">
              <XCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Error initializing data</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={handleInitialize}
              className="w-full px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
