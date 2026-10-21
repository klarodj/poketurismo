#!/usr/bin/env python3
"""Keep the isolated preview running; restart after code changes or successful builds."""
import os
from pathlib import Path
import signal
import subprocess
import time

ROOT = Path(__file__).resolve().parents[1]
FOLDERS = ('src', 'shared', 'server', 'scripts', 'public', 'dist')
ROOT_FILES = ('package.json', 'package-lock.json', 'vite.config.js', 'tailwind.config.js', 'postcss.config.js', '.env')
EXCLUDED = {'node_modules', '.git', '__pycache__', 'backups', '.preview', '.vite-cache'}

def fingerprint(root=ROOT):
    files = [root / name for name in ROOT_FILES]
    files.append(root / '.preview/restart.request')
    for folder in FOLDERS:
        for directory, children, names in os.walk(root / folder):
            children[:] = [name for name in children if name not in EXCLUDED]
            files.extend(Path(directory) / name for name in names if '.db' not in name and not name.endswith(('.log', '.pyc', '~')))
    result = []
    for file in files:
        try:
            info = file.stat()
            result.append((str(file.relative_to(root)), info.st_mtime_ns, info.st_size))
        except FileNotFoundError:
            pass
    return tuple(sorted(result))

def stop(child):
    if child.poll() is None:
        try:
            os.killpg(child.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            child.wait(timeout=12)
        except subprocess.TimeoutExpired:
            try:
                os.killpg(child.pid, signal.SIGKILL)
            except ProcessLookupError:
                pass
            child.wait()

def main():
    stopping = False
    def shutdown(signum, frame):
        nonlocal stopping
        stopping = True
    signal.signal(signal.SIGTERM, shutdown)
    signal.signal(signal.SIGINT, shutdown)
    last = fingerprint()
    child = None
    pending_since = None
    retry_at = 0
    failures = 0
    started_at = 0
    try:
        while not stopping:
            current = fingerprint()
            if current != last:
                last = current
                pending_since = time.monotonic()
                retry_at = 0
            if pending_since is not None and time.monotonic() - pending_since >= 1:
                print('Codice o build aggiornati: riavvio sviluppo.', flush=True)
                if child is not None:
                    stop(child)
                    child = None
                pending_since = None
                failures = 0
            if child is not None and child.poll() is not None:
                code = child.returncode
                if time.monotonic() - started_at > 60:
                    failures = 0
                failures += 1
                delay = min(30, 2 ** min(failures, 5))
                print(f'Anteprima terminata ({code}); nuovo tentativo fra {delay} s.', flush=True)
                child = None
                retry_at = time.monotonic() + delay
            if child is None and pending_since is None and time.monotonic() >= retry_at:
                child = subprocess.Popen(['bash', str(ROOT / 'scripts/preview.sh')], cwd=ROOT, start_new_session=True)
                started_at = time.monotonic()
            time.sleep(0.5)
    finally:
        if child is not None:
            stop(child)

if __name__ == '__main__':
    main()
