import { lazy } from '../src'

const doge = lazy(async function* () {
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
})
	.map((reading) => ({
		...reading,
		timestamp: new Date(reading.timestamp).toLocaleTimeString(),
	}))
	.map((reading) => `[${reading.timestamp}] DOGE Price: $${reading.price}`)

doge.listen((result) => {
	console.log(result)
})
