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

async function buyCard(c) {
    await spendCoins(3, false);
    let shop = document.getElementById("shop");
    shop.removeChild(c);
    shop.style.setProperty("--shop-size", parseInt(shop.style.getPropertyValue("--shop-size")) - 1);
    addToHand(c);
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
        banner.innerHTML = "Recrutement amélioré";
        document.body.appendChild(banner);
        setTimeout(() => {
            document.body.removeChild(document.getElementById("shop-banner"));
        }, 3000);
    }
}

let animating = 0;

async function broadcastShopEvent(name, args) {
    animating++;
    document.getElementById("cover-filter").style.removeProperty("display");
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
    for (let e of c.effects) {
        if (e.trigger == name)
            await resolveEvent(e.id, c, args, doAnimate);
    }
}





let dragItem = undefined;

function dragStart() {
    dragItem = this;
    hideCardTooltip();
    setTimeout(() => {
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
    });

    if (this.card && this.card.species == "Sortilège" && this.card.validTarget.area == "any")
        document.getElementById("spell-area").style.pointerEvents = "all";
}

function dragEnd() {
    dragItem = undefined;
    setTimeout(() => {
        this.style.removeProperty("opacity");
        this.style.removeProperty("pointer-events");
    });

    document.getElementById("spell-area").style.removeProperty("pointer-events");
}

async function dragDrop() {
    let card = dragItem;
    dragItem = undefined;
    if (document.getElementById("hand").contains(card) && this.className == "spell-area" && card.card.species == "Sortilège" && card.card.validTarget.area == "any")
        playSpell(card, undefined);
    else if (document.getElementById("shop").contains(card) && this.className == "hand" && this.children[0].children.length < 6)
        buyCard(card);
    else if (!document.getElementById("shop").contains(card) && this.className == "shop")
        sellCard(card);
    else if (document.getElementById("hand").contains(card) && this.name == "position" && this.children.length == 0 && card.card.species != "Sortilège")
        placeCard(this, card);
    else if (card.classList.contains("small-card") && this.name == "position")
        moveCard(this, card);
    else if (document.getElementById("hand").contains(card) && this.name == "position" && this.children[0] && card.card.species == "Sortilège" && canPlaySpell(card.card, this.children[0].card, "board"))
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
    console.log(c)
    console.log(t)
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


        d1 = attacker.attack;
        d2 = attacked.attack;
        s1 = attacked.shield;
        s2 = attacker.shield;
        if (!s1)
            attacked.hp -= d1;
        else
            delete attacked.shield;
        if (!s2)
            attacker.hp -= d2;
        else
            delete attacker.shield;

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
    console.log("Broadcasting event " + name);
    let t = turn ? t1[0].concat(t1[1]) : t2[0].concat(t2[1]);
    let tt = turn ? t2[0].concat(t2[1]) : t1[0].concat(t1[1]);
    for (let i = 0; i < 8; i++) {
        if (t[i])
            await consumeEvent(t[i], name, args, doAnimate);
        if (tt[i])
            await consumeEvent(tt[i], name, args, doAnimate);
    }
    if (turn) {
        await consumeEvent(players[p1], name, args, doAnimate);
        await consumeEvent(players[p2], name, args, doAnimate);
    } else {
        await consumeEvent(players[p2], name, args, doAnimate);
        await consumeEvent(players[p1], name, args, doAnimate);
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

        await broadcastShopEvent("turn-start", []);
    }
}























/* ----------------------------------------------------- */
/* ------------------ Card management ------------------ */
/* ----------------------------------------------------- */

const speciesList = ["Dragon", "Gobelin", "Sorcier", "Soldat", "Bandit", "Machine", "Bête", "Mort-Vivant"];

const cardList = {
    "Commandant": ["commandant-de-la-legion", "roi-gobelin", "seigneur-liche", "tyran-draconique", "instructrice-de-l-academie", "l-ombre-etheree", "inventrice-prolifique", "zoomancienne-sylvestre", "monarque-inflexible", "diplomate-astucieux", "chef-du-clan-fracassecrane", "collectionneur-d-ames", "inventeur-fou"],
    "Sortilège": ["aiguisage", "tresor-du-dragon", "recit-des-legendes", "horde-infinie", "gobelin-bondissant", "invocation-mineure", "portail-d-invocation", "secrets-de-la-bibliotheque", "echo-arcanique", "javelot-de-feu"],
    "Dragon": ["dragonnet-ardent", "dragon-d-or", "dragon-d-argent", "oeuf-de-dragon", "dragon-cupide", "meneuse-de-progeniture", "dragon-enchante", "devoreur-insatiable", "gardien-du-tresor", "tyran-solitaire", "terrasseur-flammegueule", "dominante-guidaile", "protecteur-brillecaille", "dragon-foudroyant", "chasseur-ecailleux"],
    "Gobelin": ["eclaireur-gobelin", "duo-de-gobelins", "agitateur-gobelin", "batailleur-frenetique", "specialiste-en-explosions", "commandant-des-artilleurs", "artilleur-vicieux", "chef-de-guerre-gobelin", "artisan-forgemalice", "gobelin-approvisionneur", "chef-de-gang", "guide-gobelin", "mercenaires-gobelins", "champion-de-fracassecrane", "escouade-hargneuse"],
    "Sorcier": ["apprentie-magicienne", "mage-reflecteur", "canaliseuse-de-mana", "maitresse-des-illusions", "amasseur-de-puissance", "doyenne-des-oracles", "archimage-omnipotent", "precheur-de-l-equilibre", "arcaniste-astral", "creation-de-foudre", "pyromancienne-novice", "reservoir-de-puissance"],
    "Soldat": ["fantassin-en-armure", "capitaine-d-escouade"],
    "Bandit": ["archere-aux-traits-de-feu"],
    "Machine": ["planeur-de-fortune"],
    "Bête": ["predateur-en-chasse"],
    "Mort-Vivant": ["serviteur-exhume"],
    "Autre": []
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
    species = ["Sorcier"]; //!!!

    for (let s of species.concat(["Sortilège", "Autre"])) {
        for (let c of cardList[s])
            for (let i = 0; i < 15; i++) {
                let card = createCard(c);
                if (!card.requirement || species.includes(card.requirement))
                    cards.push(createCard(c));
            }
    }

    commanders = [];
    for (let c of cardList["Commandant"]) {
        let card = createCard(c);
        //if (!card.requirement || species.includes(card.requirement)) //!!!
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

        case "archere-aux-traits-de-feu":
            return new ArchereAuxTraitsDeFeu();

        case "planeur-de-fortune":
            return new PlaneurDeFortune();

        case "serviteur-exhume":
            return new ServiteurExhume();

        case "fantassin-en-armure":
            return new FantassinEnArmure();
        case "capitaine-d-escouade":
            return new CapitaineDEscouade();

        case "predateur-en-chasse":
            return new PredateurEnChasse();

        case "aiguisage":
            return new Aiguisage();

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
    this.hp = 30;
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


// Machines

function PlaneurDeFortune() {
    this.name = "Planeur de fortune";
    this.species = "Machine";
    this.attack = 2;
    this.hp = 3;
    this.src = "machines/planeur-de-fortune.jpg";
    this.tier = 1;
    this.effects = [

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
            id: 1002
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
            id: 1001
        }
    ];
    this.validTarget = {

    };
}

function ProieFacile() {
    this.name = "Proie facile";
    this.species = "Bête";
    this.attack = 0;
    this.hp = 1;
    this.src = "betes/proie-facile.jpg";
    this.tier = 7;
    this.effects = [

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
    if (containsKeyword(c, "Rage")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Rage :</em> Se produit lorsque la créature subit des dégâts.";
        tips.appendChild(shield);
    }
    if (containsKeyword(c, "Reconfiguration")) {
        let shield = document.createElement('div');
        shield.innerHTML = "<em>Reconfiguration :</em> Alterne entre plusieurs effets chaque tour.";
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

function getDescription(c) {
    let res = "";
    if (c.shield)
        res += "<em>Bouclier</em>.</br>";
    if (c.revive)
        res += "<em>Résurrection</em>.</br>";
    if (c.range)
        res += "<em>Portée</em>.</br>";
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
        case 601:
            return new Effect601();
        case 701:
            return new Effect701();
        case 1001:
            return new Effect1001();
        case 1002:
            return new Effect1002();
        case 2001:
            return new Effect2001();
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
    this.desc = "Gagnez 1 pièce d'or à chaque fois que vous achetez un Dragon.";
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
    this.desc = "Lorsqu'un Gobelin allié meurt, inflige 1 dégât à une créature adverse aléatoire.";
}

function Effect5() {
    this.run = async (sender, args, doAnimate) => {
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
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "Tous les 2 tours, ajoute un Sortilège aléatoire dans votre main.";
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
    this.desc = "Confère \"<em>Reconfiguration :</em> Gagne +1/+0 <em>ou</em> Gagne +0/+1.\" aux Machines alliées.";
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
    this.desc = "Lorsque vous revendez une créature, confère +1/+1 aux créatures alliées d'autres familles.";
}

function Effect10() {
    this.run = async (sender, args, doAnimate) => {
        if (lastResult > 1) {
            if (doAnimate)
                await effectProcGlow(sender);
            spendCoins(1 - lastResult);
        }
    };
    this.desc = "Gagnez 1 pièce d'or au début de votre tour si vous n'avez pas gagné le dernier combat.";
}

function Effect11() {
    this.run = async (sender, args, doAnimate) => { };
    this.desc = "Inflige 3 dégâts supplémentaires aux autres commandants.";
}

function Effect12() {
    this.run = async (sender, args, doAnimate) => {
        if (doAnimate)
            await effectProcGlow(sender);
        let card = new ScionAspirame();
        card.created = true;
        await addToHand(drawCard(card, 176));
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
    this.desc = "Lorsque vous recherchez des recrues, leur donne +1/+1 puis mélange leurs statistiques.";
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
    this.desc = "<em>Recrue :</em> Ajoute 1 Pièce d'or à votre main.";
}

function Effect102() {
    this.run = async (sender, args, doAnimate) => {
        if (coins > 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, Math.min(6, 2 * coins), Math.min(6, 2 * coins), doAnimate);
        }
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
    this.desc = "Après avoir joué 5 autres Dragons, se transforme en Dragon d'or.";
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
    this.desc = "Lorsque vous obtenez des pièces d'or, gagne +1/+1 jusqu'au prochain tour.";
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
    this.desc = "<em>Recrue :</em> Gagnez 1 pièce d'or pour chaque autre Dragon allié.";
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
    this.desc = "Lorsque vous gagnez des pièces d'or, confère +0/+1 à 3 Dragons alliés.";
}

function Effect110() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] < 0 && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 0, doAnimate);
        }
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
    this.desc = "Lorsque cette créature est attaquée, elle confère définitivement +2/+1 aux Dragons alliés.";
}

function Effect115() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender && sender.hp <= 0 && args[6] && args[4] == 0) {
            if (doAnimate)
                await effectProcGlow(sender);
            let t = args[2][0].concat(args[2][1]).includes(sender) ? args[2][0].concat(args[2][1]) : args[3][0].concat(args[3][1]);
            for (let c of t) {
                if (c && c.species == "Dragon" && c !== sender)
                    await boostStats(c, 0, 20, doAnimate);
            }
        }
    };
    this.desc = "<em>Dernière volonté :</em> Tous les dragons alliés gagnent +0/+20.";
}

function Effect116() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            if (doAnimate)
                await effectProcGlow(sender);
            await dealDamage(args[1], 3, doAnimate, [args[2], args[3], args[4], args[5], args[6]]);
        }
    };
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
    this.desc = "A la fin de votre tour, gagne +1/+0 pour chaque autre Dragon allié.";
}

function Effect118() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            await spendCoins(-2, false);
        }
    };
    this.desc = "Lorsque vous revendez cette carte, obtenez 2 pièces d'or supplémentaires.";
}

function Effect119() {
    this.run = async (sender, args, doAnimate) => {
        let n = lastResult == 1 ? 5 : 1;
        await boostStats(args[0].card, n, n, doAnimate);
    };
    this.desc = "Confère +1/+1 au Dragon allié ciblé, ou +5/+5 si vous avez gagné le dernier combat.";
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
    this.desc = "<em>Recrue :</em> Invoque un Guerrier gobelin.";
}

function Effect203() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender)
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate);
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
    this.desc = "<em>Recrue :</em> Vos autres Gobelins gagnent +0/+2.";
}

function Effect211() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card !== sender && containsKeyword(args[0].card, "Dernière volonté") && findDOMCard(sender).parentElement.parentElement.classList.contains("board")) {
            await boostStats(sender, 1, 2, doAnimate);
        }
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
    this.desc = "<em>Dernière volonté :</em> Confère définitivement +1/+1 à tous les autres Gobelins alliés.";
}

function Effect213() {
    this.run = async (sender, args, doAnimate) => {
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
    };
    this.desc = "<em>Frappe préventive :</em> Copie les effets de <em>Dernière volonté</em> de ses voisins latéraux.";
}

function Effect214() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] === sender) {
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate);
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate);
            await battleSummon("artificier-gobelin", args[1] ? args[2] : args[3], args[4], doAnimate);
        }
    };
    this.desc = "<em>Dernière volonté :</em> Invoque trois Artificiers gobelins.";
}

function Effect215() {
    this.run = async (sender, args, doAnimate) => {
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
                await battleSummon(name, args[1] ? args[2] : args[3], args[4], doAnimate);
            }
        }
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
    this.desc = "Confère \"<em>Dernière volonté :</em> Invoque un Artificier gobelin.\" au Gobelin allié ciblé.";
}

function Effect218() {
    this.run = async (sender, args, doAnimate) => {
        let card = getCard(shopTier, "Gobelin");
        card.created = true;
        card.range = true;
        addToHand(drawCard(card, 176));
        await boostStats(card, 0, 0, doAnimate);
    };
    this.desc = "Ajoute un Gobelin aléatoire à votre main et lui confère <em>Portée</em>.";
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
    this.desc = "<em>Recrue :</em> Ajoute une Connaissances arcaniques à votre main.";
}

function Effect302() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 1, 1, doAnimate);
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
    this.desc = "Le premier sort joué sur cette créature chaque tour prend effet deux fois.";
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
    this.desc = "A la fin de votre tour, invoque une créature de niveau supérieur ou égal à 3.";
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
    this.desc = "<em>Dernière volonté :</em> Ajoute un Catalyseur de puissance à votre main.";
}

function Effect309() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 2, 1, doAnimate);
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
    this.desc = "A la fin de votre tour, rejoue les 3 derniers Sortilèges joués ce tour-ci sur des cibles aléatoires.";
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
        while (card.species == "Sortilège" || card.tier != Math.min(6, shopTier + 1))
            card = getCard(Math.min(6, shopTier + 1));
        card.created = true;
        await summonCard(card);
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
            await addToHand(drawCard(card, 176));
        }
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
    this.desc = "Joue 5 Connaissances arcaniques sur des cibles aléatoires.";
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
    this.desc = "<em>Recrue :</em> Ajoute un Déphasage à votre main.";
}

function Effect319() {
    this.run = async (sender, args, doAnimate) => {
        args[0].card.shield = true;
        await boostStats(args[0].card, 0, 0, doAnimate);
    };
    this.desc = "Confère <em>Bouclier</em> au Sorcier allié ciblé.";
}

function Effect320() {
    this.run = async (sender, args, doAnimate) => {
        if (sender.effect320 && sender.effect320 > 0) {
            let t = args[0][0].concat(args[0][1]).includes(sender) ? args[1][0].concat(args[1][1]) : args[0][0].concat(args[0][1]);
            let target = pickRandomTarget(t);
            if (target) {
                if (doAnimate)
                    await effectProcGlow(sender);
                dealDamage(target, sender.effect320, doAnimate, args);
            }
        }
    };
    this.desc = "<em>Frappe préventive :</em> Inflige 1 dégât à une cible adverse aléatoire pour chaque Sortilège joué depuis que cette carte est en jeu.";
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
    this.desc = "Au début de votre tour, ajoute un Catalyseur de puissance à votre main, ou deux si vous avez perdu le dernier combat.";
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
    this.desc = "Confère <em>Portée</em> au Sorcier allié ciblé.";
}

function Effect401() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            chooseTarget((target) => {
                boostStats(target, 2, 2, doAnimate);
            }, {
                area: "board",
                species: "Soldat",
                notself: true
            }, sender);
        }
    };
    this.desc = "<em>Recrue :</em> Confère +2/+2 à un autre Soldat allié ciblé.";
}

function Effect601() {
    this.run = async (sender, args, doAnimate) => {
        if (!sender.effect601 || sender.effect601 == 0) {
            sender.effect601 = 1;
            sender.attack++;
        } else {
            sender.effect601 = 0;
            sender.hp++;
        }
        if (doAnimate)
            await boostStats(sender, 0, 0, doAnimate);
    };
    this.desc = "<em>Reconfiguration :</em> Gagne +1/+0 <em>ou</em> Gagne +0/+1.";
}

function Effect701() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0].card === sender) {
            if (doAnimate)
                effectProcGlow(sender);
            let card = new ProieFacile();
            card.created = true;
            await addToHand(drawCard(card, 176));
        }
    };
    this.desc = "<em>Recrue :</em> Ajoute 1 Proie facile à votre main.";
}

function Effect1001() {
    this.run = async (sender, args, doAnimate) => { };
    this.desc = "<em>Injouable</em>.";
}

function Effect1002() {
    this.run = async (sender, args, doAnimate) => {
        await boostStats(args[0].card, 2, 1, doAnimate);
    };
    this.desc = "Confère +2/+1 à la créature alliée ciblée.";
}

function Effect2001() {
    this.run = async (sender, args, doAnimate) => {
        if (args[0] !== sender) {
            if (doAnimate) {
                if (Math.random() < .5) {
                    await boostStats(sender, 1, 0, doAnimate);
                    let i = troops[0].findIndex(e => e && e.name == "Scion aspirâme");
                    troops[0][i].attack++;
                } else {
                    if (sender.hp > 0)
                        await boostStats(sender, 0, 1, doAnimate);
                    let i = troops[0].findIndex(e => e && e.name == "Scion aspirâme");
                    troops[0][i].hp++;
                }
            }
        }
    };
    this.desc = "Lorsqu'une autre créature meurt, gagne définitivement +1/+0 ou +0/+1.";
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

    if (card.effects.findIndex(e => e.id == 323) == -1)
        card.attack += atk;
    card.hp += hp;
    if (preserveHP && card.hp <= 0)
        card.hp = 1;
    if (permanent && card.original) {
        if (card.effects.findIndex(e => e.id == 323) == -1)
            card.original.attack += atk;
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
    else
        delete card.shield;

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
    if (!s)
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

async function battleSummon(name, t, p, doAnimate) {
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