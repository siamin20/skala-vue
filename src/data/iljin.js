// 생년월일로 일진(日辰)을 구한다.
// 일진은 60갑자가 하루에 하나씩 순서대로 돌아가므로, 기준일로부터 며칠 지났는지만 세면 된다.
// (년주·월주는 절기 보정이 필요하지만 일주는 날짜 계산만으로 나온다)
const GAN = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계']
const JI = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해']
const GAN_HANJA = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
const JI_HANJA = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 기준일 1900년 1월 1일은 갑술(甲戌)일이다.
const BASE = Date.UTC(1900, 0, 1)
const ONE_DAY = 86400000

// '2003-10-02' 같은 문자열을 받아 일진 정보를 돌려준다
export const getIljin = (dateText) => {
  const parts = dateText.split('-')
  const target = Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  const days = Math.floor((target - BASE) / ONE_DAY)

  const gan = ((days % 10) + 10) % 10
  const ji = (((days + 10) % 12) + 12) % 12

  return {
    gan: gan,
    ji: ji,
    name: GAN[gan] + JI[ji],
    hanja: GAN_HANJA[gan] + JI_HANJA[ji],
  }
}
