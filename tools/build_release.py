"""Builds the release files in dist/:  hexcrawl-backdrops.zip  and  module.json
  python tools/build_release.py --repo OWNER/hexcrawl-backdrops [--version 0.1.0]
The zip contains the module as Foundry expects it (module.json at the root). Images are stored without compression (WebP does not shrink)."""
import argparse, json, os, pathlib, zipfile
ROOT = pathlib.Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser(); ap.add_argument('--repo', required=True, help='GitHub OWNER/REPO'); ap.add_argument('--version')
a = ap.parse_args()
m = json.loads((ROOT / 'module.json').read_text(encoding='utf-8'))
if a.version: m['version'] = a.version
base = f'https://github.com/{a.repo}'
m['url'] = base; m['bugs'] = base + '/issues'
m['manifest'] = base + '/releases/latest/download/module.json'
m['download'] = base + f'/releases/download/v{m["version"]}/{m["id"]}.zip'
(ROOT / 'dist').mkdir(exist_ok=True)
(ROOT / 'dist' / 'module.json').write_text(json.dumps(m, ensure_ascii=False, indent=2), encoding='utf-8')
INCLUDE = ['languages', 'scripts', 'data', 'logo', 'docs', 'assets']; FILES = ['LICENSE', 'LICENSE-IMAGES.md', 'NOTICE.md', 'README.md', 'README.de.md', 'CHANGELOG.md']
zp = ROOT / 'dist' / f'{m["id"]}.zip'; n = 0
with zipfile.ZipFile(zp, 'w', zipfile.ZIP_STORED) as z:
    z.writestr('module.json', json.dumps(m, ensure_ascii=False, indent=2))
    for f in FILES: z.write(ROOT / f, f)
    for d in INCLUDE:
        for p in sorted((ROOT / d).rglob('*')) if (ROOT / d).is_dir() else []:
            if p.is_file(): z.write(p, p.relative_to(ROOT).as_posix()); n += 1
print(f'{zp.name}: {n} files, {zp.stat().st_size / 1e6:.0f} MB; manifest {m["manifest"]}')
