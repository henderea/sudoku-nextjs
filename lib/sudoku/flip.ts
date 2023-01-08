import type { Grid } from './Grid';

import { _rand, _times } from './utils';

export type RealFlipType = 'none'  | 'flip-rows' | 'flip-columns' | 'rotate-90' | 'rotate-180' | 'rotate-270';
export type FlipType = RealFlipType | 'random';

const flipTypes: RealFlipType[] = ['none', 'flip-rows', 'flip-columns', 'rotate-90', 'rotate-180', 'rotate-270'];
function getRealFlipType(type: FlipType): RealFlipType {
    if(type == 'random') {
        return flipTypes[_rand(flipTypes.length)];
    }
    return type;
}


export function flip(full: Grid, grid: Grid, type: FlipType): { full: Grid, grid: Grid, flipType: RealFlipType } {
    const flipType: RealFlipType = getRealFlipType(type);
    return {
        full: flipGrid(full, flipType),
        grid: flipGrid(grid, flipType),
        flipType
    };
}

function flipGrid(grid: Grid, type: RealFlipType): Grid {
    switch(type) {
        case 'none': return grid.copy();
        case 'flip-rows': return modGrid(grid, r => 8 - r, c => c);
        case 'flip-columns': return modGrid(grid, r => r, c => 8 - c);
        case 'rotate-90': return modGrid(grid, (r, c) => c, (c, r) => 8 - r);
        case 'rotate-180': return modGrid(grid, r => 8 - r, c => 8 - c);
        case 'rotate-270': return modGrid(grid, (r, c) => 8 - c, (c, r) => r);
        default: return grid.copy();
    }
}

function modGrid(grid: Grid, modR: (r: number, c: number) => number, modC: (c: number, r: number) => number): Grid {
    const rv: Grid = grid.copy();
    _times(9, (r: number) => {
        _times(9, (c: number) => {
            rv.getRC(modR(r, c), modC(c, r)).value = grid.getRC(r, c).value;
        });
    });
    return rv;
}
