'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Script from 'next/script';
import Image from 'next/image';
import {
  Share2,
  Copy,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Award,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLocaleStore } from '@/stores/localeStore';

// --- 브랜드 아이콘 SVG 컴포넌트 ---
const IconFacebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconNaver = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.273 12.845 7.727 0H0v24h7.727V11.155L16.273 24H24V0h-7.727v12.845z" />
  </svg>
);

const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="m16 11.37-2.5-1.68a.5.5 0 0 0-.78.42v3.38a.5.5 0 0 0 .78.42L16 12.63a.5.5 0 0 0 0-.26z" />
    <circle cx="12" cy="12" r="3" />
    <circle cx="17.5" cy="6.5" r="1.5" />
  </svg>
);

const IconLine = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

// --- 타입 선언 ---
declare global {
  interface Window {
    Kakao: {
      init: (key: string) => void;
      isInitialized: () => boolean;
      Share: {
        sendDefault: (options: {
          objectType: string;
          content: {
            title: string;
            description: string;
            imageUrl: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          };
          buttons: Array<{
            title: string;
            link: {
              mobileWebUrl: string;
              webUrl: string;
            };
          }>;
        }) => void;
      };
    };
  }
}

interface ResultPersonalityType {
  id: string;
  type_code: string;
  type_name: string;
  title: string;
  theme_sentence: string;
  description: string;
  description_points: string[];
  strength_keywords: string[];
  weakness_keywords: string[];
  calculated_score: number;
}

interface TestResultData {
  attempt_id: string;
  test_completed_at: string;
  max_score: number;
  personality_types: ResultPersonalityType[];
  is_tie: boolean;
  total_questions_answered: number;
}

interface ApiResponse {
  success: boolean;
  data?: TestResultData;
  message: string;
}

// SWR fetcher 함수
const fetcher = async (url: string): Promise<ApiResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
};

// 이미지 경로 헬퍼 함수
const getPersonalityImagePath = (typeTitle: string): string | null => {
  if (!typeTitle) return null;
  const normalizedTitle = typeTitle.toLowerCase();
  const types = ['관찰형', '교육형', '생명형', '소통형', '봉사형', '분석형', '규범형', '복합형', '창조형', '추리형', '원리형', '제작형', '운동형', '진취형', '실용형'];
  const foundType = types.find(t => normalizedTitle.includes(t.toLowerCase().replace('형', '')));
  return foundType ? `/${foundType}.png` : null;
};

// --- 모바일 최적화: 성격 유형 상세 모달 ---
interface TypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex: number;
  types: any[];
  wordBreakClass: string;
}

function TypeDetailModal({ isOpen, onClose, initialIndex, types, wordBreakClass }: TypeDetailModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);

  useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex]);

  const handlePrevious = useCallback(() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : types.length - 1)), [types.length]);
  const handleNext = useCallback(() => setCurrentIndex((prev) => (prev < types.length - 1 ? prev + 1 : 0)), [types.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragDistance(e.touches[0].clientX - startX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    setIsDragging(false);
    setDragDistance(0);
    setStartX(0);
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  }, [onClose, handlePrevious, handleNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !types[currentIndex]) return null;
  const currentType = types[currentIndex];
  // original_title을 사용하여 색상 매핑 (임시) - 실제로는 DB에 색상 정보가 있거나 다른 방식 필요
  // 여기서는 기존 로직 유지를 위해 하드코딩된 색상 매퍼 사용 가능, 혹은 임의의 색상 로직
  // 일단 기존 데이터 구조와 맞춤
  const getColor = (title: string) => {
    // 간단한 해시 또는 매핑
    const colorMap: Record<string, string> = {
      '관찰형': 'rgb(51, 184, 232)', '교육형': 'rgb(76, 175, 80)', '규범형': 'rgb(63, 81, 181)',
      '복합형': 'rgb(156, 39, 176)', '봉사형': 'rgb(255, 152, 0)', '분석형': 'rgb(244, 67, 54)',
      '생명형': 'rgb(139, 195, 74)', '소통형': 'rgb(255, 193, 7)', '실용형': 'rgb(96, 125, 139)',
      '운동형': 'rgb(255, 87, 34)', '원리형': 'rgb(121, 85, 72)', '제작형': 'rgb(158, 158, 158)',
      '진취형': 'rgb(233, 30, 99)', '창조형': 'rgb(103, 58, 183)', '추리형': 'rgb(0, 150, 136)'
    };
    return colorMap[currentType.original_title] || 'rgb(100, 100, 100)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 bg-white/90 rounded-full shadow-lg">
          <X size={20} className="text-slate-600" />
        </button>
        <div className="p-5 text-white" style={{ backgroundColor: getColor(currentType.original_title) }}>
          <div className="text-xs font-medium opacity-90 mb-3">
            {String(currentIndex + 1).padStart(2, '0')} / {String(types.length).padStart(2, '0')}
          </div>
          <h2 className={`text-2xl font-bold mb-1.5 ${wordBreakClass}`}>{currentType.title}</h2>
          <p className={`text-base font-medium opacity-90 whitespace-pre-line ${wordBreakClass}`}>{currentType.theme_sentence}</p>
        </div>
        <div
          className="flex-1 p-5 overflow-y-auto"
          style={{ transform: isDragging ? `translateX(${dragDistance * 0.3}px)` : 'none' }}
        >
          <div className="flex flex-col items-center">
            <Image src={getPersonalityImagePath(currentType.original_title) || ''} alt={`${currentType.title} 이미지`} width={120} height={120} className="mb-5 object-contain" />
            <p className={`text-slate-700 text-sm leading-relaxed whitespace-pre-line text-center ${wordBreakClass}`}>{currentType.description}</p>
          </div>
        </div>
        <div className="flex justify-center items-center p-4 bg-slate-50 border-t">
          <div className="flex space-x-1.5">
            {types.map((_, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)} className={`w-2 h-2 rounded-full transition-all duration-200 ${index === currentIndex ? 'bg-blue-500 w-5' : 'bg-slate-300'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 모바일 최적화: 다른 유형 보기 섹션 ---
interface OtherTypesSectionProps {
  allTypes: any[];
  userTypes: string[];
  wordBreakClass: string;
}

function OtherTypesSection({ allTypes, userTypes, wordBreakClass }: OtherTypesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);
  const { t } = useTranslation();

  const otherTypes = allTypes.filter(type => !userTypes.includes(type.title));

  const handleTypeClick = (typeTitle: string) => {
    const index = allTypes.findIndex(type => type.title === typeTitle);
    setSelectedTypeIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="bg-white rounded-2xl shadow-xl p-5 mb-8 border border-slate-200">
        <h3 className={`text-lg font-semibold text-slate-700 mb-5 text-center flex items-center justify-center ${wordBreakClass}`}>
          <Image src="/oct_logo.jpg" alt="옥타그노시스 로고" width={24} height={24} className="mr-2 rounded-full" />
          {t('result.otherTypes')}
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {otherTypes.map((type) => (
            <button key={type.title} onClick={() => handleTypeClick(type.title)} className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-200 transition-transform active:scale-95">
              <Image src={getPersonalityImagePath(type.original_title) || ''} alt={`${type.title} 아이콘`} width={64} height={64} className="mb-2 object-contain" />
              <div className="text-center w-full">
                <p className="font-semibold text-sm text-slate-800 break-words line-clamp-1">{type.title}</p>
                <p className={`text-[10px] text-slate-500 mt-1 leading-tight line-clamp-2 ${wordBreakClass}`}>{type.theme_sentence}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      <TypeDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialIndex={selectedTypeIndex} types={allTypes} wordBreakClass={wordBreakClass} />
    </>
  );
}

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attempt_id;
  const { t, locale } = useTranslation();
  const initLocale = useLocaleStore((state) => state.initLocale);

  // 언어별 word-break 클래스
  const wordBreakClass = locale === 'ko' ? 'break-keep' : 'break-words';

  const [copySuccess, setCopySuccess] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [participantCount, setParticipantCount] = useState<number | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'error' | 'warning';
  }>({ isOpen: false, title: '', message: '', type: 'info' });

  const showDialog = (title: string, message: string, type: 'info' | 'error' | 'warning' = 'info') => setDialogState({ isOpen: true, title, message, type });
  const closeDialog = () => setDialogState(prev => ({ ...prev, isOpen: false }));

  const { data, error, isLoading, mutate } = useSWR(
    attemptId ? `/api/test/result/${attemptId}?lang=${locale}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

  // 언어 초기화
  useEffect(() => {
    initLocale();
  }, [initLocale]);

  useEffect(() => {
    fetch('/api/stats/participants')
      .then(res => res.json())
      .then(data => data.success && setParticipantCount(data.data.display_count))
      .catch(() => console.error('참여자 수 조회 실패'));
  }, []);

  useEffect(() => {
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;
    if (!kakaoKey) return;
    const script = document.createElement('script');
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        window.Kakao.init(kakaoKey);
        setKakaoReady(true);
      }
    };
    document.head.appendChild(script);
  }, []);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      showDialog('URL 복사 실패', 'URL 복사에 실패했어요. 브라우저 주소창에서 직접 복사해주세요.', 'error');
    }
  };

  const shareCommon = (url: string) => window.open(url, '_blank', 'noopener,noreferrer,width=600,height=600');

  const handleFacebookShare = () => shareCommon(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);

  const handleNaverBlogShare = () => {
    if (!data?.data) return;
    const title = `[나를 찾아줘!] ${data.data.personality_types[0].title} 유형 결과!`;
    shareCommon(`https://share.naver.com/web/shareView.nhn?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(title)}`);
  };

  const handleInstagramShare = async () => {
    await handleCopyUrl();
    showDialog('링크 복사 완료!', '결과 링크가 복사되었어요. 인스타그램 스토리나 게시물에 붙여넣어 공유해주세요!', 'info');
  };

  const handleLineShare = () => {
    if (!data?.data) return;
    const firstType = data.data.personality_types[0];
    const title = `[나를 찾아줘!] ${firstType.title} 유형 결과!`;
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(`${title}\n${firstType.theme_sentence}`);
    shareCommon(`https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`);
  };

  const handleKakaoShare = () => {
    if (!kakaoReady || !data?.data) {
      showDialog('카카오톡 공유 불가', '공유 기능을 사용할 수 없거나 데이터가 없습니다.', 'warning');
      return;
    }
    const firstType = data.data.personality_types[0];
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `[나를 찾아줘!] ${firstType.title} 유형 결과!`,
        description: `${firstType.theme_sentence}\n내 성향 유형을 확인해보세요!`,
        imageUrl: `${window.location.origin}/og-image.png`,
        link: { mobileWebUrl: window.location.href, webUrl: window.location.href },
      },
      buttons: [
        { title: '내 결과 자세히 보기', link: { mobileWebUrl: window.location.href, webUrl: window.location.href } },
        { title: '나도 테스트하기', link: { mobileWebUrl: `${window.location.origin}/start`, webUrl: `${window.location.origin}/start` } },
      ],
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center text-center p-4">
        <Loader2 size={40} className="text-blue-500 animate-spin mb-4" />
        <p className={`text-base font-semibold text-slate-700 ${wordBreakClass}`}>결과를 분석 중입니다...</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 text-center border border-red-200">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className={`text-lg font-semibold text-slate-800 mb-2 ${wordBreakClass}`}>결과를 불러올 수 없습니다</h2>
          <p className={`text-sm text-slate-600 mb-5 ${wordBreakClass}`}>{error?.message || data?.message || '알 수 없는 오류가 발생했습니다.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => mutate()} className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md active:bg-blue-700">
              <RefreshCw size={16} className="mr-2" />다시 시도
            </button>
            <button onClick={() => router.push('/')} className="flex-1 flex items-center justify-center px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg shadow-md active:bg-slate-600">
              처음으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resultData = data.data;
  if (!resultData || resultData.personality_types.length === 0) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 text-center border border-amber-300">
          <Users size={40} className="text-amber-500 mx-auto mb-4" />
          <h2 className={`text-lg font-semibold text-slate-800 mb-2 ${wordBreakClass}`}>결과 정보 없음</h2>
          <p className={`text-sm text-slate-600 mb-5 ${wordBreakClass}`}>유효하지 않은 접근이거나, 테스트를 완료해주세요.</p>
          <button onClick={() => router.push('/')} className="w-full px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md active:bg-blue-700">
            테스트 다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  // any 타입 캐스팅 제거 또는 구체적인 타입 정의 권장
  const { personality_types: personalityTypes, is_tie: isTie, all_types: allTypes } = resultData as any;
  const primaryType = personalityTypes[0];
  const pageTitle = `나의 성향 유형: ${primaryType.title}`;
  const pageDescription = `옥타그노시스 성향 검사 결과, 당신은 "${primaryType.theme_sentence}" 특징을 가진 ${primaryType.title} 유형입니다.`;
  const userTypeNames = personalityTypes.map((type: any) => type.title);

  return (
    <>
      <Script id="dynamic-metadata" strategy="afterInteractive">
        {`
          document.title = "${pageTitle.replace(/"/g, '\\"')}";
          document.querySelector('meta[name="description"]')?.setAttribute('content', "${pageDescription.replace(/"/g, '\\"')}");
          document.querySelector('meta[property="og:title"]')?.setAttribute('content', "${pageTitle.replace(/"/g, '\\"')}");
          document.querySelector('meta[property="og:description"]')?.setAttribute('content', "${pageDescription.replace(/"/g, '\\"')}");
        `}
      </Script>

      <Header />
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <header className="text-center mb-8">
            <div className="inline-block p-2.5 bg-white rounded-xl shadow-lg mb-3 border border-slate-200">
              <Sparkles size={28} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600 mb-2">
              {t('result.title')}
            </h1>
            <p className={`text-base text-slate-600 ${wordBreakClass} text-balance`}>
              {isTie && personalityTypes.length > 1
                ? t('result.congratsMultiple', { count: String(personalityTypes.length) })
                : t('result.congratsSingle')}
            </p>
            {isTie && personalityTypes.length > 1 && (
              <p className={`text-xs text-slate-500 mt-1.5 ${wordBreakClass} text-balance`}>{t('result.tieNote')}</p>
            )}
          </header>

          <section className="space-y-8 mb-10">
            {personalityTypes.map((type: any, index: number) => {
              const imagePath = getPersonalityImagePath(type.original_title || type.title);
              return (
                <article key={type.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                  <div className={`p-5 text-white ${index % 2 === 0 ? 'bg-gradient-to-br from-blue-500 to-cyan-500' : 'bg-gradient-to-br from-sky-500 to-teal-500'}`}>
                    {imagePath && (
                      <div className="text-center mb-4">
                        <Image src={imagePath} alt={`${type.title} 대표 이미지`} width={150} height={150} className="object-cover inline-block rounded-lg shadow-lg" priority={index === 0} />
                      </div>
                    )}
                    <div className="text-left">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium opacity-90">
                          {personalityTypes.length > 1 ? t('result.myAspect', { number: String(index + 1) }) : t('result.myType')}
                        </span>
                        <span className="bg-white/25 px-2.5 py-1 rounded-full text-xs font-semibold shadow">
                          {t('result.score', { score: String(type.calculated_score), max: String(resultData.max_score) })}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mb-1.5 drop-shadow-sm">{type.title}</h2>
                      <p className={`text-base font-semibold text-white/95 ${wordBreakClass} text-balance`}>&quot;{type.theme_sentence}&quot;</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-700 mb-3 flex items-center"><Award size={18} className="text-yellow-500 mr-2" />{t('result.strengths')}</h3>
                      <ul className="space-y-2 pl-1">
                        {type.description_points.map((point: string, i: number) => (
                          <li key={`${type.id}-desc-${i}`} className="flex items-start">
                            <CheckCircle size={14} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className={`text-sm text-slate-600 leading-relaxed ${wordBreakClass}`}>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-700 mb-2.5">{t('result.strengthKeywords')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {type.strength_keywords.map((kw: string) => <span key={kw} className={`px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 ${wordBreakClass}`}>{kw}</span>)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-700 mb-2.5">{t('result.weaknessKeywords')}</h3>
                      <div className="flex flex-wrap gap-2">
                        {type.weakness_keywords.map((kw: string) => <span key={kw} className={`px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${wordBreakClass}`}>{kw}</span>)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-5 mb-8 border border-slate-200">
            <h3 className={`text-lg font-semibold text-slate-700 mb-4 text-center ${wordBreakClass}`}>{t('result.shareTitle')}</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: t('result.shareKakao'), Icon: Share2, handler: handleKakaoShare, disabled: !kakaoReady, style: `bg-yellow-400 text-slate-800 ${!kakaoReady ? 'bg-slate-300 text-slate-500' : 'active:bg-yellow-500'}` },
                { name: t('result.shareFacebook'), Icon: IconFacebook, handler: handleFacebookShare, style: 'bg-[#1877F2] text-white active:bg-[#166fe5]' },
                { name: t('result.shareNaver'), Icon: IconNaver, handler: handleNaverBlogShare, style: 'bg-[#03C75A] text-white active:bg-[#02b350]' },
                ...(locale === 'ja' ? [{ name: t('result.shareLine'), Icon: IconLine, handler: handleLineShare, style: 'bg-[#00B900] text-white active:bg-[#00a000]' }] : []),
                { name: t('result.shareInstagram'), Icon: IconInstagram, handler: handleInstagramShare, style: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white' },
                { name: copySuccess ? t('result.linkCopied') : t('result.copyLink'), Icon: copySuccess ? CheckCircle : Copy, handler: handleCopyUrl, style: `bg-slate-600 text-white active:bg-slate-700 ${copySuccess ? 'text-green-400' : ''}` },
              ].map(({ name, Icon, handler, style, disabled }) => (
                <button key={name} type="button" onClick={handler} disabled={disabled} className={`w-full flex flex-col items-center justify-center p-2.5 rounded-xl font-semibold transition-transform shadow-md active:scale-95 ${style}`}>
                  <Icon size={22} className="mb-1" />
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </section>

          <OtherTypesSection allTypes={allTypes || []} userTypes={userTypeNames} wordBreakClass={wordBreakClass} />

          <section className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl shadow-xl p-6 mb-8 text-white text-center">
            <Users size={32} className="mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-1.5 break-keep text-balance">{t('result.officialTestTitle')}</h3>
            <p className="text-sm opacity-90 mb-5 break-keep text-balance">{t('result.officialTestDesc')}</p>
            <a href="https://aptitude-x.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold transition-transform shadow-md active:scale-95">
              <ExternalLink size={18} className="mr-2" />
              {t('result.officialTestButton')}
            </a>
          </section>

          <div className="text-center mt-10">
            <button onClick={() => router.push('/')} className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold text-base transition-transform shadow-xl active:scale-95 inline-flex flex-col items-center">
              <div className="break-keep">{t('result.newTest')}</div>
              {participantCount && (
                <div className="flex items-center text-xs font-normal mt-1 opacity-90 break-keep">
                  <Users size={14} className="mr-1" />{t('result.participants', { count: participantCount.toLocaleString() })}
                </div>
              )}
            </button>
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500 break-keep">{t('result.freeVersion')}</p>
            <p className="text-xs text-slate-500 mt-1 break-keep">{t('result.copyright')}</p>
          </footer>
        </div>
      </div>

      <Dialog isOpen={dialogState.isOpen} onClose={closeDialog} title={dialogState.title} message={dialogState.message} type={dialogState.type} />
    </>
  );
}

// --- 모바일 최적화: 다이얼로그 컴포넌트 ---
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'info' | 'error' | 'warning';
}

function Dialog({ isOpen, onClose, title, message, type = 'info' }: DialogProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  const icons: Record<string, React.ReactElement> = {
    error: <AlertTriangle size={24} className="text-red-500" />,
    warning: <AlertTriangle size={24} className="text-amber-500" />,
    info: <CheckCircle size={24} className="text-blue-500" />,
  };
  const colors: Record<string, string> = {
    error: 'text-red-700',
    warning: 'text-amber-700',
    info: 'text-blue-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-5">
        <div className="flex items-center mb-3">
          {icons[type]}
          <h3 className={`ml-3 text-base font-semibold ${colors[type]} break-keep`}>{title}</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-5 break-keep">{message}</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors active:bg-blue-700">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}