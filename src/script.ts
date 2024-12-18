const { useState, useEffect, useRef } = React;
const { createRoot } = ReactDOM;

// ADD ANIMATIONS
// ADAPT RULES TO REAL Blackjack

type CardType = {
  id: string;
  card: string;
  color: string;
}

const ACE = ['A'];
const NUMS = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
const FIGS = ['J', 'Q', 'K'];
const CARDS = [...ACE, ...NUMS, ...FIGS];
const COLORS = ['♠', '♥', '♣', '♦'];

const DECK: CardType[] = CARDS.map(card => {
  return COLORS.map(color => ({
    id: `${card}${color}`,
    card: card,
    color: color,
  }));
}).flat();

const checkDuplicate = (index: number, cards: CardType[]): boolean => {
  return cards.includes(DECK[index]);
};

const getSumsk = (cards: CardType[], isHigh: boolean): number => {
  return cards?.reduce((acc, cur) => {
    if (NUMS.includes(cur.card)) return acc + Number(cur.card);
    if (ACE.includes(cur.card)) return acc + (isHigh ? 11 : 1);
    if (FIGS.includes(cur.card)) return acc + 10;
  }, 0);
};

const getSum = (cards: CardType[]): number => {
  const high = getSumsk(cards, true);
  const low = getSumsk(cards, false);
  return high > 21 ? low : high;
};

const delay = (fn: () => void, ms: number) => {
  setTimeout(() => { fn() }, ms);
};

const Scores = ({ tryAgain, turn, money }: { tryAgain: () => void; turn: number; money: number }) => {
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
  }
  
  return (
    <div className="table light">
      <h2>Scores</h2>
      {turn > 0 ? <button onClick={saveScore}>Stop & save score</button> : null}
      {scores?.length ? (
        <ul>
          {scores.map((score, index) => (
            <li key={index}>{score}</li>
          ))}
        </ul>
      ) : <p>No scores yet.</p>}
    </div>
  )
}

const Start = ({ status, handleStart, money, tryAgain, bet, setBet }: { status: string; handleStart: () => void; money: number; tryAgain: () => void; bet: number; setBet: (bet: number) => void }) => {
  const titles = {
    start: 'Try and defeat the bank!',
    win: 'You win! Congratulations!',
    lose: 'You lose! Give me the money!',
  };

  return (
    <div className='table light'>
      <h2>{titles[status]}</h2>
      {money ? (<div className="btns">
        <select value={bet} onChange={(e)=> setBet(e.target.value)}>
          {Array.from({ length: money / 10 }, (_, i) => (i + 1) * 10).map((x) => (
            <option key={x} value={x}>
              {x}
            </option>
          ))}
        </select>
        <button onClick={handleStart}>
          {status === 'start' ? 'Bet' : 'Bet again'}
        </button>
      </div>) :
      <button onClick={tryAgain}>Try again</button>}
    </div>
  );
};

const Bank = ({ cards }: { cards: CardType[] }) => {
  return (
    <div className='table dark'>
      <h2>Bank {getSum(cards)}</h2>

      <div className='cards'>
        {cards.map((c) => (
          <div key={c.id} className='card'>{c.id}</div>
        ))}
      </div>
    </div>
  );
};

const Player = ({ cards }: { cards: CardType[] }) => {
  return (
    <div className='table light'>
      <h2>Player {getSum(cards)}</h2>

      <div className='cards'>
        {cards.map((c) => (
          <div key={c.id} className='card'>{c.id}</div>
        ))}
      </div>
    </div>
  );
};

const App = () => {
  const [status, setStatus] = useState('start');
  const [finish, setFinish] = useState(false);
  const [bankCards, setBankCards] = useState<CardType[]>([]);
  const [playerCards, setPlayerCards] = useState<CardType[]>([]);
  const [money, setMoney] = useState(100);
  const [bet, setBet] = useState(10);
  const [turn, setTurn] = useState(0);

  const pSum = getSum(playerCards);
  const bSum = getSum(bankCards);

  const maxDeal = pSum === 21;
  const gameOver = pSum > 21;

  const getCard = (): CardType => {
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
  }

  const winOrLose = (isWin: boolean) => {
    setBet(10);
    delay(() => setStatus(isWin ? 'win' : 'lose'), 1000);
  };

  useEffect(() => {
    if (finish) {
      if (bSum < pSum) {
        delay(() => setBankCards(c => [...c, getCard()]), 500);
      } else if (bSum <= 21) {
        winOrLose(false);
      } else {
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

  return (
    <>
      <h1>Black Jack <small>({money}$)</small></h1>

      <main>
        {!!status ? (
          <>
            <Start status={status} handleStart={handleStart} tryAgain={tryAgain} money={money} bet={bet} setBet={setBet} />
            <Scores tryAgain={tryAgain} turn={turn} money={money} />
          </>
        ) : (
          <>
            <Bank cards={bankCards} />
            <Player cards={playerCards} />
            {!finish && !gameOver ? (
              <div className='btns'>
                {!maxDeal ? <button onClick={handleDeal}>Deal</button> : null}
                <button onClick={handleFinish}>Finish</button>
                {/*<button onClick={() => setStatus("start")}>Cancel</button>*/}
              </div>
            ) : null}
          </>
        )}
        <p>Turn: {turn}</p>
      </main>

      <footer>
        <p>Created by <a href='https://remybeumier.be' target='_blank'>Rémy Beumier</a></p>
      </footer>
    </>
  );
};

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App />);
