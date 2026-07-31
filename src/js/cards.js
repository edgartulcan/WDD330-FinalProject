const TCG_API = 'https://api.pokemontcg.io/v2/cards'

export async function loadTCGCards(pokemonName) {
    const container = document.getElementById('tcg-cards')
    if (!container) return

    console.log('Loading TCG cards for:', pokemonName)
    container.innerHTML = '<p style="grid-column:1/-1">Loading trading cards...</p>'

    try {
        const res = await fetch(`${TCG_API}?q=name:${encodeURIComponent(pokemonName)}&pageSize=6`)
        if (!res.ok) throw new Error('API error')
        const data = await res.json()

        if (!data.data || data.data.length === 0) {
            container.innerHTML = '<p style="grid-column:1/-1">No trading cards found for this Pokémon.</p>'
            return
        }

        container.innerHTML = ''
        data.data.forEach(card => {
            const div = document.createElement('div')
            div.className = 'tcg-card'
            const types = card.types ? card.types.join(', ') : ''
            const marketPrice = card.cardmarket && card.cardmarket.prices ? card.cardmarket.prices.averageSellPrice : null
            const setName = card.set ? card.set.name : 'Unknown Set'
            div.innerHTML = `
                <img src="${card.images.large}" alt="${card.name}" loading="lazy" />
                <div class="tcg-info">
                    <p class="tcg-name">${card.name}</p>
                    <p>${card.rarity || 'Common'} — ${setName}</p>
                    ${types ? `<p>Type: ${types}</p>` : ''}
                    ${card.number ? `<p>#${card.number}</p>` : ''}
                    ${marketPrice ? `<p>Market: $${marketPrice.toFixed(2)}</p>` : ''}
                    ${card.artist ? `<p>Artist: ${card.artist}</p>` : ''}
                </div>
            `
            container.appendChild(div)
        })
    } catch {
        container.innerHTML = '<p style="grid-column:1/-1">Failed to load trading cards. Try again later.</p>'
    }
}
