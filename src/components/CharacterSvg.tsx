'use client'
import type { CharacterTemplate, CharacterFacing, Emotion } from '@/lib/types'

interface CharacterSvgProps {
  template: CharacterTemplate
  primaryColor: string
  secondaryColor: string
  emotion?: Emotion
  facing?: CharacterFacing
  width?: number | string
  height?: number | string
  className?: string
  style?: React.CSSProperties
}

function MouthPath({ emotion }: { emotion: Emotion }) {
  switch (emotion) {
    case 'happy':     return <path d="M 38 62 Q 50 72 62 62" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    case 'sad':       return <path d="M 38 68 Q 50 58 62 68" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    case 'surprised': return <ellipse cx="50" cy="65" rx="7" ry="8" fill="#333"/>
    case 'angry':     return <path d="M 40 66 Q 50 60 60 66" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    default:          return <path d="M 42 65 L 58 65" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
  }
}
function EyebrowPath({ emotion }: { emotion: Emotion }) {
  if (emotion === 'angry')     return <><path d="M33 38 Q39 35 45 38" stroke="#333" strokeWidth="2" fill="none"/><path d="M55 38 Q61 35 67 38" stroke="#333" strokeWidth="2" fill="none"/></>
  if (emotion === 'sad')       return <><path d="M33 38 Q39 42 45 39" stroke="#333" strokeWidth="2" fill="none"/><path d="M55 39 Q61 42 67 38" stroke="#333" strokeWidth="2" fill="none"/></>
  if (emotion === 'surprised') return <><path d="M33 35 Q39 32 45 35" stroke="#333" strokeWidth="2" fill="none"/><path d="M55 35 Q61 32 67 35" stroke="#333" strokeWidth="2" fill="none"/></>
  return null
}

function HeroSvg({ p, s, emotion }: { p:string; s:string; emotion:Emotion }) {
  return (<g>
    <path d="M20 95 Q15 130 25 150 L50 135 L75 150 Q85 130 80 95 Z" fill={s} opacity="0.9"/>
    <rect x="28" y="90" width="44" height="55" rx="8" fill={p}/>
    <polygon points="50,100 45,115 55,115" fill={s}/>
    <circle cx="50" cy="50" r="30" fill="#FDDCB0"/>
    <path d="M20 40 Q25 15 50 18 Q75 15 80 40 Q70 25 50 26 Q30 25 20 40Z" fill="#5C3D2E"/>
    <ellipse cx="38" cy="48" rx="6" ry="6" fill="white"/>
    <ellipse cx="62" cy="48" rx="6" ry="6" fill="white"/>
    <circle cx="39" cy="49" r="3.5" fill="#2D5BE3"/>
    <circle cx="63" cy="49" r="3.5" fill="#2D5BE3"/>
    <circle cx="40" cy="48" r="1.2" fill="white"/>
    <circle cx="64" cy="48" r="1.2" fill="white"/>
    <EyebrowPath emotion={emotion}/>
    <MouthPath emotion={emotion}/>
    <rect x="6" y="92" width="22" height="12" rx="6" fill={p}/>
    <rect x="72" y="92" width="22" height="12" rx="6" fill={p}/>
    <circle cx="9" cy="98" r="7" fill="#FDDCB0"/>
    <circle cx="91" cy="98" r="7" fill="#FDDCB0"/>
    <rect x="28" y="145" width="18" height="20" rx="6" fill="#333"/>
    <rect x="54" y="145" width="18" height="20" rx="6" fill="#333"/>
  </g>)
}

function HeroineSvg({ p, s, emotion }: { p:string; s:string; emotion:Emotion }) {
  return (<g>
    <path d="M28 90 Q15 140 20 165 L50 160 L80 165 Q85 140 72 90Z" fill={p}/>
    <path d="M30 105 Q50 115 70 105" stroke={s} strokeWidth="2" fill="none"/>
    <rect x="30" y="88" width="40" height="30" rx="6" fill={p}/>
    <circle cx="50" cy="48" r="30" fill="#FDDCB0"/>
    <path d="M20 30 Q10 20 8 40 Q12 55 20 50" fill={s}/>
    <path d="M80 30 Q90 20 92 40 Q88 55 80 50" fill={s}/>
    <path d="M20 38 Q22 10 50 14 Q78 10 80 38 Q70 22 50 24 Q30 22 20 38Z" fill={s}/>
    <ellipse cx="38" cy="46" rx="6.5" ry="6.5" fill="white"/>
    <ellipse cx="62" cy="46" rx="6.5" ry="6.5" fill="white"/>
    <circle cx="39" cy="47" r="3.5" fill="#7C3AED"/>
    <circle cx="63" cy="47" r="3.5" fill="#7C3AED"/>
    <circle cx="40" cy="46" r="1.2" fill="white"/>
    <circle cx="64" cy="46" r="1.2" fill="white"/>
    <path d="M33 42 L31 39" stroke="#333" strokeWidth="1.5"/>
    <path d="M67 42 L69 39" stroke="#333" strokeWidth="1.5"/>
    <EyebrowPath emotion={emotion}/>
    <MouthPath emotion={emotion}/>
    <circle cx="30" cy="55" r="6" fill="#FFB7B2" opacity="0.5"/>
    <circle cx="70" cy="55" r="6" fill="#FFB7B2" opacity="0.5"/>
    <rect x="6" y="92" width="24" height="11" rx="6" fill={p}/>
    <rect x="70" y="92" width="24" height="11" rx="6" fill={p}/>
    <circle cx="8" cy="97" r="7" fill="#FDDCB0"/>
    <circle cx="92" cy="97" r="7" fill="#FDDCB0"/>
    <ellipse cx="34" cy="167" rx="12" ry="8" fill="#333"/>
    <ellipse cx="66" cy="167" rx="12" ry="8" fill="#333"/>
  </g>)
}

function WizardSvg({ p, s, emotion }: { p:string; s:string; emotion:Emotion }) {
  return (<g>
    <path d="M20 90 Q10 145 15 168 L50 162 L85 168 Q90 145 80 90Z" fill={p}/>
    <text x="30" y="130" fontSize="14" fill={s}>★</text>
    <text x="55" y="150" fontSize="10" fill={s}>✦</text>
    <rect x="22" y="108" width="56" height="9" rx="3" fill={s}/>
    <circle cx="50" cy="52" r="28" fill="#F5E6D3"/>
    <polygon points="50,2 28,55 72,55" fill={p}/>
    <rect x="22" y="50" width="56" height="10" rx="3" fill={p} opacity="0.8"/>
    <text x="44" y="38" fontSize="14" fill={s}>⭐</text>
    <ellipse cx="38" cy="50" rx="5.5" ry="5.5" fill="white"/>
    <ellipse cx="62" cy="50" rx="5.5" ry="5.5" fill="white"/>
    <circle cx="39" cy="51" r="3" fill="#1B4332"/>
    <circle cx="63" cy="51" r="3" fill="#1B4332"/>
    <circle cx="40" cy="50" r="1" fill="white"/>
    <circle cx="64" cy="50" r="1" fill="white"/>
    <path d="M30 65 Q35 90 50 95 Q65 90 70 65 Q60 75 50 76 Q40 75 30 65Z" fill="white"/>
    <EyebrowPath emotion={emotion}/>
    <MouthPath emotion={emotion}/>
    <rect x="72" y="92" width="24" height="11" rx="6" fill={p}/>
    <rect x="88" y="60" width="8" height="90" rx="4" fill={s}/>
    <circle cx="92" cy="55" r="10" fill={s} opacity="0.8"/>
    <circle cx="92" cy="55" r="6" fill="white" opacity="0.6"/>
    <rect x="4" y="92" width="24" height="11" rx="6" fill={p}/>
    <circle cx="6" cy="97" r="7" fill="#F5E6D3"/>
    <ellipse cx="34" cy="170" rx="14" ry="7" fill="#2D3748"/>
    <ellipse cx="66" cy="170" rx="14" ry="7" fill="#2D3748"/>
  </g>)
}

function VillainSvg({ p, s, emotion }: { p:string; s:string; emotion:Emotion }) {
  return (<g>
    <path d="M18 88 Q8 130 12 168 L50 155 L88 168 Q92 130 82 88Z" fill="#1A1A2E"/>
    <path d="M22 88 Q13 125 17 162 L50 150 L83 162 Q87 125 78 88 Q68 100 50 100 Q32 100 22 88Z" fill={s} opacity="0.7"/>
    <rect x="28" y="88" width="44" height="35" rx="6" fill={p}/>
    <path d="M28 88 L50 105 L72 88 Z" fill="#1A1A2E"/>
    <ellipse cx="50" cy="50" rx="28" ry="30" fill="#E8D5C4"/>
    <rect x="24" y="8" width="52" height="30" rx="4" fill="#1A1A2E"/>
    <rect x="16" y="36" width="68" height="10" rx="3" fill="#1A1A2E"/>
    <rect x="28" y="10" width="44" height="6" rx="2" fill={s} opacity="0.6"/>
    <path d="M30 46 L44 50 L30 54 Z" fill="white"/>
    <path d="M70 46 L56 50 L70 54 Z" fill="white"/>
    <ellipse cx="38" cy="50" rx="4" ry="4" fill={s}/>
    <ellipse cx="62" cy="50" rx="4" ry="4" fill={s}/>
    <circle cx="38" cy="50" r="2" fill="#0D0D0D"/>
    <circle cx="62" cy="50" r="2" fill="#0D0D0D"/>
    <path d="M54 42 L58 54" stroke="#8B0000" strokeWidth="1.5"/>
    <path d="M30 40 L44 44" stroke="#333" strokeWidth="2.5"/>
    <path d="M70 40 L56 44" stroke="#333" strokeWidth="2.5"/>
    {emotion === 'happy'
      ? <path d="M36 65 Q50 78 64 65 Q57 72 50 73 Q43 72 36 65Z" fill="#C41E1E"/>
      : <MouthPath emotion={emotion}/>}
    <rect x="4" y="92" width="24" height="11" rx="6" fill="#1A1A2E"/>
    <rect x="72" y="92" width="24" height="11" rx="6" fill="#1A1A2E"/>
    <circle cx="6" cy="98" r="8" fill="#2D2D2D"/>
    <circle cx="94" cy="98" r="8" fill="#2D2D2D"/>
    <rect x="26" y="148" width="20" height="22" rx="6" fill="#1A1A2E"/>
    <rect x="54" y="148" width="20" height="22" rx="6" fill="#1A1A2E"/>
  </g>)
}

function AnimalSvg({ p, s, emotion }: { p:string; s:string; emotion:Emotion }) {
  return (<g>
    <ellipse cx="50" cy="118" rx="38" ry="45" fill={p}/>
    <ellipse cx="50" cy="125" rx="24" ry="30" fill={s} opacity="0.7"/>
    <path d="M88 130 Q110 110 105 85 Q100 70 90 78 Q98 85 96 100 Q90 118 80 125" fill={p}/>
    <circle cx="50" cy="52" r="34" fill={p}/>
    <polygon points="22,24 14,2 36,18" fill={p}/>
    <polygon points="24,22 18,6 34,18" fill={s} opacity="0.7"/>
    <polygon points="78,24 86,2 64,18" fill={p}/>
    <polygon points="76,22 82,6 66,18" fill={s} opacity="0.7"/>
    <circle cx="36" cy="50" r="11" fill="white"/>
    <circle cx="64" cy="50" r="11" fill="white"/>
    <circle cx="37" cy="51" r="7" fill={s}/>
    <circle cx="65" cy="51" r="7" fill={s}/>
    <circle cx="36" cy="50" r="4" fill="#111"/>
    <circle cx="64" cy="50" r="4" fill="#111"/>
    <circle cx="37" cy="49" r="1.8" fill="white"/>
    <circle cx="65" cy="49" r="1.8" fill="white"/>
    <line x1="55" y1="66" x2="82" y2="62" stroke="#666" strokeWidth="1.2"/>
    <line x1="55" y1="68" x2="82" y2="72" stroke="#666" strokeWidth="1.2"/>
    <line x1="45" y1="66" x2="18" y2="62" stroke="#666" strokeWidth="1.2"/>
    <line x1="45" y1="68" x2="18" y2="72" stroke="#666" strokeWidth="1.2"/>
    <polygon points="50,62 46,68 54,68" fill="#FF9EAA"/>
    {emotion === 'happy'
      ? <path d="M42 72 Q50 80 58 72" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      : <MouthPath emotion={emotion}/>}
    <ellipse cx="16" cy="120" rx="12" ry="10" fill={p}/>
    <ellipse cx="84" cy="120" rx="12" ry="10" fill={p}/>
    <ellipse cx="34" cy="162" rx="14" ry="10" fill={p}/>
    <ellipse cx="66" cy="162" rx="14" ry="10" fill={p}/>
  </g>)
}

function RobotSvg({ p, s, emotion }: { p:string; s:string; emotion:Emotion }) {
  return (<g>
    <rect x="22" y="85" width="56" height="60" rx="8" fill={p}/>
    <rect x="30" y="92" width="40" height="25" rx="4" fill={s} opacity="0.3"/>
    <circle cx="38" cy="104" r="5" fill={s}/>
    <circle cx="50" cy="104" r="5" fill="green"/>
    <circle cx="62" cy="104" r="5" fill="red" opacity="0.8"/>
    <rect x="25" y="142" width="50" height="8" rx="3" fill={s} opacity="0.5"/>
    <rect x="20" y="18" width="60" height="56" rx="10" fill={p}/>
    <rect x="47" y="4" width="6" height="18" rx="3" fill={s}/>
    <circle cx="50" cy="4" r="6" fill={s}/>
    <circle cx="50" cy="4" r="3" fill="white" opacity="0.8"/>
    <rect x="26" y="28" width="48" height="28" rx="8" fill={s} opacity="0.25"/>
    <rect x="26" y="28" width="48" height="28" rx="8" stroke={s} strokeWidth="2" fill="none"/>
    <rect x="30" y="35" rx="4" width="14" height="14" fill={s}/>
    <rect x="56" y="35" rx="4" width="14" height="14" fill={s}/>
    {emotion === 'happy' || emotion === 'neutral'
      ? <><rect x="33" y="38" rx="2" width="8" height="8" fill="white" opacity="0.8"/><rect x="59" y="38" rx="2" width="8" height="8" fill="white" opacity="0.8"/></>
      : <><rect x="30" y="35" rx="4" width="14" height="14" fill="red" opacity="0.6"/><rect x="56" y="35" rx="4" width="14" height="14" fill="red" opacity="0.6"/></>}
    <rect x="32" y="58" width="36" height="10" rx="4" fill={s} opacity="0.3"/>
    {emotion === 'happy'
      ? <path d="M36 63 Q50 70 64 63" stroke={s} strokeWidth="2.5" fill="none"/>
      : <line x1="36" y1="63" x2="64" y2="63" stroke={s} strokeWidth="2.5"/>}
    <rect x="2" y="88" width="22" height="12" rx="6" fill={p}/>
    <rect x="76" y="88" width="22" height="12" rx="6" fill={p}/>
    <rect x="0" y="94" rx="4" width="8" height="16" fill={s} opacity="0.7"/>
    <rect x="92" y="94" rx="4" width="8" height="16" fill={s} opacity="0.7"/>
    <rect x="28" y="145" width="18" height="30" rx="5" fill={p}/>
    <rect x="54" y="145" width="18" height="30" rx="5" fill={p}/>
    <rect x="22" y="168" width="28" height="10" rx="5" fill={s} opacity="0.8"/>
    <rect x="50" y="168" width="28" height="10" rx="5" fill={s} opacity="0.8"/>
  </g>)
}

export function CharacterSvg({
  template, primaryColor, secondaryColor,
  emotion = 'neutral', facing = 'forward',
  width = 100, height = 180,
  className, style,
}: CharacterSvgProps) {
  const props = { p: primaryColor, s: secondaryColor, emotion }
  const scaleX = facing === 'left' ? -1 : 1
  return (
    <svg
      viewBox="0 0 100 178"
      width={width}
      height={height}
      className={className}
      style={{ transform: `scaleX(${scaleX})`, overflow: 'visible', ...style }}
      aria-label={`${template} character`}
    >
      {template === 'hero'    && <HeroSvg    {...props}/>}
      {template === 'heroine' && <HeroineSvg {...props}/>}
      {template === 'wizard'  && <WizardSvg  {...props}/>}
      {template === 'villain' && <VillainSvg {...props}/>}
      {template === 'animal'  && <AnimalSvg  {...props}/>}
      {template === 'robot'   && <RobotSvg   {...props}/>}
    </svg>
  )
}
