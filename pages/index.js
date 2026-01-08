// pages/index.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function SecurityCheck() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isHuman, setIsHuman] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Menganalisis traffic...');

  // Simulasi pengecekan bot/user
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
      setIsHuman(true); // Default lolos untuk demo ini
      setStatusMessage('Verifikasi Berhasil: Manusia Terdeteksi');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    // Redirect ke file static index.html di folder public
    router.push('/bernda.html');
  };

  return (
    <div style={styles.container}>
      <Head>
        <title>Security Check - MangaReader</title>
      </Head>

      <div style={styles.card}>
        <div style={styles.icon}>🛡️</div>
        <h1 style={styles.title}>Security Check</h1>
        
        {isChecking ? (
          <div style={styles.loadingWrapper}>
            <div style={styles.spinner}></div>
            <p style={styles.text}>{statusMessage}</p>
          </div>
        ) : (
          <div style={styles.contentWrapper}>
            <p style={styles.successText}>{statusMessage}</p>
            <button onClick={handleEnter} style={styles.button}>
              Masuk ke Website
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// CSS-in-JS sederhana untuk file ini
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#0f0f0f',
    fontFamily: 'sans-serif',
    margin: 0,
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: '2rem',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #333',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  title: {
    color: '#fff',
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
  },
  text: {
    color: '#aaa',
    marginTop: '1rem',
  },
  successText: {
    color: '#4caf50',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
  },
  loadingWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spinner: {
    border: '4px solid #333',
    borderTop: '4px solid #fff',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#fff',
    color: '#000',
    border: 'none',
    padding: '12px 24px',
    fontSize: '1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'transform 0.2s',
  },
};
// Inject keyframes secara manual untuk Next.js
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  `;
  document.head.appendChild(styleSheet);
}
