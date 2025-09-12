'use client';
import { useEffect } from 'react';
import { useAuthStore } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth');
    }
  }, [isAuthenticated, router]);

  return <div>Loading...</div>;
};

export default Home;