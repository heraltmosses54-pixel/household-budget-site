// main.ts — hands the site in. Node 22, standard library only.
// Copies app/ and screenshots/ from beside this file to the output
// directory (MAKEFUN_OUTPUT_DIR outside the grader, /output inside it)
// and writes /output/dossier.json with the vendored make.fun library.
// vendor/makefun-frontend.ts is the kit's copy, left exactly as it is:
// the scorer rebuilds the dossier with its own copy and compares bytes.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps: at most 4 screenshots, each at most 256 KiB;
// at most 993 files and 16 MiB under app/; the dossier text is capped
// at 160 KiB by the library itself.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 16777216,
  }),
);
