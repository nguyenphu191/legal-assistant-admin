import './globals.css';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../contexts/AuthContext';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Legal Assistant Admin',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <html lang="vi">
      <body>
        {isAuthenticated ? (
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: '200px', width: '100%' }}>{children}</main>
          </div>
        ) : children}
      </body>
    </html>
  );
}