import { useState } from 'react'

// Square component:
// Displays one square on the board.
function Square({ value, onSquareClick, isSelected }) {
  let className = 'square'
  if (isSelected) {
    className += ' selected-square'
  }

  return (
    <button className={className} onClick={onSquareClick}>
      {value}
    </button>
  )
}

// Returns true if the two indices are adjacent on a 3x3 board.
// Adjacency includes horizontal, vertical, and diagonal neighbors.
function isAdjacent(from, to) {
  const fromRow = Math.floor(from / 3)
  const fromCol = from % 3
  const toRow = Math.floor(to / 3)
  const toCol = to % 3

  const rowDiff = Math.abs(fromRow - toRow)
  const colDiff = Math.abs(fromCol - toCol)

  return rowDiff <= 1 && colDiff <= 1 && !(rowDiff === 0 && colDiff === 0)
}

// Counts how many pieces a given player currently has on the board.
function countPieces(squares, player) {
  let count = 0

  for (let i = 0; i < squares.length; i += 1) {
    if (squares[i] === player) {
      count += 1
    }
  }

  return count
}

// Checks whether the current player has a piece in the center.
function playerOwnsCenter(squares, player) {
  return squares[4] === player
}

// Handles the placement phase.
// This phase lasts until both players have placed all 3 pieces.
function handlePlacementClick(i, xIsNext, squares, setSquares, moveCount, setMoveCount) {
  if (squares[i] || calculateWinner(squares)) {
    return
  }

  const nextSquares = squares.slice()
  const currentPlayer = xIsNext ? 'X' : 'O'
  nextSquares[i] = currentPlayer

  setSquares(nextSquares)
  setMoveCount(moveCount + 1)
}

// Handles the movement phase.
// A move takes two clicks:
// 1. select one of your own pieces
// 2. click an adjacent empty destination
function handleMovementClick(
  i,
  xIsNext,
  squares,
  setSquares,
  moveCount,
  setMoveCount,
  selectedSquare,
  setSelectedSquare
) {
  if (calculateWinner(squares)) {
    return
  }

  const currentPlayer = xIsNext ? 'X' : 'O'

  // First click: no piece selected yet
  if (selectedSquare === null) {
    // Can only select one of your own pieces
    if (squares[i] === currentPlayer) {
      setSelectedSquare(i)
    }
    return
  }

  // If player clicks the same selected square again, unselect it
  if (selectedSquare === i) {
    setSelectedSquare(null)
    return
  }

  // If second click is another one of the player's own pieces,
  // switch selection to that new piece
  if (squares[i] === currentPlayer) {
    setSelectedSquare(i)
    return
  }

  // Destination must be empty
  if (squares[i] !== null) {
    setSelectedSquare(null)
    return
  }

  // Destination must be adjacent
  if (!isAdjacent(selectedSquare, i)) {
    setSelectedSquare(null)
    return
  }

  const nextSquares = squares.slice()

  // Try the move
  nextSquares[selectedSquare] = null
  nextSquares[i] = currentPlayer

  // Center rule:
  // If the player started the turn with a piece in the center,
  // and that player already has all 3 pieces on the board,
  // then the move must either:
  // 1. win immediately, or
  // 2. move the center piece out of the center
  const playerHasThreePieces = countPieces(squares, currentPlayer) === 3
  const startedWithCenter = playerOwnsCenter(squares, currentPlayer)
  const movedCenterPiece = selectedSquare === 4
  const winsNow = calculateWinner(nextSquares) === currentPlayer

  if (playerHasThreePieces && startedWithCenter && !movedCenterPiece && !winsNow) {
    setSelectedSquare(null)
    return
  }

  setSquares(nextSquares)
  setMoveCount(moveCount + 1)
  setSelectedSquare(null)
}

// Main board click handler.
// Decides whether the game is in placement phase or movement phase.
function handleBoardClick(
  i,
  xIsNext,
  squares,
  setSquares,
  moveCount,
  setMoveCount,
  selectedSquare,
  setSelectedSquare
) {
  const xCount = countPieces(squares, 'X')
  const oCount = countPieces(squares, 'O')

  // Placement phase: each player still has fewer than 3 pieces
  if (xCount < 3 || oCount < 3) {
    handlePlacementClick(i, xIsNext, squares, setSquares, moveCount, setMoveCount)
    return
  }

  // Movement phase
  handleMovementClick(
    i,
    xIsNext,
    squares,
    setSquares,
    moveCount,
    setMoveCount,
    selectedSquare,
    setSelectedSquare
  )
}

// Board component
function Board({
  xIsNext,
  squares,
  setSquares,
  moveCount,
  setMoveCount,
  selectedSquare,
  setSelectedSquare,
}) {
  const winner = calculateWinner(squares)
  const currentPlayer = xIsNext ? 'X' : 'O'
  const xCount = countPieces(squares, 'X')
  const oCount = countPieces(squares, 'O')

  let status

  if (winner) {
    status = 'Winner: ' + winner
  } else if (xCount < 3 || oCount < 3) {
    status = 'Placement phase - Next player: ' + currentPlayer
  } else if (selectedSquare === null) {
    status = 'Movement phase - Select a piece: ' + currentPlayer
  } else {
    status = 'Movement phase - Select destination for: ' + currentPlayer
  }

  return (
    <>
      <div className="status">{status}</div>

      <div className="board-row">
        <Square
          value={squares[0]}
          isSelected={selectedSquare === 0}
          onSquareClick={() =>
            handleBoardClick(
              0,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
        <Square
          value={squares[1]}
          isSelected={selectedSquare === 1}
          onSquareClick={() =>
            handleBoardClick(
              1,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
        <Square
          value={squares[2]}
          isSelected={selectedSquare === 2}
          onSquareClick={() =>
            handleBoardClick(
              2,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
      </div>

      <div className="board-row">
        <Square
          value={squares[3]}
          isSelected={selectedSquare === 3}
          onSquareClick={() =>
            handleBoardClick(
              3,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
        <Square
          value={squares[4]}
          isSelected={selectedSquare === 4}
          onSquareClick={() =>
            handleBoardClick(
              4,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
        <Square
          value={squares[5]}
          isSelected={selectedSquare === 5}
          onSquareClick={() =>
            handleBoardClick(
              5,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
      </div>

      <div className="board-row">
        <Square
          value={squares[6]}
          isSelected={selectedSquare === 6}
          onSquareClick={() =>
            handleBoardClick(
              6,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
        <Square
          value={squares[7]}
          isSelected={selectedSquare === 7}
          onSquareClick={() =>
            handleBoardClick(
              7,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
        <Square
          value={squares[8]}
          isSelected={selectedSquare === 8}
          onSquareClick={() =>
            handleBoardClick(
              8,
              xIsNext,
              squares,
              setSquares,
              moveCount,
              setMoveCount,
              selectedSquare,
              setSelectedSquare
            )
          }
        />
      </div>
    </>
  )
}

// Main app component
export default function App() {
  const [squares, setSquares] = useState(Array(9).fill(null))
  const [moveCount, setMoveCount] = useState(0)

  // Stores which piece is selected during movement phase.
  // null means no piece is currently selected.
  const [selectedSquare, setSelectedSquare] = useState(null)

  const xIsNext = moveCount % 2 === 0

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={squares}
          setSquares={setSquares}
          moveCount={moveCount}
          setMoveCount={setMoveCount}
          selectedSquare={selectedSquare}
          setSelectedSquare={setSelectedSquare}
        />
      </div>
    </div>
  )
}

// Checks for a winner
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]

  for (let i = 0; i < lines.length; i += 1) {
    const [a, b, c] = lines[i]

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]
    }
  }

  return null
}