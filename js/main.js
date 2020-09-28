'use strict'

const White_Piece = '🔵';
const Black_Piece = '🔴';
const Queen_White_Piece = `<img src="img/queen-icon-53.png" width="50" height="50"/>`;
const Queen_Black_Piece = `<img src="img/Games_BoardGames_Artboard_14-512.png" width="50" height="50"/>`;

const Current_Turn_Class = 'currentTurn';

var gBoard;
var gSelectedElCell = null;
var secondTurnLock = false;
var currentTurn;

function restartGame() {
    gBoard = buildBoard();
    renderBoard(gBoard);
    setPlayersNames();
    initCurrentTurn();
}

function initCurrentTurn() {
    currentTurn = White_Piece;
    document.querySelector('.player1').classList.add('currentTurn');
}

function setPlayersNames() {
    setPlayerName(1);
    setPlayerName(2);
}

function setPlayerName(playerNumber) {
    var player1Name = prompt(`Player ${playerNumber} Name?:`);

    var elPlayer = document.querySelector(`.player${playerNumber}`);
    elPlayer.innerText = player1Name;
}

function buildBoard() {
    var board = [];
    var size = 8;
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            var cell = {
                isMarked: false,
                isDead: false,
                isQueen: false,
                // color: undefined,
            };
            board[i][j] = cell;

            if ((i === 0 && (j % 2 === 0)) ||
                (i === 1 && (j % 2 !== 0)) ||
                (i === 2 && (j % 2 === 0))) {

                board[i][j] = White_Piece;

            }
            else if ((i === 5 && (j % 2 !== 0)) ||
                (i === 6 && (j % 2 === 0)) ||
                (i === 7 && (j % 2 !== 0))) {
                board[i][j] = Black_Piece;

            }
            else board[i][j] = '';
        }
    }
    return board;
}

function renderBoard(board) {
    var strHtml = '';
    for (let i = 0; i < board.length; i++) {
        var row = board[i];
        strHtml += '<tr>';
        for (let j = 0; j < row.length; j++) {
            var cell = row[j];

            var className = (i + j) % 2 === 0 ? 'black' : 'white';
            var tdId = `cell-${i}-${j}`;
            strHtml += `<td id="${tdId}" onclick="cellClicked(this, ${i}, ${j})" class="${className}">
                            ${cell}
                        </td>`;
        }
        strHtml += '</tr>';
    }
    var elMat = document.querySelector('.game-board');
    elMat.innerHTML = strHtml;
}

function isValidCell(piece) {
    if (!piece)
        return false;

    return piece === currentTurn || (currentTurn === Black_Piece && piece === Queen_Black_Piece) ||
        (currentTurn === White_Piece && piece === Queen_White_Piece)

}

function switchTurns() {
    if (currentTurn === White_Piece || currentTurn === Queen_White_Piece) {
        currentTurn = Black_Piece;
        document.querySelector('.player1').classList.remove(Current_Turn_Class);
        document.querySelector('.player2').classList.add(Current_Turn_Class);
    }
    else {
        currentTurn = White_Piece;
        document.querySelector('.player2').classList.remove(Current_Turn_Class);
        document.querySelector('.player1').classList.add(Current_Turn_Class);
    }
}


function cellClicked(elCell, i, j) {
    if (secondTurnLock && !elCell.classList.contains('mark')) {
        return;
    }
    var pos = { i: i, j: j };
    var hasEaten = false;
    if (gSelectedElCell && elCell.classList.contains('mark')) {
        hasEaten = movePiece(gSelectedElCell, elCell);
        cleanBoard();
        if (hasEaten)
            secondTurnLock = true;
        else {
            switchTurns();
            gSelectedElCell = null;
            return;
        }
    }
    cleanBoard();
    var piece = gBoard[i][j];

    if (!isValidCell(piece))
        return;

    elCell.classList.add('selected');
    gSelectedElCell = elCell;

    var possibleCoords = [];
    switch (piece) {
        case White_Piece:
            possibleCoords = getWhitePosibleCoords(pos, hasEaten);
            break;
        case Black_Piece:
            possibleCoords = getBlackPosibleCoords(pos, hasEaten);
            break;
        case Queen_White_Piece:
        case Queen_Black_Piece:
            possibleCoords = getQueenPosibleCoords(pos, hasEaten);
            break;
    }

    if (possibleCoords.length === 0 && secondTurnLock === true) {
        cleanBoard();
        switchTurns();
        secondTurnLock = false;
    }
    markCells(possibleCoords)
}

function getQueenPosibleCoords(pos, secondMove = false) {
    var res = [];
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
        var coord = { i: pos.i + 1, j: j }
        if (j === pos.j) continue;
        if (secondMove && isEmptyCell(coord)) continue;
        if (!isEmptyCell(coord) && isFriendlyCell(coord)) continue;
        if (!isEmptyCell(coord) && !isFriendlyCell(coord)) {
            var jDifference = pos.j - coord.j;
            var eatingCell = { i: coord.i + 1, j: coord.j - jDifference };
            if (!isEmptyCell(eatingCell)) continue;
            coord = eatingCell;
            var secondTurnResults = getWhitePosibleCoords(eatingCell, true);
            res.push(...secondTurnResults);
        }
        res.push(coord)
    }
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
        var coord = { i: pos.i - 1, j: j }
        if (j === pos.j) continue;
        if (secondMove && isEmptyCell(coord)) continue;
        if (!isEmptyCell(coord) && isFriendlyCell(coord)) continue;
        if (!isEmptyCell(coord) && !isFriendlyCell(coord)) {
            var jDifference = pos.j - coord.j;
            var eatingCell = { i: coord.i - 1, j: coord.j - jDifference };
            if (!isEmptyCell(eatingCell)) continue;
            coord = eatingCell;
            var secondTurnResults = getBlackPosibleCoords(eatingCell, true);
            res.push(...secondTurnResults);
        }
        res.push(coord)
    }
    return res;
}

function getWhitePosibleCoords(pos, secondMove = false) {
    var res = [];
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
        var coord = { i: pos.i + 1, j: j }
        if (j === pos.j) continue;
        if (secondMove && isEmptyCell(coord)) continue;
        if (!isEmptyCell(coord) && isFriendlyCell(coord)) continue;
        if (!isEmptyCell(coord) && !isFriendlyCell(coord)) {
            var jDifference = pos.j - coord.j;
            var eatingCell = { i: coord.i + 1, j: coord.j - jDifference };
            if (!isEmptyCell(eatingCell)) continue;
            coord = eatingCell;
            var secondTurnResults = getWhitePosibleCoords(eatingCell, true);
            res.push(...secondTurnResults);
        }
        res.push(coord)
    }
    return res;
}

function getBlackPosibleCoords(pos, secondMove = false) {
    var res = [];
    for (var j = pos.j - 1; j <= pos.j + 1; j++) {
        var coord = { i: pos.i - 1, j: j }
        if (j === pos.j) continue;
        if (secondMove && isEmptyCell(coord)) continue;
        if (!isEmptyCell(coord) && isFriendlyCell(coord)) continue;
        if (!isEmptyCell(coord) && !isFriendlyCell(coord)) {
            var jDifference = pos.j - coord.j;
            var eatingCell = { i: coord.i - 1, j: coord.j - jDifference };
            if (!isEmptyCell(eatingCell)) continue;
            coord = eatingCell;
            var secondTurnResults = getBlackPosibleCoords(eatingCell, true);
            res.push(...secondTurnResults);
        }
        res.push(coord)
    }
    return res;
}
function movePiece(elFromCell, elToCell) {
    // update the MODEl, update the DOM
    var fromCoord = getCellCoord(elFromCell.id);
    var toCoord = getCellCoord(elToCell.id);
    var hasEaten = false;

    if ((fromCoord.j - toCoord.j === 2 || fromCoord.j - toCoord.j == -2) && (fromCoord.i - toCoord.i === 2 || fromCoord.i - toCoord.i == -2)) {
        var eatenPieceCoord = { i: fromCoord.i - (fromCoord.i - toCoord.i) / 2, j: fromCoord.j - (fromCoord.j - toCoord.j) / 2 };
        gBoard[eatenPieceCoord.i][eatenPieceCoord.j] = '';
        renderCell(eatenPieceCoord, '');
        hasEaten = true;
    }
    // updating the model:
    gBoard[toCoord.i][toCoord.j] = gBoard[fromCoord.i][fromCoord.j];
    gBoard[fromCoord.i][fromCoord.j] = '';

    // updating the dom:
    renderCell(fromCoord, gBoard[fromCoord.i][fromCoord.j]);
    renderCell(toCoord, gBoard[toCoord.i][toCoord.j]);

    if (toCoord.i === 7 && gBoard[toCoord.i][toCoord.j] === White_Piece) {
        gBoard[toCoord.i][toCoord.j] = Queen_White_Piece;
        renderCell(toCoord, Queen_White_Piece);
    }
    if (toCoord.i === 0 && gBoard[toCoord.i][toCoord.j] === Black_Piece) {
        gBoard[toCoord.i][toCoord.j] = Queen_Black_Piece;
        renderCell(toCoord, Queen_Black_Piece);
    }
    return hasEaten;
}

function renderCell(coord, htmlStr) {
    var selector = getSelector(coord);
    document.querySelector(selector).innerHTML = htmlStr;
}

function markCells(coords) {
    for (var i = 0; i < coords.length; i++) {
        var selector = getSelector(coords[i]);
        var elCell = document.querySelector(selector);
        elCell.classList.add('mark');
    }
}
function getCellCoord(strCellId) {
    var coord = {};
    var parts = strCellId.split('-');
    coord.i = +parts[1];
    coord.j = +parts[2];
    return coord;
}

function cleanBoard() {
    var elTds = document.querySelectorAll('.mark, .selected');
    for (var i = 0; i < elTds.length; i++) {
        elTds[i].classList.remove('mark', 'selected');
    }
}
function isEmptyCell(coord) {
    return gBoard[coord.i] && gBoard[coord.i][coord.j] === '';
}

function isFriendlyCell(coord) {
    return gBoard[coord.i] && gBoard[coord.i][coord.j] === currentTurn;
}

// input: {i: 7, j: 0} || output: '#cell-7-0';
function getSelector(coord) {
    return '#cell-' + coord.i + '-' + coord.j;
}



