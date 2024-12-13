import { appendFile } from 'node:fs/promises'
import { plot } from 'asciichart'
import { lazy } from '../src'

lazy(async function* () {
	while (true) {
		const response = await fetch(
			'https://api.binance.com/api/v3/ticker/price?symbol=DOGEUSDT',
		)
		const data = await response.json()

		yield {
			price: data.price,
			timestamp: Date.now(),
		}

		await new Promise((resolve) => setTimeout(resolve, 500))
	}
})
	.tap((reading) => {
		appendFile('doge.txt', `${reading.timestamp} ${reading.price}\n`)
	})
	.map((reading) => parseFloat(reading.price))
	.window(50)
	.listen((priceHistory) => {
		console.clear()
		console.log(plot(priceHistory))
	})
