import { copyFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const rootDir = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const targets = [
	{
		src: resolve(distDir, 'market/index.html'),
		dest: resolve(distDir, 'market/404.html'),
	},
	{
		src: resolve(distDir, 'seller/index.html'),
		dest: resolve(distDir, 'seller/404.html'),
	},
];

for (const { src, dest } of targets) {
	if (!existsSync(src)) {
		console.warn(`[copy-404] Skip ${dest}: ${src} not found.`);
		continue;
	}
	copyFileSync(src, dest);
	console.log(`[copy-404] Copied ${src} -> ${dest}`);
}
