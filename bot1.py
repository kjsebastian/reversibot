import random
def next_move(board, side):
  validmoves = getValidMoves(board, side)
  print side + ' = '
  print validmoves
  firstmove = random.choice(validmoves)
  board[firstmove[0]][firstmove[1]] = side
  return board

def getValidMoves(board, side):
  validmoves = []
  for i in range(8):
    for j in range(8):
      move = {'row':i, 'column':j, 'side':side}
      if checkValidity(board, move) != False:
        validmoves.append([i, j])
  return validmoves

def checkValidity(board, move):
  if not isOnBoard(move['row'], move['column']):
    return False

  if not isMoveEmpty(board, move):
    return False

  adjacents = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]]
  board[move['row']][move['column']] = move['side']
  opposite = 'O'
  if move['side'] == 'O':
    opposite = 'X'
  for i in range(len(adjacents)):
    x = move['row']
    y = move['column']
    x += adjacents[i][0]
    y += adjacents[i][1]
    if isOnBoard(x, y) and board[x][y] == opposite:
      x += adjacents[i][0] 
      y += adjacents[i][1]
      if not isOnBoard(x, y):
        continue
      while board[x][y] == opposite:
        x += adjacents[i][0]
        y += adjacents[i][1]

        if not isOnBoard(x, y):
          break
      if not isOnBoard(x, y):
        continue
      if board[x][y] == move['side']:
        board[move['row']][move['column']] = '_'
        return True
  board[move['row']][move['column']] = '_'
  return False 

def isOnBoard(row, column):
  return row<8 and column<8 and row >=0 and column >=0

def isMoveEmpty(board, move):
  return board[move['row']][move['column']] == '_'

if __name__ == '__main__':
  main_board = [['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', 'X', 'O', '_', '_', '_'], ['_', '_', '_', 'O', 'X', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_'], ['_', '_', '_', '_', '_', '_', '_', '_']]
  # tmp_board = main_board
  tmp_board = next_move(main_board, 'X')

  # print x_board
  for x in range(10):
    o_board = tmp_board
    tmp_board = next_move(o_board, 'O')
    # print o_board
    
    x_board = tmp_board
    tmp_board = next_move(x_board, 'X')
    # print x_board

    