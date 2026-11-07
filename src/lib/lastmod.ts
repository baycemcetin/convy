// Last real change of a source file from git (SEO-SAYFALAR §2.4): never "today". No git (the Drive mirror) or an untracked file -> undefined -> no <lastmod>.
import { execFileSync } from 'node:child_process';
export function lastmod(files: string[]): string | undefined {
  const ds: string[] = [];
  for (const f of files) {
    try { const d = execFileSync('git', ['log', '-1', '--format=%cI', '--', f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); if (d) ds.push(d); } catch { /* no git */ }
  }
  return ds.sort().at(-1);
}
