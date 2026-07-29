let pokemonListCategory = document.querySelector(".pokemon_List_Category")
let categorybutton = document.querySelectorAll("button")

const popup = document.createElement("div")
popup.className = "fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center hidden z-50"
popup.id = "pokemon-popup"
document.body.appendChild(popup)

const savedCategory = localStorage.getItem("selectedCategory")

if (savedCategory) {
    for (let i = 1; i <= 151; i++) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
            .then(response => response.json())
            .then(data => {
                const type = data.types.map(type => type.type.name)
                if (type.some(type => type.includes(savedCategory))) {
                    showPokemon(data)
                }
            })
    }
} else {
    for (let i = 1; i <= 151; i++) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
            .then(response => response.json())
            .then(data => showPokemon(data))
    }
}



function showPokemon(data) {
    let categories = data.types.map(type => `<p class="bg-mustardYellow px-3 py-2 rounded-lg font-bold">${type.type.name}</p>`)
    categories = categories.join("")

    const article = document.createElement("article")
    article.className = "flex flex-col justify-center items-center p-5 shadow rounded-lg gap-5 hover:ring-1 ring-gray-300 cursor-pointer"

    article.innerHTML = `
        <img src="${data.sprites.other["official-artwork"].front_default}" alt="img" loading="lazy">
        <p class="font-bold">${data.name.toUpperCase()}</p>
        <div class="flex gap-5 justify-center items-center">
            ${categories}
        </div>
    `
    article.addEventListener("click", () => {
        openPopup(data)
    })

    pokemonListCategory.appendChild(article)
}

function openPopup(data) {
    let categories = data.types.map(type => `<p class="bg-mustardYellow px-3 py-2 rounded-lg font-bold">${type.type.name}</p>`).join("")

    let stats = data.stats.map(stat => `<p class="text-sm"><strong>${stat.stat.name.toUpperCase()}:</strong> ${stat.base_stat}</p>`).join("")

    popup.innerHTML = `
        <div class="bg-white p-8 rounded-xl max-w-sm w-full flex flex-col items-center relative shadow-2xl mx-4 animate-fade-in">
            <button id="close-popup" class="absolute top-3 right-3 text-gray-500 hover:text-black font-bold text-xl">✕</button>
            <img class="w-48 h-48" src="${data.sprites.other["official-artwork"].front_default}" alt="${data.name}">
            <h2 class="text-2xl font-bold my-2">${data.name.toUpperCase()}</h2>
            <div class="flex gap-3 my-2">${categories}</div>
            <div class="w-full bg-gray-100 p-4 rounded-lg mt-3">
                <h3 class="font-bold border-b pb-1 mb-2">Estadísticas:</h3>
                ${stats}
            </div>
        </div>
    `
    popup.classList.remove("hidden")

    popup.querySelector("#close-popup").addEventListener("click", () => {
        popup.classList.add("hidden")
    })
}

popup.addEventListener("click", (e) => {
    if (e.target === popup) {
        popup.classList.add("hidden")
    }
})

categorybutton.forEach(button => button.addEventListener("click", (event) => {
    const buttonId = event.currentTarget.id
    localStorage.setItem("selectedCategory", buttonId)

    pokemonListCategory.innerHTML = ""

    for (let i = 1; i <= 151; i++) {
        fetch(`https://pokeapi.co/api/v2/pokemon/${i}`)
            .then(response => response.json())
            .then(data => {
                const type = data.types.map(type => type.type.name)
                if (type.some(type => type.includes(buttonId))) {
                    showPokemon(data)
                }
            })
    }
}))