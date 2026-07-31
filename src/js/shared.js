export const typeColors = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
    grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
    ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
    rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
    steel: '#B7B7CE', fairy: '#D685AD'
}

export const POKEMON_COUNT = 151

export async function fetchPokemonList() {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_COUNT}`)
    const data = await res.json()
    return data.results.map((p, i) => ({ name: p.name, id: i + 1 }))
}

export async function fetchPokemon(idOrName) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`)
    if (!res.ok) throw new Error('Not found')
    return res.json()
}

export async function fetchPokemonBatch(ids) {
    const results = await Promise.all(ids.map(async (id) => {
        try {
            console.log('Fetching:', id)
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            const data = await res.json()
            return data
        } catch (e) {
            console.log('Failed to fetch', id, e)
            return null
        }
    }))
    return results.filter(r => r !== null)
}

export async function fetchPokemonSpecies(id) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
    if (!res.ok) throw new Error('Not found')
    return res.json()
}

export async function fetchEvolutionChain(url) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Not found')
    return res.json()
}

export const grid = document.getElementById('pokemon-grid')

export function createPokemonCard(data) {
    const card = document.createElement('div')
    card.className = 'pokemon-card'

    const id = String(data.id).padStart(3, '0')
    const types = data.types.map(t => t.type.name)

    const typeBadges = types.map(t =>
        `<span class="type-badge" style="background:${typeColors[t] || '#999'}">${t}</span>`
    ).join('')

    card.innerHTML = `
        <span class="pokemon-id">#${id}</span>
        <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}" loading="lazy" />
        <p class="pokemon-name">${data.name.toUpperCase()}</p>
        <div class="pokemon-types">${typeBadges}</div>
    `

    card.addEventListener('click', () => {
        window.location.href = `pages/details.html?id=${data.id}`
    })

    return card
}

export function setupSuggestions(input, box, onSelect) {
    let pokemonNames = []
    let suggestionIndex = -1
    let debounceTimer

    fetchPokemonList().then(list => { pokemonNames = list })

    function filter(query) {
        if (!query) return []
        return pokemonNames.filter(p => p.name.startsWith(query)).slice(0, 8)
    }

    function hide() {
        box.classList.remove('visible')
        suggestionIndex = -1
    }

    function show(matches) {
        box.innerHTML = ''
        if (matches.length === 0) { hide(); return }
        box.classList.add('visible')
        suggestionIndex = -1
        matches.forEach(p => {
            const div = document.createElement('div')
            div.className = 'suggestion-item'
            div.textContent = p.name.charAt(0).toUpperCase() + p.name.slice(1)
            div.dataset.name = p.name
            div.addEventListener('mousedown', (e) => {
                e.preventDefault()
                input.value = p.name
                hide()
                onSelect(p.name)
            })
            box.appendChild(div)
        })
    }

    function updateActive(items) {
        items.forEach((item, i) => item.classList.toggle('active', i === suggestionIndex))
    }

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            const q = input.value.trim().toLowerCase()
            q ? show(filter(q)) : hide()
        }, 200)
    })

    input.addEventListener('keydown', (e) => {
        const items = box.querySelectorAll('.suggestion-item')
        if (!items.length) return

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            suggestionIndex = Math.min(suggestionIndex + 1, items.length - 1)
            updateActive(items)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            suggestionIndex = Math.max(suggestionIndex - 1, 0)
            updateActive(items)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            const name = suggestionIndex >= 0 ? items[suggestionIndex].dataset.name : items[0].dataset.name
            input.value = name
            hide()
            onSelect(name)
        }
    })

    input.addEventListener('blur', () => {
        setTimeout(hide, 150)
    })

    return { show, hide }
}
