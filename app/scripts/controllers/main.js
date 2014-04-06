'use strict';

angular.module('reversiApp')
.controller('MainCtrl', function ($rootScope, $scope, $http, $resource, User) {

    var new_bot_editor = ace.edit('new_bot_editor');
    new_bot_editor.setTheme("ace/theme/monokai");
    new_bot_editor.getSession().setMode("ace/mode/python");

    var bot1_editor = ace.edit('bot1_editor');
    bot1_editor.setTheme("ace/theme/monokai");
    bot1_editor.getSession().setMode("ace/mode/python");

    var bot2_editor = ace.edit('bot2_editor');
    bot2_editor.setTheme("ace/theme/monokai");
    bot2_editor.getSession().setMode("ace/mode/python");
    bot2_editor.setReadOnly(true);

    $scope.starting_bot = {name: 'Starting Bot', code: "#You may import\nimport random\ndef next_move(board, side, validmoves):\n  #Your logic here\n  return board", language: 'Python'};
    $scope.starting_bot_js = {name: 'Starting Bot', code: "var next_move = function(board, side, validmoves) {\n    // Write your code here\n};", language:'javascript'};
    $scope.bots = [$scope.stupid_bot];

    new_bot_editor.setValue($scope.starting_bot.code);
    // bot1_editor.setValue($scope.stupid_bot.code);
    // bot2_editor.setValue($scope.stupid_bot.code);

    $scope.languages = ['Python', 'Javascript'];
    $scope.user = {};

    $rootScope.$on("$firebaseSimpleLogin:login", function(e, user) {
      $scope.user = user;
    });

    $scope.getBots = function (lang) {
        lang = lang.toLowerCase();
        $scope.bots = [];
        $http.get('/api/all_bots/' + lang)
            .success(function(data) {
                for (var i = 0; i < data.length; i++) {
                    $scope.bots.push(data[i]);
                }
            })
            .error(function(error) {
                console.log(error);
            });
    };

    $scope.getBots('python');

    $scope.addBot = function(new_bot) {
        console.log($scope.user.name);
        $http.post('/api/new_bot', {name: new_bot.name, language:$scope.lang.toLowerCase(), code: new_bot_editor.getValue(), username: $scope.user.name})
            .success(function(data, status) {
                // console.log(new_bot);
                // $scope.bots = [];
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
        bot1_editor.setValue(bot.code);
    };

    $scope.change_bot2 = function(bot) {
        $scope.bot2 = bot;
        bot2_editor.setValue(bot.code);
    };

    $scope.change_lang = function(lang) {

        $scope.getBots(lang);

        lang = lang.toLowerCase();
        new_bot_editor.getSession().setMode("ace/mode/"+lang);
        bot1_editor.destroy();
        bot1_editor.getSession().setMode("ace/mode/"+lang);
        bot2_editor.destroy();
        bot2_editor.getSession().setMode("ace/mode/"+lang);

        if (lang === 'python') {
            new_bot_editor.destroy();
            new_bot_editor.setValue($scope.starting_bot.code);
            return;
        } else if (lang === 'javascript') {
            new_bot_editor.destroy();
            new_bot_editor.setValue($scope.starting_bot_js.code);
        }
    }

    var next_turn = '';

    $scope.play = function(is_first_turn) {
        // console.log($scope.current_board);
        var tests, data, turn;

        if (is_first_turn) {
            turn = getRandomTurn()
        } else {
            turn = next_turn;
        }

        // console.log(turn);

        if (turn === 'X') {
            next_turn = 'O';

            data = {
                solution: bot1_editor.getValue(),
                turn: turn
            };
        } else {
            next_turn = 'X';

            data = {
                solution: bot2_editor.getValue(), 
                turn: turn
            };
        }

        $scope.VerifierModel.get({
            'current_board': $scope.current_board,
            'problem': data.solution,
            'turn': data.turn,
            'language': $scope.lang
        }, function(response) {

            if (response.status) {
                is_game_over = true;
                $('#alert-info').removeClass('hide');
                if (response.winner) {
                    $scope.winner = response.winner;
                    $('#alert-win').removeClass('hide');
                }
            }

            if (response.errors) {
                $scope.errors = response.errors.errors;
                $('#alert-danger').removeClass('hide');
            }

            var new_board = response.new_board;
            console.log(JSON.stringify(new_board));

            $scope.game_history.push(new_board);

            $scope.current_board = new_board;

            var is_game_over = false;

            if (!is_game_over) {
                $scope.play(false);
            }
        });
    };

    var getRandomTurn = function() {
        var possible = 'XO';
        return possible.charAt(Math.floor(Math.random() * possible.length));
    };
});