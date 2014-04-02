'use strict';

exports.getValidMoves = function(board, side) {
    var valid_moves = [];
    var move = {};
    for (var i = 0; i < 8; i++) {
        for (var j = 0; j < 8; j++) {
            move = {row: i, column: j, side: side};
            
            if (exports.checkValidity(board, move) !== false) {
                valid_moves.push([i, j]);
            };
        }
    }

    return valid_moves;
};

exports.isValidMove = function (valid_moves, move) {
    for (var i = 0; i < valid_moves.length; i++) {
        if (valid_moves[i].row === move.row && valid_moves[i].column === move.column) {
            return true;
        }
    }
    return false;
}

exports.checkValidity = function(board, move) {

    if (!exports.isOnBoard(move.row, move.column)) {
        console.log(JSON.stringify(move));
        return false;
    }
    // console.log(board);
    if (!isMoveEmpty(board, move)) {
        return false;
    }

    var adjacents = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
    var toFlip = [];

    board[move.row][move.column] = move.side;

    var opposite = 'O';
    if (move.side === 'O') {
        opposite = 'X';
    }

    for (var i = 0; i < adjacents.length; i++) {
        var x = move.row;
        var y = move.column;
        x += adjacents[i][0];
        y += adjacents[i][1];

        if (exports.isOnBoard(x, y) && board[x][y] === opposite) {
            x += adjacents[i][0];
            y += adjacents[i][1];

            if (!exports.isOnBoard(x, y)) { continue; }

            while (board[x][y] === opposite) {
                x += adjacents[i][0];
                y += adjacents[i][1];

                if (!exports.isOnBoard(x, y)) { break; }
            }

            if (!exports.isOnBoard(x, y)) { continue; }

            if (board[x][y] === move.side) {
                while (true) {
                    x -= adjacents[i][0];
                    y -= adjacents[i][1];
                    if (x === move.row && y === move.column) { break; }

                    toFlip.push([x, y]);
                }
            }
        }
    }
    board[move.row][move.column] = '_';
    if (toFlip.length === 0) {
        return false;
    } else {
        return toFlip;
    }
};

exports.isOnBoard = function(row, column) {
    return row < 8 && column < 8 && row >= 0 && column >= 0;
};

var isMoveEmpty = function(board, move) {
    return board[move.row][move.column] === "_";
};

exports.checkGameStatus = function(game_board, valid_moves) {
    if (valid_moves.length === 0) {
        var winner = {};
        var countX = 0;
        var countO = 0;

        for (var i = 0; i < game_board.length; i++) {
            for (var j = 0; j < game_board[i].length; j++) {
                if (game_board[i][j] === 'X') {
                    countX += 1;
                } else if (game_board[i][j] === 'O') {
                    countO += 1;
                }
            }
        }
        if (countX > countO) {
            winner.name = 'Bot X';
            winner.score = countX;
        } else {
            winner.name = 'Bot O';
            winner.score = countO;
        }
        return winner;
    }

    for (var i = 0; i < game_board.length; i++) {
        for (var j = 0; j < game_board[i].length; j++) {
            if (game_board[i][j] === '_') {
                return false;
            }
        }
    }
};    