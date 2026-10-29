import type { ProceduralMesh } from './head';
export function validateMesh(m:ProceduralMesh) {
  const errors:string[]=[], n=m.positions.length/3;
  if(!Number.isInteger(n)||m.normals.length!==m.positions.length||m.uvs.length!==n*2||m.regions.length!==n||m.indices.length%3) errors.push('Dimensões incompatíveis');
  if(![...m.positions,...m.normals,...m.uvs].every(Number.isFinite)) errors.push('Coordenadas não finitas');
  const edges=new Map<string,{count:number,balance:number}>();
  const parent=Array.from({length:n},(_,i)=>i);
  const root=(i:number):number=>{while(parent[i]!==i) {parent[i]=parent[parent[i]];i=parent[i];}return i;};
  let volume=0,degenerate=0,invalid=0,normalErrors=0;
  for(let i=0;i<m.indices.length;i+=3) {
    const ids=Array.from(m.indices.subarray(i,i+3));
    if(ids.some(x=>x>=n)) {invalid++;continue;}
    const [a,b,c]=ids.map(j=>Array.from(m.positions.subarray(j*3,j*3+3)));
    const u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]);
    const cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(Math.hypot(...cross)<1e-12) degenerate++;
    volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
    if(cross.reduce((sum,x,k)=>sum+x*ids.reduce((s,j)=>s+m.normals[j*3+k],0),0)<=0) normalErrors++;
    for(let k=0;k<3;k++) {const x=ids[k],y=ids[(k+1)%3],key=`${Math.min(x,y)}:${Math.max(x,y)}`,e=edges.get(key)??{count:0,balance:0};e.count++;e.balance+=x<y?1:-1;edges.set(key,e);parent[root(x)]=root(y);}
  }
  const boundary=[...edges.values()].filter(e=>e.count===1).length;
  const nonManifold=[...edges.values()].filter(e=>e.count>2).length;
  const orientation=[...edges.values()].filter(e=>e.count===2&&e.balance!==0).length;
  for(let i=0;i<m.normals.length;i+=3) if(Math.abs(Math.hypot(...m.normals.subarray(i,i+3))-1)>.001) {errors.push('Normal não unitária');break;}
  if(invalid) errors.push(`${invalid} índices inválidos`);
  if(degenerate) errors.push(`${degenerate} triângulos degenerados`);
  if(boundary) errors.push(`${boundary} arestas abertas`);
  if(nonManifold) errors.push(`${nonManifold} arestas não manifold`);
  if(orientation||normalErrors) errors.push('Orientação inconsistente');
  if(volume<=0) errors.push('Volume não positivo');
  const components=new Set(parent.map((_,i)=>root(i))).size;
  if(components!==1) errors.push('Superfície desconectada');
  return {valid:errors.length===0,errors,vertices:n,triangles:m.indices.length/3,boundary,nonManifold,components,euler:n-edges.size+m.indices.length/3,volume,bytes:m.positions.byteLength+m.normals.byteLength+m.uvs.byteLength+m.indices.byteLength+m.regions.byteLength,
    limitations:['Interseções entre triângulos não são verificadas.','Topologia ainda não validada para animação.']};
}
