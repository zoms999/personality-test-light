'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, LogOut, FileText, ClipboardList, LayoutDashboard } from 'lucide-react';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    {
      href: '/admin',
      label: '대시보드',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      href: '/admin/questions',
      label: '다국어 문항 관리',
      icon: FileText,
      exact: false,
    },
    {
      href: '/admin/results',
      label: '결과 관리',
      icon: ClipboardList,
      exact: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="flex items-center space-x-3">
                <Users size={24} className="text-blue-600" />
                <span className="text-xl font-bold text-slate-800">관리자</span>
              </Link>
              
              {/* Navigation */}
              <nav className="hidden md:flex space-x-1">
                {menuItems.map((item) => {
                  const isActive = item.exact 
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
