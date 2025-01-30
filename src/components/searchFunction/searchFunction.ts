import { getBookByURL, getHouseByURL, getRandomCharacter, searchCharacters } from "../../api/asoiafAPI";
import { article, aside } from "../../constants/constants";
import { clearAside } from "../../helpers/helpers";
import AsoiafCharacterType from "../../types/asoiafCharacterType";

export const setupSearchContainer = () => {
    const searchContainer = document.createElement("div");
    searchContainer.id = "search-container";
    article.appendChild(searchContainer);

    const explanation = document.createElement("h2");
    explanation.innerHTML = "Search for any character below";
    searchContainer.appendChild(explanation);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = ". . .";
    input.id = "search-input";
    searchContainer.appendChild(input);

    handleInput();

    const button = document.createElement("button");
    button.textContent = "Randomise";
    button.id = "randomise-button";
    searchContainer.appendChild(button);

    handleRandomButton();
};

const handleInput = () => {
    const input = document.getElementById("search-input") as HTMLInputElement;
    const searchContainer = document.getElementById("search-container") as HTMLElement;

    input.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            clearPreviousSearchResults();

            const loadingIndicator = document.createElement("div");
            loadingIndicator.className = "hourglass";
            searchContainer.appendChild(loadingIndicator);

            const searchInput = input.value;
            const searchedCharacters = await searchCharacters(searchInput);

            searchContainer.removeChild(loadingIndicator);

            displaySearchResults(searchInput, searchedCharacters);
            input.value = '';
        }
    });
};

const handleRandomButton = () => {
    const button = document.getElementById("randomise-button") as HTMLButtonElement;
    if (button) {
        button.addEventListener("click", async () => {
            clearPreviousSearchResults();

            try {
                const character = await getRandomCharacter();
                if (character) {
                    displayCharacterInfo(character);
                } else {
                    console.error("Ingen karaktär hittades.");
                }
            } catch (error) {
                console.error("Fel vid hämtning av slumpmässig karaktär:", error);
            }
        });
    } else {
        console.error("Knapp hittades inte.");
    }
};

const clearPreviousSearchResults = () => {
    const searchContainer = document.getElementById("search-container") as HTMLElement;
    const previousSearchElement = document.getElementById('search-output');
    const previousCharacterList = document.getElementById('character-list');

    if (previousSearchElement) searchContainer.removeChild(previousSearchElement);
    if (previousCharacterList) searchContainer.removeChild(previousCharacterList);
};

const displaySearchResults = (searchInput: string, searchedCharacters: AsoiafCharacterType[]) => {
    const searchContainer = document.getElementById("search-container") as HTMLElement;

    const searchElement = document.createElement("p");
    searchElement.id = 'search-output';
    searchElement.innerHTML = `Your search: "${searchInput}", results: ${searchedCharacters.length}`;
    searchContainer.appendChild(searchElement);

    const characterList = document.createElement("ul");
    characterList.id = 'character-list';

    searchedCharacters.forEach(character => {
        const listItem = document.createElement("li");
        listItem.textContent = character.name;
        listItem.addEventListener("click", () => displayCharacterInfo(character));
        characterList.appendChild(listItem);
    });

    searchContainer.appendChild(characterList);
};

const displayCharacterInfo = async (character: AsoiafCharacterType) => {
    let houseNames: string[] = [];
    let bookNames: string[] = [];

    for (const houseURL of character.allegiances) {
        const house = await getHouseByURL(houseURL);
        if (house) houseNames.push(house.name);
    }

    for (const bookURL of character.povBooks) {
        const book = await getBookByURL(bookURL);
        if (book) bookNames.push(book.name);
    }

    clearAside();
    const searchAside = document.createElement("div");
    searchAside.id = "search-aside";
    aside.appendChild(searchAside);

    const knownHouses = [ "Arryn", "Baelish", "Baratheon", "Bolton", "Clegane", "Dondarrion", "Frey", "Greyjoy", "Lannister", "Martell", "Mormont", "Stark", "Targaryen", "Tully", "Tyrell" ];

    let houseSVG = "";
    if (houseNames.length > 0) {
        const matchingHouse = knownHouses.find(house => houseNames[0].includes(house));
        
        if (matchingHouse) {
            const houseSlug = matchingHouse.toLowerCase();
            houseSVG = `<img src="./media/houses/${houseSlug}.svg" alt="${matchingHouse}" class="house-sigil">`;
        }
    }

    searchAside.innerHTML = `
        <h2>${character.name}</h2>
        ${houseSVG}
        <section>
            <p>Allegiances: ${houseNames.length > 0 ? houseNames.join(", ") : "Unknown"}</p>
            <p>Titles: ${character.titles.length > 0 ? character.titles.join(", ") : "Unknown"}</p>
            <p>Culture: ${character.culture || "Unknown"}</p>
            <p>Born: ${character.born || "Unknown"}</p>
            <p>Died: ${character.died || "N/A"}</p>
            <p>POV books: ${bookNames.length > 0 ? bookNames.join(", ") : "None"}</p>
        </section>
    `;
};
