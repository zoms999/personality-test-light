'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTestStore } from '@/stores/testStore';
import { Loader2, AlertTriangle, ChevronRight, CheckCircle2, Info } from 'lucide-react';
import Header from '@/components/Header';
import LanguageChangeModal from '@/components/LanguageChangeModal';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLocaleStore } from '@/stores/localeStore';

// --- ConfirmModal 컴포넌트 (변경 없음) ---
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }: ConfirmModalProps) {
  const { t } = useTranslation();
  const backdropClass = isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none';
  const modalClass = isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none';

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300 ease-in-out ${backdropClass}`}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 m-4 text-center transform transition-all duration-300 ease-in-out ${modalClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2 break-keep">{title}</h2>
        <p className="text-slate-600 mb-6 break-keep">{message}</p>
        <div className="flex justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            {t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}


function QuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const initLocale = useLocaleStore((state) => state.initLocale);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);

  const {
    allQuestions,
    answers,
    currentPage,
    isLoading,
    error,
    setAttemptId,
    fetchQuestions,
    setAnswer,
    nextPage,
    submitAnswers,
    getCurrentPageQuestions,
    getTotalPages,
    isCurrentPageComplete,
    resetStore,
  } = useTestStore();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // 언어 초기화
  useEffect(() => {
    initLocale();
  }, [initLocale]);

  useEffect(() => {
    const attemptIdParam = searchParams.get('attemptId');

    if (!attemptIdParam) {
      router.push('/start');
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(attemptIdParam)) {
      console.warn("Invalid attemptId format, redirecting to start.");
      router.push('/start');
      return;
    }

    const currentAttemptId = useTestStore.getState().attemptId;
    if (attemptIdParam !== currentAttemptId) {
      resetStore();
      setAttemptId(attemptIdParam);
      fetchQuestions();
    }
  }, [searchParams, router, setAttemptId, fetchQuestions, resetStore]);

  const currentQuestions = getCurrentPageQuestions();
  const totalPages = getTotalPages();
  const isLastPage = currentPage >= totalPages - 1;
  const isFirstPage = currentPage === 0;

  const handleScoreSelect = (questionId: number, score: number) => {
    setAnswer(questionId, score);
  };

  const handleNext = () => {
    if (!isCurrentPageComplete() && !isLastPage) {
        useTestStore.setState({ error: t('questions.errors.answerAllQuestions') });
        setTimeout(() => useTestStore.setState({ error: null }), 3000);
        return;
    }
    useTestStore.setState({ error: null });
    nextPage();
    window.scrollTo(0, 0);
  };

  const handleSubmit = () => {
    if (!isCurrentPageComplete()) {
      useTestStore.setState({ error: t('questions.errors.answerAllBeforeSubmit') });
      setTimeout(() => useTestStore.setState({ error: null }), 3000);
      return;
    }
    useTestStore.setState({ error: null });
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSubmit = async () => {
    setIsConfirmModalOpen(false);
    await submitAnswers(router);
  };

  // 점수별 색상: 10~6 파랑, 5~1 녹색, 점수 낮을수록 옅어짐 (변경 없음)
  const getScoreColorClass = (score: number): string => {
    if (score >= 10) return 'peer-checked:bg-blue-600 peer-checked:border-blue-700 group-hover:bg-blue-50';
    if (score >= 9)  return 'peer-checked:bg-blue-500 peer-checked:border-blue-600 group-hover:bg-blue-50';
    if (score >= 8)  return 'peer-checked:bg-blue-500 peer-checked:border-blue-600 group-hover:bg-blue-50';
    if (score >= 7)  return 'peer-checked:bg-blue-400 peer-checked:border-blue-500 group-hover:bg-blue-50';
    if (score >= 6)  return 'peer-checked:bg-blue-300 peer-checked:border-blue-400 peer-checked:text-blue-800 group-hover:bg-blue-50';
    if (score >= 5)  return 'peer-checked:bg-emerald-500 peer-checked:border-emerald-600 group-hover:bg-emerald-50';
    if (score >= 4)  return 'peer-checked:bg-emerald-400 peer-checked:border-emerald-500 group-hover:bg-emerald-50';
    if (score >= 3)  return 'peer-checked:bg-emerald-400 peer-checked:border-emerald-500 group-hover:bg-emerald-50';
    if (score >= 2)  return 'peer-checked:bg-emerald-300 peer-checked:border-emerald-400 peer-checked:text-emerald-800 group-hover:bg-emerald-50';
    return 'peer-checked:bg-emerald-200 peer-checked:border-emerald-300 peer-checked:text-emerald-900 group-hover:bg-emerald-50';
  };

  // --- [수정] 점수별 크기 함수 제거 ---
  // const getScoreSizeClass = ... (이 함수는 이제 필요 없습니다)
  
  if (isLoading && allQuestions.length === 0) { /* 로딩 화면 */ return ( <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4"> <Loader2 size={48} className="text-blue-500 animate-spin mb-6" /> <p className="text-lg font-semibold text-slate-700 mb-1 break-keep">{t('common.loading')}</p> <p className="text-slate-500 break-keep">{t('start.processing')}</p> </div> ); }
  if (error && allQuestions.length === 0) { /* 오류 화면 */ return ( <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4"> <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center border border-red-200"> <AlertTriangle size={48} className="text-red-500 mx-auto mb-5" /> <h2 className="text-xl font-semibold text-slate-800 mb-2 break-keep">오류 발생</h2> <p className="text-slate-600 mb-6 break-keep">{error}</p> <button type="button" onClick={() => router.push('/start')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all break-keep">처음으로 돌아가기</button> </div> </div> ); }
  if (!isLoading && allQuestions.length === 0) { /* 데이터 없음 화면 */ return ( <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4"> <AlertTriangle size={48} className="text-amber-500 mx-auto mb-5" /> <p className="text-lg font-semibold text-slate-700 mb-1 break-keep">질문을 불러올 수 없습니다.</p> <p className="text-slate-500 mb-6 break-keep">네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.</p> <button type="button" onClick={() => router.push('/start')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all break-keep">처음으로 돌아가기</button> </div> ); }

  const navButtonBaseStyle = "h-12 px-6 rounded-xl font-semibold text-base transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-opacity-50 flex items-center justify-center space-x-2";
  const nextButtonStyle = `${navButtonBaseStyle} bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-300`;
  const submitButtonStyle = `${navButtonBaseStyle} bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl focus:ring-emerald-300`;

  return (
    <>
      <Header 
        disableLanguageChange={true}
        onLanguageChangeAttempt={() => setIsLanguageModalOpen(true)}
      />
      <LanguageChangeModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        message={t('questions.languageChangeRestricted')}
      />
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-8 sm:py-12 px-5">
        <div className="max-w-2xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 break-keep">
              {t('questions.title')}
            </h1>
            <div className="flex items-center justify-center space-x-3 text-sm text-slate-500">
              <span className="break-keep">{t('questions.pageInfo', { current: String(currentPage + 1), total: String(totalPages) })}</span>
              <span className="text-slate-300">•</span>
              <span className="break-keep">{t('questions.totalQuestions', { count: String(allQuestions.length) })}</span>
            </div>
          </header>

          <div className="bg-sky-50/80 backdrop-blur-sm border border-sky-200 rounded-lg p-4 mb-10 shadow-sm flex items-start space-x-3">
            <Info size={20} className="text-sky-600 mt-0.5 flex-shrink-0" />
            <p className="text-sky-800 text-sm sm:text-base font-medium break-keep text-left sm:text-center">
              {t('questions.instruction')}
              <span className="font-extrabold text-blue-700 text-base sm:text-lg align-baseline break-keep"> {t('questions.instructionHighScore')}</span>, 
              <span className="font-extrabold text-green-700 text-base sm:text-lg align-baseline break-keep"> {t('questions.instructionLowScore')}</span>
            </p>
          </div>

          <main className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-10 border border-slate-200/80">
            <div className="space-y-12">
              {currentQuestions.map((question) => (
                <div key={question.id} className="border-b border-slate-100 last:border-b-0 pb-10 last:pb-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-6 leading-relaxed flex items-baseline">
                    <span className="mr-3 flex-shrink-0 font-normal text-slate-400">
                      {allQuestions.findIndex(q => q.id === question.id) + 1}.
                    </span>
                    <span className="break-keep">{question.question_text}</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs sm:text-sm font-semibold px-2">
                    <span className="text-blue-600 break-keep">{t('questions.veryTrue')}</span> 
                      {/* <span className="text-emerald-600">전혀 아니다</span> */}
                    </div>
                    
                    {/* --- [수정] 반응형 Flexbox 레이아웃 및 통일된 버튼 크기 적용 --- */}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => ( 
                        <label
                          key={`${question.id}-${score}`}
                          className={`flex flex-col items-center cursor-pointer transition-all duration-200 group ${
                            answers[question.id] === score
                              ? 'transform scale-110'
                              : 'hover:scale-105'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={score}
                            checked={answers[question.id] === score}
                            onChange={() => handleScoreSelect(question.id, score)}
                            className="sr-only peer"
                          />
                          <div
                            className={`
                              w-11 h-11 text-base
                              ${getScoreColorClass(score)}
                              rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200
                              peer-checked:text-white peer-checked:shadow-lg
                              border-slate-300 bg-white text-slate-600
                            `}
                          >
                            {score}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>

          {error && ( /* 에러 메시지 */ <div role="alert" className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-8 text-center shadow flex items-center justify-center space-x-2"> <AlertTriangle size={18} className="text-yellow-600" /> <p className="text-yellow-700 text-sm font-medium break-keep">{error}</p> </div> )}

          <footer className={`flex flex-col sm:flex-row items-center gap-4 ${isFirstPage ? 'justify-end' : 'justify-between'}`}>
            {/* {!isFirstPage && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={(isLoading && allQuestions.length > 0)}
                className={`${prevButtonStyle} w-full sm:w-auto`}
              >
                <ChevronLeft size={20} />
                <span>이전</span>
              </button>
            )} */}
            
            <div className={`hidden sm:flex items-center space-x-1.5 ${isFirstPage ? 'sm:hidden' : ''}`}>
              {Array.from({ length: totalPages }, (_, i) => ( <div key={`page-dot-${i}`} className={`h-2 rounded-full transition-all duration-300 ease-in-out ${ i === currentPage ? 'bg-blue-500 w-5' : 'bg-slate-300 w-2 hover:bg-slate-400' }`} title={`페이지 ${i + 1}`} /> ))}
            </div>

            {isLastPage ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className={`${isLoading ? navButtonBaseStyle + ' bg-slate-300' : submitButtonStyle} w-full sm:w-auto`}
              >
                <span>{isLoading ? t('questions.submitting') : t('questions.viewResult')}</span>
                {!isLoading && <CheckCircle2 size={20} />}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className={`${isLoading ? navButtonBaseStyle + ' bg-slate-300' : nextButtonStyle} w-full sm:w-auto`}
              >
                <span>{t('common.next')}</span>
                <ChevronRight size={20} />
              </button>
            )}
          </footer>

          <div className="mt-10">
            <div className="flex justify-between text-sm text-slate-600 mb-1.5 px-1">
              <span>{t('questions.progress')}</span>
              <span className='font-medium break-keep'>{Object.keys(answers).length} / {allQuestions.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(Object.keys(answers).length / allQuestions.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        title={t('questions.confirmSubmit')}
        message={t('questions.confirmMessage')}
      />
    </>
  );
}


export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
        <p className="text-lg font-semibold text-slate-700 mb-1 break-keep">페이지를 불러오는 중입니다</p>
        <p className="text-slate-500 break-keep">잠시만 기다려주세요...</p>
      </div>
    }>
      <QuestionsPageContent />
    </Suspense>
  );
}