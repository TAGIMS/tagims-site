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

// September collection: individual photo cutouts, never renumber older pieces.
EXTRA_DECOR.push(
 {name:'Yukimi snow lantern',category:'Ornaments',shape:'pagoda',color:'#969c89',height:1.15,width:1.55,note:'Wide-roofed granite garden lantern'},
 {name:'Five-tier stone pagoda',category:'Ornaments',shape:'pagoda',color:'#989a85',height:2.15,width:1.2,note:'Weathered tiered garden tower'},
 {name:'Tsukubai stone basin',category:'Ornaments',shape:'pot',color:'#929585',height:.65,width:1.3,note:'Hollow hand-carved granite water basin'},
 {name:'Stone torii gate',category:'Ornaments',shape:'arch',color:'#a2a594',height:1.65,width:2.1,note:'Quiet stone gateway with open swim-through'},
 {name:'Seiryu ridge',category:'Stone',shape:'rock',color:'#727f88',height:1.25,width:1.8,note:'Rugged blue-gray stone with white mineral veins'},
 {name:'Pagoda sandstone',category:'Stone',shape:'rock',color:'#bb8b50',height:.9,width:1.8,note:'Warm layered terraces'},
 {name:'Basalt columns',category:'Stone',shape:'rock',color:'#4d5154',height:1.6,width:1.2,note:'Three uneven volcanic pillars'},
 {name:'Rose quartz river stone',category:'Stone',shape:'rock',color:'#d5a6a1',height:.45,width:1.15,note:'Soft blush mineral veining'},
 {name:'River oak roots',category:'Wood',shape:'wood',color:'#68503c',height:1.35,width:2.5,note:'Wide low root tangle with rich grain'},
 {name:'Two-tone Mopani',category:'Wood',shape:'wood',color:'#9c7449',height:1.3,width:1.9,note:'Honey-colored ridges and deep chocolate hollows'}
);

EXTRA_DECOR.push(
 {name:'Sweeping Manzanita',category:'Wood',shape:'wood',color:'#a05e39',height:1.1,width:2.7,note:'Airy red-brown branches with open space between the twigs'},
 {name:'Malaysian driftwood slab',category:'Wood',shape:'wood',color:'#483124',height:.65,width:2.2,note:'Low dark heartwood with torn amber ridges'},
 {name:'Hollow Cholla tube',category:'Wood',shape:'wood',color:'#b78c55',height:.55,width:1.5,note:'Honey-colored lattice and an open hollow end'},
 {name:'Ghostwood fork',category:'Wood',shape:'wood',color:'#c3a27a',height:1.7,width:1.4,note:'Thick sandblasted limbs with flowing pale grain'},
 {name:'Madagascar lace plant',category:'Plants',shape:'stem',color:'#77b958',height:1.6,width:1.4,note:'Translucent lattice leaves on arching stems'},
 {name:'Bolbitis water fern',category:'Plants',shape:'stem',color:'#428347',height:1.15,width:1.4,note:'Delicate emerald fern fronds'},
 {name:'Pogostemon helferi',category:'Plants',shape:'stem',color:'#94c949',height:.4,width:.75,note:'A low lime-green rosette of curly leaves'},
 {name:'Hygrophila pinnatifida',category:'Plants',shape:'stem',color:'#987a43',height:.95,width:1.2,note:'Lobed copper and olive leaves for the midground'}
);
