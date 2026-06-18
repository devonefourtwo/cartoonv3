'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { GeneratedFilm, GenScene, MusicMood } from '@/lib/generator'
import { BackgroundSvg } from './BackgroundSvg'
import { CharacterSvg }  from './CharacterSvg'

// ─── Web Audio music engine ───────────────────────────────────────────────────
const SCALES: Record<MusicMood, number[]> = {
  peaceful:   [261,294,330,349,392,440],
  adventure:  [261,294,330,392,440,523],
  mystery:    [261,277,311,349,370,415],
  tense:      [261,277,293,329,349,391],
  wonder:     [261,294,329,392,440,494],
  triumphant: [261,329,392,440,523,659],
}
const TEMPO: Record<MusicMood,number> = {
  peaceful:.9,adventure:.45,mystery:.75,tense:.3,wonder:.6,triumphant:.4
}
class MusicEngine {
  private ctx:AudioContext|null=null
  private gain:GainNode|null=null
  private dest:MediaStreamAudioDestinationNode|null=null
  private timer:ReturnType<typeof setTimeout>|null=null
  private mood:MusicMood='peaceful'
  private noteIdx=0
  private active=false
  private noteIdx2=0

  start(mood:MusicMood) {
    if(typeof window==='undefined')return
    this.mood=mood; this.active=true; this.noteIdx=0
    this.ctx=new AudioContext()
    this.gain=this.ctx.createGain()
    this.gain.gain.value=0.07
    this.dest=this.ctx.createMediaStreamDestination()
    this.gain.connect(this.ctx.destination)
    this.gain.connect(this.dest)
    this.tick()
  }
  setMood(m:MusicMood){this.mood=m}
  stream(){return this.dest?.stream??null}
  private tick(){
    if(!this.active||!this.ctx||!this.gain)return
    const notes=SCALES[this.mood]
    const freq=notes[this.noteIdx%notes.length]; this.noteIdx++
    try {
      const osc=this.ctx.createOscillator()
      const v=this.ctx.createGain()
      osc.type='sine'; osc.frequency.value=freq
      v.gain.setValueAtTime(0,this.ctx.currentTime)
      v.gain.linearRampToValueAtTime(0.35,this.ctx.currentTime+0.04)
      v.gain.linearRampToValueAtTime(0,this.ctx.currentTime+TEMPO[this.mood]*0.85)
      osc.connect(v); v.connect(this.gain)
      osc.start(); osc.stop(this.ctx.currentTime+TEMPO[this.mood])
    } catch{}
    this.timer=setTimeout(()=>this.tick(),TEMPO[this.mood]*1000)
  }
  stop(){
    this.active=false
    if(this.timer)clearTimeout(this.timer)
    try{this.ctx?.close()}catch{}
    this.ctx=null;this.gain=null;this.dest=null
  }
}

// ─── Cartoon voice — more expressive settings per character ──────────────────
const VOICE_SETTINGS: Record<string,[number,number]> = {
  hero:    [0.85, 1.05],
  heroine: [1.45, 1.10],
  wizard:  [0.55, 0.80],
  villain: [0.40, 0.80],
  animal:  [1.75, 1.20],
  robot:   [0.65, 0.90],
}
function speakLine(text:string, template:string, onEnd:()=>void) {
  if(typeof window==='undefined'||!window.speechSynthesis){setTimeout(onEnd,1200);return}
  window.speechSynthesis.cancel()
  const [pitch,rate]=VOICE_SETTINGS[template]??[1,1]
  const utt=new SpeechSynthesisUtterance(text)
  utt.pitch=pitch; utt.rate=rate; utt.volume=1
  // Pick gender-matched voice where possible
  const voices=window.speechSynthesis.getVoices()
  const needsFemale=pitch>1.2
  const pick=voices.find(v=>needsFemale
    ? v.name.toLowerCase().includes('female')||v.name.includes('Samantha')||v.name.includes('Karen')||v.name.includes('Moira')
    : v.name.toLowerCase().includes('male')||v.name.includes('Daniel')||v.name.includes('Alex'))
  if(pick)utt.voice=pick
  utt.onend=()=>onEnd(); utt.onerror=()=>onEnd()
  window.speechSynthesis.speak(utt)
}

// ─── Canvas recorder ──────────────────────────────────────────────────────────
async function svgToImage(svgEl:SVGSVGElement):Promise<HTMLImageElement>{
  return new Promise((res,rej)=>{
    const data=new XMLSerializer().serializeToString(svgEl)
    const blob=new Blob([data],{type:'image/svg+xml'})
    const url=URL.createObjectURL(blob)
    const img=new Image(); img.onload=()=>{URL.revokeObjectURL(url);res(img)}; img.onerror=rej; img.src=url
  })
}

// ─── Main player ──────────────────────────────────────────────────────────────
interface Props{film:GeneratedFilm;onClose:()=>void}

export function FilmPlayer({film,onClose}:Props){
  const scenes=film.scenes
  const charMap=Object.fromEntries(film.characters.map(c=>[c.id,c]))

  const [idx,setIdx]         = useState(0)
  const [nextIdx,setNextIdx] = useState<number|null>(null)
  const [crossFade,setCross] = useState(0)   // 0→1 during transition
  const [playing,setPlaying] = useState(false)
  const [muted,setMuted]     = useState(false)
  const [dlgIdx,setDlgIdx]   = useState(0)
  const [talkingId,setTalkId]= useState<string|null>(null)
  const [recording,setRec]   = useState(false)
  const [recPct,setRecPct]   = useState(0)
  const [recBlob,setBlob]    = useState<Blob|null>(null)

  const music     = useRef(new MusicEngine())
  const sceneTimer= useRef<ReturnType<typeof setTimeout>>()
  const crossTimer= useRef<ReturnType<typeof setInterval>>()
  const playerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recRef    = useRef<MediaRecorder|null>(null)
  const chunksRef = useRef<BlobPart[]>([])

  const scene=scenes[idx]
  const nextScene=nextIdx!==null?scenes[nextIdx]:null

  // ── transition to next scene with crossfade ─────────────────────────────────
  const goTo=useCallback((next:number,withFade=true)=>{
    if(next<0||next>=scenes.length)return
    window.speechSynthesis?.cancel()
    setTalkId(null); setDlgIdx(0)
    if(!withFade){setIdx(next);setNextIdx(null);setCross(0);return}
    setNextIdx(next); setCross(0)
    let pct=0
    clearInterval(crossTimer.current)
    crossTimer.current=setInterval(()=>{
      pct+=0.05
      setCross(pct)
      if(pct>=1){
        clearInterval(crossTimer.current)
        setIdx(next); setNextIdx(null); setCross(0)
      }
    },25)  // 500ms crossfade
  },[scenes.length])

  // ── auto advance ──────────────────────────────────────────────────────────
  useEffect(()=>{
    clearTimeout(sceneTimer.current)
    if(!playing||!scene)return
    music.current.setMood(scene.musicMood)
    // speak first dialogue
    if(scene.dialogue.length>0&&!muted){
      const line=scene.dialogue[0]
      const char=charMap[line.characterId]
      setTalkId(line.characterId)
      speakLine(line.text,char?.template??'hero',()=>{
        setTalkId(null)
        // advance to next dialogue line after brief pause
        if(scene.dialogue.length>1){
          setTimeout(()=>setDlgIdx(1),300)
        }
      })
    }
    sceneTimer.current=setTimeout(()=>{
      if(idx<scenes.length-1)goTo(idx+1)
      else setPlaying(false)
    },scene.duration)
    return()=>clearTimeout(sceneTimer.current)
  },[playing,idx,scene,muted])

  // speak next dialogue line when dlgIdx advances
  useEffect(()=>{
    if(dlgIdx===0||!playing||!scene)return
    const line=scene.dialogue[dlgIdx]
    if(!line)return
    const char=charMap[line.characterId]
    if(!muted){
      setTalkId(line.characterId)
      speakLine(line.text,char?.template??'hero',()=>{
        setTalkId(null)
        if(dlgIdx+1<scene.dialogue.length){
          setTimeout(()=>setDlgIdx(i=>i+1),300)
        }
      })
    }
  },[dlgIdx,playing,scene,muted])

  // music start/stop
  useEffect(()=>{
    if(playing&&!muted){music.current.start(scene?.musicMood??'adventure')}
    else{music.current.stop();window.speechSynthesis?.cancel();setTalkId(null)}
  },[playing,muted])

  useEffect(()=>()=>{music.current.stop();window.speechSynthesis?.cancel()},[])

  // keyboard
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{
      if(e.key===' '){e.preventDefault();setPlaying(p=>!p)}
      if(e.key==='ArrowRight')goTo(idx+1)
      if(e.key==='ArrowLeft')goTo(idx-1)
      if(e.key==='Escape')onClose()
      if(e.key==='m')setMuted(m=>!m)
    }
    window.addEventListener('keydown',h)
    return()=>window.removeEventListener('keydown',h)
  },[idx,goTo,onClose])

  // ── canvas video recording ──────────────────────────────────────────────────
  async function startRecording(){
    const canvas=canvasRef.current; if(!canvas)return
    setRec(true); setBlob(null); setRecPct(0)
    chunksRef.current=[]

    const W=1280,H=720
    canvas.width=W; canvas.height=H
    const ctx2d=canvas.getContext('2d')!

    // combine canvas stream + music audio
    const videoStream=canvas.captureStream(30)
    const musicStr=music.current.stream()
    const combined=new MediaStream([
      ...videoStream.getVideoTracks(),
      ...(musicStr?.getAudioTracks()??[]),
    ])
    const mimeType=MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ?'video/webm;codecs=vp9':'video/webm'
    const mr=new MediaRecorder(combined,{mimeType,videoBitsPerSecond:8_000_000})
    recRef.current=mr
    mr.ondataavailable=e=>e.data.size>0&&chunksRef.current.push(e.data)
    mr.onstop=()=>{
      const blob=new Blob(chunksRef.current,{type:'video/webm'})
      setBlob(blob); setRec(false)
    }

    // start music for recording
    music.current.start(scenes[0].musicMood)
    mr.start()

    // render each scene frame by frame
    const sceneEls=document.querySelectorAll<HTMLDivElement>('[data-scene-render]')
    let totalMs=0
    for(const sc of scenes)totalMs+=sc.duration

    let elapsed=0
    for(let si=0;si<scenes.length;si++){
      const sc=scenes[si]
      music.current.setMood(sc.musicMood)
      const frames=Math.round((sc.duration/1000)*30)
      for(let f=0;f<frames;f++){
        // draw background colour fallback + subtitle
        ctx2d.fillStyle='#111'
        ctx2d.fillRect(0,0,W,H)
        // copy the visible scene div to canvas via html rendering
        const el=document.querySelector<HTMLDivElement>(`[data-scene-id="${sc.sceneNumber}"]`)
        if(el){
          try{
            const {default:html2canvas}=await import('html2canvas' as any)
            const c=await html2canvas(el,{width:W,height:H,scale:1,logging:false,useCORS:true})
            ctx2d.drawImage(c,0,0,W,H)
          }catch{
            // fallback: just write title
            ctx2d.fillStyle='#1a1040'
            ctx2d.fillRect(0,0,W,H)
            ctx2d.fillStyle='white'
            ctx2d.font='bold 48px sans-serif'
            ctx2d.textAlign='center'
            ctx2d.fillText(sc.title,W/2,H/2)
          }
        }
        // draw subtitle
        const dlgLine=sc.dialogue[0]
        if(dlgLine){
          const ch=charMap[dlgLine.characterId]
          ctx2d.fillStyle='rgba(0,0,0,0.7)'
          ctx2d.fillRect(0,H-90,W,90)
          ctx2d.fillStyle='#fff'
          ctx2d.font='bold 28px sans-serif'
          ctx2d.textAlign='left'
          ctx2d.fillText(`${ch?.name??''}:`,40,H-52)
          ctx2d.font='26px sans-serif'
          ctx2d.fillText(dlgLine.text,40,H-20)
        }
        // frame delay
        await new Promise(r=>setTimeout(r,1000/30))
      }
      elapsed+=sc.duration
      setRecPct(Math.round((elapsed/totalMs)*100))
    }
    mr.stop()
  }

  function downloadBlob(){
    if(!recBlob)return
    const url=URL.createObjectURL(recBlob)
    const a=document.createElement('a')
    a.href=url; a.download=`${film.title.replace(/[^a-zA-Z0-9]/g,'-')}.webm`
    a.click(); URL.revokeObjectURL(url)
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  const currentLine=scene?.dialogue[dlgIdx]
  const pct=scenes.length>1?(idx/(scenes.length-1))*100:100
  const XPOS: Record<string,string>={'far-left':'8%','left':'23%','center':'50%','right':'77%','far-right':'92%'}
  const HPCT: Record<string,string>={small:'38%',medium:'56%',large:'72%'}

  function SceneView({sc,style}:{sc:GenScene,style?:React.CSSProperties}){
    return(
      <div className="absolute inset-0 overflow-hidden" style={style} data-scene-id={sc.sceneNumber}>
        <BackgroundSvg theme={sc.background} width="100%" height="100%"/>
        <div className="absolute inset-0">
          {sc.placements.map(pl=>{
            const char=charMap[pl.characterId]; if(!char)return null
            const isTalking=talkingId===char.id&&playing
            return(
              <div key={char.id}
                className={`absolute bottom-0 flex flex-col items-center ${isTalking?'animate-talking':'animate-idle'}`}
                style={{left:XPOS[pl.position]??'50%',transform:'translateX(-50%)',height:HPCT[pl.size]??'56%'}}>
                <CharacterSvg template={char.template} primaryColor={char.primaryColor}
                  secondaryColor={char.secondaryColor}
                  emotion={currentLine?.characterId===char.id ? currentLine.emotion : 'neutral'}
                  facing={pl.facing} width="auto" height="100%"
                  className="drop-shadow-2xl flex-1 min-h-0"/>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return(
    <div className="fixed inset-0 bg-black z-50 flex flex-col select-none" ref={playerRef}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-black/80 flex-shrink-0 z-10">
        <div className="min-w-0">
          <h1 className="text-white font-bold text-base leading-tight truncate max-w-sm">{film.title}</h1>
          <p className="text-white/50 text-xs mt-0.5">Scene {idx+1}/{scenes.length} · {scene?.title}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Download button */}
          {recBlob ? (
            <button onClick={downloadBlob}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
              ⬇ Download HD
            </button>
          ) : recording ? (
            <div className="flex items-center gap-2 bg-red-600/30 text-red-300 text-xs px-3 py-2 rounded-lg">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"/>
              Recording {recPct}%
            </div>
          ) : (
            <button onClick={startRecording}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors">
              ⬇ Record & Download
            </button>
          )}
          <button onClick={()=>setMuted(m=>!m)}
            className="text-white/60 hover:text-white text-lg w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10">
            {muted?'🔇':'🔊'}
          </button>
          <button onClick={()=>{music.current.stop();window.speechSynthesis?.cancel();onClose()}}
            className="text-white/60 hover:text-white text-xl w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10">
            ✕
          </button>
        </div>
      </div>

      {/* Scene viewport — smooth crossfade */}
      <div className="flex-1 relative overflow-hidden cursor-pointer" onClick={()=>setPlaying(p=>!p)}>
        {/* Current scene */}
        {scene && <SceneView sc={scene} style={{opacity: nextIdx!==null ? 1-crossFade : 1}}/>}
        {/* Next scene fades in on top */}
        {nextScene && <SceneView sc={nextScene} style={{opacity:crossFade}}/>}

        {/* Pause overlay */}
        {!playing&&(
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/55 backdrop-blur-sm rounded-3xl px-10 py-8 text-center">
              <div className="text-white text-5xl mb-2">▶</div>
              <p className="text-white font-bold text-xl">{scene?.title}</p>
              <p className="text-white/60 text-sm mt-1">Click to play</p>
              <p className="text-white/30 text-xs mt-2">Space·pause  ←→·skip  M·mute  Esc·close</p>
            </div>
          </div>
        )}

        {/* Recording canvas (hidden, used for video capture) */}
        <canvas ref={canvasRef} className="hidden"/>
      </div>

      {/* Subtitle bar — always visible */}
      <div className="flex-shrink-0 bg-black/90 min-h-[72px] flex items-center px-6 py-3 z-10">
        {currentLine ? (
          <div key={`${idx}-${dlgIdx}`} className="animate-subtitle w-full">
            <span className="text-indigo-400 font-bold text-sm mr-2">
              {charMap[currentLine.characterId]?.name}:
            </span>
            <span className="text-white text-base">{currentLine.text}</span>
          </div>
        ) : (
          <p className="text-white/20 text-sm italic">{scene?.description}</p>
        )}
      </div>

      {/* Progress + controls */}
      <div className="bg-black px-5 pb-4 pt-2 flex-shrink-0">
        {/* Clickable progress bar */}
        <div className="mb-3 cursor-pointer py-1" onClick={e=>{
          const r=e.currentTarget.getBoundingClientRect()
          goTo(Math.round(((e.clientX-r.left)/r.width)*(scenes.length-1)))
        }}>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-500" style={{width:`${pct}%`}}/>
          </div>
          {/* Scene ticks */}
          <div className="relative h-0 mt-0.5">
            {scenes.map((s,i)=>(
              <button key={s.sceneNumber}
                className={`absolute w-2 h-2 -top-1 rounded-full transition-all hover:scale-150 ${i===idx?'bg-white scale-125':'bg-white/30'}`}
                style={{left:`calc(${scenes.length>1?(i/(scenes.length-1))*100:50}% - 4px)`}}
                onClick={e=>{e.stopPropagation();goTo(i)}}
                title={s.title}/>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Btn onClick={()=>goTo(0)}         disabled={idx===0}>⏮</Btn>
            <Btn onClick={()=>goTo(idx-1)}     disabled={idx===0}>◀</Btn>
            <button onClick={()=>setPlaying(p=>!p)}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors shadow-lg">
              {playing
                ?<span className="text-lg">⏸</span>
                :<svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5"><polygon points="5,3 19,12 5,21"/></svg>}
            </button>
            <Btn onClick={()=>goTo(idx+1)}     disabled={idx>=scenes.length-1}>▶</Btn>
            <Btn onClick={()=>goTo(scenes.length-1)} disabled={idx>=scenes.length-1}>⏭</Btn>
          </div>
          <div className="text-right text-white/40 text-xs">
            <div>{idx+1} / {scenes.length} scenes</div>
            <div>{Math.round(scenes.reduce((s,sc)=>s+sc.duration,0)/60000)} min film</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Btn({children,onClick,disabled}:{children:React.ReactNode;onClick:()=>void;disabled?:boolean}){
  return(
    <button onClick={onClick} disabled={disabled}
      className="w-9 h-9 rounded-full text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-sm">
      {children}
    </button>
  )
}
