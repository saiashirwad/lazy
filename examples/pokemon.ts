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

async function fetchPokemonList(
	offset: number,
	limit: number,
): Promise<PokemonListResponse> {
	const response = await fetch(
		`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`,
	)
	return response.json()
}

async function fetchPokemonDetail(url: string): Promise<PokemonDetail> {
	const response = await fetch(url)
	return response.json()
}

const pokemonStream = Lazy.arr(async function* () {
	let offset = 0
	const limit = 20

	while (true) {
		const data = await fetchPokemonList(offset, limit)

		if (!data.results.length) break

		for (const pokemon of data.results) {
			yield await fetchPokemonDetail(pokemon.url)
		}

		if (!data.next) break
		offset += limit
	}
})

const firePokemon = await pokemonStream
	.tap((pokemon) => {
		console.log(pokemon.name)
	})
	.filter((pokemon) => {
		return pokemon.types.some((type) => type.type.name === 'fire')
	})
	.take(5)

firePokemon.forEach((pokemon) => {
	console.log(`
      Name: ${pokemon.name}
      Sprite: ${pokemon.sprites.front_default}
      Types: ${pokemon.types.map((t) => t.type.name).join(', ')}`)
})
