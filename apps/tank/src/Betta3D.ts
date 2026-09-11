import {
  Bone,
  Box3,
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  Mesh,
  Object3D,
  OrthographicCamera,
  Quaternion,
  Scene,
  SkinnedMesh,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import type {Brain} from './behavior';

type BettaMotion={phase:number;speed:number;effort:number;turn:number};
type Portrait={canvas:HTMLCanvasElement;elapsed:number;pixels:number};
type RestPose={bone:Bone;quaternion:Quaternion};

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

/**
 * Renders the rigged Meshy betta offscreen, then composites it into the tank's
 * existing depth-sorted canvas scene. One shared rig is posed sequentially for
 * every betta, so additional fish do not duplicate the 15 MB model in memory.
 */
export class Betta3D {
  private renderer:WebGLRenderer;
  private scene=new Scene();
  private camera=new OrthographicCamera(-1.35,1.35,1.35,-1.35,.1,20);
  private model=new Group();
  private rest:RestPose[]=[];
  private motions=new Map<number,BettaMotion>();
  private portraits=new Map<number,Portrait>();
  private ready=false;
  private disposed=false;
  private pixels=0;

  constructor(){
    this.renderer=new WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
    this.renderer.setClearColor(0,0);
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace=SRGBColorSpace;
    this.camera.position.set(0,0,5);
    this.scene.add(this.model,new HemisphereLight(0xe9fbff,0x315a62,2.1));
    const key=new DirectionalLight(0xffe7cf,2.6);key.position.set(-3,4,5);this.scene.add(key);
    const rim=new DirectionalLight(0x74dfff,1.25);rim.position.set(3,1,-2);this.scene.add(rim);
  }

  async load(){
    const gltf=await new GLTFLoader().loadAsync('/apps/tank/assets/betta-rigged.glb');
    if(this.disposed)return;
    const root=gltf.scene;
    root.traverse(object=>{
      if(object instanceof Mesh){
        object.frustumCulled=false;
        const materials=Array.isArray(object.material)?object.material:[object.material];
        for(const material of materials){
          if('map' in material&&material.map){material.map.colorSpace=SRGBColorSpace;material.map.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());}
          if('emissive' in material)material.emissive=new Color(0x061a1e);
          if('emissiveIntensity' in material)material.emissiveIntensity=.16;
          material.needsUpdate=true;
        }
      }
    });
    // Meshy exports the fish facing local +Z. Turn it to +X, the tank's forward axis.
    root.rotation.y=Math.PI/2;
    root.updateMatrixWorld(true);
    const bounds=new Box3().setFromObject(root),size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
    const fit=2.05/Math.max(size.x,size.y,size.z);
    root.scale.multiplyScalar(fit);
    root.position.sub(center.multiplyScalar(fit));
    this.model.add(root);
    const chain:string[]=['Bone_000','Bone_008','Bone_007','Bone_006','Bone_005','Bone_004','Bone_003','Bone_002','Bone_001'];
    this.rest=chain.map(name=>root.getObjectByName(name)).filter((bone):bone is Bone=>bone instanceof Bone).map(bone=>({bone,quaternion:bone.quaternion.clone()}));
    if(this.rest.length<5)throw Error('Betta rig bone chain is incomplete');
    this.ready=true;
  }

  private step(motion:BettaMotion,fish:Brain,dt:number){
    const speed=clamp(fish.velocity.length()/1.2,0,1),ease=1-Math.exp(-dt*5);
    motion.speed+=(speed-motion.speed)*ease;
    const targetEffort=fish.mode==='rest'?.28:fish.mode==='scurry'?1:clamp(.42+speed*.68,.42,1);
    motion.effort+=(targetEffort-motion.effort)*ease;
    motion.turn+=(clamp(fish.turn,-2.2,2.2)-motion.turn)*(1-Math.exp(-dt*7));
    // A slow, broad wave while hovering; a faster but still sweeping wave in motion.
    const hz=.72+1.55*motion.speed+.22*motion.effort;
    motion.phase=(motion.phase+dt*hz*Math.PI*2)%(Math.PI*2);
  }

  private pose(motion:BettaMotion){
    const count=Math.max(1,this.rest.length-1);
    for(let i=0;i<this.rest.length;i++){
      const {bone,quaternion}=this.rest[i],u=i/count;
      bone.quaternion.copy(quaternion);
      if(i===0)continue;
      // The phase lag makes several visible S-curves at once. Amplitude rises
      // sharply into the caudal fin, where the rig can move most expressively.
      const envelope=.025+Math.pow(u,1.55)*(.30+.28*motion.effort);
      const wave=Math.sin(motion.phase-i*.92)*envelope;
      const steering=-clamp(motion.turn*.075,-.17,.17)*u*u;
      const ripple=Math.sin(motion.phase*1.55-i*1.18)*.055*u*u;
      bone.rotateZ(wave+steering);
      bone.rotateX(ripple);
    }
  }

  draw(fish:Brain,dt:number,desiredPixels:number):HTMLCanvasElement|null{
    if(!this.ready||this.disposed||this.renderer.getContext().isContextLost())return null;
    let motion=this.motions.get(fish.id);if(!motion){motion={phase:fish.phase,speed:0,effort:.45,turn:0};this.motions.set(fish.id,motion);}
    this.step(motion,fish,dt);
    let portrait=this.portraits.get(fish.id);if(!portrait){portrait={canvas:document.createElement('canvas'),elapsed:1,pixels:0};this.portraits.set(fish.id,portrait);}
    portrait.elapsed+=dt;
    const px=Math.max(160,Math.min(512,Math.round(desiredPixels/64)*64));
    if(portrait.elapsed<1/30&&portrait.pixels===px)return portrait.canvas;
    portrait.elapsed=0;
    if(px!==this.pixels){this.renderer.setSize(px,px,false);this.pixels=px;}
    this.pose(motion);
    this.model.rotation.y=-fish.heading;
    this.model.rotation.z=clamp(Math.atan2(fish.velocity.y,Math.max(.12,Math.hypot(fish.velocity.x,fish.velocity.z))),-.48,.48);
    this.renderer.render(this.scene,this.camera);
    if(portrait.pixels!==px){portrait.canvas.width=portrait.canvas.height=px;portrait.pixels=px;}
    const context=portrait.canvas.getContext('2d')!;context.clearRect(0,0,px,px);context.drawImage(this.renderer.domElement,0,0);
    return portrait.canvas;
  }

  retain(ids:Set<number>){for(const id of this.motions.keys())if(!ids.has(id)){this.motions.delete(id);this.portraits.delete(id);}}

  dispose(){
    this.disposed=true;this.ready=false;
    this.model.traverse(object=>{if(object instanceof Mesh||object instanceof SkinnedMesh){object.geometry.dispose();(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>{if('map' in material&&material.map)material.map.dispose();material.dispose();});}});
    this.renderer.dispose();this.motions.clear();this.portraits.clear();
  }
}
