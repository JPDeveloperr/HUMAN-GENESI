import {defaults,type FaceParameters,type ProceduralMesh} from './head.ts';

export type Vec3 = [number,number,number];
export interface FacialPart {name:string;mesh:ProceduralMesh;material:'skin'|'sclera'|'iris'|'pupil';}
export interface FeatureLoop {name:string;rim:number[];support:number[][];center:Vec3;radius: [number,number];cavity:number[][];cap:number;}
export interface FaceAssembly {version:'0.2';parameters:FaceParameters;skin:ProceduralMesh;parts:FacialPart[];loops:FeatureLoop[];eyes:{center:Vec3;radius:number;side:number}[];}
const gauss=(x:number,c:number,s:number)=>Math.exp(-(((x-c)/s)**2));
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
// Shape-preserving cubic interpolation; square-root pole intervals match their adjacent tangent.
const profile=(y:number,points:number[][])=>{
  const slope=(j:number)=>(points[j+1][1]-points[j][1])/(points[j][0]-points[j+1][0]);
  const tangent=(j:number)=>{if(j===0)return slope(0);if(j===points.length-1)return slope(j-1);const a=slope(j-1),b=slope(j);return a*b<=0?0:2*a*b/(a+b);};
  for(let i=1;i<points.length;i++)if(y>=points[i][0]){
    const h=points[i-1][0]-points[i][0],t=(points[i-1][0]-y)/h,a=points[i-1][1],b=points[i][1];
    const pole=(u:number,d:number)=>Math.sqrt(Math.max(0,u))*((1.5-d)+(d-.5)*u);
    if(i===1)return b*pole(t,tangent(i)*h/b);
    if(i===points.length-1)return a*pole(1-t,-tangent(i-1)*h/a);
    return (2*t**3-3*t*t+1)*a+(t**3-2*t*t+t)*h*tangent(i-1)+(-2*t**3+3*t*t)*b+(t**3-t*t)*h*tangent(i);
  }
  return points.at(-1)![1];
};
const WIDTH=[[.135,0],[.115,.052],[.075,.074],[.025,.078],[-.025,.073],[-.065,.064],[-.09,.053],[-.11,.035],[-.145,.032],[-.17,.032],[-.18,0]];
const DEPTH=[[.135,0],[.115,.052],[.075,.077],[.025,.079],[-.025,.076],[-.065,.067],[-.09,.058],[-.115,.026],[-.16,.029],[-.17,.029],[-.18,0]];
export function landmarks(p:FaceParameters) {
  // Limit local facial scale coupling to keep paired features separated at every public parameter limit.
  const facialScale=.9+.1*p.headWidth;
  const spacing=.0305*facialScale*(.78+.22*p.eyeSpacing),radius=.012*(.7+.3*p.eyeSize);
  return {eyeSpacing:spacing,eyeRadius:radius,eyeY:.028,eyeZ:.064*p.headLength+.003,facialScale};
}
function surface(theta:number,phi:number,p:FaceParameters):Vec3 {
  const y=-.0225+.1575*Math.cos(theta),s=Math.sin(phi),front=Math.max(0,s),face=front**4;
  const width=profile(y,WIDTH);
  const jaw=gauss(y,-.075,.035);
  let x=width*Math.cos(phi)*p.headWidth*(1+.28*(p.jawWidth-1)*jaw);
  const depth=profile(y,DEPTH);
  let z=depth*s*p.headLength;
  const ax=Math.abs(x),lm=landmarks(p);
  // Bridge, dorsum, rounded tip, alae and columella are distinct continuous fields.
  const bridge=.014*gauss(x,0,.009*p.noseWidth)*gauss(y,.020,.027);
  const dorsum=.020*gauss(x,0,.011*p.noseWidth)*gauss(y,-.003,.023);
  const tip=.026*gauss(x,0,.013*p.noseWidth)*gauss(y,-.016,.010);
  const ala=.012*gauss(ax,.013*p.noseWidth,.006)*gauss(y,-.021,.009);
  const orbit=gauss(ax,lm.eyeSpacing,.019)*gauss(y,lm.eyeY,.015);
  const brow=gauss(ax,lm.eyeSpacing,.023)*gauss(y,.046,.009);
  z+=face*(p.noseLength*(bridge+dorsum+tip+ala)-.004*orbit+.003*brow
    +.005*p.cheekboneProminence*gauss(ax,.049,.018)*gauss(y,-.004,.020)
    +.008*p.chinProjection*gauss(x,0,.030)*gauss(y,-.088,.015)
    -.003*gauss(x,0,.018)*gauss(y,-.033,.009)
    +p.lipFullness*gauss(x,0,.026)*(.003*gauss(y,-.048,.005)+.004*gauss(y,-.058,.005)));
  if(front>.5)for(const side of [-1,1]){const d2=(x-side*lm.eyeSpacing)**2+(y-lm.eyeY)**2;if(d2<lm.eyeRadius**2){const envelope=lm.eyeZ+Math.sqrt(lm.eyeRadius**2-d2)+.0007,d=z-envelope;z=.5*(z+envelope+Math.sqrt(d*d+.0000001));}}
  // Integrated auricular mass retained; detailed pinna is deliberately deferred.
  x+=Math.sign(x)*.005*p.earSize*gauss(y,-.003,.027)*gauss(Math.abs(Math.cos(phi)),1,.05);
  return [x,y>.05?.05+(y-.05)*p.foreheadHeight:y,z];
}
function surfaceXY(x:number,y:number,p:FaceParameters):Vec3 {
  const w=profile(y,WIDTH)*p.headWidth*(1+.28*(p.jawWidth-1)*gauss(y,-.075,.035));
  return surface(Math.acos(Math.max(-1,Math.min(1,(y+.0225)/.1575))),Math.acos(Math.max(-1,Math.min(1,x/w))),p);
}
class Builder {
  pos:number[]=[];uv:number[]=[];reg:number[]=[];ids:number[]=[];
  add(v:Vec3,region=0):number {const i=this.pos.length/3;this.pos.push(...v);this.uv.push(.5+v[0]*4,.5+v[1]*3);this.reg.push(region);return i;}
  point(i:number):Vec3 {return this.pos.slice(3*i,3*i+3) as Vec3;}
  tri(a:number,b:number,c:number){this.ids.push(a,b,c);}
  join(a:number[],b:number[]){for(let i=0;i<a.length;i++){const j=(i+1)%a.length;this.tri(a[i],a[j],b[i]);this.tri(a[j],b[j],b[i]);}}
  finish():ProceduralMesh {
    // Remove replaced patch interiors so no isolated vertices survive local remeshing.
    const used=new Set(this.ids),map=new Map<number,number>();const out=new Builder();
    for(const old of used){map.set(old,out.add(this.point(old),this.reg[old]));}
    out.ids=this.ids.map(i=>map.get(i)!);
    const m={positions:new Float32Array(out.pos),normals:new Float32Array(out.pos.length),uvs:new Float32Array(out.uv),regions:new Uint16Array(out.reg),indices:new Uint32Array(out.ids)};
    angleNormals(m);return m;
  }
}
interface Patch {name:string;cx:number;cy:number;rx:number;ry:number;region:number;depth:number;}
/** V0.1 parameter schema is retained. V0.2 has new indices; persist parameters, never legacy vertex IDs. */
export function generateFace(parameters:FaceParameters=defaults):FaceAssembly {
  const p={...parameters};for(const key of Object.keys(defaults) as (keyof FaceParameters)[]) if(!Number.isFinite(p[key])||p[key]<.7||p[key]>1.3)throw new Error(`Parâmetro inválido: ${key}`);
  const b=new Builder(),segments=192,rings=128,lm=landmarks(p),loops:FeatureLoop[]=[],eyes:FaceAssembly['eyes']=[];
  const patches:Patch[]=[
    ...[-1,1].map(side=>({name:side<0?'eye-left':'eye-right',cx:side*lm.eyeSpacing,cy:lm.eyeY,rx:.0108*(.8+.2*p.eyeSize),ry:.0055*(.8+.2*p.eyeSize),region:2,depth:.025})),
    {name:'mouth',cx:0,cy:-.053,rx:.023*lm.facialScale,ry:.0028,region:5,depth:.029},
    ...[-1,1].map(side=>({name:side<0?'nostril-left':'nostril-right',cx:side*.0105*p.noseWidth,cy:-.024,rx:.0032*p.noseWidth,ry:.0025,region:3,depth:.014})),
  ];
  const top=b.add([0,.05+.085*p.foreheadHeight,0]);
  const grid:number[][]=[];
  for(let row=1;row<rings;row++){const line:number[]=[];for(let col=0;col<segments;col++)line.push(b.add(surface(Math.PI*row/rings,Math.PI*2*col/segments,p)));grid.push(line);}
  const bottom=b.add([0,-.18,0]);
  const cuts=patches.map(patch=>{
    // Select a non-overlapping rectangular grid patch by actual facial coordinates.
    const closest=(value:number,values:number[])=>values.reduce((best,x,i)=>Math.abs(x-value)<Math.abs(values[best]-value)?i:best,0);
    const ys=grid.map(row=>b.point(row[segments/4])[1]);
    const row=closest(patch.cy,ys),xs=grid[row].map(i=>b.point(i)[0]);
    const frontCols=Array.from({length:segments/2-1},(_,i)=>i+1);
    // Choose physical extents, not a fixed number of columns: narrow heads need more cells.
    const extent=patch.region===2?lm.eyeRadius+.006:patch.region===5?patch.rx+.008:patch.rx+.002;
    const firstBelow=(x:number)=>frontCols.find(i=>xs[i]<=x)??frontCols.at(-1)!;
    let c0=Math.max(1,firstBelow(patch.cx+extent)-1),c1=Math.min(segments/2-1,firstBelow(patch.cx-extent));
    if(patch.name.startsWith('nostril')){if(patch.cx>0)c1=Math.min(c1,segments/4);else c0=Math.max(c0,segments/4);}
    const dr=patch.name.startsWith('nostril')?2:4;
    return {patch,r0:row-dr,r1:row+dr,c0,c1};
  });
  // Col increases from right to left on the front, rows descend; [a,b,c] is outward.
  for(let col=0;col<segments;col++) b.tri(top,grid[0][(col+1)%segments],grid[0][col]);
  for(let row=0;row<grid.length-1;row++) for(let col=0;col<segments;col++) {
    if(cuts.some(c=>row>=c.r0&&row<c.r1&&col>=c.c0&&col<c.c1))continue;
    const a=grid[row][col],bb=grid[row][(col+1)%segments],c=grid[row+1][col],d=grid[row+1][(col+1)%segments];b.tri(a,bb,c);b.tri(bb,d,c);
  }
  for(let col=0;col<segments;col++)b.tri(grid.at(-1)![col],grid.at(-1)![(col+1)%segments],bottom);
  for(const {patch,r0,r1,c0,c1} of cuts){
    // Counterclockwise as seen from the face: top right -> top left -> bottom left -> bottom right.
    const outer:number[]=[];
    for(let c=c0;c<c1;c++)outer.push(grid[r0][c]);
    for(let r=r0;r<r1;r++)outer.push(grid[r][c1]);
    for(let c=c1;c>c0;c--)outer.push(grid[r1][c]);
    for(let r=r1;r>r0;r--)outer.push(grid[r][c0]);
    const n=outer.length;
    // Angle follows the outer perimeter's rays, preventing twist and folded transition cells.
    const angles=outer.map(i=>{const v=b.point(i);return Math.atan2((v[1]-patch.cy)/patch.ry,(v[0]-patch.cx)/patch.rx);});
    const isEye=patch.region===2,isMouth=patch.region===5;
    const aperture=(i:number):Vec3=>{
      const a=angles[i],x=patch.cx+patch.rx*Math.cos(a),s=Math.sin(a);
      const cupid=isMouth?.0012*Math.cos(2*Math.PI*(x-patch.cx)/patch.rx)*Math.max(0,s):0;
      const y=patch.cy+patch.ry*s*(isEye?Math.sqrt(Math.abs(s)):1)+cupid;
      let z=0;
      if(isEye)z=surfaceXY(x,y,p)[2]+.0004;
      else if(isMouth)z=.071*p.headLength+.0015*p.lipFullness;
      else z=surfaceXY(patch.cx,patch.cy,p)[2]-.003+(y-patch.cy)*1.3;
      return [x,y,z];
    };
    let previous=outer;const supports:number[][]=[];
    for(let ring=1;ring<=8;ring++){
      const t=ring/8,blend=t*t*(3-2*t),ids=outer.map((id,i)=>{
        const o=b.point(id),a=aperture(i),v=o.map((value,k)=>lerp(value,a[k],t)) as Vec3;
        // Paired orbital folds and distinct vermilion volumes in the transition annulus.
        const base=surfaceXY(v[0],v[1],p)[2];
        v[2]=lerp(base,a[2],blend)+(isEye?.0006:isMouth?.0005*p.lipFullness:.0005)*Math.sin(Math.PI*t)**2;
        if(isEye){const d2=(v[0]-patch.cx)**2+(v[1]-patch.cy)**2;if(d2<lm.eyeRadius**2){const envelope=lm.eyeZ+Math.sqrt(lm.eyeRadius**2-d2)+.0007;const d=v[2]-envelope;v[2]=.5*(v[2]+envelope+Math.sqrt(d*d+.0000001));}}
        return b.add(v,isMouth&&ring<6?0:patch.region);
      });b.join(previous,ids);supports.push(ids);previous=ids;
    }
    const rim=previous,center=aperture(0);center[0]=patch.cx;center[1]=patch.cy;
    const feature:FeatureLoop={name:patch.name,rim,support:supports,center,radius:[patch.rx,patch.ry],cavity:[],cap:-1};loops.push(feature);
    // Inward cavity with a recessed cap: actual geometric aperture, no black decal.
    for(let ring=1;ring<=3;ring++){
      const t=ring/3,ids=rim.map((id)=>{const v=b.point(id);return b.add([lerp(v[0],patch.cx,t*.2),lerp(v[1],patch.cy,t*.2),v[2]-patch.depth*t],8);});
      b.join(previous,ids);feature.cavity.push(ids);previous=ids;
    }
    const cap=b.add([patch.cx,patch.cy,center[2]-patch.depth],8);
    feature.cap=cap;
    for(let i=0;i<n;i++)b.tri(previous[i],previous[(i+1)%n],cap);
  }
  // Remap feature loop IDs consistently with the builder's compacted first-use vertex order.
  const remap=new Map<number,number>();for(const id of b.ids)if(!remap.has(id))remap.set(id,remap.size);
  for(const loop of loops){loop.rim=loop.rim.map(i=>remap.get(i)!);loop.support=loop.support.map(ids=>ids.map(i=>remap.get(i)!));loop.cavity=loop.cavity.map(ids=>ids.map(i=>remap.get(i)!));loop.cap=remap.get(loop.cap)!;}
  const skin=b.finish(),parts:FacialPart[]=[];
  for(const side of [-1,1]){
    const center:Vec3=[side*lm.eyeSpacing,lm.eyeY,lm.eyeZ],r=lm.eyeRadius;
    eyes.push({center,radius:r,side});
    parts.push({name:`eye-${side<0?'left':'right'}-sclera`,mesh:ellipsoid(center,[r,r,r]),material:'sclera'});
    // Thin closed ellipsoids follow the forward ocular pole; independent PBR materials.
    parts.push({name:`eye-${side<0?'left':'right'}-iris`,mesh:ellipsoid([center[0],center[1],center[2]+r-.0005],[.0048,.0048,.0010]),material:'iris'});
    parts.push({name:`eye-${side<0?'left':'right'}-pupil`,mesh:ellipsoid([center[0],center[1],center[2]+r+.0004],[.0021,.0021,.00035]),material:'pupil'});
  }
  return {version:'0.2',parameters:p,skin,parts,loops,eyes};
}
function ellipsoid(center:Vec3,radii:Vec3):ProceduralMesh {
  const b=new Builder(),seg=48,rings=24,top=b.add([center[0],center[1]+radii[1],center[2]]);
  for(let row=1;row<rings;row++)for(let col=0;col<seg;col++) {const t=Math.PI*row/rings,f=2*Math.PI*col/seg;b.add([center[0]+radii[0]*Math.sin(t)*Math.cos(f),center[1]+radii[1]*Math.cos(t),center[2]+radii[2]*Math.sin(t)*Math.sin(f)]);}
  const bottom=b.add([center[0],center[1]-radii[1],center[2]]),v=(r:number,c:number)=>1+r*seg+c%seg;
  for(let col=0;col<seg;col++)b.tri(top,v(0,col+1),v(0,col));
  for(let row=0;row<rings-2;row++)for(let col=0;col<seg;col++){b.tri(v(row,col),v(row,col+1),v(row+1,col));b.tri(v(row,col+1),v(row+1,col+1),v(row+1,col));}
  for(let col=0;col<seg;col++)b.tri(v(rings-2,col),v(rings-2,col+1),bottom);return b.finish();
}

/** Angle weighting prevents tiny cavity faces inheriting normals from much larger transition triangles. */
export function angleNormals(m:ProceduralMesh) {
  m.normals.fill(0);
  for(let i=0;i<m.indices.length;i+=3){
    const ids=Array.from(m.indices.subarray(i,i+3));
    const v=ids.map(id=>Array.from(m.positions.subarray(id*3,id*3+3)));
    const u=v[1].map((x,k)=>x-v[0][k]),w=v[2].map((x,k)=>x-v[0][k]);
    const n=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]],len=Math.hypot(...n);
    if(len===0)continue;
    for(let j=0;j<3;j++){
      const a=v[(j+1)%3].map((x,k)=>x-v[j][k]),b=v[(j+2)%3].map((x,k)=>x-v[j][k]);
      const cos=a.reduce((s,x,k)=>s+x*b[k],0)/(Math.hypot(...a)*Math.hypot(...b));
      const angle=Math.acos(Math.max(-1,Math.min(1,cos)));
      for(let k=0;k<3;k++)m.normals[ids[j]*3+k]+=n[k]/len*angle;
    }
  }
  for(let i=0;i<m.normals.length;i+=3){const len=Math.hypot(...m.normals.subarray(i,i+3));if(len)for(let k=0;k<3;k++)m.normals[i+k]/=len;}
}
