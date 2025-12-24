'use client';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../lib/firebase';
import { useRouter } from 'next/navigation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Cloud Run 上の register API に送信
      await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          name: user.displayName,
        }),
      });

      // スレッド一覧ページに遷移
      router.push(`/thread-list?uid=${user.uid}`);
    } catch (error) {
      console.error('ログイン失敗:', error);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
      }}
    >
      <h1 style={{ marginBottom: '2rem', color: '#333' }}>Chat Appへようこそ</h1>
      <button
        onClick={handleLogin}
        style={{
          padding: '1rem 2rem',
          backgroundColor: '#4CAF50',
          color: 'white',
          fontSize: '1rem',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
      >
        Googleでログイン
      </button>
    </div>
  );
}
