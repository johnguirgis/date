(() => {
  const answer = 'LOVEU';
  const maxGuesses = 6;
  const puzzle = document.getElementById('nudle');
  const invite = document.getElementById('little-date');
  const board = document.getElementById('nudle-board');
  const keyboard = document.getElementById('nudle-keys');
  const status = document.getElementById('nudle-status');
  const prize = document.getElementById('nudle-prize');
  const retry = document.getElementById('nudle-retry');
  const keys = new Map();
  const rows = [];
  const scoreLabels = ['absent', 'wrong spot', 'correct spot'];
  let attempt = 0;
  let guess = '';
  let finished = false;

  for (let row = 0; row < maxGuesses; row++) {
    const line = document.createElement('div');
    line.className = 'nudle-row';
    line.setAttribute('role', 'group');
    line.setAttribute('aria-label', 'Guess ' + (row + 1));
    const tiles = [];
    for (let col = 0; col < answer.length; col++) {
      const tile = document.createElement('span');
      tile.className = 'nudle-tile';
      line.append(tile);
      tiles.push(tile);
    }
    board.append(line);
    rows.push(tiles);
  }

  for (const letters of [['QWERTYUIOP'], ['ASDFGHJKL'], ['Enter', 'ZXCVBNM', 'Backspace']]) {
    const line = document.createElement('div');
    line.className = 'nudle-key-row';
    for (const key of letters.flatMap(part => part.length > 1 && /^[A-Z]+$/.test(part) ? [...part] : [part])) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.key = key;
      button.textContent = key === 'Backspace' ? '⌫' : key;
      button.setAttribute('aria-label', key);
      button.addEventListener('click', () => handleKey(key));
      line.append(button);
      keys.set(key, button);
    }
    keyboard.append(line);
  }

  function scoreGuess() {
    const remaining = [...answer];
    const scores = [...guess].map((letter, index) => {
      if (letter !== answer[index]) return 0;
      remaining[index] = null;
      return 2;
    });
    return scores.map((score, index) => {
      if (score === 2) return score;
      const match = remaining.indexOf(guess[index]);
      if (match === -1) return 0;
      remaining[match] = null;
      return 1;
    });
  }

  function handleKey(key) {
    if (finished) return;
    if (key === 'Enter') {
      if (guess.length < answer.length) {
        status.textContent = 'Enter five letters first.';
        return;
      }
      const scores = scoreGuess();
      const feedback = scores.map((score, index) => {
        const letter = guess[index];
        rows[attempt][index].dataset.score = score;
        const button = keys.get(letter);
        if (score > Number(button.dataset.score ?? -1)) {
          button.dataset.score = score;
          button.setAttribute('aria-label', letter + ', ' + scoreLabels[score]);
        }
        return letter + ' ' + scoreLabels[score];
      });
      rows[attempt][0].parentElement.setAttribute('aria-label', feedback.join(', '));
      if (guess === answer) {
        finished = true;
        keyboard.hidden = true;
        prize.hidden = false;
        status.textContent = 'Solved.';
        prize.focus();
        return;
      }
      attempt++;
      guess = '';
      finished = attempt === maxGuesses;
      retry.hidden = !finished;
      status.textContent = finished ? 'Out of guesses.' : feedback.join(', ') + '.';
      return;
    }
    guess = key === 'Backspace' ? guess.slice(0, -1) : (guess + key).slice(0, answer.length);
    rows[attempt].forEach((tile, index) => { tile.textContent = guess[index] || ''; });
  }

  prize.addEventListener('click', () => {
    puzzle.hidden = true;
    invite.hidden = false;
    const model = invite.querySelector('model-viewer');
    model.setAttribute('src', model.dataset.src);
    invite.querySelector('h1').focus();
  });

  retry.addEventListener('click', () => {
    attempt = 0;
    guess = '';
    finished = false;
    for (const row of rows) {
      row[0].parentElement.setAttribute('aria-label', 'Guess ' + (rows.indexOf(row) + 1));
      for (const tile of row) {
        tile.textContent = '';
        delete tile.dataset.score;
      }
    }
    for (const [key, button] of keys) {
      delete button.dataset.score;
      button.setAttribute('aria-label', key);
    }
    retry.hidden = true;
    status.textContent = '';
    keys.get('Q').focus();
  });

  document.addEventListener('keydown', event => {
    if (finished || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) return;
    if (event.key === 'Enter' && event.target.closest('button')) return;
    if (event.key !== 'Enter' && event.key !== 'Backspace' && !/^[a-z]$/i.test(event.key)) return;
    event.preventDefault();
    handleKey(event.key.length === 1 ? event.key.toUpperCase() : event.key);
  });
})();
