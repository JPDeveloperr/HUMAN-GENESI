/** Pure geometry kernel. Coordinates in metres; +Y up, +Z face. No renderer imports. */
export interface FaceParameters {
  headWidth: number; headLength: number; foreheadHeight: number; jawWidth: number;
  chinProjection: number; cheekboneProminence: number; noseLength: number;
  noseWidth: number; eyeSpacing: number; eyeSize: number; lipFullness: number; earSize: number;
}
export const defaults: FaceParameters = {
  headWidth: 1, headLength: 1, foreheadHeight: 1, jawWidth: 1, chinProjection: 1,
  cheekboneProminence: 1, noseLength: 1, noseWidth: 1, eyeSpacing: 1, eyeSize: 1,
  lipFullness: 1, earSize: 1,
};
export const labels: Record<keyof FaceParameters, string> = {
  headWidth:'Largura do crânio', headLength:'Comprimento do crânio', foreheadHeight:'Altura da testa',
  jawWidth:'Largura da mandíbula', chinProjection:'Projeção do queixo', cheekboneProminence:'Maçãs do rosto',
  noseLength:'Projeção do nariz', noseWidth:'Largura do nariz', eyeSpacing:'Distância orbital',
  eyeSize:'Tamanho orbital', lipFullness:'Volume dos lábios', earSize:'Volume auricular',
};
export interface ProceduralMesh {
  positions: Float32Array; normals: Float32Array; uvs: Float32Array;
  indices: Uint32Array; regions: Uint16Array;
}
export const regions = ['Crânio','Testa','Órbitas','Nariz','Bochechas','Lábios','Mandíbula','Orelhas'] as const;
const g = (x:number, center:number, width:number) => Math.exp(-(((x-center)/width)**2));
export function generateHead(input: FaceParameters = defaults, segments = 96, rings = 72): ProceduralMesh {
  if (!Number.isInteger(segments) || segments < 12 || segments > 256 || !Number.isInteger(rings) || rings < 12 || rings > 256) throw new Error('Resolução inválida');
  const p = {...input};
  for (const key of Object.keys(defaults) as (keyof FaceParameters)[]) {
    if (!Number.isFinite(p[key]) || p[key] < .7 || p[key] > 1.3) throw new Error(`Parâmetro inválido: ${key}`);
  }
  const pos:number[] = [0,.035+.090*p.foreheadHeight,0], uv:number[]=[.5,1], reg:number[]=[0], ids:number[]=[];
  for(let row=1; row<rings; row++) {
    const theta = Math.PI*row/rings, sy=Math.cos(theta), radial=Math.sin(theta)**(sy<0?.78:1), y=sy*.125;
    for(let col=0; col<segments; col++) {
      const phi=2*Math.PI*col/segments, front=Math.max(0,Math.sin(phi))**6;
      let x=.083*p.headWidth*radial*Math.cos(phi);
      let z=.090*p.headLength*radial*Math.sin(phi);
      // One continuous cranial surface with localized, smooth anatomical fields.
      x *= 1 - .12*g(y,-.088,.05) + .19*(p.jawWidth-1)*g(y,-.075,.045);
      const ax=Math.abs(x), orbit=g(ax,.032*p.eyeSpacing,.019*p.eyeSize)*g(y,.026,.016*p.eyeSize);
      const nose=g(x,0,.014*p.noseWidth)*g(y,-.005,.026);
      const cheek=g(ax,.052,.023)*g(y,-.017,.030);
      const chin=g(x,0,.035)*g(y,-.107,.024);
      const lips=g(x,0,.031)*(g(y,-.060,.005)+.85*g(y,-.070,.006));
      z += front*(.027*p.noseLength*nose - .015*orbit + .006*p.cheekboneProminence*cheek
        + .014*p.chinProjection*chin + .009*p.lipFullness*lips - .006*g(x,0,.033)*g(y,-.065,.002));
      // Auricular bulges are integrated; pinna folds are deferred.
      x += Math.sign(x)*.006*p.earSize*g(ax,.080*p.headWidth,.010)*g(y,-.012,.032)*(1-front);
      const yy = y > .035 ? .035+(y-.035)*p.foreheadHeight : y;
      pos.push(x,yy,z); uv.push(col/segments,1-row/rings);
      reg.push(front>.25 ? nose>.45 ? 3 : orbit>.3 ? 2 : lips>.25 ? 5 : y<-.07 ? 6 : cheek>.3 ? 4 : y>.04 ? 1 : 0 : Math.abs(x)>.085 && Math.abs(y)<.05 ? 7 : 0);
    }
  }
  const bottom=pos.length/3; pos.push(0,-.125,0);uv.push(.5,0);reg.push(6);
  const v=(row:number,col:number)=>1+row*segments+(col%segments);
  for(let col=0;col<segments;col++) ids.push(0,v(0,col+1),v(0,col));
  for(let row=0;row<rings-2;row++) for(let col=0;col<segments;col++) {
    const a=v(row,col),b=v(row,col+1),c=v(row+1,col),d=v(row+1,col+1); ids.push(a,b,c,b,d,c);
  }
  for(let col=0;col<segments;col++) ids.push(v(rings-2,col),v(rings-2,col+1),bottom);
  const mesh:ProceduralMesh={positions:new Float32Array(pos), normals:new Float32Array(pos.length),uvs:new Float32Array(uv),indices:new Uint32Array(ids),regions:new Uint16Array(reg)};
  computeNormals(mesh); return mesh;
}
export function computeNormals(m:ProceduralMesh) {
  m.normals.fill(0);
  for(let i=0;i<m.indices.length;i+=3) {
    const [a,b,c]=[m.indices[i]*3,m.indices[i+1]*3,m.indices[i+2]*3];
    const ux=m.positions[b]-m.positions[a],uy=m.positions[b+1]-m.positions[a+1],uz=m.positions[b+2]-m.positions[a+2];
    const vx=m.positions[c]-m.positions[a],vy=m.positions[c+1]-m.positions[a+1],vz=m.positions[c+2]-m.positions[a+2];
    const n=[uy*vz-uz*vy,uz*vx-ux*vz,ux*vy-uy*vx];
    for(const j of [a,b,c]) for(let k=0;k<3;k++) m.normals[j+k]+=n[k];
  }
  for(let i=0;i<m.normals.length;i+=3) { const l=Math.hypot(...m.normals.subarray(i,i+3)); if(l>0) for(let k=0;k<3;k++) m.normals[i+k]/=l; }
}
