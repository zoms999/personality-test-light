'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, ArrowRight, Loader2, Check, CalendarDays, Mail, Phone, ShieldAlert, FileText } from 'lucide-react';

type Gender = 'male' | 'female';

// Helper function to calculate age from YYYYMMDD string
const calculateAge = (birthDateString: string): number | null => {
  if (!/^\d{8}$/.test(birthDateString)) return null;
  const year = Number.parseInt(birthDateString.substring(0, 4), 10);
  const month = Number.parseInt(birthDateString.substring(4, 6), 10) - 1; // JS months are 0-indexed
  const day = Number.parseInt(birthDateString.substring(6, 8), 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
    return null; // Invalid date components
  }

  const birthDate = new Date(year, month, day);
  // Check if the constructed date is valid (e.g. 20230230 would be invalid)
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
      return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 0 ? null : age; // Age cannot be negative
};

export default function StartTestPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(''); // YYYYMMDD
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const genderOptions = [
    { value: 'male' as Gender, label: '남자', icon: <User size={18} /> },
    { value: 'female' as Gender, label: '여자', icon: <User size={18} /> }
  ];

  const handleStartTest = async () => {
    setError(null);

    if (!name.trim() || !birthDate.trim() || !selectedGender || !email.trim() || !phone.trim()) {
      setError('모든 필수 정보를 입력해주세요.');
      return;
    }
    if (!/^\d{8}$/.test(birthDate)) {
      setError('생년월일을 8자리 숫자로 올바르게 입력해주세요 (예: 19900101).');
      return;
    }
    const age = calculateAge(birthDate);
    if (age === null || age < 5 || age > 100) { // Basic age validation
        setError('유효한 생년월일을 입력해주세요.');
        return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('유효한 이메일 주소를 입력해주세요.');
        return;
    }
    if (!/^\d{10,11}$/.test(phone.replace(/-/g, ''))) {
        setError('유효한 휴대폰 번호를 입력해주세요 (10-11자리 숫자).');
        return;
    }
    if (!agreedToPrivacy) {
      setError('개인정보 수집 및 이용 동의에 체크해주세요.');
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        userName: name,
        birthDate, // YYYYMMDD string for DB
        age: calculateAge(birthDate), // Calculated age for API (as per original design)
        gender: selectedGender,
        userEmail: email,
        phoneNumber: phone,
        agreedToPrivacy,
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
        router.push(`/questions?attemptId=${result.attempt_id}`);
      } else {
        throw new Error(result.error || '서버 응답이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('API 호출 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseStyle = "w-full px-4 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-150 ease-in-out placeholder-slate-400 text-slate-700 bg-slate-50 text-sm";
  const buttonBaseStyle = "group flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border-2 transition-all duration-200 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 text-sm font-medium";
  const buttonUnselectedStyle = "border-slate-300 bg-white text-slate-600 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700";
  const buttonSelectedStyle = "border-indigo-600 bg-indigo-500 text-white shadow-md scale-[1.02]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 py-10 px-4 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
          <Users size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          나의 성향 알아보기
        </h1>
        <p className="text-md text-slate-600">테스트 시작 전, 몇 가지 정보를 입력해주세요.</p>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
        <div className="space-y-5">
          {/* User Info Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-3">기본 정보</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-slate-600 mb-1">이름</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputBaseStyle} pl-10`} placeholder="홍길동" disabled={isLoading} />
                </div>
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-xs font-medium text-slate-600 mb-1">생년월일 (8자리)</label>
                <div className="relative">
                  <CalendarDays size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input type="text" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))} maxLength={8} className={`${inputBaseStyle} pl-10`} placeholder="YYYYMMDD (예: 19950115)" disabled={isLoading} />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1">이메일</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputBaseStyle} pl-10`} placeholder="example@email.com" disabled={isLoading} />
                </div>
              </div>
              <div>
                <label htmlFor="phone" className="block text-xs font-medium text-slate-600 mb-1">휴대폰 번호</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={11} className={`${inputBaseStyle} pl-10`} placeholder="01012345678 ('-' 없이)" disabled={isLoading} />
                </div>
              </div>
              <div>
                <label htmlFor="gender" className="block text-xs font-medium text-slate-600 mb-1">성별</label>
                <div id="gender" className="grid grid-cols-2 gap-3">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedGender(option.value)}
                      className={`${buttonBaseStyle} ${selectedGender === option.value ? buttonSelectedStyle : buttonUnselectedStyle}`}
                      disabled={isLoading}
                    >
                      {selectedGender === option.value && <Check size={16} className="mr-1" />}
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Privacy Consent Section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center">
              <FileText size={20} className="mr-2 text-indigo-600"/> 개인정보 수집 및 이용 동의
            </h2>
            <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto text-xs text-slate-600 bg-slate-50 space-y-2 prose prose-xs prose-slate">
              <p className="font-semibold">[개인정보 수집 및 이용 동의서]</p>
              <p><strong className="font-medium">수집 항목:</strong> 이름, 생년월일, 이메일 주소, 휴대폰 번호, 성별, IP주소, User-Agent</p>
              <p><strong className="font-medium">수집 및 이용 목적:</strong> (1) 적성검사 서비스 제공 (개인 맞춤형 검사 결과, 사용자 맞춤형 온라인 서비스) (2) 마케팅 및 서비스 지원 (서비스 안내, 이벤트/프로모션 정보, 맞춤형 광고/마케팅 자료 발송) (3) 연구 및 개발 (품질 향상, 서비스 개선 데이터 분석, 신규 서비스/기능 연구)</p>
              <p><strong className="font-medium">보유 및 이용 기간:</strong> 검사 결과 제공 및 서비스 지원/활용: 수집일로부터 5년. 연구 및 결과 활용: 10년. (법령 의무 보관 기간 준수)</p>
              <p><strong className="font-medium">제공 및 처리 위탁:</strong> 원칙적 제3자 미제공 (법령 요구, 서비스 운영 위한 외부업체 위탁 시 사전 안내)</p>
              <p><strong className="font-medium">법령 준수:</strong> 개인정보 보호법 및 관련 법령 준수.</p>
              <p><strong className="font-medium">동의 거부 권리 및 불이익:</strong> 동의 거부 가능. 단, 거부 시 검사 결과 제공 등 서비스 이용 제한될 수 있음.</p>
              <p><strong className="font-medium">파기:</strong> 보유기간 만료 또는 목적 달성 후 지체없이 파기 (전자적 파일: 영구삭제, 서면: 분쇄/소각).</p>
              <p><strong className="font-medium">문의 및 책임자:</strong> [박에스더] / [02.523.7523] / [admin@aptitude-x.com]</p>
              <p className="italic">본 동의서를 충분히 읽고 내용을 확인한 후 동의를 선택해주세요.</p>
            </div>
            <div className="mt-3 flex items-center">
              <input
                type="checkbox"
                id="privacyConsent"
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                disabled={isLoading}
              />
              <label htmlFor="privacyConsent" className="ml-2 block text-sm font-medium text-slate-700 cursor-pointer">
                위 개인정보 수집 및 이용에 모두 동의합니다.
              </label>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 bg-red-50 border border-red-300 rounded-lg p-3 text-center flex items-center justify-center text-sm">
            <ShieldAlert size={18} className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleStartTest}
            disabled={isLoading || !agreedToPrivacy || !name || !birthDate || !email || !phone || !selectedGender}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${
                isLoading || !agreedToPrivacy || !name || !birthDate || !email || !phone || !selectedGender
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed focus:ring-slate-200'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-300'
              }`}
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin mr-2" />
                <span>처리 중...</span>
              </>
            ) : (
              <>
                <span>검사 시작하기</span>
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </div>
      </div>
      <p className="mt-8 text-xs text-slate-500 text-center">
        © 2024 Octagnosis AI. 모든 권리 보유.
      </p>
    </div>
  );
} 