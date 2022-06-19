// Conversions
// -------------------------------------------------------------------------
export function boardStringToGrid(boardString: string): string[][] {
    /* Convert a board string to a two-dimensional array */
    const rows: string[][] = [];
    let curRow: string[] = [];
    for(let i: number = 0; i < boardString.length; i++) {
        curRow.push(boardString[i]);
        if(i % 9 == 8) {
            rows.push(curRow);
            curRow = [];
        }
    }
    return rows;
};

export function boardGridToString(boardGrid: string[][]): string {
    /* Convert a board grid to a string */
    return boardGrid.map((r: string[]) => r.join('')).join('');
};

