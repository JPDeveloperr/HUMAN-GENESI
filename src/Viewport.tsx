import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createFaceScene,disposeFaceScene} from './faceScene';
import type {FaceAssembly} from './geometry/face';
export type CameraView='frontal'|'lateral'|'three-quarter';
interface Props {face:FaceAssembly;view:CameraView;wireframe:boolean;color:string;roughness:number;exposure:number;onFrame:(ms:number)=>void}
export function Viewport(p:Props) {
  const host=useRef<HTMLDivElement>(null),sceneState=useRef<{head:THREE.Group;renderer:THREE.WebGLRenderer;camera:THREE.PerspectiveCamera;controls:OrbitControls}> (null);
  const [error,setError]=useState('');
  const frameCallback=useRef(p.onFrame);frameCallback.current=p.onFrame;
  useEffect(()=>{
    if(!host.current)return;
    let renderer:THREE.WebGLRenderer;
    try {renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});}catch {setError('WebGL2 indisponível neste navegador. A geração e exportação continuam disponíveis.');return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.setClearColor('#11191b');renderer.domElement.setAttribute('aria-label','Cabeça procedural em 3D');
    host.current.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.01,10);camera.position.set(.31,.09,.63);
    const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,0,0);controls.enableDamping=true;controls.minDistance=.24;controls.maxDistance=1.6;
    const head=new THREE.Group();scene.add(head);
    sceneState.current={head,renderer,camera,controls};
    scene.add(new THREE.HemisphereLight('#dceaf4','#333432',2));
    const key=new THREE.DirectionalLight('#fff0df',3.2);key.position.set(-.4,.5,.6);scene.add(key);
    const rim=new THREE.DirectionalLight('#8bbec7',2);rim.position.set(.4,.1,-.4);scene.add(rim);
    const grid=new THREE.GridHelper(1,20,'#344649','#1c2a2c');grid.position.y=-.181;scene.add(grid);
    const resize=new ResizeObserver(()=>{if(!host.current)return;const w=host.current.clientWidth,h=host.current.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(host.current);
    let id=0,last=performance.now(),count=0,sum=0;
    function tick(now:number) {sum+=now-last;last=now;count++;if(count===60){frameCallback.current(sum/count);count=0;sum=0;}controls.update();renderer.render(scene,camera);id=requestAnimationFrame(tick);}id=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(id);resize.disconnect();controls.dispose();disposeFaceScene(head);grid.geometry.dispose();(grid.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();sceneState.current=null;};
  },[]);
  useEffect(()=>{const state=sceneState.current;if(!state)return;disposeFaceScene(state.head);const group=createFaceScene(p.face,p.color,p.roughness);state.head.add(group);},[p.face]);
  useEffect(()=>{const s=sceneState.current;if(!s)return;s.head.traverse(object=>{if(object instanceof THREE.Mesh){const material=object.material as THREE.MeshStandardMaterial;material.wireframe=p.wireframe;if(object.userData.role==='skin'){material.color.set(p.color);material.roughness=p.roughness;}}});s.renderer.toneMappingExposure=p.exposure;},[p.face,p.wireframe,p.color,p.roughness,p.exposure]);
  useEffect(()=>{const s=sceneState.current;if(!s)return;s.controls.target.set(0,-.02,0);if(p.view==='frontal')s.camera.position.set(0,.005,.68);else if(p.view==='lateral')s.camera.position.set(.68,.005,0);else s.camera.position.set(.34,.035,.60);s.controls.update();},[p.view]);
  return <div className="viewport" ref={host}>{error&&<p role="alert">{error}</p>}</div>;
}
