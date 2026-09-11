import type {Brain} from './behavior';
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export const smooth=(a:number,b:number,x:number)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
export type Motion={phase:number;breathPhase:number;finPhase:number;speed:number;effort:number;turn:number;tailTurn:number;pitch:number};
export function newMotion():Motion{return {phase:0,breathPhase:0,finPhase:0,speed:0,effort:.3,turn:0,tailTurn:0,pitch:0};}
export function stepMotion(m:Motion,f:Brain,dt:number){
 const speed=f.velocity.length(),s=clamp(speed/1.7,0,1),ease=1-Math.exp(-dt*5);
 m.speed+=(s-m.speed)*ease;
 const hovering=f.mode==='rest'||((f.mode==='feed'||f.mode==='forage')&&speed<.16);
 const effort=hovering?.20:f.mode==='scurry'?.9:clamp(.25+s*.75,.25,1);
 m.effort+=(effort-m.effort)*ease;
 m.turn+=(clamp(f.turn,-3.6,3.6)-m.turn)*(1-Math.exp(-dt*9));
 m.tailTurn+=(m.turn-m.tailTurn)*(1-Math.exp(-dt*3));
 m.pitch+=(clamp(Math.atan2(f.velocity.y,Math.max(.12,Math.hypot(f.velocity.x,f.velocity.z))),-.6,.6)-m.pitch)*ease;
 const hz=.34+1.9*m.speed+.28*m.effort;
 m.phase=(m.phase+dt*hz*Math.PI*2)%(Math.PI*2);
 // Hovering uses slower body strokes, with stronger pectoral support; all phases derive from the head's stroke.
 m.finPhase=m.phase;
 m.breathPhase=(m.breathPhase+dt*(1.0+.8*m.speed)*Math.PI*2)%(Math.PI*2);
}
export function bendFantail(base:Float32Array,out:Float32Array,m:Motion){
 const N=96,cx=new Float32Array(N+1),cy=new Float32Array(N+1),theta=new Float32Array(N+1);
 cy[0]=-.951;
 for(let j=0;j<=N;j++){
  const y=-.951+1.902*j/N,q=smooth(-.52,.88,y);
  // Head follows the steering heading; rear sections retain their earlier heading.
  // Negative curvature makes the tail lag a positive head turn instead of rotating as a block.
  const bodyTurn=clamp(m.turn*.50,-1.15,1.15)*smooth(-.52,.28,y);
  const fanTurn=clamp(m.tailTurn*.19,-.45,.45)*smooth(.12,.88,y);
  const turning=smooth(.25,1.5,Math.abs(m.turn));
  theta[j]=(.018+.03*m.effort)*Math.sin(m.phase)+(.28+.76*m.effort)*(1-.55*turning)*q*Math.sin(m.phase-2.65*q)-bodyTurn-fanTurn;
  if(j){const a=(theta[j]+theta[j-1])*.5;cx[j]=cx[j-1]+Math.sin(a)*1.902/N;cy[j]=cy[j-1]+Math.cos(a)*1.902/N;}
 }
 for(let i=0;i<base.length;i+=3){
  let x=base[i],y=base[i+1],z=base[i+2];const originalY=y,side=x<0?-1:1,rear=smooth(-.55,-.32,y),q=smooth(-.52,.88,y),local=m.phase-2.65*q;
  // The existing mouth opening gently widens; only the lip region moves.
  const breath=.5-.5*Math.cos(m.breathPhase);
  const lip=(1-smooth(-.925,-.855,y))*(1-smooth(.055,.105,Math.abs(x+.035)))*(1-smooth(.045,.11,Math.abs(z-.035)));
  z+=(z-.035)*.30*breath*lip;y-=.006*breath*lip;
  const gill=smooth(-.79,-.70,originalY)*(1-smooth(-.60,-.52,originalY))*(1-smooth(.10,.24,Math.abs(z-.015)))*smooth(.13,.23,Math.abs(x));
  x+=side*.007*gill*(.5-.5*Math.cos(m.breathPhase-.5));
  const dorsal=rear*smooth(.24,.54,z)*(1-smooth(.12,.45,y));
  const lower=rear*smooth(.27,.57,-z)*(1-smooth(.25,.55,y));
  x+=(.025+.05*m.effort)*dorsal*Math.sin(local-.55);
  x+=(.025+.05*m.effort)*lower*Math.sin(local-.7);
  const paired=smooth(.235,.305,Math.abs(base[i]))*smooth(-.68,-.59,y)*(1-smooth(-.42,-.36,y))*(1-smooth(-.10,-.035,z));
  const stroke=side*(.52+.23*m.effort)*Math.sin(m.phase-.35)*paired,c=Math.cos(stroke),s=Math.sin(stroke),dx=x-side*.235,dz=z+.125;
  x=side*.235+c*dx+s*dz;z=-.125-s*dx+c*dz;
  y+=.01*paired*paired*Math.sin(m.phase-.6);
  const tail=smooth(.12,.78,originalY);
  x+=(.02+.04*m.effort)*tail*tail*Math.sin(local-.7+side*.25);
  z+=.017*tail*tail*Math.sin(local-.85+side*.3);
  const jf=clamp((y+.951)/1.902*N,0,N-.001),j=Math.floor(jf),t=jf-j;
  const a=theta[j]*(1-t)+theta[j+1]*t,xx=cx[j]*(1-t)+cx[j+1]*t+x*Math.cos(a),yy=cy[j]*(1-t)+cy[j+1]*t-x*Math.sin(a);
  out[i]=-yy;out[i+1]=z;out[i+2]=xx;
 }
}
