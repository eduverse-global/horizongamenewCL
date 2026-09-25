import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// One reusable linear-HDR pipeline, with actual scene-depth focus and one output conversion.
export function createRuntime(canvas,onContext){
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.13;
 const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(40,1,.1,100);
 const target=new THREE.WebGLRenderTarget(1,1,{type:THREE.HalfFloatType,depthTexture:new THREE.DepthTexture(1,1)});
 const lens=new ShaderPass({uniforms:{tScene:{value:null},tDepth:{value:null},near:{value:.1},far:{value:100},focus:{value:26},aspect:{value:1},blur:{value:.003}},
 vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:`uniform sampler2D tScene,tDepth; uniform float near,far,focus,aspect,blur; varying vec2 vUv;
 float distanceAt(vec2 uv){float d=texture2D(tDepth,uv).x;return (near*far)/(far-d*(far-near));}
 void main(){float d=distanceAt(vUv);float coc=clamp((abs(d-focus)-3.)/12.,0.,1.)*blur;
 vec3 color=texture2D(tScene,vUv).rgb;float weight=1.;
 for(int i=0;i<12;i++){float a=float(i)*2.399963;vec2 offset=vec2(cos(a)/aspect,sin(a))*coc*sqrt((float(i)+1.)/12.);vec2 uv=vUv+offset;
 float w=abs(distanceAt(uv)-d)<3.?1.:.15;color+=texture2D(tScene,uv).rgb*w;weight+=w;}
 color/=weight;float vig=smoothstep(.88,.2,distance(vUv,vec2(.5)));color*=mix(.84,1.,vig);gl_FragColor=vec4(color,1.);}`});
 lens.uniforms.tScene.value=target.texture;lens.uniforms.tDepth.value=target.depthTexture;
 const composer=new EffectComposer(renderer);composer.addPass(lens);
 const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.22,.48,1.2);composer.addPass(bloom);composer.addPass(new OutputPass());
 let enhanced=true,lost=false;const focusPoint=new THREE.Vector3();const view=new THREE.Vector3();
 function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setPixelRatio(Math.min(devicePixelRatio,enhanced?1.5:1));renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=w/h<1?54:40;camera.updateProjectionMatrix();const size=renderer.getDrawingBufferSize(new THREE.Vector2());target.setSize(size.x,size.y);composer.setPixelRatio(renderer.getPixelRatio());composer.setSize(w,h);lens.uniforms.aspect.value=w/h;}
 function loss(e){e.preventDefault();lost=true;onContext(false);}
 function recovery(){onContext(true);}
 canvas.addEventListener('webglcontextlost',loss);canvas.addEventListener('webglcontextrestored',recovery);addEventListener('resize',resize);resize();
 return{renderer,scene,camera,get enhanced(){return enhanced;},setQuality(value){enhanced=value;resize();},render(p){if(lost)return;focusPoint.set(p.x,p.y??0,p.z);view.copy(focusPoint).applyMatrix4(camera.matrixWorldInverse);lens.uniforms.focus.value=-view.z;
 if(enhanced){renderer.setRenderTarget(target);renderer.render(scene,camera);renderer.setRenderTarget(null);composer.render();}else renderer.render(scene,camera);},
 dispose(){removeEventListener('resize',resize);canvas.removeEventListener('webglcontextlost',loss);canvas.removeEventListener('webglcontextrestored',recovery);lens.dispose();bloom.dispose();composer.dispose();target.dispose();renderer.dispose();}};
}
