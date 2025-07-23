import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import './fallback.css';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VetClaimBot - VA Benefits Assistant',
  description: 'AI-powered VA claims assistance for veterans and their families',
  keywords: ['VA benefits', 'veteran claims', 'disability', 'military benefits'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}