'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, ArrowRight, Loader2, Check } from 'lucide-react';

type AgeRange = 'under18' | '19-25' | '26-50' | 'over51';
type Gender = 'male' | 'female';

// 나이대를 대표 나이값으로 변환하는 함수
const getRepresentativeAge = (ageRange: AgeRange): number => {
  switch (ageRange) {
    case 'under18':
      return 15;
    case '19-25':
      return 22;
    case '26-50':
      return 38;
    case 'over51':
      return 55;
    default:
      return 25;
  }
};

export default function StartTestPage() {
  const router = useRouter();
  
  // 상태 관리
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedAgeRange, setSelectedAgeRange] = useState<AgeRange | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 성별 버튼 데이터
  const genderOptions = [
    { value: 'male' as Gender, label: '남자', icon: <User size={18} /> },
    { value: 'female' as Gender, label: '여자', icon: <User size={18} /> }
  ];

  // 나이 버튼 데이터
  const ageOptions = [
    { value: 'under18' as AgeRange, label: '18세 이하' },
    { value: '19-25' as AgeRange, label: '19~25세' },
    { value: '26-50' as AgeRange, label: '26~50세' },
    { value: 'over51' as AgeRange, label: '51세 이상' }
  ];

  // API 호출 함수
  const handleNext = async () => {
    // 유효성 검사
    if (!selectedGender || !selectedAgeRange) {
      setError('성별과 나이를 모두 선택해주세요.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // API 호출 데이터 준비
      const requestData = {
        gender: selectedGender,
        age: getRepresentativeAge(selectedAgeRange),
      };

      // API 호출
      const response = await fetch('/api/test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '테스트 시작에 실패했습니다.');
      }

      if (result.success && result.attempt_id) {
        // 성공 시 질문 페이지로 이동
        router.push(`/questions?attemptId=${result.attempt_id}`);
      } else {
        throw new Error('서버 응답이 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('API 호출 오류:', error);
      setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 버튼 공통 스타일 (선택되지 않았을 때)
  const buttonBaseStyle = "group flex items-center justify-center space-x-2 py-4 px-4 rounded-xl border-2 transition-all duration-200 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50";
  const buttonUnselectedStyle = "border-slate-300 bg-white text-slate-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700";
  const buttonSelectedStyle = "border-blue-600 bg-blue-500 text-white shadow-md scale-[1.02]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-12 px-4 flex flex-col items-center justify-center">
      {/* 로고 또는 서비스 이름 */}
      <div className="text-center mb-10">
        <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
          <Users size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-1">
          옥타그노시스 AI
        </h1>
        <p className="text-md text-slate-500">당신의 성향을 알아보세요!</p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 space-y-8 border border-slate-200">
        {/* 성별 선택 */}
        <div>
          <h2 className="text-xl font-semibold text-slate-700 mb-1">성별</h2>
          <p className="text-sm text-slate-500 mb-4">정확한 분석을 위해 성별을 선택해주세요.</p>
          <div className="grid grid-cols-2 gap-4">
            {genderOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedGender(option.value)}
                className={`${buttonBaseStyle} ${
                  selectedGender === option.value
                    ? buttonSelectedStyle
                    : buttonUnselectedStyle
                }`}
                disabled={isLoading}
              >
                {selectedGender === option.value && <Check size={18} className="mr-1" />}
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 나이 선택 */}
        <div>
          <h2 className="text-xl font-semibold text-slate-700 mb-1">나이대</h2>
          <p className="text-sm text-slate-500 mb-4">나이대에 맞는 분석 결과를 제공합니다.</p>
          <div className="grid grid-cols-2 gap-4">
            {ageOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedAgeRange(option.value)}
                className={`${buttonBaseStyle} ${
                  selectedAgeRange === option.value
                    ? buttonSelectedStyle
                    : buttonUnselectedStyle
                }`}
                disabled={isLoading}
              >
                {selectedAgeRange === option.value && <Check size={18} className="mr-1" />}
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 rounded-lg p-3 text-center">
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* 다음 버튼 */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleNext}
            disabled={isLoading || !selectedGender || !selectedAgeRange}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
              ${
                isLoading || !selectedGender || !selectedAgeRange
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin mr-2" />
                <span>다음 단계로 이동 중...</span>
              </>
            ) : (
              <>
                <span>NEXT</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 진행 표시 */}
      <div className="mt-10 w-full max-w-lg">
        <div className="flex justify-between items-center text-xs text-slate-500 mb-1 px-1">
          <span>정보 입력</span>
          <span>성향 분석</span>
          <span>결과 확인</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 relative">
          <div
            className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500 ease-out shadow-md"
            style={{ width: '33%' }}
          />
          <div className="absolute top-0 left-[33%] w-3 h-3 -mt-[2px] bg-white border-2 border-blue-500 rounded-full" />
        </div>
      </div>
    </div>
  );
} 