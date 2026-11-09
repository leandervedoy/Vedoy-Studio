"""Unity Text Serialization importer, safe static analysis (never runs C#).

Reads file IDs, GUIDs and source scripts; supports direct GameObject, Transform,
MonoBehaviour, lights, cameras, colliders and mesh references. Nested prefab
instances are recorded but need Unity Editor resolution for visual fidelity.
"""
from pathlib import Path
import json
import re
import shutil
import yaml
from .vedoyscript import compile_script, CompileError

DOC = re.compile(r'^---\s+!u!(\d+)\s+&(-?\d+)(?:\s+stripped)?\s*$', re.M)
GUID = re.compile(r'(?m)^guid:\s*([0-9a-fA-F]{32})\s*$')
MAX_FILES = 20000
MAX_TEXT_BYTES = 16 * 1024 * 1024
MAX_NODES = 50000

class ImportErrorWithContext(ValueError):
    pass


def read_text(path):
    if path.stat().st_size > MAX_TEXT_BYTES:
        raise ImportErrorWithContext(f'File exceeds 16 MiB safe import limit: {path}')
    return path.read_text(encoding='utf-8-sig')


def unity_docs(text, path):
    matches = list(DOC.finditer(text))
    docs = {}
    for i, match in enumerate(matches):
        block = text[match.end(): matches[i+1].start() if i+1 < len(matches) else len(text)]
        try:
            data = yaml.safe_load(block)
        except yaml.YAMLError as exc:
            raise ImportErrorWithContext(f'Invalid Unity YAML in {path} at document {i+1}: {exc}') from exc
        if not isinstance(data, dict):
            continue
        docs[match.group(2)] = {'classId': int(match.group(1)), 'data': data,
                                'kind': next(iter(data.keys())), 'fileId': match.group(2)}
    return docs


def file_id(ref):
    return str(ref.get('fileID', '0')) if isinstance(ref, dict) else '0'


def vector(ref, defaults):
    if not isinstance(ref, dict):
        return defaults
    return [float(ref.get(a, defaults[i])) for i, a in enumerate('xyz')]


def quat(ref):
    if not isinstance(ref, dict):
        return [0, 0, 0, 1]
    return [float(ref.get(a, 0 if a != 'w' else 1)) for a in 'xyzw']


def find_assets(root):
    index = {}
    count = 0
    for p in (root / 'Assets').rglob('*.meta'):
        if p.is_symlink() or not p.is_file():
            continue
        count += 1
        if count > MAX_FILES:
            raise ImportErrorWithContext(f'Too many .meta files (max {MAX_FILES})')
        content = read_text(p)
        if match := GUID.search(content):
            asset = p.with_suffix('')
            index[match.group(1).lower()] = asset.relative_to(root).as_posix()
    return index


def refs(value, index):
    """Keep original reference object + resolved asset path when possible."""
    if isinstance(value, dict):
        result = {str(k): refs(v, index) for k, v in value.items()}
        if 'guid' in result and isinstance(result['guid'], str):
            result['assetPath'] = index.get(result['guid'].lower())
        return result
    if isinstance(value, list):
        return [refs(x, index) for x in value]
    return value


def parse_scene(path, root, asset_index, script_programs, diagnostics):
    docs = unity_docs(read_text(path), path)
    objects = {}
    transforms = {}
    components = {}
    prefabs = []
    scene_path = path.relative_to(root).as_posix()
    for fid, doc in docs.items():
        d = doc['data'].get(doc['kind']) or {}
        kind = doc['kind']
        if kind == 'GameObject':
            objects[fid] = d
        elif kind in ('Transform', 'RectTransform'):
            transforms[fid] = d
        elif kind == 'PrefabInstance':
            ref = d.get('m_SourcePrefab', {})
            prefabs.append({'fileId': fid, 'source': refs(ref, asset_index),
                            'overridesPreserved': True, 'expanded': False})
        elif kind in ('MonoBehaviour','MeshFilter','MeshRenderer','SkinnedMeshRenderer','Camera',
                      'Light','Rigidbody','Rigidbody2D','BoxCollider','SphereCollider',
                      'CapsuleCollider','MeshCollider','Animator','AudioSource','Collider','Canvas'):
            components.setdefault(file_id(d.get('m_GameObject')), []).append((kind, fid, d))
    # Derive transform per GameObject rather than document ordering.
    trans_by_go = {file_id(d.get('m_GameObject')): (fid,d) for fid,d in transforms.items()}
    trans_owner = {fid: file_id(d.get('m_GameObject')) for fid,d in transforms.items()}
    nodes = []
    for fid, obj in objects.items():
        td_id, td = trans_by_go.get(fid, ('0', {}))
        parent_go = trans_owner.get(file_id(td.get('m_Father')), '0')
        node = {'id': f'{scene_path}#{fid}', 'unityFileId': fid, 'scene': scene_path,
                'name': str(obj.get('m_Name', 'GameObject')), 'active': bool(obj.get('m_IsActive', 1)),
                'parentId': f'{scene_path}#{parent_go}' if parent_go != '0' else None,
                'position': vector(td.get('m_LocalPosition'), [0,0,0]),
                'rotation': quat(td.get('m_LocalRotation')),
                'scale': vector(td.get('m_LocalScale'), [1,1,1]),
                'components': []}
        for kind, compid, comp in components.get(fid, []):
            c = {'kind': kind, 'unityFileId': compid, 'enabled': bool(comp.get('m_Enabled', 1))}
            if kind == 'MonoBehaviour':
                script_ref = refs(comp.get('m_Script', {}), asset_index)
                script_path = script_ref.get('assetPath') if isinstance(script_ref, dict) else None
                script_name = Path(script_path).stem if script_path else None
                c.update({'script': script_ref, 'scriptName': script_name,
                          'serializedFields': refs({k:v for k,v in comp.items() if not k.startswith('m_')}, asset_index),
                          'runtime': 'vedoyscript' if script_name in script_programs else 'unity-only'})
                if script_name in script_programs:
                    c['program'] = script_programs[script_name]
                else:
                    diagnostics.append({'severity': 'warning', 'scene': scene_path, 'object': node['name'],
                                        'message': f'C# MonoBehaviour {script_name or script_ref} retained but cannot run natively in Three.js; use Unity Web or author matching .vedoy adapter.'})
            elif kind == 'MeshFilter':
                c['mesh'] = refs(comp.get('m_Mesh', {}), asset_index)
            elif kind in ('MeshRenderer', 'SkinnedMeshRenderer'):
                c['materials'] = refs(comp.get('m_Materials', []), asset_index)
            elif kind in ('Camera','Light','Rigidbody','BoxCollider','SphereCollider','Animator'):
                c['properties'] = refs({k:v for k,v in comp.items() if not k.startswith('m_') or k in ('m_Type','m_Intensity','m_Color','m_Orthographic','m_FieldOfView','m_Radius')}, asset_index)
            node['components'].append(c)
        nodes.append(node)
    if len(nodes)>MAX_NODES:
        raise ImportErrorWithContext('Too many scene nodes')
    for prefab in prefabs:
        diagnostics.append({'severity':'warning','scene':scene_path,
                            'message':f'PrefabInstance {prefab["fileId"]} preserved as reference; native Three.js hierarchy needs Unity Editor export. Unity Web build remains supported.'})
    return {'path': scene_path, 'nodes': nodes, 'prefabInstances':prefabs}


def import_project(project, output):
    root = Path(project).resolve()
    out = Path(output).resolve()
    if not (root/'Assets').is_dir() or not (root/'ProjectSettings').is_dir():
        raise ImportErrorWithContext('Select a Unity project root containing Assets/ and ProjectSettings/')
    if out == root or root in out.parents:
        raise ImportErrorWithContext('Output must be outside the Unity project to avoid importing generated files')
    out.mkdir(parents=True, exist_ok=True)
    asset_index = find_assets(root)
    diagnostics = []
    programs = {}
    for script in (root/'Assets').rglob('*.vedoy'):
        if script.is_symlink():
            continue
        try:
            parsed = compile_script(read_text(script), script.relative_to(root).as_posix())
            if parsed['scriptName'] in programs:
                raise CompileError(f'Duplicate script name: {parsed["scriptName"]}')
            programs[parsed['scriptName']] = parsed
        except CompileError as exc:
            diagnostics.append({'severity':'error','file':script.relative_to(root).as_posix(),'message':str(exc)})
    scenes = []
    editor_export = root / 'VedoyBuild' / 'scene.vedoy.json'
    if editor_export.exists() and not editor_export.is_symlink():
        # Unity Editor resolves nested prefab instances and scripts before exporting.
        exported = json.loads(read_text(editor_export))
        if exported.get('schema') != 'vedoy.unity.scene.v1' or not isinstance(exported.get('scenes'),list):
            raise ImportErrorWithContext('Invalid Unity Editor export schema')
        scenes = exported['scenes']
        if sum(len(scene.get('nodes',[])) for scene in scenes) > MAX_NODES:
            raise ImportErrorWithContext('Unity Editor export has too many nodes')
        for scene in scenes:
            for node in scene.get('nodes',[]):
                for component in node.get('components',[]):
                    if component.get('kind') == 'MonoBehaviour':
                        name = component.get('scriptName')
                        component['runtime'] = 'vedoyscript' if name in programs else 'unity-only'
                        if name in programs:
                            component['program'] = programs[name]
                        else:
                            diagnostics.append({'severity':'warning','scene':scene.get('path'),
                                'object':node.get('name'),
                                'message':f'C# MonoBehaviour {name} preserved but cannot execute in Three.js.'})
        diagnostics.append({'severity':'info','message':'Loaded prefab-expanded hierarchy from trusted Unity Editor export.'})
    else:
        for scene_file in sorted((root/'Assets').rglob('*.unity')):
            if scene_file.is_symlink():
                continue
            scenes.append(parse_scene(scene_file, root, asset_index, programs, diagnostics))
    # Read prefabs for references, even when prefab instances aren't expanded natively.
    prefabs = []
    for prefab_file in sorted((root/'Assets').rglob('*.prefab')):
        if prefab_file.is_symlink():
            continue
        pf = parse_scene(prefab_file, root, asset_index, programs, diagnostics)
        prefabs.append(pf)
    for scene in scenes:
        for node in scene['nodes']:
            parent = node['parentId']
            if parent and not any(x['id'] == parent for x in scene['nodes']):
                diagnostics.append({'severity':'warning','scene':scene['path'],'object':node['name'],
                                    'message':'Parent transform not found in serialized scene; may be an imported prefab or stripped instance.'})
    assets = {}
    # Copy only GLB artifacts explicitly exported from Unity. No executing scripts.
    for file in (root/'Assets').rglob('*.glb'):
        if file.is_symlink() or file.stat().st_size > 100 * 1024 * 1024:
            continue
        relative = file.relative_to(root/'Assets')
        destination = out / 'assets' / relative
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(file, destination)
        assets[file.relative_to(root).as_posix()] = f'assets/{relative.as_posix()}'
    result = {'schema':'vedoy.unity.scene.v1','generator':'vedoy-unity-web-bridge/0.1.0',
              'project':root.name, 'scenes':scenes, 'prefabs':prefabs,
              'scripts':programs,'assetGuids':asset_index,'glbAssets':assets,
              'diagnostics':diagnostics,
              'capabilities':{'unityWebBuild':'requires Unity Editor and Web build support',
                              'nativeThreeJs':'partial, declarative .vedoy adapters only',
                              'arbitraryCSharpExecution':False,'nativePrefabExpansion':False}}
    (out/'scene.vedoy.json').write_text(json.dumps(result,indent=2,ensure_ascii=False), encoding='utf-8')
    return result
