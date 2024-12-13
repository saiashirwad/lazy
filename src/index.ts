type Gen<T> = () =>
	| Generator<T, void, unknown>
	| AsyncGenerator<T, void, unknown>

export interface Lazy<T> {
	[Symbol.iterator](): Generator<T, void, unknown>
	[Symbol.asyncIterator](): AsyncGenerator<T, void, unknown>

	take(n: number): Promise<T[]>
	nth(n: number): Promise<T | undefined>
	map<U>(fn: (value: T) => U | Promise<U>): Lazy<U>
	tap(fn: (value: T) => void | Promise<void>): Lazy<T>
	filter(fn: (value: T) => boolean | Promise<boolean>): Lazy<T>
	reduce<U>(
		fn: (accumulator: U, value: T) => U | Promise<U>,
		initialValue: U,
	): Promise<U>
	collect(): Promise<T[]>
	listen(fn: (value: T) => void | Promise<void>): Promise<void>
}

export function lazy<T>(generator: Gen<T>): Lazy<T> {
	return {
		*[Symbol.iterator]() {
			// @ts-expect-error this is fine
			for (const value of generator()) {
				yield value
			}
		},

		async *[Symbol.asyncIterator]() {
			for await (const value of generator()) {
				yield value
			}
		},

		async take(n: number): Promise<T[]> {
			let i = 0
			const arr: T[] = []
			for await (const value of this) {
				if (i === n) return arr
				arr.push(value)
				i++
			}
			return arr
		},

		tap(fn) {
			const self = this
			return lazy(async function* () {
				for await (const value of self) {
					await fn(value)
					yield value
				}
			})
		},

		async nth(n) {
			let i = 0
			for await (const value of this) {
				if (i === n) return value
				i++
			}
			return undefined
		},

		map<U>(fn: (value: T) => U | Promise<U>): Lazy<U> {
			const self = this
			return lazy(async function* () {
				for await (const value of self) {
					yield await fn(value)
				}
			})
		},

		filter(fn: (value: T) => boolean | Promise<boolean>): Lazy<T> {
			const self = this
			return lazy(async function* () {
				for await (const value of self) {
					if (await fn(value)) yield value
				}
			})
		},

		async reduce<U>(
			fn: (accumulator: U, value: T) => U | Promise<U>,
			initialValue: U,
		): Promise<U> {
			let accumulator = initialValue
			for await (const value of this) {
				accumulator = await fn(accumulator, value)
			}
			return accumulator
		},

		async collect(): Promise<T[]> {
			const arr: T[] = []
			for await (const value of this) {
				arr.push(value)
			}
			return arr
		},

		async listen(fn: (value: T) => void | Promise<void>): Promise<void> {
			for await (const value of this) {
				await fn(value)
			}
		},
	}
}
