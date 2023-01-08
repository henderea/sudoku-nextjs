import { _rand, _shuffleCopy } from './utils';

import { Square, square } from './Square';
import { Grid } from './Grid';

const numberToGeneric: string[] = ['-','a','b','c','d','e','f','g','h','i'];

export function toGenericGrid(grid: Grid): string {
    return grid.values.map((v: number) => numberToGeneric[v]).join('');
}

export function exportGenericGrid(full: Grid, grid: Grid): { full: string, grid: string } {
    return {
        full: toGenericGrid(full),
        grid: toGenericGrid(grid)
    };
}

export function fromGenericGrid(grid: string, mappings: string[]) {
    let values: Square[] = Array.from(grid).map((c: string, i: number) => square(i, mappings.indexOf(c)));
    return new Grid(values, false);
}

export function importGenericGrid(full: string, grid: string): { full: Grid, grid: Grid } {
    const mappings: string[] = _shuffleCopy(numberToGeneric);
    return {
        full: fromGenericGrid(full, mappings),
        grid: fromGenericGrid(grid, mappings)
    };
}
