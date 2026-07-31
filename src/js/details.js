import { fetchPokemon, fetchPokemonSpecies, fetchEvolutionChain, typeColors } from './shared.js'
import { toggleFavorite, isFavorite } from './favorites.js'
import { loadTCGCards } from './cards.js'

const params = new URLSearchParams(window.location.search)
const pokemonId = params.get('id')

const detailSection = document.getElementById('pokemon-detail')
const statsSection = document.getElementById('stats-display')
const evolutionSection = document.getElementById('evolution-display')
const typeEffectiveness = document.getElementById('type-effectiveness')

const statColors = {
    HP: '#EE8130', ATTACK: '#F7D02C', DEFENSE: '#6390F0',
    'SPECIAL ATTACK': '#A33EA1', 'SPECIAL DEFENSE': '#7AC74C', SPEED: '#F95587'
}

function renderStatBar(label, value) {
    const pct = Math.min((value / 255) * 100, 100)
    const color = statColors[label] || '#2A75BB'
    return `
        <div class="stat-bar-container">
            <span class="stat-label">${label}</span>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width:${pct}%;background:${color}"></div>
            </div>
            <span class="stat-value">${value}</span>
        </div>
    `
}

async function renderDetail() {
    if (!pokemonId) {
        detailSection.innerHTML = '<p>No Pokémon selected. <a href="index.html">Go back</a></p>'
        return
    }

    console.log('Loading Pokemon:', pokemonId)
    detailSection.innerHTML = '<p>Loading Pokémon data...</p>'

    try {
        const data = await fetchPokemon(pokemonId)
        console.log('Rendering:', data.name)
        const species = await fetchPokemonSpecies(pokemonId)

        const types = data.types.map(t =>
            `<span class="type-badge" style="background:${typeColors[t.type.name] || '#999'}">${t.type.name}</span>`
        ).join('')

        const abilities = data.abilities.map(a => a.ability.name.replace('-', ' ')).join(', ')

        const idPadded = String(data.id).padStart(3, '0')
        const fav = isFavorite(data.id)

        detailSection.innerHTML = `
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}" />
            <h1>${data.name.toUpperCase()} <span style="font-size:1rem;color:#666">#${idPadded}</span></h1>
            <div class="pokemon-types">${types}</div>
            <div class="detail-info">
                <span>Height: ${data.height / 10}m</span>
                <span>Weight: ${data.weight / 10}kg</span>
                <span>Base XP: ${data.base_experience}</span>
            </div>
            <p class="abilities">Abilities: ${abilities}</p>
            <button class="fav-btn" id="detail-fav" style="font-size:2rem">${fav ? '❤️' : '🤍'}</button>
        `

        document.getElementById('detail-fav').addEventListener('click', () => {
            toggleFavorite(data.id)
            document.getElementById('detail-fav').textContent = isFavorite(data.id) ? '❤️' : '🤍'
        })

        const statsHtml = data.stats.map(s =>
            renderStatBar(s.stat.name.toUpperCase().replace('-', ' '), s.base_stat)
        ).join('')
        statsSection.innerHTML = statsHtml

        renderEvolution(species)
        renderTypeEffectiveness(data)

        loadTCGCards(data.name)

        document.title = `${data.name.toUpperCase()} — Pokémon Battle Companion`

    } catch {
        detailSection.innerHTML = '<p>Pokémon not found. <a href="index.html">Go back</a></p>'
    }
}

async function renderEvolution(species) {
    try {
        const evoData = await fetchEvolutionChain(species.evolution_chain.url)
        const chain = evoData.chain

        const evoList = []
        function walkChain(node) {
            const name = node.species.name
            const id = node.species.url.split('/').filter(Boolean).pop()
            evoList.push({ name, id: parseInt(id) })
            if (node.evolves_to.length > 0) {
                node.evolves_to.forEach(walkChain)
            }
        }
        walkChain(chain)

        if (evoList.length <= 1) {
            evolutionSection.innerHTML = '<p>This Pokémon does not evolve.</p>'
            return
        }

        evolutionSection.innerHTML = ''
        evoList.forEach((evo, i) => {
            const item = document.createElement('div')
            item.className = 'evolution-item'
            item.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evo.id}.png" alt="${evo.name}" />
                <p>${evo.name.toUpperCase()}</p>
            `
            item.addEventListener('click', () => {
                window.location.href = `details.html?id=${evo.id}`
            })
            evolutionSection.appendChild(item)

            if (i < evoList.length - 1) {
                const arrow = document.createElement('span')
                arrow.className = 'evolution-arrow'
                arrow.textContent = '→'
                evolutionSection.appendChild(arrow)
            }
        })
    } catch {
        evolutionSection.innerHTML = '<p>Evolution data unavailable.</p>'
    }
}

async function renderTypeEffectiveness(data) {
    const typeNames = data.types.map(t => t.type.name)
    const allDamageRelations = []

    for (const typeName of typeNames) {
        const res = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`)
        const typeData = await res.json()
        allDamageRelations.push(typeData.damage_relations)
    }

    function mergeTypes(relationKey) {
        const merged = new Map()
        allDamageRelations.forEach(relations => {
            relations[relationKey].forEach(t => {
                const name = t.name
                merged.set(name, (merged.get(name) || 0) + 1)
            })
        })
        return Array.from(merged.entries())
    }

    function renderBadge(name, factor) {
        const color = factor === 4 ? '#EE8130' : factor === 2 ? '#F7D02C' : factor === 0.5 ? '#6390F0' : factor === 0.25 ? '#7AC74C' : '#666'
        const label = factor > 1 ? `x${factor}` : factor < 1 ? `x${factor}` : ''
        return `<li><span class="type-badge" style="background:${color}">${name} ${label}</span></li>`
    }

    const strengths = mergeTypes('double_damage_to')
    const weaknesses = mergeTypes('double_damage_from')
    const resistances = mergeTypes('half_damage_from')

    typeEffectiveness.innerHTML = `
        <div class="effectiveness-col">
            <h3>Strong Against</h3>
            <ul>${strengths.map(([name, count]) => renderBadge(name, count > 1 ? 4 : 2)).join('') || '<li>None</li>'}</ul>
        </div>
        <div class="effectiveness-col">
            <h3>Weak Against</h3>
            <ul>${weaknesses.map(([name, count]) => renderBadge(name, count > 1 ? 4 : 2)).join('') || '<li>None</li>'}</ul>
        </div>
        <div class="effectiveness-col">
            <h3>Resists</h3>
            <ul>${resistances.map(([name, count]) => renderBadge(name, count > 1 ? 0.25 : 0.5)).join('') || '<li>None</li>'}</ul>
        </div>
    `
}

renderDetail()
