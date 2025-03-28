import './globals.css';
import Navbar from './components/Navbar'
import { ClerkProvider } from '@clerk/nextjs'

export const metadata = {
  title: 'INFO BIOM',
  description: 'Your personalized feed from Twitter, YouTube, and Instagram',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
        <Navbar />
        <main style={{ paddingTop: '80px' }}>  {/* Add this class */}
          {children}
        </main>
        </ClerkProvider>
      </body>
    </html>
  );
}
