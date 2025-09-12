import AuthForm from '../../components/auth/AuthForm';
import styles from './auth.module.css';

const AuthPage = () => {
  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <AuthForm />
    </div>
  );
};

export default AuthPage;