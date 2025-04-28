'use client';

import React, { ReactNode } from 'react';
import Footer from './Footer';
import NavbarWrapper from './NavbarWrapper';

interface LayoutProps {
  children: ReactNode;
}

/**
 * Main layout component that structures the entire application.
 * Uses NavbarWrapper for navigation which implements Refactoring UI principles.
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col bg-dark-500">
      <NavbarWrapper />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
