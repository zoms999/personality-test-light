'use client';

import { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2,
  CheckCircle,
  XCircle,
  Globe
} from 'lucide-react';

interface QuestionTranslation {
  id: number;
  language_code: string;
  question_text: string;
}

interface Question {
  id: number;
  personality_type_id: string;
  question_order_in_type: number;
  is_active: boolean;
  personality_type: {
    type_code: string;
    translations: { type_name: string }[];
  };
  translations: QuestionTranslation[];
}

interface PersonalityType {
  id: string;
  type_code: string;
}

export default function QuestionManagement() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    personality_type_id: '',
    question_order_in_type: 1,
    is_active: true,
    ko_text: '',
    en_text: '',
    ja_text: '',
    vi_text: '',
  });

  const [personalityTypes, setPersonalityTypes] = useState<PersonalityType[]>([]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/admin/questions');
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch questions', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      personality_type_id: question.personality_type_id,
      question_order_in_type: question.question_order_in_type,
      is_active: question.is_active,
      ko_text: question.translations.find(t => t.language_code === 'ko')?.question_text || '',
      en_text: question.translations.find(t => t.language_code === 'en')?.question_text || '',
      ja_text: question.translations.find(t => t.language_code === 'ja')?.question_text || '',
      vi_text: question.translations.find(t => t.language_code === 'vi')?.question_text || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      personality_type_id: '',
      question_order_in_type: 1,
      is_active: true,
      ko_text: '',
      en_text: '',
      ja_text: '',
      vi_text: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: editingId || undefined,
        personality_type_id: formData.personality_type_id,
        question_order_in_type: Number(formData.question_order_in_type),
        is_active: formData.is_active,
        translations: [
          { language_code: 'ko', question_text: formData.ko_text },
          { language_code: 'en', question_text: formData.en_text },
          { language_code: 'ja', question_text: formData.ja_text },
          { language_code: 'vi', question_text: formData.vi_text },
        ].filter(t => t.question_text) // Only send filled translations
      };

      const res = await fetch('/api/admin/questions', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        closeModal();
        fetchQuestions();
      }
    } catch (error) {
      console.error('Failed to save question', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">다국어 문항 관리</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              personality_type_id: '',
              question_order_in_type: 1,
              is_active: true,
              ko_text: '',
              en_text: '',
              ja_text: '',
              vi_text: '',
            });
            setIsModalOpen(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>문항 추가</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-blue-500" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">순서</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">유형</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">문항 내용 (KO)</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">번역 상태</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase">상태</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {questions.map((question) => {
                const koText = question.translations.find(t => t.language_code === 'ko')?.question_text || '-';
                const typeName = question.personality_type.translations[0]?.type_name || question.personality_type.type_code;
                const activeLangs = question.translations.map(t => t.language_code);

                return (
                  <tr key={question.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {question.question_order_in_type}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{typeName}</div>
                      <div className="text-xs text-slate-500">{question.personality_type.type_code}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-800 max-w-md truncate" title={koText}>
                      {koText}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        {['ko', 'en', 'ja', 'vi'].map(lang => (
                          <span 
                            key={lang}
                            className={`px-1.5 py-0.5 text-xs rounded uppercase ${
                              activeLangs.includes(lang.toLowerCase()) 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {question.is_active ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle size={16} className="mr-1" /> 활성
                        </span>
                      ) : (
                        <span className="flex items-center text-slate-400 text-sm">
                          <XCircle size={16} className="mr-1" /> 비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => handleEdit(question)}
                         className="text-slate-400 hover:text-blue-600 transition-colors"
                       >
                         <Edit size={18} />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingId ? '문항 수정' : '문항 추가'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">성격 유형 ID</label>
                  <input 
                    type="text" 
                    required
                    value={formData.personality_type_id}
                    onChange={e => setFormData({...formData, personality_type_id: e.target.value})}
                    placeholder="UUID 입력 (임시)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-slate-500 mt-1">추후 Dropdown으로 변경 예정</p>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-2">순서</label>
                   <input 
                    type="number" 
                    min="1"
                    value={formData.question_order_in_type}
                    onChange={e => setFormData({...formData, question_order_in_type: Number(e.target.value)})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                   <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 mt-4 cursor-pointer">
                     <input 
                       type="checkbox"
                       checked={formData.is_active}
                       onChange={e => setFormData({...formData, is_active: e.target.checked})}
                       className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                     />
                     <span>사용 여부</span>
                   </label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center">
                  <Globe size={16} className="mr-2" /> 다국어 번역
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">한국어 (KO)</label>
                  <textarea 
                    required
                    value={formData.ko_text}
                    onChange={e => setFormData({...formData, ko_text: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">영어 (EN)</label>
                  <textarea 
                    value={formData.en_text}
                    onChange={e => setFormData({...formData, en_text: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">일본어 (JA)</label>
                  <textarea 
                    value={formData.ja_text}
                    onChange={e => setFormData({...formData, ja_text: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">베트남어 (VI)</label>
                  <textarea 
                    value={formData.vi_text}
                    onChange={e => setFormData({...formData, vi_text: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[80px]"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
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
                  {editingId ? '수정 저장' : '저장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
