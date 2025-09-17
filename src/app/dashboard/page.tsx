'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/dashboardService';
import { Statistics, Document, Chunk } from '../../types';
import DocumentCard from '../../components/ui/DocumentCard';
import styles from './dashboard.module.css';

const Dashboard = () => {
  const { user } = useAuthStore();
  const router = useRouter(); // ✅ FIXED: Use useRouter hook
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [pendingChunks, setPendingChunks] = useState<Chunk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleNavigation = (path: string) => {
    console.log('Navigating to:', path);
    router.push(path);
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [stats, docs, chunks] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getRecentDocuments(5),
        dashboardService.getPendingChunks(10)
      ]);
      
      setStatistics(stats);
      setRecentDocuments(docs);
      setPendingChunks(chunks);
    } catch (err) {
      setError('Không thể tải dữ liệu dashboard');
      console.error('Dashboard loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h3>⚠️ Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={loadDashboardData} className={styles.retryButton}>
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>DASHBOARD QUẢN LÝ CHUNKS PHÁP LÝ</h1>
        <div className={styles.userInfo}>
          <span>Xin chào, {user?.username}!</span>
        </div>
      </div>
      
      <div className={styles.content}>
        {/* Thống kê tổng quan */}
        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>📊 THỐNG KÊ TỔNG QUAN:</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📄</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics?.totalDocuments || 0}</div>
                <div className={styles.statLabel}>Tài liệu</div>
              </div>
            </div>
            
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics?.totalChunks || 0}</div>
                <div className={styles.statLabel}>Chunks</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.statSuccess}`}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics?.approvedChunks || 0}</div>
                <div className={styles.statLabel}>Đã duyệt</div>
              </div>
            </div>
            
            <div className={`${styles.statCard} ${styles.statWarning}`}>
              <div className={styles.statIcon}>⏳</div>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>{statistics?.pendingChunks || 0}</div>
                <div className={styles.statLabel}>Chờ duyệt</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tài liệu gần đây */}
        <div className={styles.documentsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📋 TÀI LIỆU GẦN ĐÂY:</h2>
            <div className={styles.actionButtons}>
              <button 
                onClick={() => handleNavigation('/upload')} 
                className={`${styles.button} ${styles.buttonPrimary}`}
              >
                📤 UPLOAD TÀI LIỆU
              </button>
              <button className={`${styles.button} ${styles.buttonSecondary}`}>
                📊 BÁO CÁO
              </button>
              <button className={`${styles.button} ${styles.buttonSecondary}`}>
                ⚙️ CÀI ĐẶT
              </button>
            </div>
          </div>
          
          <div className={styles.documentsList}>
            {recentDocuments.length > 0 ? (
              recentDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Chưa có tài liệu nào được upload.</p>
                <button 
                  onClick={() => handleNavigation('/upload')}
                  className={`${styles.button} ${styles.buttonPrimary}`}
                >
                  📤 Upload tài liệu đầu tiên
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danh sách chunks chờ duyệt */}
        <div className={styles.chunksSection}>
          <h2 className={styles.sectionTitle}>⏳ CHUNKS CHỜ DUYỆT:</h2>
          <div className={styles.chunksList}>
            {pendingChunks.length > 0 ? (
              pendingChunks.map((chunk) => (
                <div key={chunk.id} className={styles.chunkCard}>
                  <div className={styles.chunkHeader}>
                    <span className={styles.chunkId}>📑 {chunk.id}</span>
                    <span className={styles.chunkDoc}>Tài liệu: {chunk.documentId}</span>
                  </div>
                  <p className={styles.chunkContent}>{chunk.content}</p>
                  <div className={styles.chunkFooter}>
                    <span>Trạng thái: {chunk.status}</span>
                    <span>Ngày tạo: {new Date(chunk.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Hiện chưa có chunk nào chờ duyệt.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;