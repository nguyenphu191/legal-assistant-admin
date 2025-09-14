import AuthForm from '../../components/auth/AuthForm';
import styles from './auth.module.css';

const AuthPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Legal Assistant Admin</h1>
      <p className={styles.subtitle}>
        Đăng nhập để quản lý hệ thống xử lý tài liệu pháp lý
      </p>
      <AuthForm />
    </div>
  );
};

export default AuthPage;