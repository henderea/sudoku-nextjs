import fs from 'fs';
import path from 'path';
import { formatTime } from '../lib/sudoku/utils'
import { generateAllGenericGrids, Difficulty } from '../lib/sudoku/generate';

// let s1 = square(1, 1);
// let s2 = square(10, 1);
// console.log(s1.aligns(s2), s1.value, s2.value, s1.across, s2.across, s1.down, s2.down, s1.region, s2.region);

const dirname: string = __dirname;

const outPath: string = path.join(dirname, '../public/boards.json')

const generatedGrids = generateAllGenericGrids({ easy: 300, medium: 300, hard: 300 }, true);

const logDifficultyStats = (difficulty: Difficulty) => {
    console.log(`${difficulty}: ${generatedGrids[difficulty].grids.length} (${formatTime(generatedGrids[difficulty].duration)})`);
}

console.log('\n');

logDifficultyStats('easy');
logDifficultyStats('medium');
logDifficultyStats('hard');

const grids = {
    easy: generatedGrids.easy.grids,
    medium: generatedGrids.medium.grids,
    hard: generatedGrids.hard.grids
};

const output = JSON.stringify(grids);

fs.writeFileSync(outPath, output);

console.log('\n');
