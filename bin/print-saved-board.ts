import fs from 'fs';
import path from 'path';

import { importGenericGrid } from '../lib/sudoku/exportImport';

const dirname: string = __dirname;

const inPath: string = path.join(dirname, '../public/boards.json')

const data: { easy: Array<{ full: string, grid: string }>, medium: Array<{ full: string, grid: string }>, hard: Array<{ full: string, grid: string }> } = JSON.parse(fs.readFileSync(inPath, { encoding: 'utf8' }));

if(process.argv.length < 4) {
    console.log('Usage: print-saved-board DIFFICULTY INDEX');
    process.exit(1);
}

const difficulty: string = process.argv[2];
const index: number = parseInt(process.argv[3]);

function printGrids(value: { full: string, grid: string } | undefined): void {
    if(!value) {
        console.log(`Invalid index ${index}`);
        process.exit(1);
    }
    const { full, grid } = importGenericGrid(value.full, value.grid);
    process.stdout.write(`FULL:\n${full.toString()}\n\nGRID (${grid.spotCount}):\n${grid.toString()}\n\n`);
}

if(difficulty == 'e' || difficulty == 'easy') {
    printGrids(data.easy[index]);
} else if(difficulty == 'm' || difficulty == 'medium') {
    printGrids(data.medium[index]);
} else if(difficulty == 'h' || difficulty == 'hard') {
    printGrids(data.hard[index]);
} else {
    console.log(`Unknown difficulty ${difficulty}`);
    process.exit(1);
}
