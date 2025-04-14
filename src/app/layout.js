import './globals.css';

export const metadata = {
  title: 'Ashes of Time',
  description: 'Post-apocalyptic sigle-player story game using Gemini AI',
  keywords: 'game, post-apocalyptic, AI, survival',
  author: 'Liam McAuliffe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
