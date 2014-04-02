'use strict';

angular.module('reversiApp').controller('LeaderBoardCtrl', function ($scope) {
    $scope.starting_bot = {name: 'Starting Bot', code: "#You may import\n#import random\ndef next_move(board, side):\n  validmoves = getValidMoves(board, side)\n  # Write your logic\n\ndef getValidMoves(board, side):\n  validmoves = []\n  for i in range(8):\n    for j in range(8):\n      move = {'row':i, 'column':j, 'side':side}\n      if checkValidity(board, move) != False:\n        validmoves.append([i, j])\n  return validmoves\n\ndef checkValidity(board, move):\n  if not isOnBoard(move['row'], move['column']):\n    return False\n\n  if not isMoveEmpty(board, move):\n    return False\n\n  adjacents = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]\n  board[move['row']][move['column']] = move['side']\n  opposite = 'O'\n  if move['side'] == 'O':\n    opposite = 'X'\n  for i in range(len(adjacents)):\n    x = move['row']\n    y = move['column']\n    x += adjacents[i][0]\n    y += adjacents[i][1]\n    if isOnBoard(x, y) and board[x][y] == opposite:\n      x += adjacents[i][0] \n      y += adjacents[i][1]\n      if not isOnBoard(x, y):\n        continue\n      while board[x][y] == opposite:\n        x += adjacents[i][0]\n        y += adjacents[i][1]\n\n        if not isOnBoard(x, y):\n          break\n      if not isOnBoard(x, y):\n        continue\n      if board[x][y] == move['side']:\n        board[move['row']][move['column']] = '_'\n        return True\n  board[move['row']][move['column']] = '_'\n  return False \n\ndef isOnBoard(row, column):\n  return row<8 and column<8 and row >=0 and column >=0\n\ndef isMoveEmpty(board, move):\n  return board[move['row']][move['column']] == '_'", language: 'python'};
    $scope.stupid_bot = {name: 'Stupid Bot', code: "import random\ndef next_move(board, side):\n  validmoves = getValidMoves(board, side)\n  print side + ' = '\n  print validmoves\n  firstmove = random.choice(validmoves)\n  board[firstmove[0]][firstmove[1]] = side\n  return board\n\ndef getValidMoves(board, side):\n  validmoves = []\n  for i in range(8):\n    for j in range(8):\n      move = {'row':i, 'column':j, 'side':side}\n      if checkValidity(board, move) != False:\n        validmoves.append([i, j])\n  return validmoves\n\ndef checkValidity(board, move):\n  if not isOnBoard(move['row'], move['column']):\n    return False\n\n  if not isMoveEmpty(board, move):\n    return False\n\n  adjacents = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]\n  board[move['row']][move['column']] = move['side']\n  opposite = 'O'\n  if move['side'] == 'O':\n    opposite = 'X'\n  for i in range(len(adjacents)):\n    x = move['row']\n    y = move['column']\n    x += adjacents[i][0]\n    y += adjacents[i][1]\n    if isOnBoard(x, y) and board[x][y] == opposite:\n      x += adjacents[i][0] \n      y += adjacents[i][1]\n      if not isOnBoard(x, y):\n        continue\n      while board[x][y] == opposite:\n        x += adjacents[i][0]\n        y += adjacents[i][1]\n\n        if not isOnBoard(x, y):\n          break\n      if not isOnBoard(x, y):\n        continue\n      if board[x][y] == move['side']:\n        board[move['row']][move['column']] = '_'\n        return True\n  board[move['row']][move['column']] = '_'\n  return False \n\ndef isOnBoard(row, column):\n  return row<8 and column<8 and row >=0 and column >=0\n\ndef isMoveEmpty(board, move):\n  return board[move['row']][move['column']] == '_'", language: 'python'};
    $scope.top = [$scope.starting_bot, $scope.stupid_bot];
});