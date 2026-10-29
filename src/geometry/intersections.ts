import type {ProceduralMesh} from './head.ts';
type V=[number,number,number];
const sub=(a:V,b:V):V=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function segmentTriangle(a:V,b:V,t:V[]) {
  const d=sub(b,a),e1=sub(t[1],t[0]),e2=sub(t[2],t[0]),h=cross(d,e2),det=dot(e1,h);
  if(Math.abs(det)<1e-14)return false; // Coplanar pairs are explicitly outside this check's scope.
  const inv=1/det,s=sub(a,t[0]),u=inv*dot(s,h);if(u<1e-7||u>1-1e-7)return false;
  const q=cross(s,e1),v=inv*dot(d,q);if(v<1e-7||u+v>1-1e-7)return false;
  const distance=inv*dot(e2,q);return distance>1e-7&&distance<1-1e-7;
}
/** Uniform-grid broad phase, transverse edge/triangle narrow phase. Adjacent faces are excluded.
 * This does NOT certify coplanar overlap, tangency, or collisions between separate facial parts. */
export function findSelfIntersections(mesh:ProceduralMesh,limit=20) {
  const cells=new Map<string,number[]>(),seen=new Set<number>(),pairs:[number,number][]=[],size=.008;
  const triangles=Array.from({length:mesh.indices.length/3},(_,i)=>{
    const ids=Array.from(mesh.indices.subarray(i*3,i*3+3));
    const v=ids.map(id=>Array.from(mesh.positions.subarray(id*3,id*3+3)) as V);
    return {ids,v,min:[0,1,2].map(k=>Math.min(...v.map(p=>p[k]))),max:[0,1,2].map(k=>Math.max(...v.map(p=>p[k])))};
  });let testedPairs=0;
  for(let i=0;i<triangles.length;i++) {
    const a=triangles[i],low=a.min.map(x=>Math.floor(x/size)),high=a.max.map(x=>Math.floor(x/size));
    for(let x=low[0];x<=high[0];x++)for(let y=low[1];y<=high[1];y++)for(let z=low[2];z<=high[2];z++){
      const key=`${x}:${y}:${z}`,bucket=cells.get(key)??[];
      for(const j of bucket){const id=i*triangles.length+j;if(seen.has(id))continue;seen.add(id);const b=triangles[j];
        if(a.ids.some(id=>b.ids.includes(id))||a.min.some((v,k)=>v>b.max[k]+1e-9)||b.min.some((v,k)=>v>a.max[k]+1e-9))continue;
        testedPairs++;
        if(a.v.some((v,k)=>segmentTriangle(v,a.v[(k+1)%3],b.v))||b.v.some((v,k)=>segmentTriangle(v,b.v[(k+1)%3],a.v))){pairs.push([j,i]);if(pairs.length>=limit)return {pairs,testedPairs,truncated:true};}
      }
      bucket.push(i);cells.set(key,bucket);
    }
  }
  return {pairs,testedPairs,truncated:false};
}
