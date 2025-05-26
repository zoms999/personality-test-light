'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTestStore } from '@/stores/testStore';
import { Loader2, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';

function QuestionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Zustand 스토어에서 상태와 액션 가져오기
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
    prevPage,
    submitAnswers,
    getCurrentPageQuestions,
    getTotalPages,
    isCurrentPageComplete,
    resetStore,
  } = useTestStore();

  // 초기화
  useEffect(() => {
    const attemptIdParam = searchParams.get('attemptId');
    
    if (!attemptIdParam) {
      router.push('/start');
      return;
    }

    // UUID 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(attemptIdParam)) {
      console.warn("Invalid attemptId format, redirecting to start.");
      router.push('/start');
      return;
    }

    // 스토어 초기화 및 데이터 로드
    resetStore();
    setAttemptId(attemptIdParam);
    fetchQuestions();
  }, [searchParams, router, setAttemptId, fetchQuestions, resetStore]);

  // 현재 페이지의 질문들 가져오기
  const currentQuestions = getCurrentPageQuestions();
  const totalPages = getTotalPages();
  const isLastPage = currentPage >= totalPages - 1;
  const isFirstPage = currentPage === 0;

  // 점수 선택 핸들러
  const handleScoreSelect = (questionId: number, score: number) => {
    setAnswer(questionId, score);
  };

  // 다음 페이지 핸들러
  const handleNext = () => {
    if (!isCurrentPageComplete() && !isLastPage) {
        useTestStore.setState({ error: '현재 페이지의 모든 질문에 답변해주세요.' });
        setTimeout(() => useTestStore.setState({ error: null }), 3000);
        return;
    }
    useTestStore.setState({ error: null });
    nextPage();
  };

  // 이전 페이지 핸들러
  const handlePrev = () => {
    useTestStore.setState({ error: null });
    prevPage();
  };

  // 결과 보기 핸들러
  const handleSubmit = async () => {
    if (!isCurrentPageComplete()) {
      useTestStore.setState({ error: '모든 질문에 답변해주세요.' });
      setTimeout(() => useTestStore.setState({ error: null }), 3000);
      return;
    }
    useTestStore.setState({ error: null });

    const confirmSubmit = confirm('모든 답변을 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.');
    if (confirmSubmit) {
      await submitAnswers(router);
    }
  };

  // 로딩 상태
  if (isLoading && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
        <p className="text-lg font-semibold text-slate-700 mb-1">잠시만 기다려주세요...</p>
        <p className="text-slate-500">질문을 준비하고 있습니다.</p>
      </div>
    );
  }

  // 에러 상태
  if (error && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8 text-center border border-red-200">
          <AlertTriangle size={48} className="text-red-500 mx-auto mb-5" />
          <h2 className="text-xl font-semibold text-slate-800 mb-2">오류 발생</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/start')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            처음으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 질문이 없는 경우
  if (!isLoading && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4">
         <AlertTriangle size={48} className="text-amber-500 mx-auto mb-5" />
        <p className="text-lg font-semibold text-slate-700 mb-1">질문을 불러올 수 없습니다.</p>
        <p className="text-slate-500 mb-6">네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.</p>
        <button
            type="button"
            onClick={() => router.push('/start')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            처음으로 돌아가기
        </button>
      </div>
    );
  }

  // 버튼 공통 스타일
  const navButtonBaseStyle = "px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-opacity-50";
  const navButtonDisabledStyle = "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none scale-100";
  const prevButtonStyle = `${navButtonBaseStyle} bg-white border-2 border-slate-400 text-slate-600 hover:bg-slate-50 hover:border-slate-500 focus:ring-slate-300 shadow-sm`;
  const nextButtonStyle = `${navButtonBaseStyle} bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl focus:ring-blue-300`;
  const submitButtonStyle = `${navButtonBaseStyle} bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl focus:ring-emerald-300`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
          옥스, 나를 찾아줘!
          </h1>
          <div className="flex items-center justify-center space-x-3 text-sm text-slate-500">
            <span>페이지 {currentPage + 1} / {totalPages}</span>
            <span className="text-slate-300">•</span>
            <span>총 {allQuestions.length}개 문항</span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-8 shadow-sm">
          <p className="text-sky-800 text-center text-sm sm:text-base font-medium break-keep">
            각 문항을 읽고, 평소 자신의 모습과 얼마나 일치하는지 선택해주세요.
            <br />
            나와 많이 비슷할수록 <span className="font-semibold">10점</span>에 가깝게, 나와 비슷하지 않다면 <span className="font-semibold">1점</span>에 가깝게 체크하시면 됩니다.
          </p>
        </div>

        {/* 질문 카드 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-slate-200">
          <div className="space-y-8">
            {currentQuestions.map((question) => (
              <div key={question.id} className="border-b border-slate-100 last:border-b-0 pb-6 last:pb-0">
                {/* --- 변경된 문항 표시 부분 시작 --- */}
                <h3 className="text-lg font-semibold text-slate-700 mb-5 leading-snug flex items-baseline">
                  <span className="mr-2 flex-shrink-0">
                    {allQuestions.findIndex(q => q.id === question.id) + 1}.
                  </span>
                  <span className="break-keep">
                    {question.question_text}
                  </span>
                </h3>
                {/* --- 변경된 문항 표시 부분 끝 --- */}
                
                {/* 점수 선택 */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm text-slate-500 px-1 sm:px-2">
                    <span>매우 그렇다</span> 
                    <span>전혀 아니다</span>
                  </div>
                  
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((score) => ( 
                      <label
                        key={`${question.id}-${score}`}
                        className={`flex flex-col items-center cursor-pointer transition-all duration-200 group ${
                          answers[question.id] === score
                            ? 'transform scale-110 sm:scale-115'
                            : 'hover:transform hover:scale-105'
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
                          className={`w-full aspect-square rounded-lg sm:rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-200
                            peer-checked:border-blue-600 peer-checked:bg-blue-500 peer-checked:text-white peer-checked:shadow-md
                            border-slate-300 bg-white text-slate-600 group-hover:border-blue-400 group-hover:bg-blue-50
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
        </div>

        {/* 에러 메시지 */}
        {error && allQuestions.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-6 text-center shadow">
                <p className="text-yellow-700 text-sm font-medium">{error}</p>
            </div>
        )}

        {/* 네비게이션 버튼 */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={isFirstPage || (isLoading && allQuestions.length > 0)}
            className={`${isFirstPage || (isLoading && allQuestions.length > 0) ? navButtonDisabledStyle : prevButtonStyle} w-full sm:w-auto flex items-center justify-center space-x-2`}
          >
            <ChevronLeft size={20} />
            <span>이전</span>
          </button>

          {/* 페이지 표시 점 (모바일에서는 숨김) */}
          <div className="hidden sm:flex items-center space-x-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <div
                key={`page-${pageNum}-of-${totalPages}`}
                className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                  pageNum - 1 === currentPage
                    ? 'bg-blue-500 w-5'
                    : 'bg-slate-300 w-2 hover:bg-slate-400'
                }`}
                title={`페이지 ${pageNum}`}
              />
            ))}
          </div>

          {isLastPage ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={(isLoading && allQuestions.length > 0)}
              className={`${(isLoading && allQuestions.length > 0) ? navButtonDisabledStyle : submitButtonStyle} w-full sm:w-auto flex items-center justify-center space-x-2`}
            >
              <span>{ (isLoading && allQuestions.length > 0) ? '제출 중...' : '결과 보기'}</span>
              {!(isLoading && allQuestions.length > 0) && <CheckCircle2 size={20} />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={(isLoading && allQuestions.length > 0)}
              className={`${(isLoading && allQuestions.length > 0) ? navButtonDisabledStyle : nextButtonStyle} w-full sm:w-auto flex items-center justify-center space-x-2`}
            >
              <span>다음</span>
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* 진행률 표시 */}
        <div className="mt-10">
          <div className="flex justify-between text-sm text-slate-600 mb-1.5 px-1">
            <span>답변 진행</span>
            <span>{Object.keys(answers).length} / {allQuestions.length}</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 relative overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{
                width: `${(Object.keys(answers).length / allQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center text-center p-4">
        <Loader2 size={48} className="text-blue-500 animate-spin mb-6" />
        <p className="text-lg font-semibold text-slate-700 mb-1">잠시만 기다려주세요...</p>
        <p className="text-slate-500">페이지를 준비하고 있습니다.</p>
      </div>
    }>
      <QuestionsPageContent />
    </Suspense>
  );
}