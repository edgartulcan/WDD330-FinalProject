import { fetchPokemonBatch, createPokemonCard, POKEMON_COUNT, grid } from './shared.js'
import { toggleFavorite, isFavorite, renderFavorites } from './favorites.js'
import { initCompare } from './compare.js'
import './search.js'

const PER_PAGE = 20
const TOTAL_PAGES = Math.ceil(POKEMON_COUNT / PER_PAGE)
let currentPage = 1

const randomBtn = document.getElementById('random-btn')
const navCompare = document.getElementById('nav-compare')
const navFavorites = document.getElementById('nav-favorites')
const compareSection = document.getElementById('compare-section')
const favoritesSection = document.getElementById('favorites-section')
const pokemonListSection = document.getElementById('pokemon-list')
const searchSection = document.getElementById('search-section')
const paginationEl = document.getElementById('pagination')

async function loadPage(page) {
    currentPage = page
    console.log('Loading page:', page)
    grid.innerHTML = '<p style="text-align:center;grid-column:1/-1">Loading Pokémon...</p>'

    const start = (page - 1) * PER_PAGE + 1
    const end = Math.min(start + PER_PAGE - 1, POKEMON_COUNT)
    const ids = []
    for (let i = start; i <= end; i++) ids.push(i)

    const pokemonList = await fetchPokemonBatch(ids)
    grid.innerHTML = ''
    pokemonList.forEach(data => {
        const card = createPokemonCard(data)
        const favBtn = document.createElement('button')
        favBtn.className = 'fav-btn'
        favBtn.textContent = isFavorite(data.id) ? '❤️' : '🤍'
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation()
            toggleFavorite(data.id)
            favBtn.textContent = isFavorite(data.id) ? '❤️' : '🤍'
        })
        card.appendChild(favBtn)
        grid.appendChild(card)
    })

    renderPagination()
}

function renderPagination() {
    paginationEl.innerHTML = ''

    const prevBtn = document.createElement('button')
    prevBtn.textContent = '« Prev'
    prevBtn.disabled = currentPage === 1
    prevBtn.addEventListener('click', () => loadPage(currentPage - 1))
    paginationEl.appendChild(prevBtn)

    for (let i = 1; i <= TOTAL_PAGES; i++) {
        const btn = document.createElement('button')
        btn.textContent = i
        btn.className = i === currentPage ? 'active-page' : ''
        btn.addEventListener('click', () => loadPage(i))
        paginationEl.appendChild(btn)
    }

    const nextBtn = document.createElement('button')
    nextBtn.textContent = 'Next »'
    nextBtn.disabled = currentPage === TOTAL_PAGES
    nextBtn.addEventListener('click', () => loadPage(currentPage + 1))
    paginationEl.appendChild(nextBtn)
}

function showSection(section) {
    pokemonListSection.classList.toggle('hidden', section !== 'home')
    searchSection.classList.toggle('hidden', section !== 'home')
    compareSection.classList.toggle('hidden', section !== 'compare')
    favoritesSection.classList.toggle('hidden', section !== 'favorites')
    paginationEl.classList.toggle('hidden', section !== 'home')
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'))
}

randomBtn.addEventListener('click', () => {
    const id = Math.floor(Math.random() * POKEMON_COUNT) + 1
    window.location.href = `pages/details.html?id=${id}`
})

navCompare.addEventListener('click', (e) => {
    e.preventDefault()
    showSection('compare')
    initCompare()
})

navFavorites.addEventListener('click', (e) => {
    e.preventDefault()
    showSection('favorites')
    renderFavorites()
})

const homeLink = document.querySelector('nav a[href="index.html"]')
if (homeLink) {
    homeLink.addEventListener('click', (e) => {
        e.preventDefault()
        showSection('home')
    })
}

loadPage(1)
