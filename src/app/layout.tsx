'use client';
import { useEffect } from 'react';
import './globals.css';
import Sidebar from '../components/layout/Sidebar';
import { useAuthStore } from '../contexts/AuthContext';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoaded, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (!isLoaded) {
    return (
      <html lang="vi">
        {/* <head>
          <title>Legal Assistant Admin</title>
          <meta name="description" content="Hệ thống quản lý tài liệu pháp lý" />
        </head> */}
        <body>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100vh',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #1e40af',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p>Đang tải...</p>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="vi">
      
      <body>
        {isAuthenticated ? (
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: '200px', width: 'calc(100% - 200px)', minHeight: '100vh' }}>
              {children}
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}