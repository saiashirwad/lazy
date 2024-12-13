import { lazy } from '../src'
import { blue, plot, PlotConfig } from 'asciichart'

function drawPlot(data: number[], cfg?: PlotConfig) {
	console.clear()
	console.log(plot(data, cfg ?? { height: 15, colors: [blue] }))
}

const MAX_HISTORY = 50

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

		await new Promise((resolve) => setTimeout(resolve, 10))
	}
})

doge
	.map((reading) => parseFloat(reading.price))
	.window(MAX_HISTORY)
	.listen((priceHistory) => {
		drawPlot(priceHistory)
	})
