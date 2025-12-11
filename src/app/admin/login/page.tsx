'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Loader2, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '로그인에 실패했습니다.');
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-500 rounded-full mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">관리자 로그인</h1>
          <p className="text-blue-200">ORIGIN 성향 검사 관리 시스템</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                아이디
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="관리자 아이디"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="비밀번호"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-3 flex items-center text-sm">
                <ShieldAlert size={18} className="text-red-500 mr-2 flex-shrink-0" />
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                isLoading
                  ? 'bg-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>로그인 중...</span>
                </>
              ) : (
                <span>로그인</span>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-blue-200 text-sm mt-6">
          © 2024 ORIGIN. All rights reserved.
        </p>
      </div>
    </div>
  );
}
