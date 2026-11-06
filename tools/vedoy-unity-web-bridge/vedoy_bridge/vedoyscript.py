"""Small, deterministic, non-executing VedoyScript v0.1 behaviour compiler.

This is NOT a general TypeScript/C# compiler. It supports only a documented
safe declarative subset used by the Three.js preview.
"""
import re

HEADER = re.compile(r'^Script\s+"([A-Za-z_][\w]*)"\.$')
BLOCK = re.compile(r'^On(Start|Update)\.$')
ROTATE = re.compile(r'^Rotate\s+([XYZ])\s+by\s+(-?\d+(?:\.\d+)?)\.$')
MOVE = re.compile(r'^Move\s+([XYZ])\s+by\s+(-?\d+(?:\.\d+)?)\.$')
COLOR = re.compile(r'^SetColor\s+"(#[0-9a-fA-F]{6})"\.$')

class CompileError(ValueError):
    pass


def compile_script(source, filename='<memory>'):
    """Compile a supported .vedoy behaviour into data (never executable JS)."""
    name = None
    current = None
    program = {'onStart': [], 'onUpdate': []}
    for line_number, raw in enumerate(source.splitlines(), 1):
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        indent = len(raw) - len(raw.lstrip(' '))
        if '\t' in raw[:len(raw)-len(raw.lstrip())]:
            raise CompileError(f'{filename}:{line_number}: use spaces for indentation')
        if name is None:
            match = HEADER.fullmatch(line)
            if not match or indent != 0:
                raise CompileError(f'{filename}:{line_number}: expected Script "Name".')
            name = match.group(1)
            continue
        match = BLOCK.fullmatch(line)
        if match and indent == 2:
            current = 'on' + match.group(1)
            continue
        if current is None or indent != 4:
            raise CompileError(f'{filename}:{line_number}: expected an indented OnStart. or OnUpdate. command')
        if match := ROTATE.fullmatch(line):
            command = {'op': 'rotate', 'axis': match.group(1).lower(), 'rate': float(match.group(2))}
        elif match := MOVE.fullmatch(line):
            command = {'op': 'move', 'axis': match.group(1).lower(), 'rate': float(match.group(2))}
        elif match := COLOR.fullmatch(line):
            if current != 'onStart':
                raise CompileError(f'{filename}:{line_number}: SetColor only supported in OnStart.')
            command = {'op': 'color', 'value': match.group(1)}
        else:
            raise CompileError(f'{filename}:{line_number}: unsupported command or missing period: {line}')
        if current == 'onStart' and command['op'] in ('rotate', 'move'):
            raise CompileError(f'{filename}:{line_number}: movement commands are only supported in OnUpdate.')
        program[current].append(command)
    if name is None:
        raise CompileError(f'{filename}: expected Script "Name".')
    return {'scriptName': name, **program}
