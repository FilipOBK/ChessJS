function getValidMoves(board, tile, check4check = true) {
    const validMoves = [];

    const piece = tile.piece;
    const strtIdx = tile.index;
    const startRow = strtIdx - (strtIdx % 8);
    const endRow = startRow + 7;
    const startCol = strtIdx % 8;
    const endCol = startCol + 7 * WIDTH;
    const currPlayer = tile.piece.color;

    const checkValid = (move) => {
        const endTile = strtIdx + move;

        if(endTile > 63 || endTile < 0) return;

        if(!board[endTile].piece || board[endTile].piece.color !== piece.color) {
            validMoves.push(endTile);
        }
    }

    const willResultInCheck = () => {
        const movesToRemove = [];

        // For simulating moves
        function doMove(b, from, to) {
            b[to].piece = b[from].piece;
            b[from].piece = undefined;
        
            // Check if castling
            if(b[to].piece.id === 'king' && !b[to].piece.hasMoved) {
                switch(to) {
                    case 62:
                        doMove(b, 63, 61);
                        break;
                    case 58:
                        doMove(b, 56, 59);
                        break;
                    case 6:
                        doMove(b, 7, 5);
                        break;
                    case 2:
                        doMove(b, 0, 3);
                        break;
                    default:
                }
            }

            // Check if move was Ent Passent
            if(b[to].piece.id === 'pawn') {
                // Ent Passent
                if(currPlayer === 'white' && b[to + WIDTH].piece?.canBeEntPassented) {
                    b[to + WIDTH].piece = undefined;
                }
                if(currPlayer === 'black' && b[to - WIDTH].piece?.canBeEntPassented) {
                    b[to - WIDTH].piece = undefined;
                }
            }
        }
        
        // Gather info
        const enemyColor = currPlayer === 'white' ? 'black' : 'white';
        let ownKingIndex;
        board.forEach(tile => {
            if(tile.piece?.id === 'king' && tile.piece.color === currPlayer)
                ownKingIndex = tile.index;
        });
        


        validMoves.forEach(move => {
            // Use copy of board for simulating
            let checkBoard = JSON.parse(JSON.stringify(board));
            // Simulate making the move
            doMove(checkBoard, strtIdx, move);
            // If we are moving the king, the kingIndex will change each move
            if(piece.id === 'king') {
                checkBoard.forEach(tile => {
                    if(tile.piece?.id === 'king' && tile.piece.color === currPlayer)
                        ownKingIndex = tile.index;
                });
            }

            // Check each tile of the board
            checkBoard.forEach(tile => {
                if(tile.piece?.color === enemyColor) {
                    // Can their move attack the king?
                    tile.piece.possibleMoves = getValidMoves(checkBoard, tile, false);
                    if(tile.piece.possibleMoves.includes(ownKingIndex)) movesToRemove.push(move);
                }
            });
        });
        return movesToRemove;
    }



    switch(piece.id) {

        case 'pawn':
            if(piece.color === "black") {
                if(!board[strtIdx + WIDTH].piece) validMoves.push(strtIdx + WIDTH);
                if(board[strtIdx + WIDTH + 1].piece?.color === "white" && (strtIdx + WIDTH + 1) % 8 !== 0) validMoves.push(strtIdx + WIDTH + 1);
                if(board[strtIdx + WIDTH - 1].piece?.color === "white" && (strtIdx + WIDTH - 1) % 8 !== 7) validMoves.push(strtIdx + WIDTH - 1);
                if(strtIdx <= 15 && !board[strtIdx + 2 * WIDTH].piece && !board[strtIdx + WIDTH].piece) validMoves.push(strtIdx + 2 * WIDTH);
                // Ent Passent
                if(strtIdx % 8 !== 0 && board[strtIdx + 1].piece?.canBeEntPassented) checkValid(WIDTH + 1);
                if(strtIdx % 8 !== 7 && board[strtIdx - 1].piece?.canBeEntPassented) checkValid(WIDTH - 1);
            } else {
                if(!board[strtIdx - WIDTH].piece) validMoves.push(strtIdx - WIDTH);
                if(board[strtIdx - WIDTH + 1].piece?.color === "black" && (strtIdx - WIDTH + 1) % 8 !== 0) validMoves.push(strtIdx - WIDTH + 1);
                if(board[strtIdx - WIDTH - 1].piece?.color === "black" && (strtIdx - WIDTH - 1) % 8 !== 7) validMoves.push(strtIdx - WIDTH - 1);
                if(strtIdx >= 48 && !board[strtIdx - 2 * WIDTH].piece && !board[strtIdx - WIDTH].piece) validMoves.push(strtIdx - 2 * WIDTH);
                // Ent Passent
                if(strtIdx % 8 !== 0 && board[strtIdx - 1].piece?.canBeEntPassented) checkValid(-WIDTH - 1);
                if(strtIdx % 8 !== 7 && board[strtIdx + 1].piece?.canBeEntPassented) checkValid(-WIDTH + 1);
            }
            break;
        case 'king':
            checkValid(-1);
            checkValid(+1);
            checkValid(WIDTH);
            checkValid(-WIDTH);
            checkValid(WIDTH + 1);
            checkValid(WIDTH - 1);
            checkValid(-WIDTH + 1);
            checkValid(-WIDTH - 1);

            // Castling
            if(!piece.hasMoved) {
                
                if(
                    !(board[strtIdx + 1]?.piece || board[strtIdx + 2]?.piece) &&
                    board[strtIdx + 3]?.piece?.id === 'rook' && !board[strtIdx + 3].piece.hasMoved
                ) validMoves.push(strtIdx + 2);
                if(
                    !(board[strtIdx - 1]?.piece || board[strtIdx - 2]?.piece || board[strtIdx - 3].piece) &&
                    board[strtIdx - 4]?.piece?.id === 'rook' && !board[strtIdx - 4].piece.hasMoved
                ) validMoves.push(strtIdx - 2);
            }
            break;
        case 'knight':
            if(strtIdx % 8 > 0) checkValid(2 * WIDTH - 1);
            if(strtIdx % 8 < 7) checkValid(2 * WIDTH + 1);
            if(strtIdx % 8 > 1) checkValid(-2 - WIDTH);
            if(strtIdx % 8 > 1) checkValid(-2 + WIDTH);
            if(strtIdx % 8 < 6) checkValid(2 - WIDTH);
            if(strtIdx % 8 < 6) checkValid(2 + WIDTH);
            if(strtIdx % 8 > 0) checkValid(-2 * WIDTH - 1);
            if(strtIdx % 8 < 7) checkValid(-2 * WIDTH + 1);
            break;
        case 'rook':
            for(let i = 1; strtIdx - i >= startRow; i++) {
                if(board[strtIdx - i].piece?.color === piece.color) break;
                if(board[strtIdx - i].piece && board[strtIdx - i].piece.color !== piece.color) {
                    checkValid(-i);
                    break;
                }
                checkValid(-i);
            }
            for(let i = 1; strtIdx + i <= endRow; i++) {
                if(board[strtIdx + i].piece?.color === piece.color) break;
                if(board[strtIdx + i].piece && board[strtIdx + i].piece.color !== piece.color) {
                    checkValid(i);
                    break;
                }
                checkValid(i);
            }
            for(let i = 1; strtIdx + i * WIDTH <= endCol; i++) {
                if(board[strtIdx + i * WIDTH].piece?.color === piece.color) break;
                if(board[strtIdx + i * WIDTH].piece && board[strtIdx + i * WIDTH].piece.color !== piece.color) {
                    checkValid(i * WIDTH);
                    break;
                }
                checkValid(i * WIDTH);
            }
            for(let i = 1; strtIdx - i * WIDTH >= startCol; i++) {
                if(board[strtIdx - i * WIDTH].piece?.color === piece.color) break;
                if(board[strtIdx - i * WIDTH].piece && board[strtIdx - i * WIDTH].piece.color !== piece.color) {
                    checkValid(-i * WIDTH);
                    break;
                }
                checkValid(-i * WIDTH);
            }
            break;
        case 'bishop':
            for(let i = 1; (strtIdx + i * (WIDTH + 1)) % 8 !== 0 && (strtIdx + i * (WIDTH + 1)) <= 63; i++) {
                if(board[strtIdx + i * (WIDTH + 1)].piece?.color === piece.color) break;
                if(board[strtIdx + i * (WIDTH + 1)].piece && board[strtIdx + i * (WIDTH + 1)].piece.color !== piece.color) {
                    checkValid(i * (WIDTH + 1));
                    break;
                }
                checkValid(i * (WIDTH + 1));
            }
            for(let i = 1; (strtIdx - i * (WIDTH + 1)) % 8 !== 7 && (strtIdx - i * (WIDTH + 1)) >= 0; i++) {
                if(board[strtIdx - i * (WIDTH + 1)].piece?.color === piece.color) break;
                if(board[strtIdx - i * (WIDTH + 1)].piece && board[strtIdx - i * (WIDTH + 1)].piece.color !== piece.color) {
                    checkValid(-i * (WIDTH + 1));
                    break;
                }
                checkValid(-i * (WIDTH + 1));
            }
            for(let i = 1; (strtIdx + i * (WIDTH - 1)) % 8 !== 7 && (strtIdx + i * (WIDTH - 1)) <= 63; i++) {
                if(board[strtIdx + i * (WIDTH - 1)].piece?.color === piece.color) break;
                if(board[strtIdx + i * (WIDTH - 1)].piece && board[strtIdx + i * (WIDTH - 1)].piece.color !== piece.color) {
                    checkValid(i * (WIDTH - 1));
                    break;
                }
                checkValid(i * (WIDTH - 1));
            }
            for(let i = 1; (strtIdx - i * (WIDTH - 1)) % 8 !== 0 && (strtIdx - i * (WIDTH - 1)) >= 0; i++) {
                if(board[strtIdx - i * (WIDTH - 1)].piece?.color === piece.color) break;
                if(board[strtIdx - i * (WIDTH - 1)].piece && board[strtIdx - i * (WIDTH - 1)].piece.color !== piece.color) {
                    checkValid(-i * (WIDTH - 1));
                    break;
                }
                checkValid(-i * (WIDTH - 1));
            } 
            break;
        case 'queen':
            for(let i = 1; (strtIdx + i * (WIDTH + 1)) % 8 !== 0 && (strtIdx + i * (WIDTH + 1)) <= 63; i++) {
                if(board[strtIdx + i * (WIDTH + 1)].piece?.color === piece.color) break;
                if(board[strtIdx + i * (WIDTH + 1)].piece && board[strtIdx + i * (WIDTH + 1)].piece.color !== piece.color) {
                    checkValid(i * (WIDTH + 1));
                    break;
                }
                checkValid(i * (WIDTH + 1));
            }
            for(let i = 1; (strtIdx - i * (WIDTH + 1)) % 8 !== 7 && (strtIdx - i * (WIDTH + 1)) >= 0; i++) {
                if(board[strtIdx - i * (WIDTH + 1)].piece?.color === piece.color) break;
                if(board[strtIdx - i * (WIDTH + 1)].piece && board[strtIdx - i * (WIDTH + 1)].piece.color !== piece.color) {
                    checkValid(-i * (WIDTH + 1));
                    break;
                }
                checkValid(-i * (WIDTH + 1));
            }
            for(let i = 1; (strtIdx + i * (WIDTH - 1)) % 8 !== 7 && (strtIdx + i * (WIDTH - 1)) <= 63; i++) {
                if(board[strtIdx + i * (WIDTH - 1)].piece?.color === piece.color) break;
                if(board[strtIdx + i * (WIDTH - 1)].piece && board[strtIdx + i * (WIDTH - 1)].piece.color !== piece.color) {
                    checkValid(i * (WIDTH - 1));
                    break;
                }
                checkValid(i * (WIDTH - 1));
            }
            for(let i = 1; (strtIdx - i * (WIDTH - 1)) % 8 !== 0 && (strtIdx - i * (WIDTH - 1)) >= 0; i++) {
                if(board[strtIdx - i * (WIDTH - 1)].piece?.color === piece.color) break;
                if(board[strtIdx - i * (WIDTH - 1)].piece && board[strtIdx - i * (WIDTH - 1)].piece.color !== piece.color) {
                    checkValid(-i * (WIDTH - 1));
                    break;
                }
                checkValid(-i * (WIDTH - 1));
            }
            for(let i = 1; strtIdx - i >= startRow; i++) {
                if(board[strtIdx - i].piece?.color === piece.color) break;
                if(board[strtIdx - i].piece && board[strtIdx - i].piece.color !== piece.color) {
                    checkValid(-i);
                    break;
                }
                checkValid(-i);
            }
            for(let i = 1; strtIdx + i <= endRow; i++) {
                if(board[strtIdx + i].piece?.color === piece.color) break;
                if(board[strtIdx + i].piece && board[strtIdx + i].piece.color !== piece.color) {
                    checkValid(i);
                    break;
                }
                checkValid(i);
            }
            for(let i = 1; strtIdx + i * WIDTH <= endCol; i++) {
                if(board[strtIdx + i * WIDTH].piece?.color === piece.color) break;
                if(board[strtIdx + i * WIDTH].piece && board[strtIdx + i * WIDTH].piece.color !== piece.color) {
                    checkValid(i * WIDTH);
                    break;
                }
                checkValid(i * WIDTH);
            }
            for(let i = 1; strtIdx - i * WIDTH >= startCol; i++) {
                if(board[strtIdx - i * WIDTH].piece?.color === piece.color) break;
                if(board[strtIdx - i * WIDTH].piece && board[strtIdx - i * WIDTH].piece.color !== piece.color) {
                    checkValid(-i * WIDTH);
                    break;
                }
                checkValid(-i * WIDTH);
            }
            break;
        default:
            break;
    }
    if(check4check) {
        const movesToRemove = willResultInCheck();
        movesToRemove.forEach(move => {
            const index = validMoves.indexOf(move);
            if(index > -1) validMoves.splice(index, 1);
        });
    }
    return validMoves;
}