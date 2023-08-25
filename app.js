// TODO, PROMOTIONS

let gameboard = document.querySelector("#gameboard");
const playerDisplay = document.querySelector("#playerInfo");
const infoDisplay = document.querySelector("#infoDisplay");
const WIDTH = 8;
let currPlayer = 'white';

let validWhiteMoves = 20;
let validBlackMoves = 20;

let fromTile;
let toTile;

playerDisplay.textContent = currPlayer;

let board = [];

const resetGameboard = () => {gameboard.replaceChildren()};
const changePlayer = () => {playerDisplay.textContent = currPlayer = currPlayer === 'white' ? "black" : "white";};
const displayInfo = (str) => {infoDisplay.textContent = str; setTimeout(() => {}, 3000); infoDisplay.textContent = '';};

function createBoard() {

    board = [
        new Piece('rook', 1), new Piece('knight', 1), new Piece('bishop', 1), new Piece('queen', 1), new Piece('king', 1), new Piece('bishop', 1), new Piece('knight', 1), new Piece('rook', 1),
        new Piece('pawn', 1), new Piece('pawn', 1), new Piece('pawn', 1), new Piece('pawn', 1), new Piece('pawn', 1), new Piece('pawn', 1), new Piece('pawn', 1), new Piece('pawn', 1),
        '', '', '', '', '', '', '', '', 
        '', '', '', '', '', '', '', '', 
        '', '', '', '', '', '', '', '', 
        '', '', '', '', '', '', '', '', 
        new Piece('pawn', 0), new Piece('pawn', 0), new Piece('pawn', 0), new Piece('pawn', 0), new Piece('pawn', 0), new Piece('pawn', 0), new Piece('pawn', 0), new Piece('pawn', 0),
        new Piece('rook', 0), new Piece('knight', 0), new Piece('bishop', 0), new Piece('queen', 0), new Piece('king', 0), new Piece('bishop', 0), new Piece('knight', 0), new Piece('rook', 0)
    ];

    // Turn them to tiles
    for(let i = 0; i < board.length; i++) {
        const square = new Tile(i, board[i]);
        board[i] = square;
    }
    // Calc all possible moves
    for(let i = 0; i < board.length; i++) {
        if(board[i].piece) board[i].piece.possibleMoves = getValidMoves(board, board[i]);
    }
}
createBoard();

function drawBoard() {
    resetGameboard();

    board.forEach(tile => {
        const square = document.createElement("div");
        square.classList.add("square");
        square.classList.add(tile.possMove ? "possibleMove" : tile.color);
        square.setAttribute("squareID", tile.index);
        
        if(tile.piece) {
            square.innerHTML = tile.piece.svg;
            square.firstChild.firstChild.classList.add(tile.piece.color);
            square.firstChild.addEventListener('click', selectPiece);
        } else square.addEventListener('click', selectEmptyTile);

        tile.possMove = false;
        gameboard.append(square);
    });
}
drawBoard();

function move(from, to) {

    // Move the piece
    board[to].piece = board[from].piece;
    board[from].piece = undefined;

    // Check if castling
    if(board[to].piece.id === 'king' && !board[to].piece.hasMoved) {
        switch(to) {
            case 62:
                move(63, 61);
                break;
            case 58:
                move(56, 59);
                break;
            case 6:
                move(7, 5);
                break;
            case 2:
                move(0, 3);
                break;
            default:
                changePlayer();
                break;
        }
        changePlayer();
    }

    // Check if move was Ent Passent
    // Check for promotion
    if(board[to].piece.id === 'pawn') {
        // Ent Passent
        if(currPlayer === 'white' && board[to + WIDTH].piece?.canBeEntPassented) {
            board[to + WIDTH].piece = undefined;
        }
        if(currPlayer === 'black' && board[to - WIDTH].piece?.canBeEntPassented) {
            board[to - WIDTH].piece = undefined;
        }

        // TODO Promotion
    }

    //
    if(
        board[to].piece.id === 'pawn' &&
        !board[to].piece.hasMoved &&
        ((to >= 24 && to <= 31) || (to >= 32 && to <= 39))
    ) board[to].piece.canBeEntPassented = true;
        
    board[to].piece.hasMoved = true;
    
    fromTile = to;
    deselectPiece();
    updateValidMoves();
    changePlayer();

    validWhiteMoves = 0;
    validBlackMoves = 0;
    // Whenever a move is played, any prev EntPassents are redacted
    board.forEach(tile => {
        if(tile.piece) {
            tile.piece.canBeEntPassented = false;
            tile.piece.possibleMoves = getValidMoves(board, tile);
            tile.piece.color === 'white' ? 
                validWhiteMoves += tile.piece.possibleMoves.length :
                validBlackMoves += tile.piece.possibleMoves.length;
        }
    });

    if(!(validWhiteMoves && validBlackMoves)) {
        checkmate(validWhiteMoves ? 'black' : 'white');
    }
}

function updateValidMoves() {
    board[fromTile]?.piece?.possibleMoves.forEach(move => {
        board[move].possMove = true;
    });
    drawBoard();
}

function selectPiece(e) {
    toTile = Number(e.target.parentNode.getAttribute("squareID"));
    // If we ALREADY have a piece selected
    if(fromTile) {
        // If the player has selected another of their own pieces
        if(board[toTile].piece.color === currPlayer) {
            deselectPiece();
            fromTile = toTile;
            updateValidMoves();
            return;
        }

        // Otherwise, must've selected opponent's piece
        if(board[fromTile].piece.possibleMoves.includes(toTile)) move(fromTile, toTile);
        else deselectPiece();

    } else {
        if(board[toTile].piece.color !== currPlayer) return;
        fromTile = toTile;
        updateValidMoves();
    }
}

// Resets board such that no piece is selected
function deselectPiece() {
    fromTile = undefined;
    drawBoard();
}

function selectEmptyTile(e) {
    toTile = Number(e.target.getAttribute("squareID"));
    if(fromTile !== undefined) board[fromTile].piece?.possibleMoves.includes(toTile) ?
        move(fromTile, toTile) :
        deselectPiece();
}

function checkmate(checkmatedColor) {
    if(checkmatedColor === 'black') {
        infoDisplay.textContent = "CHECKMATE, WHITE WINS";
    } else {
        infoDisplay.textContent = "CHECKMATE, BLACK WINS";
    }
}
