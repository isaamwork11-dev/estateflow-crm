'use client';

import { useEffect } from 'react';
import { recordPresentationEventAction } from '@/lib/actions/presentations';

export function PresentationViewTracker({ token }: { token: string }) {
  useEffect(() => {
    recordPresentationEventAction(token, 'viewed').catch(() => {});
  }, [token]);
  return null;
}
