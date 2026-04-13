import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduPlatform',
  description: 'Μάθε τις δεξιότητες του μέλλοντος με την ένταση του σήμερα.',
  // Εδώ προσθέσαμε την επαλήθευση για το Affiliate πρόγραμμα
  verification: {
    other: {
      'impact-site-verification': '8ef46baf-724c-4a5b-a71f-85a7e409855d',
    },
  },
  openGraph: {
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body className={inter.className}>{children}</body>
    </html>
  );
}