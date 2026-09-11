import {Vector3} from 'three';
import {heightAt,type Terrain} from './terrain';
import {SPECIES,clamp,type FishItem} from './state';
// Soft preferences: fish still investigate food, startle, and take occasional excursions.
type Habit={habitat:'open'|'plants'|'bottom';height:number;prefer:number;pause:number;forage:number;dart:number;turn:number;accel:number;pulse:number;beat:number};
const habit=(habitat:Habit['habitat'],height:number,pause:number,forage:number,dart:number,turn:number,accel:number,pulse:number,beat:number):Habit=>({habitat,height,prefer:habitat==='bottom'?.86:.74,pause,forage,dart,turn,accel,pulse,beat});
export const HABITS:Habit[]=[
 habit('plants',2.4,.12,.22,.05,1.7,1.7,.22,1.1), // Neon: quick school flicks
 habit('open',3.9,.22,.07,.018,.72,.75,.10,.72), // Angel: long gliding arcs
 habit('open',3.3,.30,.08,.012,.65,.65,.07,.65), // Discus: patient hovering
 habit('plants',3.3,.13,.26,.07,1.9,1.6,.30,1.25), // Guppy: curious short bursts
 habit('open',4.2,.32,.10,.018,.8,.8,.12,.75), // Gourami: high, slow patrol
 habit('plants',2.7,.10,.16,.04,1.45,1.5,.20,1.05),
 habit('plants',2.3,.12,.20,.045,1.6,1.6,.20,1.1),
 habit('plants',1.9,.24,.25,.065,2,1.8,.28,1.2), // Ember: sheltered stop/start
 habit('plants',1.7,.25,.34,.08,2.2,2,.34,1.3), // Pearl danio: dart and inspect
 habit('plants',3.8,.055,.09,.095,2.15,2.1,.38,1.45), // Zebra: brisk upper patrol
 habit('bottom',.35,.20,.52,.035,1.5,1.3,.22,.9),
 habit('bottom',.22,.52,.38,.005,.55,.65,.08,.55),
 habit('plants',1.6,.30,.38,.035,1.3,1.2,.20,.9),
 habit('open',3.5,.07,.08,.035,1.15,1.45,.25,1.15),
 habit('open',3.8,.23,.08,.018,.75,.8,.12,.75),
 habit('plants',3.0,.38,.23,.03,1.05,.85,.22,.8), // Betta: hover, flare, investigate
 habit('bottom',.13,.42,.43,.09,2.8,2.5,.4,1.6),
 habit('bottom',.10,.56,.42,0,.4,.45,.03,.25),
 habit('open',3.2,.18,.25,.03,.95,.95,.24,.85) // Fantail: leisurely, curious forager
];
export type Obstacle={center:Vector3;radius:number;soft?:boolean};
export type Food={id:number;position:Vector3;age:number};
export type Brain={id:number;kind:number;size:number;position:Vector3;velocity:Vector3;target:Vector3;home:Vector3;mode:'explore'|'school'|'rest'|'scurry'|'forage'|'feed';timer:number;phase:number;energy:number;heading:number;turn:number;cruise:number;cooldown:number;signal:number;signalStrength:number;reaction:{source:Vector3;strength:number;delay:number}|null};
export function createBrain(f:FishItem,random=Math.random):Brain{const sp=SPECIES[f.kind];return {...f,position:new Vector3((random()-.5)*13,clamp(sp.zone+(random()-.5),.2,5.4),(random()-.5)*4.4),velocity:new Vector3((random()-.5)*.5,0,(random()-.5)*.2),target:new Vector3((random()-.5)*12,sp.zone,(random()-.5)*4),home:new Vector3(0,HABITS[f.kind]?.height||sp.zone,0),mode:'explore',timer:random()*4,phase:random()*Math.PI*2,energy:.75+random()*.45,heading:random()*Math.PI*2,turn:0,cruise:.8+random()*.4,cooldown:0,signal:0,signalStrength:0,reaction:null};}
// Startle signals decay across neighbors and a cooldown prevents endless panic loops.
export function startleFish(f:Brain,source:Vector3,strength=1,random=Math.random){if(SPECIES[f.kind].body==='snail')return;const away=f.position.clone().sub(source);if(away.lengthSq()<.001)away.set(random()-.5,.1,random()-.5);away.normalize().add(new Vector3((random()-.5)*.5,(random()-.5)*.2,0)).normalize();f.target.copy(f.position).addScaledVector(away,1.5+strength*1.5);f.target.x=clamp(f.target.x,-7,7);f.target.y=clamp(f.target.y,.15,5.4);f.target.z=clamp(f.target.z,-2.3,2.3);f.mode='scurry';f.timer=.55+strength*.45;f.signal=.5;f.signalStrength=strength;f.cooldown=4+random()*3;f.reaction=null;}
export function stepFish(f:Brain,all:Brain[],obstacles:Obstacle[],food:Food[],dt:number,pace:number,current:number,random=Math.random,terrain?:Terrain){
 const sp=SPECIES[f.kind],habit=HABITS[f.kind],ground=sp.zone<.5,bodyRadius=sp.length*f.size*.3,floor=terrain?heightAt(terrain,f.position.x,f.position.z):0,minY=floor+Math.max(ground?Math.max(.10,sp.length*f.size*.55):.15,bodyRadius*.75);f.timer-=dt;f.cooldown=Math.max(0,f.cooldown-dt);f.signal=Math.max(0,f.signal-dt);
 if(f.reaction){f.reaction.delay-=dt;if(f.reaction.delay<=0)startleFish(f,f.reaction.source,f.reaction.strength,random);}
 if(f.cooldown<=0&&!f.reaction&&sp.body!=='snail'){const alarm=all.find(other=>other!==f&&other.signal>0&&other.signalStrength>.27&&other.position.distanceTo(f.position)<2.2);if(alarm)f.reaction={source:alarm.position.clone(),strength:alarm.signalStrength*.58,delay:.09+random()*.2};}
 const meal=food.reduce<Food|undefined>((best,p)=>!best||p.position.distanceToSquared(f.position)<best.position.distanceToSquared(f.position)?p:best,undefined);
 if(f.mode!=='scurry'&&meal&&meal.position.distanceTo(f.position)<(ground?2:5)){f.mode='feed';f.target.copy(meal.position);f.timer=.7;if(f.position.distanceTo(meal.position)<.17+bodyRadius){meal.age=100;f.timer=.3;}}
 else if(f.timer<=0||f.mode==='feed'){
  const r=random();f.timer=(habit.habitat==='open'?5:2.5)+random()*6;f.cruise=(habit.habitat==='open'?.8:.65)+random()*(habit.habitat==='open'?.35:.7);
  if(r<habit.dart&&sp.body!=='snail'){f.mode='scurry';f.timer=.5+random()*.7;f.signal=.4;f.signalStrength=.65;f.cooldown=4+random()*3;}
  else if(r<habit.dart+habit.pause){f.mode='rest';f.timer=1.5+random()*4;}
  else if(r<habit.dart+habit.pause+habit.forage&&obstacles.length){f.mode='forage';const candidates=habit.habitat==='plants'?obstacles.filter(o=>o.soft):obstacles;const pool=candidates.length?candidates:obstacles;const o=pool[Math.floor(random()*pool.length)];const a=random()*Math.PI*2;f.target.copy(o.center).add(new Vector3(Math.cos(a)*(o.radius+bodyRadius+.12),0,Math.sin(a)*(o.radius+bodyRadius+.12)));f.target.y=ground?minY:clamp(o.center.y+random()*.35,minY,3.5);f.timer=6+random()*5;}
  else f.mode=sp.school?'school':'explore';
  if(f.mode!=='forage'){
   const foliage=habit.habitat==='plants'?obstacles.filter(o=>o.soft):[];
   if(random()<habit.prefer){
    if(foliage.length){const favorite=Math.abs(f.id)%foliage.length,o=foliage[random()<.7?favorite:Math.floor(random()*foliage.length)],a=random()*Math.PI*2,radius=o.radius+.2+random()*.8;f.home.copy(o.center);f.target.set(o.center.x+Math.cos(a)*radius,clamp(o.center.y+habit.height*.23+(random()-.5)*.8,minY,5.4),clamp(o.center.z+Math.sin(a)*radius,-2.3,2.3));}
    else{const personal=((f.id%17)/17-.5)*.6;f.home.set(Math.sin(f.id*.73)*3,habit.height+personal,Math.sin(f.id*.39)*1.3);f.target.set(clamp(f.home.x+(random()-.5)*9,-7,7),ground?minY:clamp(f.home.y+(random()-.5)*1.15,minY,5.4),clamp(f.home.z+(random()-.5)*2.6,-2.3,2.3));}
   }else f.target.set((random()-.5)*14,ground?minY:clamp(sp.zone+(random()-.5)*3,minY,5.4),(random()-.5)*4.8);
   const targetScale=.68+.42*clamp((f.target.z+2.6)/5.2,0,1);f.target.x=clamp(f.target.x,-8/targetScale+bodyRadius,8/targetScale-bodyRadius);
  }
 }
 const desired=f.target.clone().sub(f.position);const distance=desired.length();const pulse=1-habit.pulse*.35+habit.pulse*Math.sin(f.phase*.37+f.id),speed=(.18+pace*.013)*sp.pace*f.energy*f.cruise*pulse*(f.mode==='scurry'?3.1:f.mode==='rest'?.08:1);
 desired.normalize().multiplyScalar(speed*Math.min(1,distance*1.6));
 if(f.mode==='forage'&&distance<.35){desired.multiplyScalar(.13);desired.y+=Math.sin(f.phase*4)*.035;}
 const separation=new Vector3(),cohesion=new Vector3(),alignment=new Vector3();let peers=0;
 for(const other of all){if(other===f)continue;const d=f.position.distanceTo(other.position);const comfort=bodyRadius+SPECIES[other.kind].length*other.size*.3+.16;
  if(d>0&&d<comfort)separation.add(f.position.clone().sub(other.position).normalize().multiplyScalar((comfort-d)/comfort*1.8));
  if(f.mode==='school'&&other.kind===f.kind&&d<2.4){cohesion.add(other.position);alignment.add(other.velocity);peers++;}
  if(sp.length<.5&&SPECIES[other.kind].length*other.size>1&&d<.8){separation.add(f.position.clone().sub(other.position).normalize().multiplyScalar(.6));}
 }
 if(peers){desired.add(cohesion.divideScalar(peers).sub(f.position).multiplyScalar(.15));desired.add(alignment.divideScalar(peers).multiplyScalar(.28));}
 desired.add(separation);
 for(const o of obstacles){const delta=f.position.clone().sub(o.center),d=delta.length(),safe=o.radius+bodyRadius+.12; if(d<safe+.4){desired.add(delta.normalize().multiplyScalar((safe+.4-d)*(o.soft?.5:2.5)));}}
 desired.z+=Math.sin(f.phase*.55)*current*.0006;
 const margin=.65+bodyRadius,xLimit=8/(.68+.42*clamp((f.position.z+2.6)/5.2,0,1))-bodyRadius;
 if(Math.abs(f.position.x)>xLimit-margin)desired.x-=Math.sign(f.position.x)*(Math.abs(f.position.x)-(xLimit-margin))*2;
 if(Math.abs(f.position.z)>2.6-margin*.5)desired.z-=Math.sign(f.position.z)*(Math.abs(f.position.z)-(2.6-margin*.5))*2;
 if(ground){desired.y=(minY-f.position.y)*2;}
 // A fish steers its heading before its body follows: arcs rather than instant reversals.
 const wanted=Math.atan2(desired.z,desired.x),delta=Math.atan2(Math.sin(wanted-f.heading),Math.cos(wanted-f.heading)),maxTurn=(f.mode==='scurry'?Math.max(2.5,habit.turn*2.4):habit.turn)/Math.max(.7,f.size);
 const turnTarget=clamp(delta*2.4,-maxTurn,maxTurn);f.turn+=(turnTarget-f.turn)*(1-Math.exp(-dt*4));f.heading+=f.turn*dt;
 const tightTurn=1-.55*Math.min(1,Math.abs(delta)/Math.PI),horizontal=Math.hypot(desired.x,desired.z)*tightTurn;
 desired.x=Math.cos(f.heading)*horizontal;desired.z=Math.sin(f.heading)*horizontal;
 if(terrain){const ahead=heightAt(terrain,f.position.x+Math.cos(f.heading)*.65,f.position.z+Math.sin(f.heading)*.65);desired.y+=Math.max(0,ahead+bodyRadius+.12-f.position.y)*2;if(!ground)f.target.y=Math.max(f.target.y,heightAt(terrain,f.target.x,f.target.z)+bodyRadius+.2);}
 f.velocity.lerp(desired,1-Math.exp(-dt*(f.mode==='scurry'?Math.max(2.8,habit.accel*2):habit.accel)));
 f.velocity.clampLength(0,speed*1.7+.08);f.position.addScaledVector(f.velocity,dt);
 f.position.x=clamp(f.position.x,-xLimit,xLimit);f.position.y=clamp(f.position.y,minY,5.65-bodyRadius);f.position.z=clamp(f.position.z,-2.6+bodyRadius,2.6-bodyRadius);
 // Solid collision correction prevents fish crossing hard ornaments even during bursts.
 for(const o of obstacles){if(o.soft)continue;const delta=f.position.clone().sub(o.center);const r=o.radius+bodyRadius;const d=delta.length();if(d<r){if(d<.0001)delta.set(1,0,0);else delta.divideScalar(d);f.position.copy(o.center).addScaledVector(delta,r);const inward=f.velocity.dot(delta);if(inward<0)f.velocity.addScaledVector(delta,-inward);}}
 f.position.x=clamp(f.position.x,-xLimit,xLimit);f.position.z=clamp(f.position.z,-2.6+bodyRadius,2.6-bodyRadius);f.position.y=clamp(f.position.y,(terrain?heightAt(terrain,f.position.x,f.position.z):0)+Math.max(ground?Math.max(.10,sp.length*f.size*.55):.15,bodyRadius*.75),5.65-bodyRadius);
 f.phase+=dt*(2.4+f.velocity.length()*7)*habit.beat;
}
