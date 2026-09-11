// Append-only IDs preserve older saved layouts.
export const EXTRA_START=32;
export const BASE_NAMES=['Galleon wreck','Broken pirate hull','Submarine wreck','Airplane wreck','Stone arch bridge','Red Japanese bridge','Rope bridge','Fallen Roman columns','Monolithic temple','Mayan pyramid ruin','Easter Island head','Sunken castle','Treasure chest','SpongeBob pineapple house','Squidward house','Krusty Krab','Holey limestone arch','Dragon stone spire','Black lava tunnel','Stacked slate cave','White quartz cluster','Red canyon rock','River boulder pile','Petrified wood arch','Spiderwood branches','Twisted bogwood','Root stump cave','Hollow fallen log','Bonsai driftwood','Mangrove roots','Coconut cave','Moss balls','Java fern','Anubias nana','Amazon sword','Vallisneria','Red Ludwigia','Pink Rotala','Cabomba','Water wisteria','Brown Cryptocoryne','Purple Bucephalandra','Dwarf hairgrass','Monte Carlo carpet','Tiger lotus','Banana plant','Flame moss','Hornwort'];
export const UFO_KIND=EXTRA_START+48+144;
export function newBase(kind:number){return kind>=226?48+kind-226:kind<80?kind-32:Math.floor((kind-80)/3);}
export function kitVariant(kind:number){return kind>=80&&kind<UFO_KIND?(kind-80)%3:-1;}
export const EXTRA_DECOR=[...BASE_NAMES.map((name,i)=>({name,category:(i>=31?'Plants':i>=24&&i<=29?'Wood':i>=16&&i<=23?'Stone':'Ornaments') as 'Plants'|'Wood'|'Stone'|'Ornaments',shape:i>=31?'stem':i===12?'chest':i===4?'arch':i<16?'ruin':'rock',color:i>=31?'#50b98c':'#a79783',height:i>=31?1.5:1.6,width:i>=31?1:1.8,note:'Individual decoration'})),...BASE_NAMES.flatMap((name,i)=>['Fern garden','Rocky cove','Moss & roots'].map((style,j)=>({name:name+' · '+style,category:(i>=31?'Plants':i>=24&&i<=29?'Wood':i>=16&&i<=23?'Stone':'Ornaments') as 'Plants'|'Wood'|'Stone'|'Ornaments',shape:i>=31?'stem':'ruin',color:'#65ab90',height:1.8,width:2.3,note:'Scene kit · several pieces arranged together'}))),{name:'Bustin Rocks · hanging UFO',category:'Ornaments' as const,shape:'ufo',color:'#e873ff',height:1,width:1.8,note:'Neon saucer on a swinging chain'}];

export const GLASS_KIND=UFO_KIND+1;
EXTRA_DECOR.push({name:'Glass pebble · choose your color',category:'Ornaments',shape:'glass',color:'#48cbea',height:.12,width:.28,note:'Individual polished glass pebble'});

export const catalogDecor=(kind:number)=>kind>=32&&kind<80||kind===UFO_KIND||kind===GLASS_KIND||kind>=226;

export const HARD_SCAPE_RECTS:Record<number,number[]>={24: [0, 0, 487, 322], 25: [491, 0, 216, 422], 26: [711, 0, 410, 382], 27: [1125, 0, 445, 318], 28: [1574, 0, 377, 387], 29: [1955, 0, 470, 214], 16: [0, 426, 487, 432], 17: [491, 426, 349, 494], 18: [844, 426, 434, 376], 19: [1282, 426, 502, 355], 20: [1788, 426, 446, 411], 21: [2238, 426, 490, 426]};

BASE_NAMES[24]='Sprawling spiderwood';EXTRA_DECOR[24].name='Sprawling spiderwood';
BASE_NAMES[25]='Forked branch';EXTRA_DECOR[25].name='Forked branch';
BASE_NAMES[26]='Hollow root stump';EXTRA_DECOR[26].name='Hollow root stump';
BASE_NAMES[27]='Pale wood arch';EXTRA_DECOR[27].name='Pale wood arch';
BASE_NAMES[28]='Mangrove root cage';EXTRA_DECOR[28].name='Mangrove root cage';
BASE_NAMES[29]='Ribbon bogwood';EXTRA_DECOR[29].name='Ribbon bogwood';
BASE_NAMES[16]='Holey limestone arch';EXTRA_DECOR[16].name='Holey limestone arch';
BASE_NAMES[17]='Jagged slate spire';EXTRA_DECOR[17].name='Jagged slate spire';
BASE_NAMES[18]='Smooth river stack';EXTRA_DECOR[18].name='Smooth river stack';
BASE_NAMES[19]='Lava cave tunnel';EXTRA_DECOR[19].name='Lava cave tunnel';
BASE_NAMES[20]='Quartz crystal cluster';EXTRA_DECOR[20].name='Quartz crystal cluster';
BASE_NAMES[21]='Sandstone canyon';EXTRA_DECOR[21].name='Sandstone canyon';

export const WOOD_RECTS:Record<number,number[]>={48: [0, 0, 496, 299], 49: [500, 0, 466, 477], 50: [970, 0, 248, 502], 51: [0, 506, 496, 336], 52: [500, 506, 410, 472], 53: [914, 506, 470, 469]};
EXTRA_DECOR.push(...['Hollow window log','Antler driftwood','Corkscrew root','Spreading root fan','Crescent driftwood','Bare bonsai wood'].map(name=>({name,category:'Wood' as const,shape:'wood',color:'#a88763',height:1.5,width:1.9,note:'Individual driftwood sculpture'})));

EXTRA_DECOR.push(...['Slate shelf','Granite cobble','Mossy basalt ledge','Dragonstone ridge','Honeycomb limestone','Marble slab','Shale pillar','Obsidian shard','Sandstone terrace','White river pebble','Branching limestone','Serpentine boulder'].map((name,i)=>({name,category:'Stone' as const,shape:'rock',color:'#99958a',height:[.35,.65,.55,1.1,1.2,.35,1.8,1.25,.55,.35,1.5,1][i],width:1.8,note:'Stackable landscape rock'})));

export const SINGLE_MOSS_KIND=244;
EXTRA_DECOR.push({name:'Single moss ball',category:'Plants',shape:'moss',color:'#428632',height:.42,width:.45,note:'One individual marimo moss ball'});

// New individual pieces append IDs; existing placed decorations keep their identity.
EXTRA_DECOR.push(
 {name:'Zen stone cottage',category:'Ornaments',shape:'cave',color:'#8a9383',height:1.45,width:1.65,note:'Mossy stone hut with an open doorway'},
 {name:'Stone moon gate',category:'Ornaments',shape:'arch',color:'#b1b5a1',height:1.9,width:1.85,note:'Circular stone swim-through'},
 {name:'Sunken amphora',category:'Ornaments',shape:'pot',color:'#a66c49',height:.9,width:1.65,note:'Weathered terracotta hideaway'},
 {name:'Twisted root arch',category:'Wood',shape:'arch',color:'#75624b',height:1.4,width:2.3,note:'Asymmetric driftwood swim-through'},
 {name:'Zen stone lantern hut',category:'Ornaments',shape:'pagoda',color:'#899080',height:1.35,width:1.15,note:'Restored original Zen garden ornament'}
);
