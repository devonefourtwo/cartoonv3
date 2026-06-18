'use client'
import { useEffect, useRef, useState } from 'react'
import type { GeneratedFilm, GenScene, MusicMood } from '@/lib/generator'
import { BackgroundSvg } from './BackgroundSvg'
import { CharacterSvg }  from './CharacterSvg'

interface Props {
  film:     GeneratedFilm
  onDone?:  () => void
  onWatch?: () => void
}

// ── Audio constants (same as FilmPlayer) ─────────────────────────────────────
const SCALES: Record<MusicMood, number[]> = {
  peaceful:   [261,294,330,349,392,440],
  adventure:  [261,294,330,392,440,523],
  mystery:    [261,277,311,349,370,415],
  tense:      [261,277,293,329,349,391],
  wonder:     [261,294,329,392,440,494],
  triumphant: [261,329,392,440,523,659],
}
const TEMPO: Record<MusicMood, number> = {
  peaceful:.9, adventure:.45, mystery:.75, tense:.3, wonder:.6, triumphant:.4,
}
const VOICE_PITCH: Record<string, number> = {
  hero:.85, heroine:1.45, wizard:.55, villain:.40, animal:1.75, robot:.65,
}

function scheduleNote(ctx: AudioContext, gain: GainNode, freq: number, t: number, dur: number) {
  try {
    const osc = ctx.createOscillator()
    const v   = ctx.createGain()
    osc.type = 'sine'; osc.frequency.value = freq
    v.gain.setValueAtTime(0, t)
    v.gain.linearRampToValueAtTime(0.28, t + 0.03)
    v.gain.linearRampToValueAtTime(0.18, t + dur * 0.6)
    v.gain.linearRampToValueAtTime(0,    t + dur)
    osc.connect(v); v.connect(gain)
    osc.start(t); osc.stop(t + dur + 0.01)
  } catch {}
}

function scheduleVoiceTones(ctx: AudioContext, gain: GainNode, text: string, pitch: number, startT: number) {
  const syllables = Math.max(2, Math.min(Math.ceil(text.length / 3.5), 22))
  for (let i = 0; i < syllables; i++) {
    const t    = startT + i * 0.11
    const freq = Math.max(80, pitch * 190 + (i % 4) * 22 - (i % 3) * 12)
    scheduleNote(ctx, gain, freq, t, 0.09)
  }
}

// ── SceneFrame — renders one scene for capture ───────────────────────────────
function SceneFrame({ scene, film }: { scene: GenScene; film: GeneratedFilm }) {
  const charMap = Object.fromEntries(film.characters.map(c => [c.id, c]))
  const XPOS: Record<string,string> = {
    'far-left':'8%','left':'23%','center':'50%','right':'77%','far-right':'92%',
  }
  const HPCT: Record<string,string> = { small:'34%', medium:'52%', large:'68%' }
  const depthRank: Record<string,number> = { small:0, medium:1, large:2 }
  const sorted = [...scene.placements].sort((a,b)=>depthRank[a.size]-depthRank[b.size])

  const letterMatch = scene.title.match(/^([A-Z]) is for (.+)$/)
  const COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#8B5CF6','#14B8A6']
  const letterColor = letterMatch
    ? COLORS[(letterMatch[1].charCodeAt(0) - 65) % COLORS.length]
    : null

  const dlg = scene.dialogue[0]
  const speaker = dlg ? charMap[dlg.characterId] : null

  return (
    <div style={{ width:1280, height:720, position:'relative', overflow:'hidden', background:'#111' }}>
      {/* Background */}
      <div style={{ position:'absolute', inset:0 }}>
        <BackgroundSvg theme={scene.background} width="100%" height="115%"/>
      </div>

      {/* Ground gradient */}
      <div style={{ position:'absolute', inset:0,
        background:'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 35%)',
        pointerEvents:'none' }}/>

      {/* Characters */}
      {sorted.map(pl => {
        const char = charMap[pl.characterId]; if (!char) return null
        return (
          <div key={char.id} style={{
            position:'absolute', bottom:0,
            left: XPOS[pl.position] ?? '50%',
            transform: 'translateX(-50%)',
            height: HPCT[pl.size] ?? '52%',
            display:'flex', flexDirection:'column', alignItems:'center',
            filter: pl.size==='small' ? 'blur(1px) saturate(0.8)' : undefined,
          }}>
            <CharacterSvg
              template={char.template}
              primaryColor={char.primaryColor}
              secondaryColor={char.secondaryColor}
              emotion={dlg?.characterId===char.id ? dlg.emotion : 'neutral'}
              facing={pl.facing}
              width="auto" height="100%"
              style={{ filter:`drop-shadow(0 20px 40px rgba(0,0,0,${pl.size==='large'?0.55:0.3}))` } as React.CSSProperties}
              className="flex-1 min-h-0"
            />
          </div>
        )
      })}

      {/* Alphabet card */}
      {letterMatch && letterColor && (
        <div style={{
          position:'absolute', left:40, top:'50%', transform:'translateY(-50%)',
          background:'rgba(255,255,255,0.96)', borderRadius:24,
          overflow:'hidden', boxShadow:'0 24px 60px rgba(0,0,0,0.4)',
        }}>
          <div style={{ height:10, background:letterColor }}/>
          <div style={{ padding:'24px 40px', textAlign:'center' }}>
            <div style={{ fontSize:150, fontWeight:900, lineHeight:1, color:letterColor,
              fontFamily:'Georgia,serif' }}>{letterMatch[1]}</div>
            <div style={{ fontSize:80, fontWeight:700, lineHeight:1, color:letterColor+'99',
              fontFamily:'Georgia,serif', marginTop:4 }}>{letterMatch[1].toLowerCase()}</div>
            <div style={{ height:3, background:letterColor, opacity:0.2, margin:'16px 0' }}/>
            <div style={{ fontSize:28, fontWeight:700, color:'#1F2937' }}>{letterMatch[2]}</div>
            <div style={{ fontSize:18, color:'#9CA3AF', marginTop:4 }}>
              {letterMatch[1]} is for {letterMatch[2]}
            </div>
          </div>
          <div style={{ height:8, background:letterColor }}/>
        </div>
      )}

      {/* Dialogue bubble */}
      {dlg && speaker && (
        <div style={{
          position:'absolute', bottom:90, left:'50%', transform:'translateX(-50%)',
          background:'rgba(255,255,255,0.96)', borderRadius:20,
          padding:'12px 24px', maxWidth:700, textAlign:'center',
          boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
        }}>
          <span style={{ fontWeight:700, color:'#6366F1', marginRight:6 }}>{speaker.name}:</span>
          <span style={{ color:'#1F2937', fontSize:20 }}>{dlg.text}</span>
        </div>
      )}

      {/* Subtitle bar */}
      {dlg && speaker && (
        <div style={{
          position:'absolute', bottom:0, left:0, right:0,
          background:'rgba(0,0,0,0.8)', padding:'12px 32px',
        }}>
          <span style={{ color:'#818cf8', fontWeight:700, fontSize:20, marginRight:8 }}>{speaker.name}:</span>
          <span style={{ color:'white', fontSize:20 }}>{dlg.text}</span>
        </div>
      )}

      {/* Vignette */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background:'radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(0,0,0,0.6) 100%)',
      }}/>

      {/* Letterbox */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'6%', background:'#000' }}/>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'6%', background:'#000' }}/>
    </div>
  )
}

// ── Main AutoRecorder ─────────────────────────────────────────────────────────
export function AutoRecorder({ film, onDone, onWatch }: Props) {
  const [pct,    setPct]    = useState(0)
  const [status, setStatus] = useState('Preparing your cartoon…')
  const [done,   setDone]   = useState(false)
  const [blob,   setBlob]   = useState<Blob | null>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const sceneIdx = useRef(0)

  useEffect(() => {
    record()
  }, [])

  async function record() {
    const scenes = film.scenes
    const total  = scenes.reduce((s, sc) => s + sc.duration, 0)

    // ── 1. Pre-schedule ALL audio upfront ───────────────────────────
    setStatus('Preparing audio…')
    const audioCtx = new AudioContext()
    await audioCtx.resume()

    const masterGain = audioCtx.createGain()
    masterGain.gain.value = 0.08
    const dest = audioCtx.createMediaStreamDestination()
    masterGain.connect(audioCtx.destination)
    masterGain.connect(dest)

    let timeOffset = audioCtx.currentTime + 0.3
    for (const sc of scenes) {
      const dur    = sc.duration / 1000
      const scale  = SCALES[sc.musicMood]
      const tempo  = TEMPO[sc.musicMood]
      const nNotes = Math.ceil(dur / tempo) + 1

      // Music notes
      for (let n = 0; n < nNotes; n++) {
        const t = timeOffset + n * tempo
        if (t > timeOffset + dur + 0.5) break
        scheduleNote(audioCtx, masterGain, scale[n % scale.length], t, tempo * 0.78)
      }

      // Voice tones per dialogue line
      const charMap = Object.fromEntries(film.characters.map(c => [c.id, c]))
      const dlgInterval = dur / Math.max(sc.dialogue.length, 1)
      sc.dialogue.forEach((line, i) => {
        const pitch = VOICE_PITCH[charMap[line.characterId]?.template ?? 'hero'] ?? 1
        scheduleVoiceTones(audioCtx, masterGain, line.text, pitch, timeOffset + i * dlgInterval + 0.1)
      })

      timeOffset += dur
    }

    // ── 2. Set up canvas + MediaRecorder ────────────────────────────
    setStatus('Setting up recorder…')
    const canvas  = document.createElement('canvas')
    canvas.width  = 1280
    canvas.height = 720
    const ctx2d   = canvas.getContext('2d')!

    const videoStream = canvas.captureStream(12) // 12fps cartoon-style
    const audioStream = dest.stream
    const combined    = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...audioStream.getAudioTracks(),
    ])

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm'
    const recorder = new MediaRecorder(combined, {
      mimeType,
      videoBitsPerSecond: 6_000_000,
    })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = e => e.data.size > 0 && chunks.push(e.data)
    recorder.onstop = () => {
      const b = new Blob(chunks, { type: 'video/webm' })
      setBlob(b)
      setDone(true)
      setStatus('Done! Downloading…')
      // Auto-trigger download
      const url = URL.createObjectURL(b)
      const a   = document.createElement('a')
      a.href     = url
      a.download = `${film.title.replace(/[^a-zA-Z0-9]/g, '-')}.webm`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }

    recorder.start()

    // ── 3. Render each scene frame by frame using html-to-image ─────
    let elapsed = 0
    const FPS   = 12
    const { toPng } = await import('html-to-image')

    for (let si = 0; si < scenes.length; si++) {
      const sc     = scenes[si]
      sceneIdx.current = si
      const frames = Math.round((sc.duration / 1000) * FPS)

      setStatus(`Rendering scene ${si + 1} of ${scenes.length}: ${sc.title}`)

      // Wait for React to render the new scene
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
      await new Promise(r => setTimeout(r, 60))

      // Capture a high-quality frame using html-to-image
      let frameImg: HTMLImageElement | null = null
      const sceneEl = frameRef.current
      if (sceneEl) {
        try {
          const dataUrl = await toPng(sceneEl, {
            width: 1280, height: 720,
            style: { transform: 'none' },
            skipFonts: true,
          })
          frameImg = new Image()
          await new Promise<void>((res, rej) => {
            frameImg!.onload = () => res()
            frameImg!.onerror = () => rej()
            frameImg!.src = dataUrl
          })
        } catch (e) {
          console.warn('Frame capture failed for scene', si, e)
        }
      }

      // Write this frame N times to fill the scene duration
      for (let f = 0; f < frames; f++) {
        ctx2d.clearRect(0, 0, 1280, 720)
        if (frameImg) {
          ctx2d.drawImage(frameImg, 0, 0, 1280, 720)
        } else {
          // Fallback solid colour
          ctx2d.fillStyle = '#1a1040'
          ctx2d.fillRect(0, 0, 1280, 720)
          ctx2d.fillStyle = 'white'
          ctx2d.font = 'bold 48px sans-serif'
          ctx2d.textAlign = 'center'
          ctx2d.fillText(sc.title, 640, 360)
        }
        await new Promise(r => setTimeout(r, 1000 / FPS))
      }

      elapsed += sc.duration
      setPct(Math.round((elapsed / total) * 100))
    }

    recorder.stop()
  }

  const currentScene = film.scenes[sceneIdx.current]

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
      {/* Hidden scene renderer — used for html-to-image capture */}
      <div ref={frameRef} style={{
        position: 'fixed', top: -9999, left: -9999,
        width: 1280, height: 720, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {currentScene && <SceneFrame scene={currentScene} film={film}/>}
      </div>

      {/* Progress UI */}
      {!done ? (
        <div className="w-full max-w-lg text-center">
          <div className="text-5xl mb-6 animate-pulse">🎬</div>
          <h1 className="text-white text-2xl font-bold mb-2">{film.title}</h1>
          <p className="text-white/50 text-sm mb-8">{status}</p>

          {/* Progress bar */}
          <div className="bg-white/10 rounded-full h-3 overflow-hidden mb-3">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-white/40 text-sm">{pct}% — do not close this tab</p>

          {/* Scene preview chips */}
          <div className="flex flex-wrap gap-1.5 justify-center mt-8">
            {film.scenes.map((sc, i) => (
              <div key={sc.sceneNumber}
                className={`text-xs px-2 py-1 rounded-full transition-all ${
                  i < sceneIdx.current
                    ? 'bg-indigo-600 text-white'
                    : i === sceneIdx.current
                    ? 'bg-indigo-400 text-white animate-pulse'
                    : 'bg-white/10 text-white/30'
                }`}>
                {sc.sceneNumber}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-white text-3xl font-bold mb-3">Your cartoon is downloading!</h1>
          <p className="text-white/60 mb-8">
            The file should appear in your Downloads folder as a <code className="text-indigo-400">.webm</code> file.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {blob && (
              <button
                onClick={() => {
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${film.title.replace(/[^a-zA-Z0-9]/g, '-')}.webm`
                  a.click()
                }}
                className="bg-green-600 hover:bg-green-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
              >
                ⬇ Download again
              </button>
            )}
            <button
              onClick={onWatch}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
            >
              ▶ Watch in player
            </button>
            <a href="/"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-6 py-3 rounded-xl transition-colors">
              🎬 Make another film
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
