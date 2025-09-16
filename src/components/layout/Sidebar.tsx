'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '../../contexts/AuthContext';
import styles from './Sidebar.module.css';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊'
    },
    {
      label: 'Upload Tài liệu',
      path: '/upload',
      icon: '📤'
    },
    {
      label: 'Quản lý Chunks',
      path: '/chunks',
      icon: '📝'
    },
    {
      label: 'Tài liệu',
      path: '/documents',
      icon: '📄'
    }
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>Legal Assistant</h2>
        <p className={styles.subtitle}>Admin Panel</p>
      </div>

      <nav className={styles.nav}>
        {/* {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`${styles.navItem} ${pathname === item.path ? styles.navItemActive : ''}`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))} */}
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutButton}>
          <span className={styles.icon}>🚪</span>
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;