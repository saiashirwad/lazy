import { LazyArray } from '../src'

const tempStream = LazyArray(async function* () {
	let baseTemp = 20

	while (true) {
		const fluctuation = Math.random() * 2 - 1
		const temperature = parseFloat(
			(baseTemp + fluctuation * (Math.random() > 0.5 ? 1 : -1)).toFixed(2),
		)

		yield {
			temperature,
			timestamp: Date.now(),
		}

		await new Promise((resolve) => setTimeout(resolve, 500))
		baseTemp += 0.2
	}
})
	.filter((reading) => reading.temperature > 20)
	.map(
		(reading) =>
			`[${new Date(reading.timestamp).toLocaleTimeString()}] ` +
			`Temperature: ${reading.temperature}°C ` +
			`(${Number(((reading.temperature * 9) / 5 + 32).toFixed(1))}°F)`,
	)

await tempStream.listen((result) => {
	console.clear()
	console.log(result)
})
