// Adapted from the user's Bustin_Rocks_v2.1 drawAlien.
export function drawUFO(ctx:CanvasRenderingContext2D,time=0){
 const TAU=Math.PI*2;ctx.save();ctx.strokeStyle='rgba(232,115,255,.94)';ctx.fillStyle='rgba(110,70,145,.5)';ctx.lineWidth=1.5;ctx.shadowBlur=15;ctx.shadowColor='rgba(217,83,255,.52)';ctx.beginPath();ctx.ellipse(0,4,40,12,0,0,TAU);ctx.fill();ctx.stroke();
 const dome=ctx.createRadialGradient(0,-9,1,0,-9,21);dome.addColorStop(0,'rgba(235,252,255,.56)');dome.addColorStop(.42,'rgba(135,175,255,.29)');dome.addColorStop(1,'rgba(120,85,190,.15)');ctx.fillStyle=dome;ctx.beginPath();ctx.ellipse(0,-4,19,14,0,Math.PI,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,170,240,.62)';ctx.beginPath();ctx.moveTo(-29,10);ctx.quadraticCurveTo(0,18,29,10);ctx.stroke();
 [-28,-14,0,14,28].forEach((x,i)=>{const pulse=.55+.45*Math.sin(time*2+i);ctx.fillStyle=`rgba(126,234,255,${.36+.4*pulse})`;ctx.shadowBlur=7;ctx.shadowColor='rgba(126,234,255,.52)';ctx.beginPath();ctx.arc(x,9,1.7,0,TAU);ctx.fill();});ctx.restore();
}

// A translucent light volume with a soft pool of light on the tank floor.
export function drawUFOBeam(c:CanvasRenderingContext2D,x:number,y:number,floorY:number,scale:number,color:string,time:number){
 const rgb=/^#[a-f\d]{6}$/i.test(color)?color:'#48baff',r=parseInt(rgb.slice(1,3),16),g=parseInt(rgb.slice(3,5),16),b=parseInt(rgb.slice(5,7),16),tint=(a:number)=>`rgba(${r},${g},${b},${a})`,height=Math.max(30,floorY-y),top=12*scale,wide=Math.min(180,55*scale+height*.13),pulse=.96+Math.sin(time*1.4)*.04;
 c.save();c.globalCompositeOperation='screen';c.globalAlpha=pulse;
 const cone=c.createLinearGradient(x,y,x,floorY);cone.addColorStop(0,tint(.43));cone.addColorStop(.2,tint(.2));cone.addColorStop(1,tint(.06));c.fillStyle=cone;c.beginPath();c.moveTo(x-top,y);c.lineTo(x-wide,floorY);c.ellipse(x,floorY,wide,wide*.2,0,Math.PI,0,true);c.lineTo(x+top,y);c.closePath();c.fill();
 const core=c.createLinearGradient(x,y,x,floorY);core.addColorStop(0,tint(.25));core.addColorStop(1,tint(0));c.fillStyle=core;c.beginPath();c.moveTo(x-top*.4,y);c.lineTo(x-wide*.6,floorY);c.lineTo(x+wide*.6,floorY);c.closePath();c.fill();
 c.save();c.translate(x,floorY);c.scale(1,.23);const pool=c.createRadialGradient(0,0,0,0,0,wide*1.25);pool.addColorStop(0,tint(.56));pool.addColorStop(.5,tint(.24));pool.addColorStop(1,tint(0));c.fillStyle=pool;c.beginPath();c.arc(0,0,wide*1.25,0,Math.PI*2);c.fill();c.restore();
 c.shadowColor=rgb;c.shadowBlur=16;c.fillStyle=tint(.8);c.beginPath();c.ellipse(x,y,top,Math.max(2,3*scale),0,0,Math.PI*2);c.fill();c.restore();
}