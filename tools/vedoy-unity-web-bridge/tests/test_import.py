from pathlib import Path
import unittest
import tempfile
from vedoy_bridge.importer import import_project, ImportErrorWithContext
from vedoy_bridge.vedoyscript import compile_script, CompileError

BASE = Path(__file__).parents[1] / 'examples' / 'SampleUnityProject'

class TestUnityImport(unittest.TestCase):
    def test_preserve_script_binding(self):
        with tempfile.TemporaryDirectory() as tmp:
            data = import_project(BASE, tmp)
            self.assertEqual(len(data['scenes']), 1)
            nodes = data['scenes'][0]['nodes']
            cube = next(x for x in nodes if x['name']=='Spinner')
            self.assertEqual(cube['position'], [0., 1., 0.])
            self.assertEqual(cube['parentId'], None)
            script = next(x for x in cube['components'] if x['kind']=='MonoBehaviour')
            self.assertEqual(script['scriptName'], 'Spin')
            self.assertEqual(script['script']['assetPath'], 'Assets/Scripts/Spin.cs')
            self.assertEqual(script['serializedFields']['speed'], 3)
            self.assertEqual(script['runtime'], 'vedoyscript')
            self.assertEqual(script['program']['onUpdate'][0]['op'], 'rotate')
            self.assertEqual(data['capabilities']['arbitraryCSharpExecution'], False)
            self.assertEqual(data['assetGuids']['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'], 'Assets/Scripts/Spin.cs')
            self.assertTrue((Path(tmp)/'scene.vedoy.json').exists())

    def test_unknown_script_does_not_execute(self):
        with tempfile.TemporaryDirectory() as tmp:
            data=import_project(BASE,tmp)
            cube=next(x for x in data['scenes'][0]['nodes'] if x['name']=='NotConverted')
            script=next(x for x in cube['components'] if x['kind']=='MonoBehaviour')
            self.assertEqual(script['runtime'], 'unity-only')
            self.assertTrue(any('cannot run natively' in d['message'] for d in data['diagnostics']))

    def test_blocks_project_output_to_inside_source(self):
        with self.assertRaises(ImportErrorWithContext):
            import_project(BASE,BASE/'Output')

    def test_vedoyscript_error_has_line(self):
        with self.assertRaisesRegex(CompileError, 'Spin.vedoy:3:'):
            compile_script('Script "Spin".\n  OnUpdate.\n    Delete Everything.', 'Spin.vedoy')

    def test_compile_guardrails(self):
        valid='Script "Spin".\n  OnStart.\n    SetColor "#112233".\n  OnUpdate.\n    Rotate Y by 60.\n'
        self.assertEqual(compile_script(valid)['onUpdate'][0]['rate'],60.)
        with self.assertRaises(CompileError):
            compile_script('Script "S".\n  OnStart.\n    Rotate Y by 12.')
        with self.assertRaises(CompileError):
            compile_script('Script "S".\n  OnUpdate.\n\tRotate Y by 12.')

    def test_prefab_reference_not_falsely_claimed(self):
        with tempfile.TemporaryDirectory() as tmp:
            data=import_project(BASE,tmp)
            pf=data['scenes'][0]['prefabInstances']
            self.assertEqual(len(pf),1)
            self.assertEqual(pf[0]['source']['assetPath'],'Assets/Prefabs/Light.prefab')
            self.assertFalse(pf[0]['expanded'])

if __name__=='__main__':
    unittest.main()

class TestEditorExpandedManifest(unittest.TestCase):
    def test_editor_export_overrides_raw_prefab_placeholder(self):
        import json
        import shutil
        with tempfile.TemporaryDirectory() as tmp:
            project=Path(tmp)/'project'
            shutil.copytree(BASE,project)
            output=Path(tmp)/'output'
            exp=project/'VedoyBuild'
            exp.mkdir()
            (exp/'scene.vedoy.json').write_text(json.dumps({
                'schema':'vedoy.unity.scene.v1',
                'scenes':[{'path':'Assets/Scenes/Demo.unity','prefabInstances':[], 'nodes':[
                    {'id':'GlobalObjectId_V1-PrefabNested', 'unityFileId':'100', 'scene':'Assets/Scenes/Demo.unity',
                     'name':'NestedPrefabChild', 'parentId':None,
                     'position':[0,0,0],'rotation':[0,0,0,1],'scale':[1,1,1], 'active':True,
                     'components':[{'kind':'MonoBehaviour','scriptName':'Spin','enabled':True,
                         'script':{'guid':'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','assetPath':'Assets/Scripts/Spin.cs'}}]}
                ]}]
            }),encoding='utf-8')
            result=import_project(project,output)
            self.assertEqual(result['scenes'][0]['nodes'][0]['name'],'NestedPrefabChild')
            self.assertEqual(result['scenes'][0]['nodes'][0]['components'][0]['runtime'],'vedoyscript')
            self.assertTrue(any('prefab-expanded' in d['message'] for d in result['diagnostics']))
