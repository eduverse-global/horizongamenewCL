import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const binary=process.env.HORIZON_BLENDER_PATH||'/Applications/Blender.app/Contents/MacOS/Blender';
if(!existsSync(binary)){console.error('Blender not found. Set HORIZON_BLENDER_PATH to the Blender executable.');process.exit(1);}
const script=process.argv[2]||fileURLToPath(new URL('./blender-check.py',import.meta.url));
const result=spawnSync(binary,['--background','--factory-startup','--python',script],{stdio:'inherit'});process.exit(result.status??1);
