import type { Square } from './Square';
import { _times, getRowColFromRegionSubIndex } from './utils';

export type UniquenessResult = 'unique' | 'not-unique' | 'no-solution';

function testUniqueness(grid: Grid): UniquenessResult {
    // Find untouched location with most information
    let rowp: number = 0;
    let colp: number = 0;
    let mp: number[] | null = null;
    let cmp: number = 10;

    _times(9, (row: number) => {
        _times(9, (col: number) => {
            const cell: Square = grid.getRC(row, col);
            // Is this spot unused?
            if(cell.value == 0) {
                // Set M of possible solutions
                let m: number[] = _times(10);

                // Remove used numbers in the vertical direction
                _times(9, (a: number) => m[grid.getRC(a, col).value] = 0);

                // Remove used numbers in the horizontal direction
                _times(9, (b: number) => m[grid.getRC(row, b).value] = 0);

                // Remove used numbers in the sub square
                const squareIndex: number = cell.region;
                _times(9, (c: number) => m[grid.getRS(squareIndex, c + 1).value] = 0);

                // Calculate cardinality of M
                const cm: number = m.filter((d: number) => d > 0).length;

                // Is there more information in this spot than in the best yet?
                if(cm < cmp) {
                    cmp = cm;
                    mp = m;
                    colp = col;
                    rowp = row;
                }
            }
        });
    });

    // Finished?
    if(cmp == 10 || !mp) { return 'unique'; }

    // Couldn't find a solution?
    if(cmp == 0) { return 'no-solution'; }

    // Try elements
    let success: number = 0;
    for(let i: number = 1; i < 10; i++) {
        if(mp[i] != 0) {
            grid.getRC(rowp, colp).value = mp[i];

            switch(testUniqueness(grid)) {
                case 'unique':
                    success++;
                    break;
                case 'not-unique':
                    return 'not-unique';
                default:
                    // ignored
                    break;
            }
        }
    }

    if(success > 1) {
        return 'not-unique';
    }

    grid.getRC(rowp, colp).value = 0;

    switch(success) {
        case 0: return 'no-solution';
        case 1: return 'unique';
        default: return 'not-unique';
    }
}

export class Grid {
    private readonly _squares: Square[];

    constructor(squares: Square[], copySquares: boolean = true) {
        this._squares = squares.map((s: Square) => copySquares ? s.copy(): s);
    }
    private get squares(): Square[] { return this._squares; }
    get(index: number): Square { return this.squares[index]; }
    getRC(row: number, column: number): Square { return this.get(row * 9 + column); }
    getRS(region: number, subIndex: number): Square { 
        const [row, col] = getRowColFromRegionSubIndex(region, subIndex);
        return this.getRC(row - 1, col - 1);
    }

    copy(): Grid { return new Grid(this.squares, true); }

    get uniqueness(): UniquenessResult { return testUniqueness(this.copy()); }

    get spotCount(): number {
        return this.squares.filter((s: Square) => s && s.value > 0).length;
    }

    toString(): string {
        const border: string = '+-----+-----+-----+';
        let str: string = '';
        _times(9, (i: number) => {
            if(i % 3 == 0) { str += border + '\n'; }
            _times(9, (j: number) => {
                str += (j % 3 == 0 ? '|' : ' ');
                const value: number = this.getRC(i, j).value;
                str += (value == 0 ? '.' : `${value}`);
            });
            str += '|\n';
        });
        str += border;
        return str;
    }

    toMatrix(): number[][] {
        const matrix: number[][] = _times(9, () => _times(9, () => 0));
        this.squares.forEach((square: Square) => matrix[square.down - 1][square.across - 1] = square.value);
        return matrix;
    }

    get values(): number[] {
        return this.squares.map((s: Square) => s.value);
    }
}
