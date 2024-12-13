import { Lazy } from '../src'

const numbers = Lazy.arr(async function* () {
	let i = 0
	while (true) {
		await new Promise((resolve) => setTimeout(resolve, 100))
		yield i
		i++
	}
})

// Using async/await to handle the asynchronous operation
async function main() {
	const result = await numbers.map((x) => x + 2).take(5)
	console.log(result)
}

main().catch(console.error)
