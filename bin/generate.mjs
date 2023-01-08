import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { generateAllGenericGrids } from '../lib/sudoku/generate';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const outPath = path.join(dirname, '../public/boards.json')

const generatedGrids = generateAllGenericGrids({ easy: 500, medium: 500, hard: 500 });

const logDifficultyStats = (generatedGrids, difficulty) => {
    console.log(`${difficulty}: ${generatedGrids[difficulty].grids.length} (${generatedGrids[difficulty].duration} ms)`);
}

logDifficultyStats(generatedGrids, 'easy');
logDifficultyStats(generatedGrids, 'medium');
logDifficultyStats(generatedGrids, 'hard');

const grids = {
    easy: generatedGrids.easy.grids,
    medium: generatedGrids.medium.grids,
    hard: generatedGrids.hard.grids
};

const output = JSON.stringify(grids);

fs.writeFileSync(outPath, output);
