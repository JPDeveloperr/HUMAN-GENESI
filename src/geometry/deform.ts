import {angleNormals,type FaceAssembly,type Vec3} from './face';
/** Limited deformation probe, not a rig or a complete blink. Absolute offsets from the rest mesh. */
export function probeDeformation(face:FaceAssembly,blink=0,mouthOpen=0) {
  if(!Number.isFinite(blink)||blink<0||blink>.5||!Number.isFinite(mouthOpen)||mouthOpen<0||mouthOpen>.004)throw new Error('Deformação fora do intervalo experimental');
  const mesh={...face.skin,positions:face.skin.positions.slice(),normals:face.skin.normals.slice()};
  for(const loop of face.loops){
    const isEye=loop.name.startsWith('eye'),isMouth=loop.name==='mouth';if(!isEye&&!isMouth)continue;
    const eye=face.eyes.find(e=>Math.sign(e.center[0])===Math.sign(loop.center[0]));
    const deltas:Vec3[]=loop.rim.map(()=>[0,0,0]);
    loop.support.forEach((ring,ringIndex)=>ring.forEach((id,i)=>{
      const j=id*3,x=mesh.positions[j],y=mesh.positions[j+1],z=mesh.positions[j+2];
      let dy=0,nz=z;
      if(isEye){dy=-blink*Math.max(0,y-loop.center[1])*(ringIndex+1)/loop.support.length;
        const d2=(x-eye!.center[0])**2+(y+dy-eye!.center[1])**2;
        if(d2<eye!.radius**2)nz=Math.max(z,eye!.center[2]+Math.sqrt(eye!.radius**2-d2)+.0008);
      }else dy=-mouthOpen*Math.max(0,(loop.center[1]-y)/loop.radius[1])*(ringIndex+1)/loop.support.length;
      mesh.positions[j+1]=y+dy;mesh.positions[j+2]=nz;if(ringIndex===loop.support.length-1)deltas[i]=[0,dy,nz-z];
    }));
    for(const ring of loop.cavity)ring.forEach((id,i)=>{mesh.positions[id*3+1]+=deltas[i][1];mesh.positions[id*3+2]+=deltas[i][2];});
    mesh.positions[loop.cap*3+1]+=deltas.reduce((s,v)=>s+v[1],0)/deltas.length;
  }
  angleNormals(mesh);return mesh;
}
