# Vedoy Unity → Web 3D Bridge (experimental beta)

Two **honest** compilation tracks for importing Unity projects to the web:

| Track | Engine | C# scripts | Scene/prefab connections | Fidelity |
| --- | --- | --- | --- | --- |
| **Unity Web compiler** | Unity IL2CPP → WebAssembly/WebGL | Runs through the Unity engine if supported by Unity's Web target | Retained by Unity's build pipeline | Best available |
| **Vedoy native import** | Three.js | Not executed | `fileID`/`guid` bindings and source paths retained; limited `.vedoy` adapters run | Partial / preview only |

**This tool does NOT automatically convert arbitrary Unity C# scripts, custom shaders, prefabs, physics, render pipelines, ECS/Burst or Unity APIs into Three.js.** That requires per-API adapters and a larger compiler project. Import diagnostics identify unsupported pieces; never claim successful conversion without runtime tests.

## 1. Import the entire source project without executing it

Requires Python 3.10+ and PyYAML.

```bash
python -m pip install -r requirements.txt
python -m vedoy_bridge.cli import /path/to/MyUnityProject -o /tmp/vedoy-game
```

- Reads `Assets/**/*.unity`, `.prefab`, `.cs.meta`, `.vedoy`, `.glb` and `.meta` files.
- Builds scene hierarchy from Unity `Transform.m_Father` and `GameObject` `fileID`. If a `VedoyBuild/scene.vedoy.json` Editor export exists, it prefers Unity’s fully expanded scene hierarchy (including nested prefabs).
- Retains MonoBehaviour script GUIDs, fields, source references, prefab references and warnings.
- Refuses oversized YAML; does not execute C#, shell code, or dependencies.
- Copied GLB assets are optional; convert models/animations/materials in Unity with [Khronos UnityGLTF](https://github.com/KhronosGroup/UnityGLTF) if needed.
- For best geometry fidelity, use GLB export through Unity Editor; this importer doesn't parse proprietary FBX/mesh data, nor expand nested PrefabInstance overrides.

Serve the viewer locally (requires internet to load Three.js ES modules on first view):

```bash
python -m http.server 8080 --directory viewer
```

Open `http://localhost:8080` and select the generated `scene.vedoy.json`, plus an optional exported `.glb`. Or click **Open sample Unity scene** to try the included example without your own files. This prototype uses local file inputs; it never uploads source projects to Vedoy servers. With GLB loaded, visually matching node names can bind simple VedoyScript behaviors; duplicated names are reported and left unbound.

## 2. Compile the FULL Unity project for the web (preserves C# when compatible)

```bash
python -m vedoy_bridge.cli install-web-builder /path/to/MyUnityProject
# In Unity Editor: Vedoy → Export scene bindings for Web 3D
# This writes VedoyBuild/scene.vedoy.json; re-run importer above.
"/path/to/Unity" -batchmode -quit -nographics \
  -projectPath "/path/to/MyUnityProject" -buildTarget WebGL \
  -executeMethod VedoyBridge.VedoyWebBuild.BuildWeb -logFile -
```

Install Unity 6 + **Web Build Support**, configure enabled scenes and valid packages, obtain any required Unity license. Use **Vedoy → Export scene bindings for Web 3D** inside Unity to produce expanded hierarchy data (the output includes instantiated prefabs). The compiler helper has not yet been tested inside Unity in this environment. The generated `VedoyBuild/Web/` is served as a static Unity Web player with suitable caching/compression headers. It can be embedded inside a Vedoy Studio Next.js route using a loader or an isolated iframe. Unity's platform rules and Web limitations still apply. Do not run arbitrary user-uploaded Unity projects on the main Vercel server — Editor scripts run during import and can execute code. Isolate builds with least privilege, network restrictions, CPU/memory/time limits and per-job storage.

## 3. Create safe custom VedoyScript behaviors

Save a file under `Assets/Scripts/Spin.vedoy`:

```text
Script "Spin".
  OnStart.
    SetColor "#38bdf8".
  OnUpdate.
    Rotate Y by 60.
```

Attach a `Spin.cs` MonoBehaviour to a Unity object. On native import, the importer resolves the `.cs.meta` GUID and finds the matching `.vedoy` adapter by **exact class/source filename**. The declaration is compiled to an **allowlisted data program**, not arbitrary code. The Web viewer interprets supported `Rotate`, `Move`, and `SetColor` operations. Other behaviors stay marked `unity-only` and should use the Unity Web track.

This is a prototype of the VedoyScript compiler, not full C#/TypeScript compilation. No arbitrary C# is executed inside the browser. To support more Unity behaviors add explicit reviewed adapters and compatibility tests.

## Security and reliability

- Source analysis only, using `yaml.safe_load` (not unsafe YAML eval).
- Browser runtime executes ONLY static, checked VedoyScript operations, never C# code or user-provided JS strings.
- Manifest includes stable source `fileID` and asset `GUID` links, not runtime execution permission.
- Raw original Unity asset files remain untouched. Copied `.glb` binaries are size-limited to 100 MiB each.
- This preview is intended for local trusted use, not server-side upload of strangers' archives. Harden and sandbox before offering SaaS uploads.

## Tests

```bash
python -m unittest discover -s tests -v
```

## Next milestones

1. Verify Unity Editor prefab-expanded hierarchy export against real projects, and add stable IDs to glTF extras for meshes.
2. glTF object GUID extras or stable paths, to map duplicate names robustly.
3. Unity input system/physics/animation adapters with compatibility tests.
4. Optional C# → VedoyScript transpiler for a clearly specified supported subset only.
5. Isolated Unity Web build workers + deployment pipeline and security review.
