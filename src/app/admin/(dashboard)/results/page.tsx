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

// ... interfaces

export default function ResultManagement() {
  const [types, setTypes] = useState<PersonalityType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PersonalityType | null>(null);
  const [formData, setFormData] = useState({
    ko_type_name: '', ko_title: '', ko_description: '',
    en_type_name: '', en_title: '', en_description: '',
    ja_type_name: '', ja_title: '', ja_description: '',
    vi_type_name: '', vi_title: '', vi_description: '',
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
    
    // Helper to get trans safely
    const getTrans = (lang: string) => type.translations.find(t => t.language_code === lang) || { type_name: '', title: '', description: '' };
    
    const ko = getTrans('ko');
    const en = getTrans('en');
    const ja = getTrans('ja');
    const vi = getTrans('vi');

    setFormData({
      ko_type_name: ko.type_name, ko_title: ko.title, ko_description: ko.description,
      en_type_name: en.type_name, en_title: en.title, en_description: en.description,
      ja_type_name: ja.type_name, ja_title: ja.title, ja_description: ja.description,
      vi_type_name: vi.type_name, vi_title: vi.title, vi_description: vi.description,
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
        { language_code: 'ko', type_name: formData.ko_type_name, title: formData.ko_title, description: formData.ko_description },
        { language_code: 'en', type_name: formData.en_type_name, title: formData.en_title, description: formData.en_description },
        { language_code: 'ja', type_name: formData.ja_type_name, title: formData.ja_title, description: formData.ja_description },
        { language_code: 'vi', type_name: formData.vi_type_name, title: formData.vi_title, description: formData.vi_description },
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800">
                결과 수정: <span className="text-blue-600">{editingType.type_code}</span>
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
               {/* Korean */}
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 flex items-center"><span className="text-lg mr-2">🇰🇷</span> 한국어 (KO)</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">유형 이름</label>
                     <input type="text" value={formData.ko_type_name} onChange={e => setFormData({...formData, ko_type_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
                     <input type="text" value={formData.ko_title} onChange={e => setFormData({...formData, ko_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                     <textarea value={formData.ko_description} onChange={e => setFormData({...formData, ko_description: e.target.value})} className="w-full px-3 py-2 border rounded-lg min-h-[100px]" />
                   </div>
                 </div>
               </div>

               <hr className="border-slate-100" />

               {/* English */}
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 flex items-center"><span className="text-lg mr-2">🇺🇸</span> 영어 (EN)</h3>
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Type Name</label>
                     <input type="text" value={formData.en_type_name} onChange={e => setFormData({...formData, en_type_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                     <input type="text" value={formData.en_title} onChange={e => setFormData({...formData, en_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                     <textarea value={formData.en_description} onChange={e => setFormData({...formData, en_description: e.target.value})} className="w-full px-3 py-2 border rounded-lg min-h-[100px]" />
                   </div>
                 </div>
               </div>

               <hr className="border-slate-100" />
               
               {/* Japanese */}
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 flex items-center"><span className="text-lg mr-2">🇯🇵</span> 일본어 (JA)</h3>
                  <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">유형 이름</label>
                     <input type="text" value={formData.ja_type_name} onChange={e => setFormData({...formData, ja_type_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
                     <input type="text" value={formData.ja_title} onChange={e => setFormData({...formData, ja_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                     <textarea value={formData.ja_description} onChange={e => setFormData({...formData, ja_description: e.target.value})} className="w-full px-3 py-2 border rounded-lg min-h-[100px]" />
                   </div>
                 </div>
               </div>

               <hr className="border-slate-100" />

               {/* Vietnamese */}
               <div className="space-y-4">
                 <h3 className="font-bold text-slate-800 flex items-center"><span className="text-lg mr-2">🇻🇳</span> 베트남어 (VI)</h3>
                  <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">유형 이름</label>
                     <input type="text" value={formData.vi_type_name} onChange={e => setFormData({...formData, vi_type_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">제목</label>
                     <input type="text" value={formData.vi_title} onChange={e => setFormData({...formData, vi_title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
                     <textarea value={formData.vi_description} onChange={e => setFormData({...formData, vi_description: e.target.value})} className="w-full px-3 py-2 border rounded-lg min-h-[100px]" />
                   </div>
                 </div>
               </div>


              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 sticky bottom-0 bg-white pb-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  변경사항 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
