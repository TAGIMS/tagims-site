import {clamp} from './state';
// Perspective is shared by drawing, dragging and size handles.
export function projectPoint(x:number,y:number,z:number,width:number,height:number){const depth=clamp((z+2.6)/5.2,0,1),scale=.68+.42*depth;return {x:width*(.5+x/16*scale),y:height*(.735+.235*depth-y/6*.91*scale),scale,ground:height*(.735+.235*depth)};}
export function unprojectGround(nx:number,ny:number){const depth=clamp((ny-.735)/.235,0,1),scale=.68+.42*depth;const z=depth*5.2-2.6,x=(nx-.5)*16/scale;return {x:clamp(x/15+.5,-.5,1.5),y:clamp(.73+(z/5.1+.5)*.25,.73,.98)};}
