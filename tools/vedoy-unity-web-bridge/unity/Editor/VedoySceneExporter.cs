// Optional Unity Editor-side export that expands prefab instance hierarchies
// and captures component script connections through Unity's own asset database.
// Copy into Assets/Editor with VedoyWebBuild.cs.
#if UNITY_EDITOR
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;

namespace VedoyBridge
{
    public static class VedoySceneExporter
    {
        [Serializable] private class Manifest
        {
            public string schema = "vedoy.unity.scene.v1";
            public string generator = "vedoy-unity-editor/0.1.0";
            public List<SceneData> scenes = new List<SceneData>();
            public List<string> diagnostics = new List<string>();
        }
        [Serializable] private class SceneData
        {
            public string path;
            public List<Node> nodes = new List<Node>();
            public List<object> prefabInstances = new List<object>();
        }
        [Serializable] private class Node
        {
            public string id;
            public string unityFileId;
            public string scene;
            public string name;
            public bool active;
            public string parentId;
            public float[] position;
            public float[] rotation;
            public float[] scale;
            public string prefabSourcePath;
            public List<BridgeComponent> components = new List<BridgeComponent>();
        }
        [Serializable] private class ScriptReference
        {
            public string guid;
            public string assetPath;
        }
        [Serializable] private class BridgeComponent
        {
            public string kind;
            public bool enabled = true;
            public string scriptName;
            public string runtime;
            public ScriptReference script;
            public string serializedFieldsJson;
            public string meshAssetPath;
        }

        [MenuItem("Vedoy/Export scene bindings for Web 3D")]
        public static void ExportScenes()
        {
            var enabledScenes = EditorBuildSettings.scenes.Where(s => s.enabled).Select(s => s.path).ToList();
            if (enabledScenes.Count == 0)
                throw new InvalidOperationException("Enable at least one scene in Build Settings before export");
            var originalScene = UnityEngine.SceneManagement.SceneManager.GetActiveScene().path;
            var manifest = new Manifest();
            try
            {
                foreach (var scenePath in enabledScenes)
                {
                    var scene = EditorSceneManager.OpenScene(scenePath, OpenSceneMode.Single);
                    var result = new SceneData { path = scenePath };
                    foreach (var root in scene.GetRootGameObjects())
                        ExportObject(root.transform, result);
                    manifest.scenes.Add(result);
                }
            }
            finally
            {
                // Returning the user to their previously active scene avoids leaving
                // Unity visibly on the last scanned scene.
                if (!string.IsNullOrEmpty(originalScene))
                    EditorSceneManager.OpenScene(originalScene, OpenSceneMode.Single);
            }
            var directory = Path.Combine(Directory.GetCurrentDirectory(), "VedoyBuild");
            Directory.CreateDirectory(directory);
            var path = Path.Combine(directory, "scene.vedoy.json");
            File.WriteAllText(path, JsonUtility.ToJson(manifest, true));
            Debug.Log("Vedoy scene bindings exported (prefab instances expanded): " + path);
        }

        private static string StableId(UnityEngine.Object obj)
        {
            return GlobalObjectId.GetGlobalObjectIdSlow(obj).ToString();
        }
        private static void ExportObject(Transform transform, SceneData data)
        {
            var go = transform.gameObject;
            var id = StableId(go);
            var node = new Node
            {
                id = id,
                unityFileId = id,
                scene = data.path,
                name = go.name,
                active = go.activeSelf,
                parentId = transform.parent ? StableId(transform.parent.gameObject) : null,
                position = new[] { transform.localPosition.x, transform.localPosition.y, transform.localPosition.z },
                rotation = new[] { transform.localRotation.x, transform.localRotation.y, transform.localRotation.z, transform.localRotation.w },
                scale = new[] { transform.localScale.x, transform.localScale.y, transform.localScale.z },
                prefabSourcePath = PrefabUtility.IsPartOfPrefabInstance(go)
                    ? PrefabUtility.GetPrefabAssetPathOfNearestInstanceRoot(go) : null
            };
            foreach (var component in go.GetComponents<Component>())
            {
                if (component == null) // Unity Missing Script
                {
                    node.components.Add(new BridgeComponent { kind = "MissingScript", runtime = "unavailable" });
                    continue;
                }
                var entry = new BridgeComponent { kind = component.GetType().Name };
                if (component is Behaviour behaviour)
                    entry.enabled = behaviour.enabled;
                if (component is MonoBehaviour mb)
                {
                    var source = MonoScript.FromMonoBehaviour(mb);
                    var path = source ? AssetDatabase.GetAssetPath(source) : null;
                    entry.kind = "MonoBehaviour";
                    entry.scriptName = mb.GetType().Name;
                    entry.runtime = "unity-only";
                    entry.script = new ScriptReference
                    {
                        guid = path == null ? "" : AssetDatabase.AssetPathToGUID(path),
                        assetPath = path
                    };
                    // Preserve serialized fields without executing component methods.
                    entry.serializedFieldsJson = EditorJsonUtility.ToJson(mb, false);
                }
                else if (component is MeshFilter meshFilter && meshFilter.sharedMesh)
                {
                    entry.meshAssetPath = AssetDatabase.GetAssetPath(meshFilter.sharedMesh);
                }
                node.components.Add(entry);
            }
            data.nodes.Add(node);
            for (int i = 0; i < transform.childCount; i++)
                ExportObject(transform.GetChild(i), data);
        }
    }
}
#endif
