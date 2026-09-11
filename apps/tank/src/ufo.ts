// Adapted from the user's Bustin_Rocks_v2.1 drawAlien.
export function drawUFO(ctx:CanvasRenderingContext2D,time=0){
 const TAU=Math.PI*2;ctx.save();ctx.strokeStyle='rgba(232,115,255,.94)';ctx.fillStyle='rgba(110,70,145,.5)';ctx.lineWidth=1.5;ctx.shadowBlur=15;ctx.shadowColor='rgba(217,83,255,.52)';ctx.beginPath();ctx.ellipse(0,4,40,12,0,0,TAU);ctx.fill();ctx.stroke();
 const dome=ctx.createRadialGradient(0,-9,1,0,-9,21);dome.addColorStop(0,'rgba(235,252,255,.56)');dome.addColorStop(.42,'rgba(135,175,255,.29)');dome.addColorStop(1,'rgba(120,85,190,.15)');ctx.fillStyle=dome;ctx.beginPath();ctx.ellipse(0,-4,19,14,0,Math.PI,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='rgba(255,170,240,.62)';ctx.beginPath();ctx.moveTo(-29,10);ctx.quadraticCurveTo(0,18,29,10);ctx.stroke();
 [-28,-14,0,14,28].forEach((x,i)=>{const pulse=.55+.45*Math.sin(time*2+i);ctx.fillStyle=`rgba(126,234,255,${.36+.4*pulse})`;ctx.shadowBlur=7;ctx.shadowColor='rgba(126,234,255,.52)';ctx.beginPath();ctx.arc(x,9,1.7,0,TAU);ctx.fill();});ctx.restore();
}
