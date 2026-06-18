'use client'
import type { BackgroundTheme } from '@/lib/types'

interface BackgroundSvgProps {
  theme: BackgroundTheme
  width?: number | string
  height?: number | string
  className?: string
}

function BedroomBg() {
  return (
    <g>
      {/* floor */}
      <rect x="0" y="340" width="800" height="160" fill="#C4A882"/>
      {/* wall */}
      <rect x="0" y="0" width="800" height="345" fill="#F5E6D3"/>
      {/* skirting */}
      <rect x="0" y="338" width="800" height="10" fill="#D4B896"/>
      {/* window */}
      <rect x="280" y="50" width="240" height="200" rx="12" fill="#B8D4F0"/>
      <rect x="280" y="50" width="240" height="200" rx="12" stroke="#8B6F47" strokeWidth="6" fill="none"/>
      <line x1="400" y1="50" x2="400" y2="250" stroke="#8B6F47" strokeWidth="5"/>
      <line x1="280" y1="150" x2="520" y2="150" stroke="#8B6F47" strokeWidth="5"/>
      {/* clouds outside */}
      <ellipse cx="340" cy="100" rx="35" ry="22" fill="white" opacity="0.9"/>
      <ellipse cx="380" cy="95" rx="30" ry="20" fill="white" opacity="0.9"/>
      <ellipse cx="460" cy="110" rx="28" ry="18" fill="white" opacity="0.8"/>
      {/* sun */}
      <circle cx="490" cy="80" r="22" fill="#FFD700" opacity="0.9"/>
      {/* curtains */}
      <path d="M280 50 Q310 150 290 250 L280 250 Z" fill="#E8A87C" opacity="0.85"/>
      <path d="M520 50 Q490 150 510 250 L520 250 Z" fill="#E8A87C" opacity="0.85"/>
      {/* bed */}
      <rect x="30" y="230" width="180" height="110" rx="10" fill="#8B6F47"/>
      <rect x="30" y="220" width="180" height="35" rx="8" fill="#A08050"/>
      <rect x="40" y="260" width="160" height="80" rx="6" fill="#F0E0D0"/>
      <rect x="40" y="260" width="160" height="80" rx="6" stroke="#D4C0B0" strokeWidth="2" fill="none"/>
      {/* pillow */}
      <rect x="55" y="265" width="65" height="40" rx="8" fill="white"/>
      <rect x="130" y="265" width="65" height="40" rx="8" fill="white"/>
      {/* desk */}
      <rect x="570" y="220" width="200" height="15" rx="5" fill="#8B6F47"/>
      <rect x="580" y="235" width="15" height="105" rx="4" fill="#8B6F47"/>
      <rect x="745" y="235" width="15" height="105" rx="4" fill="#8B6F47"/>
      {/* lamp on desk */}
      <rect x="640" y="160" width="8" height="60" fill="#888"/>
      <path d="M620 160 L660 160 L655 130 L625 130Z" fill="#FFD080" opacity="0.9"/>
      <circle cx="644" cy="130" r="10" fill="#FFE0A0"/>
      {/* bookshelf */}
      <rect x="600" y="55" width="170" height="135" rx="4" fill="#8B6F47"/>
      <rect x="605" y="60" width="160" height="35" rx="2" fill="#A0785A"/>
      <rect x="605" y="100" width="160" height="35" rx="2" fill="#A0785A"/>
      <rect x="605" y="140" width="160" height="35" rx="2" fill="#A0785A"/>
      {/* books */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={610+i*22} y={63} width={18} height={29} rx="2"
          fill={['#E74C3C','#3498DB','#2ECC71','#F39C12','#9B59B6','#1ABC9C','#E67E22'][i]}/>
      ))}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={610+i*22} y={103} width={18} height={29} rx="2"
          fill={['#2980B9','#C0392B','#27AE60','#F1C40F','#8E44AD','#16A085','#D35400'][i]}/>
      ))}
      {/* rug */}
      <ellipse cx="400" cy="380" rx="200" ry="40" fill="#E8A87C" opacity="0.5"/>
      <ellipse cx="400" cy="380" rx="160" ry="30" fill="#D4845A" opacity="0.4"/>
    </g>
  )
}

function ForestBg() {
  return (
    <g>
      {/* sky */}
      <rect x="0" y="0" width="800" height="280" fill="#87CEEB"/>
      {/* clouds */}
      <ellipse cx="150" cy="60" rx="60" ry="35" fill="white" opacity="0.9"/>
      <ellipse cx="200" cy="50" rx="50" ry="30" fill="white" opacity="0.9"/>
      <ellipse cx="600" cy="80" rx="55" ry="32" fill="white" opacity="0.8"/>
      <ellipse cx="650" cy="70" rx="45" ry="28" fill="white" opacity="0.8"/>
      {/* sun */}
      <circle cx="700" cy="70" r="45" fill="#FFD700" opacity="0.95"/>
      {[0,1,2,3,4,5,6,7].map(i => {
        const a = (i/8)*Math.PI*2
        return <line key={i} x1={700+Math.cos(a)*52} y1={70+Math.sin(a)*52}
          x2={700+Math.cos(a)*68} y2={70+Math.sin(a)*68}
          stroke="#FFD700" strokeWidth="5" strokeLinecap="round"/>
      })}
      {/* ground */}
      <rect x="0" y="270" width="800" height="230" fill="#4A7C59"/>
      <path d="M0 270 Q100 250 200 270 Q300 290 400 270 Q500 250 600 270 Q700 290 800 270 L800 300 L0 300Z" fill="#5A9A6E"/>
      {/* flowers */}
      {[50,130,220,350,450,540,670,750].map((x,i) => (
        <g key={i}>
          <line x1={x} y1={300} x2={x} y2={285} stroke="#3A6E45" strokeWidth="3"/>
          <circle cx={x} cy={283} r="6" fill={['#FF6B9D','#FFD93D','#6BCB77','#FF6B35','#4D96FF','#FF6B9D','#FFD93D','#6BCB77'][i]}/>
          <circle cx={x} cy={283} r="3" fill="#FFE44D"/>
        </g>
      ))}
      {/* far trees */}
      {[0, 120, 240, 480, 600, 720].map((x,i) => (
        <g key={i}>
          <rect x={x+48} y={180} width={24} height={100} fill="#5C3D2E"/>
          <circle cx={x+60} cy={150} r={55} fill="#2D6A4F" opacity="0.85"/>
          <circle cx={x+40} cy={170} r={40} fill="#40916C" opacity="0.8"/>
          <circle cx={x+80} cy={165} r={42} fill="#2D6A4F" opacity="0.8"/>
        </g>
      ))}
      {/* near trees */}
      {[0, 600].map((x,i) => (
        <g key={i}>
          <rect x={x+58} y={140} width={34} height={170} fill="#4A2C2A"/>
          <circle cx={x+75} cy={100} r={75} fill="#1B4332"/>
          <circle cx={x+45} cy={130} r={55} fill="#2D6A4F"/>
          <circle cx={x+105} cy={125} r={58} fill="#1B4332"/>
        </g>
      ))}
      {/* path */}
      <path d="M320 500 Q380 380 400 280 Q420 380 480 500Z" fill="#8B7355" opacity="0.5"/>
    </g>
  )
}

function CityBg() {
  return (
    <g>
      {/* sky */}
      <rect x="0" y="0" width="800" height="300" fill="#6B8CAE"/>
      {/* stars (night-ish dusk) */}
      {[80,140,220,300,380,460,540,620,700].map((x,i) => (
        <circle key={i} cx={x} cy={[30,60,20,45,35,55,25,40,50][i]} r="2.5" fill="white" opacity="0.7"/>
      ))}
      {/* moon */}
      <circle cx="680" cy="55" r="35" fill="#FFF5CC" opacity="0.9"/>
      <circle cx="695" cy="48" r="28" fill="#6B8CAE"/>
      {/* clouds */}
      <ellipse cx="200" cy="80" rx="65" ry="28" fill="#8BA0B8" opacity="0.6"/>
      <ellipse cx="500" cy="60" rx="55" ry="24" fill="#8BA0B8" opacity="0.5"/>
      {/* ground/road */}
      <rect x="0" y="300" width="800" height="200" fill="#4A4A5A"/>
      <rect x="0" y="295" width="800" height="15" fill="#666677"/>
      {/* road markings */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={80+i*120} y={370} width={60} height={12} rx="4" fill="#FFD700" opacity="0.6"/>
      ))}
      {/* sidewalk */}
      <rect x="0" y="295" width="800" height="40" fill="#888899"/>
      {/* buildings back */}
      {[
        {x:0,  w:100, h:220, c:'#4A5568'},
        {x:95, w:80,  h:180, c:'#553C5A'},
        {x:170,w:110, h:260, c:'#3D5A80'},
        {x:275,w:90,  h:200, c:'#4A5568'},
        {x:360,w:130, h:280, c:'#2D4059'},
        {x:485,w:85,  h:190, c:'#553C5A'},
        {x:565,w:120, h:240, c:'#3D5A80'},
        {x:680,w:120, h:220, c:'#4A5568'},
      ].map(({x,w,h,c},i) => (
        <g key={i}>
          <rect x={x} y={300-h} width={w} height={h} fill={c}/>
          {/* windows */}
          {Array.from({length:Math.floor(h/40)}).map((_,row) =>
            Array.from({length:Math.floor(w/28)}).map((_,col) => (
              <rect key={`${row}-${col}`}
                x={x+6+col*28} y={300-h+15+row*38}
                width={16} height={20} rx="3"
                fill={Math.random()>0.4 ? '#FFE080' : '#1A2535'} opacity="0.9"/>
            ))
          )}
        </g>
      ))}
      {/* streetlamps */}
      {[80,220,380,530,680].map((x,i) => (
        <g key={i}>
          <rect x={x} y={230} width="8" height="75" fill="#888"/>
          <path d={`M${x-20} 230 Q${x+4} 210 ${x+22} 230`} stroke="#888" strokeWidth="6" fill="none"/>
          <circle cx={x+22} cy={228} r="12" fill="#FFE080" opacity="0.9"/>
          <circle cx={x+22} cy={228} r="7" fill="white"/>
        </g>
      ))}
      {/* traffic light */}
      <rect x="480" y="220" width="22" height="60" rx="5" fill="#333"/>
      <circle cx="491" cy="232" r="7" fill="red"/>
      <circle cx="491" cy="250" r="7" fill="#444"/>
      <circle cx="491" cy="268" r="7" fill="#444"/>
    </g>
  )
}

function SpaceBg() {
  return (
    <g>
      {/* deep space */}
      <rect x="0" y="0" width="800" height="500" fill="#0A0520"/>
      {/* stars */}
      {Array.from({length:80}).map((_,i) => {
        const x = (i*97+13)%800, y = (i*61+7)%400
        const r = i%5===0 ? 2 : 1
        return <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={0.4+((i%5)/10)}/>
      })}
      {/* nebula glow */}
      <ellipse cx="200" cy="180" rx="160" ry="100" fill="#7C3AED" opacity="0.12"/>
      <ellipse cx="600" cy="120" rx="130" ry="80" fill="#2563EB" opacity="0.12"/>
      {/* large planet */}
      <circle cx="650" cy="120" r="95" fill="#C84B31"/>
      <ellipse cx="650" cy="100" rx="110" ry="25" fill="none" stroke="#E8956D" strokeWidth="12" opacity="0.6"/>
      <path d="M555 120 Q580 90 650 88 Q720 90 745 120" stroke="#E8956D" strokeWidth="8" fill="none" opacity="0.4"/>
      <circle cx="610" cy="100" r="15" fill="#A83820" opacity="0.5"/>
      {/* moon */}
      <circle cx="160" cy="130" r="65" fill="#C8C8D8"/>
      {[{cx:140,cy:110,r:12},{cx:175,cy:145,r:8},{cx:145,cy:155,r:15},{cx:185,cy:115,r:10}].map((c,i) => (
        <circle key={i} {...c} fill="#A8A8B8"/>
      ))}
      {/* shooting star */}
      <line x1="400" y1="50" x2="440" y2="30" stroke="white" strokeWidth="2" opacity="0.8"/>
      <circle cx="398" cy="51" r="3" fill="white" opacity="0.9"/>
      {/* asteroids */}
      <ellipse cx="300" cy="220" rx="18" ry="12" fill="#888" opacity="0.7" transform="rotate(-20 300 220)"/>
      <ellipse cx="500" cy="260" rx="12" ry="8" fill="#777" opacity="0.6" transform="rotate(15 500 260)"/>
      {/* space ground/asteroid field */}
      <path d="M0 370 Q80 350 160 370 Q240 390 320 365 Q400 345 480 370 Q560 390 640 365 Q720 345 800 370 L800 500 L0 500Z" fill="#1A0A35"/>
      <path d="M0 390 Q100 375 200 390 Q300 405 400 385 Q500 368 600 390 Q700 410 800 390 L800 500 L0 500Z" fill="#0F0620"/>
      {/* crater surface */}
      {[60,160,280,400,520,640,740].map((x,i) => (
        <ellipse key={i} cx={x} cy={430+i%3*15} rx={20+i%3*8} ry={8} fill="#150830" opacity="0.6"/>
      ))}
    </g>
  )
}

function BeachBg() {
  return (
    <g>
      {/* sky */}
      <rect x="0" y="0" width="800" height="260" fill="#87CEEB"/>
      {/* sun */}
      <circle cx="680" cy="80" r="60" fill="#FFD700"/>
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const a = (i/12)*Math.PI*2
        return <line key={i} x1={680+Math.cos(a)*68} y1={80+Math.sin(a)*68}
          x2={680+Math.cos(a)*82} y2={80+Math.sin(a)*82}
          stroke="#FFD700" strokeWidth="5" strokeLinecap="round"/>
      })}
      {/* clouds */}
      <ellipse cx="150" cy="55" rx="70" ry="32" fill="white" opacity="0.95"/>
      <ellipse cx="200" cy="45" rx="55" ry="28" fill="white" opacity="0.9"/>
      <ellipse cx="400" cy="70" rx="60" ry="28" fill="white" opacity="0.85"/>
      {/* sea */}
      <rect x="0" y="255" width="800" height="160" fill="#2196F3"/>
      <path d="M0 255 Q50 240 100 255 Q150 270 200 255 Q250 240 300 255 Q350 270 400 255 Q450 240 500 255 Q550 270 600 255 Q650 240 700 255 Q750 270 800 255 L800 280 L0 280Z" fill="#42A5F5"/>
      <path d="M0 290 Q60 278 120 290 Q180 302 240 290 Q300 278 360 290 Q420 302 480 290 Q540 278 600 290 Q660 302 720 290 Q760 282 800 290 L800 310 L0 310Z" fill="#64B5F6" opacity="0.6"/>
      {/* sailboat */}
      <rect x="340" y="220" width="80" height="12" rx="4" fill="#8B6F47"/>
      <polygon points="380,220 380,150 340,220" fill="white" opacity="0.9"/>
      <polygon points="380,220 380,160 415,220" fill="#FF6B6B" opacity="0.85"/>
      <rect x="378" y="145" width="5" height="80" fill="#8B6F47"/>
      {/* sand */}
      <rect x="0" y="400" width="800" height="100" fill="#F4D03F"/>
      <path d="M0 395 Q80 380 160 395 Q240 410 320 395 Q400 380 480 395 Q560 410 640 395 Q720 380 800 395 L800 420 L0 420Z" fill="#F0C040"/>
      {/* waves on sand */}
      <path d="M0 415 Q100 405 200 415 Q300 425 400 415 Q500 405 600 415 Q700 425 800 415" stroke="#2196F3" strokeWidth="2.5" fill="none" opacity="0.5"/>
      {/* umbrella */}
      <rect x="118" y="350" width="6" height="90" fill="#8B4513"/>
      <path d="M80 355 Q121 310 160 355 Q140 345 121 342 Q100 345 80 355Z" fill="#FF6B35"/>
      <path d="M80 355 Q121 330 160 355" fill="#FFD700" opacity="0.8"/>
      {/* seashells */}
      {[60,200,400,560,700].map((x,i) => (
        <ellipse key={i} cx={x} cy={440} rx={8} ry={5} fill={['#FFB7C5','#FFE4B5','#DDA0DD','#B0E0E6','#FFA07A'][i]} opacity="0.8"/>
      ))}
      {/* seagulls */}
      {[150,280,420,560].map((x,i) => (
        <path key={i} d={`M${x} ${50+i*8} Q${x+15} ${44+i*8} ${x+28} ${50+i*8}`}
          stroke="#555" strokeWidth="2.5" fill="none"/>
      ))}
    </g>
  )
}

function CastleBg() {
  return (
    <g>
      {/* sky — stormy purple */}
      <rect x="0" y="0" width="800" height="280" fill="#4A3060"/>
      {/* dramatic clouds */}
      <ellipse cx="200" cy="80" rx="120" ry="60" fill="#3A2550" opacity="0.8"/>
      <ellipse cx="150" cy="65" rx="90" ry="45" fill="#2D1D40" opacity="0.9"/>
      <ellipse cx="600" cy="90" rx="130" ry="55" fill="#3A2550" opacity="0.8"/>
      <ellipse cx="640" cy="72" rx="85" ry="42" fill="#2D1D40" opacity="0.9"/>
      {/* lightning */}
      <path d="M420 20 L400 80 L415 80 L390 150" stroke="#FFE080" strokeWidth="3" opacity="0.6"/>
      {/* moon */}
      <circle cx="680" cy="65" r="42" fill="#E8D8B0" opacity="0.85"/>
      <circle cx="695" cy="58" r="33" fill="#4A3060"/>
      {/* stars */}
      {[50,120,200,320,480,540,620].map((x,i) => (
        <circle key={i} cx={x} cy={[25,45,30,55,35,20,40][i]} r="2" fill="white" opacity="0.5"/>
      ))}
      {/* ground */}
      <rect x="0" y="275" width="800" height="225" fill="#2D4A1E"/>
      <path d="M0 275 Q100 260 200 275 Q300 290 400 270 Q500 255 600 275 Q700 290 800 275 L800 310 L0 310Z" fill="#3A5F28"/>
      {/* moat */}
      <ellipse cx="400" cy="400" rx="350" ry="55" fill="#1A3A5C" opacity="0.8"/>
      <ellipse cx="400" cy="400" rx="300" ry="42" fill="#1E4A72" opacity="0.6"/>
      {/* castle body */}
      <rect x="150" y="130" width="500" height="200" fill="#6B7280"/>
      <rect x="150" y="120" width="500" height="18" fill="#4B5563"/>
      {/* battlements */}
      {Array.from({length:17}).map((_,i) => (
        <rect key={i} x={150+i*30} y={100} width={18} height={25} fill="#4B5563"/>
      ))}
      {/* towers */}
      {[{x:100,w:100,h:250},{x:600,w:100,h:250}].map(({x,w,h},i) => (
        <g key={i}>
          <rect x={x} y={100-h+250} width={w} height={h} fill="#52525B"/>
          {/* tower windows */}
          <rect x={x+30} y={100-h+280} width={40} height={55} rx="20 20 0 0" fill="#1A0A35" opacity="0.8"/>
          <rect x={x+30} y={100-h+360} width={40} height={55} rx="20 20 0 0" fill="#1A0A35" opacity="0.8"/>
          {/* crenellations */}
          {[0,1,2,3].map(j => (
            <rect key={j} x={x+j*28} y={100-h+248} width={18} height={22} fill="#3F3F46"/>
          ))}
          {/* cone roof */}
          <polygon points={`${x+50},${100-h+200} ${x},${100-h+250} ${x+100},${100-h+250}`} fill="#7C2D12"/>
          {/* flag */}
          <rect x={x+48} y={100-h+180} width={4} height={25} fill="#8B7355"/>
          <polygon points={`${x+52},${100-h+183} ${x+68},${100-h+190} ${x+52},${100-h+197}`} fill="#DC2626"/>
        </g>
      ))}
      {/* gate */}
      <rect x="310" y="270" width="180" height="130" rx="10 10 0 0" fill="#1A0A35"/>
      <path d="M310 270 Q400 220 490 270" fill="#374151"/>
      {/* portcullis bars */}
      {[0,1,2,3,4,5,6].map(i => (
        <rect key={i} x={320+i*24} y={272} width={8} height={125} fill="#555" opacity="0.7"/>
      ))}
      {[0,1,2,3].map(i => (
        <rect key={i} x={320} y={290+i*28} width={150} height={7} fill="#555" opacity="0.7"/>
      ))}
      {/* castle windows */}
      {[190,270,350,430,510,590].map((x,i) => (
        <rect key={i} x={x} y={160} width={40} height={55} rx="20 20 0 0"
          fill={i%3===0 ? '#FFE080' : '#1A0A35'} opacity="0.85"/>
      ))}
      {/* torch effects */}
      {[195,604].map((x,i) => (
        <g key={i}>
          <rect x={x} y={295} width="8" height="20" fill="#8B7355"/>
          <ellipse cx={x+4} cy={292} rx="7" ry="10" fill="#FF6B35" opacity="0.9"/>
          <ellipse cx={x+4} cy={290} rx="5" ry="8" fill="#FFD700" opacity="0.8"/>
        </g>
      ))}
    </g>
  )
}

export function BackgroundSvg({ theme, width = '100%', height = '100%', className }: BackgroundSvgProps) {
  return (
    <svg
      viewBox="0 0 800 500"
      width={width}
      height={height}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-label={`${theme} background`}
    >
      {theme === 'bedroom' && <BedroomBg/>}
      {theme === 'forest'  && <ForestBg/>}
      {theme === 'city'    && <CityBg/>}
      {theme === 'space'   && <SpaceBg/>}
      {theme === 'beach'   && <BeachBg/>}
      {theme === 'castle'  && <CastleBg/>}
    </svg>
  )
}
