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
  Eye,
  X 
} from 'lucide-react';

// --- 브랜드 아이콘 SVG 컴포넌트 ---
const IconFacebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const IconNaver = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M16.273 12.845 7.727 0H0v24h7.727V11.155L16.273 24H24V0h-7.727v12.845z"/>
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
  const normalizedTitle = typeTitle.toLowerCase();
  const types = ['관찰형', '교육형', '생명형', '소통형', '봉사형', '분석형', '규범형', '복합형', '창조형', '추리형', '원리형', '제작형', '운동형', '진취형', '실용형'];
  const foundType = types.find(t => normalizedTitle.includes(t.toLowerCase().replace('형', '')));
  return foundType ? `/${foundType}.png` : null;
};

// --- 전체 성격 유형 데이터 ---
const allTypesData = [
  { title: '관찰형', subtitle: '눈으로 직접 확인하고\n경험한 결과만 신뢰', imageSrc: '/관찰형.png', description: `당신은 눈에 보이는 자연, 환경, 우주에 관심이 많으며,자신의 관심분야에 집중합니다. 
관찰형 특유의 말과 행동이 느린 당신, 주변에서 느리다는 말을 많이 듣지만 묵묵하게 목표를 향해 갑니다. 당신은 스피드를 원하는 일보다는 시간이 걸리더라도 완성도 높은 일이 잘 맞습니다. 
속내를 잘 드러내지 않는 당신은 관심사가 같거나 공유할 수있는 사람과만 친하게 지내는 편이라 사회성이 부족하다는 말을 듣기도 합니다. 
단기적인 성과보다는 오랜 실험이나 관찰을 필요로 하는 장기적인 성과를 내는 자연, 기상, 우주, 지구, 환경 관련 연구업무에 유리합니다.`, color: 'rgb(51, 184, 232)' },
  { title: '교육형', subtitle: '가르치면서 행복을 느끼는\n진정한 멘토', imageSrc: '/교육형.png', description: `당신은 기본적으로 사람에 대한 애정과 관심이 많아서, 다른 사람이 모르는 것이 있으면 가르쳐 주고 싶은 마음이 강합니다.
지식이나 정보를 알기 쉽게 잘 전달하는 재능이 있습니다.
당신은 지적인 권위와 자존심이 강해서 다른 사람들로부터 인정과 칭찬 받는 것을 원합니다.
당신은 가르치면서 자신도 배우는 성향이므로, 누군가를 가르치고 설명하면서 스스로도 정리가 되는 시너지를 얻습니다.
교육과 관련된 일이라면 어디서든 능력을 발휘할 수 있습니다.`, color: 'rgb(76, 175, 80)' },
  { title: '규범형', subtitle: '법 없어도 살 사람?\n법이 있어야 사는 사람', imageSrc: '/규범형.png', description: `당신은 매사에 옳고 그름을 잘 따지며, 준법정신이 투철합니다.
원칙주의자인 당신은 책임감과 성실함 그리고 끈기가 재능입니다.
규칙을 잘 지키며, 공동체의 가치를 중요하게 생각합니다.
당신은 충동적이지 않으며, 늘 기본에 충실하고 신중하게 행동합니다.
고정관념이 강하고, 고지식한 면이 있어 새로운 도전이나 변화무쌍한 일보다는 안정적이고 반복적인 일을 편안해 합니다.
공무원, 법조인, 사무직과 관련된 일에서 능력을 발휘할 수있습니다.`, color: 'rgb(63, 81, 181)' },
  { title: '복합형', subtitle: '전천후 멀티플레이어', imageSrc: '/복합형.png', description: `당신은 기존의 어떤 적성검사에서도 찾아내지 못한 성향으로, 여러분야에 두루두루 재능을 지닌 멀티플레이어적인 면모를 갖고있습니다.
어릴 때는 신동, 영재라는 소리를 곧잘 들었을 당신은 다양한 관심사와 적응력으로 변화에 잘 대처합니다.
임기응변과 응용력이 뛰어나며 동시다발적인 문제들도 잘해결합니다.
당신은 반복적이고 규칙적인 일보다는 변화무쌍한 일을 좋아하다보니 이 일 저 일 손대는 일이 많습니다.
빨리, 쉽게 배우고 요령도 좋다보니 익숙한 일에는 금방 싫증을 내고, 하고 싶은 일도 자주 바뀌는 편입니다.
IT, AI, 방송, 영상과 관련된 일에서 능력을 발휘할 수 있습니다.`, color: 'rgb(156, 39, 176)' },
  { title: '봉사형', subtitle: '투명 날개 달고 있나요?\n천사 같은 사람', imageSrc: '/봉사형.png', description: `자신의 이익을 먼저 챙기며 계산적인 대가를 요구하지 않는 이타주의자인 당신은 봉사심과 서비스 마인드를 타고났습니다.
다른 사람을 잘 섬기고 불쌍한 사람들을 돕는 것에 보람과 만족감을 느낍니다.
다른 사람을 잘 배려하기 때문에 자신보다는 다른 사람의 감정과 기분을 더 중요하게 생각합니다.
당신은 자신의 감정을 겉으로 드러내지 않고 혼자 삭이는 편이라 내적인 스트레스가 많을 수 있습니다.
당신은 이기적인 사회를 정화시키고 건강하게 만들어주는 단비 같은 존재입니다.
사람들을 배려하고 지원하는 호텔리어, 승무원과 같은 서비스,특수교육, 사회복지와 관련된 일에서 재능이 돋보입니다.`, color: 'rgb(255, 152, 0)' },
  { title: '분석형', subtitle: '빈틈없는 완벽주의자', imageSrc: '/분석형.png', description: `분석형인 당신은 100% 만족, 100% 완벽을 추구합니다.
당신은 미세한 차이까지 찾아내는 뛰어난 분석력을 갖고 있습니다.
작은 실수도 용납하지 않고, 빈틈을 메우는 꼼꼼하고 치밀한 사람입니다.
엘리트 기질이 있으며, 완벽주의적인 경향이 있다 보니 스스로를 다그치는 면이 많습니다.
융통성이 부족하여 웬만해서는 다른 사람의 말을 듣거나 생각을 바꾸지 않습니다.
예민하고 날카로우며 논리적인 판단력이 우수합니다.
기자, 칼럼니스트, 출판편집장, 평론가, 학예사, 소비트렌드 분석가로 활동하면 능력을 발휘할 수 있습니다.`, color: 'rgb(244, 67, 54)' },
  { title: '생명형', subtitle: '생명을 향한 무한 애정', imageSrc: '/생명형.png', description: `생명형인 당신은 냉철하지만 따뜻한 박애주의자입니다.
당신은 동물이나 사람에 관심과 애정이 많아서 아픈 사람이나 동물을 보면 그냥 지나치지 못하는 따뜻한 감성을 가지고 있습니다.
위기 상황이나 생사가 달린 위험한 상황일수록 오히려 냉철한 판단력을 발휘합니다.
감성과 이성을 동시에 가지고 있기에 복잡하게 얽혀 있는 상황을 잘 통제합니다.
사람들 앞에 나서는 것을 좋아하지 않고, 고민이나 문제를 남에게 잘 털어놓지 못하기 때문에 마음 맞는 몇 명과만 깊이 사귀는 편입니다.
의사, 수의사, 약사, 간호사로 활동하거나 식품영양, 신약개발,백신개발, 반려동물과 관련된 분야에서 재능을 발휘할 수 있습니다.`, color: 'rgb(139, 195, 74)' },
  { title: '소통형', subtitle: '5분만에 친구만들기', imageSrc: '/소통형.png', description: `남녀노소 구분 없이 다양한 계층과 교류하는 탁월한 소통 능력을 지니고 있습니다.
당신은 열린 사고와 포용력으로 사회에 윤활유와 같은 존재입니다.
사람들 간의 갈등을 최소화 할 수 있는 진정성과 중재력을 지닌 당신은 누구나 내편으로 만드는 매력이 있습니다. 즐거운 분위기를 좋아하는 소통형은 심각하고 진지하고 어려운 것을 싫어하여 대충 넘어가는 편입니다.
소통형은 MC, 쇼호스트, CS매니저, 연예인매니저, 세일즈 등등 말로 하는 일이라면 다 잘 할 수 있습니다.`, color: 'rgb(255, 193, 7)' },
  { title: '실용형', subtitle: '돈이 되느냐? 돈이 안 되느냐?\n그것이 문제로다', imageSrc: '/실용형.png', description: `당신은 &apos;나에게 필요한가, 필요하지 않은가, 유익한가, 유익하지 않은가&apos;로 인생을 판단합니다.
Give & Take가 분명하며, 계산이 빠릅니다.
돈에 매우 민감하며, 돈을 좋아합니다.
매우 현실적이라서 모호하고 비현실적인 목표에는 욕구나 동기가 생기지 않습니다.
금융직, 세무직, 회계직, 통계직, 경영컨설팅과 같이 돈, 숫자,그래프를 다루는 일에서 능력을 발휘합니다.`, color: 'rgb(96, 125, 139)' },
  { title: '운동형', subtitle: '대담한 활동력, 넘치는 에너지', imageSrc: '/운동형.png', description: `운동형인 당신은 움직이는 것을 좋아하고 낙천적입니다.
몸으로 하는 일은 다 잘하지만, 가만히 앉아서 하는 일은 잘 하지못하고, 싫어합니다.
솔직하고 순수하며, 불의를 보면 참지 못하는 의리파입니다.
어려운 일을 만나면 대충 넘어가려는 경향이 있습니다.
공부하는 것을 좋아하지 않지만, 몸으로 익힌 것은 잘 기억합니다.
운동선수, 스포츠에이전트, 소방관, 구조대원, 스포츠 감독, 스포츠코치, 헬스트레이너, 치어리더로 재능을 발휘할 수 있습니다.`, color: 'rgb(255, 87, 34)' },
  { title: '원리형', subtitle: '타고난 학자 스타일', imageSrc: '/원리형.png', description: `당신은 지적인 탐구심이 왕성하며 인지능력이 우수합니다.
궁금한 것, 모르는 것은 꼭 알아야 하며, 현상의 근본원리를 깊이 파고드는 것을 좋아합니다.
혼자 생각하고, 혼자 행동하는 것을 좋아하기 때문에 사회성이 약한편입니다.
지식이나 정보를 파악하고 이해하는 지적이 능력이 탁월합니다.
좋아하는 것과 싫어하는 것이 분명하며, 좋아하는 것에는 고도의 집중력을 발휘합니다.
학문연구에 가장 적합한 원리형은 자신의 관심분야나 전공분야에서 학자나 연구원으로 활동하면 재능을 발휘할 수 있습니다.`, color: 'rgb(121, 85, 72)' },
  { title: '제작형', subtitle: '뭐든 척척 만들어내는\n손재주의 달인', imageSrc: '/제작형.png', description: `당신은 손재주가 좋고, 공간감각이 좋아서 물건이나 기계를 분해하거나 조립하는 일을 잘합니다.
사실중심으로 받아들이는 면이 강해서 상상력은 약한 편입니다.
평소 검소하며 소탈하여 과소비나 사치를 하지 않습니다.
감정에 취약하여 대인관계가 복잡해지는 것을 싫어합니다.
당신은 다른 사람의 속마음이나 말의 감춰진 의미를 파악하는데 다소 서툴러 눈치 없다, 매정하다는 말을 들을 때도 있습니다.
전자공학, 자동차공학, 로봇공학, 에너지공학, 항공공학, 안경광학등 공학계열에서 두각을 드러낼 수 있습니다.`, color: 'rgb(158, 158, 158)' },
  { title: '진취형', subtitle: '타고난 리더', imageSrc: '/진취형.png', description: `당신은 통이 큰 대장 스타일로서 스케일이 큰 사람입니다.
도전하고 또 도전하여 승부를 내고야 맙니다.
목표가 정해지면 사람들을 통솔해서 일사분란하게 전진하는 리더십이 있습니다.
세심한 면은 부족하여 꼼꼼하게 잘 챙기는 편은 아닙니다.
어떤 일이든 주도적인 위치에서 중요한 역할을 맡으며, 경쟁을 두려워하지 않습니다.
CEO, 대통령, 정치인, 항해사, 오지여행가, 환경운동가, NGO활동가와 같이 세상을 리드하는 일에 재능이 있습니다.`, color: 'rgb(233, 30, 99)' },
  { title: '창조형', subtitle: '무에서 유를 창조하는\n아이디어 뱅크', imageSrc: '/창조형.png', description: `독특한 개성과 기발한 발상으로 트렌드를 주도합니다.
당신은 감수성이 예민하고 예술가적인 기질이 있습니다.
감정이 오르락 내리락, 감정기복이 있습니다.
인생에서 새로운 재미를 추구하는 당신은 즉흥적인 면이 있습니다.
개성이 넘치고, 호불호가 분명하며, 자기중심적이며 자신만의 세계가 확실합니다.
음악, 미술, 패션, 뷰티, 연예계, 요리 등의 분야에서 재능을 발휘합니다.`, color: 'rgb(103, 58, 183)' },
  { title: '추리형', subtitle: '한 가지 단서만으로도\n다음 상황을 예측', imageSrc: '/추리형.png', description: `당신은 직관력이 뛰어나며, 감정이입에 탁월합니다.
사람들의 말과 행동의 숨은 뜻을 잘 파악할 수 있습니다.
실제로 경험하지 않은 일도 상상만으로 머릿속에 그리며 스토리를 만들어냅니다.
단순하게 생각하기 보다는 생각이 많고 복잡하여 넘겨짚기를 잘 해 오버하기도 합니다.
호기심이 많으며 남들이 미처 예측하지 못한 것까지 잘 추리해냅니다.
심리, 상담분야나 프로파일러, CSI연구원, 작가로서 활동할 때 탁월한 능력을 발휘할 수 있습니다.`, color: 'rgb(0, 150, 136)' },
];

// --- 모바일 최적화: 성격 유형 상세 모달 ---
interface TypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIndex: number;
}

function TypeDetailModal({ isOpen, onClose, initialIndex }: TypeDetailModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDistance, setDragDistance] = useState(0);

  useEffect(() => { setCurrentIndex(initialIndex); }, [initialIndex]);

  const handlePrevious = useCallback(() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allTypesData.length - 1)), []);
  const handleNext = useCallback(() => setCurrentIndex((prev) => (prev < allTypesData.length - 1 ? prev + 1 : 0)), []);

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

  if (!isOpen) return null;
  const currentType = allTypesData[currentIndex];

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
        <div className="p-5 text-white" style={{ backgroundColor: currentType.color }}>
          <div className="text-xs font-medium opacity-90 mb-3">
            {String(currentIndex + 1).padStart(2, '0')} / {String(allTypesData.length).padStart(2, '0')}
          </div>
          <h2 className="text-2xl font-bold mb-1.5">{currentType.title}</h2>
          <p className="text-base font-medium opacity-90 whitespace-pre-line">{currentType.subtitle}</p>
        </div>
        <div 
          className="flex-1 p-5 overflow-y-auto"
          style={{ transform: isDragging ? `translateX(${dragDistance * 0.3}px)` : 'none' }}
        >
          <div className="flex flex-col items-center">
            <Image src={currentType.imageSrc} alt={`${currentType.title} 이미지`} width={120} height={120} className="mb-5 object-contain" />
            <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line text-center">{currentType.description}</p>
          </div>
        </div>
        <div className="flex justify-center items-center p-4 bg-slate-50 border-t">
          <div className="flex space-x-1.5">
            {allTypesData.map((_, index) => (
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
  allTypes: { title: string; subtitle: string; imageSrc: string }[];
  userTypes: string[];
}

function OtherTypesSection({ allTypes, userTypes }: OtherTypesSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTypeIndex, setSelectedTypeIndex] = useState(0);

  const otherTypes = allTypes.filter(type => !userTypes.includes(type.title));

  const handleTypeClick = (typeTitle: string) => {
    const index = allTypes.findIndex(type => type.title === typeTitle);
    setSelectedTypeIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="bg-white rounded-2xl shadow-xl p-5 mb-8 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-700 mb-5 text-center flex items-center justify-center">
          <Eye size={20} className="mr-2 text-sky-500" />
          옥타그노시스 15가지 성향 알아보기
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {otherTypes.map((type) => (
            <button key={type.title} onClick={() => handleTypeClick(type.title)} className="flex flex-col items-center p-3 bg-slate-50 rounded-xl border border-slate-200 transition-transform active:scale-95">
              <Image src={type.imageSrc} alt={`${type.title} 아이콘`} width={64} height={64} className="mb-2 object-contain" />
              <div className="text-center">
                <p className="font-semibold text-sm text-slate-800 break-keep">{type.title}</p>
                <p className="text-[10px] text-slate-500 whitespace-pre-line break-keep mt-1 leading-tight">{type.subtitle}</p>
              </div>
            </button>
          ))}
        </div>
      </section>
      <TypeDetailModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialIndex={selectedTypeIndex} />
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
          <h3 className={`ml-3 text-base font-semibold ${colors[type]}`}>{title}</h3>
        </div>
        <p className="text-slate-600 text-sm leading-relaxed mb-5">{message}</p>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium transition-colors active:bg-blue-700">
            확인
          </button>
        </div>
      </div>
    </div>
  );
}


export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params.attempt_id;
  
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
    attemptId ? `/api/test/result/${attemptId}` : null,
    fetcher,
    { revalidateOnFocus: false, revalidateOnReconnect: false }
  );

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
        description: `&quot;${firstType.theme_sentence}&quot;\n내 성향 유형을 확인해보세요!`,
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
        <p className="text-base font-semibold text-slate-700">결과를 분석 중입니다...</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="min-h-screen bg-sky-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 text-center border border-red-200">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-800 mb-2">결과를 불러올 수 없습니다</h2>
          <p className="text-sm text-slate-600 mb-5">{error?.message || data?.message || '알 수 없는 오류가 발생했습니다.'}</p>
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
          <h2 className="text-lg font-semibold text-slate-800 mb-2">결과 정보 없음</h2>
          <p className="text-sm text-slate-600 mb-5">유효하지 않은 접근이거나, 테스트를 완료해주세요.</p>
          <button onClick={() => router.push('/')} className="w-full px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md active:bg-blue-700">
            테스트 다시 시작하기
          </button>
        </div>
      </div>
    );
  }
  
  const { personality_types: personalityTypes, is_tie: isTie } = resultData;
  const primaryType = personalityTypes[0];
  const pageTitle = `나의 성향 유형: ${primaryType.title}`;
  const pageDescription = `옥타그노시스 성향 검사 결과, 당신은 "${primaryType.theme_sentence}" 특징을 가진 ${primaryType.title} 유형입니다.`;
  const userTypeNames = personalityTypes.map(type => type.title);

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

      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-lg mx-auto">
          <header className="text-center mb-8">
            <div className="inline-block p-2.5 bg-white rounded-xl shadow-lg mb-3 border border-slate-200">
              <Sparkles size={28} className="text-blue-500" />
            </div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-600 mb-2">
              나를 찾았어!
            </h1>
            <p className="text-base text-slate-600">
              {isTie && personalityTypes.length > 1
                ? `축하해요! ${personalityTypes.length}가지 다채로운 성향을 발견했어요!`
                : '축하해요! 당신의 핵심 성향을 발견했어요!'}
            </p>
            {isTie && personalityTypes.length > 1 && (
                 <p className="text-xs text-slate-500 mt-1.5">아래 유형들이 비슷한 점수로 나타났어요!</p>
            )}
          </header>

          <section className="space-y-8 mb-10">
            {personalityTypes.map((type, index) => {
              const imagePath = getPersonalityImagePath(type.title);
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
                          {personalityTypes.length > 1 ? `내 안의 모습 #${index + 1}` : '나의 대표 유형'}
                        </span>
                        <span className="bg-white/25 px-2.5 py-1 rounded-full text-xs font-semibold shadow">
                          {type.calculated_score}점 / {resultData.max_score}점
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold mb-1.5 drop-shadow-sm">{type.title}</h2>
                      <p className="text-base font-semibold text-white/95">&quot;{type.theme_sentence}&quot;</p>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-slate-700 mb-3 flex items-center"><Award size={18} className="text-yellow-500 mr-2" />이런 점이 돋보여요!</h3>
                      <ul className="space-y-2 pl-1">
                        {type.description_points.map((point, i) => (
                          <li key={`${type.id}-desc-${i}`} className="flex items-start">
                            <CheckCircle size={14} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-slate-600 leading-relaxed break-keep">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-base font-semibold text-slate-700 mb-2.5">✨ 나의 강점 키워드</h3>
                      <div className="flex flex-wrap gap-2">
                        {type.strength_keywords.map(kw => <span key={kw} className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{kw}</span>)}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-slate-700 mb-2.5">🌱 함께 성장할 점</h3>
                      <div className="flex flex-wrap gap-2">
                        {type.weakness_keywords.map(kw => <span key={kw} className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">{kw}</span>)}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="bg-white rounded-2xl shadow-xl p-5 mb-8 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-700 mb-4 text-center">결과를 공유해보세요!</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: '카카오톡', Icon: Share2, handler: handleKakaoShare, disabled: !kakaoReady, style: `bg-yellow-400 text-slate-800 ${!kakaoReady ? 'bg-slate-300 text-slate-500' : 'active:bg-yellow-500'}` },
                { name: '페이스북', Icon: IconFacebook, handler: handleFacebookShare, style: 'bg-[#1877F2] text-white active:bg-[#166fe5]' },
                { name: '네이버', Icon: IconNaver, handler: handleNaverBlogShare, style: 'bg-[#03C75A] text-white active:bg-[#02b350]' },
                { name: '인스타', Icon: IconInstagram, handler: handleInstagramShare, style: 'bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500 text-white' },
                { name: '링크복사', Icon: copySuccess ? CheckCircle : Copy, handler: handleCopyUrl, style: `bg-slate-600 text-white active:bg-slate-700 ${copySuccess ? 'text-green-400' : ''}` },
              ].map(({ name, Icon, handler, style, disabled }) => (
                <button key={name} type="button" onClick={handler} disabled={disabled} className={`w-full flex flex-col items-center justify-center p-2.5 rounded-xl font-semibold transition-transform shadow-md active:scale-95 ${style}`}>
                  <Icon size={22} className="mb-1" />
                  <span className="text-xs">{name}</span>
                </button>
              ))}
            </div>
          </section>

          <OtherTypesSection allTypes={allTypesData} userTypes={userTypeNames} />

          <section className="bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl shadow-xl p-6 mb-8 text-white text-center">
            <Users size={32} className="mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-semibold mb-1.5">나에게 꼭 맞는 진로가 궁금하다면?</h3>
            <p className="text-sm opacity-90 mb-5">전문적인 옥타그노시스 정식 검사로<br/>더 깊이있는 분석과 진로 정보를 확인하세요.</p>
            <a href="https://aptitude-x.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold transition-transform shadow-md active:scale-95">
              <ExternalLink size={18} className="mr-2" />
              정식 검사 알아보기 
            </a>
          </section>
          
          <div className="text-center mt-10">
            <button onClick={() => router.push('/')} className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold text-base transition-transform shadow-xl active:scale-95 inline-flex flex-col items-center">
              <div>새로운 테스트 시작하기</div>
              {participantCount && (
                <div className="flex items-center text-xs font-normal mt-1 opacity-90">
                  <Users size={14} className="mr-1" />총 {participantCount.toLocaleString()}명 참여!
                </div>
              )}
            </button>
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-500">본 테스트는 옥타그노시스 검사의 무료버전입니다.</p>
            <p className="text-xs text-slate-500 mt-1">© Copyright 2024. 한국진로적성센터. All rights reserved. </p>
          </footer>
        </div>
      </div>

      <Dialog isOpen={dialogState.isOpen} onClose={closeDialog} title={dialogState.title} message={dialogState.message} type={dialogState.type} />
    </>
  );
}