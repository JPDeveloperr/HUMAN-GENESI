import * as THREE from 'three';
import type {FaceAssembly} from './geometry/face';
import {toGeometry} from './export';
export function createFaceScene(face:FaceAssembly,color='#b99a86',roughness=.62) {
  const group=new THREE.Group();group.name='HumanGenesisV02';
  group.userData={version:face.version,parameters:face.parameters,units:'metres',loops:face.loops};
  const skinGeometry=toGeometry(face.skin),colors=new Float32Array(face.skin.positions.length);
  for(let i=0;i<face.skin.regions.length;i++){
    const region=face.skin.regions[i],x=face.skin.positions[i*3],y=face.skin.positions[i*3+1];
    const variation=.985+.015*Math.sin(x*157+y*213);
    const tint=region===8?[.22,.10,.08]:region===5?[.98,.72,.70]:[1,.98,.96];
    for(let k=0;k<3;k++)colors[i*3+k]=tint[k]*variation;
  }
  skinGeometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
  const skin=new THREE.Mesh(skinGeometry,new THREE.MeshStandardMaterial({color,roughness,vertexColors:true}));skin.name='ProceduralHead';skin.userData={regions:Array.from(face.skin.regions),role:'skin'};group.add(skin);
  for(const part of face.parts){const material=new THREE.MeshPhysicalMaterial({
    color:part.material==='sclera'?'#dce1d6':part.material==='iris'?'#647e72':'#080b0c',
    roughness:part.material==='sclera'?.25:part.material==='iris'?.35:.16,
    clearcoat:part.material==='sclera'?.35:.1,
  });const mesh=new THREE.Mesh(toGeometry(part.mesh),material);mesh.name=part.name;mesh.userData={role:part.material,regions:Array.from(part.mesh.regions)};group.add(mesh);}
  return group;
}
export function disposeFaceScene(group:THREE.Group) {group.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const materials=Array.isArray(object.material)?object.material:[object.material];materials.forEach(m=>m.dispose());}});group.clear();}
