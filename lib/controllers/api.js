'use strict';

var mongoose = require('mongoose'),
Thing = mongoose.model('Thing');
var Bot = mongoose.model('Bot');
var gameCtrl = require('./gameCtrl');

exports.getAllBots = function(req, res) {
    var lang = req.params.lang;
    Bot.find({language: lang}, function(err, bots) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        res.json(bots);
    });
};

exports.addNewBot = function(req, res) {
    var newBot = new Bot(req.body);
    newBot.save(function(error, bot, numberAffected) {
        if (error) {res.send(error);}
        res.json(bot);
    });
};

exports.use_verify_service = function(req, res) {
    // return res.json({'success': 1});
    var problem = req.query.problem;
    var lang = req.query.language;
    var turn = req.query.turn;
    var current_board = '[' + req.query.current_board + ']';
    var current_board_json = JSON.parse(current_board);
    var tests;

    // get valid moves
    var validmoves = validate(current_board_json, turn);

    console.log('Valid Moves = ' + validmoves);

    // check if the game is already over
    var winner = gameCtrl.checkGameStatus(current_board, validmoves);
    if (!validmoves || winner.name) {
        res.json({status: 'gameover', winner: {name: winner.name, score: winner.score}});
        return;
    }

    lang = lang.toLowerCase();
    if (lang === 'javascript') {
        lang = 'js';
        tests = 'assert_equal("ANYTHING", next_move('+ current_board + ', "' + turn + '", ' + JSON.stringify(validmoves) + '))';
    } else {
        tests = '>>> next_move(' + current_board + ', "' + turn + '", ' + JSON.stringify(validmoves) + ')\nFalse';
    }

    // console.log('Problem = ' + problem);
    console.log('Turn = ' + turn);
    console.log('Tests = ' + tests);

    var http = require('http');
    var querystring = require('querystring');

    var data = {
        tests: tests,
        solution: problem
    };

    var dataString = querystring.stringify({jsonrequest:JSON.stringify(data)});

    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': dataString.length
  };

    // make request to singpath backend
    var url = "162.222.183.53";
    var options = {
        hostname: url,
        path: '/'+lang.toLowerCase(),
        method: 'POST',
        headers: headers
    };

    var request = http.request(options, function(response) {
        response.setEncoding('utf8');
        response.on('data', function(chunk) {

            var jsonChunk = JSON.parse(chunk);
            console.log(jsonChunk);

            if (jsonChunk.errors) {
                res.json({errors: jsonChunk});
                return;
            }
            console.log('Received =' + jsonChunk.results[0].received);
            var new_board = JSON.parse(jsonChunk.results[0].received.replace(/\'/g, '"'));

            // get the new move from the new board
            var move = compare(current_board_json, new_board);
            
            var toFlip = gameCtrl.checkValidity(current_board_json, move);

            if (!toFlip) {
                console.log("Error flipping");
            } else {
                for (var i = 0; i < toFlip.length; i++) {
                    console.log(new_board[toFlip[i][0]][toFlip[i][1]]);
                    new_board[toFlip[i][0]][toFlip[i][1]] = move.side;
                }
            }

            res.json({'new_board':new_board});
        });
    });

    request.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    request.write(dataString);
    request.end();
};

var validate = function(board, turn) {
    return gameCtrl.getValidMoves(board, turn);
};

var compare = function (array, toCompare) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    var row, column;
    var move = {row: 0, column:0, side: ''};

    console.log("Array = " + array instanceof Array);
    console.log("ToCompare =" + toCompare instanceof Array);
    // compare lengths - can save a lot of time
    // if (toCompare.length != array.length)
    //     return false;

    for (var i = 0, l=toCompare.length; i < l; i++) {
        // Check if we have nested arrays
        move.row = i;
        if (toCompare[i] instanceof Array && array[i] instanceof Array) {
           for(var j = 0; j < toCompare[i].length; j++) {
                if (toCompare[i][j] !== array[i][j]) {                        
                    move.column = j;
                    move.side = toCompare[i][j];
                    return move;
                }
            }
        }
    }
    return true;
};