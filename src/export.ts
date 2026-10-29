import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import type { ProceduralMesh } from './geometry/head';
export function toGeometry(m:ProceduralMesh) {
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(m.positions,3));
  g.setAttribute('normal',new THREE.BufferAttribute(m.normals,3));
  g.setAttribute('uv',new THREE.BufferAttribute(m.uvs,2));
  g.setIndex(new THREE.BufferAttribute(m.indices,1));return g;
}
export async function exportGLB(m:ProceduralMesh,color='#b99a86',roughness=.62) {
  const geometry=toGeometry(m),material=new THREE.MeshStandardMaterial({color,roughness});
  const head=new THREE.Mesh(geometry,material);head.name='ProceduralHead';
  head.userData={generator:'HUMAN GENESIS 0.1',units:'metres',regions:Array.from(m.regions)};
  try {return await new GLTFExporter().parseAsync(head,{binary:true}) as ArrayBuffer;}
  finally {geometry.dispose();material.dispose();}
}
export function download(data:BlobPart,name:string,type:string) {
  const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
