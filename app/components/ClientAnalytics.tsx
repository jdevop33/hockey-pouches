'use client';

import React from 'react';
import GoogleAnalytics from './GoogleAnalytics';
import MicrosoftClarity from './MicrosoftClarity';
import { Analytics } from '@vercel/analytics/react';

export default function ClientAnalytics() {
  return (
    <>
      <GoogleAnalytics />
      <MicrosoftClarity />
      <Analytics />
    </>
  );
}
