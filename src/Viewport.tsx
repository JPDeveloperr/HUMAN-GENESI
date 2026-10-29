import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {toGeometry} from './export';
import type {ProceduralMesh} from './geometry/head';
interface Props {mesh:ProceduralMesh;wireframe:boolean;color:string;roughness:number;exposure:number;onFrame:(ms:number)=>void}
export function Viewport(p:Props) {
  const host=useRef<HTMLDivElement>(null),sceneState=useRef<{head:THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>;renderer:THREE.WebGLRenderer}> (null);
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
    const head=new THREE.Mesh(new THREE.BufferGeometry(),new THREE.MeshStandardMaterial());scene.add(head);
    sceneState.current={head,renderer};
    scene.add(new THREE.HemisphereLight('#dceaf4','#333432',2));
    const key=new THREE.DirectionalLight('#fff0df',3.2);key.position.set(-.4,.5,.6);scene.add(key);
    const rim=new THREE.DirectionalLight('#8bbec7',2);rim.position.set(.4,.1,-.4);scene.add(rim);
    const grid=new THREE.GridHelper(1,20,'#344649','#1c2a2c');grid.position.y=-.15;scene.add(grid);
    const resize=new ResizeObserver(()=>{if(!host.current)return;const w=host.current.clientWidth,h=host.current.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();});resize.observe(host.current);
    let id=0,last=performance.now(),count=0,sum=0;
    function tick(now:number) {sum+=now-last;last=now;count++;if(count===60){frameCallback.current(sum/count);count=0;sum=0;}controls.update();renderer.render(scene,camera);id=requestAnimationFrame(tick);}id=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(id);resize.disconnect();controls.dispose();head.geometry.dispose();head.material.dispose();grid.geometry.dispose();(grid.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();sceneState.current=null;};
  },[]);
  useEffect(()=>{const state=sceneState.current;if(!state)return;state.head.geometry.dispose();state.head.geometry=toGeometry(p.mesh);},[p.mesh]);
  useEffect(()=>{const s=sceneState.current;if(!s)return;s.head.material.wireframe=p.wireframe;s.head.material.color.set(p.color);s.head.material.roughness=p.roughness;s.renderer.toneMappingExposure=p.exposure;},[p.wireframe,p.color,p.roughness,p.exposure]);
  return <div className="viewport" ref={host}>{error&&<p role="alert">{error}</p>}</div>;
}
