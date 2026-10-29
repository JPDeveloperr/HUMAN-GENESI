import React,{useMemo,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {labels,type FaceParameters} from './geometry/head';
import {validateMesh} from './geometry/validate';
import {useEditor} from './store';
import {Viewport,type CameraView} from './Viewport';
import {generateFace} from './geometry/face';
import {exportFaceGLB} from './exportFace';
import {download} from './export';
import './style.css';
function App() {
  const state=useEditor(),[frame,setFrame]=useState(0),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[view,setView]=useState<CameraView>('three-quarter');
  const result=useMemo(()=>{const start=performance.now(),face=generateFace(state.parameters),mesh=face.skin;const generation=performance.now()-start;return {mesh,face,generation,report:validateMesh(mesh)};},[state.parameters]);
  const r=result.report;
  async function save() {setBusy(true);try {if(!r.valid)throw new Error('A malha possui erros');const data=await exportFaceGLB(result.face,state.color,state.roughness);download(data,'human-genesis-head.glb','model/gltf-binary');setStatus(`GLB exportado · ${(data.byteLength/1024).toFixed(0)} KB`);}catch(e){setStatus(`Falha: ${String(e)}`);}finally{setBusy(false);}}
  return <main>
    <header><a className="brand" href="#">H<span>G</span></a><div><h1>HUMAN GENESIS</h1><small>LABORATÓRIO DE ANATOMIA PROCEDURAL</small></div><div className="version">EXPERIMENTAL / 0.2</div><button className="export" onClick={save} disabled={busy}>{busy?'Exportando…':'Exportar GLB ↗'}</button></header>
    <div className="workspace"><aside><div className="section-heading"><span>01 / ANATOMIA</span><button onClick={state.reset}>Restaurar</button></div><h2>Forma & proporção</h2><p className="intro">Uma superfície contínua, construída por matemática.</p>
      {(Object.keys(labels) as (keyof FaceParameters)[]).map(key=><label className="control" key={key}><span>{labels[key]}<output>{state.parameters[key].toFixed(2)}</output></span><input aria-label={labels[key]} type="range" min="0.7" max="1.3" step="0.01" value={state.parameters[key]} onChange={e=>state.setParameter(key,Number(e.target.value))}/></label>)}
      <div className="note">ESTUDO 002<br/>Cabeça paramétrica · sem modelos externos<br/>Loops orbitais e labiais · orelhas simplificadas.</div></aside>
      <section className="stage"><div className="stage-top"><div><span className="dot"/> VISTA {view==='frontal'?'FRONTAL':view==='lateral'?'LATERAL':'TRÊS QUARTOS'} <small>+Y UP · METROS</small></div><button aria-pressed={state.wireframe} onClick={()=>state.setView({wireframe:!state.wireframe})}>{state.wireframe?'● Wireframe':'◇ Sólido'} / alternar</button></div>
        <Viewport face={result.face} view={view} {...state} onFrame={setFrame}/><div className="camera-views">{([['frontal','Frontal'],['lateral','Lateral'],['three-quarter','Três quartos']] as const).map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}</div><div className="stage-bottom"><span>Arraste para orbitar · Roda para zoom · Botão direito para pan</span><span>CABEÇA / PREVIEW</span></div>
      </section>
      <aside className="inspector"><span className="section-heading">02 / SUPERFÍCIE</span><h2>Estúdio</h2><label className="color">Tom da superfície<input aria-label="Tom da superfície" type="color" value={state.color} onChange={e=>state.setView({color:e.target.value})}/></label>
        <label className="control">Rugosidade <input aria-label="Rugosidade" type="range" min=".1" max="1" step=".01" value={state.roughness} onChange={e=>state.setView({roughness:+e.target.value})}/></label>
        <label className="control">Exposição <input aria-label="Exposição" type="range" min=".3" max="2.5" step=".1" value={state.exposure} onChange={e=>state.setView({exposure:+e.target.value})}/></label>
        <div className="separator"/><span className="section-heading">03 / DIAGNÓSTICO</span><h2>Geometria real</h2><dl><dt>Vértices</dt><dd data-testid="vertices">{r.vertices.toLocaleString('pt-BR')}</dd><dt>Triângulos</dt><dd>{r.triangles.toLocaleString('pt-BR')}</dd><dt>Geração</dt><dd>{result.generation.toFixed(1)} ms</dd><dt>Intervalo de quadro</dt><dd>{frame>0?`${frame.toFixed(1)} ms`:'Medindo…'}</dd><dt>Buffers CPU</dt><dd>{(r.bytes/1024).toFixed(0)} KB</dd><dt>Componentes</dt><dd>{r.components}</dd><dt>Arestas abertas</dt><dd>{r.boundary}</dd></dl>
        <div className={r.valid?'valid':'invalid'} data-testid="validation">{r.valid?'✓ Verificações estruturais OK':r.errors.join('; ')}</div><p className="limitations">Loops faciais experimentais. Rig, piscada completa e detalhamento auricular pendentes. Autointerseções verificadas apenas nas amostras de teste.</p>
        <button className="secondary" onClick={()=>download(JSON.stringify(state.parameters,null,2),'human-genesis-parameters.json','application/json')}>Salvar parâmetros ↓</button><p role="status">{status}</p>
      </aside></div><footer><span>100% PROCEDURAL</span><span>V0.2 · RECONSTRUÇÃO FACIAL EXPERIMENTAL</span></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
