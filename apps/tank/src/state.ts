import {EXTRA_DECOR} from './decorLibrary';
import {makeTerrain,normalizeTerrain,type Terrain} from './terrain';
import {natureForm,type NatureForm} from './nature';
export const uid=()=>Date.now()+Math.floor(Math.random()*1000000);
export const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export type Species={name:string; color:string; accent:string; body:'slim'|'round'|'angel'|'long'|'shrimp'|'snail'; length:number; school:boolean; zone:number; pace:number; pattern:'stripe'|'bars'|'spots'|'plain'|'koi'; note:string};
export const SPECIES:Species[]=[
{name:'Neon tetra',color:'#36cbdf',accent:'#ed414b',body:'slim',length:.46,school:true,zone:2.5,pace:1,pattern:'stripe',note:'Tiny, shimmering schools'},
{name:'Golden angelfish',color:'#e7cf80',accent:'#595c44',body:'angel',length:.8,school:false,zone:2.9,pace:.62,pattern:'bars',note:'Tall fins, unhurried turns'},
{name:'Orange discus',color:'#df8b43',accent:'#763e26',body:'round',length:.76,school:false,zone:2.2,pace:.55,pattern:'bars',note:'Graceful, slow explorers'},
{name:'Red guppy',color:'#bccbba',accent:'#e25543',body:'slim',length:.49,school:false,zone:3.6,pace:1.05,pattern:'plain',note:'Flowing fans and curious bursts'},
{name:'Pearl gourami',color:'#b6c5aa',accent:'#394b45',body:'long',length:.78,school:false,zone:3.3,pace:.66,pattern:'spots',note:'Gentle surface wanderers'},
{name:'Harlequin rasbora',color:'#e7a078',accent:'#253b38',body:'slim',length:.46,school:true,zone:2.7,pace:.95,pattern:'koi',note:'Copper flashes in loose schools'},
{name:'Cardinal tetra',color:'#3aaef4',accent:'#e33044',body:'slim',length:.47,school:true,zone:2.3,pace:1,pattern:'stripe',note:'Electric blue and ruby red'},
{name:'Ember tetra',color:'#f79143',accent:'#e6b554',body:'slim',length:.34,school:true,zone:2.1,pace:.9,pattern:'plain',note:'Little amber sparks'},
{name:'Celestial pearl danio',color:'#567575',accent:'#f4c48b',body:'slim',length:.38,school:true,zone:1.8,pace:1.05,pattern:'spots',note:'Speckled, inquisitive swimmers'},
{name:'Zebra danio',color:'#c9d8c9',accent:'#304c6c',body:'long',length:.48,school:true,zone:3.8,pace:1.3,pattern:'stripe',note:'Lively upper-water schools'},
{name:'Corydoras',color:'#baa485',accent:'#544c3f',body:'long',length:.5,school:true,zone:.35,pace:.65,pattern:'spots',note:'Bottom explorers with little barbels'},
{name:'Bristlenose pleco',color:'#6d6650',accent:'#bfaa78',body:'long',length:.7,school:false,zone:.22,pace:.4,pattern:'spots',note:'A quiet substrate grazer'},
{name:'Blue ram',color:'#7cbfbf',accent:'#e2bc54',body:'round',length:.56,school:false,zone:1.4,pace:.75,pattern:'spots',note:'Colorful, curious peckers'},
{name:'Boesemani rainbowfish',color:'#688dce',accent:'#e6a343',body:'long',length:.72,school:true,zone:2.8,pace:1.05,pattern:'koi',note:'Blue-to-gold iridescence'},
{name:'Koi angelfish',color:'#e7e0c9',accent:'#dc8635',body:'angel',length:.82,school:false,zone:2.5,pace:.6,pattern:'koi',note:'Marbled fins and elegant glides'},
{name:'Emerald betta',color:'#42ab9c',accent:'#286b79',body:'long',length:.6,school:false,zone:3.2,pace:.65,pattern:'plain',note:'Long fins in a peaceful sandbox'},
{name:'Cherry shrimp',color:'#c75644',accent:'#f2a583',body:'shrimp',length:.27,school:false,zone:.13,pace:.3,pattern:'plain',note:'Tiny grazing companions'},
{name:'Nerite snail',color:'#a78b52',accent:'#3b352c',body:'snail',length:.23,school:false,zone:.1,pace:.08,pattern:'bars',note:'Slow little substrate wanderers'},
{name:'Fantail goldfish',color:'#e9ac49',accent:'#dd7134',body:'round',length:.92,school:false,zone:2.2,pace:.6,pattern:'koi',note:'Round body, flowing double tail'}
];
export type DecorSpec={name:string; category:'Plants'|'Stone'|'Wood'|'Ornaments'; shape:string; color:string; height:number; width:number; note:string};
export const DECOR:DecorSpec[]=[
 {
  "name": "Feathery stems",
  "category": "Plants",
  "shape": "stem",
  "color": "#497546",
  "height": 2.2,
  "width": 0.7,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Broadleaf rosette",
  "category": "Plants",
  "shape": "sword",
  "color": "#497546",
  "height": 1.4,
  "width": 1,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Red stem grove",
  "category": "Plants",
  "shape": "stem",
  "color": "#497546",
  "height": 1.8,
  "width": 0.8,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Limestone crag",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 1.2,
  "width": 1,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Branching driftwood",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 1.7,
  "width": 1.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Mossy limestone",
  "category": "Stone",
  "shape": "moss",
  "color": "#7b7560",
  "height": 0.75,
  "width": 1,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Tall broadleaf clump",
  "category": "Plants",
  "shape": "sword",
  "color": "#497546",
  "height": 2.2,
  "width": 1,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Ribbon grass",
  "category": "Plants",
  "shape": "grass",
  "color": "#497546",
  "height": 2.7,
  "width": 0.8,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Low broadleaf clump",
  "category": "Plants",
  "shape": "anubias",
  "color": "#497546",
  "height": 0.7,
  "width": 1,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Carpet planting",
  "category": "Plants",
  "shape": "grass",
  "color": "#497546",
  "height": 0.3,
  "width": 1,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Broadleaf accent",
  "category": "Plants",
  "shape": "sword",
  "color": "#497546",
  "height": 1.1,
  "width": 0.8,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Feathery background grove",
  "category": "Plants",
  "shape": "stem",
  "color": "#497546",
  "height": 2.4,
  "width": 1,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Broadleaf foreground",
  "category": "Plants",
  "shape": "anubias",
  "color": "#497546",
  "height": 0.5,
  "width": 0.6,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Red stem thicket",
  "category": "Plants",
  "shape": "stem",
  "color": "#497546",
  "height": 2.1,
  "width": 0.9,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Broadleaf centerpiece",
  "category": "Plants",
  "shape": "lotus",
  "color": "#497546",
  "height": 1.6,
  "width": 1,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Moss cushion",
  "category": "Plants",
  "shape": "balls",
  "color": "#497546",
  "height": 0.25,
  "width": 0.8,
  "note": "Natural photographic planting \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Dragon stone",
  "category": "Stone",
  "shape": "dragon",
  "color": "#7b7560",
  "height": 1.4,
  "width": 0.9,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Low limestone",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 0.4,
  "width": 1.1,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Dark dragon stone",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 1.1,
  "width": 1,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Wide limestone",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 0.8,
  "width": 1.3,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Limestone pinnacle",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 1.8,
  "width": 0.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Root tangle",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 1.4,
  "width": 1.7,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Low driftwood",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 0.7,
  "width": 1.7,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Sculptural root",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 1.3,
  "width": 1.7,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Mossy branching wood",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 1.8,
  "width": 1.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Dragon stone accent",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 0.75,
  "width": 0.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Limestone accent",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 0.9,
  "width": 0.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Driftwood canopy",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 1.7,
  "width": 1.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Fine root shelter",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 1.4,
  "width": 1.5,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Dragon stone ridge",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 1.1,
  "width": 1.2,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Tall limestone",
  "category": "Stone",
  "shape": "rock",
  "color": "#7b7560",
  "height": 1.6,
  "width": 0.8,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 },
 {
  "name": "Root shelter",
  "category": "Wood",
  "shape": "branch",
  "color": "#7b7560",
  "height": 0.8,
  "width": 1.4,
  "note": "Natural photographic hardscape \u00b7 shape and recolor in the inspector"
 }
];
DECOR.push(...EXTRA_DECOR);
export const FLOOR_MATERIALS=[{name:'Sand',index:0},{name:'Gravel',index:4},{name:'Lava rock',index:5},{name:'Aquasoil',index:6}];
export function floorMaterial(i:number){return [6,20,21].includes(i)?6:[5,24,25].includes(i)?5:SUBSTRATES[i].grain>.03?4:0;}
export const SUBSTRATES=[{name:'River sand',color:'#a29d82',grain:.018},{name:'Black sand',color:'#323735',grain:.015},{name:'Warm sand',color:'#b59b72',grain:.02},{name:'White sand',color:'#d1cdb5',grain:.014},{name:'Natural gravel',color:'#8b8878',grain:.065},{name:'Volcanic gravel',color:'#514a43',grain:.06},{name:'Clay aquasoil',color:'#695444',grain:.038},{name:'Rose quartz gravel',color:'#b1a097',grain:.055},{name:'Pearl sand',color:'#ede5cf',grain:.014},{name:'Copper gravel',color:'#ab6a43',grain:.08},{name:'Midnight slate',color:'#26394b',grain:.09},{name:'Jade gravel',color:'#557b6b',grain:.07},{name:'Coral sand',color:'#c78e80',grain:.016},{name:'Golden riverbed',color:'#bba65b',grain:.045},{name:'Purple crystal',color:'#807294',grain:.075},{name:'Silver pebbles',color:'#aeb8ba',grain:.09},{name:'Sugar-white sand',color:'#eee9dd',grain:.012},{name:'Tahitian black sand',color:'#202b2f',grain:.014},{name:'Lagoon blue sand',color:'#438493',grain:.015},{name:'Forest green sand',color:'#466c56',grain:.016},{name:'Chestnut aquasoil',color:'#74533a',grain:.038},{name:'Walnut aquasoil',color:'#3f332c',grain:.038},{name:'Mixed river pebbles',color:'#9d8972',grain:.10},{name:'Pearl pebbles',color:'#d6d5ca',grain:.10},{name:'Red lava gravel',color:'#9f4c37',grain:.085},{name:'Obsidian gravel',color:'#292a30',grain:.085},{name:'Seashell sand',color:'#dbcaac',grain:.025},{name:'Coral gravel',color:'#d1a99a',grain:.08}];
export const BUBBLE_STYLES=['Soft stream','Bubble wall','Fine mist','Spiral','Gentle pulses','Bubble ring'] as const;
export type FishItem={id:number;kind:number;size:number;hue?:number};
export type Decoration={id:number;kind:number;x:number;y:number;size:number;flip:boolean;rotation:number;tilt?:number;elevation?:number;glassColor?:string;form?:NatureForm};
export type Bubbler={id:number;x:number;depth:number;power:number;size:number;style:number;width:number};
export type Tone={id:number;frequency:number;volume:number;texture:'Warm pad'|'Pure tone'|'Singing bowl'|'Airy pad'};
export type AudioSettings={master:number;water:number;rain:number;ocean:number;bubbles:number;chimes:number;tones:Tone[];breath:boolean;breathSeconds:number;visualSync:boolean;timer:number};
export type TankState={version:2;fish:FishItem[];decor:Decoration[];bubblers:Bubbler[];substrate:number;color:string;brightness:number;angle:number;caustics:number;waveSpeed:number;waveSize:number;waveDepth:number;waveMotion:number;speed:number;current:number;paused:boolean;audio:AudioSettings;drift:boolean;terrain:Terrain};
export const defaultAudio:AudioSettings={master:55,water:25,rain:4,ocean:39,bubbles:57,chimes:8,tones:[{id:1,frequency:432,volume:25,texture:'Warm pad'}],breath:false,breathSeconds:10,visualSync:true,timer:0};
export const initial:TankState={version:2,terrain:makeTerrain(),fish:[...Array.from({length:8},(_,i)=>({id:100+i,kind:0,size:1})),{id:120,kind:1,size:1},{id:121,kind:2,size:1},...Array.from({length:4},(_,i)=>({id:130+i,kind:5,size:1})),{id:140,kind:10,size:1},{id:141,kind:16,size:1},{id:142,kind:17,size:1},{id:143,kind:18,size:1}],decor:[{id:1,kind:0,x:.1,y:.83,size:1.1,flip:false,rotation:0},{id:2,kind:1,x:.27,y:.9,size:.9,flip:false,rotation:15},{id:3,kind:4,x:.33,y:.85,size:1.1,flip:false,rotation:-10},{id:4,kind:3,x:.65,y:.91,size:1,flip:false,rotation:0},{id:5,kind:7,x:.9,y:.83,size:1,flip:false,rotation:0},{id:6,kind:2,x:.76,y:.84,size:1,flip:false,rotation:0},{id:7,kind:5,x:.5,y:.95,size:.8,flip:false,rotation:0}],bubblers:[{id:1,x:.5,depth:.1,power:35,size:22,style:1,width:86}],substrate:0,color:'#c5f3ee',brightness:70,angle:40,caustics:35,waveSpeed:60,waveSize:100,waveDepth:70,waveMotion:60,speed:35,current:25,paused:false,audio:structuredClone(defaultAudio),drift:true};
const num=(v:unknown,d:number,a:number,b:number)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,a,b):d;
export function sanitizeAudio(v:any):AudioSettings{v=v&&typeof v==='object'?v:{};return {...defaultAudio,...Object.fromEntries(['master','water','rain','ocean','bubbles','chimes'].map(k=>[k,num(v[k],(defaultAudio as any)[k],0,100)])),tones:Array.isArray(v.tones)?v.tones.slice(0,4).filter((t:any)=>t&&typeof t==='object').map((t:any,i:number)=>({id:num(t.id,i+1,0,Number.MAX_SAFE_INTEGER),frequency:num(t.frequency,432,40,1200),volume:num(t.volume,20,0,100),texture:['Warm pad','Pure tone','Singing bowl','Airy pad'].includes(t.texture)?t.texture:'Warm pad'})):structuredClone(defaultAudio.tones),breath:!!v.breath,visualSync:v.visualSync!==false,breathSeconds:num(v.breathSeconds,10,6,20),timer:num(v.timer,0,0,120)};}
export function normalize(raw:any):TankState{
 if(!raw||typeof raw!=='object')return structuredClone(initial);
 const v=raw;const legacy=Array.isArray(v.fish)&&v.fish.every((f:any)=>typeof f==='number');
 const fish=legacy?v.fish.slice(0,6).flatMap((n:number,kind:number)=>Array.from({length:num(n,0,0,60)},(_,i)=>({id:1000+kind*100+i,kind,size:1}))):v.fish;
 const unique=(a:any[])=>a.filter((x,i)=>a.findIndex(y=>y.id===x.id)===i);
 return {...initial,version:2,fish:Array.isArray(fish)?unique(fish.filter(f=>f&&Number.isInteger(f.kind)&&SPECIES[f.kind]).slice(0,80).map((f:any,i:number)=>({id:num(f.id,1000+i,0,Number.MAX_SAFE_INTEGER),kind:f.kind,size:num(f.size,1,.4,2.5),hue:num(f.hue,0,-180,180)}))):structuredClone(initial.fish),decor:Array.isArray(v.decor)?unique(v.decor.filter((d:any)=>d&&Number.isInteger(d.kind)&&DECOR[d.kind]).slice(0,180).map((d:any,i:number)=>({id:num(d.id,i,0,Number.MAX_SAFE_INTEGER),kind:d.kind,x:num(d.x,.5,-.5,1.5),y:num(d.y,.9,.73,.98),size:num(d.size,1,.2,6),flip:!!d.flip,rotation:num(d.rotation,0,-180,180),tilt:num(d.tilt,0,-180,180),elevation:num(d.elevation,0,0,6),glassColor:typeof d.glassColor==='string'&&/^#[a-f\d]{6}$/i.test(d.glassColor)?d.glassColor:'#48cbea',form:natureForm(d.form||{moss:[5,24].includes(d.kind)?60:0})}))):structuredClone(initial.decor),bubblers:Array.isArray(v.bubblers)?unique(v.bubblers.filter((b:any)=>b&&typeof b==='object').slice(0,8).map((b:any,i:number)=>({id:num(b.id,i,0,Number.MAX_SAFE_INTEGER),x:num(b.x,.5,.03,.97),depth:num(b.depth,.3,0,1),power:num(b.power,35,0,100),size:num(b.size,25,0,100),style:Math.round(num(b.style,0,0,5)),width:num(b.width,60,10,100)}))):structuredClone(initial.bubblers),substrate:Math.round(num(v.substrate,0,0,27)),color:typeof v.color==='string'&&/^#[a-f\d]{6}$/i.test(v.color)?v.color:initial.color,brightness:num(v.brightness,70,10,100),angle:num(v.angle,40,0,100),caustics:num(v.caustics,35,0,100),waveSpeed:num(v.waveSpeed,60,0,150),waveSize:num(v.waveSize,100,60,180),waveDepth:num(v.waveDepth,70,0,100),waveMotion:num(v.waveMotion,60,0,100),speed:num(v.speed,35,5,100),current:num(v.current,25,0,100),paused:false,audio:sanitizeAudio(v.audio),terrain:normalizeTerrain(v.terrain,Math.round(num(v.substrate,0,0,27))),drift:v.drift!==false};
}
export type Selection={type:'fish'|'decor'|'bubbler';id:number}|null;
export const AUDIO_PRESETS:Record<string,Partial<AudioSettings>>={
'Quiet water':{water:32,rain:0,ocean:0,bubbles:12,chimes:0,tones:[]},
'Grounding':{water:12,rain:18,ocean:0,bubbles:0,chimes:5,tones:[{id:1,frequency:396,volume:20,texture:'Warm pad'}]},
'Heart space':{water:0,rain:0,ocean:20,bubbles:0,chimes:12,tones:[{id:1,frequency:528,volume:18,texture:'Singing bowl'},{id:2,frequency:264,volume:12,texture:'Warm pad'}]},
'Clear mind':{water:10,rain:0,ocean:0,bubbles:0,chimes:12,tones:[{id:1,frequency:639,volume:16,texture:'Airy pad'}]},
'Deep rest':{water:0,rain:25,ocean:16,bubbles:0,chimes:0,tones:[{id:1,frequency:174,volume:18,texture:'Warm pad'}]},
'Pure 432':{water:0,rain:0,ocean:0,bubbles:0,chimes:0,tones:[{id:1,frequency:432,volume:20,texture:'Pure tone'}]}
};
