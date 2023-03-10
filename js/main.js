/* ----------------------------------------------------- */
/* -------------------- Home screen -------------------- */
/* ----------------------------------------------------- */

drawHomeScreen();

function drawHomeScreen() {
    document.body.innerHTML = "";
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
    play.onclick = startGame;

    let options = document.createElement('li');
    options.innerHTML = "Options";
    homeMenu.appendChild(options);
}



async function fadeTransition(interfaceBuilder) {
    let filter = document.createElement('div');
    filter.className = "filter-black";
    document.body.appendChild(filter);
    await sleep(500);

    document.body.innerHTML = "";
    interfaceBuilder();

    filter = document.createElement('div');
    filter.className = "filter-black";
    filter.style.animation = "fadeIn .5s ease reverse";
    document.body.appendChild(filter);
    await sleep(500);
    document.body.removeChild(filter);
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

async function startGame() {
    await fadeTransition(() => {
        initCards();
        shopTier = 6; //!!!
        round = 1;
        coins = 1000; //!!!
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

        let heroSelector1 = drawCard(commanders[0], 270);
        heroSelector1.className += " hero-selector hero-selector1";
        heroSelector1.id = "heroSelector1";
        heroSelector1.onclick = () => { selectHero(1); };
        document.body.appendChild(heroSelector1);

        let heroSelector2 = drawCard(commanders[1], 270);
        heroSelector2.className += " hero-selector hero-selector2";
        heroSelector2.id = "heroSelector2";
        heroSelector2.onclick = () => { selectHero(2); };
        document.body.appendChild(heroSelector2);

        let heroSelector3 = drawCard(commanders[2], 270);
        heroSelector3.className += " hero-selector hero-selector3";
        heroSelector3.id = "heroSelector3";
        heroSelector3.onclick = () => { selectHero(3); };
        document.body.appendChild(heroSelector3);

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

async function refreshShop(auto) {
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
                let c = drawCard(getCard(shopTier), 176);
                c.style.animation = "flip2 .15s ease forwards";
                if (coins >= 3) {
                    c.draggable = true;
                    c.addEventListener('dragstart', dragStart);
                    c.addEventListener('dragend', dragEnd);
                }
                shop.appendChild(c);
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
    if (!free)
        await spendCoins(3, false);
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
        await sleep(1000);

        let banner = document.createElement('div');
        banner.className = "shop-banner";
        banner.id = "shop-banner";
        banner.innerHTML = "Recrutement am?lior?";
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

    if (this.card && this.card.species == "Sortil?ge" && this.card.validTarget.area == "any")
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
    if (document.getElementById("hand").contains(card) && this.className == "spell-area" && card.card.species == "Sortil?ge" && card.card.validTarget.area == "any")
        playSpell(card, undefined);
    else if (document.getElementById("shop").contains(card) && this.className == "hand" && this.children[0].children.length < 6)
        buyCard(card);
    else if (!document.getElementById("shop").contains(card) && this.className == "shop")
        sellCard(card);
    else if (document.getElementById("hand").contains(card) && this.name == "position" && this.children.length == 0 && card.card.species != "Sortil?ge")
        placeCard(this, card);
    else if (card.classList.contains("small-card") && this.name == "position")
        moveCard(this, card);
    else if (document.getElementById("hand").contains(card) && this.name == "position" && this.children[0] && card.card.species == "Sortil?ge" && canPlaySpell(card.card, this.children[0].card, "board"))
        playSpell(card, this.children[0]);
}

function dragOver(e) {
    e.preventDefault();
}

function canPlaySpell(card, target, area) {
    let cond = card.validTarget;
    if (cond.area && cond.area != area)
        return false;
    if (cond.species && cond.species != target.species)
        return false;
    return true;
}

async function playSpell(c, t) {
    if (c.parentElement)
        c.parentElement.removeChild(c);
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
    //TODO
    for (let i = 1; i < 8; i++) {
        troops[i].pop();
        troops[i].unshift(getCard(shopTier, choice(species)));
    }
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

    if (finish == 1)
        console.log(p1 + " won against " + p2);
    else if (finish == 2)
        console.log(p2 + " won against " + p1);
    else
        console.log(p1 + " and " + p2 + " tied");
    await dealHeroDamage(finish, t1, t2, p1, p2, doAnimate);

    if (p1 == 0)
        lastResult = finish;

    if (doAnimate)
        drawShopScene();
}

async function repositionTroops(t1, t2, doAnimate) {
    let board = document.getElementById("board");
    for (let i = 0; i < 4; i++) {
        if (!t1[0][i] && t1[1][i]) {
            t1[0][i] = copy(t1[1][i]);
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
        }
    }

    board = document.getElementById("enemy-board");
    for (let i = 0; i < 4; i++) {
        if (!t2[0][i] && t2[1][i]) {
            t2[0][i] = copy(t2[1][i]);
            t2[1][i] = undefined;

            if (doAnimate) {
                board.children[i].children[0].style.transform = "translateY(189px)";
                board.children[i].style.setProperty("z-index", "5");
                await sleep(500);
                board.children[i].innerHTML = "";
                board.children[i].style.removeProperty("z-index");
                let c = drawSmallCard(t2[0][i], 200);
                c.style.animation = "none";
                board.children[4 + i].appendChild(c);
                await sleep(250);
            }
        }
    }
}

async function attack(t1, t2, p1, p2, turn, doAnimate) {
    let attacker = pickAttacker(t1, t2, turn);
    let o = findCardPos(attacker);
    if (doAnimate) {
        let d = findCardPos(attacker);
        d.classList.add("attacking");
        d.parentElement.style.zIndex = "10";
        await sleep(500);
    }
    let attacked = pickTarget(t1, t2, turn, attacker.range);

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
    else if (!w1 && !w2)
        return 3;
    else
        return 0;
}

function pickAttacker(t1, t2, turn) {
    let t = turn ? t1 : t2;
    for (let c of t[0]) {
        if (c && !c.hasAttacked) {
            c.hasAttacked = true;
            return c;
        }
    }
    for (let c of t[0]) {
        if (c)
            c.hasAttacked = false;
    }
    for (let c of t[0]) {
        if (c) {
            c.hasAttacked = true;
            return c;
        }
    }
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
            await sleep(200);
            o.style.removeProperty("transition");
            o.classList.remove("attacking");
            await sleep(500);
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

        await repositionTroops(t1, t2, doAnimate);
    }
}

async function drawBattleScene(t1, t2, p) {
    coins = 0;

    document.getElementById("enemy-commander").innerHTML = "";
    document.getElementById("enemy-commander").appendChild(drawCard(players[p], 270));

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
    document.getElementById("players").style.transform = "translateX(100%)";
    document.getElementById("fight").style.transform = "translateX(130px)";
    document.getElementById("hand-area").style.transform = "translate(-50%, 60%)";

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
        banner.innerHTML = "D?faite";
        filter.appendChild(banner);

        let players2 = copy(players);
        players2.sort((a, b) => { if (a.hp > b.hp) return -1; else if (a.hp < b.hp) return 1; else return 0; });
        let n = players2.findIndex(e => e.name == players[0].name) + 1;

        let place = document.createElement('div');
        place.className = "end-position";
        place.innerHTML = "Votre place : " + n + "<sup>?me</sup>";
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
        if (round % 3 == 1)
            increaseShopTier();
        spendCoins(-Math.min(10, round + 2), true);
        refreshShop(true);
        drawPlayers();

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

        await sleep(750);

        currentScene = "shop";

        await broadcastShopEvent("turn-start", []);
    }
}























/* ----------------------------------------------------- */
/* ------------------ Card management ------------------ */
/* ----------------------------------------------------- */

const speciesList = ["Dragon", "Gobelin", "Sorcier", "Soldat", "Bandit", "Machine", "B?te", "Mort-Vivant"];

const cardList = {
    "Commandant": ["commandant-de-la-legion", "roi-gobelin", "seigneur-liche", "tyran-draconique", "instructrice-de-l-academie", "l-ombre-etheree", "inventrice-prolifique", "zoomancienne-sylvestre", "monarque-inflexible", "diplomate-astucieux", "chef-du-clan-fracassecrane", "collectionneur-d-ames", "inventeur-fou"],
    "Sortil?ge": ["aiguisage", "tresor-du-dragon", "recit-des-legendes", "horde-infinie", "gobelin-bondissant", "invocation-mineure", "portail-d-invocation", "secrets-de-la-bibliotheque", "echo-arcanique", "javelot-de-feu", "noble-camaraderie", "protection-d-urgence", "corruption", "bon-tuyau", "replication-mecanique", "revisions-mecaniques", "chasse-benie", "traque", "regain-de-vie", "rite-de-sang", "reunion-celeste"],
    "Dragon": ["dragonnet-ardent", "dragon-d-or", "dragon-d-argent", "oeuf-de-dragon", "dragon-cupide", "meneuse-de-progeniture", "dragon-enchante", "devoreur-insatiable", "gardien-du-tresor", "tyran-solitaire", "terrasseur-flammegueule", "dominante-guidaile", "protecteur-brillecaille", "dragon-foudroyant", "chasseur-ecailleux"],
    "Gobelin": ["eclaireur-gobelin", "duo-de-gobelins", "agitateur-gobelin", "batailleur-frenetique", "specialiste-en-explosions", "commandant-des-artilleurs", "artilleur-vicieux", "chef-de-guerre-gobelin", "artisan-forgemalice", "gobelin-approvisionneur", "chef-de-gang", "guide-gobelin", "mercenaires-gobelins", "champion-de-fracassecrane", "escouade-hargneuse"],
    "Sorcier": ["apprentie-magicienne", "mage-reflecteur", "canaliseuse-de-mana", "maitresse-des-illusions", "amasseur-de-puissance", "doyenne-des-oracles", "archimage-omnipotent", "precheur-de-l-equilibre", "arcaniste-astral", "creation-de-foudre", "pyromancienne-novice", "reservoir-de-puissance"],
    "Soldat": ["fantassin-en-armure", "capitaine-d-escouade", "protectrice-devouee", "ecraseuse-au-bouclier", "veteran-sylvebouclier", "general-ethere", "chevalier-loyal", "baliste-de-la-legion", "tacticien-de-la-legion", "commandante-sylvelame", "mentor-chevaleresque", "recrue-peureuse", "recruteur-de-la-legion", "paladin-inspirateur", "heroine-de-la-legion"],
    "Bandit": ["archere-aux-traits-de-feu", "voleuse-a-la-tire", "gredin-agile", "pilleur-de-bibliotheque", "siphonneuse-de-mana", "voleur-audacieux", "saboteur-masque", "passe-muraille", "ombre-sans-visage", "pillarde-inconsciente", "lanceuse-de-dagues", "piegeuse-d-ames", "receleur-de-tresors", "assassin-silencieux", "voleur-de-pensees"],
    "Machine": ["planeur-de-fortune", "renard-mecanique", "colosse-adaptatif", "protecteur-de-la-cite", "golem-cinetique", "carcasse-mecanophage", "automate-replicateur", "artisan-gadgetiste", "baliste-ambulante", "automate-manaforme", "auto-duplicateur", "chef-de-la-proliferation", "ouvrier-assembleur", "garde-de-fer", "robot-astiqueur"],
    "B?te": ["predateur-en-chasse", "devoreur-sauvage", "chasseur-bondissant", "guivre-colossale", "gardien-de-la-foret", "ame-rugissante", "colonie-de-rats", "hydre-vorace", "hydre-enragee", "avatar-de-la-predation", "alligator-charognard", "meneuse-de-betes", "hurleur-des-sylves", "chargeur-cuirasse", "mastodonte-galopant"],
    "Mort-Vivant": ["serviteur-exhume", "squelette-reconstitue", "archer-squelette", "liche-profanatrice", "devoreur-pourrissant", "eveilleur-d-ames", "creation-abjecte", "necromancienne-corrompue", "raccommodeur-de-cadavres", "guerrier-maudit", "crane-possede", "dragon-decharne", "marcheur-eternel", "soldat-revenu-a-la-vie", "assistant-du-raccommodeur"],
    "Autre": ["changeforme-masque", "ange-guerrier", "guide-angelique", "archange-eclatant", "ange-de-l-unite", "combattant-celeste"]
};

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

    for (let s of speciesList)
        cardList[s] = [cardList[s][0]]; //!!!

    for (let s of species.concat(["Sortil?ge", "Autre"])) {
        for (let c of cardList[s])
            for (let i = 0; i < 15; i++) {
                let card = createCard(c);
                if (!card.requirement || species.includes(card.requirement))
                    if (!card.requirement) //!!!
                    cards.push(createCard(c));
            }
    }

    commanders = [];
    for (let c of cardList["Commandant"]) {
        let card = createCard(c);
        if (!card.requirement || species.includes(card.requirement))
            commanders.push(card);
    }

    shuffle(cards);
    shuffle(commanders);
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

        default:
            alert("Carte inconnue : " + card);
            return;
    }
}


// Commandants

function CommandantDeLaLegion() {
    this.name = "Commandant de la L?gion";
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
        }
    ];
}

function InstructriceDeLAcademie() {
    this.name = "Instructrice de l'Acad?mie";
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
    this.name = "L'Ombre ?ther?e";
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
    this.hp = 30;
    this.src = "commandants/zoomancienne-sylvestre.jpg";
    this.requirement = "B?te";
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
    this.name = "Chef du clan Fracassecr?ne";
    this.species = "Commandant";
    this.attack = -1;
    this.hp = 40;
    this.src = "commandants/chef-du-clan-fracassecrane.jpg";
    this.effects = [
        {
            trigger: "",
            id: 11
        }
    ];
}

function CollectionneurDAmes() {
    this.name = "Collectionneur d'?mes";
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
    this.name = "Dragon enchant?";
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
    this.name = "Meneuse de prog?niture";
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
    this.name = "D?voreur insatiable";
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
    this.name = "Gardien du tr?sor";
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
    this.name = "Protecteur Brill?caille";
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
    this.name = "Tr?sor du dragon";
    this.species = "Sortil?ge";
    this.attack = -1;
    this.hp = -1;
    this.src = "dragons/tresor-du-dragon.jpg";
    this.tier = 2;
    this.requirement = "Dragon";
    this.effects = [
        {
            trigger: "",
            id: 1001
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
    this.name = "R?cit des l?gendes";
    this.species = "Sortil?ge";
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
    this.name = "Batailleur fr?n?tique";
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
    this.name = "Champion de Fracassecr?ne";
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
    this.name = "Sp?cialiste en explosions";
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
    this.species = "Sortil?ge";
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
    this.species = "Sortil?ge";
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
    this.species = "Sortil?ge";
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
    this.name = "Pr?cheur de l'?quilibre";
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
    this.name = "Mage r?flecteur";
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
    this.species = "Sortil?ge";
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
    this.name = "?cho arcanique";
    this.species = "Sortil?ge";
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
    this.name = "Ma?tresse des illusions";
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
    this.name = "Cr?ation de foudre";
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
    this.name = "R?servoir de puissance";
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
    this.species = "Sortil?ge";
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
    this.name = "Secrets de la biblioth?que";
    this.species = "Sortil?ge";
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
    this.name = "Recruteur de la L?gion";
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
    this.species = "Sortil?ge";
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
    this.name = "?craseuse au bouclier";
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
    this.name = "Baliste de la L?gion";
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
    this.species = "Sortil?ge";
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
    this.name = "Protectrice d?vou?e";
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
    this.name = "Tacticien de la L?gion";
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
    this.name = "V?t?ran Sylvebouclier";
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
    this.name = "H?ro?ne de la L?gion";
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
    this.name = "G?n?ral ?ther?";
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
    this.name = "Arch?re aux traits de feu";
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
    this.name = "Voleuse ? la tire";
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
    this.name = "Pilleur de biblioth?que";
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
    this.species = "Sortil?ge";
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
    this.name = "Pi?geuse d'?mes";
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
    this.name = "Voleur de pens?es";
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
    this.species = "Sortil?ge";
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
    this.name = "Saboteur masqu?";
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
    this.name = "Receleur de tr?sors";
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
    this.name = "Renard m?canique";
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
    this.name = "Protecteur de la cit?";
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
        }
    ];
}

function ReplicationMecanique() {
    this.name = "R?plication m?canique";
    this.species = "Sortil?ge";
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
    this.name = "Golem cin?tique";
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
    this.name = "Carcasse m?canophage";
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
    this.name = "Chef de la Prolif?ration";
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
    this.name = "Artisan gadg?tiste";
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
    this.name = "Automate r?plicateur";
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
    this.name = "R?visions m?caniques";
    this.species = "Sortil?ge";
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


// B?tes

function PredateurEnChasse() {
    this.name = "Pr?dateur en chasse";
    this.species = "B?te";
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
    this.name = "D?voreur sauvage";
    this.species = "B?te";
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
    this.species = "B?te";
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
    this.name = "?me rugissante";
    this.species = "B?te";
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
    this.name = "B?n?diction de chasse";
    this.species = "Sortil?ge";
    this.attack = -1;
    this.hp = -1;
    this.src = "betes/chasse-benie.jpg";
    this.tier = 2;
    this.requirement = "B?te";
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
    this.species = "B?te";
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
    this.species = "B?te";
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
    this.species = "B?te";
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
    this.name = "Chargeur cuirass?";
    this.species = "B?te";
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
    this.species = "B?te";
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
    this.species = "B?te";
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
    this.species = "Sortil?ge";
    this.attack = -1;
    this.hp = -1;
    this.src = "betes/traque.jpg";
    this.tier = 4;
    this.requirement = "B?te";
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
    this.name = "Gardien de la for?t";
    this.species = "B?te";
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
    this.name = "Hydre enrag?e";
    this.species = "B?te";
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
    this.species = "Autre";
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
    this.name = "Avatar de la pr?dation";
    this.species = "B?te";
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
    this.name = "Meneuse de b?tes";
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
    this.name = "Serviteur exhum?";
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
    this.name = "Squelette reconstitu?";
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
    this.name = "Soldat revenu ? la vie";
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
    this.name = "D?voreur pourrissant";
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
    this.name = "Eveilleur d'?mes";
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
    this.name = "Dragon d?charn?";
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
    this.name = "Cr?ne poss?d?";
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
    this.name = "N?cromancienne corrompue";
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
    this.name = "Cr?ation abjecte";
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
    this.species = "Sortil?ge";
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
    this.name = "Marcheur ?ternel";
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
    this.species = "Sortil?ge";
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


// Autre

function AngeDeLUnite() {
    this.name = "Ange de l'unit?";
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
    this.name = "Changeforme masqu?";
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
    this.name = "Guide ang?lique";
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
    this.name = "Archange ?clatant";
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
    this.name = "Combattant c?leste";
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
    this.species = "Sortil?ge";
    this.attack = -1;
    this.hp = -1;
    this.src = "sortileges/aiguisage.jpg";
    this.tier = 1;
    this.effects = [
        {
            trigger: "",
            id: 1002
        }
    ];
    this.validTarget = {
        area: "board"
    };
}

function ReunionCeleste() {
    this.name = "R?union c?leste";
    this.species = "Sortil?ge";
    this.attack = -1;
    this.hp = -1;
    this.src = "sortileges/reunion-celeste.jpg";
    this.tier = 4;
    this.effects = [
        {
            trigger: "",
            id: 1003
        }
    ];
    this.validTarget = {
        area: "board"
    };
}


// Tokens

function PieceDOr() {
    this.name = "Piece d'or";
    this.species = "Sortil?ge";
    this.attack = -1;
    this.hp = -1;
    this.src = "sortileges/piece-d-or.jpg";
    this.tier = 7;
    this.effects = [
        {
            trigger: "",
            id: 1001
        }
    ];
    this.validTarget = {

    };
}

function ProieFacile() {
    this.name = "Proie facile";
    this.species = "B?te";
    this.attack = 0;
    this.hp = 1;
    this.src = "betes/proie-facile.jpg";
    this.tier = 7;
    this.effects = [

    ];
}

function ScionAspirame() {
    this.name = "Scion aspir?me";
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
    this.species = "Sortil?ge";
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
    this.species = "Sortil?ge";
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
    this.name = "?quilibre naturel";
    this.species = "Sortil?ge";
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
    this.name = "D?phasage";
    this.species = "Sortil?ge";
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
    this.name = "Automate r?plicateur";
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
    this.name = "Ouvrier assembl?";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 3;
    this.src = "machines/ouvrier-assemble.jpg";
    this.tier = 7;
    this.effects = [

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
    desc.innerHTML = getDescription(c);
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
        c.children[2].children[0].innerHTML = getDescription(c.card);
        let footer = c.children[3];
        if (footer.children[0].classList.contains("attack"))
            footer.children[0].children[0].innerHTML = c.card.attack;
        footer.children[1].children[0].innerHTML = c.card.species;
        if (footer.children[2].classList.contains("hp"))
            footer.children[2].children[0].innerHTML = c.card.hp;
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
        text.style.fontSize = (size - 1).toString() + "px";
    }

    let tips = document.createElement('div');
    tips.className = "tips";
    tooltip.appendChild(tips);

    if (c.shield || containsKeyword(c, "Bouclier")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Bouclier :</em> Annule les premiers d?g?ts subis chaque combat.";
        tips.appendChild(shield);
    }
    if (c.revive || containsKeyword(c, "R?surrection")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>R?surrection :</em> Ressuscite avec 1PV apr?s la premi?re mort.";
        tips.appendChild(shield);
    }
    if (c.range || containsKeyword(c, "Port?e")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Port?e :</em> Peut attaquer la ligne arri?re.";
        tips.appendChild(shield);
    }
    if (c.deathtouch || containsKeyword(c, "Contact mortel")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Contact mortel :</em> Tue instantan?ment les cr?atures qu'elle blesse.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Recrue")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Recrue :</em> Se produit lorsque la cr?ature est jou?e.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Derni?re volont?")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Derni?re volont? :</em> Se produit ? la mort de la cr?ature.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Frappe pr?ventive")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Frappe pr?ventive :</em> Se produit au d?but du combat.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Rage")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Rage :</em> Se produit lorsque la cr?ature subit des d?g?ts.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Reconfiguration")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Reconfiguration :</em> Alterne entre plusieurs effets chaque d?but de tour.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "D?vore")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>D?vore :</em> D?truit la cr?ature cibl?e et gagne ses statistiques.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Injouable")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Injouable :</em> Ne peut qu'?tre revendu.";
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

function getDescription(c) {
    let res = "";
    if (c.shield)
        res += "<em>Bouclier</em>.</br>";
    if (c.revive)
        res += "<em>R?surrection</em>.</br>";
    if (c.range)
        res += "<em>Port?e</em>.</br>";
    if (c.deathtouch)
        res += "<em>Contact mortel</em>.</br>";
    for (let e of c.effects)
        if (createEffect(e.id).desc != "")
            res += createEffect(e.id).desc + "</br>";
    return res;
}

function containsKeyword(c, word) {
    for (let e of c.effects)
        if (createEffect(e.id).desc.includes(word))
            return true;
    return false;
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
        case 1001:
            return new Effect1001();
        case 1002:
            return new Effect1002();
        case 1003:
            return new Effect1003();
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
        default:
            alert("Effet inconnu : " + id);
    }
}

function Effect1() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species === "Dragon") {
            if (doAnimate)
                await effectProcGlow(sender);
            await spendCoins(-1, false);
        }
    };
    this.desc = "Gagnez 1 pi?ce d'or ? chaque fois que vous achetez un Dragon.";
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
    this.desc = "Lorsque vous jouez une cr?ature avec Bouclier, vos autres cr?atures avec Bouclier gagnent +1/+1.";
}

function Effect3() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.created) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0].card, 2, 3, doAnimate);
        }
    };
    this.desc = "Conf?re +2/+3 aux cr?atures que vous jouez et que vous n'avez pas achet?es.";
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
    this.desc = "Lorsqu'un Gobelin alli? meurt, inflige 1 d?g?t ? une cr?ature adverse al?atoire.";
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
    this.desc = "<em>Frappe pr?ventive :</em> La premi?re cr?ature alli?e acquiert <em>R?surrection</em>.";
}

function Effect6() {
    this.run = async (sender, args, doAnimate) => {
        if (round % 2 == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = getCard(shopTier, "Sortil?ge");
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "Tous les 2 tours, ajoute un Sortil?ge al?atoire dans votre main.";
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
    this.desc = "Conf?re \"<em>Reconfiguration :</em> Gagne +1/+0 <em>ou</em> Gagne +0/+1.\" aux Machines alli?es.";
}

function Effect8() {
    this.run = async (sender, args, doAnimate) => {
        if (round % 2 == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "Tous les 2 tours, ajoute une Proie facile dans votre main.";
}

function Effect9() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let c = args[0].card;
        for (let d of document.getElementById("board").children) {
            if (d.children[0]) {
                if (d.children[0].card.species != c.species)
                    await boostStats(d.children[0].card, 1, 1, doAnimate);
            }
        }
    };
    this.desc = "Lorsque vous revendez une cr?ature, conf?re +1/+1 aux cr?atures alli?es d'autres familles.";
}

function Effect10() {
    this.run = async (sender, args, doAnimate) => {
        if (lastResult > 1) {
            if (doAnimate)
                await effectProcGlow(sender);
            spendCoins(1 - lastResult);
        }
    };
    this.desc = "Gagnez 1 pi?ce d'or au d?but de votre tour si vous n'avez pas gagn? le dernier combat.";
}

function Effect11() {
    this.run = async (sender, args, doAnimate) => { };
    this.desc = "Inflige 3 d?g?ts suppl?mentaires aux autres commandants.";
}

function Effect12() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let card = new ScionAspirame();
        card.created = true;
        await addToHand(drawCard(card, 176));
    };
    this.desc = "Commencez la partie avec un Scion aspir?me en main.";
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
    this.desc = "Lorsque vous recherchez des recrues, leur donne +1/+1 puis m?lange leurs statistiques.";
}

function Effect101() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new PieceDOr();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute 1 Pi?ce d'or ? votre main.";
}

function Effect102() {
    this.run = async (sender, args, doAnimate) => {
        if (coins > 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, Math.min(6, 2 * coins), Math.min(6, 2 * coins), doAnimate);
        }
    };
    this.desc = "A la fin de votre tour, gagne +2/+2 pour chaque pi?ce d'or inutilis?e, jusqu'? 3.";
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
            if (sender.effect103 >= 5) {
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
    this.desc = "Apr?s avoir jou? 5 autres Dragons, se transforme en Dragon d'or.";
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
    this.desc = "Lorsque vous obtenez des pi?ces d'or, gagne +1/+1 jusqu'au prochain tour.";
}

function Effect105() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect104 && sender.effect104 > 0) {
            await boostStats(sender, -sender.effect104, -sender.effect104, doAnimate);
            sender.effect104 = 0;
        }
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
    this.desc = "<em>Recrue :</em> Gagnez 1 pi?ce d'or pour chaque autre Dragon alli?.";
}

function Effect107() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new PieceDOr();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Ajoute 1 Pi?ce d'or ? votre main.";
}

function Effect108() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species == "Dragon" && args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await spendCoins(-1, false);
        }
    };
    this.desc = "Lorsque vous revendez un Dragon, obtenez une pi?ce d'or suppl?mentaire.";
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
    this.desc = "Lorsque vous gagnez des pi?ces d'or, conf?re +0/+1 ? 3 Dragons alli?s.";
}

function Effect110() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] < 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 0, doAnimate);
        }
    };
    this.desc = "Lorsque vous gagnez des pi?ces d'or, gagne +1/+0.";
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
    this.desc = "<em>Recrue :</em> Gagne -1/-1 pour chaque autre Dragon alli?.";
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
    this.desc = "Lorsque vous revendez cette carte depuis le plateau, conf?re ses statistiques ? un Dragon alli?.";
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
    this.desc = "Inflige 12 d?g?ts aux cr?atures derri?re les cr?atures attaqu?es.";
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
    this.desc = "Lorsque cette cr?ature est attaqu?e, elle conf?re d?finitivement +2/+1 aux Dragons alli?s.";
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
    this.desc = "<em>Derni?re volont? :</em> Tous les dragons alli?s gagnent +0/+20.";
}

function Effect116() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            await dealDamage(args[1], 3, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
        }
    };
    this.desc = "Lorsque cette cr?ature est attaqu?e, elle inflige 3 d?g?ts ? l'attaquant avant de combattre.";
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
    this.desc = "A la fin de votre tour, gagne +1/+0 pour chaque autre Dragon alli?.";
}

function Effect118() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            await spendCoins(-2, false);
        }
    };
    this.desc = "Lorsque vous revendez cette carte, obtenez 2 pi?ces d'or suppl?mentaires.";
}

function Effect119() {
    this.run = async (sender, args, doAnimate) => {
        let n = lastResult == 1 ? 5 : 1;
        await boostStats(args[0].card, n, n, doAnimate);
    };
    this.desc = "Conf?re +1/+1 au Dragon alli? cibl?, ou +5/+5 si vous avez gagn? le dernier combat.";
}

function Effect201() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            document.getElementById("refresh").style.boxShadow = "0 0 15px green";
            discountedRefreshes++;
        }
    };
    this.desc = "<em>Recrue :</em> R?duit de 1 le co?t de la prochaine recherche de recrues.";
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
    this.desc = "<em>Recrue :</em> Invoque un Guerrier gobelin.";
}

function Effect203() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque un Artificier gobelin.";
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
    this.desc = "<em>Derni?re volont? :</em> Inflige 3 d?g?ts ? une cr?ature ennemie al?atoire.";
}

function Effect205() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].species == "Gobelin" && args[0] !== sender && sender.hp > 0) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender))
                await boostStats(sender, 2, 1, doAnimate);
        }
    };
    this.desc = "Lorsqu'un Gobelin alli? meurt, gagne +2/+1.";
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
    this.desc = "<em>Derni?re volont? :</em> Inflige 2 d?g?ts ? une cr?ature ennemie al?atoire 5 fois.";
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
    this.desc = "Lorsque cette cr?ature attaque, elle inflige 5 d?g?ts ? une cr?ature adverse al?atoire.";
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
    this.desc = "Lorsqu'une cr?ature adverse subit des d?g?ts, conf?re d?finitivement +1/+0 ? un autre gobelin alli?.";
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
    this.desc = "Lorsqu'un Gobelin alli? attaque, inflige 2 d?g?ts ? sa cible avant qu'il ne combatte.";
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
    this.desc = "<em>Recrue :</em> Vos autres Gobelins gagnent +0/+2.";
}

function Effect211() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && containsKeyword(args[0].card, "Derni?re volont?") && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 2, doAnimate);
        }
    };
    this.desc = "Lorsque vous jouez une carte avec <em>Derni?re volont?</em>, gagne +1/+2.";
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
    this.desc = "<em>Derni?re volont? :</em> Conf?re d?finitivement +1/+1 ? tous les autres Gobelins alli?s.";
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
                    if ((createEffect(e.id)).desc.startsWith("<em>Derni?re volont? :</em>"))
                        t[i].effects.push(e);
            }
            if (i % 4 < 3 && t[i + 1]) {
                for (let e of t[i + 1].effects)
                    if ((createEffect(e.id)).desc.startsWith("<em>Derni?re volont? :</em>"))
                        t[i].effects.push(e);
            }
        }
    };
    this.desc = "<em>Frappe pr?ventive :</em> Copie les effets de <em>Derni?re volont?</em> de ses voisins lat?raux.";
}

function Effect214() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque trois Artificiers gobelins.";
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
    this.desc = "<em>Frappe pr?ventive :</em> Gagne de l'attaque ?quivalente ? l'attaque du Gobelin voisin le plus fort.";
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
    this.desc = "<em>Derni?re volont? :</em> Invoque trois Gobelins al?atoires de niveau inf?rieur ou ?gal ? 3.";
}

function Effect217() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 203
        });
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.desc = "Conf?re \"<em>Derni?re volont? :</em> Invoque un Artificier gobelin.\" au Gobelin alli? cibl?.";
}

function Effect218() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(shopTier, "Gobelin");
        card.created = true;
        card.range = true;
        addToHand(drawCard(card, 176));
        await boostStats(card, 0, 0, doAnimate);
    };
    this.desc = "Ajoute un Gobelin al?atoire ? votre main et lui conf?re <em>Port?e</em>.";
}

function Effect301() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new ConnaissancesArcaniques();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute une Connaissances arcaniques ? votre main.";
}

function Effect302() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 1, 1, doAnimate);
    };
    this.desc = "Conf?re +1/+1 ? la cr?ature alli?e cibl?e.";
}

function Effect303() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(1);
        while (card.species == "Sortil?ge")
            card = getCard(1);
        card.created = true;
        card.attack = 3;
        card.hp = 3;
        await summonCard(card);
    };
    this.desc = "Invoque une cr?ature de niveau 1 al?atoire et fixe ses statistiques ? 3/3.";
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
    this.desc = "Le premier sort jou? sur cette cr?ature chaque tour prend effet deux fois.";
}

function Effect305() {
    this.run = async (sender, args, doAnimate) => {
        sender.effect304 = 0;
    };
    this.desc = "";
}

function Effect306() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 1, 1, doAnimate);
    };
    this.desc = "Gagne +1/+1 lorsque que vous jouez un Sortil?ge.";
}

function Effect307() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            let card = getCard(shopTier);
            while (card.species == "Sortil?ge" || (card.tier < 3 && shopTier >= 3) || card.effects.findIndex(e => e.id == 307) != -1)
                card = getCard(shopTier);
            card.created = true;
            if (doAnimate)
                await effectProcGlow(sender);
            await summonCard(card);
        }
    };
    this.desc = "A la fin de votre tour, invoque une cr?ature de niveau sup?rieur ou ?gal ? 3.";
}

function Effect308() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new CatalyseurDePuissance();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Ajoute un Catalyseur de puissance ? votre main.";
}

function Effect309() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 2, 1, doAnimate);
    };
    this.desc = "Conf?re +2/+1 ? la cr?ature alli?e cibl?e.";
}

function Effect310() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board") && args[1]) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[1], 2, 2, doAnimate);
        }
    };
    this.desc = "Lorsque vous jouez un Sortil?ge sur une cr?ature alli?e, lui conf?re +2/+2.";
}

function Effect311() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect311)
                sender.effect311 = [];
            sender.effect311.push(copy(args[0]));
        }
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
    this.desc = "A la fin de votre tour, rejoue les 3 derniers Sortil?ges jou?s ce tour-ci sur des cibles al?atoires.";
}

function Effect313() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (sender.effect311)
                sender.effect311 = [];
        }
    };
    this.desc = "";
}

function Effect314() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(Math.min(6, shopTier + 1));
        while (card.species == "Sortil?ge" || card.tier != Math.min(6, shopTier + 1))
            card = getCard(Math.min(6, shopTier + 1));
        card.created = true;
        await summonCard(card);
    };
    this.desc = "Invoque une cr?ature du niveau sup?rieur ? votre niveau de recrutement.";
}

function Effect315() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new EquilibreNaturel();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute un ?quilibre naturel ? votre main.";
}

function Effect316() {
    this.run = async (sender, args, doAnimate) => {
        let atk = args[0].card.attack;
        let hp = args[0].card.hp;
        let datk = Math.floor((hp - atk) / 2);
        let dhp = Math.floor((atk - hp) / 2);
        await boostStats(args[0].card, datk + 1, dhp + 1, doAnimate);
    };
    this.desc = "Conf?re +1/+1 ? la cr?ature alli?e cibl?e, puis ?quilibre ses statistiques.";
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
    this.desc = "Joue 5 Connaissances arcaniques sur des cibles al?atoires.";
}

function Effect318() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new Dephasage();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute un D?phasage ? votre main.";
}

function Effect319() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.shield = true;
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.desc = "Conf?re <em>Bouclier</em> au Sorcier alli? cibl?.";
}

function Effect320() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect320 && sender.effect320 > 0 && sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                dealDamage(target, sender.effect320, doAnimate, args);
            }
        }
    };
    this.desc = "<em>Frappe pr?ventive :</em> Inflige 1 d?g?t ? une cible adverse al?atoire pour chaque Sortil?ge jou? depuis que cette carte est en jeu.";
}

function Effect321() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect320)
                sender.effect320 = 0;
            sender.effect320++;
        }
    };
    this.desc = "";
}

function Effect322() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            effectProcGlow(sender);
        let card = new CatalyseurDePuissance();
        card.created = true;
        await addToHand(drawCard(card, 176));
        if (lastResult && lastResult == 2) {
            let card = new CatalyseurDePuissance();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "Au d?but de votre tour, ajoute un Catalyseur de puissance ? votre main, ou deux si vous avez perdu le dernier combat.";
}

function Effect323() {
    this.run = async (sender, args, doAnimate) => {
        
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
    this.desc = "Jusqu'au prochain tour, conf?re +1/+2 ? une cr?ature alli?e al?atoire lorsque vous jouez un Sortil?ge.";
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
    this.desc = "";
}

function Effect327() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.range = true;
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.desc = "Conf?re <em>Port?e</em> au Sorcier alli? cibl?.";
}

function Effect401() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget((target) => {
                boostStats(target, 1, 2, doAnimate);
            }, {
                area: "board",
                species: "Soldat",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re +1/+2 ? un autre Soldat alli? cibl?.";
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
    this.desc = "<em>Derni?re volont? :</em> Conf?re <em>Bouclier</em> aux Soldats voisins.";
}

function Effect403() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.shield) {
            await boostStats(sender, 5, 0, doAnimate);
        }
    };
    this.desc = "Lorsque cette cr?ature attaque ou est attaqu?e, si elle a le <em>Bouclier</em>, elle gagne +5/+0.";
}

function Effect404() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.shield) {
            await boostStats(sender, 5, 0, doAnimate);
        }
    };
    this.desc = "";
}

function Effect405() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget((target) => {
                target.shield = true;
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Soldat",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re <em>Bouclier</em> ? un autre Soldat alli? cibl?.";
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
    this.desc = "Lorsqu'une cr?ature alli?e avec <em>Bouclier</em> attaque ou est attaqu?e, elle gagne d?finitivement +3/+3.";
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
    this.desc = "Lorsqu'une cr?ature alli?e qui a eu <em>Bouclier</em> meurt, gagne <em>Bouclier</em>.";
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
    this.desc = "<em>Frappe pr?ventive :</em> Conf?re <em>Port?e</em> aux Soldats voisins.";
}

function Effect410() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("board").children)
                if (d.children[0])
                    await boostStats(d.children[0].card, 1, 1, doAnimate);
        }
    };
    this.desc = "A la fin de chaque tour, conf?re +1/+1 ? tous les Soldats alli?s.";
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
    this.desc = "<em>Frappe pr?ventive :</em> Conf?re +1/+2 aux Soldats alli?s pour chacun de leurs voisins diff?rents.";
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
    this.desc = "<em>Frappe pr?ventive :</em> Conf?re +10/+10 au Soldat ? sa gauche.";
}

function Effect413() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(sender) && sender.hp > 0) {
            await boostStats(sender, -1, 0, doAnimate);
        }
    };
    this.desc = "Lorsqu'une cr?ature alli?e meurt, gagne -1/-0.";
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
    this.desc = "Lorsque vous jouez un Soldat, conf?re +1/+1 ? un Soldat alli? al?atoire.";
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
                addToHand(drawCard(card, 176));
            }
        }
    };
    this.desc = "Au d?but de votre tour, ajoute ? votre main une copie de base d'un autre Soldat alli? al?atoire.";
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
    this.desc = "Lorsque cette cr?ature attaque, elle fait perdre le <em>Bouclier</em>, la <em>R?surrection</em>, la <em>Port?e</em> et le <em>Contact mortel</em> ? la cr?ature attaqu?e avant de combattre.";
}

function Effect417() {
    this.run = async (sender, args, doAnimate) => {
        let t = [];
        for (let d of document.getElementById("board").children)
            t.push(d.children[0] ? d.children[0].card : undefined);
        let i = t.findIndex(e => e === args[0].card);
        boostStats(t[i], 1, 1, doAnimate);
        if (i % 4 > 0 && t[i - 1])
            boostStats(t[i - 1], 1, 1, doAnimate);
        if (t[(i + 4) % 8])
            boostStats(t[(i + 4) % 8], 1, 1, doAnimate);
        if (i % 4 < 3 && t[i + 1])
            boostStats(t[i + 1], 1, 1, doAnimate);
    };
    this.desc = "Conf?re +1/+1 ? un Soldat alli? et ? ses voisins.";
}

function Effect418() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 419
        });
    };
    this.desc = "Conf?re \"Lorsque le dernier alli? de cette cr?ature meurt, elle acquiert <em>Bouclier</em>.\" ? une cr?ature alli?e.";
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
    this.desc = "Lorsque le dernier alli? de cette cr?ature meurt, elle acquiert <em>Bouclier</em>.";
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
    this.desc = "<em>Recrue :</em> D?place une carte al?atoire disponible au recrutement dans votre main.";
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
    this.desc = "<em>Frappe pr?ventive :</em> Inflige 2 d?g?ts ? une cible adverse al?atoire.";
}

function Effect503() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = getCard(shopTier, "Sortil?ge");
            card.created = true;
            addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute un Sortil?ge al?atoire ? votre main.";
}

function Effect504() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.created && findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 2, 1, doAnimate);
    };
    this.desc = "Gagne +2/+1 lorsque vous jouez une carte que vous n'avez pas achet?e.";
}

function Effect505() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].created && findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 2, 1, doAnimate);
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
                    let card = copy(target);
                    card.species = "Bandit";
                    card.created = true;
                    addToHand(drawCard(card, 176));
                }
            }
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute une copie de base d'une cr?ature de votre dernier adversaire ? votre main. Elle devient un Bandit.";
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
    this.desc = "<em>Frappe pr?ventive :</em> R?duit l'attaque des cr?atures ennemies de 1 pour chaque autre Bandit alli?.";
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
    this.desc = "Lorsqu'une cr?ature alli?e attaque la ligne arri?re, elle gagne +4/+2.";
}

function Effect509() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species == "Bandit" && findDOMCard(sender).parentElement.parentElement.classList.contains("board"))
            await boostStats(sender, 1, 1, doAnimate);
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
    this.desc = "Lorsque vous revendez une carte que vous n'avez pas achet?e, obtenez une pi?ce d'or suppl?mentaire.";
}

function Effect511() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget((target) => {
                target.range = true;
                boostStats(target, 0, 0, doAnimate);
            }, {
                area: "board",
                species: "Bandit",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re <em>Port?e</em> ? un autre Bandit alli? cibl?.";
}

function Effect512() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[3][0].concat(args[3][1]) : args[2][0].concat(args[2][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                let card = copy(target);
                card.created = true;
                await addToHand(drawCard(card, 176));
            }
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Ajoute une copie de base d'une cr?ature adverse al?atoire ? votre main.";
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
    this.desc = "Lorsque vous jouez une carte que vous n'avez pas achet?e, conf?re +2/+2 ? 3 cr?atures alli?es al?atoires.";
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
    this.desc = "A la fin de votre tour, d?place la carte de plus haut niveau disponible au recrutement dans votre main.";
}

function Effect516() {
    this.run = async (sender, args, doAnimate) => {
        await spendCoins(-1, false);
        for (let c of document.getElementsByClassName("small-card"))
            if (c.parentElement.parentElement.classList.contains("board") && c.card.created && c.card.species != "Bandit" && c.card.species != "Sortil?ge") {
                c.card.species = "Bandit";
                boostStats(c.card, 0, 0, doAnimate);
            }
        for (let c of document.getElementsByClassName("card"))
            if (c.parentElement.parentElement.classList.contains("hand") && c.card.created && c.card.species != "Bandit" && c.card.species != "Sortil?ge") {
                c.card.species = "Bandit";
                boostStats(c.card, 0, 0, doAnimate);
            }
    };
    this.desc = "Gagnez une pi?ce d'or. Toutes les cr?atures en jeu et dans votre main que vous n'avez pas achet?es deviennent des Bandits.";
}

function Effect517() {
    this.run = async (sender, args, doAnimate) => {
        players[0].effects.push({
            trigger: "turn-start",
            id: 518
        });
    };
    this.desc = "Au d?but de votre prochain tour, ajoute 2 copies de base de cr?atures de votre prochain adversaire ? votre main.";
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
                    let card = copy(target);
                    card.created = true;
                    addToHand(drawCard(card, 176));
                }
            }
        }
        sender.effects.splice(sender.effects.findIndex(e => e.id == 518), 1);
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
    this.desc = "<em>Reconfiguration :</em> Conf?re +1/+0 ? une cr?ature alli?e al?atoire <em>ou</em> Conf?re +0/+1 ? une cr?ature alli?e al?atoire.";
}

function Effect603() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let d of document.getElementById("shop").children)
                if (d.classList.contains("card") && d.card.species != "Sortil?ge")
                    await boostStats(d.card, 1, 1, doAnimate);
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re +1/+1 aux cr?atures disponibles au recrutement.";
}

function Effect604() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (!sender.effect604 || sender.effect604 == 0) {
                sender.effect604 = 1;
                await boostStats(sender, 7, -4, doAnimate, true);
            } else {
                sender.effect604 = 0;
                await boostStats(sender, -4, 7, doAnimate, true);
            }
        }
    };
    this.desc = "<em>Reconfiguration :</em> Gagne +7/-4 <em>ou</em> Gagne -4/+7.";
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
    this.desc = "<em>Reconfiguration :</em> Gagne <em>Bouclier</em> et perd <em>Port?e</em> <em>ou</em> Gagne <em>Port?e</em> et perd <em>Bouclier</em>.";
}

function Effect606() {
    this.run = async (sender, args, doAnimate) => {

    };
    this.desc = "Pendant la phase de recrutement, les statistiques de vos cr?atures ne peuvent pas baisser.";
}

function Effect607() {
    this.run = async (sender, args, doAnimate) => {
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
    };
    this.desc = "A la fin de chaque tour, cette cr?ature vole jusqu'? 6/6 ? la Machine derri?re elle, si possible.";
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
    this.desc = "<em>Derni?re volont? :</em> Conf?re +2/+2 ? toutes les autres Machines alli?es, puis invoque deux copies de base de cette cr?ature sans r?invocation.";
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
    this.desc = "<em>Derni?re volont? :</em> Conf?re +2/+2 ? toutes les autres Machines alli?es.";
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
    this.desc = "A la fin de votre tour, red?clenche les <em>Reconfigurations</em> des Machines voisines.";
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
    this.desc = "<em>Frappe pr?ventive :</em> Inflige 8 d?g?ts ? la cr?ature adverse avec les PV les plus faibles.";
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
            if (t[(i + 4) % 8])
                cards.push(t[(i + 4) % 8]);
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
    this.desc = "<em>Reconfiguration :</em> Conf?re +X/-3 <em>ou</em> Conf?re -3/+X ? ses voisins lat?raux, X ?tant le nombre de Machines alli?es.";
}

function Effect613() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("auto-duplicateur-mod", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque une copie de base de cette cr?ature sans r?invocation.";
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
    this.desc = "Lorsqu'une cr?ature alli?e est invoqu?e en combat, gagne +3/+2.";
}

function Effect615() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque trois Ouvriers assembl?s.";
}

function Effect616() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && args[0].card.species == "Machine" && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 0, 1, doAnimate);
        }
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
    this.desc = "";
}

function Effect619() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("ouvrier-assemble", args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque un Ouvrier assembl?.";
}

function Effect620() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.effects.push({
            trigger: "ko",
            id: 619
        });
        boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.desc = "Conf?re \"<em>Derni?re volont? :</em> Invoque un Ouvrier assembl?.\" ? la Machine alli?e cibl?e.";
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
    this.desc = "D?clenche 3 fois les <em>Reconfigurations</em> de la Machine alli?e cibl?e.";
}

function Effect701() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute 1 Proie facile ? votre main.";
}

function Effect702() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            let shop = document.getElementById("shop");
            let options = [];
            for (let c of shop.children)
                if (c.card && c.card.species != "Sortil?ge")
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
    this.desc = "<em>Recrue :</em> <em>D?vore</em> une cr?ature disponible au recrutement al?atoire.";
}

function Effect703() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget(async (target) => {
                let c = findDOMCard(target);
                c.style.transition = ".5s";
                c.style.opacity = "0";
                await boostStats(sender, target.attack, target.hp, doAnimate);
                await boostStats(sender, 2, 2, doAnimate);
                c.parentElement.removeChild(c);
                updateTroops();
            }, {
                area: "board",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> <em>D?vore</em> une cr?ature alli?e cibl?e, puis gagne +2/+2.";
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
    this.desc = "Au d?but de chaque tour, <em>D?vore</em> la cr?ature alli?e la moins forte, puis gagne +3/+3. Gagne <em>Contact mortel</em> la 5<sup>?me</sup> fois.";
}

function Effect705() {
    this.run = async (sender, args, doAnimate) => {
        let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
        if (t.includes(args[0]) && args[0].species == "B?te") {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0], 1, 2, doAnimate, false, true);
        }
    };
    this.desc = "Lorsqu'une B?te alli?e est attaqu?e, lui conf?re d?finitivement +1/+2.";
}

function Effect706() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget(async (target) => {
                let shop = document.getElementById("shop");
                let options = [];
                for (let c of shop.children)
                    if (c.card && c.card.species != "Sortil?ge")
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
                species: "B?te",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> La B?te alli?e cibl?e <em>D?vore</em> une cr?ature disponible au recrutement al?atoire.";
}

function Effect707() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Ajoute une Proie facile ? votre main.";
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
            for (let d of document.getElementById("hand").children) {
                let target = d.card;
                if (target && target.name == "Proie facile") {
                    let c = findDOMCard(target);
                    c.style.transition = ".5s";
                    c.style.opacity = "0";
                    await boostStats(sender, target.attack, target.hp, doAnimate);
                    await boostStats(sender, 2, 1, doAnimate);
                    c.parentElement.removeChild(c);
                }
            }
        }
    };
    this.desc = "<em>Recrue :</em> <em>D?vore</em> toutes les Proies faciles en jeu et dans votre main, et gagne +2/+1 ? chaque fois.";
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
    this.desc = "<em>Derni?re volont? :</em> Gagne d?finitivement +7/+7.";
}

function Effect710() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);

            let beasts = [];
            for (let c of troops[0])
                if (c && c.species == "B?te")
                    beasts.push(c);
            shuffle(beasts);

            let shop = document.getElementById("shop");
            for (let target of beasts) {
                let options = [];
                for (let c of shop.children)
                    if (c.card && c.card.species != "Sortil?ge")
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
    this.desc = "A la fin de votre tour, les B?tes alli?es <em>D?vorent</em> une cr?ature al?atoire disponible au recrutement si possible, ou gagnent +2/+2 sinon.";
}

function Effect711() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species == "B?te" && args[0].card !== sender && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(args[0].card, 4, 3, doAnimate);
        }
    };
    this.desc = "Les B?tes que vous jouez gagnent +4/+3.";
}

function Effect712() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card.species != "Sortil?ge" && findDOMCard(sender) && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, 1, 1, doAnimate);
        }
    };
    this.desc = "Gagne +1/+1 lorsque vous revendez une cr?ature.";
}

function Effect713() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            for (let c of document.getElementById("hand").children)
                if (c.card.species == "B?te")
                    await boostStats(c.card, 0, 3, doAnimate);
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re +0/+3 aux B?tes dans votre main.";
}

function Effect714() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let n = 0;
            for (let c of t)
                if (c && c.hp > 0 && c.species == "B?te")
                    n++;
            if (doAnimate)
                await effectProcGlow(sender);
            await boostStats(sender, n, n, doAnimate);
        }
    };
    this.desc = "<em>Frappe pr?ventive :</em> Gagne +X/+X, o? X est le nombre de B?tes alli?es.";
}

function Effect715() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await boostStats(sender, sender.attack, 0, doAnimate);
        }
    };
    this.desc = "Lorsque cette cr?ature attaque, elle double son attaque.";
}

function Effect716() {
    this.run = async (sender, args, doAnimate) => {
        for (let i = 0; i < 4; i++) {
            if (troops[0][i])
                await boostStats(troops[0][i], 1, 0, doAnimate);
        }
        let card = new ProieFacile();
        card.created = true;
        await addToHand(drawCard(card, 176));
    };
    this.desc = "Conf?re +1/+0 aux cr?atures de la premi?re ligne, puis ajoute une Proie facile ? votre main.";
}

function Effect717() {
    this.run = async (sender, args, doAnimate) => {
        for (let c of document.getElementById("shop").children)
            if (c.card && c.card.species == "B?te")
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
    this.desc = "Conf?re +3/+3 aux B?tes disponibles au recrutement jusqu'? la fin du tour.";
}

function Effect718() {
    this.run = async (sender, args, doAnimate) => {
        for (let c of document.getElementById("shop").children)
            if (c.card && c.card.species == "B?te")
                await boostStats(c.card, 3, 3, doAnimate);
    };
    this.desc = "";
}

function Effect719() {
    this.run = async (sender, args, doAnimate) => {
        sender.effects.splice(sender.effects.findIndex(e => e.id == 718), 1);
        sender.effects.splice(sender.effects.findIndex(e => e.id == 719), 1);
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
    this.desc = "Lorsqu'une cr?ature alli?e meurt, gagne +1/+0.";
}

function Effect802() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0) {
            await boostStats(sender, 4, 0, doAnimate);
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Gagne +4/+0.";
}

function Effect803() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            let options = copy(cardList["Mort-Vivant"]);
            console.log(options)
            options.splice(options.findIndex(e => e == "liche-profanatrice"), 1);
            console.log(options)
            await battleSummon(choice(options), args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon(choice(options), args[1] ? args[2] : args[3], args[4], doAnimate, args);
            await battleSummon(choice(options), args[1] ? args[2] : args[3], args[4], doAnimate, args);
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque trois autres Morts-Vivants al?atoires.";
}

function Effect804() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (!t.includes(sender))
                await boostStats(sender, 2, 0, doAnimate);
        }
    };
    this.desc = "Lorsqu'une cr?ature ennemie meurt, gagne +2/+0.";
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
                    if (createEffect(e.id).desc.startsWith("<em>Derni?re volont?"))
                        t[i - 1].effects.push(copy(e));
            }
            if ((i % 4) < 3 && t[i + 1]) {
                if (doAnimate)
                    await effectProcGlow(sender);
                for (let e of copy(t[i + 1].effects))
                    if (createEffect(e.id).desc.startsWith("<em>Derni?re volont?"))
                        t[i + 1].effects.push(copy(e));
            }
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Double les <em>Derni?res volont?s</em> de ses voisins lat?raux.";
}

function Effect806() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            let t = args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            if (t.includes(sender))
                await boostStats(sender, 1, 1, doAnimate, false, true);
        }
    };
    this.desc = "Lorsqu'une cr?ature alli?e meurt, gagne d?finitivement +1/+1.";
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
    this.desc = "";
}

function Effect808() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.effect807) {
            if (sender.effect807.length > 0) {
                let c = sender.effect807[0];
                let name = Array.from(c.src.matchAll("^.*\/([^/]+)\.jpg$"), m => m[1])[0];
                console.log(name);
                await battleSummon(name, args[1] ? args[2] : args[3], args[4], doAnimate, args);
            }
            if (sender.effect807.length > 1) {
                let c = sender.effect807[1];
                let name = Array.from(c.src.matchAll("^.*\/([^/]+)\.jpg$"), m => m[1])[0];
                await battleSummon(name, args[1] ? args[2] : args[3], args[4], doAnimate, args);
            }
        }
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque des copies de base des deux premiers Morts-Vivants morts ce combat.";
}

function Effect809() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender && args[0].species == "Mort-Vivant") {
            let t = (args[1] ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]));
            let undead = t.filter(x => x && x.species == "Mort-Vivant");
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
    this.desc = "Lorsqu'un Mort-Vivant alli? meurt, conf?re d?finitivement +1/+1 ? trois Morts-Vivants alli?s al?atoires.";
}

function Effect810() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("squelette-reconstitue", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque un Squelette reconstitu?.";
}

function Effect811() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let n = Math.floor(args[1].attack / 2);
            if (n > 0) {
                boostStats(args[1], -n, 0, doAnimate);
                await boostStats(sender, n, 0, doAnimate);
            }
        }
    };
    this.desc = "Lorsque cette cr?ature est attaqu?e, elle divise par 2 l'attaque de la cr?ature assaillante et augmente son attaque d'autant.";
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
    this.desc = "Lorsque vous jouez une autre cr?ature avec <em>R?surrection</em>, conf?re +1/+2 ? vos autres Morts-Vivants.";
}

function Effect813() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("serviteur-exhume", args[1] ? args[2] : args[3], args[4], doAnimate, args);
    };
    this.desc = "<em>Derni?re volont? :</em> Invoque un Serviteur exhum?.";
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
    this.desc = "<em>Derni?re volont? :</em> Conf?re +1/+1 ? un autre Mort-Vivant alli?.";
}

function Effect815() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget((target) => {
                boostStats(target, 0, 4, doAnimate);
            }, {
                area: "board",
                species: "Mort-Vivant",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re +0/+4 ? un autre Mort-Vivant alli? cibl?.";
}

function Effect816() {
    this.run = async (sender, args, doAnimate) => {
        let c = args[0].card;
        let n = Math.min(2, c.hp - 1);
        boostStats(c, 0, -n, doAnimate);
        await boostStats(players[0], 0, n, doAnimate);
    };
    this.desc = "Vole jusqu'? 2 PV au Mort-Vivant alli? cibl?.";
}

function Effect817() {
    this.run = async (sender, args, doAnimate) => {
        let c = args[0].card;
        c.revive = true;
        boostStats(players[0], 0, -Math.min(6, players[0].hp - 1), doAnimate);
        await boostStats(c, 0, 0, doAnimate);
    };
    this.desc = "Perdez 6 PV pour donner <em>R?surrection</em> au Mort-Vivant alli? cibl?.";
}

function Effect1001() {
    this.run = async (sender, args, doAnimate) => { };
    this.desc = "<em>Injouable</em>.";
}

function Effect1002() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 2, 1, doAnimate);
    };
    this.desc = "Conf?re +2/+1 ? la cr?ature alli?e cibl?e.";
}

function Effect1003() {
    this.run = async (sender, args, doAnimate) => {
        let f = [];
        for (let c of troops[0])
            if (c && !f.includes(c.species) && c.species != "Autre")
                f.push(c.species);
        await boostStats(args[0].card, f.length, f.length, doAnimate);
    };
    this.desc = "Conf?re +X/+X ? la cr?ature alli?e cibl?e, o? X est le nombre de familles alli?es diff?rentes.";
}

function Effect2001() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            if (Math.random() < .5)
                await boostStats(sender, 1, 0, doAnimate, false, true);
            else
                await boostStats(sender, 0, 1, doAnimate, false, true);
        }
    };
    this.desc = "Lorsqu'une autre cr?ature meurt, gagne d?finitivement +1/+0 ou +0/+1.";
}

function Effect2002() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            sender.species = choice(copy(species).filter(x => x != sender.species));
            let n = 0;
            for (let c of troops[0])
                if (c && c.species == sender.species && c !== sender)
                    n++;
            if (n > 0)
                await boostStats(sender, n, n, doAnimate);
        }
    };
    this.desc = "Au d?but de votre tour, change de famille et gagne +X/+X, o? X est le nombre de cr?atures alli?es de cette famille.";
}

function Effect2003() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let f = [];
            for (let c of t)
                if (c && !f.includes(c.species) && c.species != "Autre")
                    f.push(c.species);
            if (f.length > 0) {
                if (doAnimate)
                    await effectProcGlow(sender);
                await boostStats(sender, f.length, f.length, doAnimate);
            }
        }
    };
    this.desc = "<em>Frappe pr?ventive :</em> Gagne +1/+1 pour chaque famille alli?e diff?rente.";
}

function Effect2004() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let sp = copy(species);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species == s));
                if (t)
                    await boostStats(t, 2, 2, doAnimate);
            }
        }
    };
    this.desc = "A la fin de chaque tour, conf?re +2/+2 ? une cr?ature alli?e de chaque famille.";
}

function Effect2005() {
    this.run = async (sender, args, doAnimate) => {
        if (findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            if (doAnimate)
                await effectProcGlow(sender);
            let card = args[0].card;
            let sp = copy(species);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species == s));
                if (t && s != card.species)
                    await boostStats(t, 2, 2, doAnimate);
            }
        }
    };
    this.desc = "Lorsque vous revendez une cr?ature, conf?re +2/+2 ? une cr?ature alli?e de chaque autre famille.";
}

function Effect2006() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            let sp = copy(species);
            shuffle(sp);
            for (let s of sp) {
                let t = choice(troops[0].filter(x => x && x.species == s));
                if (t)
                    await boostStats(t, 1, 1, doAnimate);
            }
        }
    };
    this.desc = "<em>Recrue :</em> Conf?re +1/+1 ? une cr?ature alli?e de chaque famille.";
}

function Effect2007() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.hp > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[0][0].concat(args[0][1]) : args[1][0].concat(args[1][1]);
            let f = [];
            for (let c of t)
                if (c && !f.includes(c.species) && c.species != "Autre")
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
    this.desc = "<em>Frappe pr?ventive :</em> Gagne +5/+7 pour chaque famille alli?e diff?rente, ainsi que <em>Bouclier</em> s'il y en a au moins 2 et <em>Contact mortel</em> s'il y en a au moins 4.";
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
        oldTransition = c.style.transition;
        oldFilter = c.style.filter;
        c.style.transition = ".2s";
        c.style.filter = "brightness(1.6)";
        await sleep(200);
    }

    if (currentScene == "shop" && effect606active()) {
        atk = Math.max(0, atk);
        hp = Math.max(0, hp);
    }

    if (card.effects.findIndex(e => e.id == 323) == -1)
        card.attack += atk;
    if (card.attack < 0)
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

async function dealDamage(card, damage, doAnimate, state) {
    let oldTransition;
    let oldFilter;
    let c;
    if (doAnimate) {
        c = findDOMCard(card);
        oldTransition = c.style.transition;
        oldFilter = c.style.filter;
        c.style.transition = ".2s";
        c.style.filter = "grayscale(100%) brightness(40%) sepia(100%) hue-rotate(-50deg) saturate(600%) contrast(0.8)";
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

function chooseTarget(callback, param, sender) {
    if (param.area == "board") {
        showDelay = 9999999;

        let filter = document.createElement('div');
        filter.className = "filter";
        filter.id = "filter";
        document.body.appendChild(filter);

        let board = document.getElementById("board");
        board.style.zIndex = "100";

        let casting = drawCard(sender, 240);
        casting.id = "casting";
        casting.className += " casting";
        document.body.appendChild(casting);

        let banner = document.createElement('div');
        banner.id = "target-banner";
        banner.className = "target-banner";
        banner.innerHTML = "Choisissez une cible";
        document.body.appendChild(banner);

        for (let d of board.children) {
            if (d.children[0]) {
                let c = d.children[0];
                c.draggable = false;
                if (isValidEffectTarget(c.card, param, sender)) {
                    c.onclick = () => {
                        callback(c.card);
                        closeEffectSelector();
                    };
                } else {
                    c.style.transform = "none";
                    c.style.cursor = "default";
                    c.style.boxShadow = "none";
                }
            }
        }

        filter.onclick = closeEffectSelector;
    }
}

function closeEffectSelector() {
    showDelay = 800;

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

    board.style.removeProperty("z-index");
    document.body.removeChild(document.getElementById("filter"));
    document.body.removeChild(document.getElementById("casting"));
    document.body.removeChild(document.getElementById("target-banner"));
}

function isValidEffectTarget(card, param, sender) {
    if (param.species && !param.species == card.species)
        return false;
    if (param.notself && card === sender)
        return false;
    return true;
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