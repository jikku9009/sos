// SOS Game Logic

const GRID_SIZE = 5;

let board = [];
let scores = [0, 0]; // [Player1, Player2]
let currentPlayer = 0; // 0: Player 1, 1: Player 2
let isGameOver = false;

const boardDiv = document.getElementById('board');
const turnIndicator = document.getElementById('turn-indicator');
const scoreDiv = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');

function initBoard() {
    board = [];
    for (let r = 0; r < GRID_SIZE; r++) {
        board.push(Array(GRID_SIZE).fill(null));
    }
    scores = [0, 0];
    currentPlayer = 0;
    isGameOver = false;
    renderBoard();
    updateUI();
}

function renderBoard() {
    boardDiv.innerHTML = '';
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell' + (board[r][c] ? ' filled' : '');
            cell.dataset.row = r;
            cell.dataset.col = c;
            if (board[r][c]) cell.textContent = board[r][c].letter;
            cell.addEventListener('click', onCellClick);
            boardDiv.appendChild(cell);
        }
    }
}

function updateUI() {
    turnIndicator.textContent = isGameOver
        ? `Game Over`
        : `Turn: Player ${currentPlayer + 1} (${currentPlayer === 0 ? '🔵' : '🟠'})`;
    scoreDiv.textContent = `Score: 🔵 ${scores[0]} - ${scores[1]} 🟠`;
}

function onCellClick(e) {
    if (isGameOver) return;
    const row = +e.currentTarget.dataset.row;
    const col = +e.currentTarget.dataset.col;
    if (board[row][col]) return;

    // Prompt for S or O
    let letter = prompt('Enter S or O:', 'S');
    if (!letter) return;
    letter = letter.trim().toUpperCase();
    if (letter !== 'S' && letter !== 'O') {
        alert('Only S or O allowed.');
        return;
    }

    board[row][col] = { letter, player: currentPlayer };
    renderBoard();

    // Check for any new SOS formed
    const sosCells = checkSOS(row, col, letter);
    if (sosCells.length > 0) {
        scores[currentPlayer] += sosCells.length;
        highlightSOS(sosCells);
    }

    // Check for game over
    if (isBoardFull()) {
        isGameOver = true;
        setTimeout(() => {
            declareWinner();
        }, 500);
    } else {
        // If no SOS made, switch player
        if (sosCells.length === 0) {
            currentPlayer = 1 - currentPlayer;
        }
    }

    updateUI();
}

function checkSOS(row, col, letter) {
    // Return list of [cells involved in all new SOS]
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    let result = [];
    for (let [dr, dc] of directions) {
        // Check in both directions
        for (let flip of [-1, 1]) {
            let cells = [];
            if (letter === 'O') {
                // Look for pattern S O S, O in center
                let r1 = row + dr * flip, c1 = col + dc * flip;
                let r2 = row - dr * flip, c2 = col - dc * flip;
                if (
                    inBounds(r1, c1) && inBounds(r2, c2) &&
                    board[r1][c1] && board[r2][c2] &&
                    board[r1][c1].letter === 'S' &&
                    board[r2][c2].letter === 'S'
                ) {
                    cells.push([r1, c1], [row, col], [r2, c2]);
                }
            } else if (letter === 'S') {
                // Check S O S patterns where S is at one end
                // S O S: this S at left/top
                let r1 = row + dr * flip, c1 = col + dc * flip;
                let r2 = row + dr * flip * 2, c2 = col + dc * flip * 2;
                if (
                    inBounds(r1, c1) && inBounds(r2, c2) &&
                    board[r1][c1] && board[r2][c2] &&
                    board[r1][c1].letter === 'O' &&
                    board[r2][c2].letter === 'S'
                ) {
                    cells.push([row, col], [r1, c1], [r2, c2]);
                }
            }
            if (cells.length === 3) {
                result.push(cells);
            }
        }
    }
    // Flatten and filter duplicates
    let allCells = [];
    result.forEach(group => {
        group.forEach(cell => {
            let found = allCells.some(
                ([r, c]) => r === cell[0] && c === cell[1]
            );
            if (!found) allCells.push(cell);
        });
    });
    return allCells;
}

function highlightSOS(cells) {
    for (let [r, c] of cells) {
        const idx = r * GRID_SIZE + c;
        const cellDiv = boardDiv.children[idx];
        cellDiv.classList.add('sos');
        // Remove highlight after a short delay
        setTimeout(() => cellDiv.classList.remove('sos'), 1100);
    }
}

function inBounds(r, c) {
    return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
}

function isBoardFull() {
    return board.every(row => row.every(cell => cell));
}

function declareWinner() {
    let msg;
    if (scores[0] > scores[1]) {
        msg = "🔵 Player 1 Wins!";
    } else if (scores[0] < scores[1]) {
        msg = "🟠 Player 2 Wins!";
    } else {
        msg = "🤝 It's a Draw!";
    }
    setTimeout(() => alert(msg), 300);
}

resetBtn.addEventListener('click', () => {
    initBoard();
});

initBoard();