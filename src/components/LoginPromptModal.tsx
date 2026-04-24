import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../auth/AuthContext';

const PB_URL = 'https://db.aiceo.im';

interface LoginPromptModalProps {
  onClose: () => void;
}

export function LoginPromptModal({ onClose }: LoginPromptModalProps) {
  const { login } = useAuth();
  const [tab, setTab] = useState<'google' | 'email'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const info = await res.json();
      login({ name: info.name, email: info.email, picture: info.picture });
      onClose();
    },
    onError: () => setError('Google login ล้มเหลว ลองใช้ email แทน'),
  });

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${PB_URL}/api/collections/members/auth-with-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      const record = data.record;
      login({
        name: record.name || record.email,
        email: record.email,
        picture: record.avatar
          ? `${PB_URL}/api/files/members/${record.id}/${record.avatar}`
          : `https://ui-avatars.com/api/?name=${encodeURIComponent(record.name || record.email)}&background=4f46e5&color=fff`,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center mb-5">
          <div className="text-3xl mb-2">🔒</div>
          <h2 className="text-base font-bold text-zinc-100">เข้าสู่ระบบเพื่อ Copy Prompt</h2>
          <p className="text-xs text-zinc-500 mt-1">ดู prompt ได้ฟรี แต่ต้อง login เพื่อนำไปใช้</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-xl bg-zinc-800 p-1 mb-5 gap-1">
          <button
            onClick={() => setTab('google')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === 'google' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setTab('email')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              tab === 'email' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Email / Password
          </button>
        </div>

        {tab === 'google' ? (
          <button
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition-all shadow-md text-sm"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm"
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>
        )}

        {error && tab === 'google' && <p className="text-xs text-red-400 mt-2 text-center">{error}</p>}

        <button onClick={onClose} className="w-full mt-3 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
