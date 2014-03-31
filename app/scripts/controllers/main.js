'use strict';

angular.module('reversiApp').controller('MainCtrl', function ($scope, $http, $resource) {

    $scope.stupid_bot = {name: 'Stupid Bot', code: "import random\ndef next_move(board, side):\n  validmoves = getValidMoves(board, side)\n  print side + ' = '\n  print validmoves\n  firstmove = random.choice(validmoves)\n  board[firstmove[0]][firstmove[1]] = side\n  return board\n\ndef getValidMoves(board, side):\n  validmoves = []\n  for i in range(8):\n    for j in range(8):\n      move = {'row':i, 'column':j, 'side':side}\n      if checkValidity(board, move) != False:\n        validmoves.append([i, j])\n  return validmoves\n\ndef checkValidity(board, move):\n  if not isOnBoard(move['row'], move['column']):\n    return False\n\n  if not isMoveEmpty(board, move):\n    return False\n\n  adjacents = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]\n  board[move['row']][move['column']] = move['side']\n  opposite = 'O'\n  if move['side'] == 'O':\n    opposite = 'X'\n  for i in range(len(adjacents)):\n    x = move['row']\n    y = move['column']\n    x += adjacents[i][0]\n    y += adjacents[i][1]\n    if isOnBoard(x, y) and board[x][y] == opposite:\n      x += adjacents[i][0] \n      y += adjacents[i][1]\n      if not isOnBoard(x, y):\n        continue\n      while board[x][y] == opposite:\n        x += adjacents[i][0]\n        y += adjacents[i][1]\n\n        if not isOnBoard(x, y):\n          break\n      if not isOnBoard(x, y):\n        continue\n      if board[x][y] == move['side']:\n        board[move['row']][move['column']] = '_'\n        return True\n  board[move['row']][move['column']] = '_'\n  return False \n\ndef isOnBoard(row, column):\n  return row<8 and column<8 and row >=0 and column >=0\n\ndef isMoveEmpty(board, move):\n  return board[move['row']][move['column']] == '_'", language: 'python'};
    $scope.bots = [];
    $scope.bots.push($scope.stupid_bot);

    $scope.addBot = function(new_bot) {
        $http.post('/api/new_bot', {name: new_bot.name, code: new_bot.code})
            .success(function(data, status) {
                console.log(new_bot);
                $scope.bots.push(new_bot);
            })
            .error(function(data, error) {
                console.log(error);
            });
    };

    $scope.VerifierModel = $resource('/api/use_verify_service', {}, {
        'get': {
            method: 'GET',
            isArray: false
        }
    });
    
    $scope.reset_game = function () {
        $scope.current_board = [
            ['_','_','_','_','_','_','_','_',],
            ['_','_','_','_','_','_','_','_',],
            ['_','_','_','_','_','_','_','_',],
            ['_','_','_','X','O','_','_','_',],
            ['_','_','_','O','X','_','_','_',],
            ['_','_','_','_','_','_','_','_',],
            ['_','_','_','_','_','_','_','_',],
            ['_','_','_','_','_','_','_','_',]];
        $scope.game_history = [$scope.current_board];

    };

    $scope.reset_game();

    $scope.change_bot1 = function(bot) {
        $scope.bot1 = bot;
        $scope.bot1.code = bot.code;
    };

    $scope.change_bot2 = function(bot) {
        $scope.bot2 = bot;
        $scope.bot2.code = bot.code;
    };

    var next_turn = '';

    $scope.play = function(is_first_turn) {
        // console.log($scope.current_board);
        var tests, data, turn;

        if (is_first_turn) {
            turn = getRandomTurn()
        } else {
            turn = next_turn;
        }

        console.log(turn);

        if (turn === 'X') {
            next_turn = 'O';
            tests = ">>> next_move(" + JSON.stringify($scope.current_board) + ", 'X') \n 'ANYTHING'";
            data = {
                solution: $scope.bot1.code, 
                tests: tests
            };
        } else {
            next_turn = 'X';
            tests = ">>> next_move(" + JSON.stringify($scope.current_board) + ", 'O') \n 'ANYTHING'";
            data = {
                solution: $scope.bot2.code, 
                tests: tests
            };
        }

        $scope.VerifierModel.get({
            'problem': data.solution,
            'tests': data.tests
        }, function(response) {

            // parse the new board to a matrix
            var new_board = JSON.parse(response.results[0].received.replace(/'/g, '"'));
            console.log(JSON.stringify(new_board));

            // get the new move from the new board
            var move = new_board.compare($scope.current_board);
            console.log('Move = ' + move.row + ', ' + move.column);
            if(move.row === undefined) {
                console.log(JSON.stringify(new_board));
            }
            // get all the possible valid moves
            var valid_moves = getValidMoves($scope.current_board, turn);
            console.log(JSON.stringify(valid_moves));

            // check if player move is valid
            var is_move_valid = isValidMove(valid_moves, move);
            console.log("Is move valid =" + is_move_valid);

            if (is_move_valid) {
                $scope.game_history.push(new_board);
                console.log($scope.current_board, move);
                console.log(JSON.stringify(move));
                var toFlip = checkValidity($scope.current_board, move);
                console.log('To Flip = ' + toFlip);

                $scope.current_board = new_board;

                if (!toFlip) {
                    console.log("Error flipping");
                } else {
                    for (var i = 0; i < toFlip.length; i++) {
                        $scope.current_board[toFlip[i][0]][toFlip[i][1]] = move.side;
                    }
                }
            } else {
                console.log("Invalid move");
                return;
            }

            var is_game_over = checkGameStatus($scope.current_board);
            if (!is_game_over) {
                $scope.play(false);
            };
            // console.log(JSON.parse(response.results[0].received.replace(/'/g, '"')));
        });
    };

    var getValidMoves = function(board, side) {
        var valid_moves = [];
        var move = {};
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                move = {row: i, column: j, side: side};
                
                if (checkValidity(board, move) !== false) {
                    valid_moves.push({row: i, column: j});
                };
            }
        }

        return valid_moves;
    };

    var isValidMove = function (valid_moves, move) {
        for (var i = 0; i < valid_moves.length; i++) {
            if (valid_moves[i].row === move.row && valid_moves[i].column === move.column) {
                return true;
            }
        }
        return false;
    }

    var checkValidity = function(board, move) {
        if (!isOnBoard(move.row, move.column)) { return false; }

        if (!isMoveEmpty(board, move)) { return false; }

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

            if (isOnBoard(x, y) && board[x][y] === opposite) {
                x += adjacents[i][0];
                y += adjacents[i][1];

                if (!isOnBoard(x, y)) { continue; }

                while (board[x][y] === opposite) {
                    x += adjacents[i][0];
                    y += adjacents[i][1];

                    if (!isOnBoard(x, y)) { break; }
                }

                if (!isOnBoard(x, y)) { continue; }

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

    var isOnBoard = function(row, column) {
        return row < 8 && column < 8 && row >= 0 && column >= 0;
    };

    var isMoveEmpty = function(board, move) {
        return board[move.row][move.column] === '_';
    };

    var checkGameStatus = function(game_board) {
        return false;
    };

    var getRandomTurn = function() {
        var possible = 'XO';
        return possible.charAt(Math.floor(Math.random() * possible.length));
    };

    Array.prototype.compare = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        var row, column;
        var move = {row: 0, column:0, side: ''};

        // compare lengths - can save a lot of time
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            move.row = i;
            if (this[i] instanceof Array && array[i] instanceof Array) {
               for(var j = 0; j < this[i].length; j++) {
                    if (this[i][j] !== array[i][j]) {                        
                        move.column = j;
                        move.side = this[i][j];
                        return move;
                    }
                }
            }
        }
        return true;
    };
});
