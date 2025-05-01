import './globals.css';
import { GameProvider } from '../context/GameContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ashes of Time',
  description: 'Post-apocalyptic single-player story game using Gemini AI',
  keywords: 'game, post-apocalyptic, AI, survival',
  authors: [{ name: 'Liam McAuliffe' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
} 