import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import type {FaceAssembly} from './geometry/face';
import {createFaceScene,disposeFaceScene} from './faceScene';
export async function exportFaceGLB(face:FaceAssembly,color='#b99a86',roughness=.62) {
  const group=createFaceScene(face,color,roughness);
  try{return await new GLTFExporter().parseAsync(group,{binary:true}) as ArrayBuffer;}
  finally{disposeFaceScene(group);}
}
