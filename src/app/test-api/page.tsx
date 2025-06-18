'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testStartApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: '테스트사용자',
          birthDate: '19900101',
          age: 34,
          gender: 'male',
          userEmail: 'test@example.com',
          phoneNumber: '01012345678',
          agreedToPrivacy: true
        })
      });

      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API 테스트</h1>
      
      <button 
        onClick={testStartApi}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        {loading ? '테스트 중...' : 'Start API 테스트'}
      </button>
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">결과:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {result || '테스트를 실행하려면 버튼을 클릭하세요.'}
        </pre>
      </div>
    </div>
  );
} 