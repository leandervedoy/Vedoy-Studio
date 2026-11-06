"""Command line for importing Unity text projects to Vedoy Web 3D preview."""
import argparse
from pathlib import Path
import sys
import shutil
from .importer import import_project, ImportErrorWithContext


def main():
    parser = argparse.ArgumentParser(prog='vedoy-unity', description='Unity -> Vedoy Web 3D Bridge (beta)')
    sub = parser.add_subparsers(dest='operation', required=True)
    importer = sub.add_parser('import', help='Inspect a Unity project and write a Web 3D manifest')
    importer.add_argument('project', type=Path)
    importer.add_argument('-o','--output', required=True, type=Path)
    install = sub.add_parser('install-web-builder', help='Install the Unity Editor Web build helper into your project')
    install.add_argument('project', type=Path)
    args = parser.parse_args()
    try:
        if args.operation == 'import':
            result = import_project(args.project,args.output)
            count = sum(len(s['nodes']) for s in result['scenes'])
            print(f'Imported {len(result["scenes"])} scenes, {count} objects, {len(result["scripts"])} VedoyScript adapters.')
            print(f'{len(result["diagnostics"])} diagnostic(s); see scene.vedoy.json')
            print(f'Output: {args.output.resolve() / "scene.vedoy.json"}')
        else:
            project = args.project.resolve()
            if not (project/'Assets').is_dir() or not (project/'ProjectSettings').is_dir():
                raise ImportErrorWithContext('Not a Unity project')
            for filename in ('VedoyWebBuild.cs','VedoySceneExporter.cs'):
                src = Path(__file__).resolve().parent.parent/'unity'/'Editor'/filename
                dst = project/'Assets'/'Editor'/filename
                dst.parent.mkdir(parents=True,exist_ok=True)
                if dst.exists():
                    raise ImportErrorWithContext(f'Existing {filename}; review manually before replacement')
                shutil.copyfile(src,dst)
                print(f'Installed Unity bridge helper: {dst}')
    except (ImportErrorWithContext, OSError) as exc:
        print(f'Error: {exc}',file=sys.stderr)
        raise SystemExit(1)

if __name__=='__main__':
    main()
