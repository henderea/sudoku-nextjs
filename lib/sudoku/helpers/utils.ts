import { SudokuConfig } from './config';

const config: SudokuConfig = SudokuConfig.instance;

// Utilities
// -------------------------------------------------------------------------

export function forceRange(n: number, max: number, min: number = 0): number {
    n = n || 0;
    if(n < min) { return min; }
    if(n > max) { return max; }
    return n;
}

export function ensureArray(seq: string | string[]): string[] {
    if(Array.isArray(seq)) { return seq; }
    return seq.split('');
}

export function stripDups(seq: string | string[]): string[] {
    /* Strip duplicate values from `seq` */
    seq = ensureArray(seq);
    const rv = [];
    const dupMap = {};
    seq.forEach(v => {
        if(!dupMap[v]) {
            rv.push(v);
            dupMap[v] = true;
        }
    });
    return rv;
};

export function randRange(max: number, min: number = 0): number {
    /*
      Get a random integer in the range of `min` to `max` (non inclusive).
      If `min` not defined, default to 0. If `max` not defined, throw an 
      error.
    */
    min = min || 0;
    if(max) {
        return Math.floor(Math.random() * (max - min)) + min;
    } else {
        throw 'Range undefined';
    }
};

export function shuffle<T>(seq: T[]): T[] {
    /* Return a shuffled version of `seq` */

    // Create an array of the same size as `seq` filled with false
    var shuffled: Array<T | false> = [];
    for(let i: number = 0; i < seq.length; i++) {
        shuffled.push(false);
    }

    for(let i in seq) {
        let ti: number = randRange(seq.length);

        while(shuffled[ti] !== false) {
            ti = (ti + 1) % seq.length;
        }

        shuffled[ti] = seq[i];
    }

    return shuffled as T[];
};

interface HasIndexOf<T> {
    indexOf(v: T): number;
}

export function contains<V, T extends HasIndexOf<V>>(seq: T, v: V): boolean {
    /* Return if a value `v` is in sequence `seq`. */
    return seq.indexOf(v) !== -1;
};

export function cross(a: string | string[], b: string | string[]): string[] {
    /*
      Cross product of all elements in `a` and `b`, e.g.,
      sudoku._cross('abc', '123') ->
      ['a1', 'a2', 'a3', 'b1', 'b2', 'b3', 'c1', 'c2', 'c3']
    */
    const la = ensureArray(a);
    const lb = ensureArray(b);
    const result: string[] = [];
    la.forEach((va) => {
        lb.forEach((vb) => {
            result.push(`${va}${vb}`);
        });
    });
    return result;
};

export function validateBoard(board: string | string[] | null | undefined): string | true {
    /*
      Return if the given `board` is valid or not. If it's valid, return
      true. If it's not, return a string of the reason why it's not.
    */

    // Check for empty board
    if(!board) {
        return 'Empty board';
    }

    // Invalid board length
    if(board.length !== config.nrSquares) {
        return `Invalid board size. Board must be exactly ${config.nrSquares} squares.`;
    }

    board = ensureArray(board);
    // Check for invalid characters
    for(let i in board) {
        if(!contains(board[i], config.digits) && board[i] !== config.blankChar) {
            return `Invalid board character encountered at index ${i}: ${board[i]}`;
        }
    }

    // Otherwise, we're good. Return true.
    return true;
};

