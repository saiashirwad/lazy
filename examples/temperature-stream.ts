import { lazy } from '../src'

const apiStream = lazy(async function* () {
	while (true) {
		const response = await fetch(
			'https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT',
		)
		const data = await response.json()

		yield {
			price: data.price,
			timestamp: Date.now(),
		}

		await new Promise((resolve) => setTimeout(resolve, 50))
	}
}).map((reading) => `[${reading.timestamp}] DOGE Price: $${reading.price}`)

apiStream.listen((result) => {
	console.clear()
	console.log(result)
})

// const tempStream = lazy(async function* () {
// 	let baseTemp = 20

// 	while (true) {
// 		const fluctuation = Math.random() * 2 - 1
// 		const temperature = Math.round(
// 			baseTemp + fluctuation * (Math.random() > 0.5 ? 1 : -1),
// 		)

// 		if (temperature > 20) {
// 			yield {
// 				temperature,
// 				timestamp: Date.now(),
// 			}
// 		}

// 		await new Promise((resolve) => setTimeout(resolve, 100))
// 		baseTemp += Math.random() > 0.5 ? 0.2 : -0.2
// 	}
// })
// 	.map((reading) => ({
// 		timestamp: new Date(reading.timestamp).toLocaleTimeString(),
// 		temperature: reading.temperature,
// 		fahrenheit: Number(((reading.temperature * 9) / 5 + 32).toFixed(1)),
// 	}))
// 	.map(
// 		(reading) =>
// 			`[${reading.timestamp}] Temperature: ${reading.temperature}°C (${reading.fahrenheit}°F)`,
// 	)

// await tempStream.listen((result) => {
// 	console.clear()
// 	console.log(result)
// })
