import {describe,it,expect} from 'vitest';
import {generateFace} from './face';
import {defaults,type FaceParameters} from './head';
import {validateMesh} from './validate';
describe('V0.2 anatomical assembly',()=>{
  const baseline=generateFace().skin;
  it('has a closed connected skin and closed independent optical components',()=>{
    const a=generateFace();
    for(const m of [a.skin,...a.parts.map(p=>p.mesh)]){const r=validateMesh(m);expect(r.errors,JSON.stringify(r)).toEqual([]);expect(r.euler).toBe(2);}
    expect(a.loops.map(l=>l.name)).toEqual(['eye-left','eye-right','mouth','nostril-left','nostril-right']);
    expect(a.parts).toHaveLength(6);
  });
  for(const key of Object.keys(defaults) as (keyof FaceParameters)[]) for(const v of [.7,1.3])it(`${key}=${v} preserves topology and feature placement`,()=>{
    const a=generateFace({...defaults,[key]:v});const r=validateMesh(a.skin);expect(r.errors,JSON.stringify(r)).toEqual([]);
    expect(a.skin.positions.length!==baseline.positions.length||a.skin.positions.some((x,i)=>Math.abs(x-baseline.positions[i])>1e-6)).toBe(true);
    for(const eye of a.eyes){const loop=a.loops.find(l=>l.name===(eye.side<0?'eye-left':'eye-right'))!;expect(loop.center[0]).toBe(eye.center[0]);}
  });
});

import {findSelfIntersections} from './intersections';
import {probeDeformation} from './deform';
describe('V0.2 geometric safeguards',()=>{
  it('has no transverse self-intersections in the default skin',()=>{
    const report=findSelfIntersections(generateFace().skin);expect(report.truncated).toBe(false);expect(report.testedPairs).toBeGreaterThan(100);expect(report.pairs).toEqual([]);
  },20000);
  it('detects a deliberately intersecting pair of triangles',()=>{
    const mesh={positions:new Float32Array([-1,-1,0,1,-1,0,0,1,0, 0,0,-1,0,0,1,.5,.5,.5]),indices:new Uint32Array([0,1,2,3,4,5]),normals:new Float32Array(18),uvs:new Float32Array(12),regions:new Uint16Array(6)};
    // Large grid cells are not needed for anatomy, so scale the fixture to anatomical units.
    mesh.positions=mesh.positions.map(x=>x*.01);expect(findSelfIntersections(mesh).pairs).toEqual([[0,1]]);
  });
  it('keeps loops stable in limited blink and mouth-opening probes',()=>{
    const face=generateFace(),original=face.skin.positions.slice();
    for(const [blink,mouth] of [[.2,0],[.5,0],[0,.002],[.3,.002]]){
      const mesh=probeDeformation(face,blink,mouth);expect(mesh.indices).toBe(face.skin.indices);expect(mesh.positions).not.toEqual(original);expect(validateMesh(mesh).errors).toEqual([]);
      expect(findSelfIntersections(mesh).pairs).toEqual([]);
    }
    expect(face.skin.positions).toEqual(original);expect(()=>probeDeformation(face,1)).toThrow();
  },30000);
  it('keeps eyelid rims outside the ocular sphere and optical parts concentric',()=>{
    const face=generateFace();for(const eye of face.eyes){const loop=face.loops.find(l=>l.name===(eye.side<0?'eye-left':'eye-right'))!;
      for(const id of loop.rim){const x=face.skin.positions[id*3]-eye.center[0],y=face.skin.positions[id*3+1]-eye.center[1],z=face.skin.positions[id*3+2]-eye.center[2];expect(Math.hypot(x,y,z)).toBeGreaterThan(eye.radius);}
      const iris=face.parts.find(p=>p.name===`eye-${eye.side<0?'left':'right'}-iris`)!;
      const xs=Array.from(iris.mesh.positions).filter((_,i)=>i%3===0);expect((Math.min(...xs)+Math.max(...xs))/2).toBeCloseTo(eye.center[0],7);
    }
  });
  it('rejects invalid V0.2 parameters',()=>{expect(()=>generateFace({...defaults,eyeSize:Infinity})).toThrow();expect(()=>generateFace({...defaults,headWidth:.1})).toThrow();});
});

describe('V0.2 combined parameter bounds',()=>{
  for(const value of [.7,1.3])it(`all parameters at ${value} remain closed and free of transverse skin intersections`,()=>{
    const parameters=Object.fromEntries(Object.keys(defaults).map(key=>[key,value])) as unknown as FaceParameters;
    const face=generateFace(parameters);expect(validateMesh(face.skin).errors).toEqual([]);const result=findSelfIntersections(face.skin);expect(result.truncated).toBe(false);expect(result.pairs).toEqual([]);
  },20000);
  it('handles seeded parameter combinations',()=>{
    let seed=9741;for(let sample=0;sample<12;sample++){
      const p={...defaults};for(const key of Object.keys(p) as (keyof FaceParameters)[]){seed=(seed*1664525+1013904223)>>>0;p[key]=.7+.6*seed/4294967296;}
      const face=generateFace(p);expect(validateMesh(face.skin).errors,JSON.stringify(p)).toEqual([]);
      expect(face.eyes[0].center[0]).toBe(-face.eyes[1].center[0]);
    }
  },20000);
});
