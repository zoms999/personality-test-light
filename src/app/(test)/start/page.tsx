'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, ArrowRight, Loader2, Check, CalendarDays, Mail, ShieldAlert, FileText } from 'lucide-react';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useLocaleStore } from '@/stores/localeStore';

type Gender = 'male' | 'female';

// Helper function to calculate age from YYYYMMDD string
const calculateAge = (birthDateString: string): number | null => {
  if (!/^\d{8}$/.test(birthDateString)) return null;
  const year = Number.parseInt(birthDateString.substring(0, 4), 10);
  const month = Number.parseInt(birthDateString.substring(4, 6), 10) - 1; // JS months are 0-indexed
  const day = Number.parseInt(birthDateString.substring(6, 8), 10);

  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day) || month < 0 || month > 11 || day < 1 || day > 31) {
    return null; // Invalid date components
  }

  const birthDate = new Date(year, month, day);
  // Check if the constructed date is valid (e.g. 20230230 would be invalid)
  if (birthDate.getFullYear() !== year || birthDate.getMonth() !== month || birthDate.getDate() !== day) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age < 0 ? null : age; // Age cannot be negative
};

export default function StartTestPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const initLocale = useLocaleStore((state) => state.initLocale);

  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(''); // YYYYMMDD
  const [email, setEmail] = useState('');
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 언어 초기화
  useEffect(() => {
    initLocale();
  }, [initLocale]);

  // 로케일에 따른 word-break 클래스 결정 (일본어 등에서 텍스트가 화면 밖으로 나가는 현상 수정)
  const wordBreakClass = locale === 'ko' ? 'break-keep' : 'break-words';

  const genderOptions = [
    { value: 'male' as Gender, label: t('start.male'), icon: <User size={18} /> },
    { value: 'female' as Gender, label: t('start.female'), icon: <User size={18} /> }
  ];

  const handleStartTest = async () => {
    setError(null);

    if (!name.trim() || !birthDate.trim() || !selectedGender || !email.trim()) {
      setError(t('start.errors.allFieldsRequired'));
      return;
    }
    if (!/^\d{8}$/.test(birthDate)) {
      setError(t('start.errors.invalidBirthDate'));
      return;
    }
    const age = calculateAge(birthDate);
    if (age === null || age < 5 || age > 100) { // Basic age validation
      setError(t('start.errors.invalidAge'));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('start.errors.invalidEmail'));
      return;
    }

    if (!agreedToPrivacy) {
      setError(t('start.errors.privacyRequired'));
      return;
    }

    setIsLoading(true);

    try {
      const requestData = {
        userName: name,
        birthDate, // YYYYMMDD string for DB
        age: calculateAge(birthDate), // Calculated age for API (as per original design)
        gender: selectedGender,
        userEmail: email,
        phoneNumber: "00000000000", // 기본값으로 설정
        languageCode: locale, // 선택된 언어 코드 전달
        agreedToPrivacy,
      };

      // API 호출
      const response = await fetch('/api/test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '테스트 시작에 실패했습니다.');
      }

      if (result.success && result.attempt_id) {
        router.push(`/questions?attemptId=${result.attempt_id}`);
      } else {
        throw new Error(result.error || '서버 응답이 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('API 호출 오류:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputBaseStyle = "w-full px-4 py-3.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-150 ease-in-out placeholder-slate-400 text-slate-700 bg-slate-50 text-sm";
  const buttonBaseStyle = "group flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border-2 transition-all duration-200 ease-in-out transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-50 text-sm font-medium";
  const buttonUnselectedStyle = "border-slate-300 bg-white text-slate-600 hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-700";
  const buttonSelectedStyle = "border-indigo-600 bg-indigo-500 text-white shadow-md scale-[1.02]";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100 py-10 px-4 flex flex-col items-center justify-center overflow-x-hidden">
        <div className="text-center mb-8 w-full max-w-lg px-2">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
            <Users size={32} className="text-white" />
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold text-slate-800 mb-2 ${wordBreakClass}`}>
            {t('start.title')}
          </h1>
          <p className={`text-md text-slate-600 ${wordBreakClass}`}>{t('start.subtitle')}</p>
        </div>

        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200 overflow-hidden">
          <div className="space-y-5 w-full">
            {/* User Info Section */}
            <div className="w-full">
              <h2 className={`text-lg font-semibold text-slate-700 mb-3 ${wordBreakClass}`}>{t('start.basicInfo')}</h2>
              <div className="space-y-4 w-full">
                <div className="w-full">
                  <label htmlFor="name" className={`block text-xs font-medium text-slate-600 mb-1 ${wordBreakClass}`}>{t('start.name')}</label>
                  <div className="relative w-full">
                    <User size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={`${inputBaseStyle} pl-10 w-full`} placeholder={t('start.namePlaceholder')} disabled={isLoading} />
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="birthDate" className={`block text-xs font-medium text-slate-600 mb-1 ${wordBreakClass}`}>{t('start.birthDate')}</label>
                  <div className="relative w-full">
                    <CalendarDays size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input type="text" id="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value.replace(/[^0-9]/g, ''))} maxLength={8} className={`${inputBaseStyle} pl-10 w-full`} placeholder={t('start.birthDatePlaceholder')} disabled={isLoading} />
                  </div>
                </div>
                <div className="w-full">
                  <label htmlFor="email" className={`block text-xs font-medium text-slate-600 mb-1 ${wordBreakClass}`}>{t('start.email')}</label>
                  <div className="relative w-full">
                    <Mail size={16} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputBaseStyle} pl-10 w-full`} placeholder={t('start.emailPlaceholder')} disabled={isLoading} />
                  </div>
                </div>

                <div className="w-full">
                  <label htmlFor="gender" className={`block text-xs font-medium text-slate-600 mb-1 ${wordBreakClass}`}>{t('start.gender')}</label>
                  <div id="gender" className="grid grid-cols-2 gap-3 w-full">
                    {genderOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSelectedGender(option.value)}
                        className={`${buttonBaseStyle} ${selectedGender === option.value ? buttonSelectedStyle : buttonUnselectedStyle} min-w-0`}
                        disabled={isLoading}
                      >
                        {selectedGender === option.value && <Check size={16} className="mr-1 flex-shrink-0" />}
                        <span className="flex-shrink-0">{option.icon}</span>
                        <span className={`truncate ${wordBreakClass}`}>{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Consent Section */}
            <div className="w-full">
              <h2 className={`text-lg font-semibold text-slate-700 mb-2 flex items-center ${wordBreakClass}`}>
                <FileText size={20} className="mr-2 text-indigo-600 flex-shrink-0" /> {t('start.privacyTitle')}
              </h2>
              <div className="border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto text-xs text-slate-600 bg-slate-50 space-y-2 prose prose-xs prose-slate w-full overflow-x-hidden">
                {locale === 'ko' && (
                  <>
                    <p className="font-semibold break-keep">[개인정보 수집 및 이용 동의서]</p>
                    <p className="break-keep"><strong className="font-medium">수집 항목:</strong> 이름, 생년월일, 이메일 주소, 성별, IP주소, User-Agent</p>
                    <p className="break-keep"><strong className="font-medium">수집 및 이용 목적:</strong> (1) 적성검사 서비스 제공 (개인 맞춤형 검사 결과, 사용자 맞춤형 온라인 서비스) (2) 마케팅 및 서비스 지원 (서비스 안내, 이벤트/프로모션 정보, 맞춤형 광고/마케팅 자료 발송) (3) 연구 및 개발 (품질 향상, 서비스 개선 데이터 분석, 신규 서비스/기능 연구)</p>
                    <p className="break-keep"><strong className="font-medium">보유 및 이용 기간:</strong> 검사 결과 제공 및 서비스 지원/활용: 수집일로부터 5년. 연구 및 결과 활용: 10년. (법령 의무 보관 기간 준수)</p>
                    <p className="break-keep"><strong className="font-medium">제공 및 처리 위탁:</strong> 원칙적 제3자 미제공 (법령 요구, 서비스 운영 위한 외부업체 위탁 시 사전 안내)</p>
                    <p className="break-keep"><strong className="font-medium">법령 준수:</strong> 개인정보 보호법 및 관련 법령 준수.</p>
                    <p className="break-keep"><strong className="font-medium">동의 거부 권리 및 불이익:</strong> 동의 거부 가능. 단, 거부 시 검사 결과 제공 등 서비스 이용 제한될 수 있음.</p>
                    <p className="break-keep"><strong className="font-medium">파기:</strong> 보유기간 만료 또는 목적 달성 후 지체없이 파기 (전자적 파일: 영구삭제, 서면: 분쇄/소각).</p>
                    <p className="break-keep"><strong className="font-medium">문의 및 책임자:</strong> [박에스더] / [02.523.7523] / [admin@aptitude-x.com]</p>
                    <p className="italic break-keep">본 동의서를 충분히 읽고 내용을 확인한 후 동의를 선택해주세요.</p>
                  </>
                )}
                {locale === 'en' && (
                  <>
                    <p className="font-semibold break-words">[Consent to Collect and Use Personal Information]</p>
                    <p className="break-words"><strong className="font-medium">Items Collected:</strong> Name, Date of Birth, Email Address, Gender, IP Address, User-Agent</p>
                    <p className="break-words"><strong className="font-medium">Purpose of Collection and Use:</strong><br />
                      (1) Provision of aptitude test services (personalized test results, customized online services)<br />
                      (2) Marketing and service support (service notifications, event/promotion information, delivery of personalized advertisements and marketing materials)<br />
                      (3) Research and development (quality improvement, service enhancement through data analysis, research on new services and features)</p>
                    <p className="break-words"><strong className="font-medium">Retention and Use Period:</strong><br />
                      For providing test results and service support: 5 years from the date of collection<br />
                      For research and analytical usage: 10 years<br />
                      (Compliant with legally mandated retention periods)</p>
                    <p className="break-words"><strong className="font-medium">Provision to Third Parties & Outsourcing:</strong><br />
                      In principle, personal information is not provided to third parties.<br />
                      However, if required by law or if outsourcing to external service providers is necessary for service operations, prior notice will be given.</p>
                    <p className="break-words"><strong className="font-medium">Compliance with Laws:</strong><br />
                      We comply with the Personal Information Protection Act and all applicable laws and regulations.</p>
                    <p className="break-words"><strong className="font-medium">Right to Refuse Consent and Possible Disadvantages:</strong><br />
                      You may refuse to provide consent.<br />
                      However, refusal may limit your ability to use certain services, including the provision of test results.</p>
                    <p className="break-words"><strong className="font-medium">Destruction of Personal Information:</strong><br />
                      Personal data will be destroyed without delay once the retention period expires or the purpose of use is fulfilled.<br />
                      (Electronic files: permanently deleted; Paper documents: shredded/incinerated)</p>
                    <p className="break-words"><strong className="font-medium">Inquiries & Responsible Person:</strong><br />
                      [Esther Park] /+82-2-523-7523/ [admin@aptitude-x.com]</p>
                    <p className="italic break-words">Please make sure to read this consent form carefully and confirm your agreement before proceeding.</p>
                  </>
                )}
                {locale === 'ja' && (
                  <>
                    <p className="font-semibold break-words">【個人情報の取り扱い・利用目的への同意書】</p>
                    <p className="break-words"><strong className="font-medium">取り扱い項目：</strong>氏名、生年月日、メールアドレス、性別、IPアドレス、ユーザーエージェント</p>
                    <p className="break-words"><strong className="font-medium">取り扱い及び利用目的：</strong><br />
                      (1) 適性検査サービスの提供（個別の検査結果、パーソナライズされたオンラインサービス）<br />
                      (2) マーケティング及びサービスサポート（サービス案内、イベント／プロモーション情報、パーソナライズド広告／マーケティング資料の送付）<br />
                      (3) 研究および開発（品質向上、サービス改善のためのデータ分析、新サービス/機能の研究）</p>
                    <p className="break-words"><strong className="font-medium">保有および利用期間：</strong><br />
                      ・検査結果提供及びサービス支援／活用：取り扱い日から5年間<br />
                      ・研究及び結果活用：10年間<br />
                      （関連法令に基づく法定保存期間を遵守）</p>
                    <p className="break-words"><strong className="font-medium">提供及び処理委託：</strong><br />
                      原則として第三者への提供は行いません（法令に基づく場合、またはサービス運営のため外部業者へ業務委託する場合には事前に案内いたします）。<br />
                      個人情報保護法及び関連法令を遵守します。</p>
                    <p className="break-words"><strong className="font-medium">同意拒否の権利及び不利益：</strong><br />
                      同意は任意です。ただし、同意されない場合、検査結果の提供など一部サービスの利用に制限が生じることがあります。<br />
                      （電子ファイル：完全削除、書面：裁断／焼却）</p>
                    <p className="break-words"><strong className="font-medium">お問い合わせ及び管理責任者：</strong><br />
                      ［パク・エステル］／+82-2-523-7523／［admin@aptitude-x.com］</p>
                    <p className="italic break-words">本同意書の内容を十分にお読みいただき、ご同意の上、次へお進みください。</p>
                  </>
                )}
                {locale === 'vi' && (
                  <>
                    <p className="font-semibold break-words">[Đồng Ý Thu Thập và Sử Dụng Thông Tin Cá Nhân]</p>
                    <p className="break-words"><strong className="font-medium">Thông tin thu thập:</strong> Họ tên, Ngày tháng năm sinh, Địa chỉ email, Giới tính, Địa chỉ IP, User-Agent</p>
                    <p className="break-words"><strong className="font-medium">Mục đích thu thập và sử dụng:</strong><br />
                      (1) Cung cấp dịch vụ kiểm tra năng lực (kết quả kiểm tra cá nhân hóa, dịch vụ trực tuyến tùy chỉnh theo người dùng)<br />
                      (2) Hỗ trợ marketing và dịch vụ (thông báo dịch vụ, thông tin sự kiện/khuyến mãi, gửi tài liệu marketing/quảng cáo phù hợp)<br />
                      (3) Nghiên cứu và phát triển (nâng cao chất lượng, phân tích dữ liệu để cải thiện dịch vụ, nghiên cứu dịch vụ/chức năng mới)</p>
                    <p className="break-words"><strong className="font-medium">Thời gian lưu trữ và sử dụng:</strong><br />
                      Cung cấp kết quả kiểm tra và hỗ trợ dịch vụ: 5 năm kể từ ngày thu thập<br />
                      uNghiên cứu và sử dụng dữ liệu phân tích: 10 năm<br />
                      (Tuân thủ thời hạn lưu trữ bắt buộc theo quy định pháp luật)</p>
                    <p className="break-words"><strong className="font-medium">Cung cấp cho bên thứ ba & Ủy thác xử lý:</strong><br />
                      Theo nguyên tắc, thông tin cá nhân không được cung cấp cho bên thứ ba.<br />
                      Trường hợp pháp luật yêu cầu hoặc cần thiết ủy thác cho đơn vị bên ngoài để vận hành dịch vụ, chúng tôi sẽ thông báo trước.</p>
                    <p className="break-words"><strong className="font-medium">Tuân thủ pháp luật:</strong><br />
                      Chúng tôi tuân thủ Luật Bảo Vệ Thông Tin Cá Nhân và các quy định pháp lý có liên quan.</p>
                    <p className="break-words"><strong className="font-medium">Quyền từ chối và khả năng bị hạn chế:</strong><br />
                      Người dùng có quyền từ chối cung cấp thông tin.<br />
                      Tuy nhiên, việc từ chối có thể dẫn đến hạn chế trong việc sử dụng một số dịch vụ, bao gồm việc cung cấp kết quả kiểm tra.</p>
                    <p className="break-words"><strong className="font-medium">Hủy/Xóa thông tin:</strong><br />
                      Thông tin cá nhân sẽ được hủy/xóa ngay khi hết thời hạn lưu trữ hoặc khi mục đích sử dụng đã hoàn thành.<br />
                      (Tập tin điện tử: xóa vĩnh viễn; Tài liệu giấy: cắt nhỏ/tiêu hủy)</p>
                    <p className="break-words"><strong className="font-medium">Liên hệ & Người phụ trách:</strong><br />
                      [Park Esther] / +82-2-523-7523/ [admin@aptitude-x.com]</p>
                    <p className="italic break-words">Vui lòng đọc kỹ nội dung bản đồng ý này và xác nhận sự đồng ý trước khi tiếp tục.</p>
                  </>
                )}
              </div>
              <div className="mt-3 flex items-center w-full">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  checked={agreedToPrivacy}
                  onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer flex-shrink-0"
                  disabled={isLoading}
                />
                <label htmlFor="privacyConsent" className={`ml-2 block text-sm font-medium text-slate-700 cursor-pointer ${wordBreakClass}`}>
                  {t('start.privacyAgree')}
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 bg-red-50 border border-red-300 rounded-lg p-3 text-center flex items-center justify-center text-sm w-full overflow-hidden">
              <ShieldAlert size={18} className="text-red-500 mr-2 flex-shrink-0" />
              <p className={`text-red-600 font-medium ${wordBreakClass}`}>{error}</p>
            </div>
          )}

          <div className="mt-8 w-full">
            <button
              type="button"
              onClick={handleStartTest}
              disabled={isLoading || !agreedToPrivacy || !name || !birthDate || !email || !selectedGender}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-semibold text-lg transition-all duration-300 ease-in-out transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-opacity-50
              ${isLoading || !agreedToPrivacy || !name || !birthDate || !email || !selectedGender
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed focus:ring-slate-200'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl focus:ring-indigo-300'
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 size={24} className="animate-spin mr-2 flex-shrink-0" />
                  <span className={wordBreakClass}>{t('start.processing')}</span>
                </>
              ) : (
                <>
                  <span className={wordBreakClass}>{t('start.startTest')}</span>
                  <ArrowRight size={22} className="flex-shrink-0" />
                </>
              )}
            </button>
          </div>
        </div>
        <p className={`mt-8 text-xs text-slate-500 text-center ${wordBreakClass} max-w-lg px-4`}>
          {t('result.copyright')}
        </p>
      </div>
    </>
  );
} 