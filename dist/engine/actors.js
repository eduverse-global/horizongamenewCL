import * as THREE from 'three';
const FRAMES=[[[106,17,276,339],[448,17,622,344],[796,17,967,344]],[[100,366,267,691],[454,369,618,690],[808,367,987,691]],[[118,721,286,1045],[465,721,636,1045],[801,721,986,1045]],[[104,1070,277,1399],[448,1070,627,1416],[805,1070,978,1415]]];
export async function createActors(scene){
 const loader=new THREE.TextureLoader();const [captain,cast]=await Promise.all([loader.loadAsync('/assets/captain-directions.png'),loader.loadAsync('/assets/story-sprites.png')]);
 for(const t of[captain,cast]){t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestFilter;}
 function actor(map){const texture=map.clone();texture.needsUpdate=true;
 // Lit, cutout planes participate in scene depth and shadows. Bottom-anchored geometry.
 const geometry=new THREE.PlaneGeometry(1,1);geometry.translate(0,.5,0);
 const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.3,side:THREE.DoubleSide,roughness:1,metalness:0});
 const mesh=new THREE.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=false;scene.add(mesh);
 const shadow=new THREE.Mesh(new THREE.CircleGeometry(.32,24),new THREE.MeshBasicMaterial({color:'#17221c',transparent:true,opacity:.20,depthWrite:false}));shadow.rotation.x=-Math.PI/2;scene.add(shadow);return{mesh,shadow,texture};}
 const player=actor(captain),mara=actor(cast);
 mara.texture.repeat.set(300/1983,394/793);mara.texture.offset.set(1515/1983,399/793);mara.mesh.scale.set(1.12,1.58,1);mara.mesh.position.set(-3.5,.025,2.1);mara.shadow.position.set(-3.5,.022,2.1);
 function update(s,moving,time,camera){const row={down:0,left:1,right:2,up:3}[s.facing],frame=moving?1+Math.floor(time*8)%2:0;const[x,y,r,b]=FRAMES[row][frame],w=r-x+6,h=b-y+6;
 player.texture.repeat.set(w/1086,h/1448);player.texture.offset.set((x-3)/1086,1-(b+3)/1448);player.mesh.scale.set(w*.0048,h*.0048,1);
 const height=s.z< -3.0?.34:s.z< -2.5?.2:.025;player.mesh.position.set(s.x,height,s.z);player.shadow.position.set(s.x,height+.005,s.z);
 // Y-only billboarding preserves grounded feet and a consistent vertical scale.
 const yaw=Math.atan2(camera.position.x-s.x,camera.position.z-s.z);player.mesh.rotation.y=yaw;mara.mesh.rotation.y=yaw;
 }
 return{player,mara,update};
}
