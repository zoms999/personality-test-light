'use client';

import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Users } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [participantCount, setParticipantCount] = useState<number | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12 overflow-hidden relative">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-blue-300 rounded-full opacity-20 animate-pulse-slow filter blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 w-80 h-80 bg-cyan-300 rounded-full opacity-15 animate-pulse-slower filter blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-sky-400 rounded-full opacity-10 animate-pulse-even-slower filter blur-3xl" />
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center space-y-10 relative z-10">
        <div className="flex justify-center mb-6">
        <div className="inline-block p-3 bg-white bg-opacity-60 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg">
            <Image
              src="/ORIGIN.png" // ★★★ 이 파일의 배경이 투명해야 합니다 ★★★
              alt="ORIGIN"
              width={100}  // 예시: 크기 증가 (실제 이미지 비율에 맞게 조정)
              height={100} // 예시: 크기 증가 (실제 이미지 비율에 맞게 조정)
              priority // LCP(Largest Contentful Paint) 요소일 가능성이 있으므로 priority 추가 고려
            />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-500 leading-tight drop-shadow-sm">
          나를 찾아줘!!
        </h1>
        
        <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-xl mx-auto">
          <span className="font-semibold text-blue-600">10만 1천 4백명</span>의 성공을 만든 옥타그노시스 검사,
          <br />
          무료 버전  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500">&apos;옥스, 나를 찾아줘!&apos;</span> 를 체험해보세요! 
        </p>
        
        <div className="pt-8">
          <Link 
            href="/start"
            className="group inline-flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-cyan-500 to-sky-600 hover:from-blue-600 hover:via-cyan-600 hover:to-sky-700 text-white font-semibold text-xl px-10 py-4 rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-70"
          >
            <div className="flex items-center">
              검사 시작하기
              <ChevronRight size={24} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
            {participantCount !== null && (
              <div className="flex items-center text-sm font-normal mt-1 opacity-90">
                <Users size={16} className="mr-1" />
                현재 총 {participantCount.toLocaleString()}명이 참여했어요!
              </div>
            )}
          </Link>
        </div>
        
        <div className="pt-12">
          <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto break-keep">
            * 본 무료 테스트는 옥타그노시스 검사의 축약본으로, 일부 성향만 나타날 수 있습니다.
            보다 종합적이고 상세한 진단을 원하시는 분은 옥타그노시스 STANDARD 또는 PREMIUM 버전을 신청하시기 바랍니다.  
          </p>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-indigo-100/80 to-transparent pointer-events-none" />
    </div>
  );
}