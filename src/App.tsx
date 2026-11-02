function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-canvas-glow px-4 py-12 font-sans break-keep text-body">
      <h1 className="font-display text-5xl font-bold tracking-tight">
        FAB <span className="text-emerald">SIM</span>
      </h1>
      <section className="w-full max-w-xl rounded-3xl border border-glass-border bg-glass p-8 text-center shadow-glass backdrop-blur-lg">
        <h2 className="text-xl font-bold">반도체 8대 공정 시뮬레이터</h2>
        <p className="mt-3 leading-relaxed text-balance text-muted">
          장비가 어떻게 움직이는지 보고, 레시피를 넣으면 결과가 어떻게
          달라지는지 확인해요.
        </p>
      </section>
    </main>
  )
}

export default App
