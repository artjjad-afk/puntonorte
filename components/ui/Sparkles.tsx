'use client'

// Destellos de luz (dorado/cobre) que titilan. Posiciones fijas para no
// causar mismatch de hidratación. Puramente CSS → muy ligero.
type Spark = { top: string; left: string; size: number; delay: number; dur: number }

const SPARKS: Spark[] = [
  { top: '6%',  left: '4%',  size: 8,  delay: 0,   dur: 3.2 },
  { top: '14%', left: '48%', size: 5,  delay: 1.1, dur: 2.6 },
  { top: '9%',  left: '92%', size: 7,  delay: 0.6, dur: 3.6 },
  { top: '30%', left: '2%',  size: 6,  delay: 1.8, dur: 3.0 },
  { top: '26%', left: '70%', size: 9,  delay: 0.3, dur: 4.0 },
  { top: '44%', left: '96%', size: 5,  delay: 2.2, dur: 2.8 },
  { top: '52%', left: '38%', size: 7,  delay: 1.4, dur: 3.4 },
  { top: '60%', left: '8%',  size: 6,  delay: 0.9, dur: 3.1 },
  { top: '68%', left: '88%', size: 8,  delay: 2.6, dur: 3.7 },
  { top: '78%', left: '54%', size: 5,  delay: 0.5, dur: 2.9 },
  { top: '84%', left: '18%', size: 7,  delay: 1.7, dur: 3.3 },
  { top: '90%', left: '78%', size: 6,  delay: 2.0, dur: 3.5 },
  { top: '40%', left: '24%', size: 5,  delay: 3.0, dur: 3.0 },
  { top: '72%', left: '32%', size: 6,  delay: 1.2, dur: 2.7 },
]

export function Sparkles() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {SPARKS.map((s, i) => (
        <span
          key={i}
          className="pn-spark"
          style={{
            top: s.top, left: s.left, width: `${s.size}px`, height: `${s.size}px`,
            animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  )
}
