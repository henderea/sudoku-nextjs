/*
    Sudoku.ts
    ---------

    A Sudoku puzzle generator and solver JavaScript library.

    based on https://github.com/robatron/sudoku.js
*/

import { SudokuConfig, SudokuMeta } from './helpers/config';
import { DIFFICULTIES, DIFFICULTY, generate } from './helpers/generate';
import { solve, getCandidates } from './helpers/solve';
import { getAllUnits, getSquareUnitsMap, getSquarePeersMap } from './helpers/relationships';
import { cross, validateBoard } from './helpers/utils';
import { boardStringToGrid, boardGridToString } from './helpers/conversions';

SudokuMeta.initialize(cross, getAllUnits, getSquareUnitsMap, getSquarePeersMap);

export class Sudoku {
    get config(): SudokuConfig { return SudokuConfig.instance; }
    get meta(): SudokuMeta { return SudokuMeta.instance; }
    get difficulties(): typeof DIFFICULTIES { return DIFFICULTIES; }
    validateBoard(board: string | string[] | null | undefined): string | true { return validateBoard(board); }
    generate(difficulty: DIFFICULTY | number, unique: boolean = true): string { return generate(difficulty, unique); }
    solve(board: string, reverse: boolean = false): string | false { return solve(board, reverse); }
    getCandidates(board: string): string[][] | false { return getCandidates(board); }
    boardStringToGrid(boardString: string): string[][] { return boardStringToGrid(boardString); }
    boardGridToString(boardGrid: string[][]): string { return boardGridToString(boardGrid); }

    /* Format a sudoku `board` for output. */
    formatBoard(board: string): string {
        // Assure a valid board
        const validation: string | true = this.validateBoard(board);
        if(validation !== true) {
            throw validation;
        }

        const V_PADDING: string = ' ';  // Insert after each square
        const H_PADDING: string = '\n'; // Insert after each row

        const V_BOX_PADDING: string = '  '; // Box vertical padding
        const H_BOX_PADDING: string = '\n'; // Box horizontal padding

        let displayString: string = '';

        for(let i: number = 0; i < board.length; i++) {
            const square: string = board[i];

            // Add the square and some padding
            displayString += square + V_PADDING;

            // Vertical edge of a box, insert v. box padding
            if(i % 3 === 2) {
                displayString += V_BOX_PADDING;
            }

            // End of a line, insert horiz. padding
            if(i % 9 === 8) {
                displayString += H_PADDING;
            }

            // Horizontal edge of a box, insert h. box padding
            if(i % 27 === 26) {
                displayString += H_BOX_PADDING;
            }
        }

        return displayString;
    };
}

