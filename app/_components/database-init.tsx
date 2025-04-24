'use client';

import { useEffect } from 'react';
import { initializeDatabase } from '@/lib/dbInit';

export function DatabaseInit() {
  useEffect(() => {
    const initDb = async () => {
      try {
        await initializeDatabase();
        console.log('Database initialized successfully');
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    // Initialize database on client side
    initDb();
  }, []);

  // This component doesn't render anything
  return null;
}
