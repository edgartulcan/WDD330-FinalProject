import { fetchPokemon, createPokemonCard } from './shared.js'

const FAVORITES_KEY = 'pokemon-favorites'

export function getFavorites() {
    const data = localStorage.getItem(FAVORITES_KEY)
    return data ? JSON.parse(data) : []
}

export function isFavorite(id) {
    return getFavorites().includes(id)
}

export function toggleFavorite(id) {
    let favs = getFavorites()
    if (favs.includes(id)) {
        favs = favs.filter(f => f !== id)
    } else {
        favs.push(id)
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
}

export function renderFavorites() {
    const grid = document.getElementById('favorites-grid')
    const favs = getFavorites()
    console.log('Favorites loaded:', favs.length)
    if (favs.length === 0) {
        grid.innerHTML = '<p>No favorite Pokémon yet. Click the heart icon to add some!</p>'
        return
    }
    grid.innerHTML = ''
    favs.forEach(async (id) => {
        try {
            const data = await fetchPokemon(id)
            const card = createPokemonCard(data)
            const favBtn = document.createElement('button')
            favBtn.className = 'fav-btn'
            favBtn.textContent = '❤️'
            favBtn.addEventListener('click', (e) => {
                e.stopPropagation()
                toggleFavorite(id)
                renderFavorites()
            })
            card.appendChild(favBtn)
            grid.appendChild(card)
        } catch {
            // skip failed fetches
        }
    })
}
