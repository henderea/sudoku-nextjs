import { Dict, SudokuMeta } from './config';
import { ensureArray, contains, cross } from './utils';

const meta: SudokuMeta = SudokuMeta.instance;

// Square relationships
// -------------------------------------------------------------------------
// Squares, and their relationships with values, units, and peers.

export function getSquareValsMap(board: string | string[]): Dict<string> {
    /* Return a map of squares -> values */
    const squaresValsMap: Dict<string> = {};

    // Make sure `board` is a string of length 81
    if(board.length != meta.squares.length) {
        throw 'Board/squares length mismatch.';

    } else {
        meta.squares.forEach((square: string, i: number) => {
            squaresValsMap[square] = board[i];
        });
    }

    return squaresValsMap;
};

export function getSquareUnitsMap(squares: string[], units: string[][]): Dict<string[][]> {
    /* Return a map of `squares` and their associated units (row, col, box) */
    const squareUnitMap: Dict<string[][]> = {};

    // For every square...
    squares.forEach((curSquare: string) => {
        const curSquareUnits: string[][] = [];
        units.forEach((curUnit: string[]) => {
            if(contains(curUnit, curSquare)) {
                curSquareUnits.push(curUnit);
            }
        });

        squareUnitMap[curSquare] = curSquareUnits;
    });

    return squareUnitMap;
};

export function getSquarePeersMap(squares: string[], unitsMap: Dict<string[][]>): Dict<string[]> {
    /*
      Return a map of `squares` and their associated peers, i.e., a set of
      other squares in the square's unit.
    */
    const squarePeersMap: Dict<string[]> = {};

    // For every square...
    squares.forEach((curSquare: string) => {
        const curSquareUnits: string[][] = unitsMap[curSquare];
        const curSquarePeers: string[] = [];

        curSquareUnits.forEach((curSquareUnit: string[]) => {
            curSquareUnit.forEach((curUnit: string) => {
                if(contains(curSquarePeers, curUnit) && curUnit !== curSquare) {
                    curSquarePeers.push(curUnit);
                }
            });
        });

        squarePeersMap[curSquare] = curSquarePeers;
    });

    return squarePeersMap;
};

export function getAllUnits(rows: string | string[], cols: string | string[]): string[][] {
    /* Return a list of all units (rows, cols, boxes) */
    const units: string[][] = [];

    const rowList: string[] = ensureArray(rows);
    const colList: string[] = ensureArray(cols);

    // Rows
    rowList.forEach((row) => {
        units.push(cross(row, cols));
    });

    // Columns
    colList.forEach((col) => {
        units.push(cross(rows, col));
    });

    // Boxes
    const rowSquares: string[] = ['ABC', 'DEF', 'GHI'];
    const colSquares: string[] = ['123', '456', '789'];
    rowSquares.forEach((rowSquare) => {
        colSquares.forEach((colSquare) => {
            units.push(cross(rowSquare, colSquare));
        });
    });

    return units;
};

