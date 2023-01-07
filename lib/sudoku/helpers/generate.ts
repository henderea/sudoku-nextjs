import { Dict, SudokuConfig, SudokuMeta } from './config';
import { forceRange, stripDups, randRange, shuffle } from './utils';
import { solve, getCandidatesMap, assign } from './solve';

const config: SudokuConfig = SudokuConfig.instance;
const meta: SudokuMeta = SudokuMeta.instance;

export const DIFFICULTIES = {
    easy: 62,
    medium: 53,
    hard: 44,
    veryHard: 35,
    insane: 26,
    inhuman: 17
} as const;

export type DIFFICULTY = keyof typeof DIFFICULTIES;

// Generate
// -------------------------------------------------------------------------
export function generate(difficulty: DIFFICULTY | number, unique: boolean = true): string {
    /*
      Generate a new Sudoku puzzle of a particular `difficulty`, e.g.,
    
        // Generate an 'easy' sudoku puzzle
        sudoku.generate('easy');
        
    
      Difficulties are as follows, and represent the number of given squares:
    
            'easy':         61
            'medium':       52
            'hard':         43
            'very-hard':    34
            'insane':       25
            'inhuman':      17
        
        
      You may also enter a custom number of squares to be given, e.g.,
    
        // Generate a new Sudoku puzzle with 60 given squares
        sudoku.generate(60)


      `difficulty` must be a number between 17 and 81 inclusive. If it's
      outside of that range, `difficulty` will be set to the closest bound,
      e.g., 0 -> 17, and 100 -> 81.
    
    
      By default, the puzzles are unique, unless you set `unique` to false. 
      (Note: Puzzle uniqueness is not yet implemented, so puzzles are *not* 
      guaranteed to have unique solutions)
    
      TODO: Implement puzzle uniqueness
    */

    // If `difficulty` is a string or undefined, convert it to a number or
    // default it to 'easy' if undefined.
    let effectiveDifficulty: number = 0;
    if(typeof difficulty == 'string' && difficulty in DIFFICULTIES) {
        effectiveDifficulty = DIFFICULTIES[difficulty] || DIFFICULTIES.easy;
    } else if(typeof difficulty == 'number') {
        effectiveDifficulty = difficulty;
    }
    if(!effectiveDifficulty || effectiveDifficulty <= 0) {
        effectiveDifficulty = DIFFICULTIES.easy;
    }

    // Force effectiveDifficulty between 17 and 81 inclusive
    effectiveDifficulty = forceRange(effectiveDifficulty, config.nrSquares, config.minGivens);

    // Get a set of squares and all possible candidates for each square
    let blankBoard: string = '';
    for(let i: number = 0; i < config.nrSquares; i++) {
        blankBoard += config.blankChar;
    }
    let candidates: Dict<string> | false = getCandidatesMap(blankBoard);

    // For each item in a shuffled list of squares
    let shuffledSquares: string[] = shuffle(meta.squares);
    for(let i in shuffledSquares) {
        const square: string = shuffledSquares[i];

        // If an assignment of a random chioce causes a contradictoin, give
        // up and try again
        const randCandidateIdx = randRange(candidates[square].length);
        const randCandidate: string = candidates[square][randCandidateIdx];
        if(!assign(candidates, square, randCandidate)) {
            break;
        }

        // Make a list of all single candidates
        const singleCandidates: string[] = [];
        meta.squares.forEach((square: string) => {
            if(candidates[square].length == 1) {
                singleCandidates.push(candidates[square]);
            }
        });

        // If we have at least effectiveDifficulty, and the unique candidate count is
        // at least 8, return the puzzle!
        if(singleCandidates.length >= effectiveDifficulty && stripDups(singleCandidates).length >= 8) {
            let board: string = '';
            let givensIdxs: number[] = [];
            meta.squares.forEach((square: string, i: number) => {
                if(candidates[square].length == 1) {
                    board += candidates[square];
                    givensIdxs.push(i);
                } else {
                    board += config.blankChar;
                }
            });

            // If we have more than `effectiveDifficulty` givens, remove some random
            // givens until we're down to exactly `effectiveDifficulty`
            const nrGivens: number = givensIdxs.length;
            if(nrGivens > effectiveDifficulty) {
                givensIdxs = shuffle(givensIdxs);
                for(let i: number = 0; i < nrGivens - effectiveDifficulty; i++) {
                    const target: number = givensIdxs[i];
                    board = `${board.slice(0, target)}${config.blankChar}${board.slice(target + 1)}`;
                }
            }

            // Double check board is solvable
            // TODO: Make a standalone board checker. Solve is expensive.
            if(solve(board)) {
                return board;
            }
        }
    }

    // Give up and try a new puzzle
    return generate(difficulty, unique);
};

