import {test,expect} from '@playwright/test';
test('V0.2 views, independent eyes, geometric cavities and GLB roundtrip',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByTestId('validation')).toContainText('OK');
  await expect(page.getByRole('alert')).toHaveCount(0);
  for(const [label,file] of [['Frontal','frontal'],['Lateral','lateral'],['Três quartos','three-quarter']]){
    await page.getByRole('button',{name:label,exact:true}).click();await page.waitForTimeout(600);
    await page.screenshot({path:`docs/v02/${file}.png`,fullPage:true});
  }
  const data=await page.evaluate(async()=>{
    const {generateFace}=await import(/* @vite-ignore */ String('/src/geometry/face.ts'));
    const {exportFaceGLB}=await import(/* @vite-ignore */ String('/src/exportFace.ts'));
    const {GLTFLoader}=await import(/* @vite-ignore */ String('/node_modules/three/examples/jsm/loaders/GLTFLoader.js'));
    const face=generateFace(),buffer=await exportFaceGLB(face,'#b99a86',.62),loaded=await new GLTFLoader().parseAsync(buffer,'');
    let meshes=0,maxDelta=0;const parts=[{name:'ProceduralHead',mesh:face.skin},...face.parts];
    for(const part of parts){const object=loaded.scene.getObjectByName(part.name) as import('three').Mesh;if(!object?.isMesh)throw new Error(`Missing ${part.name}`);meshes++;
      for(const [attr,expected] of [['position',part.mesh.positions],['normal',part.mesh.normals],['uv',part.mesh.uvs]] as const){const actual=object.geometry.getAttribute(attr).array;if(actual.length!==expected.length)throw new Error(`Bad ${attr} length`);for(let i=0;i<expected.length;i++)maxDelta=Math.max(maxDelta,Math.abs(actual[i]-expected[i]));}
      const indices=object.geometry.index?.array;if(!indices||indices.length!==part.mesh.indices.length||indices.some((x:number,i:number)=>x!==part.mesh.indices[i]))throw new Error('Index mismatch');
    }
    const group=loaded.scene.getObjectByName('HumanGenesisV02');const skin=loaded.scene.getObjectByName('ProceduralHead') as import('three').Mesh;
    return {meshes,maxDelta,loops:group?.userData.loops.length,version:group?.userData.version,colors:skin.geometry.getAttribute('color').count,vertices:face.skin.positions.length/3,roughness:(skin.material as import('three').MeshStandardMaterial).roughness};
  });
  expect(data.meshes).toBe(7);expect(data.maxDelta).toBeLessThan(1e-7);expect(data.loops).toBe(5);expect(data.version).toBe('0.2');expect(data.colors).toBe(data.vertices);expect(data.roughness).toBe(.62);
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Exportar GLB'}).click()]);await download.saveAs('docs/v02/head.glb');expect(await download.failure()).toBeNull();
  await page.getByRole('button',{name:'Sólido'}).click();await page.waitForTimeout(300);await page.screenshot({path:'docs/v02/wireframe.png',fullPage:true});
  expect(errors).toEqual([]);
});
