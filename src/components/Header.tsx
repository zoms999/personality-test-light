'use client';

import { Users } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  disableLanguageChange?: boolean;
  onLanguageChangeAttempt?: () => void;
}

export default function Header({ disableLanguageChange = false, onLanguageChangeAttempt }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* 좌측: 로고/서비스명 */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
              <Users size={20} className="text-white" />
            </div>
            <span className="text-lg font-bold text-slate-800 hidden sm:inline">
              ORIGIN | 나를 찾아줘
            </span>
            <span className="text-lg font-bold text-slate-800 sm:hidden">
              ORIGIN
            </span>
          </div>

          {/* 우측: 언어 선택기 */}
          <div>
            <LanguageSelector 
              disabled={disableLanguageChange}
              onDisabledClick={onLanguageChangeAttempt}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
