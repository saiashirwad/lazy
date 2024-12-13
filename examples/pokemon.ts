import { lazy } from '../src'

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

const limit = 100

const firePokemon = await lazy(async function* () {
	let offset = 0

	while (true) {
		const data = await fetchPokemonList(offset, limit)
		if (!data.results.length) break
		yield* batch(data.results, 20, (pokemon) => fetchPokemonDetail(pokemon.url))
		if (!data.next) break
		offset += limit
	}
})
	.tap((pokemon) => {
		console.log(pokemon.name)
	})
	.filter((pokemon) => {
		return pokemon.types.some((type) => type.type.name === 'fire')
	})
	.map((pokemon) => {
		return {
			name: pokemon.name,
			sprite: pokemon.sprites.front_default,
			types: pokemon.types.map((t) => t.type.name).join(', '),
		}
	})
	.take(5)

console.log(firePokemon)

export async function* batch<T, R>(
	items: T[],
	batchSize: number,
	fn: (item: T) => Promise<R>,
): AsyncGenerator<R, void, unknown> {
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize)
		const results = await Promise.all(batch.map(fn))
		// @ts-expect-error this is fine
		yield* results
	}
}
