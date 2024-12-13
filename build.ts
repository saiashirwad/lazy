import type { BuildConfig } from 'bun'

const config: BuildConfig = {
	entrypoints: ['./src/index.ts', './src/events.ts', './src/dom.ts'],
	outdir: './dist',
	format: 'esm',
}

await Bun.build(config)
