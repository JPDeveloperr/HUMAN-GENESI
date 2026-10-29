import {describe,it,expect} from 'vitest';
import {defaults,generateHead,type FaceParameters} from './head';
import {validateMesh} from './validate';
describe('Procedural head',()=>{
  it('is deterministic, closed, connected, outward and genus zero',()=>{
    const a=generateHead(),b=generateHead();expect(a.positions).toEqual(b.positions);
    const r=validateMesh(a);expect(r.errors).toEqual([]);expect(r.components).toBe(1);expect(r.euler).toBe(2);
    expect(r.vertices).toBe(6818);expect(r.triangles).toBe(13632);expect(r.volume).toBeGreaterThan(.003);
  });
  for(const key of Object.keys(defaults) as (keyof FaceParameters)[]) {
    for(const value of [.7,1.3]) it(`${key}=${value} changes actual coordinates without structural defects`,()=>{
      const base=generateHead(defaults,48,36),mesh=generateHead({...defaults,[key]:value},48,36);
      expect(mesh.positions.some((x,i)=>Math.abs(x-base.positions[i])>1e-6)).toBe(true);
      expect(validateMesh(mesh).errors).toEqual([]);
    });
  }
  it('validates combined extreme parameter sets',()=>{
    let seed=123;
    for(let i=0;i<30;i++) {
      const p={...defaults};for(const k of Object.keys(p) as (keyof FaceParameters)[]) {seed=(seed*1664525+1013904223)>>>0;p[k]=.7+.6*seed/4294967296;}
      expect(validateMesh(generateHead(p,48,36)).errors).toEqual([]);
    }
  });
  it('rejects invalid parameters and resolutions',()=>{
    expect(()=>generateHead({...defaults,noseLength:NaN})).toThrow();expect(()=>generateHead(defaults,2,2)).toThrow();
  });
  it('detects corrupt indices, holes and nonfinite data',()=>{
    let m=generateHead();m.indices[0]=999999;expect(validateMesh(m).valid).toBe(false);
    m=generateHead();m.indices=m.indices.slice(3);expect(validateMesh(m).boundary).toBe(3);
    m=generateHead();m.positions[2]=NaN;expect(validateMesh(m).errors).toContain('Coordenadas não finitas');
  });
});
