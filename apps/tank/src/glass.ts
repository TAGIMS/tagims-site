// Resolution-independent polished glass with a tinted core, rim and soft highlights.
export function drawGlass(c:CanvasRenderingContext2D,color:string){
 c.save();c.scale(1,.58);c.shadowColor='rgba(0,12,20,.45)';c.shadowBlur=5;c.shadowOffsetY=3;
 const g=c.createRadialGradient(-9,-12,2,0,0,28);g.addColorStop(0,'#eaffff');g.addColorStop(.18,color);g.addColorStop(.7,color);g.addColorStop(1,'#16313f');c.fillStyle=g;c.beginPath();c.ellipse(0,0,28,24,-.15,0,Math.PI*2);c.fill();c.shadowBlur=0;c.shadowOffsetY=0;
 c.strokeStyle='rgba(225,255,255,.6)';c.lineWidth=1.4;c.stroke();c.fillStyle='rgba(255,255,255,.72)';c.beginPath();c.ellipse(-9,-12,9,3,-.35,0,Math.PI*2);c.fill();c.strokeStyle='rgba(190,250,255,.65)';c.beginPath();c.ellipse(2,3,21,15,0,.1,1.9);c.stroke();c.restore();
}
