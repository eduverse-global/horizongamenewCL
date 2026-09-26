import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const script=process.argv[2]||fileURLToPath(new URL('./blender-check.py',import.meta.url));
// Prefer the Blender app; otherwise a Python with the `bpy` module (pip install bpy), e.g. on Linux/cloud machines.
const binary=process.env.HORIZON_BLENDER_PATH||'/Applications/Blender.app/Contents/MacOS/Blender',python=process.env.HORIZON_BLENDER_PYTHON;
let result;
if(existsSync(binary))result=spawnSync(binary,['--background','--factory-startup','--python',script],{stdio:'inherit'});
else if(python&&existsSync(python))result=spawnSync(python,[script],{stdio:'inherit'});
else{console.error('Blender not found. Set HORIZON_BLENDER_PATH to the Blender executable, or HORIZON_BLENDER_PYTHON to a Python with the bpy module.');process.exit(1);}
process.exit(result.status??1);
