import {create} from 'zustand';
import {defaults,type FaceParameters} from './geometry/head';
interface Editor { parameters:FaceParameters; wireframe:boolean; color:string; roughness:number; exposure:number;
  setParameter:(key:keyof FaceParameters,value:number)=>void; reset:()=>void; setView:(patch:Partial<Pick<Editor,'wireframe'|'color'|'roughness'|'exposure'>>)=>void }
export const useEditor=create<Editor>(set=>({parameters:{...defaults},wireframe:false,color:'#b99a86',roughness:.62,exposure:1.3,
  setParameter:(key,value)=>set(s=>({parameters:{...s.parameters,[key]:value}})),reset:()=>set({parameters:{...defaults}}),setView:patch=>set(patch)}));
