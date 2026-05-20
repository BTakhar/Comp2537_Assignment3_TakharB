let firstCard = null;
let secondCard = null;

let lockBoard = false;

let clicks = 0;
let matchedPairs = 0;

let timer;
let timeLeft = 0;

let instantMatch = false;

async function getRandomPokemon(pairCount) {

    const usedIds = [];
    const cards = [];

    while (usedIds.length < pairCount) {

        const randomId = Math.floor(Math.random() * 1025) + 1;

        if (!usedIds.includes(randomId)) {

            usedIds.push(randomId);

            const response =
                await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);

            const data = await response.json();

            const image =
                data.sprites.other["official-artwork"].front_default;

            cards.push({
                name: data.name,
                image: image
            });

            cards.push({
                name: data.name,
                image: image
            });
        }
    }

    return cards;
}

const difficulties = {

    easy: {
        pairs: 3,
        time: 30,
        powerUps: 0
    },

    medium: {
        pairs: 9,
        time: 60,
        powerUps: 2
    },

    hard: {
        pairs: 15,
        time: 90,
        powerUps: 2
    }
};

const pokemonImages = [];

$("#startBtn").on("click", startGame);

$("#resetBtn").on("click", resetGame);

async function startGame() {

    resetGame();

    const difficulty = $("#difficulty").val();

    const settings = difficulties[difficulty];

    timeLeft = settings.time;

    $("#timer").text(timeLeft);

    let selected = await getRandomPokemon(settings.pairs);

    let cards = [...selected];

    addPowerUps(cards, settings.powerUps);

    cards = cards.sort(() => Math.random() - 0.5);

    renderCards(cards);

    $("#left").text(settings.pairs);

    timer = setInterval(updateTimer, 1000);
}

function addPowerUps(cards, amount) {

    for (let i = 0; i < amount; i++) {

        cards.push({
            name: "powerup",
            image: "powerup.png"
        });
    }
}

function renderCards(cards) {

    $("#game_grid").empty();

    cards.forEach((card) => {

        $("#game_grid").append(`

            <div class="card" data-image="${card.image}">

                <img class="front_face" src="${card.image}">
                <img class="back_face" src="back.webp">

            </div>
        `);
    });

    $(".card").on("click", handleCardClick);
}

function handleCardClick() {

    if (lockBoard) return;

    if ($(this).hasClass("flip")) return;

    if ($(this).hasClass("matched")) return;

    $(this).addClass("flip");

    clicks++;

    $("#clicks").text(clicks);

    const image = $(this).data("image");

    // POWER UP
    if (image === "powerup.png") {

        instantMatch = true;

        $("#message").text("⚡ Next card auto matches!");

        $(this).addClass("matched");

        return;
    }

    // INSTANT MATCH
    if (instantMatch) {

        instantMatch = false;

        const currentCard = $(this);

        const match = $(".card").filter(function () {

            return (
                $(this).data("image") === image &&
                this !== currentCard[0]
            );
        });

        match.addClass("flip matched");

        currentCard.addClass("matched");

        matchedPairs++;

        updateStats();

        checkWin();

        return;
    }

    if (!firstCard) {

        firstCard = $(this);

        return;
    }

    secondCard = $(this);

    checkMatch();
}

function checkMatch() {

    const match =
        firstCard.data("image") ===
        secondCard.data("image");

    if (match) {

        firstCard.addClass("matched");

        secondCard.addClass("matched");

        matchedPairs++;

        updateStats();

        resetTurn();

        checkWin();

    } else {

        lockBoard = true;

        setTimeout(() => {

            firstCard.removeClass("flip");
            secondCard.removeClass("flip");

            resetTurn();

        }, 1000);
    }
}

function resetTurn() {

    firstCard = null;
    secondCard = null;

    lockBoard = false;
}

function updateStats() {

    $("#matched").text(matchedPairs);

    const total =
        difficulties[$("#difficulty").val()].pairs;

    $("#left").text(total - matchedPairs);
}

function updateTimer() {

    timeLeft--;

    $("#timer").text(timeLeft);

    if (timeLeft <= 0) {

        clearInterval(timer);

        $(".card").off("click");

        $("#message").text("GAME OVER");
    }
}

function checkWin() {

    const total =
        difficulties[$("#difficulty").val()].pairs;

    if (matchedPairs === total) {

        clearInterval(timer);

        $(".card").off("click");

        $("#message").text("YOU WIN!");
    }
}

function resetGame() {

    clearInterval(timer);

    $("#game_grid").empty();

    firstCard = null;
    secondCard = null;

    lockBoard = false;

    clicks = 0;
    matchedPairs = 0;

    timeLeft = 0;

    $("#clicks").text(0);
    $("#matched").text(0);
    $("#timer").text(0);
    $("#message").text("");

    $("#left").text(0);
}

let isRedTheme = false;

$("#themeBtn").on("click", function () {

    isRedTheme = !isRedTheme;

    $("body").toggleClass("red-theme");

    $(this).text(
        isRedTheme ? "Default Theme" : "Red Theme"
    );
});