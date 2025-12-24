// app/thread-list/page.tsx
'use client';
import { Suspense } from 'react';
import ThreadListPage from './ThreadListPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThreadListPage />
    </Suspense>
  );
}