import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RetailRune - Personalized On-Chain Shopping',
  description: 'AI-powered product recommendations and personalized follow-up offers for retail stores on Base.',
  keywords: ['retail', 'AI', 'recommendations', 'Base', 'blockchain', 'shopping'],
  authors: [{ name: 'RetailRune Team' }],
  openGraph: {
    title: 'RetailRune - Personalized On-Chain Shopping',
    description: 'AI-powered product recommendations and personalized follow-up offers for retail stores on Base.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
