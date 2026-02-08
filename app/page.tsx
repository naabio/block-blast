import Image from "next/image"

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0a0e1a] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-cyan-400">
          Game Preview
        </h1>
        <p className="text-center text-gray-400 mb-10">
          Hyper-Casual Arcade Survival Game - 3 Screens
        </p>

        <div className="flex flex-col gap-10">
          {/* Start Screen */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-cyan-300">
              1. Start Screen
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Dark background, PLAY button, minimal clean UI
            </p>
            <div className="rounded-xl overflow-hidden border border-cyan-900/50">
              <Image
                src="/preview-start-screen.jpg"
                alt="Game start screen preview showing a play button on dark background"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </section>

          {/* Gameplay Screen */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-cyan-300">
              2. Gameplay Screen
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Player at center, enemies from all edges, score at top
            </p>
            <div className="rounded-xl overflow-hidden border border-cyan-900/50">
              <Image
                src="/preview-gameplay-screen.jpg"
                alt="Gameplay screen showing player in center with enemies approaching from edges"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </section>

          {/* Game Over Screen */}
          <section>
            <h2 className="text-xl font-semibold mb-3 text-cyan-300">
              3. Game Over Screen
            </h2>
            <p className="text-sm text-gray-400 mb-3">
              Final score, RESTART button, original ending design
            </p>
            <div className="rounded-xl overflow-hidden border border-cyan-900/50">
              <Image
                src="/preview-gameover-screen.jpg"
                alt="Game over screen showing final score and restart button"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </section>
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          This is a concept preview. The actual game will be interactive and playable.
        </div>
      </div>
    </main>
  )
}
