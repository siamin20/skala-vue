// KBO 9개 구장의 고정 정보. 날씨처럼 바뀌는 값이 아니라서 따로 모아 둔다.
// id 는 라우터 동적 경로(/weather/:cityId)로 넘길 값이다.
// color 는 구단 대표색. 잠실은 LG·두산이 함께 써서 색이 두 개다.
export const stadiumList = [
  // prettier-ignore
  { id: 'seoul',    name: '서울', stadium: '잠실야구장',       team: 'LG · 두산', emoji: '🐻', isDome: false, opened: 1982, seats: 23750, color: '#C30452', color2: '#131230' },
  // prettier-ignore
  { id: 'gocheok',  name: '고척', stadium: '고척스카이돔',     team: '키움',      emoji: '🦸', isDome: true,  opened: 2015, seats: 16000, color: '#570514' },
  // prettier-ignore
  { id: 'incheon',  name: '인천', stadium: 'SSG랜더스필드',    team: 'SSG',       emoji: '🛬', isDome: false, opened: 2002, seats: 23000, color: '#CE0E2D' },
  // prettier-ignore
  { id: 'suwon',    name: '수원', stadium: '수원KT위즈파크',   team: 'KT',        emoji: '🧙', isDome: false, opened: 1989, seats: 18700, color: '#000000' },
  // prettier-ignore
  { id: 'daejeon',  name: '대전', stadium: '한화생명볼파크',   team: '한화',      emoji: '🦅', isDome: false, opened: 2025, seats: 20007, color: '#FF6600' },
  // prettier-ignore
  { id: 'daegu',    name: '대구', stadium: '삼성라이온즈파크', team: '삼성',      emoji: '🦁', isDome: false, opened: 2016, seats: 24000, color: '#074CA1' },
  // prettier-ignore
  { id: 'busan',    name: '부산', stadium: '사직야구장',       team: '롯데',      emoji: '🌊', isDome: false, opened: 1985, seats: 22758, color: '#041E42' },
  // prettier-ignore
  { id: 'gwangju',  name: '광주', stadium: '챔피언스필드',     team: 'KIA',       emoji: '🐯', isDome: false, opened: 2014, seats: 20500, color: '#EA0029' },
  // prettier-ignore
  { id: 'changwon', name: '창원', stadium: '창원NC파크',       team: 'NC',        emoji: '🦕', isDome: false, opened: 2019, seats: 22112, color: '#315288' },
]
