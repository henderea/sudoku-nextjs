import { Dict, SudokuConfig, SudokuMeta } from './config';
import { getSquareValsMap } from './relationships';
import { contains, validateBoard } from './utils';

const config: SudokuConfig = SudokuConfig.instance;
const meta: SudokuMeta = SudokuMeta.instance;

// Solve
// -------------------------------------------------------------------------
export function solve(board: string, reverse: boolean = false): string | false {
    /*
      Solve a sudoku puzzle given a sudoku `board`, i.e., an 81-character 
      string of sudoku.DIGITS, 1-9, and spaces identified by '.', representing the
      squares. There must be a minimum of 17 givens. If the given board has no
      solutions, return false.

      Optionally set `reverse` to solve 'backwards', i.e., rotate through the
      possibilities in reverse. Useful for checking if there is more than one
      solution.
    */

    // Assure a valid board
    const validation: string | true = validateBoard(board);
    if(validation !== true) {
        throw validation;
    }

    // Check number of givens is at least MIN_GIVENS
    let nrGivens: number = 0;
    for(let i: number = 0; i < board.length; i++) {
        if(board[i] !== config.blankChar && contains(config.digits, board[i])) {
            nrGivens++;
        }
    }
    if(nrGivens < config.minGivens) {
        throw `Too few givens. Minimum givens is ${config.minGivens}`;
    }

    const candidates: Dict<string> | false = getCandidatesMap(board);
    const result: Dict<string> | false = search(candidates, reverse);

    if(result) {
        return meta.squares.map((square: string) => result[square]).join('');
    }
    return false;
};

export function getCandidates(board: string): string[][] | false {
    /*
      Return all possible candidatees for each square as a grid of 
      candidates, returnning `false` if a contradiction is encountered.
    
      Really just a wrapper for sudoku._get_candidates_map for programmer
      consumption.
    */

    // Assure a valid board
    const validation = validateBoard(board);
    if(validation !== true) {
        throw validation;
    }

    // Get a candidates map
    const candidatesMap: Dict<string> | false = getCandidatesMap(board);

    // If there's an error, return false
    if(!candidatesMap) {
        return false;
    }

    // Transform candidates map into grid
    const rows: string[][] = [];
    let curRow: string[] = [];
    let i: number = 0;
    for(let square in candidatesMap) {
        let candidates: string = candidatesMap[square];
        curRow.push(candidates);
        if(i % 9 == 8) {
            rows.push(curRow);
            curRow = [];
        }
        i++;
    }
    return rows;
}

export function getCandidatesMap(board: string): Dict<string> | false {
    /*
      Get all possible candidates for each square as a map in the form
      {square: sudoku.DIGITS} using recursive constraint propagation. Return `false` 
      if a contradiction is encountered
    */

    // Assure a valid board
    const validation = validateBoard(board);
    if(validation !== true) {
        throw validation;
    }

    const candidateMap: Dict<string> = {};
    const squaresValuesMap: Dict<string> = getSquareValsMap(board);

    // Start by assigning every digit as a candidate to every square
    for(let i in meta.squares) {
        candidateMap[meta.squares[i]] = config.digits;
    }

    // For each non-blank square, assign its value in the candidate map and
    // propigate.
    for(let square in squaresValuesMap) {
        const val: string = squaresValuesMap[square];

        if(contains(config.digits, val)) {
            var newCandidates = assign(candidateMap, square, val);

            // Fail if we can't assign val to square
            if(!newCandidates) {
                return false;
            }
        }
    }

    return candidateMap;
};

function copyCandidates(candidates: Dict<string>): Dict<string> {
    const rv: Dict<string> = {};
    for(let k in candidates) {
        rv[`${k}`] = `${candidates[k]}`;
    }
    return rv;
}

export function search(candidates: Dict<string> | false, reverse: boolean = false): Dict<string> | false {
    /*
      Given a map of squares -> candiates, using depth-first search, 
      recursively try all possible values until a solution is found, or false
      if no solution exists. 
    */

    // Return if error in previous iteration
    if(!candidates) {
        return false;
    }

    // If only one candidate for every square, we've a solved puzzle!
    // Return the candidates map.
    let maxNrCandidates: number = 0;
    let maxCandidatesSquare: string | null = null;
    meta.squares.forEach((square: string) => {
        const nrCandidates = candidates[square].length;

        if(nrCandidates > maxNrCandidates) {
            maxNrCandidates = nrCandidates;
            maxCandidatesSquare = square;
        }
    });
    if(maxNrCandidates === 1) {
        return candidates;
    }

    // Choose the blank square with the fewest possibilities > 1
    let minNrCandidates: number = 10;
    let minCandidatesSquare: string | null = null;
    meta.squares.forEach((square: string) => {
        const nrCandidates: number = candidates[square].length;

        if(nrCandidates < minNrCandidates && nrCandidates > 1) {
            minNrCandidates = nrCandidates;
            minCandidatesSquare = square;
        }
    });

    // Recursively search through each of the candidates of the square 
    // starting with the one with fewest candidates.

    // Rotate through the candidates forwards
    const minCandidates: string = candidates[minCandidatesSquare];
    if(!reverse) {
        for(let i: number = 0; i < minCandidates.length; i++) {
            const val: string = minCandidates[i];

            // TODO: Implement a non-rediculous deep copy function
            const candidatesCopy: Dict<string> = copyCandidates(candidates);
            const candidatesNext: Dict<string> | false = search(
                assign(candidatesCopy, minCandidatesSquare, val)
            );

            if(candidatesNext) {
                return candidatesNext;
            }
        }
    } else {
        // Rotate through the candidates backwards
        for(var i = minCandidates.length - 1; i >= 0; i--) {
            const val: string = minCandidates[i];

            // TODO: Implement a non-rediculous deep copy function
            const candidatesCopy: Dict<string> = copyCandidates(candidates);
            const candidatesNext: Dict<string> | false = search(
                assign(candidatesCopy, minCandidatesSquare, val),
                reverse
            );

            if(candidatesNext) {
                return candidatesNext;
            }
        }
    }

    // If we get through all combinations of the square with the fewest
    // candidates without finding an answer, there isn't one. Return false.
    return false;
};

export function assign(candidates: Dict<string> | false, square: string, val: string): Dict<string> | false {
    /*
      Eliminate all values, *except* for `val`, from `candidates` at 
      `square` (candidates[square]), and propagate. Return the candidates map
      when finished. If a contradiciton is found, return false.
    
      WARNING: This will modify the contents of `candidates` directly.
    */

    if(!candidates) { return false; }

    // Grab a list of canidates without 'val'
    var otherVals = candidates[square].replace(val, '');

    // Loop through all other values and eliminate them from the candidates 
    // at the current square, and propigate. If at any point we get a 
    // contradiction, return false.
    for(let i: number = 0; i < otherVals.length; i++) {
        const otherVal: string = otherVals[i];

        var candidatesNext = eliminate(candidates, square, otherVal);

        if(!candidatesNext) {
            //console.log('Contradiction found by _eliminate.');
            return false;
        }
    }

    return candidates;
};

export function eliminate(candidates: Dict<string>, square: string, val: string): Dict<string> | false {
    /*
      Eliminate `val` from `candidates` at `square`, (candidates[square]),
      and propagate when values or places <= 2. Return updated candidates,
      unless a contradiction is detected, in which case, return false.
    
      WARNING: This will modify the contents of `candidates` directly.
    */

    // If `val` has already been eliminated from candidates[square], return
    // with candidates.
    if(!contains(candidates[square], val)) {
        return candidates;
    }

    // Remove `val` from candidates[square]
    candidates[square] = candidates[square].replace(val, '');

    // If the square has only candidate left, eliminate that value from its 
    // peers
    var nrCandidates = candidates[square].length;
    if(nrCandidates === 1) {
        var targetVal = candidates[square];

        const squarePeers: string[] = meta.squarePeersMap[square];
        for(let i in squarePeers) {
            const peer: string = squarePeers[i];
            const candidatesNew = eliminate(candidates, peer, targetVal);

            if(!candidatesNew) {
                return false;
            }
        }
    } else if(nrCandidates === 0) {
        // Otherwise, if the square has no candidates, we have a contradiction.
        // Return false.
        return false;
    }

    // If a unit is reduced to only one place for a value, then assign it
    const squareUnits: string[][] = meta.squareUnitsMap[square];
    for(let ui in squareUnits) {
        const unit: string[] = squareUnits[ui];

        var valPlaces = [];
        for(let si in unit) {
            const unitSquare: string = unit[si];
            if(contains(candidates[unitSquare], val)) {
                valPlaces.push(unitSquare);
            }
        }

        // If there's no place for this value, we have a contradition!
        // return false
        if(valPlaces.length === 0) {
            return false;
        } else if(valPlaces.length === 1) {
            // Otherwise the value can only be in one place. Assign it there.
            var candidatesNew = assign(candidates, valPlaces[0], val);

            if(!candidatesNew) {
                return false;
            }
        }
    }

    return candidates;
};

