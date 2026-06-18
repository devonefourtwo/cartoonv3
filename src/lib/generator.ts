/**
 * generator.ts
 * Converts a text prompt → complete 30-scene 5-minute film.
 * No AI. Uses keyword detection + story templates.
 * Voices: Web Speech API (browser built-in, free).
 * Music:  Web Audio API (browser built-in, free).
 */

export type BgTheme  = 'bedroom'|'forest'|'city'|'space'|'beach'|'castle'
export type CharTpl  = 'hero'|'heroine'|'wizard'|'villain'|'animal'|'robot'
export type Emotion  = 'happy'|'sad'|'surprised'|'angry'|'neutral'
export type Position = 'far-left'|'left'|'center'|'right'|'far-right'
export type Anim     = 'slide-left'|'slide-right'|'bounce-in'|'fade-in'|'zoom-in'|'none'
export type MusicMood= 'adventure'|'mystery'|'wonder'|'tense'|'peaceful'|'triumphant'

export interface GenCharacter {
  id:            string
  name:          string
  template:      CharTpl
  primaryColor:  string
  secondaryColor:string
  voicePitch:    number
  voiceRate:     number
}

export interface GenDialogue {
  characterId: string
  text:        string
  emotion:     Emotion
}

export interface GenScene {
  sceneNumber:  number
  title:        string
  description:  string
  background:   BgTheme
  dialogue:     GenDialogue[]
  placements:   { characterId: string; position: Position; size: 'small'|'medium'|'large'; facing: 'forward'|'left'|'right' }[]
  duration:     number
  animation:    Anim
  musicMood:    MusicMood
}

export interface GeneratedFilm {
  title:      string
  prompt:     string
  characters: GenCharacter[]
  scenes:     GenScene[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme detection
// ─────────────────────────────────────────────────────────────────────────────
type Theme = 'fantasy'|'space'|'ocean'|'friendship'|'mystery'

const THEME_KEYWORDS: Record<Theme, string[]> = {
  fantasy:    ['dragon','magic','castle','wizard','spell','quest','knight','fairy','kingdom','sword','potion','wand','elf','dwarf','goblin','enchant'],
  space:      ['space','star','planet','rocket','alien','galaxy','moon','astronaut','comet','nebula','orbit','ufo','mars','cosmos'],
  ocean:      ['ocean','sea','fish','underwater','mermaid','whale','coral','treasure','pirate','island','beach','dolphin','submarine','deep'],
  mystery:    ['mystery','secret','hidden','ghost','clue','detective','puzzle','dark','shadow','strange','unknown','investigate','haunted'],
  friendship: ['friend','together','lonely','help','trust','team','partner','bond','share','kindness','courage','believe'],
}

function detectTheme(prompt: string): Theme {
  const lower = prompt.toLowerCase()
  let best: Theme = 'fantasy'; let bestScore = 0
  for (const [theme, kws] of Object.entries(THEME_KEYWORDS) as [Theme,string[]][]) {
    const score = kws.reduce((s, kw) => s + (lower.includes(kw) ? 1 : 0), 0)
    if (score > bestScore) { bestScore = score; best = theme }
  }
  return best
}

// ─────────────────────────────────────────────────────────────────────────────
// Name extraction
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_HERO_NAMES     = ['Zara','Finn','Luna','Kai','Nova','Eli','Mira','Theo']
const DEFAULT_SIDEKICK_NAMES = ['Spark','Pip','Blaze','Echo','Glim','Rumi','Taz','Bolt']

function extractNames(prompt: string): [string, string] {
  const words = prompt.split(/\s+/)
  const proper = words
    .filter((w, i) => i > 0 && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() && w.length > 2)
    .map(w => w.replace(/[^a-zA-Z]/g,''))
    .filter(w => w.length > 2)
  const heroName     = proper[0] ?? DEFAULT_HERO_NAMES[Math.floor(Math.random()*DEFAULT_HERO_NAMES.length)]
  const sidekickName = proper[1] ?? DEFAULT_SIDEKICK_NAMES[Math.floor(Math.random()*DEFAULT_SIDEKICK_NAMES.length)]
  return [heroName, sidekickName]
}

// ─────────────────────────────────────────────────────────────────────────────
// Character builder
// ─────────────────────────────────────────────────────────────────────────────
const THEME_CHARS: Record<Theme, [CharTpl,CharTpl]> = {
  fantasy:    ['hero','wizard'],
  space:      ['robot','hero'],
  ocean:      ['heroine','animal'],
  friendship: ['hero','heroine'],
  mystery:    ['heroine','animal'],
}

const CHAR_COLORS: Record<CharTpl, [string,string]> = {
  hero:    ['#3B82F6','#F59E0B'],
  heroine: ['#8B5CF6','#EC4899'],
  wizard:  ['#1E40AF','#6D28D9'],
  villain: ['#1F2937','#DC2626'],
  animal:  ['#D97706','#FDE68A'],
  robot:   ['#6B7280','#10B981'],
}

const CHAR_VOICE: Record<CharTpl, [number,number]> = {
  // [pitch, rate]
  hero:    [0.9,  1.0],
  heroine: [1.3,  1.05],
  wizard:  [0.65, 0.9],
  villain: [0.5,  0.85],
  animal:  [1.6,  1.1],
  robot:   [0.7,  0.85],
}

function buildCharacters(theme: Theme, heroName: string, sidekickName: string): GenCharacter[] {
  const [heroTpl, sideTpl] = THEME_CHARS[theme]
  const [hp, hs] = CHAR_COLORS[heroTpl]
  const [sp, ss] = CHAR_COLORS[sideTpl]
  const [hPitch, hRate] = CHAR_VOICE[heroTpl]
  const [sPitch, sRate] = CHAR_VOICE[sideTpl]
  return [
    { id:'hero',     name:heroName,     template:heroTpl, primaryColor:hp, secondaryColor:hs, voicePitch:hPitch, voiceRate:hRate },
    { id:'sidekick', name:sidekickName, template:sideTpl, primaryColor:sp, secondaryColor:ss, voicePitch:sPitch, voiceRate:sRate },
  ]
}

// ─────────────────────────────────────────────────────────────────────────────
// Story templates  (30 scenes each)
// ─────────────────────────────────────────────────────────────────────────────
interface SceneTpl {
  title:       string
  desc:        string
  bg:          BgTheme
  hPos:        Position
  sPos:        Position
  dlg:         { who:'H'|'S'|'N'; text:string; emotion:Emotion }[]
  dur:         number
  anim:        Anim
  music:       MusicMood
  onlyHero?:   boolean
}

const FANTASY_TEMPLATE: SceneTpl[] = [
  { title:'A Normal Morning',           desc:'H wakes up at home.',         bg:'bedroom', hPos:'center', sPos:'left',      dlg:[{who:'H',text:'Another beautiful morning!',emotion:'happy'}], dur:8000,  anim:'fade-in',    music:'peaceful',    onlyHero:true },
  { title:'Something Glows',            desc:'A strange light appears.',     bg:'bedroom', hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'What is that glowing thing?!',emotion:'surprised'}], dur:9000,  anim:'zoom-in',    music:'wonder',      onlyHero:true },
  { title:'The Map Appears',            desc:'A magical map materialises.',  bg:'bedroom', hPos:'center', sPos:'left',      dlg:[{who:'H',text:'A map... it says go to the forest!',emotion:'surprised'}], dur:9000, anim:'bounce-in', music:'wonder', onlyHero:true },
  { title:'Leaving Home',               desc:'H sets off on the journey.',   bg:'forest',  hPos:'left',   sPos:'center',    dlg:[{who:'H',text:'Whatever this leads to, I must find out.',emotion:'neutral'}], dur:8000, anim:'slide-left', music:'adventure', onlyHero:true },
  { title:'Into the Forest',            desc:'The forest is vast and deep.', bg:'forest',  hPos:'center', sPos:'right',     dlg:[{who:'H',text:'The forest feels alive today.',emotion:'neutral'}], dur:9000,  anim:'slide-left', music:'wonder' },
  { title:'A Strange Voice',            desc:'H hears something nearby.',    bg:'forest',  hPos:'left',   sPos:'right',     dlg:[{who:'S',text:'Hello? Is somebody there?',emotion:'surprised'},{who:'H',text:'Who said that?!',emotion:'surprised'}], dur:10000, anim:'slide-right', music:'wonder' },
  { title:'First Meeting',              desc:'They come face to face.',      bg:'forest',  hPos:'left',   sPos:'right',     dlg:[{who:'S',text:'I am {sidekick}. I have waited for you!'},{who:'H',text:'Me? Why me?',emotion:'surprised'}], dur:10000, anim:'bounce-in', music:'adventure', emotion:'neutral' } as SceneTpl,
  { title:'The Prophecy',               desc:'S explains the mission.',      bg:'forest',  hPos:'left',   sPos:'right',     dlg:[{who:'S',text:'A dragon has stolen the kingdom\'s light.',emotion:'sad'},{who:'H',text:'That\'s terrible! We have to help.',emotion:'angry'}], dur:11000, anim:'fade-in', music:'mystery' },
  { title:'Setting Off Together',       desc:'They begin the quest.',        bg:'forest',  hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'Let\'s go find that dragon!',emotion:'happy'},{who:'S',text:'Together we can do anything!',emotion:'happy'}], dur:10000, anim:'slide-left', music:'adventure' },
  { title:'The Enchanted River',        desc:'A magical river blocks them.', bg:'forest',  hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'The river is too wide to cross.',emotion:'sad'},{who:'S',text:'I know a trick. Watch closely!',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'wonder' },
  { title:'S Casts a Spell',            desc:'The river parts like magic.',  bg:'forest',  hPos:'center', sPos:'left',      dlg:[{who:'S',text:'Abra-cadabra, river part!',emotion:'happy'},{who:'H',text:'Amazing! You really are magical!',emotion:'surprised'}], dur:9000, anim:'zoom-in', music:'wonder' },
  { title:'The Ancient City',           desc:'Ruins of an old kingdom.',     bg:'city',    hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'This city... it\'s abandoned.',emotion:'sad'},{who:'S',text:'The dragon\'s curse did this.',emotion:'sad'}], dur:10000, anim:'fade-in', music:'mystery' },
  { title:'A Hidden Clue',              desc:'They find an inscription.',    bg:'city',    hPos:'center', sPos:'left',      dlg:[{who:'S',text:'This says the dragon lives in the sky castle!',emotion:'surprised'},{who:'H',text:'Then that is where we go!',emotion:'neutral'}], dur:10000, anim:'slide-right', music:'mystery' },
  { title:'The Villain Appears',        desc:'A dark figure blocks the way.',bg:'city',    hPos:'left',   sPos:'right',     dlg:[{who:'N',text:'You shall not pass!',emotion:'angry'},{who:'H',text:'We won\'t be stopped!',emotion:'angry'}], dur:10000, anim:'slide-left', music:'tense' },
  { title:'The First Battle',           desc:'H and S face the enemy.',      bg:'city',    hPos:'left',   sPos:'right',     dlg:[{who:'S',text:'Duck, {hero}!',emotion:'angry'},{who:'H',text:'I\'ve got it! Together now!',emotion:'angry'}], dur:11000, anim:'zoom-in', music:'tense' },
  { title:'Outwitting the Enemy',       desc:'They escape using cleverness.', bg:'castle', hPos:'center', sPos:'left',      dlg:[{who:'H',text:'The east gate! Run!',emotion:'surprised'},{who:'S',text:'Brilliant thinking!',emotion:'happy'}], dur:9000, anim:'slide-right', music:'adventure' },
  { title:'The Castle Gates',           desc:'The sky castle looms above.',  bg:'castle',  hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'We made it... it\'s so tall.',emotion:'surprised'},{who:'S',text:'The dragon is inside. Be ready.',emotion:'neutral'}], dur:10000, anim:'fade-in', music:'tense' },
  { title:'Inside the Castle',          desc:'Dark halls filled with echoes.',bg:'castle', hPos:'left',   sPos:'right',     dlg:[{who:'S',text:'The stolen light must be in here.',emotion:'neutral'},{who:'H',text:'I can feel something pulling me forward.',emotion:'neutral'}], dur:10000, anim:'slide-left', music:'mystery' },
  { title:'The Dragon\'s Lair',         desc:'They find the dragon.',        bg:'castle',  hPos:'left',   sPos:'right',     dlg:[{who:'N',text:'Who dares enter MY castle?!',emotion:'angry'},{who:'H',text:'We came for the stolen light!',emotion:'angry'}], dur:11000, anim:'zoom-in', music:'tense' },
  { title:'Negotiating with the Dragon',desc:'H tries talking first.',       bg:'castle',  hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'Why did you take the kingdom\'s light?',emotion:'neutral'},{who:'N',text:'I... I was lonely.',emotion:'sad'}], dur:11000, anim:'fade-in', music:'mystery' },
  { title:'Understanding the Dragon',   desc:'A surprise revelation.',       bg:'castle',  hPos:'left',   sPos:'right',     dlg:[{who:'S',text:'You took it just to be noticed?',emotion:'surprised'},{who:'N',text:'Nobody ever visited my castle.',emotion:'sad'}], dur:11000, anim:'slide-right', music:'peaceful' },
  { title:'An Unexpected Kindness',     desc:'H offers the dragon friendship.',bg:'castle',hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'You don\'t need to be lonely anymore.',emotion:'happy'},{who:'N',text:'You... you mean that?',emotion:'surprised'}], dur:10000, anim:'bounce-in', music:'peaceful' },
  { title:'The Light Returns',          desc:'Magic cascades everywhere.',   bg:'castle',  hPos:'left',   sPos:'right',     dlg:[{who:'N',text:'Take it! I return the light freely.',emotion:'happy'},{who:'S',text:'The kingdom is saved!',emotion:'happy'}], dur:10000, anim:'zoom-in', music:'triumphant' },
  { title:'Leaving the Castle',         desc:'The three new friends depart.',bg:'forest',  hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'Come with us. You\'ll never be alone again.',emotion:'happy'},{who:'N',text:'I would like that very much.',emotion:'happy'}], dur:10000, anim:'slide-left', music:'triumphant' },
  { title:'The Forest Celebration',     desc:'Animals celebrate their return.',bg:'forest',hPos:'center', sPos:'left',      dlg:[{who:'S',text:'The whole forest is celebrating!',emotion:'happy'},{who:'H',text:'Because we did the right thing.',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'triumphant' },
  { title:'Back to the Kingdom',        desc:'The kingdom glows again.',     bg:'city',    hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'Look! Everyone has their light back.',emotion:'happy'},{who:'S',text:'And we made a new friend too.',emotion:'happy'}], dur:9000, anim:'fade-in', music:'triumphant' },
  { title:'A Hero\'s Welcome',          desc:'The kingdom cheers.',          bg:'city',    hPos:'center', sPos:'left',      dlg:[{who:'N',text:'Three cheers for {hero} and {sidekick}!',emotion:'happy'}], dur:9000, anim:'bounce-in', music:'triumphant' },
  { title:'Reflecting on the Journey',  desc:'They sit together at sunset.', bg:'beach',   hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'I never expected a quest like this.',emotion:'happy'},{who:'S',text:'The best adventures are the unexpected ones.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'peaceful' },
  { title:'A Promise',                  desc:'They make a pact of friendship.',bg:'beach', hPos:'left',   sPos:'right',     dlg:[{who:'H',text:'No matter what happens, we face it together.',emotion:'happy'},{who:'S',text:'Together, always.',emotion:'happy'}], dur:10000, anim:'zoom-in', music:'peaceful' },
  { title:'The End',                    desc:'A new chapter begins.',        bg:'bedroom', hPos:'center', sPos:'left',      dlg:[{who:'H',text:'I wonder what adventure comes next...',emotion:'happy'}], dur:10000, anim:'fade-in', music:'peaceful', onlyHero:true },
]

const SPACE_TEMPLATE: SceneTpl[] = [
  { title:'Mission Control',         desc:'H prepares for launch.',        bg:'bedroom', hPos:'center', sPos:'left',  dlg:[{who:'H',text:'All systems go. This is it!',emotion:'happy'}], dur:8000,  anim:'fade-in',    music:'adventure',   onlyHero:true },
  { title:'Countdown',               desc:'The rocket is ready.',          bg:'bedroom', hPos:'center', sPos:'left',  dlg:[{who:'H',text:'10... 9... 8... launching!',emotion:'surprised'}], dur:9000, anim:'zoom-in', music:'adventure', onlyHero:true },
  { title:'Entering Orbit',          desc:'Earth shrinks below.',          bg:'space',   hPos:'center', sPos:'right', dlg:[{who:'H',text:'The Earth looks tiny from up here!',emotion:'surprised'}], dur:9000, anim:'zoom-in', music:'wonder', onlyHero:true },
  { title:'First Contact',           desc:'A signal comes through.',       bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'Hello human. I am {sidekick}.',emotion:'neutral'},{who:'H',text:'A robot! Can you understand me?',emotion:'surprised'}], dur:10000, anim:'slide-right', music:'wonder' },
  { title:'New Crewmate',            desc:'S joins the mission.',          bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'I have been drifting alone for years.',emotion:'sad'},{who:'H',text:'Not anymore. Join my crew!',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'adventure' },
  { title:'The Red Planet',          desc:'Mars glows ahead.',             bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'Mars! Our first destination.',emotion:'happy'},{who:'S',text:'My sensors show life signs below.',emotion:'surprised'}], dur:10000, anim:'fade-in', music:'mystery' },
  { title:'Landing on Mars',         desc:'Dust storms swirl around them.',bg:'beach',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'Wind speed critical! Hold on!',emotion:'angry'},{who:'H',text:'We\'re landing hard!',emotion:'surprised'}], dur:10000, anim:'zoom-in', music:'tense' },
  { title:'Strange Footprints',      desc:'Something was here before.',    bg:'beach',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'These footprints are fresh.',emotion:'surprised'},{who:'S',text:'Something lives here.',emotion:'neutral'}], dur:10000, anim:'slide-left', music:'mystery' },
  { title:'The Martian Caves',       desc:'They follow the tracks inside.',bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'The tunnels go very deep.',emotion:'neutral'},{who:'H',text:'I\'m not turning back now.',emotion:'neutral'}], dur:10000, anim:'slide-left', music:'mystery' },
  { title:'Ancient Drawings',        desc:'Cave walls tell a story.',      bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'These drawings are thousands of years old!',emotion:'surprised'},{who:'S',text:'Mars had a civilisation once.',emotion:'sad'}], dur:11000, anim:'fade-in', music:'wonder' },
  { title:'A Distress Signal',       desc:'Someone needs help.',           bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'I detect a signal. Somebody is trapped!',emotion:'surprised'},{who:'H',text:'Show me the way!',emotion:'neutral'}], dur:10000, anim:'slide-right', music:'tense' },
  { title:'Cave In!',                desc:'The tunnel collapses.',         bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'The ceiling is falling!',emotion:'angry'},{who:'S',text:'Move! I will hold it up!',emotion:'angry'}], dur:10000, anim:'zoom-in', music:'tense' },
  { title:'S Holds the Ceiling',     desc:'Remarkable robot strength.',    bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'How are you doing that?!',emotion:'surprised'},{who:'S',text:'Hurry. I cannot hold it forever.',emotion:'neutral'}], dur:10000, anim:'bounce-in', music:'tense' },
  { title:'The Survivor',            desc:'A small alien is found.',       bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'N',text:'You came! You actually came!',emotion:'surprised'},{who:'H',text:'Are you alright? We\'re here to help.',emotion:'happy'}], dur:11000, anim:'fade-in', music:'peaceful' },
  { title:'The Last Martian',        desc:'N explains their history.',     bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'N',text:'I am the last of my kind.',emotion:'sad'},{who:'H',text:'Then you must come with us.',emotion:'happy'}], dur:11000, anim:'slide-right', music:'peaceful' },
  { title:'Escaping the Caves',      desc:'They race to the surface.',     bg:'beach',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'The whole cave is unstable!',emotion:'angry'},{who:'H',text:'Run! Don\'t stop!',emotion:'angry'}], dur:10000, anim:'slide-left', music:'tense' },
  { title:'Back on the Surface',     desc:'Safe at last.',                 bg:'beach',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'We made it! Everyone okay?',emotion:'happy'},{who:'N',text:'Thank you. You saved me.',emotion:'happy'}], dur:9000,  anim:'bounce-in', music:'triumphant' },
  { title:'Stargazing Together',     desc:'Three species under one sky.',  bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'N',text:'Your galaxy is beautiful.',emotion:'happy'},{who:'S',text:'All galaxies are beautiful.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'wonder' },
  { title:'Cosmic Storm',            desc:'A meteor shower approaches.',   bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'Meteor storm incoming!',emotion:'surprised'},{who:'H',text:'Evasive manoeuvres!',emotion:'angry'}], dur:10000, anim:'zoom-in', music:'tense' },
  { title:'S Navigates the Storm',   desc:'S flies brilliantly.',          bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'How are you so calm?!',emotion:'surprised'},{who:'S',text:'I process faster when under pressure.',emotion:'neutral'}], dur:10000, anim:'slide-right', music:'tense' },
  { title:'Through the Nebula',      desc:'Colours fill the viewport.',    bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'N',text:'I have never seen anything so beautiful!',emotion:'surprised'},{who:'H',text:'Neither have I.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'wonder' },
  { title:'A New Discovery',         desc:'An unknown planet appears.',    bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'This planet is not on any map.',emotion:'surprised'},{who:'H',text:'Then WE get to name it!',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'adventure' },
  { title:'Naming the Planet',       desc:'They choose the perfect name.', bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'N',text:'Call it New Hope.',emotion:'happy'},{who:'H',text:'New Hope. I love it.',emotion:'happy'}], dur:9000,  anim:'zoom-in', music:'triumphant' },
  { title:'Planting a Flag',         desc:'A monument to their journey.',  bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'For everyone who dares to explore!',emotion:'happy'},{who:'S',text:'Marking it on the star charts.',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'triumphant' },
  { title:'Heading Home',            desc:'Earth glows in the distance.',  bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'Home. I missed it.',emotion:'happy'},{who:'N',text:'Is that where we go next?',emotion:'surprised'}], dur:10000, anim:'fade-in', music:'peaceful' },
  { title:'Earth Comes Into View',   desc:'Blue and green and beautiful.', bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'S',text:'Earth. Coordinates locked.',emotion:'neutral'},{who:'H',text:'The most beautiful sight in the universe.',emotion:'happy'}], dur:10000, anim:'zoom-in', music:'peaceful' },
  { title:'A Hero\'s Return',        desc:'The crew land safely.',         bg:'city',    hPos:'left',   sPos:'right', dlg:[{who:'H',text:'We made it back!',emotion:'happy'},{who:'N',text:'Earth is even better than the stories!',emotion:'surprised'}], dur:9000,  anim:'bounce-in', music:'triumphant' },
  { title:'The Press Conference',    desc:'The world celebrates.',         bg:'city',    hPos:'center', sPos:'left',  dlg:[{who:'H',text:'We didn\'t just explore space. We made friends.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'triumphant' },
  { title:'A Quiet Evening',         desc:'The three friends at peace.',   bg:'bedroom', hPos:'left',   sPos:'right', dlg:[{who:'S',text:'This is what they call happiness.',emotion:'happy'},{who:'N',text:'Yes. I believe it is.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'peaceful' },
  { title:'Until Next Time',         desc:'The stars always call.',        bg:'space',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'The universe is big. And we have more to explore.',emotion:'happy'}], dur:10000, anim:'zoom-in', music:'adventure', onlyHero:true },
]

const OCEAN_TEMPLATE: SceneTpl[] = [
  { title:'By the Shore',            desc:'H watches the sea at dawn.',    bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'The ocean is calling me today.',emotion:'happy'}], dur:8000, anim:'fade-in', music:'peaceful', onlyHero:true },
  { title:'A Bottle Washes Up',      desc:'A message in a bottle.',        bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'A message? Someone needs help!',emotion:'surprised'}], dur:9000, anim:'zoom-in', music:'wonder', onlyHero:true },
  { title:'Diving Under',            desc:'H plunges into the sea.',       bg:'beach',   hPos:'center', sPos:'right', dlg:[{who:'H',text:'Here I go!',emotion:'happy'}], dur:8000, anim:'bounce-in', music:'adventure', onlyHero:true },
  { title:'Underwater World',        desc:'Colour everywhere.',            bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'It\'s like another world down here!',emotion:'surprised'},{who:'S',text:'Hello! You must be the one who found my message!',emotion:'happy'}], dur:11000, anim:'fade-in', music:'wonder' },
  { title:'S Explains',              desc:'An underwater mystery.',        bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'The coral reef is dying. We need the sunstone.',emotion:'sad'},{who:'H',text:'I will help you find it!',emotion:'happy'}], dur:11000, anim:'slide-right', music:'mystery' },
  { title:'The Deep Current',        desc:'A strong current sweeps them.', bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'I can\'t swim against this!',emotion:'angry'},{who:'S',text:'Grab my fin! I\'ll pull us through!',emotion:'neutral'}], dur:10000, anim:'zoom-in', music:'tense' },
  { title:'The Sunken City',         desc:'Ancient buildings below.',      bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'This city sank a thousand years ago.',emotion:'sad'},{who:'H',text:'It\'s beautiful... even like this.',emotion:'sad'}], dur:11000, anim:'slide-left', music:'mystery' },
  { title:'Friendly Fish',           desc:'Fish show them the way.',       bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'Are they guiding us somewhere?',emotion:'surprised'},{who:'S',text:'They know where the sunstone is!',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'wonder' },
  { title:'The Dark Trench',         desc:'Darkness below is terrifying.', bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'How deep does this go?',emotion:'sad'},{who:'S',text:'Deep enough to scare anyone. But we go on.',emotion:'neutral'}], dur:10000, anim:'fade-in', music:'tense' },
  { title:'Sea Monster!',            desc:'Something huge stirs below.',   bg:'space',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'Something is coming up!',emotion:'angry'},{who:'S',text:'Stay still. Don\'t move a muscle.',emotion:'angry'}], dur:10000, anim:'zoom-in', music:'tense' },
  { title:'The Whale',               desc:'A gentle giant swims past.',    bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'It\'s just a whale! A beautiful whale!',emotion:'happy'},{who:'S',text:'She knows us. She will help.',emotion:'happy'}], dur:10000, anim:'slide-right', music:'peaceful' },
  { title:'Riding the Whale',        desc:'They soar through the sea.',    bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'I never imagined this!',emotion:'happy'},{who:'S',text:'The ocean always surprises.',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'adventure' },
  { title:'The Sunstone Cave',       desc:'A glowing cave ahead.',         bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'There! The sunstone is inside!',emotion:'happy'},{who:'H',text:'Almost there...',emotion:'neutral'}], dur:9000, anim:'slide-left', music:'wonder' },
  { title:'Guardian of the Stone',   desc:'An octopus guards the entrance.',bg:'castle', hPos:'left',   sPos:'right', dlg:[{who:'N',text:'None shall take the sunstone!',emotion:'angry'},{who:'H',text:'We don\'t want to take it. Just borrow its light!',emotion:'neutral'}], dur:11000, anim:'zoom-in', music:'tense' },
  { title:'A Bargain is Made',       desc:'H offers something in return.', bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'If the reef heals, the whole sea benefits.',emotion:'neutral'},{who:'N',text:'...You speak truth. You may pass.',emotion:'neutral'}], dur:11000, anim:'fade-in', music:'peaceful' },
  { title:'Taking the Light',        desc:'They carry the sunstone gently.',bg:'castle', hPos:'left',   sPos:'right', dlg:[{who:'S',text:'Handle it gently. It is very old.',emotion:'neutral'},{who:'H',text:'I\'ve got it. Let\'s go.',emotion:'neutral'}], dur:10000, anim:'slide-right', music:'peaceful' },
  { title:'Racing to the Reef',      desc:'No time to lose.',              bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'The reef is fading fast!',emotion:'sad'},{who:'H',text:'We\'re almost there! Swim faster!',emotion:'angry'}], dur:10000, anim:'slide-left', music:'tense' },
  { title:'Placing the Sunstone',    desc:'The moment of truth.',          bg:'forest',  hPos:'center', sPos:'left',  dlg:[{who:'H',text:'Here goes...',emotion:'neutral'},{who:'S',text:'Please... please work.',emotion:'sad'}], dur:10000, anim:'zoom-in', music:'tense' },
  { title:'The Reef Awakens',        desc:'Colour explodes everywhere.',   bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'It\'s working! Look at the colours!',emotion:'happy'},{who:'H',text:'It\'s beautiful! It\'s really working!',emotion:'happy'}], dur:11000, anim:'bounce-in', music:'triumphant' },
  { title:'Sea Life Returns',        desc:'Fish pour back in.',            bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'H',text:'All the fish are coming back!',emotion:'happy'},{who:'S',text:'The reef is alive again!',emotion:'happy'}], dur:10000, anim:'fade-in', music:'triumphant' },
  { title:'The Octopus Thanks Them', desc:'The guardian changes its mind.',bg:'castle',  hPos:'left',   sPos:'right', dlg:[{who:'N',text:'You did what you promised. Thank you.',emotion:'happy'},{who:'H',text:'We did it together.',emotion:'happy'}], dur:10000, anim:'slide-right', music:'peaceful' },
  { title:'A Feast Under the Sea',   desc:'Every creature celebrates.',    bg:'forest',  hPos:'left',   sPos:'right', dlg:[{who:'S',text:'They are celebrating for us!',emotion:'happy'},{who:'H',text:'I could stay here forever.',emotion:'happy'}], dur:10000, anim:'bounce-in', music:'triumphant' },
  { title:'Time to Surface',         desc:'The world above awaits.',       bg:'beach',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'I have to go back up eventually.',emotion:'sad'},{who:'S',text:'But you will always know where to find me.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'peaceful' },
  { title:'Breaking the Surface',    desc:'Sunlight floods in.',           bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'The sea will never look the same to me.',emotion:'happy'}], dur:9000, anim:'zoom-in', music:'peaceful', onlyHero:true },
  { title:'Watching the Waves',      desc:'The ocean shimmers.',           bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'I know you\'re out there. Thank you.',emotion:'happy'}], dur:9000, anim:'fade-in', music:'peaceful', onlyHero:true },
  { title:'A New Purpose',           desc:'H decides to protect the sea.', bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'I am going to dedicate my life to this ocean.',emotion:'happy'}], dur:9000, anim:'slide-left', music:'peaceful', onlyHero:true },
  { title:'Word Spreads',            desc:'People hear the story.',        bg:'city',    hPos:'center', sPos:'left',  dlg:[{who:'H',text:'The ocean needs all of us.',emotion:'happy'}], dur:9000, anim:'bounce-in', music:'triumphant', onlyHero:true },
  { title:'The Movement Grows',      desc:'Many join the cause.',          bg:'city',    hPos:'left',   sPos:'right', dlg:[{who:'H',text:'Together we can save every reef.',emotion:'happy'},{who:'N',text:'We are with you!',emotion:'happy'}], dur:10000, anim:'fade-in', music:'triumphant' },
  { title:'Back to the Shore',       desc:'Home looks different now.',     bg:'beach',   hPos:'left',   sPos:'right', dlg:[{who:'H',text:'Every wave tells a story now.',emotion:'happy'},{who:'N',text:'What a story it is!',emotion:'happy'}], dur:10000, anim:'zoom-in', music:'peaceful' },
  { title:'The Ocean Remembers',     desc:'The sea glitters.',             bg:'beach',   hPos:'center', sPos:'left',  dlg:[{who:'H',text:'This is just the beginning.',emotion:'happy'}], dur:10000, anim:'fade-in', music:'peaceful', onlyHero:true },
]

// Mystery and Friendship templates are shorter versions that reuse backgrounds
const MYSTERY_TEMPLATE: SceneTpl[] = FANTASY_TEMPLATE.map((s,i) => ({
  ...s,
  bg: (['bedroom','city','forest','castle','space','city','forest','castle','city','forest','city','castle','city','bedroom','forest','city','castle','forest','city','castle','city','forest','bedroom','city','forest','beach','city','beach','forest','bedroom'] as BgTheme[])[i] ?? s.bg,
  music: (['peaceful','mystery','mystery','mystery','tense','tense','mystery','tense','mystery','tense','tense','tense','mystery','wonder','peaceful','tense','tense','mystery','tense','wonder','peaceful','peaceful','peaceful','triumphant','triumphant','triumphant','triumphant','peaceful','peaceful','wonder'] as MusicMood[])[i] ?? s.music,
}))

const FRIENDSHIP_TEMPLATE: SceneTpl[] = SPACE_TEMPLATE.map((s,i) => ({
  ...s,
  bg: (['bedroom','forest','city','forest','city','forest','beach','forest','city','forest','castle','forest','city','beach','forest','city','beach','forest','city','beach','forest','city','beach','forest','city','forest','city','beach','forest','bedroom'] as BgTheme[])[i] ?? s.bg,
}))

const TEMPLATES: Record<Theme, SceneTpl[]> = {
  fantasy:    FANTASY_TEMPLATE,
  space:      SPACE_TEMPLATE,
  ocean:      OCEAN_TEMPLATE,
  mystery:    MYSTERY_TEMPLATE,
  friendship: FRIENDSHIP_TEMPLATE,
}

// ─────────────────────────────────────────────────────────────────────────────
// Title builder
// ─────────────────────────────────────────────────────────────────────────────
const TITLE_PREFIXES: Record<Theme, string[]> = {
  fantasy:    ['The Quest of','The Legend of','The Magic of','The Tale of'],
  space:      ['Beyond the Stars:','Cosmic Journey:','Into the Galaxy:','The Space Adventure of'],
  ocean:      ['Beneath the Waves:','The Ocean Tale of','Deep Sea Adventure:','The Sea Story of'],
  mystery:    ['The Mystery of','The Secret of','Unravelling','The Hidden Truth of'],
  friendship: ['Together:','The Friendship of','Side by Side:','An Adventure with'],
}

function buildTitle(theme: Theme, heroName: string, sidekickName: string): string {
  const prefixes = TITLE_PREFIXES[theme]
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  return `${prefix} ${heroName} and ${sidekickName}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Scene builder
// ─────────────────────────────────────────────────────────────────────────────
function fillText(text: string, heroName: string, sidekickName: string): string {
  return text
    .replace(/\{hero\}/gi, heroName)
    .replace(/\{sidekick\}/gi, sidekickName)
}

function buildScenes(
  template: SceneTpl[],
  heroId: string,
  sidekickId: string,
  heroName: string,
  sidekickName: string,
): GenScene[] {
  return template.map((tpl, i) => {
    const dialogue: GenDialogue[] = tpl.dlg.map(d => ({
      characterId: d.who === 'H' ? heroId : d.who === 'S' ? sidekickId : heroId,
      text: fillText(d.text, heroName, sidekickName),
      emotion: d.emotion ?? 'neutral',
    }))

    const placements = tpl.onlyHero
      ? [{ characterId: heroId, position: tpl.hPos, size: 'medium' as const, facing: 'forward' as const }]
      : [
          { characterId: heroId,     position: tpl.hPos, size: 'medium' as const, facing: tpl.hPos === 'right' ? 'left' as const : 'forward' as const },
          { characterId: sidekickId, position: tpl.sPos, size: 'medium' as const, facing: tpl.sPos === 'left'  ? 'right' as const : 'forward' as const },
        ]

    return {
      sceneNumber:  i + 1,
      title:        fillText(tpl.title, heroName, sidekickName),
      description:  fillText(tpl.desc,  heroName, sidekickName),
      background:   tpl.bg,
      dialogue,
      placements,
      duration:     tpl.dur,
      animation:    tpl.anim,
      musicMood:    tpl.music,
    }
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────
export function generateFilm(prompt: string): GeneratedFilm {
  const theme                = detectTheme(prompt)
  const [heroName, sideName] = extractNames(prompt)
  const characters           = buildCharacters(theme, heroName, sideName)
  const hero                 = characters[0]
  const sidekick             = characters[1]
  const template             = TEMPLATES[theme]
  const scenes               = buildScenes(template, hero.id, sidekick.id, hero.name, sidekick.name)

  return {
    title:      buildTitle(theme, hero.name, sidekick.name),
    prompt,
    characters,
    scenes,
  }
}

export function filmDuration(film: GeneratedFilm): number {
  return film.scenes.reduce((s, sc) => s + sc.duration, 0)
}
