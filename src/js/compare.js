import { fetchPokemon, typeColors, setupSuggestions } from './shared.js'

const input1 = document.getElementById('compare-input-1')
const input2 = document.getElementById('compare-input-2')
const result1 = document.getElementById('compare-result-1')
const result2 = document.getElementById('compare-result-2')
const display = document.getElementById('compare-display')

let pokemon1 = null
let pokemon2 = null
let suggestionsReady = false

export function initCompare() {
    ensureSuggestions()
    display.innerHTML = ''
    result1.innerHTML = ''
    result2.innerHTML = ''
    pokemon1 = null
    pokemon2 = null
}

function ensureSuggestions() {
    if (suggestionsReady) return
    suggestionsReady = true
    setupCompareSuggestions(input1, result1, 1)
    setupCompareSuggestions(input2, result2, 2)
}

function renderStatBar(label, value, maxVal) {
    const pct = Math.min((value / maxVal) * 100, 100)
    const hue = value > 100 ? '#2A75BB' : value > 70 ? '#7AC74C' : value > 40 ? '#F7D02C' : '#EE8130'
    return `
        <div class="stat-bar-container">
            <span class="stat-label">${label}</span>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width:${pct}%;background:${hue}"></div>
            </div>
            <span class="stat-value">${value}</span>
        </div>
    `
}

function renderCompareCard(data) {
    const types = data.types.map(t => `<span class="type-badge" style="background:${typeColors[t.type.name] || '#999'}">${t.type.name}</span>`).join('')
    const statsHtml = data.stats.map(s => renderStatBar(s.stat.name.toUpperCase(), s.base_stat, 255)).join('')

    return `
        <div class="compare-card">
            <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}" />
            <h3>${data.name.toUpperCase()}</h3>
            <div class="pokemon-types">${types}</div>
            <p>Height: ${data.height / 10}m | Weight: ${data.weight / 10}kg</p>
            <div style="margin-top:12px">${statsHtml}</div>
        </div>
    `
}

async function handleInput(input, resultDiv, slot) {
    const query = input.value.trim().toLowerCase()
    if (!query) return

    console.log('Comparing:', query)

    try {
        const data = await fetchPokemon(query)
        if (slot === 1) pokemon1 = data
        else pokemon2 = data

        const types = data.types.map(t => `<span class="type-badge" style="background:${typeColors[t.type.name] || '#999'}">${t.type.name}</span>`).join('')
        resultDiv.innerHTML = `
            <div class="pokemon-card" style="cursor:default">
                <img src="${data.sprites.other['official-artwork'].front_default}" alt="${data.name}" style="width:96px;height:96px" />
                <p class="pokemon-name">${data.name.toUpperCase()}</p>
                <div class="pokemon-types">${types}</div>
            </div>
        `

        if (pokemon1 && pokemon2) {
            display.innerHTML = renderCompareCard(pokemon1) + renderCompareCard(pokemon2)
        }
    } catch {
        resultDiv.innerHTML = '<p style="color:#EE8130">Not found</p>'
    }
}

function setupCompareSuggestions(input, resultDiv, slot) {
    const wrapper = document.createElement('div')
    wrapper.style.position = 'relative'
    input.parentNode.insertBefore(wrapper, input)
    wrapper.appendChild(input)

    const box = document.createElement('div')
    box.className = 'suggestions-container'
    box.style.width = '100%'
    wrapper.appendChild(box)

    setupSuggestions(input, box, () => {
        handleInput(input, resultDiv, slot)
    })
}
