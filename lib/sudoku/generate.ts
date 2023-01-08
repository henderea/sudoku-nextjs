import { _rand, _times, formatTime } from './utils';
import { toGenericGrid } from './exportImport';

import { Square, square } from './Square';
import { Grid } from './Grid';

function r(a: number, b: number): [number, number] {
    return [a, b];
}

export type DifficultyMap<T> = {
    easy: T,
    medium: T,
    hard: T
}

const difficultySpaces: DifficultyMap<[number, number]> = {
    easy: r(35, 45),
    medium: r(30, 35),
    hard: r(25, 30)
};

export declare type Difficulty = keyof DifficultyMap<any>;

function getRandomSpacesForDifficulty(difficulty: Difficulty): number {
    const spaceRange: [number, number] = difficultySpaces[difficulty];
    return _rand(spaceRange[0], spaceRange[1]);
}

export type GenerateResult = {
    tries: number,
    success: boolean,
    duration: number,
    full: Grid,
    grid: Grid
};

export function generateDifficulty(difficulty: Difficulty): GenerateResult {
    return generate(getRandomSpacesForDifficulty(difficulty));
}

export function generate(cells: number = 81, maxTries: number = 10000): GenerateResult {
    const full: Grid = generateGrid();
    const grid: Grid = full.copy();
    let triedInds: number[] = [];
    let tries: number = 0;
    let startTime: number = Date.now();
    while(tries < maxTries) {
        tries++;
        while(grid.spotCount > cells && triedInds.length < 81) {
            let i: number = _rand(81);
            while(triedInds.includes(i) || grid.get(i).value == 0) {
                i = _rand(81);
            }
            triedInds.push(i);
            const cell: Square = grid.get(i);
            const oldValue: number = cell.value;
            cell.value = 0;
            if(grid.uniqueness != 'unique') {
                cell.value = oldValue;
            }
        }
        if(grid.spotCount == cells) {
            return { tries, success: true, duration: (Date.now() - startTime), full, grid };
        }
    }
    return { tries, success: false, duration: (Date.now() - startTime), full, grid: full.copy() };
}

export function generateGrid(): Grid {
    const squares: Square[] = _times(81, (i: number) => square(i, 0));
    const makeAvailable: () => number[] = () => [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const available: number[][] = _times(81, makeAvailable);
    let c: number = 0;
    while(c < 81) {
        if(available[c].length > 0) {
            let i: number = _rand(available[c].length);
            let z: number = available[c][i];
            let test: Square = square(c, z);
            if(hasConflict(squares, test)) {
                available[c].splice(i, 1);
            } else {
                squares[c].value = z;
                available[c].splice(i, 1);
                c++;
            }
        } else {
            available[c] = makeAvailable();
            squares[c - 1].value = 0;
            c--;
        }
    }
    return new Grid(squares, false);
}

function hasConflict(squares: Square[], test: Square): boolean {
    for(let square of squares) {
        if(test.aligns(square) && square.value == test.value) {
            return true;
        }
    }
    return false;
}

export function generateGenericGrid(difficulty: Difficulty, maxTries: number = 10): { tries: number, success: boolean, full: string, grid: string } {
    let s: boolean = false;
    let f: string = '';
    let g: string = '';
    let tries: number = 0;
    while(!s && tries < maxTries) {
        tries++;
        const { success, full, grid } = generateDifficulty(difficulty);
        s = success;
        if(s) {
            f = toGenericGrid(full);
            g = toGenericGrid(grid);
        } else {
            f = '';
            g = '';
        }
    }
    return {
        tries,
        success: s,
        full: f,
        grid: g
    };
}

export function generateGenericGrids(difficulty: Difficulty, count: number, print: boolean = false): { duration: number, grids: Array<{ full: string, grid: string }> } {
    const grids: Array<{ full: string, grid: string }> = [];
    const startTime: number = Date.now();
    for(let i: number = 0; i < count; i++) {
        const { success, full, grid } = generateGenericGrid(difficulty);
        if(success) {
            grids.push({ full, grid });
        }
        if(print) { process.stdout.write(`\r\x1b[K${difficulty} - ${i + 1} of ${count} (${formatTime(Date.now() - startTime)})`); }
    }
    return { duration: (Date.now() - startTime), grids };
}

export function generateAllGenericGrids(counts: DifficultyMap<number>, print: boolean = false): DifficultyMap<{ duration: number, grids: Array<{ full: string, grid: string}> }> {
    const easy = generateGenericGrids('easy', counts.easy, print);
    if(print) { process.stdout.write(`\r\x1b[Keasy - ${counts.easy} of ${counts.easy} (${formatTime(easy.duration)})\n`); }
    const medium = generateGenericGrids('medium', counts.medium, print);
    if(print) { process.stdout.write(`\r\x1b[Kmedium - ${counts.medium} of ${counts.medium} (${formatTime(medium.duration)})\n`); }
    const hard = generateGenericGrids('hard', counts.hard, print);
    if(print) { process.stdout.write(`\r\x1b[Khard - ${counts.hard} of ${counts.hard} (${formatTime(hard.duration)})\n`); }
    return { easy, medium, hard };
}
