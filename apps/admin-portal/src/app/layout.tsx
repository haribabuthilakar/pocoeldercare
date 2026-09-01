import * as React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Poco Elder Care — Operations & Admin Portal',
  description: 'Mission-critical operational command center for Poco Elder Care operations, care managers, and executives.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
