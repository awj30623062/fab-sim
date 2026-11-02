// 글래스 테마 디자인 토큰. src/index.css가 @config로 읽어 Tailwind 클래스가 된다.
// 예: color.emerald → text-emerald, bg-emerald
export const color = {
  transparent: 'transparent',
  canvas: '#0B1212', // 배경
  body: '#E8F0EE', // 본문 글자
  muted: '#9BB0AB', // 보조 글자
  emerald: '#34D399', // 메인 포인트: 활성 탭, 주요 버튼, 글로우
  cyan: '#22D3EE', // 보조
  amber: '#FBBF24', // TEOS·실험 변수 강조
  violet: '#A78BFA', // 플라즈마·RF
  red: '#F87171', // 경고
  'glass-border': 'rgba(255, 255, 255, 0.09)', // 패널 테두리
}

export default {
  theme: {
    colors: color, // extend가 아니므로 Tailwind 기본 색은 쓸 수 없다
    extend: {
      fontFamily: {
        sans: ['"Noto Sans KR"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Noto Sans KR"', 'sans-serif'],
      },
      backgroundImage: {
        'canvas-glow':
          'radial-gradient(ellipse 70% 55% at 50% 38%, #123A31 0%, #0D1D1A 45%, #0B1212 75%)',
        glass:
          'linear-gradient(160deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04))',
      },
      boxShadow: {
        glass: '0 20px 40px rgba(0, 0, 0, 0.35)',
      },
    },
  },
}
