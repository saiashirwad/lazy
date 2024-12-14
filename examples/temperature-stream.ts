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

apiStream.window(10).listen((result) => {
	console.clear()
	console.log(result)
})
