function resizeScreen() {
    let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    let height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let wratio = width / 1536;
    let hratio = height / 864;
    let ratio = Math.max(wratio, hratio);
    document.body.style.transform = "scale(" + ratio + ")";
    document.body.style.left = (1536 * (ratio - 1) / 2) + "px";
    document.body.style.top = (864 * (ratio - 1) / 2) + "px";
};

window.onresize = resizeScreen;
resizeScreen();

function clearBody() {
    let nodes = Array.prototype.slice.call(document.body.childNodes);
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id !== "audios") {
            document.body.removeChild(nodes[i]);
        }
    }
}



/* ----------------------------------------------------- */
/* ------------------- Asset loading-------------------- */
/* ----------------------------------------------------- */

function loadResources() {
    var filter = document.createElement('div');
    filter.className = "filter-black";
    document.body.appendChild(filter);

    async function loadAssets(imageUrlArray, isImage) {
        const promiseArray = [];

        for (let imageUrl of imageUrlArray) {
            promiseArray.push(new Promise(resolve => {
                const img = isImage ? new Image() : document.createElement('audio');
                if (isImage)
                    img.onload = () => {
                        assetsLoaded++;
                        var progress = 100 * assetsLoaded / totalAssets;
                        progressSpan.style.width = progress + "%";
                        progressText.innerHTML = Math.floor(progress) + "%";
                        if (progress == 100) {
                            text.innerHTML = "Cliquez pour continuer";
                            filter.onclick = () => {
                                window.addEventListener('keydown', (e) => {
                                    if (e.key === "Escape") {
                                        toggleSettings();
                                    }
                                });
                                fadeTransition(drawHomeScreen);
                            }
                        }
                        resolve();
                    }
                else
                    img.addEventListener('canplay', () => {
                        assetsLoaded++;
                        var progress = 100 * assetsLoaded / totalAssets;
                        progressSpan.style.width = progress + "%";
                        progressText.innerHTML = Math.floor(progress) + "%";
                        img.id = imageUrl;
                        document.getElementById("audios").appendChild(img);
                        if (progress == 100) {
                            text.innerHTML = "Cliquez pour continuer";
                            filter.onclick = () => {
                                window.addEventListener('keydown', function(event) {
                                    if(event.key === "Escape") {
                                        toggleSettings();
                                    }
                                });
                                fadeTransition(drawHomeScreen);
                            }
                        }
                        resolve();
                    });
                img.src = imageUrl;
            }));
        }

        await Promise.all(promiseArray);
        return;
    }

    imgs = [];
    sounds = [];

    imgs.push("resources/ui/battle-bg.jpg");
    imgs.push("resources/ui/brick-texture.jpg");
    imgs.push("resources/ui/card-description.jpg");
    imgs.push("resources/ui/card-texture.jpg");
    imgs.push("resources/ui/card-texture-horizontal.jpg");
    imgs.push("resources/ui/cog.png");
    imgs.push("resources/ui/coin.png");
    imgs.push("resources/ui/crest.png");
    imgs.push("resources/ui/deathtouch.png");
    imgs.push("resources/ui/emerald.png");
    imgs.push("resources/ui/fight.png");
    imgs.push("resources/ui/freeze.png");
    imgs.push("resources/ui/home-screen-bg.jpg");
    imgs.push("resources/ui/lock.png");
    imgs.push("resources/ui/metal-texture.jpg");
    imgs.push("resources/ui/paper-scroll.png");
    imgs.push("resources/ui/parchment.png");
    imgs.push("resources/ui/range.png");
    imgs.push("resources/ui/revive.png");
    imgs.push("resources/ui/ruby.png");
    imgs.push("resources/ui/search.png");
    imgs.push("resources/ui/shield.png");
    imgs.push("resources/ui/team-builder-bg.jpg");
    imgs.push("resources/ui/wood-texture.jpg");

    for (let s of speciesList.concat(["Commandant", "Autre", "Token"]))
        for (let c of cardList[s])
            imgs.push("resources/cards/" + createCard(c).src);

    sounds.push("resources/audio/music/battle1.mp3");
    sounds.push("resources/audio/music/battle2.mp3");
    sounds.push("resources/audio/music/battle3.mp3");
    sounds.push("resources/audio/music/home.mp3");
    sounds.push("resources/audio/music/tavern1.mp3");
    sounds.push("resources/audio/music/tavern2.mp3");
    sounds.push("resources/audio/music/tavern3.mp3");
    sounds.push("resources/audio/sfx/pieces.mp3");
    sounds.push("resources/audio/sfx/impact.mp3");
    sounds.push("resources/audio/sfx/effect-proc.mp3");
    sounds.push("resources/audio/sfx/stat-boost.mp3");
    sounds.push("resources/audio/sfx/battle.mp3");
    sounds.push("resources/audio/sfx/explosion.mp3");
    sounds.push("resources/audio/sfx/page-turn.mp3");

    for (let s of speciesList.concat(["Autre", "Sortilège"]))
        for (let c of battleCries[s])
            sounds.push(c);

    var assetsLoaded = 0;
    var totalAssets = imgs.length + sounds.length;

    var grid = document.createElement('div');
    grid.className = "settings-grid";
    filter.appendChild(grid);

    var progressBar = document.createElement('div');
    progressBar.className = "meter";
    grid.appendChild(progressBar);
    var progressSpan = document.createElement('span');
    progressSpan.style.width = 0;
    progressBar.appendChild(progressSpan);
    var progressText = document.createElement('div');
    progressText.innerHTML = "0%";
    progressBar.appendChild(progressText);

    var text = document.createElement('div');
    text.innerHTML = "Chargement en cours...";
    text.style.fontSize = "3vw";
    grid.appendChild(text);

    var advice = document.createElement('div');
    advice.className = "advice";
    advice.innerHTML = "Pour une meilleur expérience, il est conseillé de jouer en plein écran (F11).</br>Vous pouvez ajuster la musique à tout moment depuis les paramètres."
    filter.appendChild(advice);

    var disclaimer = document.createElement('div');
    disclaimer.className = "disclaimer";
    disclaimer.innerHTML = "La vitesse de chargement dépend de votre connexion Internet. Assurez-vous d'avoir une bonne connexion si le chargement prend trop de temps.";
    filter.appendChild(disclaimer);

    masterVolume = window.localStorage.getItem('masterVolume') != null ? JSON.parse(window.localStorage.getItem('masterVolume')) : 1;
    musicVolume = window.localStorage.getItem('musicVolume') != null ? JSON.parse(window.localStorage.getItem('musicVolume')) : 1;
    sfxVolume = window.localStorage.getItem('sfxVolume') != null ? JSON.parse(window.localStorage.getItem('sfxVolume')) : 1;

    loadAssets(imgs, true);
    loadAssets(sounds, false);
}





/* ----------------------------------------------------- */
/* -------------------- Home screen -------------------- */
/* ----------------------------------------------------- */

function drawHomeScreen() {
    clearBody();
    document.body.style.backgroundImage = 'url("resources/ui/home-screen-bg.jpg")';

    let title = document.createElement('div');
    title.className = "home-screen-title";
    title.innerHTML = "Magic Battlegrounds";
    document.body.appendChild(title);

    let homeMenu = document.createElement('ul');
    homeMenu.className = "home-screen-menu";
    document.body.appendChild(homeMenu);

    let play = document.createElement('li');
    play.innerHTML = "Jouer";
    homeMenu.appendChild(play);
    play.onclick = () => {
        playMusic("resources/audio/sfx/page-turn.mp3", false);
        startGame();
    };

    let options = document.createElement('li');
    options.innerHTML = "Options";
    options.onclick = () => {
        playMusic("resources/audio/sfx/page-turn.mp3", false);
        toggleSettings();
    };
    homeMenu.appendChild(options);

    playMusic("resources/audio/music/home.mp3", true);
}



async function fadeTransition(interfaceBuilder) {
    let filter = document.createElement('div');
    filter.className = "filter-black";
    document.body.appendChild(filter);
    fadeOutMusic();
    await sleep(500);

    clearBody();
    interfaceBuilder();

    filter = document.createElement('div');
    filter.className = "filter-black";
    filter.style.animation = "fadeIn .5s ease reverse";
    document.body.appendChild(filter);
    await sleep(500);
    document.body.removeChild(filter);
}




/* ---------------------------------------------------- */
/* --------------------- Settings --------------------- */
/* ---------------------------------------------------- */

function toggleSettings() {
    if (document.getElementById('settings')) {
        document.body.removeChild(document.getElementById('settings'));
    } else {
        let filter = document.createElement('div');
        filter.id = "settings";
        document.body.appendChild(filter);

        let grid = document.createElement('div');
        filter.appendChild(grid);

        let masterVolumeOption = document.createElement('div');
        masterVolumeOption.className = "slider-option";
        grid.appendChild(masterVolumeOption);

        let masterVolumeSlider = document.createElement('input');
        masterVolumeSlider.type = "range";
        masterVolumeSlider.value = Math.round(masterVolume * 100);
        masterVolumeSlider.min = "0";
        masterVolumeSlider.max = "100";
        masterVolumeSlider.style.setProperty("--thumb-rotate", "0");
        masterVolumeSlider.oninput = () => {
            masterVolume = masterVolumeSlider.value / 100;
            masterVolumeSlider.style.setProperty("--thumb-rotate", (masterVolume * 720) + "deg");
            for (let a of document.getElementById("audios").children)
                if (a.loop)
                    a.volume = baseVolume * masterVolume * musicVolume;
                else
                    a.volume = baseVolume * masterVolume * sfxVolume;
            window.localStorage.setItem("masterVolume", masterVolume);
        };
        masterVolumeOption.appendChild(masterVolumeSlider);

        let masterVolumeLabel = document.createElement('div');
        masterVolumeLabel.innerHTML = "Volume général";
        masterVolumeOption.appendChild(masterVolumeLabel);

        let musicVolumeOption = document.createElement('div');
        musicVolumeOption.className = "slider-option";
        grid.appendChild(musicVolumeOption);

        let musicVolumeSlider = document.createElement('input');
        musicVolumeSlider.type = "range";
        musicVolumeSlider.value = Math.round(musicVolume * 100);
        musicVolumeSlider.min = "0";
        musicVolumeSlider.max = "100";
        musicVolumeSlider.style.setProperty("--thumb-rotate", "0");
        musicVolumeSlider.oninput = () => {
            musicVolume = musicVolumeSlider.value / 100;
            musicVolumeSlider.style.setProperty("--thumb-rotate", (musicVolume * 720) + "deg");
            for (let a of document.getElementById("audios").children)
                if (a.loop)
                    a.volume = baseVolume * masterVolume * musicVolume;
            window.localStorage.setItem("musicVolume", musicVolume);
        };
        musicVolumeOption.appendChild(musicVolumeSlider);

        let musicVolumeLabel = document.createElement('div');
        musicVolumeLabel.innerHTML = "Volume de la musique";
        musicVolumeOption.appendChild(musicVolumeLabel);

        let sfxVolumeOption = document.createElement('div');
        sfxVolumeOption.className = "slider-option";
        grid.appendChild(sfxVolumeOption);

        let sfxVolumeSlider = document.createElement('input');
        sfxVolumeSlider.type = "range";
        sfxVolumeSlider.value = Math.round(sfxVolume * 100);
        sfxVolumeSlider.min = "0";
        sfxVolumeSlider.max = "100";
        sfxVolumeSlider.style.setProperty("--thumb-rotate", "0");
        sfxVolumeSlider.oninput = () => {
            sfxVolume = sfxVolumeSlider.value / 100;
            sfxVolumeSlider.style.setProperty("--thumb-rotate", (sfxVolume * 720) + "deg");
            for (let a of document.getElementById("audios").children)
                if (!a.loop)
                    a.volume = baseVolume * masterVolume * sfxVolume;
            window.localStorage.setItem("sfxVolume", sfxVolume);
        };
        sfxVolumeOption.appendChild(sfxVolumeSlider);

        let sfxVolumeLabel = document.createElement('div');
        sfxVolumeLabel.innerHTML = "Volume des effets sonores";
        sfxVolumeOption.appendChild(sfxVolumeLabel);

        grid.appendChild(document.createElement('div'));

        let buttons = document.createElement('div');
        buttons.className = "buttons";
        grid.appendChild(buttons);

        let back = document.createElement('div');
        back.className = "button-option";
        back.innerHTML = "Retour";
        back.onclick = () => {
            playMusic("resources/audio/sfx/page-turn.mp3", false);
            toggleSettings();
        };
        buttons.appendChild(back);

        let home = document.createElement('div');
        home.className = "button-option";
        home.innerHTML = "Quitter";
        home.onclick = () => {
            playMusic("resources/audio/sfx/page-turn.mp3", false);
            fadeTransition(drawHomeScreen);
        };
        buttons.appendChild(home);
    }
}





/* ----------------------------------------------------- */
/* ----------------------- Music ----------------------- */
/* ----------------------------------------------------- */

let baseVolume = .65;
let masterVolume = 1;
let musicVolume = 1;
let sfxVolume = 1;

let shopMusics = ["resources/audio/music/tavern1.mp3", "resources/audio/music/tavern2.mp3", "resources/audio/music/tavern3.mp3"];
let battleMusics = ["resources/audio/music/battle1.mp3", "resources/audio/music/battle2.mp3", "resources/audio/music/battle3.mp3"];
let battleCries = {
    "Dragon": ["resources/audio/sfx/dragon1.mp3", "resources/audio/sfx/dragon2.mp3", "resources/audio/sfx/dragon3.mp3", "resources/audio/sfx/dragon4.mp3"],
    "Gobelin": ["resources/audio/sfx/gobelin1.mp3", "resources/audio/sfx/gobelin2.mp3", "resources/audio/sfx/gobelin3.mp3", "resources/audio/sfx/gobelin4.mp3"],
    "Sorcier": ["resources/audio/sfx/sorcier1.mp3", "resources/audio/sfx/sorcier2.mp3", "resources/audio/sfx/sorcier3.mp3", "resources/audio/sfx/sorcier4.mp3"],
    "Soldat": ["resources/audio/sfx/soldat1.mp3", "resources/audio/sfx/soldat2.mp3", "resources/audio/sfx/soldat3.mp3", "resources/audio/sfx/soldat4.mp3"],
    "Bandit": ["resources/audio/sfx/bandit1.mp3", "resources/audio/sfx/bandit2.mp3", "resources/audio/sfx/bandit3.mp3"],
    "Machine": ["resources/audio/sfx/machine1.mp3", "resources/audio/sfx/machine2.mp3", "resources/audio/sfx/machine3.mp3"],
    "Bête": ["resources/audio/sfx/bete1.mp3", "resources/audio/sfx/bete2.mp3", "resources/audio/sfx/bete3.mp3"],
    "Mort-Vivant": ["resources/audio/sfx/mort-vivant1.mp3", "resources/audio/sfx/mort-vivant2.mp3", "resources/audio/sfx/mort-vivant3.mp3"],
    "Sylvain": ["resources/audio/sfx/sylvain1.mp3", "resources/audio/sfx/sylvain2.mp3", "resources/audio/sfx/sylvain3.mp3", "resources/audio/sfx/sylvain4.mp3"],
    "Horde": ["resources/audio/sfx/horde1.mp3", "resources/audio/sfx/horde2.mp3", "resources/audio/sfx/horde3.mp3", "resources/audio/sfx/horde4.mp3"],
    "Démon": ["resources/audio/sfx/demon1.mp3", "resources/audio/sfx/demon2.mp3", "resources/audio/sfx/demon3.mp3"],
    "Elémentaire": [],
    "Autre": ["resources/audio/sfx/autre1.mp3"],
    "Sortilège": ["resources/audio/sfx/sortilege1.mp3"]
}

function playMusic(src, repeat) {
    let music = document.getElementById(src);
    if (music != undefined) {
        music.volume = baseVolume * masterVolume;
        if (repeat)
            music.volume *= musicVolume;
        else
            music.volume *= sfxVolume;
        music.currentTime = 0;
        music.loop = repeat;
        music.play();
        if (repeat)
            fadeInMusic();
    }
}

function fadeOutMusic() {
    var m;
    let audios = document.getElementById("audios").children;
    for (let a of audios) {
        if (a.loop && !a.paused)
            m = a;
    }
    if (m != undefined) {
        volume = m.volume;
        interval = setInterval(fadeOutMusicAux, 10);
    }
    function fadeOutMusicAux() {
        if (m == undefined)
            clearInterval(interval);

        var newVolume = m.volume - 0.04 * volume;
        if (newVolume > 0) {
            m.volume = newVolume;
        }
        else {
            clearInterval(interval);
            m.volume = 0;
            m.pause();
            m.currentTime = 0;
        }
    }
}

function fadeInMusic() {
    var m;
    let audios = document.getElementById("audios").children;
    for (let a of audios) {
        if (a.loop && !a.paused)
            m = a;
    }
    if (m != undefined) {
        m.volume = 0;
        volume = baseVolume * masterVolume * musicVolume;
        interval = setInterval(fadeInMusicAux, 15);
    }
    function fadeInMusicAux() {
        if (m == undefined)
            clearInterval(interval);

        var newVolume = m.volume + 0.04 * volume;
        if (newVolume < baseVolume * masterVolume * musicVolume) {
            m.volume = newVolume;
        }
        else {
            clearInterval(interval);
            m.volume = baseVolume * masterVolume * musicVolume;
        }
    }
}

function shuffleMusics() {
    shuffle(shopMusics);
    shuffle(battleMusics);
}

let currentShopMusic = 0;
let currentBattleMusic = 0;

function getNextMusic(category) {
    switch (category) {
        case "shop":
            return shopMusics[currentShopMusic++ % shopMusics.length];
        case "battle":
            return battleMusics[currentBattleMusic++ % battleMusics.length];
        default:
            return "";
    }
}





/* ------------------------------------------------------ */
/* --------------------- Start game --------------------- */
/* ------------------------------------------------------ */

let shopTier = 1;
let shopSize = [0, 3, 3, 4, 4, 5, 5];
let coins = 0;
let players = [];
let lastDead;
let troops = [];
let round = 0;
let discountedRefreshes = 0;
let currentScene;
let enemyFamilies = [];

async function startGame() {
    await fadeTransition(() => {
        initCards();
        shopTier = 1; //!!!
        round = 1;
        coins = 3; //!!!
        players = [];
        for (let i = 0; i < 8; i++) {
            lastFights.push([]);
            for (let j = 0; j < 8; j++)
                lastFights[i].push(i == j ? -1 : 0);
        }
        lastDead = -1;
        lastResult = 0;
        troops = [];
        for (let i = 0; i < 8; i++) {
            troops.push([]);
            for (let j = 0; j < 8; j++)
                troops[i].push(undefined);
        }
        discountedRefreshes = 0;
        enemyFamilies = [undefined];

        let heroSelector1 = drawCard(commanders[0], 270);
        heroSelector1.className += " hero-selector hero-selector1";
        heroSelector1.id = "heroSelector1";
        heroSelector1.onclick = () => { selectHero(1); };
        document.body.appendChild(heroSelector1);
        fitDescription(heroSelector1);

        let heroSelector2 = drawCard(commanders[1], 270);
        heroSelector2.className += " hero-selector hero-selector2";
        heroSelector2.id = "heroSelector2";
        heroSelector2.onclick = () => { selectHero(2); };
        document.body.appendChild(heroSelector2);
        fitDescription(heroSelector2);

        let heroSelector3 = drawCard(commanders[2], 270);
        heroSelector3.className += " hero-selector hero-selector3";
        heroSelector3.id = "heroSelector3";
        heroSelector3.onclick = () => { selectHero(3); };
        document.body.appendChild(heroSelector3);
        fitDescription(heroSelector3);

        document.body.style.backgroundImage = 'url("resources/ui/team-builder-bg.jpg")';

        let banner = document.createElement('div');
        banner.className = "choose-banner";
        banner.id = "choose-banner";
        banner.innerHTML = "Choisissez votre commandant";
        document.body.appendChild(banner);

        let families = document.createElement('div');
        families.className = "families-banner";
        families.id = "families-banner";
        let innerText = "Familles de cartes dans cette partie :</br>";
        for (let s of species)
            innerText += s + ", ";
        families.innerHTML = innerText.substring(0, innerText.length - 2);
        document.body.appendChild(families);

        let settings = document.createElement('div');
        settings.className ="settings-button";
        settings.onclick = toggleSettings;
        document.body.appendChild(settings);

        shuffleMusics();
        playMusic(getNextMusic("shop"), true);
    });
}

async function selectHero(n) {
    let selected;

    for (let i = 1; i <= 3; i++) {
        selected = document.getElementById("heroSelector" + i);
        selected.onclick = () => { };
        if (i != n) {
            selected.style.animation = "fadeIn .6s ease reverse";
            setTimeout(() => {
                document.body.removeChild(document.getElementById("heroSelector" + i));
            }, 600);
        } else {
            setTimeout(() => {
                selected = document.getElementById("heroSelector" + i);
                selected.className += " selected-commander";
                players[0] = selected.card;
                for (let i = 3; i < 10; i++)
                    players[i - 2] = commanders[i];
                for (let i = 1; i < 8; i++) {
                    if (players[i].requirement)
                        enemyFamilies[i] = players[i].requirement;
                    else
                        enemyFamilies[i] = choice(species);

                    if (players[i].effects.findIndex(e => e.id == 12) != -1)
                        troops[i][0] = new ScionAspirame();
                    if (players[i].effects.findIndex(e => e.id == 22) != -1)
                        troops[i][0] = new CoeurDeLAbysse();
                }
            }, 600);
        }
    }

    setTimeout(() => {
        selected = document.getElementById("heroSelector" + n);
        selected.className = "card commander";
        selected.id = "commander";

        document.getElementById("choose-banner").style.opacity = "0";
        document.getElementById("families-banner").style.opacity = "0";
        setTimeout(() => {
            document.body.removeChild(document.getElementById("choose-banner"));
            document.body.removeChild(document.getElementById("families-banner"));
        }, 600);
    }, 3000);

    setTimeout(async () => {
        let board = document.createElement('div');
        board.className = "board";
        board.id = "board";
        document.body.appendChild(board);
        for (let i = 0; i < 8; i++) {
            let position = document.createElement('div');
            position.name = "position";
            position.addEventListener('dragover', dragOver);
            position.addEventListener('drop', dragDrop);
            board.appendChild(position);
        }

        let shop = document.createElement('div');
        shop.className = "shop";
        shop.id = "shop";
        shop.style.setProperty("--shop-size", shopSize[shopTier]);
        document.body.appendChild(shop);
        shop.appendChild(document.createElement('div'));
        shop.appendChild(document.createElement('div'));
        for (let i = 0; i < shopSize[shopTier]; i++) {
            let c = drawCard(getCard(shopTier), 176);
            if (coins >= 3) {
                c.draggable = true;
                c.addEventListener('dragstart', dragStart);
                c.addEventListener('dragend', dragEnd);
            }
            shop.appendChild(c);
            fitDescription(c);
        }
        shop.addEventListener('dragover', dragOver);
        shop.addEventListener('drop', dragDrop);

        let freeze = document.createElement('div');
        freeze.className = "freeze";
        freeze.id = "freeze";
        document.body.appendChild(freeze);
        let freezeIcon = document.createElement('img');
        freezeIcon.src = "./resources/ui/freeze.png";
        freezeIcon.alt = "";
        freeze.appendChild(freezeIcon);
        freeze.onclick = freezeShop;

        let refresh = document.createElement('div');
        refresh.className = "refresh";
        refresh.id = "refresh";
        document.body.appendChild(refresh);
        let refreshIcon = document.createElement('img');
        refreshIcon.src = "./resources/ui/search.png";
        refreshIcon.alt = "";
        refresh.appendChild(refreshIcon);
        refresh.onclick = () => refreshShop(false);

        let money = document.createElement('div');
        money.className = "money";
        money.id = "money";
        document.body.appendChild(money);
        let moneyIcon = document.createElement('img');
        moneyIcon.src = "./resources/ui/coin.png";
        moneyIcon.alt = "";
        money.appendChild(moneyIcon);
        let moneyVal = document.createElement('div');
        moneyVal.innerHTML = coins;
        moneyVal.id = "moneyVal";
        money.appendChild(moneyVal);

        let tier = document.createElement('div');
        tier.className = "shop-tier";
        tier.id = "shop-tier";
        document.body.appendChild(tier);
        let tierVal = document.createElement('div');
        tierVal.innerHTML = shopTier;
        tier.appendChild(tierVal);

        let hand = document.createElement('div');
        hand.className = "hand";
        hand.id = "hand-area";
        document.body.appendChild(hand);
        hand.addEventListener('dragover', dragOver);
        hand.addEventListener('drop', dragDrop);
        let handGrid = document.createElement('div');
        handGrid.id = "hand";
        hand.appendChild(handGrid);

        let playersDiv = document.createElement('div');
        playersDiv.className = "players";
        playersDiv.id = "players";
        document.body.appendChild(playersDiv);
        drawPlayers();

        let fight = document.createElement('div');
        fight.className = "fight";
        fight.id = "fight";
        document.body.appendChild(fight);
        let fightIcon = document.createElement('img');
        fightIcon.src = "./resources/ui/fight.png";
        fightIcon.alt = "";
        fight.appendChild(fightIcon);
        fight.onclick = async () => await startBattle();

        let filter = document.createElement('div');
        filter.className = "filter";
        filter.style.display = "none";
        filter.id = "cover-filter";
        document.body.appendChild(filter);

        let spellArea = document.createElement('div');
        spellArea.className = "spell-area";
        spellArea.id = "spell-area";
        spellArea.addEventListener('dragover', dragOver);
        spellArea.addEventListener('drop', dragDrop);
        document.body.appendChild(spellArea);

        /***********************************/

        let battleBG = document.createElement('div');
        battleBG.className = "background";
        battleBG.id = "battle-bg";
        battleBG.style.opacity = "0";
        document.body.appendChild(battleBG);

        let enemyBoard = document.createElement('div');
        enemyBoard.className = "board";
        enemyBoard.id = "enemy-board";
        enemyBoard.style.left = "430px";
        enemyBoard.style.top = "-363px";
        document.body.appendChild(enemyBoard);
        for (let i = 0; i < 8; i++)
            enemyBoard.appendChild(document.createElement('div'));

        let enemyCommander = document.createElement('div');
        enemyCommander.className = "enemy-commander";
        enemyCommander.id = "enemy-commander";
        document.body.appendChild(enemyCommander);



        currentScene = "shop";

        await broadcastShopEvent("game-start", []);
        await broadcastShopEvent("turn-start", []);
    }, 4000);
}

function drawPlayers() {
    let playersDiv = document.getElementById("players");
    playersDiv.innerHTML = "";
    let players2 = copy(players);
    players2.sort((a, b) => { if (a.hp > b.hp) return -1; else if (a.hp < b.hp) return 1; else return 0; });
    let changedDead = false;
    for (let p of players2) {
        let c = drawSmallCard(p, 100);
        if (c.card.hp <= 0) {
            c.style.filter = "grayscale()";
            if (!changedDead) {
                lastDead = players.findIndex(e => e.name == p.name);
                changedDead = true;
            }
            players[players.findIndex(e => e.name == p.name)].hp -= 50;
        }
        playersDiv.appendChild(c);
    }
}

async function refreshShop(auto, requiredSpecies) {
    let refresh = document.getElementById("refresh");
    if (coins >= 1 || auto || discountedRefreshes > 0) {
        if (!auto) {
            if (discountedRefreshes == 0)
                await spendCoins(1, false);
            else {
                discountedRefreshes--;
                if (discountedRefreshes == 0)
                    refresh.style.removeProperty("box-shadow");
            }
        }
        let shop = document.getElementById("shop");
        for (let i = 0; i < shop.children.length; i++) {
            let c = shop.children[i];
            if (c.classList.contains("card"))
                c.style.animation = "flip1 .15s ease forwards";
        }
        setTimeout(async () => {
            let nChildren = shop.children.length;
            let getDemons = effect10006active();
            for (let i = 0; i < parseInt(shop.style.getPropertyValue("--shop-size")); i++)
                if (!auto || !shop.children[nChildren - 1 - i].classList.contains("frozen"))
                    shop.removeChild(shop.children[nChildren - 1 - i]);
            shop.style.setProperty("--shop-size", shopSize[shopTier]);
            nChildren = shop.children.length;
            for (let i = 2; i < nChildren; i++) {
                shop.children[i].classList.remove("frozen");
                shop.children[i].style.animation = "none";
            }
            for (let i = 0; i < parseInt(shop.style.getPropertyValue("--shop-size")) - nChildren + 2; i++) {
                let c = drawCard(getCard(shopTier, requiredSpecies), 176);
                if (getDemons && c.card.species !== "Démon" && Math.random() < .08)
                    c = drawCard(getCard(shopTier, "Démon"), 176);
                c.style.animation = "flip2 .15s ease forwards";
                if (coins >= 3) {
                    c.draggable = true;
                    c.addEventListener('dragstart', dragStart);
                    c.addEventListener('dragend', dragEnd);
                }
                shop.appendChild(c);
                fitDescription(c);
                setTimeout(() => {
                    c.style.removeProperty("animation");
                }, 150);
            }
        }, 150);
        if (!auto)
            setTimeout(async () => {
                await broadcastShopEvent("shop-refresh", []);
            }, 300);
    } else {
        refresh.style.boxShadow = "0 0 10px red";
        refresh.style.animation = "flicker .3s linear forwards";
        setTimeout(() => {
            let refresh = document.getElementById("refresh");
            refresh.style.removeProperty("box-shadow");
            refresh.style.animation = "none";
        }, 500);
    }
}

function freezeShop() {
    let freeze = false;
    for (let c of shop.children)
        freeze = freeze || (c.classList.contains("card") && !c.classList.contains("frozen"));
    for (let c of shop.children) {
        if (c.classList.contains("card") && freeze)
            c.className += " frozen";
        else
            c.classList.remove("frozen");
    }
}

async function buyCard(c, free) {
    if (!free && coins < 3)
        return;
    if (!free) {
        playMusic("resources/audio/sfx/pieces.mp3", false);
        await spendCoins(3, false);
    }
    let shop = document.getElementById("shop");
    shop.removeChild(c);
    shop.style.setProperty("--shop-size", parseInt(shop.style.getPropertyValue("--shop-size")) - 1);
    addToHand(c);
    if (!free)
        await broadcastShopEvent("card-buy", [c]);
}

let cardSold;

async function sellCard(c) {
    let area = c.parentNode.parentNode.classList.contains("board") ? "board" : "hand";
    cardSold = c;

    c.parentNode.removeChild(c);
    playMusic("resources/audio/sfx/pieces.mp3", false);
    await spendCoins(-1, false);

    updateTroops();

    await broadcastShopEvent("card-sell", [c, area]);
}

async function addToHand(c) {
    if (document.getElementById("hand").children.length < 6) {
        document.getElementById("hand").appendChild(c);
        c.draggable = true;
        c.addEventListener('dragstart', dragStart);
        c.addEventListener('dragend', dragEnd);
        c.classList.remove("frozen");
        fitDescription(c);
        await broadcastShopEvent("card-obtain", [c]);
    }
}

async function placeCard(spot, c) {
    let card = drawSmallCard(c.card, 200);
    card.draggable = true;
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
    spot.appendChild(card);
    document.getElementById("hand").removeChild(c);

    playMusic(choice(battleCries[c.card.species]), false);

    updateTroops();

    await broadcastShopEvent("card-place", [c]);
}

async function summonCard(c) {
    let card = drawSmallCard(c, 200);
    let spot;
    for (let d of document.getElementById("board").children)
        if (!d.children[0]) {
            spot = d;
            break;
        }

    if (spot) {
        card.draggable = true;
        card.addEventListener('dragstart', dragStart);
        card.addEventListener('dragend', dragEnd);
        spot.appendChild(card);

        updateTroops();

        await sleep(500);

        await broadcastShopEvent("card-summon", [c]);
    }
}

async function moveCard(spot, c) {
    let source = c.parentNode;
    source.removeChild(c);
    if (spot.children.length > 0) {
        source.appendChild(spot.children[0]);
    }
    spot.appendChild(c);

    updateTroops();
}

async function spendCoins(n, auto) {
    coins -= n;
    document.getElementById("moneyVal").innerHTML = coins;
    for (let c of document.getElementById("shop").children) {
        if (c.classList.contains("card")) {
            if (coins >= 3) {
                c.draggable = true;
                c.addEventListener('dragstart', dragStart);
                c.addEventListener('dragend', dragEnd);
            } else {
                c.draggable = false;
            }
        }
    }
    if (!auto)
        await broadcastShopEvent("coin-change", [n]);
}

async function updateTroops() {
    let board = document.getElementById("board");
    for (let i = 0; i < 8; i++) {
        if (board.children[i].children[0]) {
            troops[0][i] = board.children[i].children[0].card;
        } else {
            troops[0][i] = undefined;
        }
    }
}

async function increaseShopTier() {
    if (shopTier < 6) {
        shopTier++;
        document.getElementById("shop-tier").children[0].innerHTML = shopTier;
        await sleep(1000);

        let banner = document.createElement('div');
        banner.className = "shop-banner";
        banner.id = "shop-banner";
        banner.innerHTML = "Recrutement amélioré";
        document.body.appendChild(banner);
        setTimeout(() => {
            document.body.removeChild(document.getElementById("shop-banner"));
        }, 3000);
    }
}

let animating = 0;

async function broadcastShopEvent(name, args) {
    console.log("Broadcasting event " + name);
    animating++;
    clearTimeout(menuLeaveTimer);
    document.getElementById("cover-filter").style.removeProperty("display");
    await sleep(1)
    hideCardTooltip();

    if (name == "card-sell")
        await consumeEvent(cardSold.card, name, args, true);
    for (let d of document.getElementById("board").children)
        if (d.children[0])
            await consumeEvent(d.children[0].card, name, args, true);
    await consumeEvent(document.getElementById("commander").card, name, args, true);
    for (let c of document.getElementById("hand").children)
        await consumeEvent(c.card, name, args, true);
    for (let c of document.getElementById("shop").children)
        if (c.classList.contains("card"))
            await consumeEvent(c.card, name, args, true);
    animating--;
    if (animating == 0)
        document.getElementById("cover-filter").style.display = "none";
}

async function consumeEvent(c, name, args, doAnimate) {
    for (let e of copy(c.effects)) {
        if (e.trigger == name)
            await resolveEvent(e.id, c, args, doAnimate);
    }
}





let dragItem = undefined;

function dragStart() {
    dragItem = this;
    hideCardTooltip();
    clearTimeout(menuLeaveTimer);
    setTimeout(() => {
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
    });

    if (this.card && this.card.species == "Sortilège" && this.card.validTarget.area == "any")
        document.getElementById("spell-area").style.pointerEvents = "all";
}

function dragEnd() {
    dragItem = undefined;
    clearTimeout(menuLeaveTimer);
    setTimeout(() => {
        this.style.removeProperty("opacity");
        this.style.removeProperty("pointer-events");
    });

    document.getElementById("spell-area").style.removeProperty("pointer-events");
}

async function dragDrop() {
    let card = dragItem;
    dragItem = undefined;
    if (document.getElementById("hand").contains(card) && this.className === "spell-area" && card.card.species == "Sortilège" && card.card.validTarget.area === "any")
        playSpell(card, undefined);
    else if (document.getElementById("shop").contains(card) && this.className === "hand" && this.children[0].children.length < 6)
        buyCard(card);
    else if (!document.getElementById("shop").contains(card) && this.className === "shop")
        sellCard(card);
    else if (document.getElementById("hand").contains(card) && this.name === "position" && this.children.length === 0 && card.card.species !== "Sortilège")
        placeCard(this, card);
    else if (card.classList.contains("small-card") && this.name === "position")
        moveCard(this, card);
    else if (document.getElementById("hand").contains(card) && this.name === "position" && this.children[0] && card.card.species === "Sortilège" && canPlaySpell(card.card, this.children[0].card, "board"))
        playSpell(card, this.children[0]);
    else if (document.getElementById("hand").contains(card) && this.name === "position" && this.children[0] && card.card.effects.findIndex(e => e.id == 2008) != -1 && this.children[0].card.effects.findIndex(e => e.id == 2008) != -1) {
        boostStats(this.children[0].card, card.card.attack, card.card.hp, true);
        card.parentElement.removeChild(card);
    }
}

function dragOver(e) {
    e.preventDefault();
}

function canPlaySpell(card, target, area) {
    let cond = card.validTarget;
    if (!cond.area && !cond.species)
        return false;
    if (cond.area && cond.area != area)
        return false;
    if (cond.species && cond.species != target.species)
        return false;
    return true;
}

async function playSpell(c, t) {
    if (c.parentElement)
        c.parentElement.removeChild(c);
    playMusic(choice(battleCries["Sortilège"]), false);
    for (let e of c.card.effects)
        await createEffect(e.id).run(c.card, [t], true);

    await broadcastShopEvent("spell-play", [c.card, t ? t.card : undefined]);
}













/* ------------------------------------------------------ */
/* ----------------------- Battle ----------------------- */
/* ------------------------------------------------------ */

let lastFights = [];
let nextFights = [];
let lastResult = 0;

async function startBattle() {
    if (animating == 0) {
        playMusic("resources/audio/sfx/battle.mp3", false);

        await sleep(800);

        await broadcastShopEvent("turn-end", []);

        matchmaking();

        updateEnemyTroops();

        for (let m of nextFights)
            await runBattle(m[0], m[1], m.includes(0));
    }
}

function matchmaking() {
    let remaining = [];
    for (let i = 0; i < 8; i++) {
        if (players[i].hp > 0)
            remaining.push(i);
    }
    if (remaining.length % 2 != 0)
        remaining.push(lastDead);

    nextFights = [];
    let left = copy(remaining);
    for (let n = 0; n < remaining.length / 2; n++) {
        let max = 0;
        let pair = [0, 1];
        for (let i of left) {
            for (let j of left) {
                if (lastFights[i][j] >= max) {
                    pair = [i, j];
                    max = lastFights[i][j];
                }
            }
        }
        nextFights.push(pair);
        removeArr(left, pair[0]);
        removeArr(left, pair[1]);
        lastFights[pair[0]][pair[1]] = -1;
        lastFights[pair[1]][pair[0]] = -1;
    }
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (i != j) {
                lastFights[i][j]++;
            }
        }
    }
}

function updateEnemyTroops() {
    let budget;
    for (let i = 1; i < 8; i++) {
        let t = troops[i];
        for (let c of t) {
            if (c) {
                for (let e of c.effects) {
                    let scaling = createEffect(e.id).scaling(c, t.filter(e => e));
                    for (let k = 0; k < scaling[0] * 2/3 * (1 + round / 15); k++) {
                        if (Math.random() < .5)
                            boostStats(c, 0, 1, false);
                        else
                        boostStats(c, 1, 0, false);
                    }
                    if (t.indexOf(undefined) == -1) {
                        for (let k = 0; k < scaling[1] * 2/3 * (1 + round / 15); k++) {
                            if (Math.random() < .5)
                                boostStats(choice(t.filter(e => e)), 0, 1, false);
                            else
                                boostStats(choice(t.filter(e => e)), 1, 0, false);
                        }
                    }
                }
            }
        }
        for (let e of players[i].effects) {
            let scaling = createEffect(e.id).scaling(players[i], t.filter(e => e));
            if (t.indexOf(undefined) == -1) {
                for (let k = 0; k < scaling[1] * 2/3 * (1 + round / 15); k++) {
                    if (Math.random() < .5)
                        boostStats(choice(t.filter(e => e)), 0, 1, false);
                    else
                        boostStats(choice(t.filter(e => e)), 1, 0, false);
                }
            }
        }
        let players2 = copy(players).sort((a, b) => { if (a.hp > b.hp) return -1; else if (a.hp < b.hp) return 1; else return 0; });
        if (players2.findIndex(e => e.name === players[i].name) > 3 && round > 3) {
            if (t.indexOf(undefined) == -1) {
                for (let k = 0; k < round; k++) {
                    if (Math.random() < .5)
                        boostStats(choice(t.filter(e => e)), 0, 1, false);
                    else
                        boostStats(choice(t.filter(e => e)), 1, 0, false);
                }
            }
        }

        budget = Math.min(10, round + 2 - (Math.random() < .7 && round > 1));
        while (budget >= 3) {
            let options = [];
            for (let k = 0; k < 4; k++)
                options.push(getCard(shopTier));
            let newCard = getMostInteresting(options, t, enemyFamilies[i]);
            let oldCard = getLeastUseful(t, enemyFamilies[i]);
            if (getValue(newCard, t, false, enemyFamilies[i]) > getValue(oldCard, t, false, enemyFamilies[i])) {
                t[t.indexOf(oldCard)] = newCard;
                if (newCard.use)
                    newCard.use(t);
                
                    for (let e of newCard.effects) {
                        let scaling = createEffect(e.id).scaling(newCard, t.filter(e => e));
                        for (let k = 0; k < scaling[2]; k++) {
                            if (Math.random() < .5)
                                boostStats(newCard, 0, 1, false);
                            else
                            boostStats(newCard, 1, 0, false);
                        }
                        if (choice(t)) {
                            for (let k = 0; k < scaling[3]; k++) {
                                if (Math.random() < .5)
                                    boostStats(choice(t.filter(e => e)), 0, 1, false);
                                else
                                    boostStats(choice(t.filter(e => e)), 1, 0, false);
                            }
                        }
                    }
            }
            budget -= 3;
        }

        arrangeEnemyTroops(t);
    }
}

function getLeastUseful(t, targetFamily) {
    let min = 99999999;
    let res = undefined;
    let value;
    for (let c of t) {
        value = 0;
        if (c) {
            value = getValue(c, t, true, targetFamily);

            if (value < min) {
                min = value;
                res = c;
            }
        } else {
            return c;
        }
    }
    return res;
}

function getMostInteresting(options, t, targetFamily) {
    let max = -99999999;
    let res;
    let value;
    for (let c of options) {
        if (c && c.species !== "Sortilège") {
            value = getValue(c, t, false, targetFamily);

            if (value > max && t.filter(e => e && e.name === c.name).length < 3) {
                max = value;
                res = c;
            }
        }
    }
    while (!res || res.species === "Sortilège")
        res = getCard(1);
    return res;
}

function getValue(c, t, placed, targetFamily) {
    let value = 0;
    if (c && c.species !== "Sortilège") {
        value += c.hp;
        value += c.attack;
        if (c.shield)
            value += c.attack / 2;
        if (c.revive)
            value += c.attack / 2;
        if (c.range)
            value += c.attack / 8;
        if (c.deathtouch)
            value += c.hp / 2 + 60;
        value += getScaling(c, t, placed);
        value += getBattleEffectValue(c, t);
        if (c.species === targetFamily)
            value *= 2;
    }
    return value;
}

function getScaling(c, t, placed) {
    let n = 0;
    let scaling;
    for (let e of c.effects) {
        scaling = createEffect(e.id).scaling(c, t.filter(e => e));
        n += (scaling[0] + scaling[1]) * 3;
        if (!placed)
            n += scaling[2] + scaling[3];
    }
    return n;
}

function getBattleEffectValue(c, t) {
    let n = 0;
    for (let e of c.effects)
        n += createEffect(e.id).battleValue(c, t.filter(e => e));
    return n;
}

function arrangeEnemyTroops(t) {
    t.sort((a, b) => {
        if (toFront(a) && !toFront(b))
            return -1;
        else if (toFront(b) && !toFront(a))
            return 1;
        else if (toBack(a) && !toBack(b))
            return 1;
        else if (toBack(b) && !toBack(a))
            return -1;
        else
            return (a.hp + a.attack > b.hp + b.attack);
    });
}

function toFront(c) {
    for (let e of c.effects) {
        if (createEffect(e.id).toFront)
            return true;
    }
    return false;
}

function toBack(c) {
    for (let e of c.effects) {
        if (createEffect(e.id).toBack)
            return true;
    }
    return false;
}

async function runBattle(p1, p2, doAnimate) {
    if (p2 == 0) {
        p2 = p1;
        p1 = 0;
    }

    t1 = prepareTroops(p1);
    t2 = prepareTroops(p2);

    let turn = p1.hp > p2.hp;
    if (p1.hp == p2.hp)
        turn = Math.random() < .5;

    if (doAnimate)
        await drawBattleScene(t1, t2, p1 == 0 ? p2 : p1);

    for (let c of t1[0].concat(t1[1]))
        if (c && c.reputation > 0) {
            for (let i = 0; i < Math.min(c.reputation, 8); i++)
                if (Math.random() < .5)
                    boostStats(c, 0, 1, false);
                else
                    boostStats(c, 1, 0, false);
            await boostStats(c, 0, 0, doAnimate);
        }
    for (let c of t2[0].concat(t2[1]))
        if (c && c.reputation > 0) {
            for (let i = 0; i < Math.min(c.reputation, 8); i++)
                if (Math.random() < .5)
                    boostStats(c, 0, 1, false);
                else
                    boostStats(c, 1, 0, false);
            await boostStats(c, 0, 0, doAnimate);
        }

    await broadcastEvent("battle-start", t1, t2, p1, p2, turn, doAnimate, [t1, t2, p1, p2, turn]);

    await repositionTroops(t1, t2, doAnimate);

    let finish = getWinner(t1, t2);
    let nTurn = 0;
    while (finish == 0 && nTurn < 2000) {
        await attack(t1, t2, p1, p2, turn, doAnimate);
        nTurn++;
        turn = !turn;
        finish = getWinner(t1, t2);
    }
    if (nTurn == 2000)
        alert("!!!!!!!!!!!!!!!")

    if (finish == 1)
        console.log(p1 + " won against " + p2);
    else if (finish == 2)
        console.log(p2 + " won against " + p1);
    else
        console.log(p1 + " and " + p2 + " tied");
    await dealHeroDamage(finish, t1, t2, p1, p2, doAnimate);

    if (finish == 1 || finish == 3)
        for (let c of troops[p1])
            if (c && c.reputation != undefined)
                c.reputation++;
    if (finish == 2 || finish == 3)
        for (let c of troops[p2])
            if (c && c.reputation != undefined)
                c.reputation++;

    if (p1 == 0)
        lastResult = finish;

    if (doAnimate)
        drawShopScene();
}

async function repositionTroops(t1, t2, doAnimate, args) {
    let board = document.getElementById("board");
    for (let i = 0; i < 4; i++) {
        if (!t1[0][i] && t1[1][i]) {
            t1[0][i] = t1[1][i];
            t1[1][i] = undefined;

            if (doAnimate) {
                board.children[4 + i].children[0].style.transform = "translateY(-189px)";
                await sleep(500);
                board.children[4 + i].innerHTML = "";
                let c = drawSmallCard(t1[0][i], 200);
                c.style.animation = "none";
                board.children[i].appendChild(c);
                await sleep(250);
            }
            if (args)
                await broadcastEvent("reposition", args[0], args[1], args[2], args[3], args[4], doAnimate, [t1[0][i]].concat(args));
        }
    }

    board = document.getElementById("enemy-board");
    for (let i = 0; i < 4; i++) {
        if (!t2[0][i] && t2[1][i]) {
            t2[0][i] = t2[1][i];
            t2[1][i] = undefined;

            if (doAnimate) {
                board.children[i].children[0].style.transform = "translateY(189px)";
                board.children[i].style.setProperty("z-index", "15");
                await sleep(500);
                board.children[i].innerHTML = "";
                board.children[i].style.removeProperty("z-index");
                let c = drawSmallCard(t2[0][i], 200);
                c.style.animation = "none";
                board.children[4 + i].appendChild(c);
                await sleep(250);
            }
            if (args)
                await broadcastEvent("reposition", args[0], args[1], args[2], args[3], args[4], doAnimate, [t2[0][i]].concat(args));
        }
    }
}

async function swapPositions(i, t, doAnimate, args) {
    if (doAnimate) {
        let c0 = findCardPos(t[0][i]).children[0];
        let c1 = findCardPos(t[1][i]).children[0];
        let top = false;
        for (let d of document.getElementById("enemy-board").children)
            if (d.children[0] && d.children[0] == c0)
                top = true;
        if (!top) {
            c0 = findCardPos(t[1][i]).children[0];
            c1 = findCardPos(t[0][i]).children[0];
        }
        let nc0 = drawSmallCard(c0.card, 200);
        let nc1 = drawSmallCard(c1.card, 200);
        document.body.appendChild(nc0);
        document.body.appendChild(nc1);
        nc0.style.position = "absolute";
        nc0.style.top = c0.getBoundingClientRect().top + "px";
        nc0.style.left = c0.getBoundingClientRect().left + "px";
        nc0.style.animation = "none";
        nc0.style.zIndex = 15;
        nc1.style.position = "absolute";
        nc1.style.top = c1.getBoundingClientRect().top + "px";
        nc1.style.left = c1.getBoundingClientRect().left + "px";
        nc1.style.animation = "none";
        nc1.style.zIndex = 15;
        nc0.style.transform = "translateY(-189px)";
        nc1.style.transform = "translateY(189px)";
        let parent0 = c0.parentElement;
        let parent1 = c1.parentElement;
        c0.parentElement.removeChild(c0);
        c1.parentElement.removeChild(c1);
        await sleep(500);
        document.body.removeChild(nc0);
        document.body.removeChild(nc1);
        let card0 = nc0.card;
        let card1 = nc1.card;
        let c = drawSmallCard(card1, 200);
        c.style.animation = "none";
        parent0.innerHTML = "";
        parent0.appendChild(c);
        c = drawSmallCard(card0, 200);
        c.style.animation = "none";
        parent1.innerHTML = "";
        parent1.appendChild(c);
    }
    let temp = t[0][i];
    t[0][i] = t[1][i];
    t[1][i] = temp;
    await broadcastEvent("reposition", args[0], args[1], args[2], args[3], args[4], doAnimate, [t[0][i]].concat(args));
    await broadcastEvent("reposition", args[0], args[1], args[2], args[3], args[4], doAnimate, [t[1][i]].concat(args));
}

async function pushBack(i, t, doAnimate, args) {
    if (doAnimate) {
        let c0 = findCardPos(t[0][i]).children[0];
        let top = false;
        for (let d of document.getElementById("enemy-board").children)
            if (d.children[0] && d.children[0] == c0)
                top = true;
        let board = document.getElementById(top ? "enemy-board" : "board");
        let d = findCardPos(t[0][i]);
        d.children[0].style.transform = top ? "translateY(-189px)" : "translateY(189px)";
        d.style.zIndex = "5";
        await sleep(500);
        d.innerHTML = "";
        d.style.removeProperty("z-index");
        let c = drawSmallCard(t[0][i], 200);
        c.style.animation = "none";
        board.children[i + 4 * (!top)].appendChild(c);
    }

    t[1][i] = t[0][i];
    t[0][i] = undefined;
    await broadcastEvent("reposition", args[0], args[1], args[2], args[3], args[4], doAnimate, [t1[1][i]].concat(args));
}

async function attack(t1, t2, p1, p2, turn, doAnimate, defaultAttacker, defaultAttacked) {
    let attacker = defaultAttacker ? defaultAttacker : pickAttacker(t1, t2, turn);
    let o = findCardPos(attacker);
    if (doAnimate) {
        o.classList.add("attacking");
        o.parentElement.style.zIndex = "10";
        await sleep(500);
    }
    let attacked = defaultAttacked ? defaultAttacked : pickTarget(t1, t2, turn, attacker.range);

    await broadcastEvent("attack", t1, t2, p1, p2, turn, doAnimate, [attacker, attacked, t1, t2, p1, p2, turn]);
    await broadcastEvent("attacked", t1, t2, p1, p2, turn, doAnimate, [attacked, attacker, t1, t2, p1, p2, turn]);

    let doAttack = attacker.hp > 0 && attacked.hp > 0;
    let s1;
    let s2;
    let d1;
    let d2;
    if (doAttack) {
        if (doAnimate) {
            let or = o.getBoundingClientRect();
            let t = findCardPos(attacked);
            let tr = t.getBoundingClientRect();
            let dx = Math.floor(tr.left - or.left - o.clientWidth / 20);
            let dy = Math.floor(tr.top < or.top ? tr.bottom - or.top : tr.top - or.bottom);
            o.style.transition = ".2s";
            o.style.transform = "translate(" + dx + "px, " + dy + "px)";
            await sleep(200);
        }


        d1 = (attacker.deathtouch && attacker.attack > 0) ? attacked.hp : attacker.attack;
        d2 = (attacked.deathtouch && attacked.attack > 0) ? attacker.hp : attacked.attack;
        s1 = attacked.shield;
        s2 = attacker.shield;
        if (!s1)
            attacked.hp -= d1;
        else
            attacked.shield = false;
        if (!s2)
            attacker.hp -= d2;
        else
            attacker.shield = false;

        if (doAnimate) {
            updateCardStats(findCardPos(attacker).children[0]);
            updateCardStats(findCardPos(attacked).children[0]);
            playMusic("resources/audio/sfx/impact.mp3", false);
        }

        if (doAnimate) {
            o.style.removeProperty("transform");
            await sleep(200);
            o.style.removeProperty("transition");
        }
    }

    if (doAnimate) {
        o.classList.remove("attacking");
        o.parentElement.style.removeProperty("z-index");
        await sleep(500);
    }

    if (doAttack) {
        if (!s1)
            await broadcastEvent("tookdamage", t1, t2, p1, p2, turn, doAnimate, [attacked, d1, t1, t2, p1, p2, t1[0].concat(t1[1]).includes(attacked)]);
        if (!s2)
            await broadcastEvent("tookdamage", t1, t2, p1, p2, turn, doAnimate, [attacker, d2, t1, t2, p1, p2, t1[0].concat(t1[1]).includes(attacker)]);
    }
}

function findCardPos(c) {
    for (let d of document.getElementById("board").children) {
        if (d.children[0] && d.children[0].card == c)
            return d;
    }
    for (let d of document.getElementById("enemy-board").children) {
        if (d.children[0] && d.children[0].card == c)
            return d;
    }
}

async function broadcastEvent(name, t1, t2, p1, p2, turn, doAnimate, args) {
    if (doAnimate) {
        hideCardTooltip();
        clearTimeout(menuLeaveTimer);
        await sleep(1);
    }

    console.log("Broadcasting event " + name);
    if (turn) {
        await consumeEvent(players[p1], name, args, doAnimate);
        await consumeEvent(players[p2], name, args, doAnimate);
    } else {
        await consumeEvent(players[p2], name, args, doAnimate);
        await consumeEvent(players[p1], name, args, doAnimate);
    }
    let t = turn ? t1[0].concat(t1[1]) : t2[0].concat(t2[1]);
    let tt = turn ? t2[0].concat(t2[1]) : t1[0].concat(t1[1]);
    for (let i = 0; i < 8; i++) {
        if (t[i])
            await consumeEvent(t[i], name, args, doAnimate);
        if (tt[i])
            await consumeEvent(tt[i], name, args, doAnimate);
    }

    switch (name) {
        case "tookdamage":
            await checkKO(args[0], args[1], t1, t2, p1, p2, turn, doAnimate);
            break;
        default:
    }
}

function getWinner(t1, t2) {
    let w1 = false;
    for (let c of t1[0].concat(t1[1]))
        w1 = w1 || (c != undefined && c.attack > 0);
    let w2 = false;
    for (let c of t2[0].concat(t2[1]))
        w2 = w2 || (c != undefined && c.attack > 0);

    if (w1 && !w2)
        return 1;
    else if (w2 && !w1)
        return 2;
    else if (!w1 && !w2 || t1[0].findIndex(e => e && e.attack > 0) == -1 && t2[0].findIndex(e => e && e.attack > 0) == -1)
        return 3;
    else
        return 0;
}

function pickAttacker(t1, t2, turn) {
    let t = turn ? t1 : t2;
    for (let c of t[0]) {
        if (c && !c.hasAttacked && c.attack > 0) {
            c.hasAttacked = true;
            return c;
        }
    }
    for (let c of t[0]) {
        if (c)
            c.hasAttacked = false;
    }
    let attacker = t[0][t[0].findIndex(e => e && e.attack > 0)];
    if (!attacker)
        attacker = t[0][t[0].findIndex(e => e)];
    attacker.hasAttacked = true;
    return attacker;
}

function pickTarget(t1, t2, turn, range) {
    let t = turn ? t2 : t1;
    let options = [];
    for (let c of (range ? t[0].concat(t[1]) : t[0])) {
        if (c != undefined)
            options.push(c);
    }
    return choice(options);
}

function prepareTroops(p) {
    let res = [[undefined, undefined, undefined, undefined], [undefined, undefined, undefined, undefined]];
    for (let i = 0; i < 8; i++)
        if (troops[p][i]) {
            let c = copy(troops[p][i]);
            c.original = troops[p][i];
            res[Math.floor(i / 4)][i % 4] = c;
        }
    return res;
}

async function dealHeroDamage(finish, t1, t2, p1, p2, doAnimate) {
    if (finish == 1 || finish == 2) {
        let damage = shopTier;
        let t = finish == 1 ? t1 : t2;
        let p = finish == 1 ? p2 : p1;
        for (let c of t[0].concat(t[1])) {
            if (c)
                damage++;
        }
        if (players[finish == 1 ? p1 : p2].effects.findIndex(e => e.id == 11) != -1)
            damage += 3;

        players[p].hp -= damage;

        if (doAnimate) {
            let o = finish == 1 ? document.getElementById("commander") : document.getElementById("enemy-commander").children[0];
            let t = finish == 2 ? document.getElementById("commander") : document.getElementById("enemy-commander").children[0];
            o.classList.add("attacking");
            if (o.classList.contains("commander"))
                o.style.transform = "scale(.77)";
            await sleep(500);
            let or = o.getBoundingClientRect();
            let tr = t.getBoundingClientRect();
            let dy = Math.floor(tr.top < or.top ? tr.bottom - or.top - 38 : tr.top - or.bottom + 38);
            o.style.transition = ".2s";
            o.style.transform += " translateY(" + dy + "px)";
            await sleep(200);
            updateCardStats(t);
            if (o.classList.contains("commander"))
                o.style.transform = "scale(.7)";
            else
                o.style.removeProperty("transform");
            playMusic("resources/audio/sfx/impact.mp3", false);
            await sleep(200);
            o.classList.remove("attacking");
            await sleep(500);
            o.style.removeProperty("transition");
        }
    }
}

async function checkKO(c, d, t1, t2, p1, p2, turn, doAnimate) {
    if (c.hp <= 0) {
        let owner = t1[0].concat(t1[1]).includes(c);

        if (c.revive) {
            c.hp = 1;

            if (doAnimate) {
                let d = findCardPos(c);
                d.children[0].style.filter = "grayscale(1)";
                d.children[0].style.opacity = "0";
                await sleep(500);
                delete c.revive;
                updateCardStats(d.children[0]);
                d.children[0].style.removeProperty("filter");
                d.children[0].style.removeProperty("opacity");
                await sleep(500);
            } else {
                delete c.revive;
            }
        } else {
            if (owner) {
                for (let k = 0; k < 2; k++)
                    for (let i = 0; i < 4; i++)
                        if (t1[k][i] == c)
                            t1[k][i] = undefined;
            } else {
                for (let k = 0; k < 2; k++)
                    for (let i = 0; i < 4; i++)
                        if (t2[k][i] == c)
                            t2[k][i] = undefined;
            }

            if (doAnimate) {
                let d = findCardPos(c);
                if (d) {
                    d.children[0].style.filter = "grayscale(1)";
                    d.children[0].style.opacity = "0";
                    await sleep(500);
                    d.innerHTML = "";
                }
            }

            await consumeEvent(c, "ko", [c, owner, t1, t2, (owner ? p1 : p2), [t1, t2, p1, p2, turn]], doAnimate);
        }

        await broadcastEvent("ko", t1, t2, p1, p2, turn, doAnimate, [c, owner, t1, t2, (owner ? p1 : p2), [t1, t2, p1, p2, turn]]);

        await repositionTroops(t1, t2, doAnimate, [t1, t2, p1, p2, turn]);
    }
}

async function drawBattleScene(t1, t2, p) {
    coins = 0;

    document.getElementById("enemy-commander").innerHTML = "";
    document.getElementById("enemy-commander").appendChild(drawCard(players[p], 270));
    fitDescription(document.getElementById("enemy-commander").children[0]);
    

    let board = document.getElementById("board");
    for (let i = 0; i < 8; i++) {
        let d = board.children[i];
        d.innerHTML = "";
        if (t1[Math.floor(i / 4)][i % 4]) {
            let c = drawSmallCard(t1[Math.floor(i / 4)][i % 4], 200);
            c.style.animation = "none";
            d.appendChild(c);
        }
    }
    let enemyBoard = document.getElementById("enemy-board");
    for (let i = 0; i < 8; i++) {
        let d = enemyBoard.children[i];
        d.innerHTML = "";
        if (t2[1 - Math.floor(i / 4)][i % 4])
            d.appendChild(drawSmallCard(t2[1 - Math.floor(i / 4)][i % 4], 200));
    }

    document.getElementById("shop").style.transform = "translateY(-100%)";
    document.getElementById("freeze").style.transform = "translateY(-284px)";
    document.getElementById("refresh").style.transform = "translateY(-284px)";
    document.getElementById("money").style.transform = "translateY(-284px)";
    document.getElementById("shop-tier").style.transform = "translateY(-284px)";
    document.getElementById("players").style.transform = "translateX(100%)";
    document.getElementById("fight").style.transform = "translateX(130px)";
    document.getElementById("hand-area").style.transform = "translate(-50%, 60%)";

    fadeOutMusic();

    await sleep(750);

    document.getElementById("battle-bg").style.opacity = "1";
    document.getElementById("enemy-board").style.top = "35px";
    document.getElementById("board").style.top = "476px";
    document.getElementById("board").style.left = "430px";
    document.getElementById("commander").style.transform = "scale(.7)";
    document.getElementById("commander").style.left = "110px";
    document.getElementById("commander").style.top = "415px";
    document.getElementById("commander").style.transition = ".5s";
    document.getElementById("enemy-commander").style.bottom = "415px";

    playMusic(getNextMusic("battle"), true);

    await sleep(1500);

    currentScene = "battle";
}

async function drawShopScene() {
    await sleep(1500);

    let nAlive = 0;
    for (let p of players)
        if (p.hp > 0)
            nAlive++;

    if (players[0].hp <= 0) {
        let filter = document.createElement('div');
        filter.className = "semi-black-filter";
        document.body.appendChild(filter);

        let banner = document.createElement('div');
        banner.className = "end-banner";
        banner.innerHTML = "Défaite";
        filter.appendChild(banner);

        let players2 = copy(players);
        players2.sort((a, b) => { if (a.hp > b.hp) return -1; else if (a.hp < b.hp) return 1; else return 0; });
        let n = players2.findIndex(e => e.name == players[0].name) + 1;

        let place = document.createElement('div');
        place.className = "end-position";
        place.innerHTML = "Votre place : " + n + "<sup>ème</sup>";
        filter.appendChild(place);

        let cont = document.createElement('div');
        cont.className = "end-click";
        cont.innerHTML = "(Cliquez pour continuer)";
        filter.appendChild(cont);

        filter.onclick = () => {
            fadeTransition(drawHomeScreen);
        };
    } else if (nAlive == 1) {
        let filter = document.createElement('div');
        filter.className = "semi-black-filter";
        document.body.appendChild(filter);

        let banner = document.createElement('div');
        banner.className = "end-banner";
        banner.innerHTML = "Victoire";
        filter.appendChild(banner);

        let place = document.createElement('div');
        place.className = "end-position";
        place.innerHTML = "Victoire en " + round + " tours";
        filter.appendChild(place);

        let cont = document.createElement('div');
        cont.className = "end-click";
        cont.innerHTML = "(Cliquez pour continuer)";
        filter.appendChild(cont);

        filter.onclick = () => {
            fadeTransition(drawHomeScreen);
        };
    } else {
        let board = document.getElementById("board");

        for (let i = 0; i < 8; i++) {
            let d = board.children[i];
            if (d.children[0])
                d.children[0].style.opacity = "0";
        }

        document.getElementById("battle-bg").style.opacity = "0";
        document.getElementById("enemy-board").style.top = "-363px";
        document.getElementById("board").style.removeProperty("top");
        document.getElementById("board").style.removeProperty("left");
        document.getElementById("commander").style.removeProperty("transform");
        document.getElementById("commander").style.removeProperty("left");
        document.getElementById("commander").style.removeProperty("top");
        document.getElementById("enemy-commander").style.removeProperty("bottom");

        round++;
        switch(round) {
            case 3:
            case 5:
            case 8:
            case 11:
            case 14:
                increaseShopTier();
        }
        spendCoins(-Math.min(10, round + 2), true);
        refreshShop(true);
        drawPlayers();

        fadeOutMusic();

        await sleep(750);

        for (let i = 0; i < 8; i++) {
            let d = board.children[i];
            d.innerHTML = "";
            if (troops[0][i]) {
                let c = drawSmallCard(troops[0][i], 200);
                c.draggable = true;
                c.addEventListener('dragstart', dragStart);
                c.addEventListener('dragend', dragEnd);
                d.appendChild(c);
            }
        }

        document.getElementById("shop").style.removeProperty("transform");
        document.getElementById("freeze").style.removeProperty("transform");
        document.getElementById("refresh").style.removeProperty("transform");
        document.getElementById("money").style.removeProperty("transform");
        document.getElementById("players").style.removeProperty("transform");
        document.getElementById("fight").style.removeProperty("transform");
        document.getElementById("hand-area").style.removeProperty("transform");
        document.getElementById("shop-tier").style.removeProperty("transform");

        playMusic(getNextMusic("shop"), true);

        await sleep(750);

        currentScene = "shop";

        await broadcastShopEvent("turn-start", []);
    }
}























/* ----------------------------------------------------- */
/* ------------------ Card management ------------------ */
/* ----------------------------------------------------- */

const speciesList = ["Dragon", "Gobelin", "Sorcier", "Soldat", "Bandit", "Machine", "Bête", "Mort-Vivant", "Sylvain", "Horde", "Démon", "Elémentaire"];

const cardList = {
    "Commandant": ["commandant-de-la-legion", "roi-gobelin", "seigneur-liche", "tyran-draconique", "instructrice-de-l-academie", "l-ombre-etheree", "inventrice-prolifique", "zoomancienne-sylvestre", "monarque-inflexible", "diplomate-astucieux", "chef-du-clan-fracassecrane", "collectionneur-d-ames", "inventeur-fou", "meneuse-de-la-rebellion", "geomancien-ardent", "protecteur-de-la-foret", "chamanes-de-la-horde", "contremaitre-de-l-abysse", "avatar-de-la-creation"],
    "Sortilège": ["aiguisage", "tresor-du-dragon", "recit-des-legendes", "horde-infinie", "gobelin-bondissant", "invocation-mineure", "portail-d-invocation", "secrets-de-la-bibliotheque", "echo-arcanique", "javelot-de-feu", "noble-camaraderie", "protection-d-urgence", "corruption", "bon-tuyau", "replication-mecanique", "revisions-mecaniques", "chasse-benie", "traque", "regain-de-vie", "rite-de-sang", "reunion-celeste", "malediction-vegetale", "armure-de-ronces", "masse-de-la-brutalite", "summum-de-la-gloire", "pacte-demoniaque", "liberer-le-mal", "transcendance-elementaire", "confluence-elementaire"],
    "Dragon": ["dragonnet-ardent", "dragon-d-or", "dragon-d-argent", "oeuf-de-dragon", "dragon-cupide", "meneuse-de-progeniture", "dragon-enchante", "devoreur-insatiable", "gardien-du-tresor", "tyran-solitaire", "terrasseur-flammegueule", "dominante-guidaile", "protecteur-brillecaille", "dragon-foudroyant", "chasseur-ecailleux"],
    "Gobelin": ["eclaireur-gobelin", "duo-de-gobelins", "agitateur-gobelin", "batailleur-frenetique", "specialiste-en-explosions", "commandant-des-artilleurs", "artilleur-vicieux", "chef-de-guerre-gobelin", "artisan-forgemalice", "gobelin-approvisionneur", "chef-de-gang", "guide-gobelin", "mercenaires-gobelins", "champion-de-fracassecrane", "escouade-hargneuse"],
    "Sorcier": ["apprentie-magicienne", "mage-reflecteur", "canaliseuse-de-mana", "maitresse-des-illusions", "amasseur-de-puissance", "doyenne-des-oracles", "archimage-omnipotent", "precheur-de-l-equilibre", "arcaniste-astral", "creation-de-foudre", "pyromancienne-novice", "reservoir-de-puissance"],
    "Soldat": ["fantassin-en-armure", "capitaine-d-escouade", "protectrice-devouee", "ecraseuse-au-bouclier", "veteran-sylvebouclier", "general-ethere", "chevalier-loyal", "baliste-de-la-legion", "tacticien-de-la-legion", "commandante-sylvelame", "mentor-chevaleresque", "recrue-peureuse", "recruteur-de-la-legion", "paladin-inspirateur", "heroine-de-la-legion"],
    "Bandit": ["archere-aux-traits-de-feu", "voleuse-a-la-tire", "gredin-agile", "pilleur-de-bibliotheque", "siphonneuse-de-mana", "voleur-audacieux", "saboteur-masque", "passe-muraille", "ombre-sans-visage", "pillarde-inconsciente", "lanceuse-de-dagues", "piegeuse-d-ames", "receleur-de-tresors", "assassin-silencieux", "voleur-de-pensees"],
    "Machine": ["planeur-de-fortune", "renard-mecanique", "colosse-adaptatif", "protecteur-de-la-cite", "golem-cinetique", "carcasse-mecanophage", "automate-replicateur", "artisan-gadgetiste", "baliste-ambulante", "automate-manaforme", "auto-duplicateur", "chef-de-la-proliferation", "ouvrier-assembleur", "garde-de-fer", "robot-astiqueur"],
    "Bête": ["predateur-en-chasse", "devoreur-sauvage", "chasseur-bondissant", "guivre-colossale", "gardien-de-la-foret", "ame-rugissante", "colonie-de-rats", "hydre-vorace", "hydre-enragee", "avatar-de-la-predation", "alligator-charognard", "meneuse-de-betes", "hurleur-des-sylves", "chargeur-cuirasse", "mastodonte-galopant"],
    "Mort-Vivant": ["serviteur-exhume", "squelette-reconstitue", "archer-squelette", "liche-profanatrice", "devoreur-pourrissant", "eveilleur-d-ames", "creation-abjecte", "necromancienne-corrompue", "raccommodeur-de-cadavres", "guerrier-maudit", "crane-possede", "dragon-decharne", "marcheur-eternel", "soldat-revenu-a-la-vie", "assistant-du-raccommodeur"],
    "Sylvain": ["invocation-sylvestre", "chamane-des-lignes-de-vie", "gardien-de-noirepine", "brisesort-elfique", "colosse-centenaire", "faconneur-de-forets", "combattant-embusque", "druidesse-des-lignes-de-vie", "archere-de-noirepine", "vengeur-des-sylves", "sage-fongimancien", "chevaucheur-sauvage", "cavalier-des-ronces", "incarnation-de-la-foret", "elue-des-sylves"],
    "Horde": ["minotaure-chargeur", "assiegeant-orc", "ravageur-des-falaises", "massacreur-de-fracassecrane", "brute-a-deux-tetes", "geant-ecrabouilleur", "pyromane-de-la-horde", "meneuse-du-clan-sylvegarde", "executeur-implacable", "exhorteur-de-la-horde", "batailleur-brisefer", "veteran-de-fracassecrane", "geant-destructeur", "obliterateur-goliath", "annihilateur-minotaure"],
    "Démon": ["demon-inferieur", "guetteur-demoniaque", "pretre-corrompu", "ecumeur-des-terres-desolees", "diablomancien-de-l-abysse", "fleau-des-terres-desolees", "incarnation-du-chaos", "porteur-de-la-noire-parole", "moissonneur-de-vitalite", "adepte-du-culte-du-sang", "poete-a-la-plume-sanglante", "divinite-dechue", "ange-transcende", "tortionnaire-d-ames", "annonciatrice-funeste"],
    "Elémentaire": ["familier-chatfeu", "golem-demolisseur", "esprit-des-rivieres", "faconneuse-de-nuages", "sculpteur-elementaire", "colere-de-la-nature", "esprit-des-sources-chaudes", "goliath-volcanique", "chevaucheur-de-tempetes", "manifestation-boreale", "chargeur-rocailleux", "djinn-sang-de-foudre", "phenix-flamboyant", "volonte-de-la-fournaise", "ame-de-l-orage"],
    "Autre": ["changeforme-masque", "ange-guerrier", "guide-angelique", "archange-eclatant", "ange-de-l-unite", "combattant-celeste"],
    "Token": ["piece-d-or", "proie-facile", "scion-aspirame", "guerrier-gobelin", "artificier-gobelin", "connaissances-arcaniques", "catalyseur-de-puissance", "equilibre-naturel", "dephasage", "ouvrier-assemble", "jeune-fongus", "coeur-de-l-abysse", "le-banni"]
};

const elements = ["Eau", "Feu", "Air", "Terre"];

let species = [];
let cards = [];
let commanders = [];

function initCards() {
    species = [];
    let s;
    while (species.length < 5) {
        s = choice(speciesList);
        if (!species.includes(s))
            species.push(s);
    }

    //species = ["Elémentaire"]; //!!!

    //for (let s of speciesList)
    //    cardList[s] = [cardList[s][0]]; //!!!

    for (let s of species.concat(["Sortilège", "Autre"])) {
        for (let c of cardList[s])
            for (let i = 0; i < 15; i++) {
                let card = createCard(c);
                if (!card.requirement || species.includes(card.requirement))
                    //if (!card.requirement) //!!!
                    cards.push(createCard(c));
            }
    }

    commanders = [];
    for (let c of cardList["Commandant"]) {
        let card = createCard(c);
        if (!card.requirement || species.includes(card.requirement)) //!!!
            commanders.push(card);
    }

    shuffle(cards);
    shuffle(commanders);
    /*while (commanders.findIndex(e => e.name.startsWith("Avatar")) > 2 && species.includes("Elémentaire")) //!!!
        shuffle(commanders);*/
}

function getCard(tier, spec, name) {
    shuffle(cards);
    for (let c of cards) {
        if ((!tier || tier >= c.tier) && (!spec || c.species == spec) && (!name || name == c.name))
            return copy(c);
    }
}

function generateCard(name, species) {
    if (name)
        return createCard(name);
    else
        return createCard(cardList[species][Math.floor(Math.random() * cardList[species].length)]);
}

function createCard(card) {
    switch (card) {
        case "commandant-de-la-legion":
            return new CommandantDeLaLegion();
        case "roi-gobelin":
            return new RoiGobelin();
        case "seigneur-liche":
            return new SeigneurLiche();
        case "tyran-draconique":
            return new TyranDraconique();
        case "instructrice-de-l-academie":
            return new InstructriceDeLAcademie();
        case "l-ombre-etheree":
            return new LOmbreEtheree();
        case "inventrice-prolifique":
            return new InventriceProlifique();
        case "zoomancienne-sylvestre":
            return new ZoomancienneSylvestre();
        case "monarque-inflexible":
            return new MonarqueInflexible();
        case "diplomate-astucieux":
            return new DiplomateAstucieux();
        case "chef-du-clan-fracassecrane":
            return new ChefDuClanFracassecrane();
        case "collectionneur-d-ames":
            return new CollectionneurDAmes();
        case "inventeur-fou":
            return new InventeurFou();
        case "meneuse-de-la-rebellion":
            return new MeneuseDeLaRebellion();
        case "geomancien-ardent":
            return new GeomancienArdent();
        case "protecteur-de-la-foret":
            return new ProtecteurDeLaForet();
        case "chamanes-de-la-horde":
            return new ChamanesDeLaHorde();
        case "contremaitre-de-l-abysse":
            return new ContremaitreDeLAbysse();
        case "avatar-de-la-creation":
            return new AvatarDeLaCreation();

        case "dragonnet-ardent":
            return new DragonnetArdent();
        case "dragon-enchante":
            return new DragonEnchante();
        case "oeuf-de-dragon":
            return new OeufDeDragon();
        case "dragon-foudroyant":
            return new DragonFoudroyant();
        case "dragon-cupide":
            return new DragonCupide();
        case "dragon-d-argent":
            return new DragonDArgent();
        case "meneuse-de-progeniture":
            return new MeneuseDeProgeniture();
        case "dragon-d-or":
            return new DragonDOr();
        case "tyran-solitaire":
            return new TyranSolitaire();
        case "terrasseur-flammegueule":
            return new TerrasseurFlammegueule();
        case "devoreur-insatiable":
            return new DevoreurInsatiable();
        case "dominante-guidaile":
            return new DominanteGuidaile();
        case "protecteur-brillecaille":
            return new ProtecteurBrillecaille();
        case "chasseur-ecailleux":
            return new ChasseurEcailleux();
        case "gardien-du-tresor":
            return new GardienDuTresor();
        case "tresor-du-dragon":
            return new TresorDuDragon();
        case "recit-des-legendes":
            return new RecitDesLegendes();

        case "eclaireur-gobelin":
            return new EclaireurGobelin();
        case "duo-de-gobelins":
            return new DuoDeGobelins();
        case "agitateur-gobelin":
            return new AgitateurGobelin();
        case "batailleur-frenetique":
            return new BatailleurFrenetique();
        case "specialiste-en-explosions":
            return new SpecialisteEnExplosions();
        case "artilleur-vicieux":
            return new ArtilleurVicieux();
        case "commandant-des-artilleurs":
            return new CommandantDesArtilleurs();
        case "chef-de-guerre-gobelin":
            return new ChefDeGuerreGobelin();
        case "artisan-forgemalice":
            return new ArtisanForgemalice();
        case "gobelin-approvisionneur":
            return new GobelinApprovisionneur();
        case "chef-de-gang":
            return new ChefDeGang();
        case "guide-gobelin":
            return new GuideGobelin();
        case "mercenaires-gobelins":
            return new MercenairesGobelins();
        case "champion-de-fracassecrane":
            return new ChampionDeFracassecrane();
        case "escouade-hargneuse":
            return new EscouadeHargneuse();
        case "horde-infinie":
            return new HordeInfinie();
        case "gobelin-bondissant":
            return new GobelinBondissant();
        case "echo-arcanique":
            return new EchoArcanique();
        case "javelot-de-feu":
            return new JavelotDeFeu();

        case "apprentie-magicienne":
            return new ApprentieMagicienne();
        case "connaissances-arcaniques":
            return new ConnaissancesArcaniques();
        case "mage-reflecteur":
            return new MageReflecteur();
        case "canaliseuse-de-mana":
            return new CanaliseuseDeMana();
        case "maitresse-des-illusions":
            return new MaitresseDesIllusions();
        case "amasseur-de-puissance":
            return new AmasseurDePuissance();
        case "catalyseur-de-puissance":
            return new CatalyseurDePuissance();
        case "doyenne-des-oracles":
            return new DoyenneDesOracles();
        case "archimage-omnipotent":
            return new ArchimageOmnipotent();
        case "portail-d-invocation":
            return new PortailDInvocation();
        case "precheur-de-l-equilibre":
            return new PrecheurDeLEquilibre();
        case "equilibre-naturel":
            return new EquilibreNaturel();
        case "secrets-de-la-bibliotheque":
            return new SecretsDeLaBibliotheque();
        case "arcaniste-astral":
            return new ArcanisteAstral();
        case "dephasage":
            return new Dephasage();
        case "creation-de-foudre":
            return new CreationDeFoudre();
        case "invocation-mineure":
            return new InvocationMineure();
        case "pyromancienne-novice":
            return new PyromancienneNovice();
        case "reservoir-de-puissance":
            return new ReservoirDePuissance();

        case "fantassin-en-armure":
            return new FantassinEnArmure();
        case "capitaine-d-escouade":
            return new CapitaineDEscouade();
        case "protectrice-devouee":
            return new ProtectriceDevouee();
        case "ecraseuse-au-bouclier":
            return new EcraseuseAuBouclier();
        case "veteran-sylvebouclier":
            return new VeteranSylvebouclier();
        case "general-ethere":
            return new GeneralEthere();
        case "chevalier-loyal":
            return new ChevalierLoyal();
        case "baliste-de-la-legion":
            return new BalisteDeLaLegion();
        case "tacticien-de-la-legion":
            return new TacticienDeLaLegion();
        case "commandante-sylvelame":
            return new CommandanteSylvelame();
        case "mentor-chevaleresque":
            return new MentorChevaleresque();
        case "recrue-peureuse":
            return new RecruePeureuse();
        case "recruteur-de-la-legion":
            return new RecruteurDeLaLegion();
        case "paladin-inspirateur":
            return new PaladinInspirateur();
        case "heroine-de-la-legion":
            return new HeroineDeLaLegion();
        case "noble-camaraderie":
            return new NobleCamaraderie();
        case "protection-d-urgence":
            return new ProtectionDUrgence();

        case "archere-aux-traits-de-feu":
            return new ArchereAuxTraitsDeFeu();
        case "voleuse-a-la-tire":
            return new VoleuseALaTire();
        case "gredin-agile":
            return new GredinAgile();
        case "pilleur-de-bibliotheque":
            return new PilleurDeBibliotheque();
        case "siphonneuse-de-mana":
            return new SiphonneuseDeMana();
        case "voleur-audacieux":
            return new VoleurAudacieux();
        case "saboteur-masque":
            return new SaboteurMasque();
        case "passe-muraille":
            return new PasseMuraille();
        case "ombre-sans-visage":
            return new OmbreSansVisage();
        case "pillarde-inconsciente":
            return new PillardeInconsciente();
        case "lanceuse-de-dagues":
            return new LanceuseDeDagues();
        case "piegeuse-d-ames":
            return new PiegeuseDAmes();
        case "receleur-de-tresors":
            return new ReceleurDeTresors();
        case "assassin-silencieux":
            return new AssassinSilencieux();
        case "voleur-de-pensees":
            return new VoleurDePensees();
        case "corruption":
            return new Corruption();
        case "bon-tuyau":
            return new BonTuyau();

        case "planeur-de-fortune":
            return new PlaneurDeFortune();
        case "renard-mecanique":
            return new RenardMecanique();
        case "colosse-adaptatif":
            return new ColosseAdaptatif();
        case "protecteur-de-la-cite":
            return new ProtecteurDeLaCite();
        case "golem-cinetique":
            return new GolemCinetique();
        case "carcasse-mecanophage":
            return new CarcasseMecanophage();
        case "automate-replicateur":
            return new AutomateReplicateur();
        case "automate-replicateur-mod":
            return new AutomateReplicateurMod();
        case "artisan-gadgetiste":
            return new ArtisanGadgetiste();
        case "baliste-ambulante":
            return new BalisteAmbulante();
        case "automate-manaforme":
            return new AutomateManaforme();
        case "auto-duplicateur":
            return new AutoDuplicateur();
        case "auto-duplicateur-mod":
            return new AutoDuplicateurMod();
        case "chef-de-la-proliferation":
            return new ChefDeLaProliferation();
        case "ouvrier-assembleur":
            return new OuvrierAssembleur();
        case "ouvrier-assemble":
            return new OuvrierAssemble();
        case "garde-de-fer":
            return new GardeDeFer();
        case "robot-astiqueur":
            return new RobotAstiqueur();
        case "replication-mecanique":
            return new ReplicationMecanique();
        case "revisions-mecaniques":
            return new RevisionsMecaniques();

        case "predateur-en-chasse":
            return new PredateurEnChasse();
        case "devoreur-sauvage":
            return new DevoreurSauvage();
        case "chasseur-bondissant":
            return new ChasseurBondissant();
        case "guivre-colossale":
            return new GuivreColossale();
        case "gardien-de-la-foret":
            return new GardienDeLaForet();
        case "ame-rugissante":
            return new AmeRugissante();
        case "colonie-de-rats":
            return new ColonieDeRats();
        case "hydre-vorace":
            return new HydreVorace();
        case "hydre-enragee":
            return new HydreEnragee();
        case "avatar-de-la-predation":
            return new AvatarDeLaPredation();
        case "alligator-charognard":
            return new AlligatorCharognard();
        case "meneuse-de-betes":
            return new MeneuseDeBetes();
        case "hurleur-des-sylves":
            return new HurleurDesSylves();
        case "chargeur-cuirasse":
            return new ChargeurCuirasse();
        case "mastodonte-galopant":
            return new MastodonteGalopant();
        case "chasse-benie":
            return new ChasseBenie();
        case "traque":
            return new Traque();

        case "serviteur-exhume":
            return new ServiteurExhume();
        case "squelette-reconstitue":
            return new SqueletteReconstitue();
        case "archer-squelette":
            return new ArcherSquelette();
        case "liche-profanatrice":
            return new LicheProfanatrice();
        case "devoreur-pourrissant":
            return new DevoreurPourrissant();
        case "eveilleur-d-ames":
            return new EveilleurDAmes();
        case "creation-abjecte":
            return new CreationAbjecte();
        case "necromancienne-corrompue":
            return new NecromancienneCorrompue();
        case "raccommodeur-de-cadavres":
            return new RaccommodeurDeCadavres();
        case "guerrier-maudit":
            return new GuerrierMaudit();
        case "crane-possede":
            return new CranePossede();
        case "dragon-decharne":
            return new DragonDecharne();
        case "marcheur-eternel":
            return new MarcheurEternel();
        case "soldat-revenu-a-la-vie":
            return new SoldatRevenuALaVie();
        case "assistant-du-raccommodeur":
            return new AssistantDuRaccommodeur();
        case "regain-de-vie":
            return new RegainDeVie();
        case "rite-de-sang":
            return new RiteDeSang();

        case "invocation-sylvestre":
            return new InvocationSylvestre();
        case "chamane-des-lignes-de-vie":
            return new ChamaneDesLignesDeVie();
        case "gardien-de-noirepine":
            return new GardienDeNoirepine();
        case "brisesort-elfique":
            return new BrisesortElfique();
        case "colosse-centenaire":
            return new ColosseCentenaire();
        case "faconneur-de-forets":
            return new FaconneurDeForets();
        case "combattant-embusque":
            return new CombattantEmbusque();
        case "druidesse-des-lignes-de-vie":
            return new DruidesseDesLignesDeVie();
        case "archere-de-noirepine":
            return new ArchereDeNoirepine();
        case "vengeur-des-sylves":
            return new VengeurDesSylves();
        case "sage-fongimancien":
            return new SageFongimancien();
        case "chevaucheur-sauvage":
            return new ChevaucheurSauvage();
        case "cavalier-des-ronces":
            return new CavalierDesRonces();
        case "incarnation-de-la-foret":
            return new IncarnationDeLaForet();
        case "elue-des-sylves":
            return new ElueDesSylves();
        case "malediction-vegetale":
            return new MaledictionVegetale();
        case "armure-de-ronces":
            return new ArmureDeRonces();

        case "minotaure-chargeur":
            return new MinotaureChargeur();
        case "assiegeant-orc":
            return new AssiegeantOrc();
        case "ravageur-des-falaises":
            return new RavageurDesFalaises();
        case "massacreur-de-fracassecrane":
            return new MassacreurDeFracassecrane();
        case "brute-a-deux-tetes":
            return new BruteADeuxTetes();
        case "geant-ecrabouilleur":
            return new GeantEcrabouilleur();
        case "pyromane-de-la-horde":
            return new PyromaneDeLaHorde();
        case "meneuse-du-clan-sylvegarde":
            return new MeneuseDuClanSylvegarde();
        case "executeur-implacable":
            return new ExecuteurImplacable();
        case "exhorteur-de-la-horde":
            return new ExhorteurDeLaHorde();
        case "batailleur-brisefer":
            return new BatailleurBrisefer();
        case "veteran-de-fracassecrane":
            return new VeteranDeFracassecrane();
        case "geant-destructeur":
            return new GeantDestructeur();
        case "obliterateur-goliath":
            return new ObliterateurGoliath();
        case "annihilateur-minotaure":
            return new AnnihilateurMinotaure();
        case "masse-de-la-brutalite":
            return new MasseDeLaBrutalite();
        case "summum-de-la-gloire":
            return new SummumDeLaGloire();
        
        case "demon-inferieur":
            return new DemonInferieur();
        case "guetteur-demoniaque":
            return new GuetteurDemoniaque();
        case "pretre-corrompu":
            return new PretreCorrompu();
        case "ecumeur-des-terres-desolees":
            return new EcumeurDesTerresDesolees();
        case "diablomancien-de-l-abysse":
            return new DiablomancienDeLAbysse();
        case "fleau-des-terres-desolees":
            return new FleauDesTerresDesolees();
        case "incarnation-du-chaos":
            return new IncarnationDuChaos();
        case "porteur-de-la-noire-parole":
            return new PorteurDeLaNoireParole();
        case "moissonneur-de-vitalite":
            return new MoissonneurDeVitalite();
        case "adepte-du-culte-du-sang":
            return new AdepteDuCulteDuSang();
        case "poete-a-la-plume-sanglante":
            return new PoeteALaPlumeSanglante();
        case "divinite-dechue":
            return new DiviniteDechue();
        case "ange-transcende":
            return new AngeTranscende();
        case "tortionnaire-d-ames":
            return new TortionnaireDAmes();
        case "annonciatrice-funeste":
            return new AnnonciatriceFuneste();
        case "pacte-demoniaque":
            return new PacteDemoniaque();
        case "liberer-le-mal":
            return new LibererLeMal();

        case "familier-chatfeu":
            return new FamilierChatfeu();
        case "golem-demolisseur":
            return new GolemDemolisseur();
        case "esprit-des-rivieres":
            return new EspritDesRivieres();
        case "faconneuse-de-nuages":
            return new FaconneuseDeNuages();
        case "sculpteur-elementaire":
            return new SculpteurElementaire();
        case "colere-de-la-nature":
            return new ColereDeLaNature();
        case "esprit-des-sources-chaudes":
            return new EspritDesSourcesChaudes();
        case "goliath-volcanique":
            return new GoliathVolcanique();
        case "chevaucheur-de-tempetes":
            return new ChevaucheurDeTempetes();
        case "manifestation-boreale":
            return new ManifestationBoreale();
        case "chargeur-rocailleux":
            return new ChargeurRocailleux();
        case "djinn-sang-de-foudre":
            return new DjinnSangDeFoudre();
        case "phenix-flamboyant":
            return new PhenixFlamboyant();
        case "volonte-de-la-fournaise":
            return new VolonteDeLaFournaise();
        case "ame-de-l-orage":
            return new AmeDeLOrage();
        case "transcendance-elementaire":
            return new TranscendanceElementaire();
        case "confluence-elementaire":
            return new ConfluenceElementaire();

        case "changeforme-masque":
            return new ChangeformeMasque();
        case "ange-guerrier":
            return new AngeGuerrier();
        case "guide-angelique":
            return new GuideAngelique();
        case "archange-eclatant":
            return new ArchangeEclatant();
        case "ange-de-l-unite":
            return new AngeDeLUnite();
        case "combattant-celeste":
            return new CombattantCeleste();

        case "aiguisage":
            return new Aiguisage();
        case "reunion-celeste":
            return new ReunionCeleste();

        case "piece-d-or":
            return new PieceDOr();
        case "proie-facile":
            return new ProieFacile();
        case "scion-aspirame":
            return new ScionAspirame();
        case "guerrier-gobelin":
            return new GuerrierGobelin();
        case "artificier-gobelin":
            return new ArtificierGobelin();
        case "jeune-fongus":
            return new JeuneFongus();
        case "coeur-de-l-abysse":
            return new CoeurDeLAbysse();
        case "le-banni":
            return new LeBanni();

        default:
            alert("Carte inconnue : " + card);
            return;
    }
}


// Commandants

function CommandantDeLaLegion() {
    this.name = "Commandant de la Légion";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 32;
    this.src = "commandants/commandant-de-la-legion.jpg";
    this.requirement = "Soldat";
    this.effects = [
        {
            trigger: "card-place",
            id: 2
        }
    ];
}

function RoiGobelin() {
    this.name = "Roi Gobelin";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/roi-gobelin.jpg";
    this.requirement = "Gobelin";
    this.effects = [
        {
            trigger: "ko",
            id: 4
        }
    ];
}

function SeigneurLiche() {
    this.name = "Seigneur liche";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 28;
    this.src = "commandants/seigneur-liche.jpg";
    this.effects = [
        {
            trigger: "battle-start",
            id: 5
        }
    ];
}

function TyranDraconique() {
    this.name = "Tyran draconique";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/tyran-draconique.jpg";
    this.requirement = "Dragon";
    this.effects = [
        {
            trigger: "card-buy",
            id: 1
        },
        {
            trigger: "turn-start",
            id: 14
        }
    ];
}

function InstructriceDeLAcademie() {
    this.name = "Instructrice de l'Académie";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/instructrice-de-l-academie.jpg";
    this.requirement = "Sorcier";
    this.effects = [
        {
            trigger: "turn-start",
            id: 6
        }
    ];
}

function LOmbreEtheree() {
    this.name = "L'Ombre étherée";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/l-ombre-etheree.jpg";
    this.requirement = "Bandit";
    this.effects = [
        {
            trigger: "card-place",
            id: 3
        }
    ];
}

function InventriceProlifique() {
    this.name = "Inventrice prolifique";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/inventrice-prolifique.jpg";
    this.requirement = "Machine";
    this.effects = [
        {
            trigger: "card-place",
            id: 7
        }
    ];
}

function ZoomancienneSylvestre() {
    this.name = "Zoomancienne sylvestre";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 34;
    this.src = "commandants/zoomancienne-sylvestre.jpg";
    this.requirement = "Bête";
    this.effects = [
        {
            trigger: "turn-start",
            id: 8
        }
    ];
}

function MonarqueInflexible() {
    this.name = "Monarque inflexible";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/monarque-inflexible.jpg";
    this.effects = [
        {
            trigger: "card-sell",
            id: 9
        },
        {
            trigger: "turn-start",
            id: 15
        }
    ];
}

function DiplomateAstucieux() {
    this.name = "Diplomate astucieux";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 33;
    this.src = "commandants/diplomate-astucieux.jpg";
    this.effects = [
        {
            trigger: "turn-start",
            id: 10
        }
    ];
}

function ChefDuClanFracassecrane() {
    this.name = "Chef du clan Fracassecrâne";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 38;
    this.src = "commandants/chef-du-clan-fracassecrane.jpg";
    this.effects = [
        {
            trigger: "",
            id: 11
        }
    ];
}

function CollectionneurDAmes() {
    this.name = "Collectionneur d'Âmes";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 27;
    this.src = "commandants/collectionneur-d-ames.jpg";
    this.requirement = "Mort-Vivant";
    this.effects = [
        {
            trigger: "game-start",
            id: 12
        }
    ];
}

function InventeurFou() {
    this.name = "Inventeur fou";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 30;
    this.src = "commandants/inventeur-fou.jpg";
    this.effects = [
        {
            trigger: "shop-refresh",
            id: 13
        }
    ];
}

function MeneuseDeLaRebellion() {
    this.name = "Meneuse de la Rébellion";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 31;
    this.src = "commandants/meneuse-de-la-rebellion.jpg";
    this.effects = [
        {
            trigger: "card-place",
            id: 16
        },
        {
            trigger: "turn-start",
            id: 17
        }
    ];
}

function GeomancienArdent() {
    this.name = "Géomancien ardent";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 34;
    this.src = "commandants/geomancien-ardent.jpg";
    this.effects = [
        {
            trigger: "turn-start",
            id: 18
        },
        {
            trigger: "battle-start",
            id: 19
        }
    ];
}

function ProtecteurDeLaForet() {
    this.name = "Protecteur de la forêt";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 36;
    this.src = "commandants/protecteur-de-la-foret.jpg";
    this.requirement = "Sylvain";
    this.effects = [
        {
            trigger: "battle-start",
            id: 20
        }
    ];
}

function ChamanesDeLaHorde() {
    this.name = "Chamanes de la Horde";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 33;
    this.src = "commandants/chamanes-de-la-horde.jpg";
    this.requirement = "Horde";
    this.effects = [
        {
            trigger: "",
            id: 21
        }
    ];
}

function ContremaitreDeLAbysse() {
    this.name = "Contremaître de l'Abysse";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 29;
    this.src = "commandants/contremaitre-de-l-abysse.jpg";
    this.requirement = "Démon";
    this.effects = [
        {
            trigger: "game-start",
            id: 22
        }
    ];
}

function AvatarDeLaCreation() {
    this.name = "Avatar de la Création";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 31;
    this.src = "commandants/avatar-de-la-creation.jpg";
    this.requirement = "Elémentaire";
    this.elements = ["Eau", "Feu", "Air", "Terre"];
    this.effects = [
        {
            trigger: "",
            id: 23
        }
    ];
}


// Dragons

function DragonnetArdent() {
    this.name = "Dragonnet ardent";
    this.species = "Dragon";
    this.attack = 3;
    this.hp = 1;
    this.src = "dragons/dragonnet-ardent.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 101
        }
    ];
}

function DragonEnchante() {
    this.name = "Dragon enchanté";
    this.species = "Dragon";
    this.attack = 3;
    this.hp = 2;
    this.src = "dragons/dragon-enchante.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "coin-change",
            id: 104
        },
        {
            trigger: "turn-start",
            id: 105
        }
    ];
}

function OeufDeDragon() {
    this.name = "Oeuf de Dragon";
    this.species = "Dragon";
    this.attack = 0;
    this.hp = 1;
    this.src = "dragons/oeuf-de-dragon.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 103
        }
    ];
}

function DragonDArgent() {
    this.name = "Dragon d'argent";
    this.species = "Dragon";
    this.attack = 3;
    this.hp = 3;
    this.src = "dragons/dragon-d-argent.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "coin-change",
            id: 110
        }
    ];
}

function DragonFoudroyant() {
    this.name = "Dragon foudroyant";
    this.species = "Dragon";
    this.attack = 4;
    this.hp = 5;
    this.src = "dragons/dragon-foudroyant.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "attacked",
            id: 116
        }
    ];
}

function DragonCupide() {
    this.name = "Dragon cupide";
    this.species = "Dragon";
    this.attack = 4;
    this.hp = 2;
    this.src = "dragons/dragon-cupide.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 107
        }
    ];
}

function MeneuseDeProgeniture() {
    this.name = "Meneuse de progéniture";
    this.species = "Dragon";
    this.attack = 4;
    this.hp = 4;
    this.src = "dragons/meneuse-de-progeniture.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "coin-change",
            id: 109
        }
    ];
}

function DragonDOr() {
    this.name = "Dragon d'or";
    this.species = "Dragon";
    this.attack = 5;
    this.hp = 4;
    this.src = "dragons/dragon-d-or.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-end",
            id: 102
        }
    ];
}

function TerrasseurFlammegueule() {
    this.name = "Terrasseur Flammegueule";
    this.species = "Dragon";
    this.attack = 8;
    this.hp = 4;
    this.src = "dragons/terrasseur-flammegueule.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "attack",
            id: 113
        }
    ];
}

function TyranSolitaire() {
    this.name = "Tyran solitaire";
    this.species = "Dragon";
    this.attack = 12;
    this.hp = 12;
    this.src = "dragons/tyran-solitaire.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "card-place",
            id: 111
        },
        {
            trigger: "card-sell",
            id: 112
        }
    ];
}

function DevoreurInsatiable() {
    this.name = "Dévoreur insatiable";
    this.species = "Dragon";
    this.attack = 5;
    this.hp = 6;
    this.src = "dragons/devoreur-insatiable.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "card-sell",
            id: 108
        }
    ];
}

function DominanteGuidaile() {
    this.name = "Dominante Guidaile";
    this.species = "Dragon";
    this.attack = 4;
    this.hp = 9;
    this.src = "dragons/dominante-guidaile.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "attacked",
            id: 114
        }
    ];
}

function ChasseurEcailleux() {
    this.name = "Chasseur Ecailleux";
    this.species = "Dragon";
    this.attack = 7;
    this.hp = 3;
    this.src = "dragons/chasseur-ecailleux.jpg";
    this.tier = 5;
    this.shield = true;
    this.effects = [
        {
            trigger: "turn-end",
            id: 117
        }
    ];
}

function GardienDuTresor() {
    this.name = "Gardien du trésor";
    this.species = "Dragon";
    this.attack = 7;
    this.hp = 6;
    this.src = "dragons/gardien-du-tresor.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "card-place",
            id: 106
        }
    ];
}

function ProtecteurBrillecaille() {
    this.name = "Protecteur Brillécaille";
    this.species = "Dragon";
    this.attack = 6;
    this.hp = 5;
    this.src = "dragons/protecteur-brillecaille.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 115
        }
    ];
}

function TresorDuDragon() {
    this.name = "Trésor du dragon";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "dragons/tresor-du-dragon.jpg";
    this.tier = 2;
    this.requirement = "Dragon";
    this.effects = [
        {
            trigger: "",
            id: 10001
        },
        {
            trigger: "card-sell",
            id: 118
        }
    ];
    this.validTarget = {

    };
}

function RecitDesLegendes() {
    this.name = "Récit des légendes";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "dragons/recit-des-legendes.jpg";
    this.tier = 1;
    this.requirement = "Dragon";
    this.effects = [
        {
            trigger: "",
            id: 119
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Dragon"
    };
}


// Gobelins

function EclaireurGobelin() {
    this.name = "Eclaireur gobelin";
    this.species = "Gobelin";
    this.attack = 1;
    this.hp = 4;
    this.src = "gobelins/eclaireur-gobelin.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 201
        }
    ];
}

function AgitateurGobelin() {
    this.name = "Agitateur gobelin";
    this.species = "Gobelin";
    this.attack = 1;
    this.hp = 1;
    this.src = "gobelins/agitateur-gobelin.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 202
        }
    ];
}

function BatailleurFrenetique() {
    this.name = "Batailleur frénétique";
    this.species = "Gobelin";
    this.attack = 2;
    this.hp = 2;
    this.src = "gobelins/batailleur-frenetique.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "ko",
            id: 205
        }
    ];
}

function DuoDeGobelins() {
    this.name = "Duo de gobelins";
    this.species = "Gobelin";
    this.attack = 3;
    this.hp = 1;
    this.src = "gobelins/duo-de-gobelins.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "ko",
            id: 203
        }
    ];
}

function GobelinApprovisionneur() {
    this.name = "Gobelin approvisionneur";
    this.species = "Gobelin";
    this.attack = 2;
    this.hp = 3;
    this.src = "gobelins/gobelin-approvisionneur.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 211
        }
    ];
}

function ArtilleurVicieux() {
    this.name = "Artilleur vicieux";
    this.species = "Gobelin";
    this.attack = 4;
    this.hp = 3;
    this.src = "gobelins/artilleur-vicieux.jpg";
    this.tier = 3;
    this.range = true;
    this.effects = [
        {
            trigger: "attack",
            id: 207
        }
    ];
}

function ArtisanForgemalice() {
    this.name = "Artisan Forgemalice";
    this.species = "Gobelin";
    this.attack = 3;
    this.hp = 2;
    this.src = "gobelins/artisan-forgemalice.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "card-place",
            id: 210
        }
    ];
}

function ChampionDeFracassecrane() {
    this.name = "Champion de Fracassecrâne";
    this.species = "Gobelin";
    this.attack = 3;
    this.hp = 6;
    this.src = "gobelins/champion-de-fracassecrane.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "battle-start",
            id: 215
        }
    ];
}

function SpecialisteEnExplosions() {
    this.name = "Spécialiste en explosions";
    this.species = "Gobelin";
    this.attack = 5;
    this.hp = 3;
    this.src = "gobelins/specialiste-en-explosions.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 206
        }
    ];
}

function ChefDeGang() {
    this.name = "Chef de gang";
    this.species = "Gobelin";
    this.attack = 4;
    this.hp = 5;
    this.src = "gobelins/chef-de-gang.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 212
        }
    ];
}

function MercenairesGobelins() {
    this.name = "Mercenaires gobelins";
    this.species = "Gobelin";
    this.attack = 3;
    this.hp = 3;
    this.src = "gobelins/mercenaires-gobelins.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "ko",
            id: 214
        }
    ];
}

function CommandantDesArtilleurs() {
    this.name = "Commandant des artilleurs";
    this.species = "Gobelin";
    this.attack = 5;
    this.hp = 6;
    this.src = "gobelins/commandant-des-artilleurs.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 208
        }
    ];
}

function EscouadeHargneuse() {
    this.name = "Escouade hargneuse";
    this.species = "Gobelin";
    this.attack = 5;
    this.hp = 6;
    this.src = "gobelins/escouade-hargneuse.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "ko",
            id: 216
        }
    ];
}

function GuideGobelin() {
    this.name = "Guide gobelin";
    this.species = "Gobelin";
    this.attack = 4;
    this.hp = 3;
    this.src = "gobelins/guide-gobelin.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "battle-start",
            id: 213
        }
    ];
}

function ChefDeGuerreGobelin() {
    this.name = "Chef de guerre gobelin";
    this.species = "Gobelin";
    this.attack = 8;
    this.hp = 3;
    this.src = "gobelins/chef-de-guerre-gobelin.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "attack",
            id: 209
        }
    ];
}

function HordeInfinie() {
    this.name = "Horde infinie";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "gobelins/horde-infinie.jpg";
    this.tier = 4;
    this.requirement = "Gobelin";
    this.effects = [
        {
            trigger: "",
            id: 217
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Gobelin"
    };
}

function GobelinBondissant() {
    this.name = "Gobelin bondissant";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "gobelins/gobelin-bondissant.jpg";
    this.tier = 3;
    this.requirement = "Gobelin";
    this.effects = [
        {
            trigger: "",
            id: 218
        }
    ];
    this.validTarget = {
        area: "any"
    };
}


// Sorciers

function ApprentieMagicienne() {
    this.name = "Apprentie magicienne";
    this.species = "Sorcier";
    this.attack = 1;
    this.hp = 3;
    this.src = "sorciers/apprentie-magicienne.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 301
        }
    ];
}

function PyromancienneNovice() {
    this.name = "Pyromancienne novice";
    this.species = "Sorcier";
    this.attack = 3;
    this.hp = 2;
    this.src = "sorciers/pyromancienne-novice.jpg";
    this.tier = 1;
    this.range = true;
    this.effects = [

    ];
}

function InvocationMineure() {
    this.name = "Invocation mineure";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/invocation-mineure.jpg";
    this.tier = 1;
    this.requirement = "Sorcier";
    this.effects = [
        {
            trigger: "",
            id: 303
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function PrecheurDeLEquilibre() {
    this.name = "Prêcheur de l'Équilibre";
    this.species = "Sorcier";
    this.attack = 3;
    this.hp = 3;
    this.src = "sorciers/precheur-de-l-equilibre.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 315
        }
    ];
}

function MageReflecteur() {
    this.name = "Mage réflecteur";
    this.species = "Sorcier";
    this.attack = 2;
    this.hp = 3;
    this.src = "sorciers/mage-reflecteur.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "spell-play",
            id: 304
        },
        {
            trigger: "turn-start",
            id: 305
        }
    ];
}

function JavelotDeFeu() {
    this.name = "Javelot de feu";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/javelot-de-feu.jpg";
    this.tier = 2;
    this.requirement = "Sorcier";
    this.effects = [
        {
            trigger: "",
            id: 327
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Sorcier"
    };
}

function CanaliseuseDeMana() {
    this.name = "Canaliseuse de mana";
    this.species = "Sorcier";
    this.attack = 3;
    this.hp = 3;
    this.src = "sorciers/canaliseuse-de-mana.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "spell-play",
            id: 306
        }
    ];
}

function AmasseurDePuissance() {
    this.name = "Amasseur de puissance";
    this.species = "Sorcier";
    this.attack = 2;
    this.hp = 5;
    this.src = "sorciers/amasseur-de-puissance.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 308
        }
    ];
}

function EchoArcanique() {
    this.name = "Écho arcanique";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/echo-arcanique.jpg";
    this.tier = 3;
    this.requirement = "Sorcier";
    this.effects = [
        {
            trigger: "",
            id: 324
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function MaitresseDesIllusions() {
    this.name = "Maîtresse des illusions";
    this.species = "Sorcier";
    this.attack = 4;
    this.hp = 6;
    this.src = "sorciers/maitresse-des-illusions.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-end",
            id: 307
        }
    ];
}

function CreationDeFoudre() {
    this.name = "Création de foudre";
    this.species = "Sorcier";
    this.attack = 6;
    this.hp = 3;
    this.src = "sorciers/creation-de-foudre.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "battle-start",
            id: 320
        },
        {
            trigger: "spell-play",
            id: 321
        }
    ];
}

function ReservoirDePuissance() {
    this.name = "Réservoir de puissance";
    this.species = "Autre";
    this.attack = 0;
    this.hp = 2;
    this.src = "sorciers/reservoir-de-puissance.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-start",
            id: 322
        },
        {
            trigger: "",
            id: 323
        }
    ];
}

function PortailDInvocation() {
    this.name = "Portail d'invocation";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/portail-d-invocation.jpg";
    this.tier = 4;
    this.requirement = "Sorcier";
    this.effects = [
        {
            trigger: "",
            id: 314
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function DoyenneDesOracles() {
    this.name = "Doyenne des Oracles";
    this.species = "Sorcier";
    this.attack = 4;
    this.hp = 6;
    this.src = "sorciers/doyenne-des-oracles.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "spell-play",
            id: 310
        }
    ];
}

function ArcanisteAstral() {
    this.name = "Arcaniste astral";
    this.species = "Sorcier";
    this.attack = 4;
    this.hp = 6;
    this.src = "sorciers/arcaniste-astral.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "card-place",
            id: 318
        }
    ];
}

function ArchimageOmnipotent() {
    this.name = "Archimage omnipotent";
    this.species = "Sorcier";
    this.attack = 6;
    this.hp = 6;
    this.src = "sorciers/archimage-omnipotent.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "spell-play",
            id: 311
        },
        {
            trigger: "turn-end",
            id: 312
        },
        {
            trigger: "turn-start",
            id: 313
        }
    ];
}

function SecretsDeLaBibliotheque() {
    this.name = "Secrets de la bibliothèque";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/secrets-de-la-bibliotheque.jpg";
    this.tier = 6;
    this.requirement = "Sorcier";
    this.effects = [
        {
            trigger: "",
            id: 317
        }
    ];
    this.validTarget = {
        area: "any"
    };
}


// Soldats

function FantassinEnArmure() {
    this.name = "Fantassin en armure";
    this.species = "Soldat";
    this.attack = 2;
    this.hp = 1;
    this.src = "soldats/fantassin-en-armure.jpg";
    this.shield = true;
    this.tier = 1;
    this.effects = [

    ];
}

function RecruePeureuse() {
    this.name = "Recrue peureuse";
    this.species = "Soldat";
    this.attack = 5;
    this.hp = 2;
    this.src = "soldats/recrue-peureuse.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "ko",
            id: 413
        }
    ];
}

function CapitaineDEscouade() {
    this.name = "Capitaine d'escouade";
    this.species = "Soldat";
    this.attack = 2;
    this.hp = 3;
    this.src = "soldats/capitaine-d-escouade.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 401
        }
    ];
}

function RecruteurDeLaLegion() {
    this.name = "Recruteur de la Légion";
    this.species = "Soldat";
    this.attack = 4;
    this.hp = 3;
    this.src = "soldats/recruteur-de-la-legion.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 414
        }
    ];
}

function NobleCamaraderie() {
    this.name = "Noble camaraderie";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "soldats/noble-camaraderie.jpg";
    this.tier = 2;
    this.requirement = "Soldat";
    this.effects = [
        {
            trigger: "",
            id: 417
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Soldat"
    };
}

function EcraseuseAuBouclier() {
    this.name = "Écraseuse au bouclier";
    this.species = "Soldat";
    this.attack = 5;
    this.hp = 3;
    this.src = "soldats/ecraseuse-au-bouclier.jpg";
    this.shield = true;
    this.tier = 3;
    this.effects = [
        {
            trigger: "attack",
            id: 403
        },
        {
            trigger: "attacked",
            id: 404
        }
    ];
}
function BalisteDeLaLegion() {
    this.name = "Baliste de la Légion";
    this.species = "Soldat";
    this.attack = 6;
    this.hp = 2;
    this.src = "soldats/baliste-de-la-legion.jpg";
    this.range = true;
    this.tier = 3;
    this.effects = [
        {
            trigger: "battle-start",
            id: 409
        }
    ];
}

function CommandanteSylvelame() {
    this.name = "Commandante Sylvelame";
    this.species = "Soldat";
    this.attack = 3;
    this.hp = 3;
    this.src = "soldats/commandante-sylvelame.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "turn-end",
            id: 410
        }
    ];
}

function ProtectionDUrgence() {
    this.name = "Protection d'urgence";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "soldats/protection-d-urgence.jpg";
    this.tier = 3;
    this.requirement = "Soldat";
    this.effects = [
        {
            trigger: "",
            id: 418
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function ProtectriceDevouee() {
    this.name = "Protectrice dévouée";
    this.species = "Soldat";
    this.attack = 4;
    this.hp = 4;
    this.src = "soldats/protectrice-devouee.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 402
        }
    ];
}

function TacticienDeLaLegion() {
    this.name = "Tacticien de la Légion";
    this.species = "Soldat";
    this.attack = 3;
    this.hp = 5;
    this.src = "soldats/tacticien-de-la-legion.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "battle-start",
            id: 411
        }
    ];
}

function MentorChevaleresque() {
    this.name = "Mentor chevaleresque";
    this.species = "Soldat";
    this.attack = 5;
    this.hp = 5;
    this.src = "soldats/mentor-chevaleresque.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "battle-start",
            id: 412
        }
    ];
}

function VeteranSylvebouclier() {
    this.name = "Vétéran Sylvebouclier";
    this.species = "Soldat";
    this.attack = 1;
    this.hp = 7;
    this.src = "soldats/veteran-sylvebouclier.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "card-place",
            id: 405
        }
    ];
}

function ChevalierLoyal() {
    this.name = "Chevalier loyal";
    this.species = "Soldat";
    this.attack = 4;
    this.hp = 5;
    this.src = "soldats/chevalier-loyal.jpg";
    this.tier = 5;
    this.shield = true;
    this.effects = [
        {
            trigger: "ko",
            id: 408
        }
    ];
}

function HeroineDeLaLegion() {
    this.name = "Héroïne de la Légion";
    this.species = "Soldat";
    this.attack = 5;
    this.hp = 7;
    this.src = "soldats/heroine-de-la-legion.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "attack",
            id: 416
        }
    ];
}

function GeneralEthere() {
    this.name = "Général étheré";
    this.species = "Soldat";
    this.attack = 3;
    this.hp = 7;
    this.src = "soldats/general-ethere.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "attack",
            id: 406
        },
        {
            trigger: "attacked",
            id: 407
        }
    ];
}

function PaladinInspirateur() {
    this.name = "Paladin inspirateur";
    this.species = "Soldat";
    this.attack = 8;
    this.hp = 6;
    this.src = "soldats/paladin-inspirateur.jpg";
    this.tier = 6;
    this.shield = true;
    this.effects = [
        {
            trigger: "turn-start",
            id: 415
        }
    ];
}


// Bandits

function ArchereAuxTraitsDeFeu() {
    this.name = "Archère aux traits de feu";
    this.species = "Bandit";
    this.attack = 1;
    this.hp = 4;
    this.src = "bandits/archere-aux-traits-de-feu.jpg";
    this.tier = 1;
    this.effects = [

    ];
    this.range = true;
}

function GredinAgile() {
    this.name = "Gredin agile";
    this.species = "Bandit";
    this.attack = 3;
    this.hp = 1;
    this.src = "bandits/gredin-agile.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "battle-start",
            id: 502
        }
    ];
}

function VoleuseALaTire() {
    this.name = "Voleuse à la tire";
    this.species = "Bandit";
    this.attack = 1;
    this.hp = 1;
    this.src = "bandits/voleuse-a-la-tire.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 501
        }
    ];
}

function PilleurDeBibliotheque() {
    this.name = "Pilleur de bibliothèque";
    this.species = "Bandit";
    this.attack = 2;
    this.hp = 2;
    this.src = "bandits/pilleur-de-bibliotheque.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 503
        }
    ];
}

function SiphonneuseDeMana() {
    this.name = "Siphonneuse de mana";
    this.species = "Bandit";
    this.attack = 2;
    this.hp = 4;
    this.src = "bandits/siphonneuse-de-mana.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 504
        },
        {
            trigger: "spell-play",
            id: 505
        }
    ];
}

function VoleurAudacieux() {
    this.name = "Voleur audacieux";
    this.species = "Bandit";
    this.attack = 5;
    this.hp = 3;
    this.src = "bandits/voleur-audacieux.jpg";
    this.tier = 3;
    this.range = true;
    this.effects = [
        {
            trigger: "card-place",
            id: 506
        }
    ];
}

function OmbreSansVisage() {
    this.name = "Ombre sans visage";
    this.species = "Bandit";
    this.attack = 3;
    this.hp = 3;
    this.src = "bandits/ombre-sans-visage.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "card-place",
            id: 509
        }
    ];
}

function LanceuseDeDagues() {
    this.name = "Lanceuse de dagues";
    this.species = "Bandit";
    this.attack = 4;
    this.hp = 3;
    this.src = "bandits/lanceuse-de-dagues.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "card-place",
            id: 511
        }
    ];
}

function Corruption() {
    this.name = "Corruption";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "bandits/corruption.jpg";
    this.tier = 3;
    this.requirement = "Bandit";
    this.effects = [
        {
            trigger: "",
            id: 516
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function PasseMuraille() {
    this.name = "Passe-muraille";
    this.species = "Bandit";
    this.attack = 5;
    this.hp = 5;
    this.src = "bandits/passe-muraille.jpg";
    this.tier = 4;
    this.range = true;
    this.effects = [
        {
            trigger: "attack",
            id: 508
        }
    ];
}

function PiegeuseDAmes() {
    this.name = "Piégeuse d'âmes";
    this.species = "Bandit";
    this.attack = 6;
    this.hp = 5;
    this.src = "bandits/piegeuse-d-ames.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 512
        }
    ];
}

function VoleurDePensees() {
    this.name = "Voleur de pensées";
    this.species = "Bandit";
    this.attack = 4;
    this.hp = 4;
    this.src = "bandits/voleur-de-pensees.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-end",
            id: 515
        }
    ];
}

function BonTuyau() {
    this.name = "Bon tuyau";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "bandits/bon-tuyau.jpg";
    this.tier = 4;
    this.requirement = "Bandit";
    this.effects = [
        {
            trigger: "",
            id: 517
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function SaboteurMasque() {
    this.name = "Saboteur masqué";
    this.species = "Bandit";
    this.attack = 1;
    this.hp = 2;
    this.src = "bandits/saboteur-masque.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "battle-start",
            id: 507
        }
    ];
}

function PillardeInconsciente() {
    this.name = "Pillarde inconsciente";
    this.species = "Bandit";
    this.attack = 4;
    this.hp = 6;
    this.src = "bandits/pillarde-inconsciente.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "card-sell",
            id: 510
        }
    ];
}

function ReceleurDeTresors() {
    this.name = "Receleur de trésors";
    this.species = "Bandit";
    this.attack = 5;
    this.hp = 8;
    this.src = "bandits/receleur-de-tresors.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "card-place",
            id: 513
        },
        {
            trigger: "spell-play",
            id: 514
        }
    ];
}

function AssassinSilencieux() {
    this.name = "Assassin silencieux";
    this.species = "Bandit";
    this.attack = 1;
    this.hp = 9;
    this.src = "bandits/assassin-silencieux.jpg";
    this.tier = 6;
    this.deathtouch = true;
    this.effects = [

    ];
}


// Machines

function PlaneurDeFortune() {
    this.name = "Planeur de fortune";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 3;
    this.src = "machines/planeur-de-fortune.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 603
        }
    ];
}

function RenardMecanique() {
    this.name = "Renard mécanique";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 3;
    this.src = "machines/renard-mecanique.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "turn-start",
            id: 602
        }
    ];
}

function GardeDeFer() {
    this.name = "Garde de fer";
    this.species = "Machine";
    this.attack = 4;
    this.hp = 1;
    this.src = "machines/garde-de-fer.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 616
        }
    ];
}

function ProtecteurDeLaCite() {
    this.name = "Protecteur de la cité";
    this.species = "Machine";
    this.attack = 3;
    this.hp = 4;
    this.src = "machines/protecteur-de-la-cite.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "turn-start",
            id: 605
        }
    ];
}

function AutoDuplicateur() {
    this.name = "Auto-duplicateur";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 2;
    this.src = "machines/auto-duplicateur.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "ko",
            id: 613
        }
    ];
}

function RobotAstiqueur() {
    this.name = "Robot astiqueur";
    this.species = "Machine";
    this.attack = 3;
    this.hp = 3;
    this.src = "machines/robot-astiqueur.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "shop-refresh",
            id: 617
        },
        {
            trigger: "card-place",
            id: 618
        },
        {
            trigger: "turn-start",
            id: 622
        }
    ];
}

function ReplicationMecanique() {
    this.name = "Réplication mécanique";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "machines/replication-mecanique.jpg";
    this.tier = 2;
    this.requirement = "Machine";
    this.effects = [
        {
            trigger: "",
            id: 620
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Machine"
    };
}

function ColosseAdaptatif() {
    this.name = "Colosse adaptatif";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 5;
    this.src = "machines/colosse-adaptatif.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "turn-start",
            id: 604
        }
    ];
}

function GolemCinetique() {
    this.name = "Golem cinétique";
    this.species = "Machine";
    this.attack = 5;
    this.hp = 4;
    this.src = "machines/golem-cinetique.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "",
            id: 606
        }
    ];
}

function CarcasseMecanophage() {
    this.name = "Carcasse mécanophage";
    this.species = "Machine";
    this.attack = 6;
    this.hp = 4;
    this.src = "machines/carcasse-mecanophage.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-end",
            id: 607
        }
    ];
}

function AutomateManaforme() {
    this.name = "Automate manaforme";
    this.species = "Machine";
    this.attack = 5;
    this.hp = 4;
    this.src = "machines/automate-manaforme.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-start",
            id: 612
        }
    ];
}

function ChefDeLaProliferation() {
    this.name = "Chef de la Prolifération";
    this.species = "Machine";
    this.attack = 4;
    this.hp = 6;
    this.src = "machines/chef-de-la-proliferation.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "battle-summon",
            id: 614
        }
    ];
}

function BalisteAmbulante() {
    this.name = "Baliste ambulante";
    this.species = "Machine";
    this.attack = 7;
    this.hp = 3;
    this.src = "machines/baliste-ambulante.jpg";
    this.tier = 5;
    this.range = true;
    this.effects = [
        {
            trigger: "battle-start",
            id: 611
        }
    ];
}

function OuvrierAssembleur() {
    this.name = "Ouvrier assembleur";
    this.species = "Machine";
    this.attack = 7;
    this.hp = 3;
    this.src = "machines/ouvrier-assembleur.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "ko",
            id: 615
        }
    ];
}

function ArtisanGadgetiste() {
    this.name = "Artisan gadgétiste";
    this.species = "Autre";
    this.attack = 5;
    this.hp = 5;
    this.src = "machines/artisan-gadgetiste.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "turn-end",
            id: 610
        }
    ];
}

function AutomateReplicateur() {
    this.name = "Automate réplicateur";
    this.species = "Machine";
    this.attack = 6;
    this.hp = 6;
    this.src = "machines/automate-replicateur.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "ko",
            id: 608
        }
    ];
}

function RevisionsMecaniques() {
    this.name = "Révisions mécaniques";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "machines/revisions-mecaniques.jpg";
    this.tier = 6;
    this.requirement = "Machine";
    this.effects = [
        {
            trigger: "",
            id: 621
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Machine"
    };
}


// Bêtes

function PredateurEnChasse() {
    this.name = "Prédateur en chasse";
    this.species = "Bête";
    this.attack = 2;
    this.hp = 2;
    this.src = "betes/predateur-en-chasse.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 701
        }
    ];
}

function DevoreurSauvage() {
    this.name = "Dévoreur sauvage";
    this.species = "Bête";
    this.attack = 1;
    this.hp = 1;
    this.src = "betes/devoreur-sauvage.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-place",
            id: 702
        }
    ];
}

function ChasseurBondissant() {
    this.name = "Chasseur bondissant";
    this.species = "Bête";
    this.attack = 2;
    this.hp = 2;
    this.src = "betes/chasseur-bondissant.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 703
        }
    ];
}

function AmeRugissante() {
    this.name = "Âme rugissante";
    this.species = "Bête";
    this.attack = 2;
    this.hp = 3;
    this.src = "betes/ame-rugissante.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 706
        }
    ];
}

function ChasseBenie() {
    this.name = "Bénédiction de chasse";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "betes/chasse-benie.jpg";
    this.tier = 2;
    this.requirement = "Bête";
    this.effects = [
        {
            trigger: "",
            id: 716
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function HurleurDesSylves() {
    this.name = "Hurleur des sylves";
    this.species = "Bête";
    this.attack = 4;
    this.hp = 3;
    this.src = "betes/hurleur-des-sylves.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 713
        }
    ];
}

function ColonieDeRats() {
    this.name = "Colonie de rats";
    this.species = "Bête";
    this.attack = 5;
    this.hp = 3;
    this.src = "betes/colonie-de-rats.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 707
        }
    ];
}

function HydreVorace() {
    this.name = "Hydre vorace";
    this.species = "Bête";
    this.attack = 4;
    this.hp = 4;
    this.src = "betes/hydre-vorace.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "card-place",
            id: 708
        }
    ];
}

function ChargeurCuirasse() {
    this.name = "Chargeur cuirassé";
    this.species = "Bête";
    this.attack = 1;
    this.hp = 1;
    this.src = "betes/chargeur-cuirasse.jpg";
    this.tier = 3;
    this.shield = true;
    this.effects = [
        {
            trigger: "battle-start",
            id: 714
        }
    ];
}

function GuivreColossale() {
    this.name = "Guivre colossale";
    this.species = "Bête";
    this.attack = 4;
    this.hp = 4;
    this.src = "betes/guivre-colossale.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "turn-start",
            id: 704
        }
    ];
}

function AlligatorCharognard() {
    this.name = "Alligator charognard";
    this.species = "Bête";
    this.attack = 5;
    this.hp = 6;
    this.src = "betes/alligator-charognard.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "card-sell",
            id: 712
        }
    ];
}

function Traque() {
    this.name = "Traque";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "betes/traque.jpg";
    this.tier = 4;
    this.requirement = "Bête";
    this.effects = [
        {
            trigger: "",
            id: 717
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function GardienDeLaForet() {
    this.name = "Gardien de la forêt";
    this.species = "Bête";
    this.attack = 4;
    this.hp = 6;
    this.src = "betes/gardien-de-la-foret.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "attacked",
            id: 705
        }
    ];
}

function HydreEnragee() {
    this.name = "Hydre enragée";
    this.species = "Bête";
    this.attack = 7;
    this.hp = 7;
    this.src = "betes/hydre-enragee.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 709
        }
    ];
}

function MastodonteGalopant() {
    this.name = "Mastodonte galopant";
    this.species = "Bête";
    this.attack = 8;
    this.hp = 8;
    this.src = "betes/mastodonte-galopant.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "attack",
            id: 715
        }
    ];
}

function AvatarDeLaPredation() {
    this.name = "Avatar de la prédation";
    this.species = "Bête";
    this.attack = 8;
    this.hp = 6;
    this.src = "betes/avatar-de-la-predation.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "turn-end",
            id: 710
        }
    ];
}

function MeneuseDeBetes() {
    this.name = "Meneuse de bêtes";
    this.species = "Autre";
    this.attack = 4;
    this.hp = 9;
    this.src = "betes/meneuse-de-betes.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "card-place",
            id: 711
        }
    ];
}


// Morts-vivants

function ServiteurExhume() {
    this.name = "Serviteur exhumé";
    this.species = "Mort-Vivant";
    this.attack = 2;
    this.hp = 1;
    this.src = "morts-vivants/serviteur-exhume.jpg";
    this.revive = true;
    this.tier = 1;
    this.effects = [

    ];
}

function SqueletteReconstitue() {
    this.name = "Squelette reconstitué";
    this.species = "Mort-Vivant";
    this.attack = 1;
    this.hp = 3;
    this.src = "morts-vivants/squelette-reconstitue.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "ko",
            id: 801
        }
    ];
}

function ArcherSquelette() {
    this.name = "Archer squelette";
    this.species = "Mort-Vivant";
    this.attack = 3;
    this.hp = 1;
    this.src = "morts-vivants/archer-squelette.jpg";
    this.tier = 2;
    this.revive = true;
    this.range = true;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 802
        }
    ];
}

function GuerrierMaudit() {
    this.name = "Guerrier maudit";
    this.species = "Mort-Vivant";
    this.attack = 3;
    this.hp = 2;
    this.src = "morts-vivants/guerrier-maudit.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "ko",
            id: 810
        }
    ];
}

function SoldatRevenuALaVie() {
    this.name = "Soldat revenu à la vie";
    this.species = "Mort-Vivant";
    this.attack = 1;
    this.hp = 1;
    this.src = "morts-vivants/soldat-revenu-a-la-vie.jpg";
    this.tier = 2;
    this.revive = true;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 814
        }
    ];
}

function DevoreurPourrissant() {
    this.name = "Dévoreur pourrissant";
    this.species = "Mort-Vivant";
    this.attack = 4;
    this.hp = 3;
    this.src = "morts-vivants/devoreur-pourrissant.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "ko",
            id: 804
        }
    ];
}

function EveilleurDAmes() {
    this.name = "Eveilleur d'âmes";
    this.species = "Mort-Vivant";
    this.attack = 3;
    this.hp = 3;
    this.src = "morts-vivants/eveilleur-d-ames.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 805
        }
    ];
}

function AssistantDuRaccommodeur() {
    this.name = "Assistant du raccommodeur";
    this.species = "Mort-Vivant";
    this.attack = 3;
    this.hp = 3;
    this.src = "morts-vivants/assistant-du-raccommodeur.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "card-place",
            id: 815
        }
    ];
}

function DragonDecharne() {
    this.name = "Dragon décharné";
    this.species = "Mort-Vivant";
    this.attack = 5;
    this.hp = 3;
    this.src = "morts-vivants/dragon-decharne.jpg";
    this.tier = 4;
    this.revive = true;
    this.effects = [
        {
            trigger: "card-place",
            id: 812
        }
    ];
}

function CranePossede() {
    this.name = "Crâne possédé";
    this.species = "Mort-Vivant";
    this.attack = 1;
    this.hp = 7;
    this.src = "morts-vivants/crane-possede.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "attacked",
            id: 811
        }
    ];
}

function NecromancienneCorrompue() {
    this.name = "Nécromancienne corrompue";
    this.species = "Autre";
    this.attack = 2;
    this.hp = 6;
    this.src = "morts-vivants/necromancienne-corrompue.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "ko",
            id: 807
        },
        {
            trigger: "ko",
            id: 808
        }
    ];
}

function CreationAbjecte() {
    this.name = "Création abjecte";
    this.species = "Mort-Vivant";
    this.attack = 4;
    this.hp = 4;
    this.src = "morts-vivants/creation-abjecte.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "ko",
            id: 806
        }
    ];
}

function RegainDeVie() {
    this.name = "Regain de vie";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "morts-vivants/regain-de-vie.jpg";
    this.tier = 6;
    this.requirement = "Mort-Vivant";
    this.effects = [
        {
            trigger: "",
            id: 816
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Mort-Vivant"
    };
}

function MarcheurEternel() {
    this.name = "Marcheur éternel";
    this.species = "Mort-Vivant";
    this.attack = 6;
    this.hp = 1;
    this.src = "morts-vivants/marcheur-eternel.jpg";
    this.tier = 6;
    this.revive = true;
    this.effects = [
        {
            trigger: "ko",
            id: 813
        }
    ];
}

function LicheProfanatrice() {
    this.name = "Liche profanatrice";
    this.species = "Mort-Vivant";
    this.attack = 8;
    this.hp = 2;
    this.src = "morts-vivants/liche-profanatrice.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "ko",
            id: 803
        }
    ];
}

function RaccommodeurDeCadavres() {
    this.name = "Raccommodeur de cadavres";
    this.species = "Autre";
    this.attack = 6;
    this.hp = 6;
    this.src = "morts-vivants/raccommodeur-de-cadavres.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "ko",
            id: 809
        }
    ];
}

function RiteDeSang() {
    this.name = "Rite de sang";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "morts-vivants/rite-de-sang.jpg";
    this.tier = 6;
    this.requirement = "Mort-Vivant";
    this.effects = [
        {
            trigger: "",
            id: 817
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Mort-Vivant"
    };
}


// Sylvain

function InvocationSylvestre() {
    this.name = "Invocation sylvestre";
    this.species = "Sylvain";
    this.attack = 1;
    this.hp = 3;
    this.src = "sylvains/invocation-sylvestre.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "attacked",
            id: 901
        }
    ];
}

function ChamaneDesLignesDeVie() {
    this.name = "Chamane des lignes de vie";
    this.species = "Sylvain";
    this.attack = 2;
    this.hp = 3;
    this.src = "sylvains/chamane-des-lignes-de-vie.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "card-sell",
            id: 902
        }
    ];
}

function GardienDeNoirepine() {
    this.name = "Gardien de Noirépine";
    this.species = "Sylvain";
    this.attack = 0;
    this.hp = 4;
    this.src = "sylvains/gardien-de-noirepine.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "attacked",
            id: 903
        },
        {
            trigger: "",
            id: 323
        }
    ];
}

function BrisesortElfique() {
    this.name = "Brisesort elfique";
    this.species = "Sylvain";
    this.attack = 4;
    this.hp = 2;
    this.src = "sylvains/brisesort-elfique.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "battle-start",
            id: 904
        }
    ];
}

function ColosseCentenaire() {
    this.name = "Colosse centenaire";
    this.species = "Sylvain";
    this.attack = 2;
    this.hp = 3;
    this.src = "sylvains/colosse-centenaire.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 905
        }
    ];
}

function FaconneurDeForets() {
    this.name = "Façonneur de forêts";
    this.species = "Sylvain";
    this.attack = 5;
    this.hp = 3;
    this.src = "sylvains/faconneur-de-forets.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "ko",
            id: 906
        }
    ];
}

function CombattantEmbusque() {
    this.name = "Combattant embusqué";
    this.species = "Sylvain";
    this.attack = 5;
    this.hp = 2;
    this.src = "sylvains/combattant-embusque.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "reposition",
            id: 907
        }
    ];
}

function DruidesseDesLignesDeVie() {
    this.name = "Druidesse des lignes de vie";
    this.species = "Sylvain";
    this.attack = 2;
    this.hp = 2;
    this.src = "sylvains/druidesse-des-lignes-de-vie.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "turn-end",
            id: 908
        }
    ];
}

function MaledictionVegetale() {
    this.name = "Malédiction végétale";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sylvains/malediction-vegetale.jpg";
    this.tier = 3;
    this.requirement = "Sylvain";
    this.effects = [
        {
            trigger: "",
            id: 916
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Sylvain"
    };
}

function ArchereDeNoirepine() {
    this.name = "Archère de Noirépine";
    this.species = "Sylvain";
    this.attack = 4;
    this.hp = 3;
    this.src = "sylvains/archere-de-noirepine.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "attack",
            id: 909
        }
    ];
}

function VengeurDesSylves() {
    this.name = "Vengeur des sylves";
    this.species = "Sylvain";
    this.attack = 3;
    this.hp = 2;
    this.src = "sylvains/vengeur-des-sylves.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "ko",
            id: 910
        }
    ];
}

function SageFongimancien() {
    this.name = "Sage fongimancien";
    this.species = "Sylvain";
    this.attack = 4;
    this.hp = 2;
    this.src = "sylvains/sage-fongimancien.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "ko",
            id: 911
        }
    ];
}

function ChevaucheurSauvage() {
    this.name = "Chevaucheur sauvage";
    this.species = "Sylvain";
    this.attack = 3;
    this.hp = 6;
    this.src = "sylvains/chevaucheur-sauvage.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "reposition",
            id: 912
        }
    ];
}

function CavalierDesRonces() {
    this.name = "Cavalier des ronces";
    this.species = "Sylvain";
    this.attack = 5;
    this.hp = 5;
    this.src = "sylvains/cavalier-des-ronces.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "attacked",
            id: 913
        }
    ];
}

function ArmureDeRonces() {
    this.name = "Armure de ronces";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sylvains/armure-de-ronces.jpg";
    this.tier = 5;
    this.requirement = "Sylvain";
    this.effects = [
        {
            trigger: "",
            id: 918
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Sylvain"
    };
}

function IncarnationDeLaForet() {
    this.name = "Incarnation de la forêt";
    this.species = "Sylvain";
    this.attack = 3;
    this.hp = 8;
    this.src = "sylvains/incarnation-de-la-foret.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "card-place",
            id: 914
        }
    ];
}

function ElueDesSylves() {
    this.name = "Elue des sylves";
    this.species = "Sylvain";
    this.attack = 6;
    this.hp = 6;
    this.src = "sylvains/elue-des-sylves.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "reposition",
            id: 915
        }
    ];
}


// Horde

function MinotaureChargeur() {
    this.name = "Minotaure chargeur";
    this.species = "Horde";
    this.attack = 2;
    this.hp = 3;
    this.src = "horde/minotaure-chargeur.jpg";
    this.tier = 1;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "battle-start",
            id: 1001
        }
    ];
}

function AssiegeantOrc() {
    this.name = "Assiegeant orc";
    this.species = "Horde";
    this.attack = 3;
    this.hp = 1;
    this.src = "horde/assiegeant-orc.jpg";
    this.tier = 1;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1002
        }
    ];
}

function RavageurDesFalaises() {
    this.name = "Ravageur des falaises";
    this.species = "Horde";
    this.attack = 3;
    this.hp = 3;
    this.src = "horde/ravageur-des-falaises.jpg";
    this.tier = 2;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "turn-start",
            id: 1003
        },
        {
            trigger: "turn-end",
            id: 1004
        }
    ];
}

function MassacreurDeFracassecrane() {
    this.name = "Massacreur de Fracassecrâne";
    this.species = "Horde";
    this.attack = 4;
    this.hp = 2;
    this.src = "horde/massacreur-de-fracassecrane.jpg";
    this.tier = 2;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "card-place",
            id: 1005
        }
    ];
}

function BruteADeuxTetes() {
    this.name = "Brute à deux têtes";
    this.species = "Horde";
    this.attack = 4;
    this.hp = 2;
    this.src = "horde/brute-a-deux-tetes.jpg";
    this.tier = 2;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "turn-end",
            id: 1006
        }
    ];
}

function GeantEcrabouilleur() {
    this.name = "Géant écrabouilleur";
    this.species = "Horde";
    this.attack = 2;
    this.hp = 5;
    this.src = "horde/geant-ecrabouilleur.jpg";
    this.tier = 3;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "battle-start",
            id: 1007
        },
        {
            trigger: "battle-start",
            id: 1008
        }
    ];
}

function PyromaneDeLaHorde() {
    this.name = "Pyromane de la Horde";
    this.species = "Horde";
    this.attack = 5;
    this.hp = 3;
    this.src = "horde/pyromane-de-la-horde.jpg";
    this.tier = 3;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "card-sell",
            id: 1009
        }
    ];
}

function MasseDeLaBrutalite() {
    this.name = "Masse de la brutalité";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "horde/masse-de-la-brutalite.jpg";
    this.tier = 3;
    this.requirement = "Horde";
    this.effects = [
        {
            trigger: "",
            id: 1019
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Horde"
    };
}

function MeneuseDuClanSylvegarde() {
    this.name = "Meneuse du clan Sylvegarde";
    this.species = "Horde";
    this.attack = 2;
    this.hp = 3;
    this.src = "horde/meneuse-du-clan-sylvegarde.jpg";
    this.tier = 4;
    this.reputation = 8;
    this.effects = [
        {
            trigger: "",
            id: 1010
        }
    ];
}

function ExecuteurImplacable() {
    this.name = "Exécuteur implacable";
    this.species = "Horde";
    this.attack = 6;
    this.hp = 3;
    this.src = "horde/executeur-implacable.jpg";
    this.tier = 4;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "card-place",
            id: 1011
        }
    ];
}

function ExhorteurDeLaHorde() {
    this.name = "Exhorteur de la Horde";
    this.species = "Horde";
    this.attack = 4;
    this.hp = 4;
    this.src = "horde/exhorteur-de-la-horde.jpg";
    this.tier = 4;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "turn-end",
            id: 1012
        }
    ];
}

function BatailleurBrisefer() {
    this.name = "Batailleur brisefer";
    this.species = "Horde";
    this.attack = 5;
    this.hp = 5;
    this.src = "horde/batailleur-brisefer.jpg";
    this.tier = 5;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "card-place",
            id: 1013
        }
    ];
}

function VeteranDeFracassecrane() {
    this.name = "Vétéran de Fracassecrâne";
    this.species = "Horde";
    this.attack = 4;
    this.hp = 6;
    this.src = "horde/veteran-de-fracassecrane.jpg";
    this.tier = 5;
    this.reputation = 3;
    this.effects = [
        {
            trigger: "turn-end",
            id: 1014
        }
    ];
}

function GeantDestructeur() {
    this.name = "Géant destructeur";
    this.species = "Horde";
    this.attack = 8;
    this.hp = 2;
    this.src = "horde/geant-destructeur.jpg";
    this.tier = 5;
    this.shield = true;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "battle-start",
            id: 1015
        }
    ];
}

function SummumDeLaGloire() {
    this.name = "Summum de la gloire";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "horde/summum-de-la-gloire.jpg";
    this.tier = 5;
    this.requirement = "Horde";
    this.effects = [
        {
            trigger: "",
            id: 1020
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Horde"
    };
}

function ObliterateurGoliath() {
    this.name = "Oblitérateur goliath";
    this.species = "Horde";
    this.attack = 1;
    this.hp = 1;
    this.src = "horde/obliterateur-goliath.jpg";
    this.tier = 6;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "battle-start",
            id: 1016
        }
    ];
}

function AnnihilateurMinotaure() {
    this.name = "Annihilateur minotaure";
    this.species = "Horde";
    this.attack = 9;
    this.hp = 3;
    this.src = "horde/annihilateur-minotaure.jpg";
    this.tier = 6;
    this.reputation = 0;
    this.effects = [
        {
            trigger: "attack",
            id: 1017
        },
        {
            trigger: "attacked",
            id: 1018
        }
    ];
}


// Démon

function DemonInferieur() {
    this.name = "Démon inférieur";
    this.species = "Démon";
    this.attack = 3;
    this.hp = 3;
    this.src = "demons/demon-inferieur.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "attack",
            id: 1101
        }
    ];
}

function GuetteurDemoniaque() {
    this.name = "Guetteur démoniaque";
    this.species = "Démon";
    this.attack = 1;
    this.hp = 3;
    this.src = "demons/guetteur-demoniaque.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1102
        }
    ];
}

function PretreCorrompu() {
    this.name = "Prêtre corrompu";
    this.species = "Autre";
    this.attack = 1;
    this.hp = 5;
    this.src = "demons/pretre-corrompu.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1103
        }
    ];
}

function EcumeurDesTerresDesolees() {
    this.name = "Ecumeur des terres désolées";
    this.species = "Démon";
    this.attack = 4;
    this.hp = 2;
    this.src = "demons/ecumeur-des-terres-desolees.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 1104
        },
        {
            trigger: "turn-start",
            id: 1105
        }
    ];
}

function DiablomancienDeLAbysse() {
    this.name = "Diablomancien de l'Abysse";
    this.species = "Démon";
    this.attack = 2;
    this.hp = 2;
    this.src = "demons/diablomancien-de-l-abysse.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 1106
        }
    ];
}

function FleauDesTerresDesolees() {
    this.name = "Fléau des terres désolées";
    this.species = "Démon";
    this.attack = 1;
    this.hp = 7;
    this.src = "demons/fleau-des-terres-desolees.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1107
        }
    ];
}

function IncarnationDuChaos() {
    this.name = "Incarnation du chaos";
    this.species = "Démon";
    this.attack = 4;
    this.hp = 3;
    this.src = "demons/incarnation-du-chaos.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1108
        }
    ];
}

function PorteurDeLaNoireParole() {
    this.name = "Porteur de la noire parole";
    this.species = "Autre";
    this.attack = 1;
    this.hp = 6;
    this.src = "demons/porteur-de-la-noire-parole.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1109
        },
        {
            trigger: "turn-start",
            id: 1110
        }
    ];
}

function MoissonneurDeVitalite() {
    this.name = "Moissonneur de vitalité";
    this.species = "Démon";
    this.attack = 4;
    this.hp = 4;
    this.src = "demons/moissonneur-de-vitalite.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "battle-start",
            id: 1112
        }
    ];
}

function AdepteDuCulteDuSang() {
    this.name = "Adepte du culte du sang";
    this.species = "Autre";
    this.attack = 2;
    this.hp = 5;
    this.src = "demons/adepte-du-culte-du-sang.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1113
        }
    ];
}

function AnnonciatriceFuneste() {
    this.name = "Annonciatrice funeste";
    this.species = "Autre";
    this.attack = 0;
    this.hp = 7;
    this.src = "demons/annonciatrice-funeste.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "",
            id: 323
        },
        {
            trigger: "ko",
            id: 1118
        }
    ];
}

function PacteDemoniaque() {
    this.name = "Pacte démoniaque";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "demons/pacte-demoniaque.jpg";
    this.tier = 4;
    this.requirement = "Démon";
    this.effects = [
        {
            trigger: "",
            id: 1119
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function PoeteALaPlumeSanglante() {
    this.name = "Poète à la plume sanglante";
    this.species = "Démon";
    this.attack = 4;
    this.hp = 5;
    this.src = "demons/poete-a-la-plume-sanglante.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "card-place",
            id: 1114
        }
    ];
}

function DiviniteDechue() {
    this.name = "Divinité déchue";
    this.species = "Démon";
    this.attack = 3;
    this.hp = 8;
    this.src = "demons/divinite-dechue.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1115
        }
    ];
}

function AngeTranscende() {
    this.name = "Ange transcendé";
    this.species = "Démon";
    this.attack = 1;
    this.hp = 9;
    this.src = "demons/ange-transcende.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1116
        }
    ];
}

function TortionnaireDAmes() {
    this.name = "Tortionnaire d'âmes";
    this.species = "Démon";
    this.attack = 7;
    this.hp = 5;
    this.src = "demons/tortionnaire-d-ames.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "ko",
            id: 1117
        }
    ];
}

function LibererLeMal() {
    this.name = "Libérer le Mal";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "demons/liberer-le-mal.jpg";
    this.tier = 6;
    this.requirement = "Démon";
    this.effects = [
        {
            trigger: "",
            id: 1120
        }
    ];
    this.validTarget = {
        area: "board",
        species: "Démon"
    };
}


// Elémentaire

function FamilierChatfeu() {
    this.name = "Familier chatfeu";
    this.species = "Elémentaire";
    this.attack = 3;
    this.hp = 4;
    this.src = "elementaires/familier-chatfeu.jpg";
    this.tier = 1;
    this.elements = ["Feu"];
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1201
        }
    ];
}

function GolemDemolisseur() {
    this.name = "Golem démolisseur";
    this.species = "Elémentaire";
    this.attack = 1;
    this.hp = 4;
    this.src = "elementaires/golem-demolisseur.jpg";
    this.tier = 1;
    this.elements = ["Terre"];
    this.effects = [
        {
            trigger: "card-sell",
            id: 1202
        }
    ];
}

function EspritDesRivieres() {
    this.name = "Esprit des rivières";
    this.species = "Elémentaire";
    this.attack = 2;
    this.hp = 5;
    this.src = "elementaires/esprit-des-rivieres.jpg";
    this.tier = 2;
    this.elements = ["Eau"];
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1203
        }
    ];
}

function FaconneuseDeNuages() {
    this.name = "Façonneuse de nuages";
    this.species = "Elémentaire";
    this.attack = 3;
    this.hp = 3;
    this.src = "elementaires/faconneuse-de-nuages.jpg";
    this.tier = 2;
    this.elements = ["Air"];
    this.effects = [
        {
            trigger: "card-place",
            id: 1204
        }
    ];
}

function SculpteurElementaire() {
    this.name = "Sculpteur élémentaire";
    this.species = "Autre";
    this.attack = 3;
    this.hp = 3;
    this.src = "elementaires/sculpteur-elementaire.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 1205
        }
    ];
}

function ColereDeLaNature() {
    this.name = "Colère de la nature";
    this.species = "Elémentaire";
    this.attack = 1;
    this.hp = 5;
    this.src = "elementaires/colere-de-la-nature.jpg";
    this.tier = 3;
    this.elements = ["Terre", "Air"];
    this.effects = [
        {
            trigger: "card-place",
            id: 1206
        }
    ];
}

function EspritDesSourcesChaudes() {
    this.name = "Esprit des sources chaudes";
    this.species = "Elémentaire";
    this.attack = 5;
    this.hp = 1;
    this.src = "elementaires/esprit-des-sources-chaudes.jpg";
    this.tier = 3;
    this.elements = ["Eau", "Feu"];
    this.effects = [
        {
            trigger: "card-place",
            id: 1207
        }
    ];
}

function TranscendanceElementaire() {
    this.name = "Transcendance élémentaire";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "elementaires/transcendance-elementaire.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "",
            id: 1218
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function ConfluenceElementaire() {
    this.name = "Confluence élémentaire";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "elementaires/confluence-elementaire.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "",
            id: 1219
        }
    ];
    this.validTarget = {
        area: "any"
    };
}

function GoliathVolcanique() {
    this.name = "Goliath volcanique";
    this.species = "Elémentaire";
    this.attack = 4;
    this.hp = 4;
    this.src = "elementaires/goliath-volcanique.jpg";
    this.tier = 4;
    this.elements = ["Feu", "Terre"];
    this.effects = [
        {
            trigger: "turn-end",
            id: 1208
        }
    ];
}

function ChevaucheurDeTempetes() {
    this.name = "Chevaucheur de tempêtes";
    this.species = "Elémentaire";
    this.attack = 4;
    this.hp = 4;
    this.src = "elementaires/chevaucheur-de-tempetes.jpg";
    this.tier = 4;
    this.elements = ["Air", "Eau"];
    this.effects = [
        {
            trigger: "card-place",
            id: 1209
        }
    ];
}

function ManifestationBoreale() {
    this.name = "Manifestation boréale";
    this.species = "Elémentaire";
    this.attack = 5;
    this.hp = 4;
    this.src = "elementaires/manifestation-boreale.jpg";
    this.tier = 4;
    this.elements = ["Eau"];
    this.effects = [
        {
            trigger: "card-place",
            id: 1210
        }
    ];
}

function ChargeurRocailleux() {
    this.name = "Chargeur rocailleux";
    this.species = "Elémentaire";
    this.attack = 3;
    this.hp = 6;
    this.src = "elementaires/chargeur-rocailleux.jpg";
    this.tier = 5;
    this.elements = ["Terre"];
    this.shield = true;
    this.effects = [
        {
            trigger: "turn-end",
            id: 1212
        }
    ];
}

function DjinnSangDeFoudre() {
    this.name = "Djinn Sang-de-foudre";
    this.species = "Elémentaire";
    this.attack = 6;
    this.hp = 2;
    this.src = "elementaires/djinn-sang-de-foudre.jpg";
    this.tier = 5;
    this.elements = ["Air"];
    this.effects = [
        {
            trigger: "card-place",
            id: 1213
        }
    ];
}

function PhenixFlamboyant() {
    this.name = "Phenix flamboyant";
    this.species = "Elémentaire";
    this.attack = 7;
    this.hp = 4;
    this.src = "elementaires/phenix-flamboyant.jpg";
    this.tier = 5;
    this.elements = ["Feu"];
    this.revive = true;
    this.effects = [
        {
            trigger: "ko",
            id: 1214
        },
        {
            trigger: "battle-start",
            id: 1215
        }
    ];
}

function VolonteDeLaFournaise() {
    this.name = "Volonté de la fournaise";
    this.species = "Elémentaire";
    this.attack = 9;
    this.hp = 4;
    this.src = "elementaires/volonte-de-la-fournaise.jpg";
    this.tier = 6;
    this.elements = ["Feu"];
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1216
        }
    ];
}

function AmeDeLOrage() {
    this.name = "Âme de l'orage";
    this.species = "Elémentaire";
    this.attack = 6;
    this.hp = 6;
    this.src = "elementaires/ame-de-l-orage.jpg";
    this.tier = 6;
    this.elements = ["Air"];
    this.effects = [
        {
            trigger: "turn-end",
            id: 1217
        }
    ];
}


// Autre

function AngeDeLUnite() {
    this.name = "Ange de l'unité";
    this.species = "Autre";
    this.attack = 2;
    this.hp = 3;
    this.src = "autres/ange-de-l-unite.jpg";
    this.tier = 2;
    this.effects = [
        {
            trigger: "card-place",
            id: 2006
        }
    ];
}

function ChangeformeMasque() {
    this.name = "Changeforme masqué";
    this.species = "Autre";
    this.attack = 3;
    this.hp = 3;
    this.src = "autres/changeforme-masque.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "turn-start",
            id: 2002
        }
    ];
}

function AngeGuerrier() {
    this.name = "Ange guerrier";
    this.species = "Autre";
    this.attack = 3;
    this.hp = 5;
    this.src = "autres/ange-guerrier.jpg";
    this.tier = 3;
    this.effects = [
        {
            trigger: "battle-start",
            id: 2003
        }
    ];
}

function GuideAngelique() {
    this.name = "Guide angélique";
    this.species = "Autre";
    this.attack = 2;
    this.hp = 4;
    this.src = "autres/guide-angelique.jpg";
    this.tier = 5;
    this.effects = [
        {
            trigger: "turn-end",
            id: 2004
        }
    ];
}

function ArchangeEclatant() {
    this.name = "Archange éclatant";
    this.species = "Autre";
    this.attack = 7;
    this.hp = 7;
    this.src = "autres/archange-eclatant.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "card-sell",
            id: 2005
        }
    ];
}

function CombattantCeleste() {
    this.name = "Combattant céleste";
    this.species = "Autre";
    this.attack = 6;
    this.hp = 6;
    this.src = "autres/combattant-celeste.jpg";
    this.tier = 6;
    this.effects = [
        {
            trigger: "battle-start",
            id: 2007
        }
    ];
}


//Sortileges

function Aiguisage() {
    this.name = "Aiguisage";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sortileges/aiguisage.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "",
            id: 10002
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function ReunionCeleste() {
    this.name = "Réunion céleste";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sortileges/reunion-celeste.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "",
            id: 10003
        }
    ];
    this.validTarget = {
        area: "board"
    };
}


// Tokens

function PieceDOr() {
    this.name = "Piece d'or";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sortileges/piece-d-or.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 10001
        }
    ];
    this.validTarget = {

    };
}

function ProieFacile() {
    this.name = "Proie facile";
    this.species = "Bête";
    this.attack = 0;
    this.hp = 2;
    this.src = "betes/proie-facile.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 2008
        }
    ];
}

function ScionAspirame() {
    this.name = "Scion aspirâme";
    this.species = "Autre";
    this.attack = 1;
    this.hp = 1;
    this.src = "autres/scion-aspirame.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "ko",
            id: 2001
        }
    ];
}

function GuerrierGobelin() {
    this.name = "Guerrier gobelin";
    this.species = "Gobelin";
    this.attack = 1;
    this.hp = 1;
    this.src = "gobelins/guerrier-gobelin.jpg";
    this.tier = 7;
    this.effects = [

    ];
}

function ArtificierGobelin() {
    this.name = "Artificier gobelin";
    this.species = "Gobelin";
    this.attack = 1;
    this.hp = 1;
    this.src = "gobelins/artificier-gobelin.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 204
        }
    ];
}

function ConnaissancesArcaniques() {
    this.name = "Connaissances arcaniques";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/connaissances-arcaniques.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 302
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function CatalyseurDePuissance() {
    this.name = "Catalyseur de puissance";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/catalyseur-de-puissance.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 309
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function EquilibreNaturel() {
    this.name = "Équilibre naturel";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/equilibre-naturel.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 316
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function Dephasage() {
    this.name = "Déphasage";
    this.species = "Sortilège";
    this.attack = -1;
    this.hp = -1;
    this.src = "sorciers/dephasage.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 319
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function AutomateReplicateurMod() {
    this.name = "Automate réplicateur";
    this.species = "Machine";
    this.attack = 6;
    this.hp = 6;
    this.src = "machines/automate-replicateur.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "ko",
            id: 609
        }
    ];
}

function AutoDuplicateurMod() {
    this.name = "Auto-duplicateur";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 2;
    this.src = "machines/auto-duplicateur.jpg";
    this.tier = 7;
    this.effects = [

    ];
}

function OuvrierAssemble() {
    this.name = "Ouvrier assemblé";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 3;
    this.src = "machines/ouvrier-assemble.jpg";
    this.tier = 7;
    this.effects = [

    ];
}

function JeuneFongus() {
    this.name = "Jeune fongus";
    this.species = "Sylvain";
    this.attack = 1;
    this.hp = 4;
    this.src = "sylvains/jeune-fongus.jpg";
    this.tier = 7;
    this.effects = [

    ];
}

function CoeurDeLAbysse() {
    this.name = "Coeur de l'Abysse";
    this.species = "Autre";
    this.attack = 0;
    this.hp = 3;
    this.src = "autres/coeur-de-l-abysse.jpg";
    this.tier = 7;
    this.effect10004 = 0;
    this.effects = [
        {
            trigger: "",
            id: 323
        },
        {
            trigger: "tookdamage",
            id: 10004
        }
    ];
}

function LeBanni() {
    this.name = "Le Banni";
    this.species = "Démon";
    this.attack = 13;
    this.hp = 13;
    this.src = "demons/le-banni.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "tookdamage",
            id: 1111
        }
    ];
}





let showDelay = 800, hideDelay = 0;
let menuEnterTimer, menuLeaveTimer;

function drawCard(c, size, cancelTooltip) {
    let card = document.createElement('div');
    card.className = "card";
    card.style.setProperty("--size", size + "px");

    let header = document.createElement('div');
    header.className = "header";
    card.appendChild(header);
    let banner = document.createElement('img')
    banner.src = "./resources/ui/parchment.png";
    banner.alt = "";
    header.appendChild(banner);
    let name = document.createElement('div');
    name.innerHTML = c.name;
    header.appendChild(name);

    let artDiv = document.createElement('div');
    artDiv.className = "art";
    card.appendChild(artDiv);
    let art = document.createElement('img');
    art.src = "./resources/cards/" + c.src;
    art.alt = "";
    artDiv.appendChild(art);

    let descDiv = document.createElement('div');
    descDiv.className = "description";
    card.appendChild(descDiv);
    let desc = document.createElement('div');
    desc.innerHTML = getDescription(c, cancelTooltip);
    descDiv.appendChild(desc);

    let footer = document.createElement('div');
    footer.className = "footer";
    card.appendChild(footer);

    let attack = document.createElement('div');
    footer.appendChild(attack);
    if (c.attack >= 0) {
        attack.className = "attack";
        let attackVal = document.createElement('div');
        attackVal.innerHTML = c.attack;
        attack.appendChild(attackVal);
    }

    let spec = document.createElement('div');
    spec.className = "species";
    footer.appendChild(spec);
    let specVal = document.createElement('div');
    specVal.innerHTML = c.species;
    spec.appendChild(specVal);

    let hp = document.createElement('div');
    footer.appendChild(hp);
    if (c.hp >= 0) {
        hp.className = "hp";
        let hpVal = document.createElement('div');
        hpVal.innerHTML = c.hp;
        hp.appendChild(hpVal);
    }

    if (c.tier) {
        let tier = document.createElement('div');
        tier.className = "tier";
        card.appendChild(tier);
        let tierVal = document.createElement('div');
        tierVal.innerHTML = c.tier <= 6 ? c.tier : "0";
        tier.appendChild(tierVal);
    }

    if (c.reputation != undefined) {
        let reputation = document.createElement('div');
        reputation.className = "reputation";
        card.appendChild(reputation);
        let reputationVal = document.createElement('div');
        let player = 0;
        for (let i = 1; i < 8; i++) {
            let t = troops[i];
            if (t.includes(c) || c.original && t.includes(c.original)) {
                player = i;
                break;
            }
        }
        reputationVal.innerHTML = c.reputation;
        if (isWarchief(c, player))
            reputation.classList.add("star");
        reputation.appendChild(reputationVal);
    }

    if (!cancelTooltip) {
        card.addEventListener('mouseleave', () => {
            clearTimeout(menuLeaveTimer);
            menuEnterTimer = setTimeout(hideCardTooltip, hideDelay);
        });
        card.addEventListener('mouseenter', () => {
            clearTimeout(menuEnterTimer);
            hideCardTooltip();
            menuLeaveTimer = setTimeout(() => showCardTooltip(c), showDelay);
        });
    }

    card.card = c;

    return card;
}

function fitDescription(c) {
    let desc = c.children[2];
    let maxY = desc.clientHeight;
    let text = desc.children[0];
    while (text.clientHeight > maxY) {
        let size = parseInt(window.getComputedStyle(text).fontSize);
        text.style.fontSize = (size - 1).toString() + "px";
    }
}

function drawSmallCard(c, size) {
    let card = document.createElement('div');
    card.className = "small-card";
    card.style.setProperty("--size", size + "px");
    card.style.backgroundImage = 'url("./resources/cards/' + c.src + '")';

    let footer = document.createElement('div');
    footer.className = "footer";
    card.appendChild(footer);

    let attack = document.createElement('div');
    footer.appendChild(attack);
    if (c.attack >= 0) {
        attack.className = "attack";
        let attackVal = document.createElement('div');
        attackVal.innerHTML = c.attack;
        attack.appendChild(attackVal);
    }

    let effects = document.createElement('div');
    effects.className = "effects";
    fillSmallCardEffects(c, effects);
    footer.appendChild(effects);

    let hp = document.createElement('div');
    footer.appendChild(hp);
    if (c.hp >= 0) {
        hp.className = "hp";
        let hpVal = document.createElement('div');
        hpVal.innerHTML = c.hp;
        hp.appendChild(hpVal);
    }

    if (c.reputation != undefined) {
        let reputation = document.createElement('div');
        reputation.className = "reputation";
        card.appendChild(reputation);
        let reputationVal = document.createElement('div');
        let player = 0;
        for (let i = 1; i < 8; i++) {
            let t = troops[i];
            if (t.includes(c) || c.original && t.includes(c.original)) {
                player = i;
                break;
            }
        }
        reputationVal.innerHTML = c.reputation;
        if (isWarchief(c, player))
            reputation.classList.add("star");
        reputation.appendChild(reputationVal);
    }

    card.addEventListener('mouseleave', () => {
        clearTimeout(menuLeaveTimer);
        menuEnterTimer = setTimeout(hideCardTooltip, hideDelay);
    });
    card.addEventListener('mouseenter', () => {
        clearTimeout(menuEnterTimer);
        hideCardTooltip();
        menuLeaveTimer = setTimeout(() => showCardTooltip(c), showDelay);
    });

    card.card = c;

    return card;
}

function fillSmallCardEffects(c, effects) {
    effects.innerHTML = "";
    if (c.shield) {
        let shield = document.createElement('img');
        shield.src = "./resources/ui/shield.png";
        shield.alt = "";
        effects.appendChild(shield);
    }
    if (c.revive) {
        let revive = document.createElement('img');
        revive.src = "./resources/ui/revive.png";
        revive.alt = "";
        effects.appendChild(revive);
    }
    if (c.range) {
        let range = document.createElement('img');
        range.src = "./resources/ui/range.png";
        range.alt = "";
        effects.appendChild(range);
    }
    if (c.deathtouch) {
        let deathtouch = document.createElement('img');
        deathtouch.src = "./resources/ui/deathtouch.png";
        deathtouch.alt = "";
        effects.appendChild(deathtouch);
    }
}

function updateCardStats(c) {
    if (c.classList.contains("small-card")) {
        let footer = c.children[0];
        if (footer.children[0].classList.contains("attack"))
            footer.children[0].children[0].innerHTML = c.card.attack;
        fillSmallCardEffects(c.card, footer.children[1]);
        if (footer.children[2].classList.contains("hp"))
            footer.children[2].children[0].innerHTML = c.card.hp;
    } else {
        c.children[2].children[0].innerHTML = getDescription(c.card, false);
        let footer = c.children[3];
        if (footer.children[0].classList.contains("attack"))
            footer.children[0].children[0].innerHTML = c.card.attack;
        footer.children[1].children[0].innerHTML = c.card.species;
        if (footer.children[2].classList.contains("hp"))
            footer.children[2].children[0].innerHTML = c.card.hp;
    }
    if (c.card.reputation != undefined) {
        for (let d of c.children)
            if (d.classList.contains("reputation")) {
                let player = 0;
                for (let i = 1; i < 8; i++) {
                    let t = troops[i];
                    if (t.includes(c.card) || c.original && t.includes(c.card.original)) {
                        player = i;
                        break;
                    }
                }
                d.children[0].innerHTML = c.card.reputation;
                if (isWarchief(c.card, player))
                    d.classList.add("star");
                else
                    d.classList.remove("star");
            }
    }
}

function showCardTooltip(c) {
    let tooltip = document.createElement('div');
    tooltip.className = "tooltip";
    tooltip.id = "tooltip";
    document.body.appendChild(tooltip);

    let card = drawCard(c, 300, true);
    tooltip.appendChild(card);

    let desc = card.children[2];
    let maxY = desc.clientHeight;
    let text = desc.children[0];
    while (text.clientHeight > maxY) {
        let size = parseInt(window.getComputedStyle(text).fontSize);
        text.style.fontSize = (size - .5).toString() + "px";
    }

    let tips = document.createElement('div');
    tips.className = "tips";
    tooltip.appendChild(tips);

    if (c.elements) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Eléments :</em> L'Eau, le Feu, l'Air et la Terre.";
        tips.appendChild(shield);
    }
    if (c.shield || containsKeyword(c, "Bouclier")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Bouclier :</em> Annule les premiers dégâts subis chaque combat.";
        tips.appendChild(shield);
    }
    if (c.revive || containsKeyword(c, "Résurrection")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Résurrection :</em> Ressuscite avec 1PV après la première mort.";
        tips.appendChild(shield);
    }
    if (c.range || containsKeyword(c, "Portée")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Portée :</em> Peut attaquer la ligne arrière.";
        tips.appendChild(shield);
    }
    if (c.deathtouch || containsKeyword(c, "Contact mortel")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Contact mortel :</em> Tue instantanément les créatures qu'elle blesse.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Recrue")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Recrue :</em> Se produit lorsque la créature est jouée.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Dernière volonté")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Dernière volonté :</em> Se produit à la mort de la créature.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Frappe préventive")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Frappe préventive :</em> Se produit au début du combat.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Souffrance")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Souffrance :</em> Se produit lorsque la créature survit à des dégâts.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Reconfiguration")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Reconfiguration :</em> Alterne entre plusieurs effets chaque début de tour.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Dévore")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Dévore :</em> Détruit la créature ciblée et gagne ses statistiques.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Réputation")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Réputation :</em> Augmente de 1 suite à une victoire ou une égalité (1/2).";
        tips.appendChild(shield);
        let shield2 = document.createElement('div');
        shield2.innerHTML = "<em>Réputation :</em> En début de combat, gagne des statistiques selon sa <em>Réputation</em> (2/2).";
        tips.appendChild(shield2);
    }
    if (containsKeyword(c, "Chef de guerre")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Chef de guerre :</em> Devient actif lorsque la créature atteint une <em>Réputation</em> de 8.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Injouable")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Injouable :</em> Ne peut qu'être revendu.";
        tips.appendChild(shield);
    }

    if (tips.children.length == 0)
        tooltip.style.gridGap = "0";
}

function hideCardTooltip() {
    let tooltip = document.getElementById("tooltip");
    while (tooltip) {
        document.body.removeChild(tooltip);
        tooltip = document.getElementById("tooltip");
    }
}

function getDescription(c, cancelTooltip) {
    let res = "";
    if (c.elements) {
        res += "Elémentaire";
        for (let i = 0; i < c.elements.length; i++) {
            if (i == c.elements.length - 1 && c.elements.length > 1)
                res += " et";
            else if (i > 0 && i < c.elements.length - 1 && c.elements.length > 2)
                res += ",";
            let e = c.elements[i];
            if (e.startsWith("A") || e.startsWith("E"))
                res += " d'<em>" + e + "</em>";
            else
                res += " de <em>" + e + "</em>";
        }
        res += ".</br>";
    }
    if (c.shield)
        res += "<em>Bouclier</em>.</br>";
    if (c.revive)
        res += "<em>Résurrection</em>.</br>";
    if (c.range)
        res += "<em>Portée</em>.</br>";
    if (c.deathtouch)
        res += "<em>Contact mortel</em>.</br>";
    let effect;
    for (let e of c.effects) {
        effect = createEffect(e.id);
        if (effect.desc != "") {
            res += effect.desc;
            if (effect.dynamicDesc && cancelTooltip && effect.dynamicDesc(c) !== "")
                res += " " + effect.dynamicDesc(c);
            res += "</br>";
        }
    }
    return res;
}

function containsKeyword(c, word) {
    for (let e of c.effects)
        if (createEffect(e.id).desc.includes(word))
            return true;
    return false;
}

function fitDescription(card) {
    let desc = card.children[2];
    let maxY = desc.clientHeight - 2 * parseInt(window.getComputedStyle(desc).padding);
    let text = desc.children[0];
    while (text.clientHeight > maxY) {
        let size = parseInt(window.getComputedStyle(text).fontSize);
        text.style.fontSize = (size - .5).toString() + "px";
    }
}










async function resolveEvent(id, sender, args, doAnimate) {
    console.log("Resolving event " + id + " for sender " + sender.name);
    let effect = createEffect(id);
    await effect.run(sender, args, doAnimate);
}

function createEffect(id) {
    switch (id) {
        case 1:
            return new Effect1();
        case 2:
            return new Effect2();
        case 3:
            return new Effect3();
        case 4:
            return new Effect4();
        case 5:
            return new Effect5();
        case 6:
            return new Effect6();
        case 7:
            return new Effect7();
        case 8:
            return new Effect8();
        case 9:
            return new Effect9();
        case 10:
            return new Effect10();
        case 11:
            return new Effect11();
        case 12:
            return new Effect12();
        case 13:
            return new Effect13();
        case 14:
            return new Effect14();
        case 15:
            return new Effect15();
        case 16:
            return new Effect16();
        case 17:
            return new Effect17();
        case 18:
            return new Effect18();
        case 19:
            return new Effect19();
        case 20:
            return new Effect20();
        case 21:
            return new Effect21();
        case 22:
            return new Effect22();
        case 23:
            return new Effect23();
        case 101:
            return new Effect101();
        case 102:
            return new Effect102();
        case 103:
            return new Effect103();
        case 104:
            return new Effect104();
        case 105:
            return new Effect105();
        case 106:
            return new Effect106();
        case 107:
            return new Effect107();
        case 108:
            return new Effect108();
        case 109:
            return new Effect109();
        case 110:
            return new Effect110();
        case 111:
            return new Effect111();
        case 112:
            return new Effect112();
        case 113:
            return new Effect113();
        case 114:
            return new Effect114();
        case 115:
            return new Effect115();
        case 116:
            return new Effect116();
        case 117:
            return new Effect117();
        case 118:
            return new Effect118();
        case 119:
            return new Effect119();
        case 201:
            return new Effect201();
        case 202:
            return new Effect202();
        case 203:
            return new Effect203();
        case 204:
            return new Effect204();
        case 205:
            return new Effect205();
        case 206:
            return new Effect206();
        case 207:
            return new Effect207();
        case 208:
            return new Effect208();
        case 209:
            return new Effect209();
        case 210:
            return new Effect210();
        case 211:
            return new Effect211();
        case 212:
            return new Effect212();
        case 213:
            return new Effect213();
        case 214:
            return new Effect214();
        case 215:
            return new Effect215();
        case 216:
            return new Effect216();
        case 217:
            return new Effect217();
        case 218:
            return new Effect218();
        case 301:
            return new Effect301();
        case 302:
            return new Effect302();
        case 303:
            return new Effect303();
        case 304:
            return new Effect304();
        case 305:
            return new Effect305();
        case 306:
            return new Effect306();
        case 307:
            return new Effect307();
        case 308:
            return new Effect308();
        case 309:
            return new Effect309();
        case 310:
            return new Effect310();
        case 311:
            return new Effect311();
        case 312:
            return new Effect312();
        case 313:
            return new Effect313();
        case 314:
            return new Effect314();
        case 315:
            return new Effect315();
        case 316:
            return new Effect316();
        case 317:
            return new Effect317();
        case 318:
            return new Effect318();
        case 319:
            return new Effect319();
        case 320:
            return new Effect320();
        case 321:
            return new Effect321();
        case 322:
            return new Effect322();
        case 323:
            return new Effect323();
        case 324:
            return new Effect324();
        case 325:
            return new Effect325();
        case 326:
            return new Effect326();
        case 327:
            return new Effect327();
        case 401:
            return new Effect401();
        case 402:
            return new Effect402();
        case 403:
            return new Effect403();
        case 404:
            return new Effect404();
        case 405:
            return new Effect405();
        case 406:
            return new Effect406();
        case 407:
            return new Effect407();
        case 408:
            return new Effect408();
        case 409:
            return new Effect409();
        case 410:
            return new Effect410();
        case 411:
            return new Effect411();
        case 412:
            return new Effect412();
        case 413:
            return new Effect413();
        case 414:
            return new Effect414();
        case 415:
            return new Effect415();
        case 416:
            return new Effect416();
        case 417:
            return new Effect417();
        case 418:
            return new Effect418();
        case 419:
            return new Effect419();
        case 501:
            return new Effect501();
        case 502:
            return new Effect502();
        case 503:
            return new Effect503();
        case 504:
            return new Effect504();
        case 505:
            return new Effect505();
        case 506:
            return new Effect506();
        case 507:
            return new Effect507();
        case 508:
            return new Effect508();
        case 509:
            return new Effect509();
        case 510:
            return new Effect510();
        case 511:
            return new Effect511();
        case 512:
            return new Effect512();
        case 513:
            return new Effect513();
        case 514:
            return new Effect514();
        case 515:
            return new Effect515();
        case 516:
            return new Effect516();
        case 517:
            return new Effect517();
        case 518:
            return new Effect518();
        case 601:
            return new Effect601();
        case 602:
            return new Effect602();
        case 603:
            return new Effect603();
        case 604:
            return new Effect604();
        case 605:
            return new Effect605();
        case 606:
            return new Effect606();
        case 607:
            return new Effect607();
        case 608:
            return new Effect608();
        case 609:
            return new Effect609();
        case 610:
            return new Effect610();
        case 611:
            return new Effect611();
        case 612:
            return new Effect612();
        case 613:
            return new Effect613();
        case 614:
            return new Effect614();
        case 615:
            return new Effect615();
        case 616:
            return new Effect616();
        case 617:
            return new Effect617();
        case 618:
            return new Effect618();
        case 619:
            return new Effect619();
        case 620:
            return new Effect620();
        case 621:
            return new Effect621();
        case 622:
            return new Effect622();
        case 701:
            return new Effect701();
        case 702:
            return new Effect702();
        case 703:
            return new Effect703();
        case 704:
            return new Effect704();
        case 705:
            return new Effect705();
        case 706:
            return new Effect706();
        case 707:
            return new Effect707();
        case 708:
            return new Effect708();
        case 709:
            return new Effect709();
        case 710:
            return new Effect710();
        case 711:
            return new Effect711();
        case 712:
            return new Effect712();
        case 713:
            return new Effect713();
        case 714:
            return new Effect714();
        case 715:
            return new Effect715();
        case 716:
            return new Effect716();
        case 717:
            return new Effect717();
        case 718:
            return new Effect718();
        case 719:
            return new Effect719();
        case 801:
            return new Effect801();
        case 802:
            return new Effect802();
        case 803:
            return new Effect803();
        case 804:
            return new Effect804();
        case 805:
            return new Effect805();
        case 806:
            return new Effect806();
        case 807:
            return new Effect807();
        case 808:
            return new Effect808();
        case 809:
            return new Effect809();
        case 810:
            return new Effect810();
        case 811:
            return new Effect811();
        case 812:
            return new Effect812();
        case 813:
            return new Effect813();
        case 814:
            return new Effect814();
        case 815:
            return new Effect815();
        case 816:
            return new Effect816();
        case 817:
            return new Effect817();
        case 901:
            return new Effect901();
        case 902:
            return new Effect902();
        case 903:
            return new Effect903();
        case 904:
            return new Effect904();
        case 905:
            return new Effect905();
        case 906:
            return new Effect906();
        case 907:
            return new Effect907();
        case 908:
            return new Effect908();
        case 909:
            return new Effect909();
        case 910:
            return new Effect910();
        case 911:
            return new Effect911();
        case 912:
            return new Effect912();
        case 913:
            return new Effect913();
        case 914:
            return new Effect914();
        case 915:
            return new Effect915();
        case 916:
            return new Effect916();
        case 917:
            return new Effect917();
        case 918:
            return new Effect918();
        case 919:
            return new Effect919();
        case 1001:
            return new Effect1001()
        case 1002:
            return new Effect1002();
        case 1003:
            return new Effect1003();
        case 1004:
            return new Effect1004();
        case 1005:
            return new Effect1005();
        case 1006:
            return new Effect1006();
        case 1007:
            return new Effect1007();
        case 1008:
            return new Effect1008();
        case 1009:
            return new Effect1009();
        case 1010:
            return new Effect1010();
        case 1011:
            return new Effect1011();
        case 1012:
            return new Effect1012();
        case 1013:
            return new Effect1013();
        case 1014:
            return new Effect1014();
        case 1015:
            return new Effect1015();
        case 1016:
            return new Effect1016();
        case 1017:
            return new Effect1017();
        case 1018:
            return new Effect1018();
        case 1019:
            return new Effect1019();
        case 1020:
            return new Effect1020();
        case 1101:
            return new Effect1101();
        case 1102:
            return new Effect1102();
        case 1103:
            return new Effect1103();
        case 1104:
            return new Effect1104();
        case 1105:
            return new Effect1105();
        case 1106:
            return new Effect1106();
        case 1107:
            return new Effect1107();
        case 1108:
            return new Effect1108();
        case 1109:
            return new Effect1109();
        case 1110:
            return new Effect1110();
        case 1111:
            return new Effect1111();
        case 1112:
            return new Effect1112();
        case 1113:
            return new Effect1113();
        case 1114:
            return new Effect1114();
        case 1115:
            return new Effect1115();
        case 1116:
            return new Effect1116();
        case 1117:
            return new Effect1117();
        case 1118:
            return new Effect1118();
        case 1119:
            return new Effect1119();
        case 1120:
            return new Effect1120();
        case 1201:
            return new Effect1201();
        case 1202:
            return new Effect1202();
        case 1203:
            return new Effect1203();
        case 1204:
            return new Effect1204();
        case 1205:
            return new Effect1205();
        case 1206:
            return new Effect1206();
        case 1207:
            return new Effect1207();
        case 1208:
            return new Effect1208();
        case 1209:
            return new Effect1209();
        case 1210:
            return new Effect1210();
        case 1211:
            return new Effect1211();
        case 1212:
            return new Effect1212();
        case 1213:
            return new Effect1213();
        case 1214:
            return new Effect1214();
        case 1215:
            return new Effect1215();
        case 1216:
            return new Effect1216();
        case 1217:
            return new Effect1217();
        case 1218:
            return new Effect1218();
        case 1219:
            return new Effect1219();
        case 2001:
            return new Effect2001();
        case 2002:
            return new Effect2002();
        case 2003:
            return new Effect2003();
        case 2004:
            return new Effect2004();
        case 2005:
            return new Effect2005();
        case 2006:
            return new Effect2006();
        case 2007:
            return new Effect2007();
        case 2008:
            return new Effect2008();
        case 10001:
            return new Effect10001();
        case 10002:
            return new Effect10002();
        case 10003:
            return new Effect10003();
        case 10004:
            return new Effect10004();
        case 10005:
            return new Effect10005();
        case 10006:
            return new Effect10006();
        case 10007:
            return new Effect10007();
        case 10008:
            return new Effect10008();
        case 10009:
            return new Effect10009();
        default:
            alert("Effet inconnu : " + id);
    }
}

function Effect1() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species === "Dragon" && (!sender.effect1 || sender.effect1 == 0)) {
            if (doAnimate)
                await effectProcGlow(sender);
            await spendCoins(-1, false);
            sender.effect1 = 1;
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(Math.floor(t.filter(e => e.species === "Dragon").length * 1.5), .5, 1.5 + round > 9), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagnez 1 pièce d'or la première fois que vous achetez un Dragon à chaque tour.";
}

function Effect2() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.shield) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("board").children) {
                if (d.children[0] && d.children[0].card.shield && d.children[0].card !== args[0].card)
                    await boostStats(d.children[0].card, 1, 1, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(t.filter(e => e.shield).length * 2, 0, 1.5), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez une créature avec Bouclier, vos autres créatures avec Bouclier gagnent +1/+1.";
}

function Effect3() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.created) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0].card, 2, 3, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(5, 0, 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +2/+3 aux créatures que vous jouez et que vous n'avez pas achetées.";
}

function Effect4() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].species == "Gobelin" && players[args[4]] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let target = pickRandomTarget(args[1] ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][0]))
            if (target)
                await dealDamage(target, 1, doAnimate, args[5]);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return t.filter(e => e.species === "Gobelin").length * 2;
    };
    this.desc = "Lorsqu'un Gobelin allié meurt, inflige 1 dégât à une créature adverse aléatoire.";
}

function Effect5() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = (players[args[2]] === sender ? args[0] : args[1]);
            for (let c of t[0].concat(t[1])) {
                if (c) {
                    c.revive = true;
                    if (doAnimate)
                        await boostStats(c, 0, 0, doAnimate);
                    break;
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return t[0] ? t[0].hp / 2 : 0;
    };
    this.desc = "<em>Frappe préventive :</em> La première créature alliée acquiert <em>Résurrection</em>.";
}

function Effect6() {
    this.run = async (sender, args, doAnimate) => {
        if (round % 2 == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = getCard(shopTier, "Sortilège");
            card.created = true;
            let c = drawCard(card, 176)
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, round % 2 == 0 ? 2 * round : 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Tous les 2 tours, ajoute un Sortilège aléatoire dans votre main.";
    this.dynamicDesc = (c) => round % 2 == 0 ? "<em>(Ce tour-ci)</em>" : "<em>(Au prochain tour)</em>";
}

function Effect7() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species == "Machine") {
            if (doAnimate)
                await effectProcGlow(sender);
            args[0].card.effects.push({
                trigger: "turn-start",
                id: 601
            })
            if (doAnimate)
                await boostStats(args[0].card, 0, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 1 + t.filter(e => e.species === "Machine").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère \"<em>Reconfiguration :</em> Gagne +1/+0 <em>ou</em> Gagne +0/+1.\" aux Machines alliées.";
}

function Effect8() {
    this.run = async (sender, args, doAnimate) => {
        if (round % 2 == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 1 + t.filter(e => e.species === "Bête").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Tous les 2 tours, ajoute une Proie facile dans votre main.";
    this.dynamicDesc = (c) => round % 2 == 0 ? "<em>(Ce tour-ci)</em>" : "<em>(Au prochain tour)</em>";
}

function Effect9() {
    this.run = async (sender, args, doAnimate) => {
        let c = args[0].card;
        if (c.species !== "Sortilège" && c.species !== "Autre" && (!sender.effect9 || sender.effect9 == 0)) {
            if (doAnimate)
                await effectProcGlow(sender);
            let sp = copy(species);
            sp.splice(sp.indexOf(c.species), 1);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species == s));
                if (t)
                    await boostStats(t, 2, 2, doAnimate);
            }
            sender.effect9 = 1;
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(4, 0, 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "La première fois à chaque tour que vous revendez une créature d'une famille, confère +1/+1 à une créature alliée de chaque autre famille.";
}

function Effect10() {
    this.run = async (sender, args, doAnimate) => {
        if (lastResult > 1) {
            if (doAnimate)
                await effectProcGlow(sender);
            spendCoins(1 - lastResult);
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(3, .5, 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagnez 1 pièce d'or au début de votre tour si vous n'avez pas gagné le dernier combat.";
}

function Effect11() {
    this.run = async (sender, args, doAnimate) => { };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Inflige 3 dégâts supplémentaires aux autres commandants.";
}

function Effect12() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let card = new ScionAspirame();
        card.created = true;
        let c = drawCard(card, 176);
        await addToHand(c);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Commencez la partie avec un Scion aspirâme en main.";
}

function Effect13() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let hp = [];
        let attack = [];
        let shop = document.getElementById("shop");
        for (let c of shop.children) {
            if (c.classList.contains("card") && c.card.hp > 0 && c.card.attack >= 0) {
                c.card.attack++;
                c.card.hp++
                hp.push(c.card.hp);
                attack.push(c.card.attack);
            }
        }
        shuffle(attack);
        shuffle(hp);
        let i = 0;
        for (let c of shop.children) {
            if (c.classList.contains("card") && c.card.hp > 0 && c.card.attack >= 0) {
                c.card.attack = attack[i];
                c.card.hp = hp[i];
                if (doAnimate)
                    await boostStats(c.card, 0, 0, doAnimate);
                i++;
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(4, -.5, 2.5), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous recherchez des recrues, leur donne +1/+1 puis mélange leurs statistiques.";
}

function Effect14() {
    this.run = async (sender, args, doAnimate) => {
        sender.effect1 = 0;
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect15() {
    this.run = async (sender, args, doAnimate) => {
        sender.effect9 = 0;
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect16() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.effects.findIndex(e => createEffect(e.id).desc.startsWith("<em>Recrue :</em>")) != -1 && (!sender.effect16 || sender.effect16 == 0)) {
            if (doAnimate)
                await effectProcGlow(sender);
            await createEffect(args[0].card.effects[args[0].card.effects.findIndex(e => createEffect(e.id).desc.startsWith("<em>Recrue :</em>"))].id).run(args[0].card, args, doAnimate);
            sender.effect16 = 1;
        }
    };
    this.scaling = (c, t) => {
        return [0, fluctuate(4, 0, 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Le premier effet de <em>Recrue</em> est doublé à chaque tour.";
}

function Effect17() {
    this.run = async (sender, args, doAnimate) => {
        sender.effect16 = 0;
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect18() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let d = choice(document.getElementById("board").children);
        d.classList.add("power-spot");
        await sleep(500);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Au début de chaque tour, crée une zone de puissance à un emplacement aléatoire.";
}

function Effect19() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        if (sender !== players[0] && doAnimate) {
            let d = choice(document.getElementById("enemy-board").children);
            d.classList.add("power-spot");
            await sleep(500);
            if (d.children[0])
                await boostStats(d.children[0].card, d.children[0].card.attack * 2, 0, doAnimate);
            d.classList.remove("power-spot");
            await sleep(500);
        } else if (sender !== players[0]) {
            let t = (players[args[2]] === sender ? args[0] : args[1]);
            let target = choice(t[0].concat(t[1]));
            if (target)
                await boostStats(target, target.attack * 2, 0, doAnimate);
        } else {
            let d;
            for (let div of document.getElementById("board").children)
                if (div.classList.contains("power-spot"))
                    d = div;
            if (d.children[0])
                await boostStats(d.children[0].card, d.children[0].card.attack * 2, 0, doAnimate);
            d.classList.remove("power-spot");
            await sleep(500);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Frappe préventive :</em> L'attaque de la créature alliée sur la zone de puissance est triplée.";
}

function Effect20() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let t = (players[args[2]] === sender ? args[1] : args[0]);
        if (t[1].findIndex(e => e) != -1) {
            let options = [];
            for (let i = 0; i < 4; i++)
                if (t[0][i] && t[1][i])
                    options.push(i);
            let i = choice(options);
            await swapPositions(i, t, doAnimate, args);
            if (t[0][i])
                await dealDamage(t[0][i], 1, doAnimate, args);
            if (t[1][i])
                await dealDamage(t[1][i], 1, doAnimate, args);
        } else {
            let target = choice(t[0].concat(t[1]).filter(e => e));
            if (target)
                await dealDamage(target, 1, doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Frappe préventive :</em> Echange la position d'une créature adverse et de la créature derrière elle, puis leur inflige 1 dégât.";
}

function Effect21() {
    this.run = async (sender, args, doAnimate) => {

    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Réduit de 2 la <em>Réputation</em> requise pour qu'une créature de la Horde devienne <em>Chef de guerre</em>.";
}

function Effect22() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let card = new CoeurDeLAbysse();
        card.created = true;
        let c = drawCard(card, 176);
        await addToHand(c);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Commence la partie avec un Coeur de l'Abysse.";
}

function Effect23() {
    this.run = async (sender, args, doAnimate) => {

    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect101() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new PieceDOr();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Ajoute 1 Pièce d'or à votre main.";
}

function Effect102() {
    this.run = async (sender, args, doAnimate) => {
        if (coins > 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, Math.min(6, 2 * coins), Math.min(6, 2 * coins), doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [4, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, gagne +2/+2 pour chaque pièce d'or inutilisée, jusqu'à 3.";
}

function Effect103() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species == "Dragon" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            if (!sender.effect103)
                sender.effect103 = 1;
            else
                sender.effect103++;
            if (sender.effect103 >= 4) {
                for (let d of document.getElementById("board").children) {
                    if (d.children[0] && d.children[0].card === sender) {
                        d.innerHTML = "";
                        d.appendChild(drawSmallCard(new DragonDOr(), 200));
                        updateTroops();
                    }
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Après avoir joué 4 autres Dragons, se transforme en Dragon d'or.";
    this.dynamicDesc = (c) => "<em>(Encore " + (4 - (c.effect103 ? c.effect103 : 0)) + ")</em>";
}

function Effect104() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] < 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect104)
                sender.effect104 = 0;
            sender.effect104++;
            if (doAnimate)
                await boostStats(sender, 1, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous obtenez des pièces d'or, gagne +1/+1 jusqu'au prochain tour.";
}

function Effect105() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect104 && sender.effect104 > 0) {
            await boostStats(sender, -sender.effect104, -sender.effect104, doAnimate);
            sender.effect104 = 0;
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect106() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = 0;
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card !== sender && d.children[0].card.species == "Dragon")
                    n--;
            if (n < 0)
                await spendCoins(n, false);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2 * t.filter(e => e.species === "Dragon").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Gagnez 1 pièce d'or pour chaque autre Dragon allié.";
}

function Effect107() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new PieceDOr();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 3, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Dernière volonté :</em> Ajoute 1 Pièce d'or à votre main.";
}

function Effect108() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species == "Dragon" && args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await spendCoins(-1, false);
        }
    };
    this.scaling = (c, t) => {
        return [0, 2 * Math.min(3, t.filter(e => e.species === "Dragon").length), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez un Dragon, obtenez une pièce d'or supplémentaire.";
}

function Effect109() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] < 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let options = [];
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card.species == "Dragon")
                    options.push(d.children[0]);
            shuffle(options);
            for (let c of options.slice(0, Math.min(3, options.length)))
                await boostStats(c.card, 0, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 2 * Math.min(3, t.filter(e => e.species === "Dragon").length), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous gagnez des pièces d'or, confère +0/+1 à 3 Dragons alliés.";
}

function Effect110() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] < 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [1, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous gagnez des pièces d'or, gagne +1/+0.";
}

function Effect111() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            let n = 0;
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card !== sender && d.children[0].card.species == "Dragon")
                    n++;
            await boostStats(sender, -n, -n, doAnimate, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, -t.filter(e => e.species === "Dragon").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Gagne -1/-1 pour chaque autre Dragon allié.";
}

function Effect112() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender && args[1] == "board") {
            let options = [];
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card !== sender && d.children[0].card.species == "Dragon")
                    options.push(d.children[0]);
            if (options.length > 0)
                await boostStats(choice(options).card, sender.attack, sender.hp, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, t.filter(e => e.species === "Dragon").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez cette carte depuis le plateau, confère ses statistiques à un Dragon allié.";
}

function Effect113() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3] : args[2];
            let target = t[1][t[0].findIndex(e => e === args[1])];
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await dealDamage(target, 12, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 12;
    };
    this.toFront = true;
    this.desc = "Inflige 12 dégâts aux créatures derrière les créatures attaquées.";
}

function Effect114() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t)
                if (c && c.species == "Dragon")
                    await boostStats(c, 2, 1, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 10 * t.filter(e => e.species === "Dragon").length;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, elle confère définitivement +2/+1 aux Dragons alliés.";
}

function Effect115() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t) {
                if (c && c.species == "Dragon" && c !== sender)
                    await boostStats(c, 0, 20, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 10 * t.filter(e => e.species === "Dragon").length;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Tous les dragons alliés gagnent +0/+20.";
}

function Effect116() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && (args[2][0].concat(args[2][1]).includes(args[1]) || args[3][0].concat(args[3][1]).includes(args[1]))) {
            if (doAnimate)
                await effectProcGlow(sender);
            await dealDamage(args[1], 3, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, elle inflige 3 dégâts à l'attaquant avant de combattre.";
}

function Effect117() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let n = 0;
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card !== sender && d.children[0].card.species == "Dragon")
                    n++;
            await boostStats(sender, n, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [t.filter(e => e.species === "Dragon").length, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, gagne +1/+0 pour chaque autre Dragon allié.";
}

function Effect118() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            await spendCoins(-2, false);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, t.filter(e => e.species === "Dragon").length, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez cette carte, obtenez 2 pièces d'or supplémentaires.";
}

function Effect119() {
    this.run = async (sender, args, doAnimate) => {
        let n = lastResult == 1 ? 5 : 1;
        await boostStats(args[0].card, n, n, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 6];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +1/+1 au Dragon allié ciblé, ou +5/+5 si vous avez gagné le dernier combat.";
}

function Effect201() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            document.getElementById("refresh").style.boxShadow = "0 0 15px green";
            discountedRefreshes++;
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Réduit de 1 le coût de la prochaine recherche de recrues.";
}

function Effect202() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new GuerrierGobelin();
            card.created = true;
            await summonCard(card);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        if (t.indexOf(undefined) != -1)
            t[t.indexOf(undefined)] = new GuerrierGobelin();
    };
    this.desc = "<em>Recrue :</em> Invoque un Guerrier gobelin.";
}

function Effect203() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque un Artificier gobelin.";
}

function Effect204() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await dealDamage(target, 3, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 3;
    };
    this.desc = "<em>Dernière volonté :</em> Inflige 3 dégâts à une créature ennemie aléatoire.";
}

function Effect205() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].species == "Gobelin" && args[0] !== sender && sender.hp > 0) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender))
                await boostStats(sender, 2, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return t.filter(e => e.species == "Gobelin").length * 1.5;
    };
    this.toBack = true;
    this.desc = "Lorsqu'un Gobelin allié meurt, gagne +2/+1.";
}

function Effect206() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            for (let i = 0; i < 5; i++) {
                t = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
                let target = pickRandomTarget(t);
                if (target) {
                    if (doAnimate && i == 0)
                        await effectProcGlow(sender);
                    await dealDamage(target, 2, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 12;
    };
    this.desc = "<em>Dernière volonté :</em> Inflige 2 dégâts à une créature ennemie aléatoire 5 fois.";
}

function Effect207() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await dealDamage(target, 5, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature attaque, elle inflige 5 dégâts à une créature adverse aléatoire.";
}

function Effect208() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (!t.includes(args[0])) {
                let options = [];
                for (let c of t)
                    if (c && c !== sender && c.species == "Gobelin")
                        options.push(c);
                if (options.length > 0) {
                    let p = args[2][0].concat(args[2][1]).includes(sender) ? args[4] : args[5];
                    let c = choice(options);
                    if (doAnimate)
                        await effectProcGlow(sender);
                    await boostStats(c, 1, 0, doAnimate, false, true);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8 * t.filter(e => e.species === "Gobelin").length;
    };
    this.desc = "Lorsqu'une créature adverse subit des dégâts, confère définitivement +1/+0 à un autre gobelin allié.";
}

function Effect209() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(args[0])) {
            if (args[1]) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await dealDamage(args[1], 2, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 7 * t.filter(e => e.species === "Gobelin").length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'un Gobelin allié attaque, inflige 2 dégâts à sa cible avant qu'il ne combatte.";
}

function Effect210() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card.species == "Gobelin" && d.children[0].card !== sender)
                    await boostStats(d.children[0].card, 0, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2 * t.filter(e => e.species === "Gobelin").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Vos autres Gobelins gagnent +0/+2.";
}

function Effect211() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && containsKeyword(args[0].card, "Dernière volonté") && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [fluctuate(2, 1, 1.5), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez une carte avec <em>Dernière volonté</em>, gagne +1/+2.";
}

function Effect212() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t) {
                if (c && c !== sender && c.species == "Gobelin")
                    await boostStats(c, 1, 1, doAnimate, false, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 1.5 * t.filter(e => e.species === "Gobelin").length;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Confère définitivement +1/+1 à tous les autres Gobelins alliés.";
}

function Effect213() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let i = t.findIndex(e => e === sender);
            if (i % 4 > 0 && t[i - 1]) {
                for (let e of t[i - 1].effects)
                    if ((createEffect(e.id)).desc.startsWith("<em>Dernière volonté :</em>"))
                        t[i].effects.push(e);
            }
            if (i % 4 < 3 && t[i + 1]) {
                for (let e of t[i + 1].effects)
                    if ((createEffect(e.id)).desc.startsWith("<em>Dernière volonté :</em>"))
                        t[i].effects.push(e);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 7.5 * t.filter(e => e.species === "Gobelin").length;
    };
    this.desc = "<em>Frappe préventive :</em> Copie les effets de <em>Dernière volonté</em> de ses voisins latéraux.";
}

function Effect214() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 12;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque trois Artificiers gobelins.";
}

function Effect215() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let i = t.findIndex(e => e === sender);
            let vals = [];
            if (i % 4 > 0 && t[i - 1] && t[i - 1].species == "Gobelin")
                vals.push(t[i - 1].attack);
            if (i % 4 < 3 && t[i + 1] && t[i + 1].species == "Gobelin")
                vals.push(t[i + 1].attack);
            if (t[(i + 4) % 8] && t[(i + 4) % 8].species == "Gobelin")
                vals.push(t[(i + 4) % 8].attack);
            if (vals.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(sender, Math.max(...vals), 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 * t.filter(e => e.species === "Gobelin").length;
    };
    this.desc = "<em>Frappe préventive :</em> Gagne de l'attaque équivalente à l'attaque du Gobelin voisin le plus fort.";
}

function Effect216() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            for (let i = 0; i < 3; i++) {
                let name;
                let card;
                while (!card || card.tier > 3) {
                    name = choice(cardList["Gobelin"]);
                    card = createCard(name);
                }
                await battleSummon(name, args[1] ? args[2] : args[3], args[4], doAnimate, args);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 30;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque trois Gobelins aléatoires de niveau inférieur ou égal à 3.";
}

function Effect217() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 203
        });
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        let goblins = t.filter(e => e.species === "Gobelin");
        if (goblins.length > 0)
            choice(goblins).effects.push({
                trigger: "ko",
                id: 203
            });
    }
    this.desc = "Confère \"<em>Dernière volonté :</em> Invoque un Artificier gobelin.\" au Gobelin allié ciblé.";
}

function Effect218() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(shopTier, "Gobelin");
        card.created = true;
        card.range = true;
        let c = drawCard(card, 176);
        await addToHand(c);
        await boostStats(card, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Ajoute un Gobelin aléatoire à votre main et lui confère <em>Portée</em>.";
}

function Effect301() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ConnaissancesArcaniques();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Ajoute une Connaissances arcaniques à votre main.";
}

function Effect302() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 1, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +1/+1 à la créature alliée ciblée.";
}

function Effect303() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(1);
        while (card.species == "Sortilège")
            card = getCard(1);
        card.created = true;
        card.attack = 3;
        card.hp = 3;
        await summonCard(card);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        let card = getCard(1);
        while (card.species == "Sortilège")
            card = getCard(1);
        card.created = true;
        card.attack = 3;
        card.hp = 3;
        if (t.indexOf(undefined) != -1)
            t[t.indexOf(undefined)] = card;
    }
    this.desc = "Invoque une créature de niveau 1 aléatoire et fixe ses statistiques à 3/3.";
}

function Effect304() {
    this.run = async (sender, args, doAnimate) => {
        if (args[1] === sender && (!sender.effect304 || sender.effect304 == 0)) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let e of args[0].effects)
                await createEffect(e.id).run(args[0], [findDOMCard(args[1])], true);
            sender.effect304 = 1;
        }
    };
    this.scaling = (c, t) => {
        return [3 * (t.filter(e => e.species === "Sorcier").length > 1), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Le premier sort joué sur cette créature chaque tour prend effet deux fois.";
}

function Effect305() {
    this.run = async (sender, args, doAnimate) => {
        sender.effect304 = 0;
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect306() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 1, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [3 * (t.filter(e => e.species === "Sorcier").length > 2), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagne +1/+1 lorsque que vous jouez un Sortilège.";
}

function Effect307() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let card = getCard(shopTier);
            while (card.species == "Sortilège" || (card.tier < 3 && shopTier >= 3) || card.effects.findIndex(e => e.id == 307) != -1)
                card = getCard(shopTier);
            card.created = true;
            if (doAnimate)
                await effectProcGlow(sender);
            await summonCard(card);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, invoque une créature de niveau supérieur ou égal à 3.";
}

function Effect308() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new CatalyseurDePuissance();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 2, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Ajoute un Catalyseur de puissance à votre main.";
}

function Effect309() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 2, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +2/+1 à la créature alliée ciblée.";
}

function Effect310() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board") && args[1]) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[1], 2, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 7 * (t.filter(e => e.species === "Sorcier").length > 3), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez un Sortilège sur une créature alliée, lui confère +2/+2.";
}

function Effect311() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect311)
                sender.effect311 = [];
            sender.effect311.push(copy(args[0]));
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect312() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (sender.effect311) {
                let spells = sender.effect311.slice(-3);
                if (spells.length > 0 && doAnimate)
                    await effectProcGlow(sender);
                for (let s of spells) {
                    if (s.validTarget.area == "any")
                        await playSpell(drawCard(s, 0));
                    else {
                        let options = [];
                        for (let d of document.getElementById("board").children)
                            if (d.children[0])
                                options.push(d.children[0]);
                        if (options.length > 0)
                            await playSpell(drawCard(s, 0), choice(options));
                    }
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 15 * (t.filter(e => e.species === "Sorcier").length > 4), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, rejoue les 3 derniers Sortilèges joués ce tour-ci sur des cibles aléatoires.";
}

function Effect313() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (sender.effect311)
                sender.effect311 = [];
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect314() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(Math.min(6, shopTier + 1));
        while (card.species == "Sortilège" || card.tier != Math.min(6, shopTier + 1))
            card = getCard(Math.min(6, shopTier + 1));
        card.created = true;
        await summonCard(card);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Invoque une créature du niveau supérieur à votre niveau de recrutement.";
}

function Effect315() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new EquilibreNaturel();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Ajoute un Équilibre naturel à votre main.";
}

function Effect316() {
    this.run = async (sender, args, doAnimate) => {
        let atk = args[0].card.attack;
        let hp = args[0].card.hp;
        let datk = Math.floor((hp - atk) / 2);
        let dhp = Math.floor((atk - hp) / 2);
        await boostStats(args[0].card, datk + 1, dhp + 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +1/+1 à la créature alliée ciblée, puis équilibre ses statistiques.";
}

function Effect317() {
    this.run = async (sender, args, doAnimate) => {
        for (let i = 0; i < 5; i++) {
            let options = [];
            for (let d of document.getElementById("board").children)
                if (d.children[0])
                    options.push(d.children[0]);
            if (options.length > 0)
                await playSpell(drawCard(new ConnaissancesArcaniques(), 0), choice(options));
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Joue 5 Connaissances arcaniques sur des cibles aléatoires.";
}

function Effect318() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new Dephasage();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Ajoute un Déphasage à votre main.";
}

function Effect319() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.shield = true;
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère <em>Bouclier</em> au Sorcier allié ciblé.";
}

function Effect320() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect320 && sender.effect320 > 0 && sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await dealDamage(target, sender.effect320, doAnimate, args);
            }
        }
    };
    this.scaling = (c, t) => {
        if (!c.effect320)
            c.effect320 = 0;
        c.effect320 += 0 + (Math.random() < .5);
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.effect320 ? c.effect320 : 0;
    };
    this.desc = "<em>Frappe préventive :</em> Inflige 1 dégât à une cible adverse aléatoire pour chaque Sortilège joué depuis que cette carte est en jeu.";
    this.dynamicDesc = (c) => "<em>(Actuellement " + (c.effect320 ? c.effect320 : 0) + ")</em>";
}

function Effect321() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect320)
                sender.effect320 = 0;
            sender.effect320++;
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect322() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new CatalyseurDePuissance();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
            if (lastResult && lastResult == 2) {
                let card = new CatalyseurDePuissance();
                card.created = true;
                let c = drawCard(card, 176);
                await addToHand(c);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 5, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Au début de votre tour, ajoute un Catalyseur de puissance à votre main, ou deux si vous avez perdu le dernier combat.";
}

function Effect323() {
    this.run = async (sender, args, doAnimate) => {
        
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return -5;
    };
    this.desc = "Ne peut pas gagner d'attaque.";
}

function Effect324() {
    this.run = async (sender, args, doAnimate) => {
        players[0].effects.push({
            trigger: "spell-play",
            id: 325
        });
        players[0].effects.push({
            trigger: "turn-start",
            id: 326
        });
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Jusqu'au prochain tour, confère +1/+2 à une créature alliée aléatoire lorsque vous jouez un Sortilège.";
}

function Effect325() {
    this.run = async (sender, args, doAnimate) => {
        let options = [];
        for (let d of document.getElementById("board").children)
            if (d.children[0])
                options.push(d.children[0].card);
        if (options.length > 0)
            await boostStats(choice(options), 1, 2, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect326() {
    this.run = async (sender, args, doAnimate) => {
        let i = sender.effects.findIndex(e => e.id == 325);
        if (i != -1)
            sender.effects.splice(i, 1);
        i = sender.effects.findIndex(e => e.id == 326);
        if (i != -1)
            sender.effects.splice(i, 1);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect327() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.range = true;
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        if (t.findIndex(e => e.species === "Sorcier"))
            t[t.findIndex(e => e.species === "Sorcier")].range = true;
    }
    this.desc = "Confère <em>Portée</em> au Sorcier allié ciblé.";
}

function Effect401() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                boostStats(target, 1, 3, doAnimate);
            }, {
                area: "board",
                species: "Soldat",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 3 * (t.filter(e => e.species === "Soldat") > 1)];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +1/+3 à un autre Soldat allié ciblé.";
}

function Effect402() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            let i = t.findIndex(e => e === sender);
            if (i % 4 > 0 && t[i - 1] && t[i - 1].species == "Soldat") {
                t[i - 1].shield = true;
                await boostStats(t[i - 1], 0, 0, doAnimate);
            }
            if (t[(i + 4) % 8] && t[(i + 4) % 8].species == "Soldat") {
                t[(i + 4) % 8].shield = true;
                await boostStats(t[(i + 4) % 8], 0, 0, doAnimate);
            }
            if (i % 4 < 3 && t[i + 1] && t[i + 1].species == "Soldat") {
                t[i + 1].shield = true;
                await boostStats(t[i + 1], 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4.5 * t.filter(e => e.species === "Soldat").length;
    };
    this.desc = "<em>Dernière volonté :</em> Confère <em>Bouclier</em> aux Soldats voisins.";
}

function Effect403() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.shield) {
            await boostStats(sender, 5, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4;
    };
    this.desc = "Lorsque cette créature attaque ou est attaquée, si elle a le <em>Bouclier</em>, elle gagne +5/+0.";
}

function Effect404() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.shield) {
            await boostStats(sender, 5, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect405() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                target.shield = true;
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Soldat",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère <em>Bouclier</em> à un autre Soldat allié ciblé.";
}

function Effect406() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(args[0]) && args[0].shield) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0], 3, 3, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 12 * t.filter(e => e.shield).length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature alliée avec <em>Bouclier</em> attaque ou est attaquée, elle gagne définitivement +3/+3.";
}

function Effect407() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(args[0]) && args[0].shield) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0], 3, 3, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect408() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(sender) && args[0].shield != undefined && sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.shield = true;
            await boostStats(sender, 0, 0, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 6 * t.filter(e => e.shield).length;
    };
    this.toFront = true;
    this.desc = "Lorsqu'une créature alliée qui a eu <em>Bouclier</em> meurt, gagne <em>Bouclier</em>.";
}

function Effect409() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let i = t.findIndex(e => e === sender);
            if (doAnimate)
                await effectProcGlow(sender);
            if (i % 4 > 0 && t[i - 1] && t[i - 1].species == "Soldat") {
                t[i - 1].range = true;
                await boostStats(t[i - 1], 0, 0, doAnimate);
            }
            if (t[(i + 4) % 8] && t[(i + 4) % 8].species == "Soldat") {
                t[(i + 4) % 8].range = true;
                await boostStats(t[(i + 4) % 8], 0, 0, doAnimate);
            }
            if (i % 4 < 3 && t[i + 1] && t[i + 1].species == "Soldat") {
                t[i + 1].range = true;
                await boostStats(t[i + 1], 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2 * t.filter(e => e.species === "Soldat").length;
    };
    this.desc = "<em>Frappe préventive :</em> Confère <em>Portée</em> aux Soldats voisins.";
}

function Effect410() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card.species === "Soldat")
                    await boostStats(d.children[0].card, 1, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 2 * t.filter(e => e.species === "Soldat").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, confère +1/+1 à tous les Soldats alliés.";
}

function Effect411() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            if (doAnimate)
                await effectProcGlow(sender);
            for (let i = 0; i < 8; i++) {
                if (t[i] && t[i].species == "Soldat") {
                    let neighbors = [];
                    if (i % 4 > 0 && t[i - 1] && t[i - 1].species == "Soldat")
                        neighbors.push(t[i - 1].name);
                    if (t[(i + 4) % 8] && t[(i + 4) % 8].species == "Soldat" && neighbors.findIndex(e => e.name == t[(i + 4) % 8].name) == -1)
                        neighbors.push(t[(i + 4) % 8].name);
                    if (i % 4 < 3 && t[i + 1] && t[i + 1].species == "Soldat" && neighbors.findIndex(e => e.name == t[i + 1].name) == -1)
                        neighbors.push(t[i + 1].name);
                    let n = neighbors.length;
                    await boostStats(t[i], n, 2 * n, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 3 * t.filter(e => e.species === "Soldat").length;
    };
    this.desc = "<em>Frappe préventive :</em> Confère +1/+2 aux Soldats alliés pour chacun de leurs voisins différents.";
}

function Effect412() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let i = t.findIndex(e => e === sender);
            if (i % 4 > 0 && t[i - 1].species == "Soldat") {
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(t[i - 1], 10, 10, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 15 * (t.filter(e => e.species === "Soldat").length > 4);
    };
    this.desc = "<em>Frappe préventive :</em> Confère +10/+10 au Soldat à sa gauche.";
}

function Effect413() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(sender) && sender.hp > 0) {
            await boostStats(sender, -1, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return -2;
    };
    this.desc = "Lorsqu'une créature alliée meurt, gagne -1/-0.";
}

function Effect414() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species == "Soldat" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let options = [];
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card.species == "Soldat")
                    options.push(d.children[0].card);
            let target = choice(options);
            if (target)
                await boostStats(target, 1, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 4 * (t.filter(e => e.species === "Soldat").length > 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez un Soldat, confère +1/+1 à un Soldat allié aléatoire.";
}

function Effect415() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let names = [];
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card.species == "Soldat" && d.children[0].card.name != sender.name)
                    names.push(d.children[0].card.name);

            if (names.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                let card;

                while (!card || names.findIndex(e => e == card.name) == -1)
                    card = getCard();
                card.created = true;
                let c = drawCard(card, 176);
                await addToHand(c);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Au début de votre tour, ajoute à votre main une copie de base d'un autre Soldat allié aléatoire.";
}

function Effect416() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let target = args[1];
            if (target.shield || target.revive || target.range) {
                if (doAnimate)
                    await effectProcGlow(sender);
                target.shield = false;
                target.revive = false;
                target.range = false;
                target.deathtouch = false;
                await dealDamage(target, 0, doAnimate, args.slice(2));
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 15;
    };
    this.desc = "Lorsque cette créature attaque, elle fait perdre le <em>Bouclier</em>, la <em>Résurrection</em>, la <em>Portée</em> et le <em>Contact mortel</em> à la créature attaquée avant de combattre.";
}

function Effect417() {
    this.run = async (sender, args, doAnimate) => {
        let t = [];
        for (let d of document.getElementById("board").children)
            t.push(d.children[0] ? d.children[0].card : undefined);
        let i = t.findIndex(e => e === args[0].card);
        if (i % 4 > 0 && t[i - 1])
            boostStats(t[i - 1], 1, 1, doAnimate);
        if (t[(i + 4) % 8])
            boostStats(t[(i + 4) % 8], 1, 1, doAnimate);
        if (i % 4 < 3 && t[i + 1])
            boostStats(t[i + 1], 1, 1, doAnimate);
        await boostStats(t[i], 1, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +1/+1 à un Soldat allié et à ses voisins.";
}

function Effect418() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 419
        });
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère \"Lorsque le dernier allié de cette créature meurt, elle acquiert <em>Bouclier</em>.\" à une créature alliée.";
}

function Effect419() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(sender)) {
            let n = 0;
            for (let c of t)
                if (c && c !== sender)
                    n++;
            if (n == 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                sender.shield = true;
                await boostStats(sender, 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5;
    };
    this.desc = "Lorsque le dernier allié de cette créature meurt, elle acquiert <em>Bouclier</em>.";
}

function Effect501() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            let options = [];
            for (let c of document.getElementById("shop").children)
                if (c.classList.contains("card"))
                    options.push(c);
            if (options.length > 0) {
                let card = choice(options);
                card.card.created = true;
                if (doAnimate)
                    await effectProcGlow(sender);
                await buyCard(card, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        let card = getCard(1);
        while (card.species == "Sortilège")
            card = getCard(1);
        if (t.indexOf(undefined) != -1)
            t[t.indexOf(undefined)] = card;
    }
    this.desc = "<em>Recrue :</em> Déplace une carte aléatoire disponible au recrutement dans votre main.";
}

function Effect502() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await dealDamage(target, 2, doAnimate, args);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.desc = "<em>Frappe préventive :</em> Inflige 2 dégâts à une cible adverse aléatoire.";
}

function Effect503() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = getCard(shopTier, "Sortilège");
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Ajoute un Sortilège aléatoire à votre main.";
}

function Effect504() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.created && findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 2, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [5 * (t.filter(e => e.species === "Bandit").length > 3), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagne +2/+1 lorsque vous jouez une carte que vous n'avez pas achetée.";
}

function Effect505() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].created && findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 2, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect506() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            let lastP;
            for (let d of nextFights) {
                if (d[0] == 0)
                    lastP = d[1];
                else if (d[1] == 0)
                    lastP = d[0];
            }
            if (lastP) {
                let target = pickRandomTarget(troops[lastP]);
                if (target) {
                    if (doAnimate)
                        await effectProcGlow(sender);
                    let name = target.src.substring(target.src.indexOf("/") + 1, target.src.indexOf("."));
                    let card = createCard(name);
                    card.species = "Bandit";
                    card.created = true;
                    let c = drawCard(card, 176);
                    await addToHand(c);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Ajoute une copie de base d'une créature de votre dernier adversaire à votre main. Elle devient un Bandit.";
}

function Effect507() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t1 = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let n = 0;
            for (let c of t1)
                if (c && c.species == "Bandit" && c !== sender)
                    n++;

            if (n > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                let t2 = args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]);
                for (let c of t2) {
                    if (c && c.attack > 0)
                        await boostStats(c, -n, 0, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 9 * t.filter(e => e.species === "Bandit").length;
    };
    this.desc = "<em>Frappe préventive :</em> Réduit l'attaque des créatures ennemies de 1 pour chaque autre Bandit allié.";
}

function Effect508() {
    this.run = async (sender, args, doAnimate) => {
        let t1 = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        let t2 = args[2][0].concat(args[2][1]).includes(sender) ? args[3][1] : args[2][1];
        if (t1.includes(args[0]) && t2.includes(args[1])) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0], 4, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 * t.filter(e => e.range).length;
    };
    this.desc = "Lorsqu'une créature alliée attaque la ligne arrière, elle gagne +4/+2.";
}

function Effect509() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species == "Bandit" && findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 1, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [4 * (t.filter(e => e.species === "Bandit").length > 2), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagne +1/+1 lorsque vous jouez un autre Bandit.";
}

function Effect510() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.created && args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await spendCoins(-1, false);
        }
    };
    this.scaling = (c, t) => {
        return [0, 4 * (t.filter(e => e.species === "Bandit").length > 1), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez une carte que vous n'avez pas achetée, obtenez une pièce d'or supplémentaire.";
}

function Effect511() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                target.range = true;
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Bandit",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère <em>Portée</em> à un autre Bandit allié ciblé.";
}

function Effect512() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                let name = target.src.substring(target.src.indexOf("/") + 1, target.src.indexOf("."));
                let card = createCard(name);
                card.created = true;
                let c = drawCard(card, 176);
                await addToHand(c);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Ajoute une copie de base d'une créature adverse aléatoire à votre main.";
}

function Effect513() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.created && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let i = 0; i < 3; i++) {
                let target = pickRandomTarget(troops[0]);
                if (target)
                    await boostStats(target, 2, 2, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 20 * (t.filter(e => e.species === "Bandit").length > 4), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez une carte que vous n'avez pas achetée, confère +2/+2 à 3 créatures alliées aléatoires.";
}

function Effect514() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].created && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let i = 0; i < 3; i++) {
                let target = pickRandomTarget(troops[0]);
                if (target)
                    await boostStats(target, 2, 2, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect515() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let options = [];
            for (let c of document.getElementById("shop").children)
                if (c.classList.contains("card"))
                    options.push(c);
            if (options.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                options.sort((a, b) => { if (a.card.tier > b.card.tier) return -1; else if (a.card.tier < b.card.tier) return 1; else return 0; });
                let card = options[0];
                card.card.created = true;
                await buyCard(card, true);
                if (doAnimate)
                    await sleep(500);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 6, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, déplace la carte de plus haut niveau disponible au recrutement dans votre main.";
}

function Effect516() {
    this.run = async (sender, args, doAnimate) => {
        await spendCoins(-1, false);
        for (let c of document.getElementsByClassName("small-card"))
            if (c.parentElement.parentElement.classList.contains("board") && c.card.created && c.card.species != "Bandit" && c.card.species != "Sortilège") {
                c.card.species = "Bandit";
                boostStats(c.card, 0, 0, doAnimate);
            }
        for (let c of document.getElementsByClassName("card"))
            if (c.parentElement.parentElement.classList.contains("hand") && c.card.created && c.card.species != "Bandit" && c.card.species != "Sortilège") {
                c.card.species = "Bandit";
                boostStats(c.card, 0, 0, doAnimate);
            }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagnez une pièce d'or. Toutes les créatures en jeu et dans votre main que vous n'avez pas achetées deviennent des Bandits.";
}

function Effect517() {
    this.run = async (sender, args, doAnimate) => {
        players[0].effects.push({
            trigger: "turn-start",
            id: 518
        });
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Au début de votre prochain tour, ajoute 2 copies de base de créatures de votre prochain adversaire à votre main.";
}

function Effect518() {
    this.run = async (sender, args, doAnimate) => {
        let lastP;
        for (let d of nextFights) {
            if (d[0] == 0)
                lastP = d[1];
            else if (d[1] == 0)
                lastP = d[0];
        }
        if (lastP) {
            for (let i = 0; i < 2; i++) {
                let target = pickRandomTarget(troops[lastP]);
                if (target) {
                    if (doAnimate)
                        await effectProcGlow(sender);
                    let name = target.src.substring(target.src.indexOf("/") + 1, target.src.indexOf("."));
                    let card = createCard(name);
                    card.created = true;
                    let c = drawCard(card, 176);
                    await addToHand(c);
                }
            }
        }
        sender.effects.splice(sender.effects.findIndex(e => e.id == 518), 1);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect601() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect601 || sender.effect601 == 0) {
                sender.effect601 = 1;
                sender.attack++;
            } else {
                sender.effect601 = 0;
                sender.hp++;
            }
            if (doAnimate)
                await boostStats(sender, 0, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [1, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Reconfiguration :</em> Gagne +1/+0 <em>ou</em> Gagne +0/+1.";
}

function Effect602() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await boostStats(sender, 0, 0, doAnimate);
            if (!sender.effect602 || sender.effect602 == 0) {
                sender.effect602 = 1;
                await boostStats(pickRandomTarget(troops[0]), 1, 0, doAnimate);
            } else {
                sender.effect601 = 0;
                await boostStats(pickRandomTarget(troops[0]), 0, 1, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 1, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Reconfiguration :</em> Confère +1/+0 à une créature alliée aléatoire <em>ou</em> Confère +0/+1 à une créature alliée aléatoire.";
}

function Effect603() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("shop").children)
                if (d.classList.contains("card") && d.card.species != "Sortilège")
                    await boostStats(d.card, 1, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +1/+1 aux créatures disponibles au recrutement.";
}

function Effect604() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect604 || sender.effect604 == 0) {
                sender.effect604 = 1;
                await boostStats(sender, 5, -3, doAnimate, true);
            } else {
                sender.effect604 = 0;
                await boostStats(sender, -3, 5, doAnimate, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [2, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Reconfiguration :</em> Gagne +5/-3 <em>ou</em> Gagne -3/+5.";
}

function Effect605() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect605 || sender.effect605 == 0) {
                sender.effect605 = 1;
                sender.shield = true;
                delete sender.range;
                await boostStats(sender, 0, 0, doAnimate, true);
            } else {
                sender.effect605 = 0;
                sender.range = true;
                delete sender.shield;
                await boostStats(sender, 0, 0, doAnimate, true);
            }
        }
    };
    this.scaling = (c, t) => {
        if (Math.random() < .5) {
            c.shield = true;
            delete c.range;
        } else {
            c.range = true;
            delete c.shield;
        }
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Reconfiguration :</em> Gagne <em>Bouclier</em> et perd <em>Portée</em> <em>ou</em> Gagne <em>Portée</em> et perd <em>Bouclier</em>.";
}

function Effect606() {
    this.run = async (sender, args, doAnimate) => {

    };
    this.scaling = (c, t) => {
        return [0, 4 * (t.filter(e => e.species === "Machine").length > 3), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Pendant la phase de recrutement, les statistiques de vos créatures ne peuvent pas baisser.";
}

function Effect607() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let i = troops[0].findIndex(e => e === sender);
            let target = troops[0][(i + 4) % 8];
            if (target && target.species == "Machine" && (target.hp > 1 || target.attack > 0)) {
                let atk = Math.min(6, target.attack);
                let hp = Math.min(6, target.hp - 1);
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(target, -atk, -hp, doAnimate);
                await boostStats(sender, atk, hp, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [6, -6 * (t.filter(e => e.species === "Machine").length < 4), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, cette créature vole jusqu'à 6/6 à la Machine derrière elle, si possible.";
}

function Effect608() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t)
                if (c && c.species == "Machine")
                    await boostStats(c, 2, 2, doAnimate);
            await battleSummon("automate-replicateur-mod", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("automate-replicateur-mod", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 9 * t.filter(e => e.species === "Machine").length;
    };
    this.desc = "<em>Dernière volonté :</em> Confère +2/+2 à toutes les autres Machines alliées, puis invoque deux copies de base de cette créature sans réinvocation.";
}

function Effect609() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t)
                if (c && c.species == "Machine")
                    await boostStats(c, 2, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 * t.filter(e => e.species === "Machine").length;
    };
    this.desc = "<em>Dernière volonté :</em> Confère +2/+2 à toutes les autres Machines alliées.";
}

function Effect610() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = troops[0];
            let i = t.findIndex(e => e === sender);
            let cards = [];
            if (i % 4 > 0 && t[i - 1])
                cards.push(t[i - 1]);
            if (t[(i + 4) % 8])
                cards.push(t[(i + 4) % 8]);
            if (i % 4 < 3 && t[i + 1])
                cards.push(t[i + 1]);
            for (let c of cards)
                for (let e of c.effects) {
                    let eff = createEffect(e.id);
                    if (eff.desc.startsWith("<em>Reconfiguration"))
                        await eff.run(c, [], true);
                }
        }
    };
    this.scaling = (c, t) => {
        return [0, 15 * (t.filter(e => e.species === "Machine").length > 3), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, redéclenche les <em>Reconfigurations</em> des Machines voisines.";
}

function Effect611() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = (args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1])).filter(x => x);
            if (t.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                t.sort((a, b) => a.hp - b.hp);
                await dealDamage(t[0], 8, doAnimate, args);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8;
    };
    this.desc = "<em>Frappe préventive :</em> Inflige 8 dégâts à la créature adverse avec les PV les plus faibles.";
}

function Effect612() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let t = troops[0];
            let n = 0;
            for (let c of t)
                if (c && c.species == "Machine")
                    n++;
            let i = t.findIndex(e => e === sender);
            let cards = [];
            if (i % 4 > 0 && t[i - 1])
                cards.push(t[i - 1]);
            if (i % 4 < 3 && t[i + 1])
                cards.push(t[i + 1]);

            if (!sender.effect612 || sender.effect612 == 0) {
                sender.effect612 = 1;
                for (let c of cards)
                    await boostStats(c, n, -3, doAnimate, true);
            } else {
                sender.effect612 = 0;
                for (let c of cards)
                    await boostStats(c, -3, n, doAnimate, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, -6 + 2 * t.filter(e => e.species === "Machine").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Reconfiguration :</em> Confère +X/-3 <em>ou</em> Confère -3/+X à ses voisins latéraux, X étant le nombre de Machines alliées.";
}

function Effect613() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("auto-duplicateur-mod", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque une copie de base de cette créature sans réinvocation.";
}

function Effect614() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[1][0].concat(args[1][1]);
        if (t.includes(sender)) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 3, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 * (t.filter(e => e.species === "Machine" || e.species === "Gobelin").length);
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature alliée est invoquée en combat, gagne +3/+2.";
}

function Effect615() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 12;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque trois Ouvriers assemblés.";
}

function Effect616() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species == "Machine" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 0, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [1, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez une autre Machine, gagne +0/+1.";
}

function Effect617() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of document.getElementById("shop").children)
                if (c.card && c.card.species == "Machine")
                    await boostStats(c.card, 2, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 3 * (t.filter(e => e.species === "Machine").length > 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Les Machines disponibles au recrutement ont +2/+2.";
}

function Effect618() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of document.getElementById("shop").children)
                if (c.card && c.card.species == "Machine")
                    await boostStats(c.card, 2, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect619() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque un Ouvrier assemblé.";
}

function Effect620() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 619
        });
        boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        let machines = t.filter(e => e.species === "Machine");
        if (machines.length > 0)
            choice(machines).effects.push({
                trigger: "ko",
                id: 619
            });
    }
    this.desc = "Confère \"<em>Dernière volonté :</em> Invoque un Ouvrier assemblé.\" à la Machine alliée ciblée.";
}

function Effect621() {
    this.run = async (sender, args, doAnimate) => {
        let c = args[0].card;
        for (let i = 0; i < 3; i++) {
            for (let e of c.effects) {
                let eff = createEffect(e.id);
                if (eff.desc.startsWith("<em>Reconfiguration"))
                    await eff.run(c, [], true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 10 * (t.filter(e => e.species === "Machine").length > 0), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Déclenche 3 fois les <em>Reconfigurations</em> de la Machine alliée ciblée.";
}

function Effect622() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of document.getElementById("shop").children)
                if (c.card && c.card.species == "Machine")
                    await boostStats(c.card, 2, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect701() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.use = (t) => {
        if (t.indexOf(undefined) != -1)
            t[t.indexOf(undefined)] = new ProieFacile();
    }
    this.desc = "<em>Recrue :</em> Ajoute 1 Proie facile à votre main.";
}

function Effect702() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            let shop = document.getElementById("shop");
            let options = [];
            for (let c of shop.children)
                if (c.card && c.card.species != "Sortilège")
                    options.push(c);
            let target = choice(options);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                shop.removeChild(target);
                shop.style.setProperty("--shop-size", parseInt(shop.style.getPropertyValue("--shop-size")) - 1);
                await boostStats(sender, target.card.attack, target.card.hp, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, fluctuate(5, .5, 1.5), 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> <em>Dévore</em> une créature disponible au recrutement aléatoire.";
}

function Effect703() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget(async (target) => {
                let c = findDOMCard(target);
                c.style.transition = ".5s";
                c.style.opacity = "0";
                await boostStats(sender, target.attack, target.hp, doAnimate);
                await boostStats(sender, 3, 3, doAnimate);
                c.parentElement.removeChild(c);
                updateTroops();
            }, {
                area: "board",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 4, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> <em>Dévore</em> une créature alliée ciblée, puis gagne +3/+3.";
}

function Effect704() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let target;
            let max = 999999;
            for (let c of troops[0])
                if (c && c.attack < max && c !== sender) {
                    target = c;
                    max = c.attack;
                }

            if (target) {
                let c = findDOMCard(target);
                c.style.transition = ".5s";
                c.style.opacity = "0";
                await boostStats(sender, target.attack, target.hp, doAnimate);
                await boostStats(sender, 3, 3, doAnimate);
                c.parentElement.removeChild(c);
                updateTroops();

                if (!sender.effect704)
                    sender.effect704 = 0;
                sender.effect704++;
                if (sender.effect704 == 5) {
                    sender.deathtouch = true;
                    boostStats(sender, 0, 0, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        if (c.attack > 40)
            c.deathtouch = true;
        return [5, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Au début de chaque tour, <em>Dévore</em> la créature alliée la moins forte, puis gagne +3/+3. Gagne <em>Contact mortel</em> la 5<sup>ème</sup> fois.";
    this.dynamicDesc = (c) => c.effect704 && c.effect704 >= 5 ? "" : "<em>(Encore " + (5 - (c.effect704 ? c.effect704 : 0)) + ")</em>";
}

function Effect705() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(args[0]) && args[0].species == "Bête") {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0], 1, 2, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8 * t.filter(e => e.species === "Bête").length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une Bête alliée est attaquée, lui confère définitivement +1/+2.";
}

function Effect706() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget(async (target) => {
                let shop = document.getElementById("shop");
                let options = [];
                for (let c of shop.children)
                    if (c.card && c.card.species != "Sortilège")
                        options.push(c);
                let t = choice(options);
                if (t) {
                    if (doAnimate)
                        await effectProcGlow(target);
                    shop.removeChild(t);
                    shop.style.setProperty("--shop-size", parseInt(shop.style.getPropertyValue("--shop-size")) - 1);
                    await boostStats(target, t.card.attack, t.card.hp, doAnimate);
                }
            }, {
                area: "board",
                species: "Bête",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, fluctuate(6, .5, 1.5)];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> La Bête alliée ciblée <em>Dévore</em> une créature disponible au recrutement aléatoire.";
}

function Effect707() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            let c = drawCard(card, 176);
            await addToHand(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Ajoute une Proie facile à votre main.";
}

function Effect708() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let target of troops[0]) {
                if (target && target.name == "Proie facile") {
                    let c = findDOMCard(target);
                    c.style.transition = ".5s";
                    c.style.opacity = "0";
                    await boostStats(sender, target.attack, target.hp, doAnimate);
                    await boostStats(sender, 2, 1, doAnimate);
                    c.parentElement.removeChild(c);
                    updateTroops();
                }
            }
            let toRemove = [];
            for (let d of document.getElementById("hand").children) {
                let target = d.card;
                if (target && target.name == "Proie facile") {
                    let c = findDOMCard(target);
                    c.style.transition = ".5s";
                    c.style.opacity = "0";
                    await boostStats(sender, target.attack, target.hp, doAnimate);
                    await boostStats(sender, 2, 1, doAnimate);
                    toRemove.push(c);
                }
            }
            for (let c of toRemove)
                c.parentElement.removeChild(c);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, fluctuate(3, 0, 5), 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> <em>Dévore</em> toutes les Proies faciles en jeu et dans votre main, et gagne +2/+1 à chaque fois.";
}

function Effect709() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.hp -= 7;
            boostStats(sender, 7, 7, false, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 18;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Gagne définitivement +7/+7.";
}

function Effect710() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);

            let beasts = [];
            for (let c of troops[0])
                if (c && c.species == "Bête")
                    beasts.push(c);
            shuffle(beasts);

            let shop = document.getElementById("shop");
            for (let target of beasts) {
                let options = [];
                for (let c of shop.children)
                    if (c.card && c.card.species != "Sortilège")
                        options.push(c);
                let t = choice(options);
                if (t) {
                    shop.removeChild(t);
                    shop.style.setProperty("--shop-size", parseInt(shop.style.getPropertyValue("--shop-size")) - 1);
                    await boostStats(target, t.card.attack, t.card.hp, doAnimate);
                } else {
                    await boostStats(target, 2, 2, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 4 * t.filter(e => e.species === "Bête").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de votre tour, les Bêtes alliées <em>Dévorent</em> une créature aléatoire disponible au recrutement si possible, ou gagnent +2/+2 sinon.";
}

function Effect711() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species == "Bête" && args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0].card, 5, 4, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 7 * (t.filter(e => e.species === "Bête").length > 3), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Les Bêtes que vous jouez gagnent +5/+4.";
}

function Effect712() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species != "Sortilège" && findDOMCard(sender) && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [4, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagne +1/+1 lorsque vous revendez une créature.";
}

function Effect713() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of document.getElementById("hand").children)
                if (c.card.species == "Bête")
                    await boostStats(c.card, 0, 3, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +0/+3 aux Bêtes dans votre main.";
}

function Effect714() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let n = 0;
            for (let c of t)
                if (c && c.hp > 0 && c.species == "Bête")
                    n++;
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, n, n, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2 * (t.filter(e => e.species === "Bête").length - 1);
    };
    this.desc = "<em>Frappe préventive :</em> Gagne +X/+X, où X est le nombre de Bêtes alliées.";
}

function Effect715() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await boostStats(sender, sender.attack, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.attack / 2;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature attaque, elle double son attaque.";
}

function Effect716() {
    this.run = async (sender, args, doAnimate) => {
        for (let i = 0; i < 4; i++) {
            if (troops[0][i])
                await boostStats(troops[0][i], 1, 0, doAnimate);
        }
        let card = new ProieFacile();
        card.created = true;
        let c = drawCard(card, 176);
        await addToHand(c);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +1/+0 aux créatures de la première ligne, puis ajoute une Proie facile à votre main.";
}

function Effect717() {
    this.run = async (sender, args, doAnimate) => {
        for (let c of document.getElementById("shop").children)
            if (c.card && c.card.species === "Bête")
                await boostStats(c.card, 3, 3, doAnimate);
        players[0].effects.push({
            trigger: "shop-refresh",
            id: 718
        });
        players[0].effects.push({
            trigger: "turn-end",
            id: 719
        })
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +3/+3 aux Bêtes disponibles au recrutement jusqu'à la fin du tour.";
}

function Effect718() {
    this.run = async (sender, args, doAnimate) => {
        for (let c of document.getElementById("shop").children)
            if (c.card && c.card.species === "Bête")
                await boostStats(c.card, 3, 3, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect719() {
    this.run = async (sender, args, doAnimate) => {
        sender.effects.splice(sender.effects.findIndex(e => e.id == 718), 1);
        sender.effects.splice(sender.effects.findIndex(e => e.id == 719), 1);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect801() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender))
                await boostStats(sender, 1, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature alliée meurt, gagne +1/+0.";
}

function Effect802() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            await boostStats(sender, 4, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4;
    };
    this.desc = "<em>Dernière volonté :</em> Gagne +4/+0.";
}

function Effect803() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let options = copy(cardList["Mort-Vivant"]).filter(e => createCard(e).species === "Mort-Vivant" && e !== "liche-profanatrice");
            await battleSummon(choice(options), args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon(choice(options), args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon(choice(options), args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 40;
    };
    this.toBack = true;
    this.desc = "<em>Dernière volonté :</em> Invoque trois autres Morts-Vivants aléatoires.";
}

function Effect804() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (!t.includes(sender))
                await boostStats(sender, 2, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature ennemie meurt, gagne +2/+0.";
}

function Effect805() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            let i = t.findIndex(e => e === sender);
            if ((i % 4) > 0 && t[i - 1]) {
                if (doAnimate)
                    await effectProcGlow(sender);
                for (let e of copy(t[i - 1].effects))
                    if (createEffect(e.id).desc.startsWith("<em>Dernière volonté"))
                        t[i - 1].effects.push(copy(e));
            }
            if ((i % 4) < 3 && t[i + 1]) {
                if (doAnimate)
                    await effectProcGlow(sender);
                for (let e of copy(t[i + 1].effects))
                    if (createEffect(e.id).desc.startsWith("<em>Dernière volonté"))
                        t[i + 1].effects.push(copy(e));
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5 * (t.filter(e => e.species === "Mort-Vivant").length > 2);
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Double les <em>Dernières volontés</em> de ses voisins latéraux.";
}

function Effect806() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender))
                await boostStats(sender, 1, 1, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 10 + 2.5 * t.filter(e => e.species === "Mort-Vivant").length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature alliée meurt, gagne définitivement +1/+1.";
}

function Effect807() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].species == "Mort-Vivant") {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender)) {
                if (!sender.effect807)
                    sender.effect807 = [];
                if (!sender.effect807.includes(args[0]))
                    sender.effect807.push(args[0]);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect808() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.effect807) {
            if (sender.effect807.length > 0) {
                let c = sender.effect807[0];
                let name = Array.from(c.src.matchAll("^.*\/([^/]+)\.jpg$"), m => m[1])[0];
                await battleSummon(name, args[1] ? args[2] : args[3], args[4], doAnimate, args);
            }
            if (sender.effect807.length > 1) {
                let c = sender.effect807[1];
                let name = Array.from(c.src.matchAll("^.*\/([^/]+)\.jpg$"), m => m[1])[0];
                await battleSummon(name, args[1] ? args[2] : args[3], args[4], doAnimate, args);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 30 * (t.filter(e => e.species === "Mort-Vivant").length > 2);
    };
    this.toBack = true;
    this.desc = "<em>Dernière volonté :</em> Invoque des copies de base des deux premiers Morts-Vivants morts ce combat.";
}

function Effect809() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].species == "Mort-Vivant") {
            let t = (args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]));
            let undead = t.filter(x => x && x.species == "Mort-Vivant" && x.hp > 0);
            if (t.includes(sender) && undead.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                shuffle(undead);
                undead = undead.slice(0, 3);
                for (let c of undead)
                    await boostStats(c, 1, 1, doAnimate, false, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5 * t.filter(e => e.species === "Mort-Vivant").length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'un Mort-Vivant allié meurt, confère définitivement +1/+1 à trois Morts-Vivants alliés aléatoires.";
}

function Effect810() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("squelette-reconstitue", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque un Squelette reconstitué.";
}

function Effect811() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && (args[2][0].concat(args[2][1]).includes(args[1]) || args[3][0].concat(args[3][1]).includes(args[1]))) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = Math.floor(args[1].attack / 2);
            if (n > 0) {
                boostStats(args[1], -n, 0, doAnimate);
                await boostStats(sender, n, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.hp / 2;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, elle divise par 2 l'attaque de la créature assaillante et augmente son attaque d'autant.";
}

function Effect812() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.revive && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of troops[0])
                if (c && c.species == "Mort-Vivant" && c !== sender)
                    await boostStats(c, 1, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 3 * t.filter(e => e.species === "Mort-Vivant").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez une autre créature avec <em>Résurrection</em>, confère +1/+2 à vos autres Morts-Vivants.";
}

function Effect813() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("serviteur-exhume", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 20;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque un Serviteur exhumé.";
}

function Effect814() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            let t = (args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1])).filter(x => x && x.species == "Mort-Vivant" && x !== sender);
            let target = choice(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(target, 1, 1, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 * (t.filter(e => e.species === "Mort-Vivant").length > 1);
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Confère +1/+1 à un autre Mort-Vivant allié.";
}

function Effect815() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                boostStats(target, 0, 4, doAnimate);
            }, {
                area: "board",
                species: "Mort-Vivant",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 4];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +0/+4 à un autre Mort-Vivant allié ciblé.";
}

function Effect816() {
    this.run = async (sender, args, doAnimate) => {
        let c = args[0].card;
        let n = Math.min(2, c.hp - 1);
        boostStats(c, 0, -n, doAnimate);
        drawPlayers();
        await boostStats(players[0], 0, n, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Vole jusqu'à 2 PV au Mort-Vivant allié ciblé.";
}

function Effect817() {
    this.run = async (sender, args, doAnimate) => {
        let c = args[0].card;
        c.revive = true;
        boostStats(players[0], 0, -Math.min(6, players[0].hp - 1), doAnimate);
        drawPlayers();
        await boostStats(c, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Perdez 6 PV pour donner <em>Résurrection</em> au Mort-Vivant allié ciblé.";
}

function Effect901() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 0, 1, doAnimate, true, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, elle gagne définitivement +0/+1.";
}

function Effect902() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                boostStats(target, 0, 2, doAnimate);
            }, {
                area: "board"
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 1];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez cette carte, confère +0/+2 à la créature alliée ciblée.";
}

function Effect903() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && (args[2][0].concat(args[2][1]).includes(args[1]) || args[3][0].concat(args[3][1]).includes(args[1]))) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = Math.ceil(args[0].hp / 2);
            if (n > 0)
                await dealDamage(args[1], n, doAnimate, args.slice(2));
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.hp / 2;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, elle inflige des dégâts équivalents à la moitié de ses propres PV à l'attaquant.";
}

function Effect904() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let t2 = args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]);
            let i = t.indexOf(sender);
            if (t2[i]) {
                if (doAnimate)
                    await effectProcGlow(sender);
                t2[i].effects = [];
                await boostStats(t2[i], 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.desc = "<em>Frappe préventive :</em> Supprime tous les effets actifs de la créature opposée à celle-ci.";
}

function Effect905() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species === "Sylvain" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 0, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [4 * (t.filter(e => e.species === "Sylvain").length > 3), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez un autre Sylvain, gagne +0/+2.";
}

function Effect906() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].species == "Sylvain") {
            let t = (args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]));
            if (t.includes(sender)) {
                if (!sender.effect906)
                    sender.effect906 = 0;
                sender.effect906++;
                if (sender.effect906 == 2) {
                    if (doAnimate)
                        await effectProcGlow(sender);
                    let t2 = args[1] ? args[3] : args[2];
                    for (let i = 0; i < 4; i++) {
                        if (t2[0][i] && t2[1][i])
                            await swapPositions(i, t2, doAnimate, args[5]);
                    }
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 3 * (t.filter(e => e.species === "Sylvain").length > 3);
    };
    this.toBack = true;
    this.desc = "La deuxième fois qu'un Sylvain allié meurt à chaque combat, échange la première et la seconde ligne adverses.";
}

function Effect907() {
    this.run = async (sender, args, doAnimate) => {
        let t = (args[1][0].concat(args[1][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[1][0].concat(args[1][1]));
        if (args[0] && t.includes(args[0]) && sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            await dealDamage(args[0], 2, doAnimate, args.slice(1));
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2 + 2 * (t.filter(e => e.species === "Sylvain").length > 3);
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature ennemie change de position, lui inflige 2 dégâts.";
}

function Effect908() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let positions = document.getElementById("board").children;
            let d;
            for (let i = 0; i < 8; i++) {
                d = positions[i];
                if (d.children[0] && d.children[0].card.species === "Sylvain") {
                    if (i < 4)
                        await boostStats(d.children[0].card, 0, 2, doAnimate);
                    else
                        await boostStats(d.children[0].card, 1, 0, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 2 * t.filter(e => e.species === "Sylvain").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, confère +0/+2 aux Sylvains alliés de la première ligne et +1/+0 aux Sylvains alliés de la seconde ligne.";
}

function Effect909() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(args[0]) && t.indexOf(sender) == t.indexOf(args[0]) + 4) {
            if (doAnimate)
                await effectProcGlow(sender);
            await dealDamage(args[1], Math.floor(sender.attack / 2), doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return t.attack / 2;
    };
    this.toBack = true;
    this.desc = "Lorsque la créature alliée devant celle-ci attaque, inflige des dégâts équivalents à la moitié de sa propre attaque à la cible.";
}

function Effect910() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].species == "Sylvain") {
            let t = (args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]));
            if (t.includes(sender)) {
                await boostStats(sender, 0, 2, doAnimate, true, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2 * t.filter(e => e.species === "Sylvain").length;
    };
    this.toFront = true;
    this.desc = "Lorsqu'un Sylvain allié meurt, gagne défintivement +0/+2.";
}

function Effect911() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let t = args[1] ? args[2] : args[3];
            for (let i = 0; i < 4; i++) {
                if (!t[1][i] || !t[0][i]) {
                    if (t[0][i])
                        await pushBack(i, t, doAnimate, args[5]);
                    await battleSummon("jeune-fongus", args[1] ? args[2] : args[3], args[4], doAnimate, args);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 6;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Remplit la première ligne de Jeunes fongus, et repousse les créatures alliées au besoin.";
}

function Effect912() {
    this.run = async (sender, args, doAnimate) => {
        let t = (args[1][0].concat(args[1][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[1][0].concat(args[1][1]));
        if (args[0] && t.includes(args[0]) && sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 0, 3, doAnimate);
            await attack(args[1], args[2], args[3], args[4], args[5], doAnimate, sender, args[0]);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 + 4 * (t.filter(e => e.species === "Sylvain").length > 3);
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature ennemie change de position, gagne +0/+3 puis l'attaque.";
}

function Effect913() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3] : args[2];
            let target = choice(t[0].filter(e => e && e !== args[1]));
            if (target) {
                await dealDamage(target, 2, doAnimate, args.slice(2));
                let i = t[0].indexOf(target);
                if (i != -1) {
                    if (t[1][i])
                        await swapPositions(i, t, doAnimate, args.slice(2));
                    else
                        await pushBack(i, t, doAnimate, args.slice(2));
                } 
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4 + 4 * t.filter(e => e.species === "Sylvain").length;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, inflige 2 dégâts à une créature ennemie non attaquante et la repousse.";
}

function Effect914() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species === "Sylvain" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 0, args[0].card.hp, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [7 * (t.filter(e => e.species === "Sylvain").length > 3), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez un autre Sylvain, gagne des PV équivalents à ses PV.";
}

function Effect915() {
    this.run = async (sender, args, doAnimate) => {
        let t = (args[1][0].concat(args[1][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[2][0].concat(args[2][1]));
        if (args[0] && !t.includes(args[0]) && sender.hp > 0) {
            let options = t.filter(x => x && x.species == "Sylvain" && x.hp > 0);
            if (t.includes(sender) && options.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                shuffle(options);
                options = options.slice(0, 3);
                for (let c of options)
                    await boostStats(c, 1, 2, doAnimate, false, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8 * t.filter(e => e.species === "Sylvain").length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature ennemie change de position, confère définitivement +1/+2 à trois Sylvains alliés.";
}

function Effect916() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            id: 917,
            trigger: "attacked"
        });
        await boostStats(args[0].card, 0, 3, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère \"Lorsque cette créature est attaquée, confère -1/-0 à l'attaquant.\" et +0/+3 au Sylvain allié ciblé.";
}

function Effect917() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && (args[2][0].concat(args[2][1]).includes(args[1]) || args[3][0].concat(args[3][1]).includes(args[1]))) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[1], -1, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, confère -1/-0 à l'attaquant.";
}

function Effect918() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            id: 919,
            trigger: "attacked"
        });
        await boostStats(args[0].card, 3, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère \"Lorsque cette créature est attaquée, inflige 2 dégâts à l'attaquant.\" et +3/+1 au Sylvain allié ciblé.";
}

function Effect919() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && (args[2][0].concat(args[2][1]).includes(args[1]) || args[3][0].concat(args[3][1]).includes(args[1]))) {
            if (doAnimate)
                await effectProcGlow(sender);
            await dealDamage(args[1], 2, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5;
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature est attaquée, inflige 2 dégâts à l'attaquant.";
}

function Effect1001() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0 && sender.reputation) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, sender.reputation, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.reputation ? c.reputation : 0;
    };
    this.desc = "<em>Frappe préventive :</em> Gagne +X/+0, où X est sa propre <em>Réputation</em>.";
}

function Effect1002() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            let target = choice(t.filter(e => e && e.species === "Horde"));
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                target.original.reputation++;
                target.reputation++;
                await boostStats(target, 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Augmente de 1 la <em>Réputation</em> d'une créature de la Horde alliée.";
}

function Effect1003() {
    this.run = async (sender, args, doAnimate) => {
        if (lastResult == 2 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.reputation++;
            await boostStats(sender, 0, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        c.reputation += (Math.random() < .1);
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.desc = "Au début de chaque tour, gagne 1 point de <em>Réputation</em> si vous avez perdu le dernier combat.";
}

function Effect1004() {
    this.run = async (sender, args, doAnimate) => {
        if (isWarchief(sender, 0) && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let i = troops[0].indexOf(sender);
            if (i % 4 > 0 && troops[0][i - 1]) {
                troops[0][i - 1].reputation++;
                await boostStats(troops[0][i - 1], 0, 0, doAnimate);
            }
            if (troops[0][(i + 4) % 8]) {
                troops[0][(i + 4) % 8].reputation++;
                await boostStats(troops[0][(i + 4) % 8], 0, 0, doAnimate);
            }
            if (i % 4 < 3 && troops[0][i + 1]) {
                troops[0][i + 1].reputation++;
                await boostStats(troops[0][i + 1], 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, c.reputation >= 8 ? 6 : 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 1;
    };
    this.desc = "<em>Chef de guerre :</em> Confère 1 point de <em>Réputation</em> aux créatures voisines à la fin de chaque tour.";
}

function Effect1005() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                target.reputation += 2;
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Horde",
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 3 * (t.filter(e => e.species === "Horde") > 1)];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère 2 points de <em>Réputation</em> à la créature de la Horde alliée ciblée.";
}

function Effect1006() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            if (isWarchief(sender, 0))
                await boostStats(sender, 3, 2, doAnimate);
            else
                await boostStats(sender, 0, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [c.reputation >= 8 ? 5 : 1, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 1;
    };
    this.desc = "A la fin de chaque tour, gagne +0/+1.</br><em>Chef de guerre :</em> Gagne +3/+2 à la place.";
}

function Effect1007() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0 && sender.reputation) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, sender.reputation, sender.reputation, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.reputation ? 2 * c.reputation : 0;
    };
    this.desc = "<em>Frappe préventive :</em> Gagne +X/+X, où X est sa propre <em>Réputation</em>.";
}

function Effect1008() {
    this.run = async (sender, args, doAnimate) => {
        let side = args[0][0].concat(args[0][1]).includes(sender);
        let t = (side ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1])).filter(e => e);
        let target;
        let min = 999999;
        for (let c of t)
            if (c.attack < min) {
                min = c.attack;
                target = c;
            }           
        if (target && sender.hp > 0 && sender.reputation && isWarchief(sender, side ? args[2] : args[3])) {
            if (doAnimate)
                await effectProcGlow(sender);
            await attack(args[0], args[1], args[2], args[3], args[4], doAnimate, sender, target);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.reputation >= 8 ? 8 : 0;
    };
    this.desc = "<em>Chef de guerre :</em> Puis, attaque la créature ennemie la plus faible.";
}

function Effect1009() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender && sender.reputation > 0) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget(async (target) => {
                target.reputation += 2 * sender.reputation;
                await boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Horde"
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 4];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez cette carte, confère le double de sa <em>Réputation</em> à la créature de la Horde alliée ciblée.";
}

function Effect1010() {
    this.run = async (sender, args, doAnimate) => {

    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Possède naturellement 8 points de <em>Réputation</em>.";
}

function Effect1011() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget(async (target) => {
                sender.reputation = target.reputation;
                target.reputation = 0;
                boostStats(sender, sender.reputation, 0, doAnimate);
                await boostStats(target, 0, 0, doAnimate);
                if (isWarchief(sender, 0))
                    await boostStats(sender, sender.reputation, sender.reputation, doAnimate);
            }, {
                area: "board",
                species: "Horde",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        if (t.filter(e => e && e.species === "Horde") > 4) {
            c.reputation = 8;
            return [0, 0, 16, 0];
        } else
            return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Vole la <em>Réputation</em> de la créature de la Horde alliée ciblée, puis gagne +X/+0, où X est sa propre <em>Réputation</em>.</br><em>Chef de guerre :</em> Puis, gagne +X/+X.";
}

function Effect1012() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let chief = isWarchief(sender, 0);
            for (let c of troops[0])
                if (c && c.reputation != undefined && isWarchief(c, 0))
                    await boostStats(c, chief ? 2 : 1, chief ? 3 : 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 5 * t.filter(e => e && e.reputation >= 8).length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, confère +1/+2 aux <em>Chefs de guerre</em> alliés.</br><em>Chef de guerre :</em> Leur confère +2/+3 à la place.";
}

function Effect1013() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let shop = document.getElementById("shop");
            let flag = true;
            while (flag) {
                let options = [];
                for (let c of shop.children)
                    if (c.card && c.card.species === "Horde")
                        options.push(c);
                let t = choice(options);
                let target = choice(troops[0].filter(e => e && e.species === "Horde" && e !== sender));
                if (t && target) {
                    shop.removeChild(t);
                    shop.style.setProperty("--shop-size", parseInt(shop.style.getPropertyValue("--shop-size")) - 1);
                    target.reputation += 3;
                    await boostStats(target, 0, 0, doAnimate);
                } else {
                    flag = false;
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 12];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Détruit toutes les créatures de la Horde disponibles à l'achat, puis confère 3 points de <em>Réputation</em> à une autre créature alliée pour chaque créature ainsi détruite.";
}

function Effect1014() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.reputation++;
            await boostStats(sender, 0, 0, doAnimate);
            for (let c of troops[0])
                if (c && c.reputation != undefined && c.reputation < sender.reputation) {
                    c.reputation++;
                    await boostStats(c, 0, 0, doAnimate);
                }
        }
    };
    this.scaling = (c, t) => {
        for (let card of t)
            if (card && card.reputation != undefined)
                card.reputation += Math.random() < .1;
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 15;
    };
    this.desc = "A la fin de chaque tour, gagne 1 point de <em>Réputation</em>, puis confère 1 point de <em>Réputation</em> aux céatures alliées qui en possèdent moins que celle-ci.";
}

function Effect1015() {
    this.run = async (sender, args, doAnimate) => {
        let side = args[0][0].concat(args[0][1]).includes(sender);
        let t1 = (side ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]));
        let t2 = (side ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]));
        let n = t1.filter(e => e && e.reputation && isWarchief(e, side ? args[2] : args[3])).length;
        for (let i = 0; i < n; i++) {
            let target = choice(t2.filter(e => e && e.hp > 0));      
            if (target && sender.hp > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await attack(args[0], args[1], args[2], args[3], args[4], doAnimate, sender, target);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5 * t.filter(e => e && e.reputation >= 8).length;
    };
    this.desc = "<em>Frappe préventive :</em> Pour chaque <em>Chef de guerre</em> allié, attaque une créature adverse aléatoire.";
}

function Effect1016() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
        let n = Math.ceil(t.reduce((acc, e) => acc + (e && e.reputation ? e.reputation : 0), 0) / 2);
        if (sender.hp > 0 && n > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, n, n, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2 * t.reduce((acc, e) => acc + (e && e.reputation ? e.reputation : 0), 0);
    };
    this.desc = "<em>Frappe préventive :</em> Gagne +X/+X, où X est la moitié de la somme de la <em>Réputation</em> des créatures alliées.";
}

function Effect1017() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of t) {
                if (c && c.reputation != undefined) {
                    c.reputation++;
                    c.original.reputation++;
                    await boostStats(c, 0, 0, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 50 * (t.filter(e => e && e.species === "Horde").length > 3);
    };
    this.toFront = true;
    this.desc = "Lorsque cette créature attaque, elle augmente de 1 la <em>Réputation</em> de toutes les créatures alliées.";
}

function Effect1018() {
    this.run = async (sender, args, doAnimate) => {
        let player = args[2][0].concat(args[2][1]).includes(sender) ? args[4] : args[5];
        if (args[0] === sender && isWarchief(sender, player)) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of t) {
                if (c && c.reputation != undefined) {
                    c.reputation++;
                    c.original.reputation++;
                    await boostStats(c, 0, 0, doAnimate);
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 50 * (t.filter(e => e && e.species === "Horde").length > 3 && c.reputation >= 8);
    };
    this.toFront = true;
    this.desc = "<em>Chef de guerre :</em> Lorsque cette créature est attaquée, elle augmente de 1 la <em>Réputation</em> de toutes les créatures alliées.";
}

function Effect1019() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, Math.min(1 + (args[0].card.reputation ? args[0].card.reputation : 0), 8), 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +X/+0 à la créature alliée ciblée, où X est 1 plus sa <em>Réputation</em>, jusqu'à 8.";
}

function Effect1020() {
    this.run = async (sender, args, doAnimate) => {
        if (isWarchief(args[0].card, 0))
            await boostStats(args[0].card, 3, 3, doAnimate);
        else {
            args[0].card.reputation = 8;
            await boostStats(args[0].card, 0, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Si la créature ciblée est un <em>Chef de guerre</em>, lui confère +3/+3. Sinon, fixe sa <em>Réputation</em> à 8.";
}

function Effect1101() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp > 0)
            await dealDamage(sender, 2, doAnimate, args.slice(2));
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return -2;
    };
    this.toFront = true;
    this.desc = "S'inflige 2 dégâts en attaquant.";
}

function Effect1102() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp > 0 && args[1] > 0)
            await boostStats(sender, 2, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2;
    };
    this.toFront = true;
    this.desc = "<em>Souffrance :</em> Gagne +2/+0.";
}

function Effect1103() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp > 0 && args[1] > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            let i = t.findIndex(e => e === sender);
            if (i % 4 > 0 && t[i - 1] && t[i - 1].species == "Démon")
                await boostStats(t[i - 1], 0, 1, doAnimate, true, true);
            if (t[(i + 4) % 8] && t[(i + 4) % 8].species == "Démon")
                await boostStats(t[(i + 4) % 8], 0, 1, doAnimate, true, true);
            if (i % 4 < 3 && t[i + 1] && t[i + 1].species == "Démon")
                await boostStats(t[i + 1], 0, 1, doAnimate, true, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 3 * (t.filter(e => e && e.species === "Démon").length > 2);
    };
    this.toFront = true;
    this.desc = "<em>Souffrance :</em> Confère définitivement +0/+1 aux Démons voisins.";
}

function Effect1104() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender)
            sender.effect1104 = players[0].hp;
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect1105() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect1104 > players[0].hp) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = sender.effect1104 - players[0].hp;
            await boostStats(sender, 0, n, doAnimate);
        }
        sender.effect1104 = players[0].hp;
    };
    this.scaling = (c, t) => {
        return [fluctuate(1, 1, 3), 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Gagne +0/+X chaque fois que votre commandant perd des PV, où X correspond aux PV ainsi perdus.";
}

function Effect1106() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            for (let i = 0; i < 1 + (lastResult == 2); i++) {
                if (doAnimate)
                    effectProcGlow(sender);
                await chooseTarget((target) => {
                    boostStats(target, 1, 2, doAnimate);
                }, {
                    area: "board",
                    species: "Démon",
                    notself: true
                }, sender);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 5 * (t.filter(e => e && e.species === "Démon").length > 2)];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +1/+2 à un autre Démon allié. Répétez cet effet si vous avez perdu le précédent combat.";
}

function Effect1107() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp > 0 && args[1] > 0)
            await boostStats(sender, args[1], 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.hp / 2;
    };
    this.toFront = true;
    this.desc = "<em>Souffrance :</em> Gagne +X/+1, où X correspond aux dégâts subis.";
}

function Effect1108() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t1 = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            let t2 = !args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            for (let c of t1.concat(t2))
                if (c && c.hp > 0)
                    await dealDamage(c, 1, doAnimate, args.slice(2));
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8 * (t.filter(e => e && e.species === "Démon").length > 2);
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Inflige 1 dégât à toutes les créatures.";
}

function Effect1109() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp > 0 && args[1] > 0) {
            if (!sender.original.effect1109)
                sender.original.effect1109 = 0;
            sender.original.effect1109++;
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.toFront = true;
    this.desc = "";
}

function Effect1110() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect1109 >= 5) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("board").children) {
                if (d.children[0] && d.children[0].card === sender) {
                    d.innerHTML = "";
                    d.appendChild(drawSmallCard(new LeBanni(), 200));
                    updateTroops();
                }
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Après avoir survécu à des dégâts 5 fois, est remplacé par Le Banni au début de votre prochain tour.";
    this.dynamicDesc = (c) => "<em>(Encore " + (5 - (c.effect1109 ? c.effect1109 : 0)) + ")</em>";
}

function Effect1111() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].hp > 0)
            await boostStats(sender, 1, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 30;
    };
    this.desc = "Lorsqu'une autre créature survit à des dégâts, gagne +1/+0.";
}

function Effect1112() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let i = t.findIndex(e => e === sender);
            if (i % 4 > 0 && t[i - 1] && t[i - 1].hp > 0) {
                await dealDamage(t[i - 1], 2, doAnimate, args);
                await boostStats(sender, 1, 1, doAnimate, true, true);
            }
            if (t[(i + 4) % 8] && t[(i + 4) % 8].hp > 0) {
                await dealDamage(t[(i + 4) % 8], 2, doAnimate, args);
                await boostStats(sender, 1, 1, doAnimate, true, true);
            }
            if (i % 4 < 3 && t[i + 1] && t[i + 1].hp > 0) {
                await dealDamage(t[i + 1], 2, doAnimate, args);
                await boostStats(sender, 1, 1, doAnimate, true, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5 + 7 * (t.filter(e => e.species === "Démon").length > 3);
    };
    this.desc = "<em>Frappe préventive :</em> Inflige 2 dégâts à ses voisins, puis gagne définitivement +1/+1 pour chaque créature ainsi blessée.";
}

function Effect1113() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && args[1] > 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            let target = choice(t.filter(e => e && e.species === "Démon" && e.hp > 0));
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(target, 3, 3, doAnimate, true, sender.hp <= 0);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 15 * (t.filter(e => e.species === "Démon").length > 3);
    };
    this.toFront = true;
    this.desc = "<em>Souffrance :</em> Confère +3/+3 à un Démon allié aléatoire.</br><em>Dernière volonté :</em> Confère définitivement +3/+3 à un Démon allié aléatoire.";
}

function Effect1114() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                let x = troops[0].filter(e => e && e.species === "Démon").length * 2;
                let y = troops[0].filter(e => e && e.species !== "Démon").length;
                boostStats(target, x, y, doAnimate);
            }, {
                area: "board",
                species: "Démon",
                notself: true
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 7 + 7 * t.filter(e => e && e.species === "Démon").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +X/+Y à un autre Démon allié ciblé, où X est 2 fois le nombre de Démons alliés et Y le nombre de créatures non Démon alliées.";
}

function Effect1115() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && args[1] > 0) {
            if (sender.hp > 0)
                await boostStats(sender, 2, 0, doAnimate, false, true);
            else {
                sender.hp -= 5;
                await boostStats(sender, 0, 5, doAnimate, false, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 10 + 15 * (t.filter(e => e.species === "Démon").length > 3);
    };
    this.toFront = true;
    this.desc = "<em>Souffrance :</em> Gagne définitivement +2/+0.</br><em>Dernière volonté :</em> Gagne définitivement +0/+5.";
}

function Effect1116() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp > 0 && args[1] > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t.filter(e => e && e.species === "Démon" && e.hp > 0))
                await boostStats(c, 0, 2, doAnimate, false, true);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 50 * (t.filter(e => e.species === "Démon").length > 3);
    };
    this.toFront = true;
    this.desc = "<em>Souffrance :</em> Confère définitivement +0/+2 à tous les Démons alliés.";
}

function Effect1117() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && sender.hp > 0) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (!t.includes(sender)) {
                if (doAnimate)
                    await effectProcGlow(sender);
                let t2 = (!args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]))
                t2 = t2.filter(e => e && e.hp > 0 && e.species === "Démon");
                shuffle(t2);
                t2 = t2.slice(0, 3);
                for (let c of t2)
                    await boostStats(c, 1, 0, doAnimate, false, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 8 * t.filter(e => e && e.species === "Démon").length;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature ennemie meurt, confère définitivement +1/+0 à 3 Démons alliés.";
}

function Effect1118() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("le-banni", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 30;
    };
    this.toFront = true;
    this.desc = "<em>Dernière volonté :</em> Invoque Le Banni.";
}

function Effect1119() {
    this.run = async (sender, args, doAnimate) => {
        args[0].parentElement.innerHTML = "";
        updateTroops();
        await refreshShop(true, "Démon");
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Détruit la créature alliée ciblée pour actualiser les recrues disponibles avec uniquement des Démons.";
}

function Effect1120() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 1118
        });
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère \"<em>Dernière volonté :</em>Invoque Le Banni.\" au Démon allié ciblé.";
}

function Effect1201() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let side = args[2][0].concat(args[2][1]).includes(sender);
            await dealDamage(players[side ? args[4] : args[5]], 1, doAnimate, args.slice(2));
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return -2;
    };
    this.desc = "<em>Dernière volonté :</em> Inflige 1 dégât à son contrôleur.";
}

function Effect1202() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            for (let c of troops[0].filter(e => e && e.elements && (e.elements.includes("Terre") || e.elements.includes("Feu"))))
                await boostStats(c, 0, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, .5 * t.filter(e => e && e.species === "Elémentaire").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez cette carte, confère +0/+1 aux Elémentaires de <em>Terre</em> et de <em>Feu</em> alliés.";
}

function Effect1203() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t.filter(e => e && e !== sender && e.elements && (e.elements.includes("Eau") || e.elements.includes("Air"))))
                await boostStats(c, 0, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 2 * t.filter(e => e && e.elements && (e.elements.includes("Eau") || e.elements.includes("Air"))).length;
    };
    this.desc = "<em>Dernière volonté :</em> Confère +0/+2 aux Elémentaires d'<em>Eau</em> et d'<em>Air</em> alliés.";
}

function Effect1204() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let el = copy(elements);
            shuffle(el);
            for (let s of el) {
                let t = choice(troops[0].filter(x => x && x.elements && x.elements.includes(s)));
                if (t)
                    await boostStats(t, 2, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, Math.min(8, 1.5 * t.filter(e => e && e.elements).length)];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +2/+0 à un Elémentaire allié de chaque élément.";
}

function Effect1205() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                let el = copy(elements).filter(e => !target.elements.includes(e));
                let e = choice(el);
                if (e)
                    target.elements.push(e);
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Elémentaire"
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 3 * (t.filter(e => e && e.species === "Elémentaire").length > 2)];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère un élément supplémentaire à l'Elémentaire allié ciblé.";
}

function Effect1206() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = troops[0].filter(e => e && e !== sender && e.elements && (e.elements.includes("Terre") || e.elements.includes("Air"))).length + effect23active(0);
            if (n > 0)
                await boostStats(sender, 3 * n, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 3 * t.filter(e => e && e.elements && (e.elements.includes("Terre") || e.elements.includes("Air"))).length, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Gagne +3/+0 pour chaque Elémentaire de <em>Terre</em> ou d'<em>Air</em> allié.";
}

function Effect1207() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = troops[0].filter(e => e && e !== sender && e.elements && (e.elements.includes("Eau") || e.elements.includes("Feu"))).length + effect23active(0);
            if (n > 0)
                await boostStats(sender, 0, 3 * n, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 3 * t.filter(e => e && e.elements && (e.elements.includes("Eau") || e.elements.includes("Feu"))).length, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Gagne +0/+3 pour chaque Elémentaire d'<em>Eau</em> ou de <em>Feu</em> allié.";
}

function Effect1208() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n1 = troops[0].filter(e => e && e !== sender && e.elements && e.elements.includes("Feu")).length + effect23active(0);
            let n2 = troops[0].filter(e => e && e !== sender && e.elements && e.elements.includes("Terre")).length + effect23active(0);
            await boostStats(sender, n1, n2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [2 * t.filter(e => e && e.elements && (e.elements.includes("Terre") || e.elements.includes("Feu"))).length, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, gagne +1/+0 pour chaque Elémentaire de <em>Feu</em> allié, et +0/+1 pour chaque Elémentaire de <em>Terre</em> allié.";
}

function Effect1209() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")
                && args[0].card.elements && (args[0].card.elements.includes("Air") || args[0].card.elements.includes("Eau"))) {
            if (doAnimate)
                await effectProcGlow(sender);
            let options = troops[0].filter(e => e && e !== args[0].card && e.species === "Elémentaire");
            shuffle(options);
            for (let i = 0; i < Math.min(2, options.length); i++)
                await boostStats(options[i], 2, 2, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 10 * (t.filter(e => e.species === "Elémentaire").length > 4), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez un Elémentaire d'<em>Air</em> ou d'<em>Eau</em>, confère +2/+2 à 2 autres Elémentaires alliés.";
}

function Effect1210() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            await chooseTarget((target) => {
                findDOMCard(target).classList.add("frozen");
                target.effects.push({
                    trigger: "turn-end",
                    id: 1211
                });
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "shop"
            }, sender);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2 * t.filter(e => e && e.species === "Elémentaire").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Gèle une carte disponible au recrutement. A la fin de ce tour-ci, si c'est une créature, elle gagne +1/+2 pour chaque Elémentaire allié.";
}

function Effect1211() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.classList.contains("shop") && sender.species !== "Sortilège") {
            let n = troops[0].filter(e => e && e.species === "Elémentaire").length;
            await boostStats(sender, n, 2 * n, doAnimate);
        }
        sender.effects.splice(sender.effects.findIndex(e => e.id === 1211), 1);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect1212() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = troops[0];
            let i = t.findIndex(e => e === sender);
            let elem = [];
            if (i % 4 > 0 && t[i - 1] && t[i - 1].elements)
                elem = elem.concat(t[i - 1].elements);
            if (t[(i + 4) % 8] && t[(i + 4) % 8].elements)
                elem = elem.concat(t[(i + 4) % 8].elements);
            if (i % 4 < 3 && t[i + 1] && t[i + 1].elements)
                elem = elem.concat(t[i + 1].elements);
            console.log(elem)
            await boostStats(sender, 2 * (new Set(elem).size), 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [t.filter(e => e.species === "Elémentaire").length, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, gagne +2/+0 pour chaque élément différent parmi ses voisins.";
}

function Effect1213() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of troops[0].filter(e => e && e !== sender && e.elements))
                await boostStats(c, c.elements.length, c.elements.length, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 2 * t.filter(e => e && e.species === "Elémentaire").length];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Les autres Elémentaires alliés gagnent +1/+1 pour chacun de leurs éléments.";
}

function Effect1214() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.effect1214 > 0) {
            sender.revive = true;
            sender.effect1214--;
            await boostStats(sender, 0, 0, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return c.attack / 2 * (t.filter(e => e && e.elements && e.elements.includes("Feu")) >= 4);
    };
    this.desc = "S'il y a au moins 4 Elémentaires de <em>Feu</em> alliés au début du combat, cette créature ressucite deux fois.";
}

function Effect1215() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
        let side = args[0][0].concat(args[0][1]).includes(sender);
        if (t.filter(e => e && e.elements && e.elements.includes("Feu")).length >= 4 - effect23active(side ? args[2] : args[3])) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.effect1214 = 1;
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "";
}

function Effect1216() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            let side = args[2][0].concat(args[3][1]).includes(sender);
            for (let c of t.filter(e => e && e !== sender && e.elements)) {
                let n = effect23active(side ? args[4] : args[5]) * c.elements.length;
                for (let el of c.elements)
                    for (let c2 of t.filter(e => e && e !== sender && e !== c && e.elements))
                        if (c2.elements.includes(el))
                            n++;
                if (n > 0)
                    await boostStats(c, n, n, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 6 * t.filter(e => e && e.elements).length;
    };
    this.desc = "<em>Dernière volonté :</em> Les Elémentaires alliés gagnent +1/+1 pour chaque autre Elémentaire qui partage un élément avec eux.";
}

function Effect1217() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of troops[0].filter(e => e && e.elements)) {
                if (c.elements.length < 3)
                    await boostStats(c, 1, 1, doAnimate);
                else
                    await boostStats(c, 3, 3, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 3 * t.filter(e => e.species === "Elémentaire").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, les Elémentaire alliés gagnent +1/+1, ou +3/+3 s'ils possèdent au moins 3 éléments.";
}

function Effect1218() {
    this.run = async (sender, args, doAnimate) => {
        let t = troops[0].filter(e => e && e.elements);
        if (effect23active(0) || t.filter(e => e.elements.includes("Eau")).length > 0) {
            let target = choice(t);
            if (target)
                await boostStats(target, 0, 2, doAnimate);
        }
        if (effect23active(0) || t.filter(e => e.elements.includes("Feu")).length > 0) {
            let target = choice(t);
            if (target)
                await boostStats(target, 2, 0, doAnimate);
        }
        if (effect23active(0) || t.filter(e => e.elements.includes("Air")).length > 0) {
            await refreshShop(true);
        }
        if (effect23active(0) || t.filter(e => e.elements.includes("Terre")).length > 0) {
            await spendCoins(-1);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Déclenche des effets selon les éléments des Elémentaires alliés.</br>"
                    + "<em>Eau :</em> Confère +0/+2 à un Elémentaire allié aléatoire.</br>"
                    + "<em>Feu :</em> Confère +2/+0 à un Elémentaire allié aléatoire.</br>"
                    + "<em>Air :</em> Actualise le recrutement.</br>"
                    + "<em>Terre :</em> Gagnez une pièce d'or.";
}

function Effect1219() {
    this.run = async (sender, args, doAnimate) => {
        for (let i = 0; i < 3; i++) {
            let options = troops[0].filter(e => e && e.elements && e.elements.length < 4);
            if (options.length > 0) {
                let target = choice(options);
                let el = copy(elements).filter(e => !target.elements.includes(e));
                target.elements.push(choice(el));
                await boostStats(target, 0, 0, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère un élément supplémentaire à 3 Elémentaires alliés.";
}

function Effect2001() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender)) {
                if (Math.random() < .5)
                    await boostStats(sender, 1, 0, doAnimate, false, true);
                else
                    await boostStats(sender, 0, 1, doAnimate, false, true);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 1000;
    };
    this.toBack = true;
    this.desc = "Lorsqu'une créature alliée meurt, gagne définitivement +1/+0 ou +0/+1.";
}

function Effect2002() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.species = choice(copy(species).filter(x => x !== sender.species));
            let n = 0;
            for (let c of troops[0])
                if (c && c.species === sender.species && c !== sender)
                    n++;
            if (n > 0)
                await boostStats(sender, n, n, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [2, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Au début de votre tour, change de famille et gagne +X/+X, où X est le nombre de créatures alliées de cette famille.";
}

function Effect2003() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let f = [];
            for (let c of t)
                if (c && !f.includes(c.species) && c.species !== "Autre")
                    f.push(c.species);
            if (f.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(sender, f.length, f.length, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 4;
    };
    this.desc = "<em>Frappe préventive :</em> Gagne +1/+1 pour chaque famille alliée différente.";
}

function Effect2004() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let sp = copy(species);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species === s));
                if (t)
                    await boostStats(t, 2, 2, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 8, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, confère +2/+2 à une créature alliée de chaque famille.";
}

function Effect2005() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = args[0].card;
            let sp = copy(species);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species === s));
                if (t && s !== card.species)
                    await boostStats(t, 2, 2, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 12, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous revendez une créature, confère +2/+2 à une créature alliée de chaque autre famille.";
}

function Effect2006() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let sp = copy(species);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species === s));
                if (t)
                    await boostStats(t, 1, 1, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 4];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Recrue :</em> Confère +1/+1 à une créature alliée de chaque famille.";
}

function Effect2007() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let f = [];
            for (let c of t)
                if (c && !f.includes(c.species) && c.species !== "Autre")
                    f.push(c.species);
            if (f.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                if (f.length >= 2)
                    sender.shield = true;
                if (f.length >= 4)
                    sender.deathtouch = true;
                await boostStats(sender, f.length * 5, f.length * 7, doAnimate);
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 15;
    };
    this.desc = "<em>Frappe préventive :</em> Gagne +5/+7 pour chaque famille alliée différente, ainsi que <em>Bouclier</em> s'il y en a au moins 2 et <em>Contact mortel</em> s'il y en a au moins 4.";
}

function Effect2008() {
    this.run = async (sender, args, doAnimate) => {
        
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Peut être joué comme un Sortilège sur une autre Proie facile pour lui conférer ses statistiques.";
}

function Effect10001() {
    this.run = async (sender, args, doAnimate) => { };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Injouable</em>.";
}

function Effect10002() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 2, 1, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +2/+1 à la créature alliée ciblée.";
}

function Effect10003() {
    this.run = async (sender, args, doAnimate) => {
        let f = [];
        for (let c of troops[0])
            if (c && !f.includes(c.species) && c.species != "Autre")
                f.push(c.species);
        await boostStats(args[0].card, f.length, f.length, doAnimate);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Confère +X/+X à la créature alliée ciblée, où X est le nombre de familles alliées différentes.";
}

function Effect10004() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(args[0]) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(sender) && args[0].species === "Démon") {
            sender.original.effect10004++;
            if (sender.original.effect10004 == 5) {
                sender.original.effects.splice(sender.original.effects.length - 1, 0, {
                    trigger: "",
                    id: 10006
                });
            } else if (sender.original.effect10004 == 40) {
                sender.original.shield = true;
                sender.original.hp += 5;
                sender.original.effects.splice(sender.original.effects.length - 1, 0, Math.random() < .5 ?
                {
                    trigger: "card-place",
                    id: 10005
                } :
                {
                    trigger: "turn-end",
                    id: 10007
                });
            } else if (sender.original.effect10004 == 100) {
                sender.original.revive = true;
                sender.original.hp += 5;
                sender.original.effects.splice(sender.original.effects.length - 1, 1, Math.random() < .5 ?
                {
                    trigger: "battle-start",
                    id: 10008
                } :
                {
                    trigger: "ko",
                    id: 10009
                });
            }
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 1000;
    };
    this.toBack = true;
    this.desc = "Débloque des effets supplémentaires lorsque suffisamment de Démons alliés ont subi des dégâts.";
    this.dynamicDesc = (c) => "<em>(Encore " + (c.effect10004 < 5 ? 5 - c.effect10004 : c.effect10004 < 40 ? 40 - c.effect10004 : 100 - c.effect10004) + ")</em>";
}

function Effect10005() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species === "Démon" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0].card, 4, 3, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 7 * (t.filter(e => e && e.species === "Démon").length > 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Lorsque vous jouez un Démon, lui confère +4/+3.";
}

function Effect10006() {
    this.run = async (sender, args, doAnimate) => {

    };
    this.scaling = (c, t) => {
        return [0, 2 * (t.filter(e => e && e.species === "Démon").length > 2), 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "Augmente légèrement les chances de trouver des Démons au recrutement.";
}

function Effect10007() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let options = [];
            for (let d of document.getElementById("board").children)
                if (d.children[0] && d.children[0].card.species == "Démon")
                    options.push(d.children[0]);
            shuffle(options);
            for (let c of options.slice(0, Math.min(3, options.length)))
                await boostStats(c.card, 0, 3, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 2 * t.filter(e => e.species === "Démon").length, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "A la fin de chaque tour, confère +0/+3 à 3 Démons alliés.";
}

function Effect10008() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let bottom = args[0][0].concat(args[0][1]).includes(sender);
            let p1 = bottom ? args[2] : args[3];
            let p2 = bottom ? args[3] : args[2];
            if (players[p2].hp > 1)
                await dealDamage(players[p2], 1, doAnimate, args);
            await boostStats(players[p1], 0, 1, doAnimate);
        }
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 0;
    };
    this.desc = "<em>Frappe préventive :</em> Inflige 1 dégât au commandant ennemi et restore 1 PV de votre commandant.";
}

function Effect10009() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("incarnation-du-chaos", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.scaling = (c, t) => {
        return [0, 0, 0, 0];
    };
    this.battleValue = (c, t) => {
        return 5;
    };
    this.desc = "<em>Dernière volonté :</em> Invoque une Incarnation du chaos.";
}




function fluctuate(val, inf, sup) {
    return val * (inf + Math.random() * (sup - inf));
}

async function effectProcGlow(card) {
    let c = findDOMCard(card);
    if (c) {
        let oldGlow = c.style.boxShadow;
        let oldTransition = c.style.transition;
        let oldFilter = c.style.filter;
        c.style.transition = ".4s";
        c.style.boxShadow = "0 0 30px white";
        c.style.filter = "brightness(1.8)";
        playMusic("resources/audio/sfx/effect-proc.mp3", false);
        await sleep(400);
        if (oldTransition)
            c.style.transition = oldTransition;
        else
            c.style.removeProperty("transition");
        if (oldGlow)
            c.style.boxShadow = oldGlow;
        else
            c.style.removeProperty("box-shadow");
        if (oldFilter)
            c.style.filter = oldFilter;
        else
            c.style.removeProperty("filter");
        await sleep(400);
    }
}

async function boostStats(card, atk, hp, doAnimate, preserveHP, permanent) {
    let oldTransition;
    let oldFilter;
    let c;
    if (doAnimate) {
        c = findDOMCard(card);
        if (!c)
            return;
        oldTransition = c.style.transition;
        oldFilter = c.style.filter;
        c.style.transition = ".2s";
        c.style.filter = "brightness(1.6)";
        playMusic("resources/audio/sfx/stat-boost.mp3", false);
        await sleep(200);
    }

    if (currentScene == "shop" && effect606active()) {
        atk = Math.max(0, atk);
        hp = Math.max(0, hp);
    }

    if (card.effects.findIndex(e => e.id == 323) == -1)
        card.attack += atk;
    if (card.attack < 0 && card.species !== "Commandant")
        card.attack = 0;
    card.hp += hp;
    if (preserveHP && card.hp <= 0)
        card.hp = 1;
    if (permanent && card.original) {
        if (card.effects.findIndex(e => e.id == 323) == -1)
            card.original.attack += atk;
        if (card.original.attack < 0)
            card.original.attack = 0;
        card.original.hp += hp;
        if (preserveHP && card.original.hp <= 0)
            card.original.hp = 1;
    }

    if (doAnimate) {
        updateCardStats(c);
        if (oldTransition)
            c.style.transition = oldTransition;
        else
            c.style.removeProperty("transition");
        if (oldFilter)
            c.style.filter = oldFilter;
        else
            c.style.removeProperty("filter");
        await sleep(200);
    }
}

function effect606active() {
    for (let c of troops[0])
        if (c && c.effects.findIndex(e => e.id == 606) != -1)
            return true;
    return false;
}

function effect10006active() {
    for (let c of troops[0])
        if (c && c.effects.findIndex(e => e.id == 10006) != -1)
            return true;
    return false;
}

function effect23active(player) {
    return players[player].effects.findIndex(e => e.id == 23) != -1;
}

async function dealDamage(card, damage, doAnimate, state) {
    let oldTransition;
    let oldFilter;
    let c;
    if (doAnimate) {
        c = findDOMCard(card);
        if (!c)
            return;
        oldTransition = c.style.transition;
        oldFilter = c.style.filter;
        c.style.transition = ".2s";
        c.style.filter = "grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(0.8)";
        playMusic("resources/audio/sfx/explosion.mp3", false);
        await sleep(200);
    }

    let s = card.shield;
    if (!s)
        card.hp -= damage;
    else if (damage > 0)
        card.shield = false;

    if (doAnimate) {
        updateCardStats(c);
        if (oldTransition)
            c.style.transition = oldTransition;
        else
            c.style.removeProperty("transition");
        if (oldFilter)
            c.style.filter = oldFilter;
        else
            c.style.removeProperty("filter");
        await sleep(200);
    }
    if (!s && damage > 0)
        await broadcastEvent("tookdamage", state[0], state[1], state[2], state[3], state[4], doAnimate, [card, damage, state[0], state[1], state[2], state[3], state[4]]);
}

function findDOMCard(card) {
    let items = document.getElementsByClassName("card");
    for (let d of items) {
        if (d.card && d.card === card && !d.parentElement.classList.contains("tooltip"))
            return d;
    }
    items = document.getElementsByClassName("small-card");
    for (let d of items) {
        if (d.card && d.card === card)
            return d;
    }
}

function pickRandomTarget(t) {
    let options = [];
    for (let c of t)
        if (c && c.hp > 0)
            options.push(c);
    return choice(options);
}

async function chooseTarget(callback, param, sender) {
    showDelay = 9999999;

    let filter = document.createElement('div');
    filter.className = "filter";
    filter.id = "filter";
    document.body.appendChild(filter);

    let casting = drawCard(copy(sender), 240);
    casting.id = "casting";
    casting.className += " casting";
    document.body.appendChild(casting);
    fitDescription(casting);
    
    let banner = document.createElement('div');
    banner.id = "target-banner";
    banner.className = "target-banner";
    banner.innerHTML = "Choisissez une cible";
    document.body.appendChild(banner);

    if (param.area == "board") {
        let board = document.getElementById("board");
        board.style.zIndex = "100";

        for (let d of board.children) {
            if (d.children[0]) {
                let c = d.children[0];
                c.draggable = false;
                if (isValidEffectTarget(c.card, param, sender)) {
                    c.onclick = async () => {
                        await callback(c.card);
                        await closeEffectSelector();
                        nextTargetSelection = true;
                    };
                } else {
                    c.style.transform = "none";
                    c.style.cursor = "default";
                    c.style.boxShadow = "none";
                }
            }
        }
    } else if (param.area === "shop") {
        let shop = document.getElementById("shop");
        shop.style.zIndex = "100";
        document.getElementById("shop-tier").style.zIndex = "100";
        document.getElementById("money").style.zIndex = "100";
        document.getElementById("freeze").style.zIndex = "100";
        document.getElementById("refresh").style.zIndex = "100";
        document.getElementById("freeze").style.pointerEvents = "none";
        document.getElementById("refresh").style.pointerEvents = "none";
        banner.style.top = "43%";

        for (let d of shop.children) {
            if (d.classList.contains("card")) {
                d.draggable = false;
                if (isValidEffectTarget(d.card, param, sender)) {
                    d.onclick = async () => {
                        await callback(d.card);
                        await closeEffectSelector();
                        nextTargetSelection = true;
                    };
                } else {
                    d.style.transform = "none";
                    d.style.cursor = "default";
                    d.style.boxShadow = "none";
                }
            }
        }
    }

    await waitForTargetSelection();
    filter.onclick = closeEffectSelector;
}

async function closeEffectSelector() {
    showDelay = 800;
    let board = document.getElementById("board");
    let shop = document.getElementById("shop");

    for (let d of board.children) {
        if (d.children[0]) {
            let c = d.children[0];
            c.draggable = true;
            c.onclick = () => { };
            c.style.removeProperty("transform");
            c.style.removeProperty("cursor");
            c.style.removeProperty("box-shadow");
        }
    }
    for (let d of shop.children) {
        if (d.classList.contains("card")) {
            if (coins >= 3)
                d.draggable = true;
            d.onclick = () => { };
            d.style.removeProperty("transform");
            d.style.removeProperty("cursor");
            d.style.removeProperty("box-shadow");
        }
    }

    board.style.removeProperty("z-index");
    shop.style.removeProperty("z-index");
    document.getElementById("shop-tier").style.removeProperty("z-index");
    document.getElementById("money").style.removeProperty("z-index");
    document.getElementById("freeze").style.removeProperty("z-index");
    document.getElementById("refresh").style.removeProperty("z-index");
    document.getElementById("freeze").style.removeProperty("pointer-events");
    document.getElementById("refresh").style.removeProperty("pointer-events");;
    document.body.removeChild(document.getElementById("filter"));
    document.body.removeChild(document.getElementById("casting"));
    document.body.removeChild(document.getElementById("target-banner"));

    await sleep(500);
}

function isValidEffectTarget(card, param, sender) {
    if (param.species && param.species !== card.species)
        return false;
    if (param.notself && card === sender)
        return false;
    return true;
}

const targetSelectionTimeout = async ms => new Promise(res => setTimeout(res, ms));
let nextTargetSelection = false;

async function waitForTargetSelection() {
    while (!nextTargetSelection)
        await targetSelectionTimeout(20);
    nextTargetSelection = false;
}

async function battleSummon(name, t, p, doAnimate, args) {
    let card = createCard(name);
    card.created = true;
    let i = t[0].concat(t[1]).findIndex(e => e == undefined);
    if (i != -1) {
        t[Math.floor(i / 4)][i % 4] = card;

        if (doAnimate) {
            let board = p == 0 ? document.getElementById("board") : document.getElementById("enemy-board");
            if (p != 0)
                i = (i + 4) % 8;
            let c = drawSmallCard(card, 200);
            board.children[i].appendChild(c);
            await sleep(500);
        }

        await broadcastEvent("battle-summon", args[5][0], args[5][1], args[5][2], args[5][3], args[5][4], doAnimate, [card, t].concat(args[5]));
    }
}

function isWarchief(card, player) {
    return card.reputation && card.reputation + 2 * (players[player].effects.findIndex(e => e.id == 21) != -1) >= 8;
}











const sleep = ms => new Promise(r => setTimeout(r, ms));

function choice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function removeArr(arr, x) {
    var index = arr.indexOf(x);
    if (index !== -1) {
        arr.splice(index, 1);
    }
}

function copy(x) {
    return JSON.parse(JSON.stringify(x));
}


















loadResources();