"""Run in a separate Blender process; never touches an open Blender document."""
import bpy, json
from pathlib import Path
report = {'version': bpy.app.version_string, 'background': bpy.app.background,
          'python_api': True, 'gltf_export': hasattr(bpy.ops.export_scene, 'gltf'),
          'connection_mode': 'local Blender command-line Python',
          'live_ui_bridge': False}
root = Path(__file__).resolve().parent.parent
(root / 'art' / 'blender').mkdir(parents=True, exist_ok=True)
(root / 'art' / 'blender' / 'connection.json').write_text(json.dumps(report, indent=2)+'\n')
print('HORIZON_BLENDER ' + json.dumps(report))
