import { fetchPokemon, createPokemonCard, grid, setupSuggestions } from './shared.js'

const searchInput = document.getElementById('search-input')
const searchBtn = document.getElementById('search-btn')
const paginationEl = document.getElementById('pagination')

async function searchPokemon(query) {
    query = query.trim().toLowerCase()
    if (!query) {
        paginationEl.classList.remove('hidden')
        window.location.href = 'index.html'
        return
    }

    console.log('Searching for:', query)
    paginationEl.classList.add('hidden')
    grid.innerHTML = '<p style="text-align:center;grid-column:1/-1">Searching...</p>'

    try {
        const data = await fetchPokemon(query)
        grid.innerHTML = ''
        grid.appendChild(createPokemonCard(data))
    } catch {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1">Pokémon not found. Try another name.</p>'
    }
}

const suggestionBox = document.createElement('div')
suggestionBox.id = 'suggestions'
suggestionBox.className = 'suggestions-container'
searchInput.parentNode.appendChild(suggestionBox)

const suggestions = setupSuggestions(searchInput, suggestionBox, (name) => {
    searchPokemon(name)
})

searchBtn.addEventListener('click', () => {
    const first = suggestionBox.querySelector('.suggestion-item')
    if (first) {
        const name = first.dataset.name
        searchInput.value = name
        suggestions.hide()
        searchPokemon(name)
    } else {
        searchPokemon(searchInput.value)
    }
})

searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && !suggestionBox.classList.contains('visible')) {
        searchPokemon(searchInput.value)
    }
})
