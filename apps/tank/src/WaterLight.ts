// Low-resolution, cached lighting layers retain fluid motion without full-size filters.
export class WaterLight {
 private back=document.createElement('canvas');private front=document.createElement('canvas');private last=-1;private key='';
 constructor(private texture:HTMLImageElement){}
 update(time:number,w:number,h:number,strength:number,color:string,angle:number,brightness:number,size=100,depth=70,motion=60){
  const width=Math.min(960,Math.round(w)),height=Math.max(1,Math.round(width*h/w)),key=[width,height,strength,color,angle,brightness,size,depth,motion].join('/');
  if(key===this.key&&time-this.last<1/24)return;this.key=key;this.last=time;
  for(const [index,canvas] of [this.back,this.front].entries()){
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}const c=canvas.getContext('2d')!;c.clearRect(0,0,width,height);
   const power=strength/100,travel=motion/40,layerDepth=depth/100;c.globalCompositeOperation='screen';
   for(let layer=0;layer<(index?2:3);layer++){
    c.save();c.globalAlpha=power*(index?.12*layerDepth:.18)*(layer?layerDepth:1)/(1+layer*.35);const zoom=(1.4+layer*.33)*size/100+Math.sin(time*.06+layer)*.06;
    c.translate(width*.5+Math.sin(time*(.055+layer*.023)+layer)*width*.055*travel,height*.5+Math.cos(time*.048+layer)*height*.035*travel);c.rotate(Math.sin(time*.025+layer)*.045*travel);c.scale(zoom,zoom);
    c.scale(1+Math.sin(time*.09+layer)*.045*travel,1+Math.cos(time*.075+layer)*.045*travel);
    for(let ty=-1;ty<=1;ty++)for(let tx=-1;tx<=1;tx++){c.save();c.translate(tx*width,ty*height);c.scale(tx%2?-1:1,ty%2?-1:1);c.drawImage(this.texture,-width/2,-height/2,width,height);c.restore();}
    c.restore();
   }
   if(!index){c.globalAlpha=power*.16;for(let i=0;i<4;i++){const x=width*(angle/100+(i-1.5)*.19+Math.sin(time*.07+i)*.07),g=c.createLinearGradient(x,0,x+width*.15,height);g.addColorStop(0,color+'85');g.addColorStop(.65,color+'15');g.addColorStop(1,'transparent');c.fillStyle=g;c.beginPath();c.moveTo(x-width*.035,0);c.lineTo(x+width*.035,0);c.lineTo(x+width*.32,height);c.lineTo(x-width*.13,height);c.fill();}}
   c.globalAlpha=1;c.globalCompositeOperation='source-over';
  }
 }
 draw(c:CanvasRenderingContext2D,w:number,h:number,front=false){c.save();c.globalCompositeOperation=front?'soft-light':'screen';c.drawImage(front?this.front:this.back,0,0,w,h);c.restore();}
}
