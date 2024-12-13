import { Lazy } from '../src'

interface PokemonListResponse {
	count: number
	next: string | null
	previous: string | null
	results: {
		name: string
		url: string
	}[]
}

interface PokemonDetail {
	id: number
	name: string
	height: number
	weight: number
	sprites: {
		front_default: string
	}
	types: {
		slot: number
		type: {
			name: string
			url: string
		}
	}[]
}

const pokemonStream = Lazy.arr(async function* () {
	let offset = 0
	const limit = 20

	while (true) {
		const response = await fetch(
			`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`,
		)
		const data: PokemonListResponse = await response.json()

		if (!data.results.length) break

		for (const pokemon of data.results) {
			const detailResponse = await fetch(pokemon.url)
			const pokemonDetail: PokemonDetail = await detailResponse.json()
			yield pokemonDetail
		}

		if (!data.next) break
		offset += limit
	}
})

async function main() {
	const firePokemon = await pokemonStream
		.filter((pokemon) =>
			pokemon.types.some((type) => type.type.name === 'fire'),
		)
		.take(5)

	firePokemon.forEach((pokemon) => {
		console.log(`
            Name: ${pokemon.name}
            Sprite: ${pokemon.sprites.front_default}
            Types: ${pokemon.types.map((t) => t.type.name).join(', ')}
        `)
	})
}

main().catch(console.error)
