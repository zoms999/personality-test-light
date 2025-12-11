'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Filter, 
  Download,
  Loader2,
  Calendar,
  Search
} from 'lucide-react';

interface StatisticsData {
  user_name: string;
  user_email: string;
  gender: string;
  result_created_at_kst: string;
  personality_code: string;
  personality_name: string;
  personality_title: string;
  personality_theme: string;
  personality_description: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [statistics, setStatistics] = useState<StatisticsData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [gender, setGender] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchStatistics = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        gender,
      });

      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/statistics?${params}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error(data.error || '데이터 조회 실패');
      }

      setStatistics(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : '데이터 조회 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleSearch = () => {
    fetchStatistics(1);
  };

  const handlePageChange = (newPage: number) => {
    fetchStatistics(newPage);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = [
      '이름',
      '이메일',
      '성별',
      '검사일시',
      '성격코드',
      '성격명',
      '제목',
      '주제문장',
      '설명',
    ];

    const rows = statistics.map((stat) => [
      stat.user_name,
      stat.user_email,
      stat.gender === 'male' ? '남자' : '여자',
      formatDate(stat.result_created_at_kst),
      stat.personality_code,
      stat.personality_name,
      stat.personality_title,
      stat.personality_theme,
      stat.personality_description.replace(/\n/g, ' '),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter size={20} className="text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-800">필터</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">성별</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="all">전체</option>
              <option value="male">남자</option>
              <option value="female">여자</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">시작일</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">종료일</label>
            <div className="relative">
              <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleSearch}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-slate-400"
            >
              <Search size={18} />
              <span>검색</span>
            </button>
            <button
              onClick={exportToCSV}
              disabled={isLoading || statistics.length === 0}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-slate-400"
              title="CSV 내보내기"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            총 <span className="font-semibold text-blue-600">{pagination.totalCount}</span>건의 결과
          </div>
          <div className="text-sm text-slate-600">
            페이지 {pagination.page} / {pagination.totalPages}
          </div>
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 size={40} className="text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">데이터를 불러오는 중...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : statistics.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600">조회된 데이터가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[8%]" />   {/* 이름 */}
                  <col className="w-[16%]" />  {/* 이메일 */}
                  <col className="w-[6%]" />   {/* 성별 */}
                  <col className="w-[14%]" />  {/* 검사일시 */}
                  <col className="w-[14%]" />  {/* 성격유형 */}
                  <col className="w-[14%]" />  {/* 성격제목 */}
                  <col className="w-[14%]" />  {/* 성향분석 */}
                </colgroup>
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      이메일
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      성별
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      검사일시
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      성향
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      성향테마
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      성향분석
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {statistics.map((stat, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors align-top">
                      {/* 이름 */}
                      <td className="px-4 py-3 text-sm text-slate-900">
                        {stat.user_name}
                      </td>

                      {/* 이메일 */}
                      <td className="px-4 py-3 text-sm text-slate-600 truncate" title={stat.user_email}>
                        {stat.user_email}
                      </td>

                      {/* 성별 */}
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            stat.gender === 'male'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-pink-100 text-pink-700'
                          }`}
                        >
                          {stat.gender === 'male' ? '남자' : '여자'}
                        </span>
                      </td>

                      {/* 검사일시 */}
                      <td className="px-4 py-3 text-xs text-slate-600 whitespace-nowrap">
                        {formatDate(stat.result_created_at_kst)}
                      </td>

                      {/* 성격유형 (이름 + 코드) */}
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-slate-900">
                          {stat.personality_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {stat.personality_code}
                        </div>
                      </td>

                      {/* 성격제목 */}
                      <td
                        className="px-4 py-3 text-sm text-slate-600 leading-snug line-clamp-2"
                        title={stat.personality_title}
                      >
                        {stat.personality_title}
                      </td>

                      {/* 성격테마 */}
                      <td
                        className="px-4 py-3 text-sm text-slate-600 leading-snug line-clamp-2"
                        title={stat.personality_theme}
                      >
                        {stat.personality_theme}
                      </td>

                      {/* 성격설명 */}
                      <td
                        className="px-4 py-3 text-xs text-slate-600 max-w-xs leading-relaxed whitespace-pre-line"
                        title={stat.personality_description}
                      >
                        {stat.personality_description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
