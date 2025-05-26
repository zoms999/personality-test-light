'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Script from 'next/script';
import Image from 'next/image'; // Next.js Image 컴포넌트 import
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
  Users
} from 'lucide-react';

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
    const errorData = await response.json().catch(() => ({ message: '결과를 불러오는데 실패했습니다.' }));
    throw new Error(errorData.message || '결과를 불러오는데 실패했습니다.');
  }
  return response.json();
};

// 성격 유형 제목에 따라 이미지 경로를 반환하는 헬퍼 함수
const getPersonalityImagePath = (typeTitle: string): string | null => {
  const normalizedTitle = typeTitle.toLowerCase();
  
  // 모든 성격 유형별 이미지 매핑
  if (normalizedTitle.includes('관찰형')) {
    return '/관찰형.png';
  }
  if (normalizedTitle.includes('교육형')) {
    return '/교육형.png';
  }
  if (normalizedTitle.includes('생명형')) {
    return '/생명형.png';
  }
  if (normalizedTitle.includes('소통형')) {
    return '/소통형.png';
  }
  if (normalizedTitle.includes('봉사형')) {
    return '/봉사형.png';
  }
  if (normalizedTitle.includes('분석형')) {
    return '/분석형.png';
  }
  if (normalizedTitle.includes('규범형')) {
    return '/규범형.png';
  }
  if (normalizedTitle.includes('복합형')) {
    return '/복합형.png';
  }
  if (normalizedTitle.includes('창조형')) {
    return '/창조형.png';
  }
  if (normalizedTitle.includes('추리형')) {
    return '/추리형.png';
  }
  if (normalizedTitle.includes('원리형')) {
    return '/원리형.png';
  }
  if (normalizedTitle.includes('제작형')) {
    return '/제작형.png';
  }
  if (normalizedTitle.includes('운동형')) {
    return '/운동형.png';
  }
  if (normalizedTitle.includes('진취형')) {
    return '/진취형.png';
  }
  if (normalizedTitle.includes('실용형')) {
    return '/실용형.png';
  }
  
  // 기본 이미지가 필요한 경우 (없으면 null 반환)
  return null;
};

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attempt_id as string;
  
  const [copySuccess, setCopySuccess] = useState(false);
  const [kakaoReady, setKakaoReady] = useState(false);
  const [participantCount, setParticipantCount] = useState<number | null>(null);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    attemptId ? `/api/test/result/${attemptId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // 3번까지만 재시도
        if (retryCount >= 2) return;
        // 2초 후 재시도
        setTimeout(() => revalidate({ retryCount }), 2000);
      }
    }
  );

  // 참여자 수 가져오기
  useEffect(() => {
    const fetchParticipantCount = async () => {
      try {
        const response = await fetch('/api/stats/participants');
        const data = await response.json();
        if (data.success) {
          setParticipantCount(data.data.display_count);
        }
      } catch (error) {
        console.error('참여자 수 조회 실패:', error);
      }
    };

    fetchParticipantCount();
  }, []);

  // 카카오 SDK 초기화 로직 개선
  useEffect(() => {
    const KAKAO_SDK_URL = "https://developers.kakao.com/sdk/js/kakao.js";
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY;

    if (!kakaoKey) {
      console.warn("Kakao JavaScript Key is not set.");
      setKakaoReady(false); // Kakao 키가 없으면 ready 상태를 false로 명시
      return;
    }
    
    const initKakao = () => {
      // Kakao 객체 및 init 함수 존재 여부 확인
      if (window.Kakao && typeof window.Kakao.init === 'function') {
        // isInitialized 함수 존재 여부 및 초기화 상태 확인
        if (typeof window.Kakao.isInitialized === 'function' && !window.Kakao.isInitialized()) {
          window.Kakao.init(kakaoKey);
          setKakaoReady(true);
        } else if (typeof window.Kakao.isInitialized === 'function' && window.Kakao.isInitialized()) {
          setKakaoReady(true);
        }
      } else {
        // Kakao 객체가 아직 로드되지 않았을 수 있음 (스크립트 로드 중)
        // console.warn("Kakao SDK not fully loaded for initKakao call yet.");
      }
    };

    // SDK 스크립트가 이미 페이지에 있는지 확인
    let script = document.querySelector(`script[src="${KAKAO_SDK_URL}"]`) as HTMLScriptElement;
    if (script) { // 스크립트가 이미 존재하면
      if (window.Kakao) { // Kakao 객체가 이미 로드되었다면
        initKakao();
      } else { // Kakao 객체가 아직 로드되지 않았다면, load 이벤트 리스너 추가
        script.addEventListener('load', initKakao, { once: true });
      }
    } else { // 스크립트가 없으면 새로 생성
      script = document.createElement('script');
      script.src = KAKAO_SDK_URL;
      script.async = true;
      script.onload = initKakao; // 스크립트 로드 완료 후 initKakao 호출
      script.onerror = () => {
        console.error("Failed to load Kakao SDK.");
        setKakaoReady(false);
      };
      document.head.appendChild(script);
    }
  }, []);

  const handleCopyUrl = async () => {
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('URL 복사 실패:', err);
      alert('URL 복사에 실패했습니다. 브라우저의 클립보드 접근 권한을 확인해주세요.');
    }
  };

  const handleKakaoShare = () => {
    if (!kakaoReady || !window.Kakao?.Share?.sendDefault) { // Kakao 및 Share.sendDefault 존재 여부 강화
      alert('카카오톡 공유 기능을 사용할 수 없습니다. 페이지를 새로고침하거나 잠시 후 다시 시도해주세요.');
      return;
    }

    if (!data?.success || !data.data || data.data.personality_types.length === 0) {
      alert('공유할 결과 데이터가 없습니다.');
      return;
    }

    const firstType = data.data.personality_types[0];
    const currentUrl = window.location.href;
    const imageUrl = `${window.location.origin}/og-image.png`; 

    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: `[나를 찾아줘!] ${firstType.title} 유형 결과!`,
        description: `"${firstType.theme_sentence}"\n내 성격 유형을 확인해보세요!`,
        imageUrl: imageUrl, 
        link: { mobileWebUrl: currentUrl, webUrl: currentUrl },
      },
      buttons: [
        { title: '내 결과 자세히 보기', link: { mobileWebUrl: currentUrl, webUrl: currentUrl } },
        { title: '나도 테스트하기', link: { mobileWebUrl: `${window.location.origin}/start`, webUrl: `${window.location.origin}/start` } },
      ],
    });
  };
  
  // --- 로딩 상태 ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
        <p className="text-lg font-semibold text-slate-700 mb-1">결과를 분석 중입니다...</p>
        <p className="text-slate-500">잠시만 기다려주세요!</p>
      </div>
    );
  }

  // --- 에러 상태 ---
  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center border border-red-200">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-5" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">결과를 불러올 수 없습니다</h2>
          <p className="text-slate-600 mb-6">
            {error?.message || data?.message || '알 수 없는 오류로 인해 결과를 표시할 수 없습니다.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => mutate()}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <RefreshCw size={18} className="mr-2" />
              다시 시도
            </button>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="w-full sm:w-auto flex items-center justify-center px-5 py-2.5 bg-slate-500 hover:bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              처음으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  const resultData = data.data;
  if (!resultData || resultData.personality_types.length === 0) {
    // 데이터는 성공적으로 왔으나 내용이 없는 경우
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center border border-amber-300">
          <Users size={48} className="text-amber-500 mx-auto mb-5" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">결과 정보 없음</h2>
          <p className="text-slate-600 mb-6">
            테스트 결과가 아직 준비되지 않았거나, 유효하지 않은 접근입니다.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex items-center justify-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            테스트 다시 시작하기
          </button>
        </div>
      </div>
    );
  }
  
  const personalityTypes = resultData.personality_types;
  // 대표 유형 (첫 번째 또는 is_tie가 false일 때 유일한 유형)
  const primaryType = personalityTypes[0]; 
  const pageTitle = `나의 성격 유형: ${primaryType.title}`;
  const pageDescription = `옥타그노시스 성격 검사 결과, 당신은 "${primaryType.theme_sentence}" 특징을 가진 ${primaryType.title} 유형입니다.`;

  const keywordBaseStyle = "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium shadow-sm";
  const strengthKeywordStyle = `${keywordBaseStyle} bg-emerald-50 text-emerald-700 border border-emerald-200`;
  const weaknessKeywordStyle = `${keywordBaseStyle} bg-amber-50 text-amber-700 border border-amber-200`;

  return (
    <>
      {/* Head에 동적으로 타이틀, 설명 추가 (SEO 및 공유 개선) */}
      <Script id="dynamic-metadata" strategy="afterInteractive">
        {`
          document.title = "${pageTitle.replace(/"/g, '\\"')}";
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) metaDesc.setAttribute('content', "${pageDescription.replace(/"/g, '\\"')}");
          
          const metaOgTitle = document.querySelector('meta[property="og:title"]');
          if (metaOgTitle) metaOgTitle.setAttribute('content', "${pageTitle.replace(/"/g, '\\"')}");

          const metaOgDesc = document.querySelector('meta[property="og:description"]');
          if (metaOgDesc) metaOgDesc.setAttribute('content', "${pageDescription.replace(/"/g, '\\"')}");
          
          // 필요하다면 OG Image도 동적으로 설정
          // const metaOgImage = document.querySelector('meta[property="og:image"]');
          // if (metaOgImage) metaOgImage.setAttribute('content', '새로운_이미지_URL');
        `}
      </Script>

      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* --- 메인 타이틀 --- */}
          <header className="text-center mb-10">
            <div className="inline-block p-3 bg-white rounded-xl shadow-lg mb-4 border border-slate-200">
              <Sparkles size={32} className="text-blue-500" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600 mb-3 leading-tight">
              나를 찾았어!
            </h1>
            <p className="text-lg text-slate-600">
              {resultData.is_tie && personalityTypes.length > 1
                ? `축하해요! ${personalityTypes.length}가지 다채로운 성격 유형을 발견했어요!`
                : '축하해요! 당신의 핵심 성격 유형을 발견했어요!'
              }
            </p>
            {resultData.is_tie && personalityTypes.length > 1 && (
                 <p className="text-sm text-slate-500 mt-2">아래 유형들이 비슷한 점수로 나타났어요. 모두 당신의 모습일 수 있답니다!</p>
            )}
          </header>

          {/* --- 결과 카드들 --- */}
          <section className="space-y-10 mb-12">
            {personalityTypes.map((type, index) => {
              const imagePath = getPersonalityImagePath(type.title); // 유형에 맞는 이미지 경로 가져오기
              return (
                <article key={type.id} className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 transform hover:scale-[1.01] transition-transform duration-300">
                  {/* 카드 헤더 */}
                  <div className={`bg-gradient-to-br ${index % 2 === 0 ? 'from-blue-500 to-cyan-500' : 'from-sky-500 to-teal-500'} p-6 text-white text-center`}>
                    {/* 유형별 이미지 표시 */}
                    {imagePath && (
                      <div className="mb-4 rounded-lg overflow-hidden inline-block shadow-lg">
                        <Image
                          src={imagePath}
                          alt={`${type.title} 대표 이미지`}
                          width={200} // 적절한 크기로 조절
                          height={200} // 적절한 크기로 조절
                          className="object-cover" // 이미지가 영역을 채우도록
                          priority={index === 0} // 첫 번째 이미지는 우선 로드
                        />
                      </div>
                    )}
                    <div className="text-left"> {/* 텍스트 내용을 왼쪽 정렬하기 위한 div 추가 */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm font-medium opacity-90 tracking-wide">
                          {personalityTypes.length > 1 ? `내 안의 모습 #${index + 1}` : '나의 대표 유형'}
                        </span>
                        <span className="bg-white bg-opacity-25 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold shadow">
                          {type.calculated_score}점 / {resultData.max_score}점
                        </span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold mb-2 drop-shadow-sm">
                        {type.title}
                      </h2>
                      <p className="text-lg sm:text-xl font-semibold text-white/90">
                        &quot;{type.theme_sentence}&quot;
                      </p>
                    </div>
                  </div>

                  {/* 카드 내용 */}
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                        <Award size={20} className="text-yellow-500 mr-2.5 flex-shrink-0" />
                        이런 점이 돋보여요!
                      </h3>
                      <ul className="space-y-2.5 pl-1">
                        {type.description_points.map((point, i) => (
                          <li key={`${type.id}-desc-${i}`} className="flex items-start">
                            <CheckCircle size={16} className="text-green-500 mt-1 mr-2.5 flex-shrink-0" />
                            <span className="text-slate-600 leading-relaxed break-keep">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3">
                        ✨ 나의 강점 키워드
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {type.strength_keywords.map((keyword) => (
                          <span key={keyword} className={strengthKeywordStyle}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-slate-700 mb-3">
                        🌱 함께 성장할 점
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {type.weakness_keywords.map((keyword) => (
                          <span key={keyword} className={weaknessKeywordStyle}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          {/* --- 공유 기능 --- */}
          <section className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-10 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-700 mb-5 text-center">
              결과를 친구들과 공유해보세요!
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={handleKakaoShare}
                disabled={!kakaoReady}
                className={`w-full flex items-center justify-center px-5 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-opacity-50 shadow-lg hover:shadow-xl
                  ${ kakaoReady
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-slate-800 focus:ring-yellow-300'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Share2 size={20} className="mr-2.5" />
                카카오톡 공유
              </button>
              
              <button
                type="button"
                onClick={handleCopyUrl}
                className="w-full flex items-center justify-center px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 shadow-lg hover:shadow-xl"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle size={20} className="mr-2.5" />
                    링크 복사 완료!
                  </>
                ) : (
                  <>
                    <Copy size={20} className="mr-2.5" />
                    결과 링크 복사
                  </>
                )}
              </button>
            </div>
          </section>

          {/* --- 추가 정보 링크 (CTA) --- */}
          <section className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl shadow-xl p-6 sm:p-8 mb-10 text-white text-center">
            <Users size={36} className="mx-auto mb-4 opacity-80" />
            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              나에게 꼭 맞는 진로가 궁금하다면?
            </h3>
            <p className="opacity-90 mb-6">
              전문적인 옥타그노시스 정식 검사를 통해<br/>더 깊이있는 분석과 맞춤형 진로 정보를 확인해보세요.
            </p>
            <a
              href="https://aptitude-x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-3 bg-white hover:bg-sky-50 text-blue-600 rounded-xl font-bold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-200"
            >
              <ExternalLink size={20} className="mr-2.5" />
              맞춤형 옥타그노시스 검사 알아보기 
            </a>
          </section>
          
          {/* --- 새로운 검사 시작 버튼 --- */}
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 shadow-xl hover:shadow-2xl inline-flex flex-col items-center"
            >
              <div>새로운 테스트 시작하기</div>
              {participantCount !== null && (
                <div className="flex items-center text-sm font-normal mt-1 opacity-90">
                  <Users size={16} className="mr-1" />
                  현재 총 {participantCount.toLocaleString()}명이 참여했어요!
                </div>
              )}
            </button>
          </div>

          {/* --- 푸터 로고/회사 정보 (간단하게) --- */}
          <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">
              본 테스트는 옥타그노시스 검사의 무료버전입니다.
            </p>
            <p className="text-sm text-slate-500 mt-1">
              © {new Date().getFullYear()} Copyright 2004. 한국진로적성센터. All rights reserved.
            </p>
          </footer>
        </div>
      </div>
    </>
  );
} 