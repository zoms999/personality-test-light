import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

// PersonalityTypes 데이터
const personalityTypesData = [
  {
    type_code: 'OBSERVER',
    type_name: '관찰형',
    title: '지구와 우주를 꿰뚫어 보는 옵저버, 관찰형',
    theme_sentence: '관찰형인 당신은 눈으로 직접 확인하고 경험한 결과만을 신뢰합니다.',
    description: '당신은 눈에 보이는 자연현상이나 환경, 우주에 관심이 많으며, 자신의 관심분야에 집중합니다.',
    description_points: [
      "당신은 눈에 보이는 자연현상이나 환경, 우주에 관심이 많으며, 자신의 관심분야에 집중합니다.",
      "어떤 현상이나 사물을 주의 깊게 살펴서 객관적으로 파악 하고, 대상의 본질과 원리를 발견해 내는 능력이 있습니다.",
      "당신은 사물이나 환경을 정확하게 파악하고 변화를 포착해 내는 관찰력이 뛰어납니다.",
      "자신이 흥미를 느끼는 대상을 꾸준하게 관찰, 논리적으로 의문점을 해결해가면서 존재감과 성취감을 느끼는 성향입니다.",
      "장기적인 프로젝트나 근성이 필요한 지속적인 작업, 전문분야에서 탁월한 능력을 발휘할 수 있습니다.",
      "당신은 느려서 주변에서 느리다는 말을 많이 듣지만 묵묵하게 목표를 향해 가는 당신은 스피드를 원하는 일보다는 시간이 걸리더라도 완성도 높은 일이 잘 맞습니다.",
      "속내를 잘 드러내지 않는 당신은 관심사가 같거나 공유할 수 있는 사람과만 친하게 지내는 편이라 사회성이 부족하다는 말을 듣기도 합니다.",
      "단기적인 성과보다는 오랜 실험이나 관찰을 필요로 하는 장기적인 성과를 내는 자연, 기상, 우주, 지구, 환경 관련 연구업무에 유리합니다."
    ],
    strength_keywords: ["#관찰의 힘", "#조용히 오래오래 끝까지!", "#자연 속에서 힐링!"],
    weakness_keywords: ["#느려도 괜찮아!"]
  },
  {
    type_code: 'EDUCATOR',
    type_name: '교육형',
    title: '가르치고 이끌어가는 리더, 교육형',
    theme_sentence: '교육형인 당신은 사람들을 가르치고 성장시키는 것에서 큰 보람을 느낍니다.',
    description: '당신은 다른 사람들의 성장과 발전에 관심이 많으며, 지식과 경험을 나누는 것을 좋아합니다.',
    description_points: [
      "모르는 것이 있으면 가르쳐주고 싶은 마음이 강하며 사람을 변화, 발전시키는데 관심이 많습니다.",
      "사람들과의 소통을 중요하게 생각하며, 팀워크를 통해 목표를 달성하는 것을 선호합니다.",
      "체계적이고 논리적인 접근을 통해 문제를 해결하려고 노력합니다.",
      "리더십이 강하며 책임감이 있어 프로젝트를 이끌어가는 역할을 잘 수행합니다.",
      "장기적인 비전을 가지고 계획을 세우며 실행하는 능력이 뛰어납니다.",
      "인내심이 강하고 꾸준함으로 목표를 달성하는 성향입니다.",
      "때로는 완벽주의적 성향으로 인해 스트레스를 받기도 합니다.",
      "교육, 컨설팅, 관리 업무 등에서 탁월한 능력을 발휘할 수 있습니다."
    ],
    strength_keywords: ["#가르치는 즐거움", "#리더십", "#체계적 사고"],
    weakness_keywords: ["#완벽주의", "#과도한 책임감"]
  },
  {
    type_code: 'NORMATIVE',
    type_name: '규범형',
    title: '원칙과 규칙을 중시하는 수호자, 규범형',
    theme_sentence: '규범형인 당신은 정해진 규칙과 원칙을 따르며 질서를 중요하게 생각합니다.',
    description: '당신은 체계와 질서를 중시하며, 안정적이고 예측 가능한 환경에서 최고의 능력을 발휘합니다.',
    description_points: [
      "규칙과 원칙을 중시하며 체계적으로 일을 처리하는 것을 선호합니다.",
      "책임감이 강하고 맡은 일을 끝까지 완수하는 성향입니다.",
      "안정성과 보안을 중요하게 생각하며 변화보다는 지속성을 선호합니다.",
      "세부사항에 주의를 기울이며 정확성을 추구합니다.",
      "팀워크를 중시하며 조화로운 관계를 유지하려고 노력합니다.",
      "전통과 관례를 존중하며 기존의 방식을 개선하는 것을 선호합니다.",
      "때로는 변화에 대한 적응이 어려울 수 있습니다.",
      "행정, 관리, 법무 등의 분야에서 뛰어난 능력을 보입니다."
    ],
    strength_keywords: ["#원칙주의", "#책임감", "#체계성"],
    weakness_keywords: ["#변화 적응 어려움", "#경직성"]
  },
  {
    type_code: 'ARTISTIC',
    type_name: '예술형',
    title: '창의적 영감으로 세상을 아름답게 만드는 아티스트, 예술형',
    theme_sentence: '예술형인 당신은 창의적인 표현을 통해 자신만의 독특한 세계를 만들어갑니다.',
    description: '당신은 예술적 감각이 뛰어나며 창의적인 활동을 통해 자신을 표현하는 것을 좋아합니다.',
    description_points: [
      "뛰어난 예술적 감각과 창의력을 가지고 있습니다.",
      "자유로운 사고와 독창적인 아이디어로 새로운 것을 창조합니다.",
      "감정과 직감을 중시하며 영감을 통해 작업합니다.",
      "아름다움과 조화를 추구하며 미적 감각이 뛰어납니다.",
      "자유로운 환경에서 최고의 창작 능력을 발휘합니다.",
      "개성과 독립성을 중시하며 자신만의 스타일을 추구합니다.",
      "때로는 현실적인 제약에 답답함을 느낄 수 있습니다.",
      "예술, 디자인, 문화 콘텐츠 등의 분야에서 탁월한 재능을 보입니다."
    ],
    strength_keywords: ["#창의력", "#예술적 감각", "#독창성"],
    weakness_keywords: ["#현실성 부족", "#불안정성"]
  },
  {
    type_code: 'SOCIAL',
    type_name: '사회형',
    title: '사람들과 함께 세상을 변화시키는 소셜워커, 사회형',
    theme_sentence: '사회형인 당신은 사람들과의 관계를 통해 사회에 긍정적인 변화를 만들어갑니다.',
    description: '당신은 사회적 이슈에 관심이 많으며 사람들을 도우며 사회를 개선하는 것을 중요하게 생각합니다.',
    description_points: [
      "사회적 문제에 관심이 많고 이를 해결하려는 의지가 강합니다.",
      "사람들과의 소통과 협력을 중시하며 팀워크를 잘 발휘합니다.",
      "공감 능력이 뛰어나며 다른 사람의 입장을 잘 이해합니다.",
      "봉사정신이 강하며 도움이 필요한 사람들을 돕는 것을 보람으로 여깁니다.",
      "정의감이 강하며 공정함을 추구합니다.",
      "사회적 변화를 위해 적극적으로 행동하는 실천력이 있습니다.",
      "때로는 다른 사람의 문제에 과도하게 개입할 수 있습니다.",
      "사회복지, 상담, NGO 등의 분야에서 뛰어난 능력을 발휘합니다."
    ],
    strength_keywords: ["#사회적 책임감", "#공감능력", "#협력정신"],
    weakness_keywords: ["#과도한 개입", "#감정적 소모"]
  },
  {
    type_code: 'ENTERPRISING',
    type_name: '진취형',
    title: '도전과 모험으로 새로운 길을 개척하는 개척자, 진취형',
    theme_sentence: '진취형인 당신은 새로운 도전을 두려워하지 않으며 혁신을 통해 성장합니다.',
    description: '당신은 도전정신이 강하며 새로운 기회를 찾아 적극적으로 행동하는 것을 좋아합니다.',
    description_points: [
      "새로운 도전과 모험을 즐기며 변화를 두려워하지 않습니다.",
      "리더십이 강하며 목표를 달성하기 위해 적극적으로 행동합니다.",
      "경쟁을 즐기며 성과를 중시하는 성향입니다.",
      "위험을 감수하더라도 큰 성공을 추구합니다.",
      "빠른 판단력과 실행력으로 기회를 놓치지 않습니다.",
      "영향력을 행사하는 것을 좋아하며 권한과 지위를 추구합니다.",
      "때로는 성급한 판단으로 실수를 할 수 있습니다.",
      "경영, 영업, 창업 등의 분야에서 탁월한 능력을 보입니다."
    ],
    strength_keywords: ["#도전정신", "#리더십", "#실행력"],
    weakness_keywords: ["#성급함", "#위험성"]
  },
  {
    type_code: 'CONVENTIONAL',
    type_name: '관례형',
    title: '체계적이고 정확한 업무처리의 달인, 관례형',
    theme_sentence: '관례형인 당신은 정확하고 체계적인 방식으로 업무를 완벽하게 처리합니다.',
    description: '당신은 질서와 체계를 중시하며 정확하고 꼼꼼한 업무 처리 능력이 뛰어납니다.',
    description_points: [
      "체계적이고 조직적인 업무 처리를 선호합니다.",
      "정확성과 세밀함을 중시하며 실수를 최소화하려고 노력합니다.",
      "계획을 세우고 단계적으로 진행하는 것을 좋아합니다.",
      "안정적이고 예측 가능한 환경에서 최고의 능력을 발휘합니다.",
      "데이터와 사실에 기반한 의사결정을 선호합니다.",
      "책임감이 강하며 맡은 일을 완벽하게 수행하려고 합니다.",
      "때로는 새로운 방식에 대한 적응이 어려울 수 있습니다.",
      "회계, 관리, 분석 등의 분야에서 뛰어난 능력을 보입니다."
    ],
    strength_keywords: ["#정확성", "#체계성", "#신뢰성"],
    weakness_keywords: ["#융통성 부족", "#변화 거부"]
  },
  {
    type_code: 'REALISTIC',
    type_name: '현실형',
    title: '실용적이고 현실적인 문제해결사, 현실형',
    theme_sentence: '현실형인 당신은 실용적인 접근으로 현실적인 문제를 해결하는데 탁월합니다.',
    description: '당신은 실용성을 중시하며 현실적이고 구체적인 방법으로 문제를 해결하는 것을 선호합니다.',
    description_points: [
      "실용적이고 현실적인 접근을 통해 문제를 해결합니다.",
      "구체적이고 실질적인 결과를 중시합니다.",
      "경험과 사실에 기반한 판단을 선호합니다.",
      "효율성과 생산성을 추구하며 낭비를 싫어합니다.",
      "손으로 직접 만들고 조작하는 작업을 좋아합니다.",
      "독립적으로 일하는 것을 선호하며 자신의 페이스를 유지합니다.",
      "때로는 추상적이거나 이론적인 것에 관심이 부족할 수 있습니다.",
      "기술, 제조, 건설 등의 분야에서 뛰어난 능력을 발휘합니다."
    ],
    strength_keywords: ["#실용성", "#효율성", "#독립성"],
    weakness_keywords: ["#이론 부족", "#경직성"]
  },
  {
    type_code: 'INVESTIGATIVE',
    type_name: '탐구형',
    title: '지적 호기심으로 진리를 탐구하는 연구자, 탐구형',
    theme_sentence: '탐구형인 당신은 끊임없는 호기심으로 새로운 지식과 진리를 탐구합니다.',
    description: '당신은 지적 호기심이 강하며 복잡한 문제를 분석하고 해결하는 것을 즐깁니다.',
    description_points: [
      "강한 지적 호기심으로 새로운 지식을 탐구합니다.",
      "복잡한 문제를 분석하고 해결하는 능력이 뛰어납니다.",
      "논리적이고 체계적인 사고를 통해 결론을 도출합니다.",
      "객관적이고 과학적인 접근을 선호합니다.",
      "독립적으로 연구하고 학습하는 것을 좋아합니다.",
      "완벽주의적 성향으로 정확한 결과를 추구합니다.",
      "때로는 실용적인 적용보다 이론에 치중할 수 있습니다.",
      "연구, 분석, 과학 기술 분야에서 탁월한 능력을 보입니다."
    ],
    strength_keywords: ["#지적 호기심", "#분석력", "#객관성"],
    weakness_keywords: ["#실용성 부족", "#완벽주의"]
  },
  {
    type_code: 'TECHNICAL',
    type_name: '기술형',
    title: '기술과 혁신으로 미래를 만드는 테크니션, 기술형',
    theme_sentence: '기술형인 당신은 최신 기술을 활용하여 혁신적인 솔루션을 만들어냅니다.',
    description: '당신은 기술에 대한 관심이 높으며 기술적 혁신을 통해 문제를 해결하는 것을 좋아합니다.',
    description_points: [
      "최신 기술과 도구에 대한 관심이 매우 높습니다.",
      "기술적 혁신을 통해 효율적인 솔루션을 개발합니다.",
      "복잡한 시스템을 이해하고 개선하는 능력이 뛰어납니다.",
      "논리적이고 체계적인 접근으로 문제를 해결합니다.",
      "지속적인 학습을 통해 기술 역량을 발전시킵니다.",
      "정확성과 품질을 중시하며 세밀한 작업을 잘 수행합니다.",
      "때로는 기술에만 집중하여 사용자 관점을 놓칠 수 있습니다.",
      "IT, 엔지니어링, 기술 개발 분야에서 뛰어난 능력을 발휘합니다."
    ],
    strength_keywords: ["#기술 혁신", "#논리적 사고", "#정확성"],
    weakness_keywords: ["#사용자 관점 부족", "#기술 편중"]
  },
  {
    type_code: 'COMMUNICATION',
    type_name: '소통형',
    title: '대화와 소통으로 사람들을 연결하는 커뮤니케이터, 소통형',
    theme_sentence: '소통형인 당신은 뛰어난 대화 능력으로 사람들 사이의 다리 역할을 합니다.',
    description: '당신은 소통 능력이 뛰어나며 사람들과의 관계를 중시하고 협력을 통해 목표를 달성합니다.',
    description_points: [
      "뛰어난 의사소통 능력으로 사람들과 좋은 관계를 맺습니다.",
      "다양한 관점을 이해하고 중재하는 능력이 뛰어납니다.",
      "팀워크를 중시하며 협력을 통해 시너지를 창출합니다.",
      "공감능력이 높아 다른 사람의 감정을 잘 이해합니다.",
      "유연한 사고로 다양한 상황에 적응합니다.",
      "긍정적인 에너지로 주변 사람들에게 영감을 줍니다.",
      "때로는 갈등 상황에서 스트레스를 많이 받을 수 있습니다.",
      "인사, 마케팅, 상담 등의 분야에서 탁월한 능력을 보입니다."
    ],
    strength_keywords: ["#소통능력", "#공감력", "#협력정신"],
    weakness_keywords: ["#갈등 스트레스", "#우유부단함"]
  },
  {
    type_code: 'CREATIVE',
    type_name: '창작형',
    title: '무한한 상상력으로 새로운 세계를 창조하는 크리에이터, 창작형',
    theme_sentence: '창작형인 당신은 독창적인 아이디어로 새로운 가치를 창조합니다.',
    description: '당신은 창의적 사고가 뛰어나며 새로운 아이디어를 통해 혁신적인 결과물을 만들어냅니다.',
    description_points: [
      "독창적이고 혁신적인 아이디어를 생성하는 능력이 뛰어납니다.",
      "자유로운 사고로 기존의 틀을 벗어난 해결책을 제시합니다.",
      "상상력이 풍부하며 추상적 사고를 잘 합니다.",
      "새로운 것에 대한 호기심이 강하며 변화를 즐깁니다.",
      "직관적이고 영감에 의존하는 경향이 있습니다.",
      "독립적이고 자유로운 환경에서 최고의 능력을 발휘합니다.",
      "때로는 현실적 제약을 간과할 수 있습니다.",
      "창작, 기획, 혁신 등의 분야에서 뛰어난 재능을 보입니다."
    ],
    strength_keywords: ["#창의성", "#혁신", "#상상력"],
    weakness_keywords: ["#현실성 부족", "#집중력 부족"]
  },
  {
    type_code: 'LOGICAL',
    type_name: '논리형',
    title: '논리와 분석으로 복잡한 문제를 해결하는 로지션, 논리형',
    theme_sentence: '논리형인 당신은 체계적인 분석과 논리적 사고로 복잡한 문제를 명쾌하게 해결합니다.',
    description: '당신은 논리적 사고력이 뛰어나며 체계적인 분석을 통해 문제의 본질을 파악하고 해결합니다.',
    description_points: [
      "논리적이고 체계적인 사고로 문제를 분석합니다.",
      "객관적이고 합리적인 판단을 통해 최적의 해결책을 찾습니다.",
      "복잡한 정보를 체계적으로 정리하고 구조화하는 능력이 뛰어납니다.",
      "일관성과 논리성을 중시하며 모순을 찾아내는데 탁월합니다.",
      "데이터와 사실에 기반한 의사결정을 선호합니다.",
      "정확성과 정밀함을 추구하며 완벽한 결과를 원합니다.",
      "때로는 감정적 요소를 간과할 수 있습니다.",
      "분석, 기획, 전략 수립 등의 분야에서 뛰어난 능력을 발휘합니다."
    ],
    strength_keywords: ["#논리적 사고", "#분석력", "#객관성"],
    weakness_keywords: ["#감정 무시", "#경직성"]
  },
  {
    type_code: 'INTUITIVE',
    type_name: '직감형',
    title: '뛰어난 직감으로 미래를 내다보는 인튜이터, 직감형',
    theme_sentence: '직감형인 당신은 날카로운 직감으로 숨겨진 패턴과 가능성을 발견합니다.',
    description: '당신은 직관력이 뛰어나며 미래의 가능성을 내다보고 새로운 기회를 포착하는 능력이 뛰어납니다.',
    description_points: [
      "뛰어난 직감으로 숨겨진 패턴과 연결고리를 발견합니다.",
      "미래의 가능성과 잠재력을 내다보는 능력이 탁월합니다.",
      "빠른 통찰력으로 핵심을 파악하고 본질을 꿰뚫어 봅니다.",
      "창의적이고 혁신적인 아이디어를 생성하는데 뛰어납니다.",
      "변화에 민감하며 트렌드를 빠르게 포착합니다.",
      "유연한 사고로 다양한 관점에서 문제를 바라봅니다.",
      "때로는 논리적 근거가 부족할 수 있습니다.",
      "기획, 전략, 혁신 등의 분야에서 탁월한 능력을 보입니다."
    ],
    strength_keywords: ["#직감력", "#통찰력", "#미래 예측"],
    weakness_keywords: ["#논리 부족", "#근거 부족"]
  },
  {
    type_code: 'DETECTIVE',
    type_name: '추리형',
    title: '예리한 관찰과 추리로 진실을 밝혀내는 디텍티브, 추리형',
    theme_sentence: '추리형인 당신은 세밀한 관찰과 논리적 추리로 숨겨진 진실을 밝혀냅니다.',
    description: '당신은 관찰력과 추리력이 뛰어나며 복잡한 상황에서 핵심을 파악하고 진실을 밝혀내는 능력이 탁월합니다.',
    description_points: [
      "예리한 관찰력으로 남들이 놓치는 세부사항을 포착합니다.",
      "논리적 추리를 통해 복잡한 문제의 해답을 찾아냅니다.",
      "다양한 정보를 종합하여 전체적인 그림을 그려냅니다.",
      "객관적이고 냉정한 판단으로 진실을 추구합니다.",
      "의문점을 끝까지 파고들어 해결하려는 집념이 강합니다.",
      "복잡한 상황에서도 침착함을 유지하며 차근차근 해결합니다.",
      "때로는 의심이 많아 타인을 불신할 수 있습니다.",
      "수사, 분석, 문제해결 등의 분야에서 뛰어난 능력을 발휘합니다."
    ],
    strength_keywords: ["#관찰력", "#추리력", "#진실 추구"],
    weakness_keywords: ["#의심 많음", "#불신"]
  }
];

// Questions 데이터 함수
const createQuestionsData = (personalityTypeIds: { [key: string]: string }) => [
  // 관찰형 질문
  {
    personality_type_id: personalityTypeIds['관찰형'],
    question_text: '기계에 별로 관심이 없고, 자연, 기상, 천문현상에 관심이 많다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['관찰형'],
    question_text: '관찰력이 매우 좋다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['관찰형'],
    question_text: '말이 거의 없어 말수가 적다',
    question_order_in_type: 3
  },
  // 교육형 질문
  {
    personality_type_id: personalityTypeIds['교육형'],
    question_text: '모르는게 있으면 가르쳐주고 싶은 마음이 강하며 사람을 변화, 발전시키는데 관심이 많다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['교육형'],
    question_text: '리더십이 강하고 계획을 세워 체계적으로 일을 추진한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['교육형'],
    question_text: '다른 사람들과 소통하고 협력하는 것을 중요하게 생각한다',
    question_order_in_type: 3
  },
  // 규범형 질문
  {
    personality_type_id: personalityTypeIds['규범형'],
    question_text: '규칙과 원칙을 중시하며 정해진 절차에 따라 일을 처리한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['규범형'],
    question_text: '책임감이 강하고 맡은 일을 끝까지 완수한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['규범형'],
    question_text: '안정성과 보안을 중요하게 생각한다',
    question_order_in_type: 3
  },
  // 예술형 질문
  {
    personality_type_id: personalityTypeIds['예술형'],
    question_text: '창의적인 아이디어로 새로운 것을 만들어내는 것을 좋아한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['예술형'],
    question_text: '아름다움과 조화를 추구하며 미적 감각이 뛰어나다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['예술형'],
    question_text: '자유로운 환경에서 일하는 것을 선호한다',
    question_order_in_type: 3
  },
  // 사회형 질문
  {
    personality_type_id: personalityTypeIds['사회형'],
    question_text: '사회적 문제에 관심이 많고 이를 해결하려고 노력한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['사회형'],
    question_text: '다른 사람을 돕는 것에서 보람을 느낀다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['사회형'],
    question_text: '공감 능력이 뛰어나며 타인의 입장을 잘 이해한다',
    question_order_in_type: 3
  },
  // 진취형 질문
  {
    personality_type_id: personalityTypeIds['진취형'],
    question_text: '새로운 도전과 모험을 즐기며 변화를 두려워하지 않는다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['진취형'],
    question_text: '경쟁을 즐기며 성과를 중시한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['진취형'],
    question_text: '빠른 판단력과 실행력으로 기회를 잡는다',
    question_order_in_type: 3
  },
  // 관례형 질문
  {
    personality_type_id: personalityTypeIds['관례형'],
    question_text: '체계적이고 조직적으로 업무를 처리한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['관례형'],
    question_text: '정확성과 세밀함을 중시하며 실수를 최소화하려고 한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['관례형'],
    question_text: '계획을 세우고 단계적으로 진행하는 것을 좋아한다',
    question_order_in_type: 3
  },
  // 현실형 질문
  {
    personality_type_id: personalityTypeIds['현실형'],
    question_text: '실용적이고 현실적인 방법으로 문제를 해결한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['현실형'],
    question_text: '손으로 직접 만들고 조작하는 작업을 좋아한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['현실형'],
    question_text: '효율성과 생산성을 추구한다',
    question_order_in_type: 3
  },
  // 탐구형 질문
  {
    personality_type_id: personalityTypeIds['탐구형'],
    question_text: '지적 호기심이 강하며 새로운 지식을 탐구하는 것을 좋아한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['탐구형'],
    question_text: '복잡한 문제를 분석하고 해결하는 능력이 뛰어나다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['탐구형'],
    question_text: '객관적이고 과학적인 접근을 선호한다',
    question_order_in_type: 3
  },
  // 기술형 질문
  {
    personality_type_id: personalityTypeIds['기술형'],
    question_text: '최신 기술과 도구에 대한 관심이 매우 높다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['기술형'],
    question_text: '복잡한 시스템을 이해하고 개선하는 능력이 뛰어나다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['기술형'],
    question_text: '정확성과 품질을 중시하며 세밀한 작업을 잘 수행한다',
    question_order_in_type: 3
  },
  // 소통형 질문
  {
    personality_type_id: personalityTypeIds['소통형'],
    question_text: '뛰어난 의사소통 능력으로 사람들과 좋은 관계를 맺는다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['소통형'],
    question_text: '팀워크를 중시하며 협력을 통해 시너지를 창출한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['소통형'],
    question_text: '다양한 관점을 이해하고 중재하는 능력이 뛰어나다',
    question_order_in_type: 3
  },
  // 창작형 질문
  {
    personality_type_id: personalityTypeIds['창작형'],
    question_text: '독창적이고 혁신적인 아이디어를 생성하는 능력이 뛰어나다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['창작형'],
    question_text: '자유로운 사고로 기존의 틀을 벗어난 해결책을 제시한다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['창작형'],
    question_text: '상상력이 풍부하며 추상적 사고를 잘 한다',
    question_order_in_type: 3
  },
  // 논리형 질문
  {
    personality_type_id: personalityTypeIds['논리형'],
    question_text: '논리적이고 체계적인 사고로 문제를 분석한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['논리형'],
    question_text: '객관적이고 합리적인 판단을 통해 최적의 해결책을 찾는다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['논리형'],
    question_text: '데이터와 사실에 기반한 의사결정을 선호한다',
    question_order_in_type: 3
  },
  // 직감형 질문
  {
    personality_type_id: personalityTypeIds['직감형'],
    question_text: '뛰어난 직감으로 숨겨진 패턴과 연결고리를 발견한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['직감형'],
    question_text: '미래의 가능성과 잠재력을 내다보는 능력이 탁월하다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['직감형'],
    question_text: '빠른 통찰력으로 핵심을 파악하고 본질을 꿰뚫어 본다',
    question_order_in_type: 3
  },
  // 추리형 질문
  {
    personality_type_id: personalityTypeIds['추리형'],
    question_text: '예리한 관찰력으로 남들이 놓치는 세부사항을 포착한다',
    question_order_in_type: 1
  },
  {
    personality_type_id: personalityTypeIds['추리형'],
    question_text: '논리적 추리를 통해 복잡한 문제의 해답을 찾아낸다',
    question_order_in_type: 2
  },
  {
    personality_type_id: personalityTypeIds['추리형'],
    question_text: '의문점을 끝까지 파고들어 해결하려는 집념이 강하다',
    question_order_in_type: 3
  }
];

async function main() {
  try {
    console.log('🌱 데이터베이스 시딩을 시작합니다...');

    // 기존 데이터 삭제 (개발 환경에서만)
    console.log('📝 기존 데이터를 삭제합니다...');
    await prisma.questions.deleteMany();
    await prisma.personalityTypes.deleteMany();

    // PersonalityTypes 생성
    console.log('🎯 성향 유형 데이터를 생성합니다...');
    const createdPersonalityTypes = [];
    
    for (const typeData of personalityTypesData) {
      const personalityType = await prisma.personalityTypes.create({
        data: typeData
      });
      createdPersonalityTypes.push(personalityType);
      console.log(`✅ 생성됨: ${personalityType.type_name} (${personalityType.type_code})`);
    }

    // PersonalityTypes ID 매핑 생성
    const personalityTypeIds: { [key: string]: string } = {};
    createdPersonalityTypes.forEach(type => {
      personalityTypeIds[type.type_name] = type.id;
    });

    // Questions 생성
    console.log('❓ 질문 데이터를 생성합니다...');
    const questionsData = createQuestionsData(personalityTypeIds);
    
    for (const questionData of questionsData) {
      const question = await prisma.questions.create({
        data: questionData
      });
      console.log(`✅ 질문 생성됨: ${question.question_text.substring(0, 50)}...`);
    }

    console.log('🎉 데이터베이스 시딩이 완료되었습니다!');
    console.log(`📊 생성된 데이터: PersonalityTypes ${createdPersonalityTypes.length}개, Questions ${questionsData.length}개`);

  } catch (error) {
    console.error('❌ 시딩 중 오류가 발생했습니다:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 