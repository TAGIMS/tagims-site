import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {SPECIES,DECOR} from './state';
const V=T.Vector3;
function seeded(n:number){return ()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296;};}
const bodyMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.12});
const decorMaterial=new T.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0,side:T.DoubleSide});
const eyeMaterial=new T.MeshStandardMaterial({color:'#081315',roughness:.16,metalness:.25});
const shineMaterial=new T.MeshBasicMaterial({color:'#e4f0d7'});
function paint(g:T.BufferGeometry,color:string,jitter=.06){const c=new T.Color(color),p=g.getAttribute('position'),colors=[];for(let i=0;i<p.count;i++){const v=.92+Math.sin(p.getX(i)*31+p.getY(i)*37+p.getZ(i)*29)*jitter;colors.push(c.r*v,c.g*v,c.b*v);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));return g;}
function mesh(g:T.BufferGeometry,color:string,material:T.Material=decorMaterial){paint(g,color);return new T.Mesh(g,material);}
function ellipsoid(color:string,x:number,y:number,z:number,sx:number,sy:number,sz:number,mat:T.Material=decorMaterial){const m=mesh(new T.SphereGeometry(1,16,10),color,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);return m;}
function tube(points:T.Vector3[],r:number,color:string){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),12,r,5,false),color);}
function mergeGroup(group:T.Group){group.updateMatrixWorld(true);const gs:T.BufferGeometry[]=[];group.traverse(o=>{if(o instanceof T.Mesh){const g=o.geometry.clone().applyMatrix4(o.matrixWorld);g.deleteAttribute('uv');gs.push(g.index?g.toNonIndexed():g);}});const geometry=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());group.traverse(o=>{if(o instanceof T.Mesh)o.geometry.dispose();});const result=new T.Group();if(geometry)result.add(new T.Mesh(geometry,decorMaterial));return result;}
function fin(points:number[][],color:string){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));const g=new T.ShapeGeometry(shape,8);const mat=new T.MeshStandardMaterial({color,side:T.DoubleSide,transparent:true,opacity:.68,roughness:.55,metalness:.1,depthWrite:false});const m=new T.Mesh(g,mat);const root=new T.Group();root.add(m);const rays:number[]=[];for(let i=1;i<points.length;i++){rays.push(points[0][0],points[0][1],.002,points[i][0],points[i][1],.002);}const line=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(rays,3)),new T.LineBasicMaterial({color,transparent:true,opacity:.55}));root.add(line);return root;}
export function fishModel(kind:number){
 const sp=SPECIES[kind],g=new T.Group();
 if(sp.body==='shrimp'){
  for(let i=0;i<6;i++)g.add(ellipsoid(sp.color,.25-i*.11,.035+Math.sin(i*.35)*.09,0,.09,.075-i*.007,.065));
  for(let side of [-1,1]){g.add(tube([new V(.2,.04,side*.04),new V(.39,-.02,side*.2),new V(.55,.03,side*.25)],.007,sp.accent));for(let i=0;i<5;i++)g.add(tube([new V(.13-i*.09,.04,0),new V(.16-i*.09,-.08,side*.12),new V(.23-i*.09,-.11,side*.15)],.009,sp.color));g.add(ellipsoid('#151b16',.29,.09,side*.045,.016,.016,.016));}
  const tail=fin([[0,0],[-.19,.13],[-.22,-.11]],sp.accent);tail.position.x=-.35;g.add(tail);g.userData.tail=tail;return g;
 }
 if(sp.body==='snail'){
  g.add(ellipsoid(sp.color,0,.07,0,.3,.09,.16));g.add(ellipsoid(sp.color,-.04,.26,0,.22,.23,.2));
  const pts=[];for(let i=0;i<90;i++){const a=i/90*Math.PI*5,r=.015+i/90*.185;pts.push(new V(-.04+Math.cos(a)*r,.26+Math.sin(a)*r,.16-i/90*.015));}g.add(tube(pts,.016,sp.accent));
  for(let s of [-1,1])g.add(tube([new V(.22,.1,s*.05),new V(.32,.16,s*.09),new V(.4,.2,s*.13)],.011,sp.accent));return g;
 }
 const round=sp.body==='round',angel=sp.body==='angel';const tall=round?.37:angel?.33:sp.body==='long'?.18:.16;const thick=kind===18?.235:round?.14:angel?.105:.14;
 const verts:number[]=[],colors:number[]=[],indices:number[]=[];const a=new T.Color(sp.color),b=new T.Color(sp.accent);const rings=28,sides=24;
 for(let i=0;i<=rings;i++){const u=i/rings,x=-.46+u*.98;const shape=Math.pow(Math.sin(Math.PI*u),.7)*(.6+u*.48);for(let j=0;j<=sides;j++){const theta=j/sides*Math.PI*2,y=Math.cos(theta)*tall*shape,z=Math.sin(theta)*thick*shape;verts.push(x,y,z);let mix=0;
  if(sp.pattern==='stripe')mix=(kind===9?Math.sin(y*80)>0:y<-.025)? .9:0;
  if(sp.pattern==='bars')mix=Math.pow(Math.max(0,Math.cos(x*(angel?22:42))),6)*.75;
  if(sp.pattern==='spots')mix=(Math.sin(x*95)*Math.sin(y*96)>.55)?.8:0;
  if(sp.pattern==='koi')mix=kind===13?(x<0?.95:.05):Math.sin(x*17+y*21)*Math.cos(x*11-y*19)>.18?.85:0;
  const col=a.clone().lerp(b,mix);const shade=.8+Math.cos(theta)*.18+Math.sin(u*170+j*19)*.045;col.multiplyScalar(shade);colors.push(col.r,col.g,col.b);
  if(i<rings&&j<sides){const n=i*(sides+1)+j;indices.push(n,n+1,n+sides+1,n+1,n+sides+2,n+sides+1);}
 }}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();g.add(new T.Mesh(geo,bodyMaterial));
 const tail=new T.Group();tail.position.x=-.43;const fan=kind===18?.43:(kind===3||kind===15)?.4:round?.22:.25;
 if(kind===18){for(const side of [-1,1]){const lobe=fin([[0,0],[-.24,.22],[-.53,.43],[-.43,.08],[-.58,-.35],[-.25,-.19],[0,0]],sp.accent);lobe.rotation.y=side*.48;lobe.position.z=side*.045;tail.add(lobe);}}
 else tail.add(fin([[0,0],[-.33,fan],[-.3,fan*.4],[-.34,-fan*.5],[-.31,-fan],[0,0]],sp.accent));g.add(tail);g.userData.tail=tail;
 const dorsal=fin([[-.32,tall*.45],[-.26,tall+(angel?.48:kind===15?.23:.13)],[.15,tall*.88],[.27,tall*.5]],sp.color);g.add(dorsal);g.userData.dorsal=dorsal;
 const lower=fin([[-.25,-tall*.6],[-.18,-tall-(angel?.45:.12)],[.16,-tall*.8]],sp.accent);g.add(lower);
 for(let s of [-1,1]){
  const eye=new T.Mesh(new T.SphereGeometry(.032,12,8),eyeMaterial);eye.position.set(.35,tall*.24,s*thick*.62);g.add(eye);const shine=new T.Mesh(new T.SphereGeometry(.009,8,5),shineMaterial);shine.position.copy(eye.position).add(new V(.007,.011,s*.024));g.add(shine);
  const p=fin([[0,0],[-.17,-.15],[-.2,.02]],sp.color);p.position.set(.12,-tall*.3,s*thick*.85);p.rotation.x=s*.65;g.add(p);g.userData['pectoral'+s]=p;
  if(angel||kind===4)g.add(tube([new V(.09,-tall*.7,s*.02),new V(0,-tall-.22,s*.035),new V(-.14,-tall-.48,s*.02)],.006,sp.color));
  if(kind===10||kind===11)g.add(tube([new V(.43,-.02,s*.045),new V(.54,-.055,s*.1),new V(.5,-.08,s*.16)],.006,sp.accent));
 }
 return g;
}
function rock(color:string,r:number,random:()=>number){const g=new T.IcosahedronGeometry(r,2);const p=g.getAttribute('position');for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.11*Math.sin(x*18+y*11+z*13)+.06*Math.cos(z*23-x*12);p.setXYZ(i,x*n,y*n,z*n);}g.computeVertexNormals();return mesh(g,color);}
function leaf(length:number,width:number,bend:number,color:string){const p:number[]=[],ix:number[]=[];for(let i=0;i<=12;i++){const u=i/12;for(let j=0;j<3;j++){const across=j-1;p.push(across*Math.sin(Math.PI*u)*width,Math.sin(u*1.25)*length,Math.pow(u,2)*bend+Math.abs(across)*Math.sin(u*Math.PI)*width*.22);if(i<12&&j<2){const n=i*3+j;ix.push(n,n+1,n+3,n+1,n+4,n+3);}}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setIndex(ix);g.computeVertexNormals();return mesh(g,color);}
export function decorModel(kind:number){
 const spec=DECOR[kind],g=new T.Group(),rand=seeded(kind*313+11),h=spec.height,w=spec.width,c=spec.color;const addRock=(x:number,y:number,z:number,r:number,sy=1,color=c)=>{const m=rock(color,r,rand);m.position.set(x,y,z);m.scale.y=sy;g.add(m);return m;};
 if(spec.category==='Plants'){
  if(spec.shape==='balls'){for(let i=0;i<3;i++)addRock((i-1)*.22,.13,Math.sin(i)*.15,.2,.85);}
  else if(spec.shape==='stem'){
   for(let i=0;i<7;i++){const x=(rand()-.5)*w,z=(rand()-.5)*w,ht=h*(.65+rand()*.35);g.add(tube([new V(x,-.08,z),new V(x+.03,ht*.5,z+.03),new V(x-.03,ht,z)],.013,c));for(let j=1;j<9;j++){for(let s of [-1,1]){const l=leaf(.27,.065,.15,c);l.position.set(x,ht*j/10,z);l.rotation.z=s*(.7+rand()*.4);l.rotation.y=j*1.6;g.add(l);}}}
  }else if(spec.shape==='lotus'){
   for(let i=0;i<7;i++){const a=i*2.399,ht=h*(.4+rand()*.5),end=new V(Math.cos(a)*w*.4,ht,Math.sin(a)*w*.4);g.add(tube([new V(0,-.07,0),end.clone().multiplyScalar(.5),end],.014,c));const l=leaf(.55,.26,.12,c);l.position.copy(end);l.rotation.set(.7,a,.5);g.add(l);}
  }else{
   const count=spec.shape==='grass'?23:spec.shape==='fern'?17:10;
   for(let i=0;i<count;i++){const a=i*2.399,ht=h*(.55+rand()*.45);const l=leaf(ht,spec.shape==='grass'?.02:spec.shape==='anubias'?.18:spec.shape==='fern'?.075:.13,.15+rand()*.5,c);l.position.set(Math.cos(a)*w*.14,-.07,Math.sin(a)*w*.14);l.rotation.set((rand()-.5)*.6,a,(rand()-.5)*.4);g.add(l);}
  }
 }else if(['rock','dragon','moss','pebbles','slate'].includes(spec.shape)){
  if(spec.shape==='pebbles'||spec.shape==='slate'){for(let i=0;i<6;i++)addRock((rand()-.5)*w,i*.045,(rand()-.5)*.45,w*.28,spec.shape==='slate'?.18:.4);}
  else{const r=addRock(0,h*.35,0,w*.55,h/w*1.2);r.rotation.z=.15;if(spec.shape==='dragon'){for(let i=0;i<4;i++)addRock((rand()-.5)*w,.2,(rand()-.5)*w,w*.2,1.9);}}
 }else if(['branch','spider','root','bonsai'].includes(spec.shape)){
  const branches=spec.shape==='spider'?11:6;g.add(tube([new V(-w*.35,-.08,0),new V(0,h*.3,0),new V(w*.12,h*.7,.04)],.11,c));
  for(let i=0;i<branches;i++){const a=i*2.399,high=h*(.3+rand()*.55);const end=new V(Math.cos(a)*w*.55,high,Math.sin(a)*w*.36);g.add(tube([new V(0,h*.15,0),new V(end.x*.4,high*.7,end.z*.4),end],spec.shape==='spider'?.025:.055,c));if(spec.shape==='bonsai')addRock(end.x,end.y,end.z,.34,.35,'#4c713e');else g.add(tube([end.clone().multiplyScalar(.65),end.clone().add(new V(.14,.25,-.14))],.02,c));}
 }else if(spec.shape==='arch'){
  for(let s of [-1,1])for(let i=0;i<4;i++)addRock(s*w*.38,i*h*.22,0,.25,1.1);for(let i=0;i<5;i++)addRock((i-2)*w*.15,h*.78+Math.sin(i/4*Math.PI)*.14,0,.25,.85);
 }else if(spec.shape==='log'||spec.shape==='pot'||spec.shape==='cave'){
  const log=spec.shape==='log';const points=log?[new T.Vector2(.32,-w/2),new T.Vector2(.37,-w*.3),new T.Vector2(.32,w/2),new T.Vector2(.26,w/2),new T.Vector2(.26,-w/2)]:[new T.Vector2(.24,0),new T.Vector2(.42,.25),new T.Vector2(.37,.6),new T.Vector2(.32,.6),new T.Vector2(.3,.2),new T.Vector2(.22,0)];
  const m=mesh(new T.LatheGeometry(points,24),c);m.rotation.z=Math.PI/2;m.position.y=log?.27:.3;g.add(m);
 }else if(spec.shape==='ruin'||spec.shape==='pagoda'){
  const pag=spec.shape==='pagoda';for(let s of [-1,1]){const pillar=mesh(new T.CylinderGeometry(.12,.16,h*.65,12),c);pillar.position.set(s*w*.3,h*.32,0);g.add(pillar);}
  for(let i=0;i<(pag?3:1);i++){const slab=mesh(new T.BoxGeometry(w*(1-i*.12),.13,.55*(1-i*.1)),c);slab.position.y=h*.66+i*.2;g.add(slab);if(pag){const roof=mesh(new T.ConeGeometry(w*.58,.2,4),c);roof.rotation.y=Math.PI/4;roof.position.y=slab.position.y+.13;g.add(roof);}}
  addRock(0,.02,.08,.6,.12);
 }else if(spec.shape==='ship'){
  const hull=mesh(new T.SphereGeometry(1,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),c);hull.scale.set(w*.5,.35,.4);hull.position.y=.38;g.add(hull);
  for(let i=0;i<9;i++){const plank=mesh(new T.BoxGeometry(w*.06,.07,.68),c);plank.position.set((i-4)*w*.09,.31,0);g.add(plank);}g.add(tube([new V(0,.3,0),new V(-.12,1.05,0)],.025,c));g.add(tube([new V(-.5,.8,0),new V(.35,.8,0)],.022,c));
 }else if(spec.shape==='bamboo'){
  for(let i=0;i<5;i++){const ht=h*(.5+rand()*.5),m=mesh(new T.CylinderGeometry(.105,.12,ht,12,1,true),c);m.position.set((i-2)*.17,ht/2,(i%2)*.16);g.add(m);for(let j=1;j<4;j++){const ring=mesh(new T.TorusGeometry(.108,.014,5,12),c);ring.rotation.x=Math.PI/2;ring.position.set(m.position.x,ht*j/4,m.position.z);g.add(ring);}}
 }else if(spec.shape==='crystal'){
  for(let i=0;i<7;i++){const ht=h*(.4+rand()*.6),m=mesh(new T.CylinderGeometry(0,.14,ht,5),c);m.position.set((rand()-.5)*w,ht*.4,(rand()-.5)*w*.5);m.rotation.z=(rand()-.5)*.6;g.add(m);}
 }
 const result=mergeGroup(g);result.userData.plant=spec.category==='Plants';return result;
}
export function disposeTree(root:T.Object3D){const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();root.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.LineSegments||o instanceof T.Points){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}
