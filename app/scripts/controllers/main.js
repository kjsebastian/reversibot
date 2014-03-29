'use strict';

angular.module('reversiApp').controller('MainCtrl', function ($scope, $http, $resource) {
    $http.get('/api/awesomeThings').success(function(awesomeThings) {
        $scope.awesomeThings = awesomeThings;
    });

    $scope.bot1 = {name: 'Bot X', code: 'def next_move(board, side):\n  for i in range(len(board)):\n    for j in range(len(board[i])):\n      if board[i][j] == "O":\n        board[i][j+1] = "X"\n        return board', language: 'python'};
    $scope.bot2 = {name: 'Bot Y', code: 'def next_move(board, side):\n  for i in range(len(board)):\n    for j in range(len(board[i])):\n      if board[i][j] == "X":\n        board[i][j+1] = "O"\n        return board', language: 'python'};
    $scope.bot3 = {name: 'Stupid bot', code: 'def next_move(board, side):\n  for i in range(len(board)):\n    for j in range(len(board[i])):\n      if board[i][j] == "_":\n        board[i][j+1] = side\n        return board',language: 'python'};
    $scope.bot4 = {name: 'Smart Bot', code: "def isValidMove(board, tile, xstart, ystart): # Returns False if the player's move on space xstart, ystart is invalid. # If it is a valid move, returns a list of spaces that would become the player's if they made a move here. if board[xstart][ystart] != ' ' or not isOnBoard(xstart, ystart): return False board[xstart][ystart] = tile # temporarily set the tile on the board. if tile == 'X': otherTile = 'O' else: otherTile = 'X' tilesToFlip = [] for xdirection, ydirection in [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]: x, y = xstart, ystart x += xdirection # first step in the direction y += ydirection # first step in the direction if isOnBoard(x, y) and board[x][y] == otherTile: # There is a piece belonging to the other player next to our piece. x += xdirection y += ydirection if not isOnBoard(x, y): continue while board[x][y] == otherTile: x += xdirection y += ydirection if not isOnBoard(x, y): # break out of while loop, then continue in for loop break if not isOnBoard(x, y): continue if board[x][y] == tile: # There are pieces to flip over. Go in the reverse direction until we reach the original space, noting all the tiles along the way. while True: x -= xdirection y -= ydirection if x == xstart and y == ystart: break tilesToFlip.append([x, y]) board[xstart][ystart] = ' ' # restore the empty space if len(tilesToFlip) == 0: # If no tiles were flipped, this is not a valid move. return False return tilesToFlip", language: 'python'}
    // $scope.game_history = [];
    $scope.bots = [];
    $scope.bots.push($scope.bot1, $scope.bot2, $scope.bot3, $scope.bot4);

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

            // get the new move from the new board
            var move = new_board.compare($scope.current_board);

            // get all the possible valid moves
            var valid_moves = getValidMoves($scope.current_board, 'X');
            console.log(valid_moves);

            // check if player move is valid
            var is_move_valid = isValidMove(valid_moves, move);
            console.log("Is move valid =" + is_move_valid);

            if (is_move_valid) {
                $scope.game_history.push(new_board);
                $scope.current_board = new_board;
                console.log($scope.current_board, move);
                var toFlip = checkValidity($scope.current_board, move);
                console.log('To Flip = ' + toFlip);

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

        var adjacents = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
        var toFlip = [];

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
        if (toFlip.length === 0) {
            return false;
        } else {
            return toFlip;
        }
    };

    var isOnBoard = function(row, column) {
        return row < 8 && column < 8 && row >= 0 && column >= 0;
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
