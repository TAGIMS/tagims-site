// A short, weighted Verlet chain: each link can bend independently.
export class Chain {
 private direction=1;private anchorY=0;private length=0;
 kick(){this.direction*=-1;for(let i=1;i<this.nodes.length;i++)this.nodes[i].px-=this.direction*5*Math.pow(i/(this.nodes.length-1),1.4);}
 private nodes:{x:number;y:number;px:number;py:number}[]=[];
 step(x:number,y:number,length:number,dt:number){
  const count=18,segment=length/count;
  if(!this.nodes.length||Math.abs(y-this.anchorY)>70||Math.abs(length-this.length)>Math.max(40,this.length*.4)||Math.hypot(this.nodes[0].x-x,this.nodes[0].y-y)>700)this.nodes=Array.from({length:count+1},(_,i)=>({x,y:y+i*segment,px:x,py:y+i*segment}));
  const steps=Math.max(1,Math.ceil(dt/(1/60))),h=Math.min(dt/steps,1/60);
  for(let step=0;step<steps;step++){
   for(let i=1;i<=count;i++){const p=this.nodes[i],vx=(p.x-p.px)*Math.exp(-3.2*h),vy=(p.y-p.py)*Math.exp(-3.2*h);p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+850*h*h;}
   for(let pass=0;pass<24;pass++){this.nodes[0].x=x;this.nodes[0].y=y;for(let i=0;i<count;i++){const a=this.nodes[i],b=this.nodes[i+1],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,error=(d-segment)/d,wa=i===0?0:1,wb=i===count-1?.25:1,total=wa+wb;a.x+=dx*error*wa/total;a.y+=dy*error*wa/total;b.x-=dx*error*wb/total;b.y-=dy*error*wb/total;}}
  }
  this.nodes[0].x=x;this.nodes[0].y=y;this.anchorY=y;this.length=length;return this.nodes;
 }
}
