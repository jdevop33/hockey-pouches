'use client';

import React from 'react';
import Navbar from './Navbar';

/**
 * Simplified wrapper that renders the safe Navbar component
 * The Navbar component itself now handles safe mounting and hydration
 */
export default function NavbarWrapper() {
  return <Navbar />;
}
