import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export const metadata: Metadata = {
  title: 'Pococare Family Portal | Elder Care Peace of Mind',
  description: 'Track vitals, manage appointments, and stay connected with dedicated care officers in India.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#f8fbfb] text-slate-900 font-sans antialiased selection:bg-[#FE1D8F]/20 selection:text-[#FE1D8F]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
