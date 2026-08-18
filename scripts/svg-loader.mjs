// Custom Node loader used to run TS scripts outside the app:
// - resolves extensionless relative imports to .ts / index.ts
// - stubs static assets (.svg/.png/etc.) as empty module exports
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

export function resolve(specifier, context, nextResolve) {
  const isRel = specifier.startsWith('./') || specifier.startsWith('../');
  if (isRel && !path.extname(specifier) && context.parentURL && context.parentURL.startsWith('file:')) {
    const base = path.dirname(fileURLToPath(context.parentURL));
    for (const c of [path.resolve(base, specifier + '.ts'), path.resolve(base, specifier + '/index.ts')]) {
      if (existsSync(c)) return nextResolve(pathToFileURL(c).href, context, nextResolve);
    }
  }
  return nextResolve(specifier, context, nextResolve);
}

export function load(url, context, nextLoad) {
  if (/\.(svg|png|jpe?g|webp|gif|css)$/.test(url)) {
    return { format: 'module', source: 'export default "";', shortCircuit: true };
  }
  return nextLoad(url, context);
}
