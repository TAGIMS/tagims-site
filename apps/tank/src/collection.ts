// Append-only catalog IDs keep existing saved aquariums compatible.
export const collectionAsset=(name:string,preview=false)=>'/apps/tank/assets/collection-20260927/'+name+(preview?'-thumb':'')+'.webp';
export const COLLECTION_DECOR:Record<number,string>={
 32:'decor-galleon-v2',40:'decor-temple-v2',43:'decor-castle-v2',
 77:'plant-banana-v2',78:'plant-flame-v2',232:'stone-slate-v2',237:'stone-marble-v2',238:'stone-shale-v2',
 56:'wood-spider-refresh',57:'wood-fork-refresh',231:'wood-bonsai',
 58:'wood-stump-v2',59:'wood-arch-v2',60:'wood-mangrove-v2',61:'wood-ribbon-v2',
 226:'wood-hollow-v2',227:'wood-antler-v2',228:'wood-spiral-v2',229:'wood-fan-v2',230:'wood-crescent-v2',248:'wood-root-arch-v2',
 250:'zenLantern',251:'zen-pagoda',252:'zen-basin',253:'zen-torii',
 254:'stone-seiryu',255:'stone-pagoda',256:'stone-basalt',257:'stone-quartz',
 258:'wood-river-root',259:'wood-mopani',
 260:'wood-manzanita-sweep',261:'wood-malaysian-slab',262:'wood-cholla',263:'wood-ghost-fork',
 264:'plant-lace',265:'plant-bolbitis',266:'plant-helferi',267:'plant-pinnatifida',
};
export const COLLECTION_FISH:Record<number,string>={19:'fish-rummy',20:'fish-chili',21:'fish-killifish',22:'fish-honey',23:'fish-kuhli',24:'fish-silver'};
