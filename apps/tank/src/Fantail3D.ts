import {WebGLRenderer,Scene,OrthographicCamera,BufferGeometry,Float32BufferAttribute,Mesh,MeshStandardMaterial,TextureLoader,SRGBColorSpace,DoubleSide,HemisphereLight,DirectionalLight,Group,Texture} from 'three';
import type {Brain} from './behavior';
import {bendFantail,newMotion,stepMotion,type Motion} from './fantailMotion';
/** Offscreen 3D portraits are composited into Tank's existing depth-sorted 2D scene. */
export class Fantail3D {
 private renderer:WebGLRenderer;private scene=new Scene();private camera=new OrthographicCamera(-1.4,1.4,1.4,-1.4,.1,20);
 private geometry=new BufferGeometry();private material=new MeshStandardMaterial({roughness:.46,metalness:.06,side:DoubleSide});
 private mesh=new Mesh(this.geometry,this.material);private group=new Group();private texture:Texture|null=null;
 private base:Float32Array=new Float32Array();private output:Float32Array=new Float32Array();private motions=new Map<number,Motion>();private disposed=false;private ready=false;private pixels=0;private normalFrame=0;private portraits=new Map<number,{canvas:HTMLCanvasElement;elapsed:number;pixels:number}>();
 constructor(){
  this.renderer=new WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
  this.renderer.setClearColor(0,0);this.renderer.setPixelRatio(1);this.camera.position.z=5;
  this.group.add(this.mesh);this.scene.add(this.group,new HemisphereLight(0xe5faff,0x6b5035,2.0));
  const key=new DirectionalLight(0xffead0,2.4);key.position.set(1,3,4);this.scene.add(key);
  const rim=new DirectionalLight(0xc7e9ff,.9);rim.position.set(-2,1,-2);this.scene.add(rim);this.mesh.frustumCulled=false;
 }
 async load(){
  const [data,texture]=await Promise.all([fetch('/apps/tank/assets/fantail-3d.json').then(r=>{if(!r.ok)throw Error('Fantail mesh unavailable');return r.json();}),new TextureLoader().loadAsync('/apps/tank/assets/fantail-3d-color.jpg')]);
  if(this.disposed){texture.dispose();return;}
  this.base=new Float32Array(data.positions);this.output=new Float32Array(this.base.length);
  this.geometry.setAttribute('position',new Float32BufferAttribute(this.output,3));this.output=this.geometry.getAttribute('position').array as Float32Array;
  this.geometry.setAttribute('uv',new Float32BufferAttribute(data.uv,2));texture.colorSpace=SRGBColorSpace;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());this.texture=texture;this.material.map=texture;this.material.needsUpdate=true;this.ready=true;
 }
 draw(f:Brain,dt:number,desiredPixels:number):HTMLCanvasElement|null{
  if(!this.ready||this.disposed||this.renderer.getContext().isContextLost())return null;
  let motion=this.motions.get(f.id);if(!motion){motion=newMotion();this.motions.set(f.id,motion);}stepMotion(motion,f,dt);
  let portrait=this.portraits.get(f.id);if(!portrait){portrait={canvas:document.createElement('canvas'),elapsed:1,pixels:0};this.portraits.set(f.id,portrait);}portrait.elapsed+=dt;const px=Math.max(160,Math.min(512,Math.round(desiredPixels/64)*64));if(portrait.elapsed<1/30&&portrait.pixels===px)return portrait.canvas;portrait.elapsed=0;if(px!==this.pixels){this.renderer.setSize(px,px,false);this.pixels=px;}
  bendFantail(this.base,this.output,motion);this.geometry.getAttribute('position').needsUpdate=true;if(this.normalFrame++%2===0)this.geometry.computeVertexNormals();
  this.group.rotation.y=-f.heading;this.mesh.rotation.z=motion.pitch;
  this.renderer.render(this.scene,this.camera);if(portrait.pixels!==px){portrait.canvas.width=portrait.canvas.height=px;portrait.pixels=px;}const c=portrait.canvas.getContext('2d')!;c.clearRect(0,0,px,px);c.drawImage(this.renderer.domElement,0,0);return portrait.canvas;
 }
 retain(ids:Set<number>){for(const id of this.motions.keys())if(!ids.has(id)){this.motions.delete(id);this.portraits.delete(id);}}
 dispose(){this.disposed=true;this.ready=false;this.geometry.dispose();this.material.dispose();this.texture?.dispose();this.renderer.dispose();this.motions.clear();this.portraits.clear();}
}
