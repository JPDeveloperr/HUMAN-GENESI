import {test,expect} from '@playwright/test';
test('edit, export, reimport and capture the real viewport',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');await expect(page.getByTestId('validation')).toContainText('OK');
  await expect(page.locator('canvas')).toBeVisible();await expect(page.getByRole('alert')).toHaveCount(0);
  await page.waitForTimeout(1200);
  await page.screenshot({path:'docs/head-solid.png',fullPage:true});
  const slider=page.getByRole('slider',{name:'Projeção do nariz'});await slider.fill('1.22');await slider.dispatchEvent('input');await slider.dispatchEvent('change');
  await expect(page.locator('output').nth(6)).toHaveText('1.22');
  await page.getByRole('button',{name:'Sólido'}).click();await expect(page.getByRole('button',{name:'Wireframe'})).toHaveAttribute('aria-pressed','true');
  await page.waitForTimeout(300);await page.screenshot({path:'docs/head-wireframe.png',fullPage:true});
  const exported=await page.evaluate(async()=>{
    // Execute exporter and loader in the browser: FileReader and Blob are real browser APIs.
    const {generateHead,defaults}=await import(/* @vite-ignore */ String('/src/geometry/head.ts'));
    const {exportGLB}=await import(/* @vite-ignore */ String('/src/export.ts'));
    const {GLTFLoader}=await import(/* @vite-ignore */ String('/node_modules/three/examples/jsm/loaders/GLTFLoader.js'));
    const mesh=generateHead({...defaults,noseLength:1.22}),buffer=await exportGLB(mesh);
    const loaded=await new GLTFLoader().parseAsync(buffer,'');
    const object=loaded.scene.getObjectByName('ProceduralHead');
    if(!object || !('geometry' in object))throw new Error('Missing geometry');
    const geometry=(object as import('three').Mesh).geometry;
    const positions=geometry.getAttribute('position'),normals=geometry.getAttribute('normal'),uvs=geometry.getAttribute('uv');
    let delta=0;for(let i=0;i<mesh.positions.length;i++)delta=Math.max(delta,Math.abs(positions.array[i]-mesh.positions[i]));
    return {bytes:buffer.byteLength,vertices:positions.count,indices:geometry.index?.count,normals:normals.count,uvs:uvs.count,delta,regions:object.userData.regions.length};
  });
  expect(exported.vertices).toBe(6818);expect(exported.indices).toBe(40896);expect(exported.normals).toBe(6818);expect(exported.uvs).toBe(6818);expect(exported.regions).toBe(6818);expect(exported.delta).toBeLessThan(1e-7);expect(exported.bytes).toBeGreaterThan(100000);
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Exportar GLB'}).click()]);
  await download.saveAs('docs/head.glb');
  expect(download.suggestedFilename()).toBe('human-genesis-head.glb');expect(await download.failure()).toBeNull();
  await page.getByRole('button',{name:'Restaurar'}).click();await expect(page.locator('output').nth(6)).toHaveText('1.00');
  expect(errors).toEqual([]);
});
