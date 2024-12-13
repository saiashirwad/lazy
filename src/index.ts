type Gen<T> = () =>
	| Generator<T, void, unknown>
	| AsyncGenerator<T, void, unknown>

export interface LazyArray<T> {
	[Symbol.iterator](): Generator<T, void, unknown>
	[Symbol.asyncIterator](): AsyncGenerator<T, void, unknown>

	take(n: number): Promise<T[]>
	nth(n: number): Promise<T | undefined>
	map<U>(fn: (value: T) => U | Promise<U>): LazyArray<U>
	tap(fn: (value: T) => void | Promise<void>): LazyArray<T>
	filter(fn: (value: T) => boolean | Promise<boolean>): LazyArray<T>
	reduce<U>(
		fn: (accumulator: U, value: T) => U | Promise<U>,
		initialValue: U,
	): Promise<U>
}

export namespace Lazy {
	export function arr<T>(gen: Gen<T>): LazyArray<T> {
		return {
			*[Symbol.iterator]() {
				// @ts-expect-error this is fine
				for (const value of gen()) {
					yield value
				}
			},

			async *[Symbol.asyncIterator]() {
				for await (const value of gen()) {
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
				return arr(async function* () {
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

			map<U>(fn: (value: T) => U | Promise<U>): LazyArray<U> {
				const self = this
				return arr(async function* () {
					for await (const value of self) {
						yield await fn(value)
					}
				})
			},

			filter(fn: (value: T) => boolean | Promise<boolean>): LazyArray<T> {
				const self = this
				return arr(async function* () {
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
		}
	}
}
