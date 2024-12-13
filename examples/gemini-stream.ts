import { GoogleGenerativeAI } from '@google/generative-ai'
import { lazy } from '../src'

const storyStream = lazy(async function* () {
	const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash',
	})

	const result = await model.generateContentStream({
		contents: [
			{
				role: 'user',
				parts: [
					{
						text: 'respond with a JSON file, and only a JSON file. 2 fields only',
					},
				],
			},
		],
	})

	for await (const chunk of result.stream) {
		const text = chunk.text()
		if (text) {
			yield {
				text,
				timestamp: Date.now(),
			}
		}
	}
})
	.map((response) => ({
		...response,
		formattedTime: new Date(response.timestamp).toLocaleTimeString(),
	}))
	.tap((chunk) => {
		process.stdout.write(`[${chunk.formattedTime}] ${chunk.text} `)
	})
	.collect()

console.log('\nStream completed:', await storyStream)
