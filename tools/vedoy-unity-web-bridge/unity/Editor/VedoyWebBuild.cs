// Vedoy Unity Web compiler adapter. Place in Assets/Editor/.
// Runs Unity's OWN IL2CPP/WebGL build pipeline; does not transpile C# into Three.js.
#if UNITY_EDITOR
using System;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace VedoyBridge
{
    public static class VedoyWebBuild
    {
        [MenuItem("Vedoy/Build for Web")]
        public static void BuildWeb()
        {
            // Running untrusted Unity projects executes editor scripts. Only run on a
            // trusted machine or a fully isolated build worker with resource limits.
            var scenes = EditorBuildSettings.scenes
                .Where(s => s.enabled)
                .Select(s => s.path)
                .ToArray();
            if (scenes.Length == 0)
                throw new InvalidOperationException("No enabled scenes in Build Settings");
            if (EditorUserBuildSettings.activeBuildTarget != BuildTarget.WebGL)
                throw new InvalidOperationException("Start Unity with -buildTarget WebGL");
            var path = Path.Combine(Directory.GetCurrentDirectory(), "VedoyBuild", "Web");
            Directory.CreateDirectory(Path.GetDirectoryName(path));
            var options = new BuildPlayerOptions
            {
                scenes = scenes,
                locationPathName = path,
                target = BuildTarget.WebGL,
                options = BuildOptions.None
            };
            var report = BuildPipeline.BuildPlayer(options);
            if (report.summary.result != BuildResult.Succeeded)
                throw new Exception("Unity Web build failed: " + report.summary.result);
            Debug.Log("Vedoy Unity Web build succeeded at: " + path);
        }
    }
}
#endif
