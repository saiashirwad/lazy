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
		initialValue: U,
		fn: (accumulator: U, value: T) => U | Promise<U>,
	): Lazy<U>
	collect(): Promise<T[]>
	listen(fn: (value: T) => void | Promise<void>): Promise<void>
	window(size: number): Lazy<T[]>
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

		reduce<U>(
			initialValue: U,
			fn: (accumulator: U, value: T) => U | Promise<U>,
		) {
			const self = this
			return lazy(async function* () {
				let accumulator = initialValue
				for await (const value of self) {
					accumulator = await fn(accumulator, value)
					yield accumulator
				}
			})
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

		window(size: number): Lazy<T[]> {
			return this.reduce<T[]>([], (acc, value) => {
				if (acc.length === size) return acc.slice(1)
				return [...acc, value]
			})
		},
	}
}
