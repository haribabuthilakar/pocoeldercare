import type { Metadata } from 'next';
import { DbSidebar } from '../components/layout/db-sidebar';
import { DbHeader } from '../components/layout/db-header';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pococare DB Admin — Universal CRUD Hub',
  description: 'High-productivity CRUD interface for all 18 tables in the Pococare database',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
        <DbSidebar />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DbHeader />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
