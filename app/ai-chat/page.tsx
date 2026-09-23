'use client';

import TestPanel from '@/components/test/TestPanel';
import TutorChat from '@/components/chat/TutorChat';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFC]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-6 lg:h-[calc(100vh-3rem)]">
          
          {/* ЛЕВО — тест, свой скролл */}
          <div className="lg:overflow-y-auto lg:pr-2">
            <TestPanel />
          </div>

          {/* ПРАВО — чат, свой скролл */}
          <div className="lg:overflow-hidden pt-20">
            <TutorChat />
          </div>

        </div>
      </div>
    </div>
  );
}