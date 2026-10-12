// `vite build` (via @cloudflare/vite-plugin) copies the local .dev.vars / .env
// secrets into dist/<worker>/.dev.vars for `vite preview`. Remove that copy so
// the build output never contains the Last.fm API key.
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

if (existsSync(DIST)) {
  for (const entry of readdirSync(DIST, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    for (const file of readdirSync(join(DIST, entry.name))) {
      if (file.startsWith('.dev.vars')) {
        rmSync(join(DIST, entry.name, file));
        console.log(`removed ${join(DIST, entry.name, file)}`);
      }
    }
  }
}
