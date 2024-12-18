"use strict";
const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;
const ACE = ['A'];
const NUMS = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
const FIGS = ['J', 'Q', 'K'];
const CARDS = [...ACE, ...NUMS, ...FIGS];
const COLORS = ['♠', '♥', '♣', '♦'];
const DECK = CARDS.map(card => {
    return COLORS.map(color => ({
        id: `${card}${color}`,
        card: card,
        color: color,
    }));
}).flat();
const checkDuplicate = (index, cards) => {
    return cards.includes(DECK[index]);
};
const getSumsk = (cards, isHigh) => {
    return cards === null || cards === void 0 ? void 0 : cards.reduce((acc, cur) => {
        if (NUMS.includes(cur.card))
            return acc + Number(cur.card);
        if (ACE.includes(cur.card))
            return acc + (isHigh ? 11 : 1);
        if (FIGS.includes(cur.card))
            return acc + 10;
    }, 0);
};
const getSum = (cards) => {
    const high = getSumsk(cards, true);
    const low = getSumsk(cards, false);
    return high > 21 ? low : high;
};
const delay = (fn, ms) => {
    setTimeout(() => { fn(); }, ms);
};
const Scores = ({ tryAgain, turn, money }) => {
    const [scores, setScores] = useState([]);
    useEffect(() => {
        const storedScores = localStorage.getItem('scores');
        if (storedScores) {
            setScores(JSON.parse(storedScores));
        }
    }, []);
    const saveScore = () => {
        const updatedScores = [...scores, money];
        setScores(updatedScores);
        localStorage.setItem('scores', JSON.stringify(updatedScores));
        tryAgain();
    };
    return (React.createElement("div", { className: "table light" },
        React.createElement("h2", null, "Scores"),
        turn > 0 ? React.createElement("button", { onClick: saveScore }, "Stop & save score") : null,
        (scores === null || scores === void 0 ? void 0 : scores.length) ? (React.createElement("ul", null, scores.map((score, index) => (React.createElement("li", { key: index }, score))))) : React.createElement("p", null, "No scores yet.")));
};
const Start = ({ status, handleStart, money, tryAgain, bet, setBet }) => {
    const titles = {
        start: 'Try and defeat the bank!',
        win: 'You win! Congratulations!',
        lose: 'You lose! Give me the money!',
    };
    return (React.createElement("div", { className: 'table light' },
        React.createElement("h2", null, titles[status]),
        money ? (React.createElement("div", { className: "btns" },
            React.createElement("select", { value: bet, onChange: (e) => setBet(e.target.value) }, Array.from({ length: money / 10 }, (_, i) => (i + 1) * 10).map((x) => (React.createElement("option", { key: x, value: x }, x)))),
            React.createElement("button", { onClick: handleStart }, status === 'start' ? 'Bet' : 'Bet again'))) :
            React.createElement("button", { onClick: tryAgain }, "Try again")));
};
const Bank = ({ cards }) => {
    return (React.createElement("div", { className: 'table dark' },
        React.createElement("h2", null,
            "Bank ",
            getSum(cards)),
        React.createElement("div", { className: 'cards' }, cards.map((c) => (React.createElement("div", { key: c.id, className: 'card' }, c.id))))));
};
const Player = ({ cards }) => {
    return (React.createElement("div", { className: 'table light' },
        React.createElement("h2", null,
            "Player ",
            getSum(cards)),
        React.createElement("div", { className: 'cards' }, cards.map((c) => (React.createElement("div", { key: c.id, className: 'card' }, c.id))))));
};
const App = () => {
    const [status, setStatus] = useState('start');
    const [finish, setFinish] = useState(false);
    const [bankCards, setBankCards] = useState([]);
    const [playerCards, setPlayerCards] = useState([]);
    const [money, setMoney] = useState(100);
    const [bet, setBet] = useState(10);
    const [turn, setTurn] = useState(0);
    const pSum = getSum(playerCards);
    const bSum = getSum(bankCards);
    const maxDeal = pSum === 21;
    const gameOver = pSum > 21;
    const getCard = () => {
        let randomIndex = Math.floor(Math.random() * DECK.length);
        while (checkDuplicate(randomIndex, [...playerCards, ...bankCards])) {
            randomIndex = Math.floor(Math.random() * DECK.length);
        }
        return DECK[randomIndex];
    };
    const handleStart = () => {
        setStatus('');
        setFinish(false);
        setTurn(c => c + 1);
        setMoney(c => c - bet);
        // delay(() => setBankCards([getCard()]), 500);
        setBankCards([getCard()]);
        setPlayerCards([getCard()]);
        delay(() => setPlayerCards(c => [...c, getCard()]), 500);
        // setPlayerCards([getCard(), getCard()]);
    };
    const handleFinish = () => {
        setFinish(true);
        setBankCards(c => [...c, getCard()]);
    };
    const handleDeal = () => {
        setPlayerCards(c => [...c, getCard()]);
    };
    const tryAgain = () => {
        setMoney(100);
        setTurn(0);
        setStatus("start");
    };
    const winOrLose = (isWin) => {
        setBet(10);
        delay(() => setStatus(isWin ? 'win' : 'lose'), 1000);
    };
    useEffect(() => {
        if (finish) {
            if (bSum < pSum) {
                delay(() => setBankCards(c => [...c, getCard()]), 500);
            }
            else if (bSum <= 21) {
                winOrLose(false);
            }
            else {
                setMoney(c => c + bet * 2);
                winOrLose(true);
            }
        }
    }, [bankCards]);
    useEffect(() => {
        if (gameOver) {
            winOrLose(false);
        }
    }, [playerCards]);
    return (React.createElement(React.Fragment, null,
        React.createElement("h1", null,
            "Black Jack ",
            React.createElement("small", null,
                "(",
                money,
                "$)")),
        React.createElement("main", null,
            !!status ? (React.createElement(React.Fragment, null,
                React.createElement(Start, { status: status, handleStart: handleStart, tryAgain: tryAgain, money: money, bet: bet, setBet: setBet }),
                React.createElement(Scores, { tryAgain: tryAgain, turn: turn, money: money }))) : (React.createElement(React.Fragment, null,
                React.createElement(Bank, { cards: bankCards }),
                React.createElement(Player, { cards: playerCards }),
                !finish && !gameOver ? (React.createElement("div", { className: 'btns' },
                    !maxDeal ? React.createElement("button", { onClick: handleDeal }, "Deal") : null,
                    React.createElement("button", { onClick: handleFinish }, "Finish"))) : null)),
            React.createElement("p", null,
                "Turn: ",
                turn)),
        React.createElement("footer", null,
            React.createElement("p", null,
                "Created by ",
                React.createElement("a", { href: 'https://remybeumier.be', target: '_blank' }, "R\u00E9my Beumier")))));
};
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(React.createElement(App, null));