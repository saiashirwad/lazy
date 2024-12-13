# Lazy
you're lazy, i'm lazy, we're lazy, why isn't your code lazy?

# Install

```bash
bun add @texoport/lazy
```

# Example

```typescript
import { appendFile } from 'node:fs/promises'
import { blue, plot } from 'asciichart'
import { lazy } from '@texoport/lazy'

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
		console.log(plot(priceHistory, { height: 15, colors: [blue] }))
	})



```
