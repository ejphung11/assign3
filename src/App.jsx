import { useState } from 'react';

// Square component:
// Renders a single button on the board.
// value shows X, O, or nothing.
// onSquareClick runs when the square is clicked.
// isSelected is used during the movement phase to highlight the chosen piece.
function Square({ value, onSquareClick, isSelected }) {
  let className = 'square';

  // Add an extra CSS class if this square is currently selected.
  if (isSelected) {
    className += ' selected-square';
  }

  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  );
}

// isAdjacent:
// Checks whether two board positions are next to each other
// on the 3x3 board.
// Adjacency includes horizontal, vertical, and diagonal neighbors.
function isAdjacent(from, to) {
  // Convert 1D array indices into row/column positions.
  const fromRow = Math.floor(from / 3);
  const fromCol = from % 3;
  const toRow = Math.floor(to / 3);
  const toCol = to % 3;

  // Measure row and column distance between the two squares.
  const rowDiff = Math.abs(fromRow - toRow);
  const colDiff = Math.abs(fromCol - toCol);

  // Adjacent means the row and column changes are each at most 1,
  // and the squares are not the same square.
  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0);
}

// countPieces:
// Counts how many pieces of a given player are currently on the board.
function countPieces(squares, player) {
  let count = 0;

  for (let i = 0; i < squares.length; i += 1) {
    if (squares[i] === player) {
      count += 1;
    }
  }

  return count;
}

// playerOwnsCenter:
// Checks whether the given player currently occupies the center square.
// The center square is index 4.
function playerOwnsCenter(squares, player) {
  return squares[4] === player;
}

// Board component:
// Displays the board and handles both phases of Chorus Lapilli.
// Phase 1: placement phase
// Phase 2: movement phase
function Board({
  xIsNext,
  squares,
  onPlay,
  selectedSquare,
  setSelectedSquare,
}) {
  // Check whether someone has already won.
  const winner = calculateWinner(squares);

  // Determine whose turn it is.
  const currentPlayer = xIsNext ? 'X' : 'O';

  // Count how many pieces each player has on the board.
  const xCount = countPieces(squares, 'X');
  const oCount = countPieces(squares, 'O');

  // The game is still in placement phase until both players
  // have placed all 3 of their pieces.
  const inPlacementPhase = xCount < 3 || oCount < 3;

  // Handles a click on one square.
  function handleClick(i) {
    // Do not allow any moves after a winner exists.
    if (winner) {
      return;
    }

    // -------------------------
    // Placement phase behavior
    // -------------------------
    if (inPlacementPhase) {
      // During placement phase, players may only place pieces
      // on empty squares.
      if (squares[i]) {
        return;
      }

      // Copy the board so React state is not modified directly.
      const nextSquares = squares.slice();

      // Place the current player's piece.
      nextSquares[i] = currentPlayer;

      // Send the updated board to the parent component.
      onPlay(nextSquares);
      return;
    }

    // -------------------------
    // Movement phase behavior
    // -------------------------

    // First click: choose one of your own pieces.
    if (selectedSquare === null) {
      if (squares[i] === currentPlayer) {
        setSelectedSquare(i);
      }
      return;
    }

    // If the same selected piece is clicked again,
    // unselect it.
    if (selectedSquare === i) {
      setSelectedSquare(null);
      return;
    }

    // If the player clicks another one of their own pieces,
    // switch the selection to that new piece.
    if (squares[i] === currentPlayer) {
      setSelectedSquare(i);
      return;
    }

    // The destination square must be empty.
    // If not, reject the move and reset selection.
    if (squares[i] !== null) {
      setSelectedSquare(null);
      return;
    }

    // The destination square must be adjacent.
    // If not, reject the move and reset selection.
    if (!isAdjacent(selectedSquare, i)) {
      setSelectedSquare(null);
      return;
    }

    // Try making the move on a copied board.
    const nextSquares = squares.slice();
    nextSquares[selectedSquare] = null;
    nextSquares[i] = currentPlayer;

    // Center rule:
    // If the player starts the turn with a piece in the center
    // and already has all 3 pieces on the board,
    // then the move must either:
    // 1. move the center piece, or
    // 2. win immediately
    const playerHasThreePieces = countPieces(squares, currentPlayer) === 3;
    const startedWithCenter = playerOwnsCenter(squares, currentPlayer);
    const movedCenterPiece = selectedSquare === 4;
    const winsNow = calculateWinner(nextSquares) === currentPlayer;

    // Reject the move if the center rule is violated.
    if (
      playerHasThreePieces &&
      startedWithCenter &&
      !movedCenterPiece &&
      !winsNow
    ) {
      setSelectedSquare(null);
      return;
    }

    // If the move passes all checks, finalize it.
    setSelectedSquare(null);
    onPlay(nextSquares);
  }

  // Build the status message shown above the board.
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (inPlacementPhase) {
    status = 'Placement phase - Next player: ' + currentPlayer;
  } else if (selectedSquare === null) {
    status = 'Movement phase - Select a piece: ' + currentPlayer;
  } else {
    status = 'Movement phase - Select destination for: ' + currentPlayer;
  }

  return (
    <>
      <div className="status">{status}</div>

      <div className="board-row">
        <Square
          value={squares[0]}
          isSelected={selectedSquare === 0}
          onSquareClick={() => handleClick(0)}
        />
        <Square
          value={squares[1]}
          isSelected={selectedSquare === 1}
          onSquareClick={() => handleClick(1)}
        />
        <Square
          value={squares[2]}
          isSelected={selectedSquare === 2}
          onSquareClick={() => handleClick(2)}
        />
      </div>

      <div className="board-row">
        <Square
          value={squares[3]}
          isSelected={selectedSquare === 3}
          onSquareClick={() => handleClick(3)}
        />
        <Square
          value={squares[4]}
          isSelected={selectedSquare === 4}
          onSquareClick={() => handleClick(4)}
        />
        <Square
          value={squares[5]}
          isSelected={selectedSquare === 5}
          onSquareClick={() => handleClick(5)}
        />
      </div>

      <div className="board-row">
        <Square
          value={squares[6]}
          isSelected={selectedSquare === 6}
          onSquareClick={() => handleClick(6)}
        />
        <Square
          value={squares[7]}
          isSelected={selectedSquare === 7}
          onSquareClick={() => handleClick(7)}
        />
        <Square
          value={squares[8]}
          isSelected={selectedSquare === 8}
          onSquareClick={() => handleClick(8)}
        />
      </div>
    </>
  );
}

// Main game component:
// Stores game history, current move, and current selected piece.
export default function Game() {
  // history stores every board state so the move history
  // buttons still work.
  const [history, setHistory] = useState([Array(9).fill(null)]);

  // currentMove stores which step of the game is currently shown.
  const [currentMove, setCurrentMove] = useState(0);

  // selectedSquare stores which piece is currently selected
  // during the movement phase.
  const [selectedSquare, setSelectedSquare] = useState(null);

  // X goes first, so even-numbered moves are X's turn.
  const xIsNext = currentMove % 2 === 0;

  // Get the board state for the current move.
  const currentSquares = history[currentMove];

  // handlePlay:
  // Saves a new board state into history.
  function handlePlay(nextSquares) {
    // If the user went backward in history and then made a move,
    // remove all future history after the current step.
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];

    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);

    // Clear any selected piece after the move finishes.
    setSelectedSquare(null);
  }

  // jumpTo:
  // Lets the user go back to an older board state.
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);

    // Also clear selection when moving through history.
    setSelectedSquare(null);
  }

  // Create the move-history buttons.
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }

    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          selectedSquare={selectedSquare}
          setSelectedSquare={setSelectedSquare}
        />
      </div>

      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// calculateWinner:
// Checks whether X or O has formed a winning line.
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal from top-left to bottom-right
    [2, 4, 6], // diagonal from top-right to bottom-left
  ];

  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i];

    // A winner exists if all 3 squares are non-empty
    // and all hold the same player's symbol.
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}