// app/thread-list/ThreadListPage.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';

interface Thread {
  id: number;
  title: string;
}

interface Message {
  id: number;
  sender_type: string;
  content: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function ThreadListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const uid = searchParams.get('uid');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  const fetchThreads = useCallback(async () => {
    if (!uid) return;
    const res = await fetch(`${API_BASE_URL}/threads?uid=${uid}`);
    const data = await res.json();
    if (Array.isArray(data)) setThreads(data);
  }, [uid]);

  const fetchMessages = useCallback(async (threadId: number) => {
    const res = await fetch(`${API_BASE_URL}/messages?thread_id=${threadId}`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (selectedThreadId !== null) fetchMessages(selectedThreadId);
  }, [selectedThreadId, fetchMessages]);

  const handleCreateThread = async () => {
    if (!newThreadTitle.trim() || !uid) return;
    const res = await fetch(`${API_BASE_URL}/threads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, title: newThreadTitle }),
    });
    const data = await res.json();
    setNewThreadTitle('');
    fetchThreads();
    setSelectedThreadId(data.thread_id); // 自動で移動
    fetchMessages(data.thread_id);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || selectedThreadId === null) return;
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thread_id: selectedThreadId, content: inputMessage }),
    });
    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender_type: 'user', content: inputMessage },
      { id: Date.now() + 1, sender_type: 'assistant', content: data.reply },
    ]);
    setInputMessage('');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <main style={{ display: 'flex', height: '100vh' }}>
      {/* サイドバー */}
      <div style={{ width: '250px', backgroundColor: '#f7fafc', borderRight: '1px solid #ddd', padding: '1rem' }}>
        <h2>スレッド一覧</h2>
        <input
          value={newThreadTitle}
          onChange={(e) => setNewThreadTitle(e.target.value)}
          placeholder="スレッド名を入力"
          style={{ width: '100%', marginBottom: '0.5rem' }}
        />
        <button
          onClick={handleCreateThread}
          style={{
            width: '100%',
            marginBottom: '1rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '0.5rem',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          スレッド作成
        </button>
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>
              <button
                onClick={() => setSelectedThreadId(thread.id)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  marginBottom: '0.5rem',
                  backgroundColor: thread.id === selectedThreadId ? '#e0f7fa' : '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  padding: '0.5rem',
                }}
              >
                {thread.title}
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            marginTop: '2rem',
            backgroundColor: '#f44336',
            color: 'white',
            padding: '0.5rem',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          ログアウト
        </button>
      </div>

      {/* チャットエリア */}
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {selectedThreadId ? (
          <>
            <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender_type === 'assistant' ? 'flex-start' : 'flex-end',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      maxWidth: '60%',
                      backgroundColor: msg.sender_type === 'assistant' ? '#e3f2fd' : '#c8e6c9',
                      color: '#000',
                      padding: '0.75rem',
                      borderRadius: '10px',
                      borderTopLeftRadius: msg.sender_type === 'assistant' ? '0' : '10px',
                      borderTopRightRadius: msg.sender_type === 'assistant' ? '10px' : '0',
                    }}
                  >
                    <span>{msg.content}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', marginTop: 'auto' }}>
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="メッセージを入力"
                style={{ flex: 1, marginRight: '0.5rem', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc' }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                }}
              >
                送信
              </button>
            </div>
          </>
        ) : (
          <p>スレッドを選択してください</p>
        )}
      </div>
    </main>
  );
}
