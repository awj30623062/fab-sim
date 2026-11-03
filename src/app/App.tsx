import Home from '../pages/Home.tsx'
import UiKit from '../pages/UiKit.tsx'

function App() {
  // ponytail: 주소를 직접 비교한다. 공정 화면이 생기면 라우터로 교체
  return window.location.pathname.startsWith('/ui-kit') ? <UiKit /> : <Home />
}

export default App
