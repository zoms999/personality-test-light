'use client';

import { useEffect, useState } from 'react';
// ... imports
import {
  Loader2,
  Globe,
  ChevronDown,
  ChevronUp,
  Edit,
  XCircle,
  CheckCircle
} from 'lucide-react';

import { PersonalityTypes, PersonalityTypeTranslations } from '@prisma/client';

interface PersonalityType extends PersonalityTypes {
  translations: PersonalityTypeTranslations[];
}

export default function ResultManagement() {
  const [types, setTypes] = useState<PersonalityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PersonalityType | null>(null);
  const [activeTab, setActiveTab] = useState<'en' | 'ja' | 'vi'>('en');
  const [formData, setFormData] = useState({
    ko_type_name: '', ko_title: '', ko_description: '', ko_theme_sentence: '', ko_description_points: '', ko_strength_keywords: '', ko_weakness_keywords: '',
    en_type_name: '', en_title: '', en_description: '', en_theme_sentence: '', en_description_points: '', en_strength_keywords: '', en_weakness_keywords: '',
    ja_type_name: '', ja_title: '', ja_description: '', ja_theme_sentence: '', ja_description_points: '', ja_strength_keywords: '', ja_weakness_keywords: '',
    vi_type_name: '', vi_title: '', vi_description: '', vi_theme_sentence: '', vi_description_points: '', vi_strength_keywords: '', vi_weakness_keywords: '',
  });

  const fetchTypes = async () => {
    try {
      const response = await fetch('/api/admin/results');
      const data = await response.json();
      if (data.success) {
        setTypes(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch types', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleEdit = (type: PersonalityType) => {
    setEditingType(type);
    setActiveTab('en'); // Reset to English tab on open

    // Helper to get trans safely
    const getTrans = (lang: string) => {
      const t = type.translations.find(t => t.language_code === lang);
      return {
        type_name: t?.type_name || '',
        title: t?.title || '',
        description: t?.description || '',
        theme_sentence: t?.theme_sentence || '',
        description_points: Array.isArray(t?.description_points) ? (t?.description_points as string[]).join('\n') : '',
        strength_keywords: Array.isArray(t?.strength_keywords) ? (t?.strength_keywords as string[]).join(', ') : '',
        weakness_keywords: Array.isArray(t?.weakness_keywords) ? (t?.weakness_keywords as string[]).join(', ') : '',
      };
    };

    const ko = getTrans('ko');
    const en = getTrans('en');
    const ja = getTrans('ja');
    const vi = getTrans('vi');

    setFormData({
      ko_type_name: ko.type_name, ko_title: ko.title, ko_description: ko.description, ko_theme_sentence: ko.theme_sentence, ko_description_points: ko.description_points, ko_strength_keywords: ko.strength_keywords, ko_weakness_keywords: ko.weakness_keywords,
      en_type_name: en.type_name, en_title: en.title, en_description: en.description, en_theme_sentence: en.theme_sentence, en_description_points: en.description_points, en_strength_keywords: en.strength_keywords, en_weakness_keywords: en.weakness_keywords,
      ja_type_name: ja.type_name, ja_title: ja.title, ja_description: ja.description, ja_theme_sentence: ja.theme_sentence, ja_description_points: ja.description_points, ja_strength_keywords: ja.strength_keywords, ja_weakness_keywords: ja.weakness_keywords,
      vi_type_name: vi.type_name, vi_title: vi.title, vi_description: vi.description, vi_theme_sentence: vi.theme_sentence, vi_description_points: vi.description_points, vi_strength_keywords: vi.strength_keywords, vi_weakness_keywords: vi.weakness_keywords,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingType(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    try {
      const translations = [
        {
          language_code: 'ko',
          type_name: formData.ko_type_name,
          title: formData.ko_title,
          description: formData.ko_description,
          theme_sentence: formData.ko_theme_sentence,
          description_points: formData.ko_description_points.split('\n').map(s => s.trim()).filter(Boolean),
          strength_keywords: formData.ko_strength_keywords.split(',').map(s => s.trim()).filter(Boolean),
          weakness_keywords: formData.ko_weakness_keywords.split(',').map(s => s.trim()).filter(Boolean)
        },
        {
          language_code: 'en',
          type_name: formData.en_type_name,
          title: formData.en_title,
          description: formData.en_description,
          theme_sentence: formData.en_theme_sentence,
          description_points: formData.en_description_points.split('\n').map(s => s.trim()).filter(Boolean),
          strength_keywords: formData.en_strength_keywords.split(',').map(s => s.trim()).filter(Boolean),
          weakness_keywords: formData.en_weakness_keywords.split(',').map(s => s.trim()).filter(Boolean)
        },
        {
          language_code: 'ja',
          type_name: formData.ja_type_name,
          title: formData.ja_title,
          description: formData.ja_description,
          theme_sentence: formData.ja_theme_sentence,
          description_points: formData.ja_description_points.split('\n').map(s => s.trim()).filter(Boolean),
          strength_keywords: formData.ja_strength_keywords.split(',').map(s => s.trim()).filter(Boolean),
          weakness_keywords: formData.ja_weakness_keywords.split(',').map(s => s.trim()).filter(Boolean)
        },
        {
          language_code: 'vi',
          type_name: formData.vi_type_name,
          title: formData.vi_title,
          description: formData.vi_description,
          theme_sentence: formData.vi_theme_sentence,
          description_points: formData.vi_description_points.split('\n').map(s => s.trim()).filter(Boolean),
          strength_keywords: formData.vi_strength_keywords.split(',').map(s => s.trim()).filter(Boolean),
          weakness_keywords: formData.vi_weakness_keywords.split(',').map(s => s.trim()).filter(Boolean)
        },
      ].filter(t => t.type_name || t.title || t.description);

      const res = await fetch('/api/admin/results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingType.id,
          translations
        })
      });

      if (res.ok) {
        closeModal();
        fetchTypes();
      }
    } catch (error) {
      console.error('Failed to update result', error);
    }
  };

  const renderFields = (prefix: 'ko' | 'en' | 'ja' | 'vi', label: string) => {
    const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [`${prefix}_${field}`]: value }));
    };

    // Helper to safely access formData with dynamic keys
    const getValue = (field: string) => {
      return (formData as any)[`${prefix}_${field}`] || '';
    };

    return (
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 flex items-center text-lg">
          {label}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">유형 이름</label>
            <input
              type="text"
              value={getValue('type_name')}
              onChange={e => handleChange('type_name', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
            <input
              type="text"
              value={getValue('title')}
              onChange={e => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">테마 문장</label>
            <input
              type="text"
              value={getValue('theme_sentence')}
              onChange={e => handleChange('theme_sentence', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
            <textarea
              value={getValue('description')}
              onChange={e => handleChange('description', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">설명 포인트 (줄바꿈으로 구분)</label>
            <textarea
              value={getValue('description_points')}
              onChange={e => handleChange('description_points', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">강점 키워드 (쉼표로 구분)</label>
            <input
              type="text"
              value={getValue('strength_keywords')}
              onChange={e => handleChange('strength_keywords', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">약점 키워드 (쉼표로 구분)</label>
            <input
              type="text"
              value={getValue('weakness_keywords')}
              onChange={e => handleChange('weakness_keywords', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    );
  };


  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">결과(성격유형) 관리</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-200">
          {types.map((type) => {
            const koTrans = type.translations.find(t => t.language_code === 'ko');
            const isExpanded = expandedId === type.id;

            return (
              <div key={type.id} className="p-0">
                <div
                  className="flex items-center justify-between p-6 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-6 flex-1" onClick={() => toggleExpand(type.id)}>
                    <div className="bg-blue-100 text-blue-700 font-bold px-3 py-1.5 rounded text-sm w-20 text-center">
                      {type.type_code}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{koTrans?.type_name || '이름 없음'}</h3>
                      <p className="text-sm text-slate-500 max-w-2xl truncate">
                        {koTrans?.title || '제목 없음'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(type); }}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                    >
                      <Edit size={18} />
                    </button>
                    <div className="flex space-x-1" onClick={() => toggleExpand(type.id)}>
                      {type.translations.map(t => (
                        <span
                          key={t.language_code}
                          className="px-1.5 py-0.5 text-xs rounded uppercase bg-slate-100 text-slate-500 border border-slate-200"
                        >
                          {t.language_code}
                        </span>
                      ))}
                    </div>
                    <div onClick={() => toggleExpand(type.id)}>
                      {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-6">
                    {type.translations.map((trans) => (
                      <div key={trans.language_code} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                        <h4 className="flex items-center text-sm font-bold text-slate-800 mb-3 uppercase">
                          <Globe size={14} className="mr-2 text-blue-500" />
                          {trans.language_code} 번역
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs font-medium text-slate-500 block mb-1">유형 이름</span>
                            <div className="text-sm text-slate-800">{trans.type_name}</div>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-500 block mb-1">제목 (Title)</span>
                            <div className="text-sm text-slate-800">{trans.title}</div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-xs font-medium text-slate-500 block mb-1">설명 (Description)</span>
                            <div className="text-sm text-slate-600 whitespace-pre-line leading-relaxed">
                              {trans.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[90vw] h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-xl">
              <h2 className="text-xl font-bold text-slate-800">
                결과 수정: <span className="text-blue-600">{editingType.type_code}</span>
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden">
              <form onSubmit={handleSubmit} className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                    {/* Left Column: Korean (Fixed) */}
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 h-fit">
                      <div className="flex items-center mb-4 pb-2 border-b border-slate-200">
                        <span className="text-2xl mr-2">🇰🇷</span>
                        <h3 className="font-bold text-slate-800">한국어 (기준)</h3>
                      </div>
                      {renderFields('ko', '한국어 입력')}
                    </div>

                    {/* Right Column: Tabs */}
                    <div className="flex flex-col h-full">
                      <div className="flex space-x-2 mb-4 border-b border-slate-200">
                        {(['en', 'ja', 'vi'] as const).map((lang) => (
                          <button
                            key={lang}
                            type="button"
                            onClick={() => setActiveTab(lang)}
                            className={`px-4 py-2 font-medium text-sm transition-all relative top-[1px] ${activeTab === lang
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 rounded-t-lg'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg'
                              }`}
                          >
                            <span className="mr-2 text-lg">
                              {lang === 'en' ? '🇺🇸' : lang === 'ja' ? '🇯🇵' : '🇻🇳'}
                            </span>
                            {lang === 'en' ? 'English' : lang === 'ja' ? '日本語' : 'Tiếng Việt'}
                          </button>
                        ))}
                      </div>

                      <div className="flex-1 bg-white p-1">
                        {activeTab === 'en' && renderFields('en', 'English Input')}
                        {activeTab === 'ja' && renderFields('ja', '日本語 入力')}
                        {activeTab === 'vi' && renderFields('vi', 'Tiếng Việt Input')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-white rounded-b-xl flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm hover:shadow transition-all"
                  >
                    변경사항 저장
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
