export type Dict<T> = { [key: string]: T; };

export class SudokuConfig {
    static readonly instance: SudokuConfig = new SudokuConfig();
    private _digits: string = '123456789';
    private _blankChar: string = '.';
    private readonly _rows: string = 'ABCDEFGHI';
    private readonly _cols: string = '123456789';
    private readonly _nrSquares: number = 81;
    private readonly _minGivens: number = 17;

    private constructor() { }

    get digits(): string { return this._digits; }
    set digits(value: string) { this._digits = value; }
    get blankChar(): string { return this._blankChar; }
    set blankChar(value: string) { this._blankChar = value.charAt(0); }
    get rows(): string { return this._rows; }
    get cols(): string { return this._cols; }
    get nrSquares(): number { return this._nrSquares; }
    get minGivens(): number { return this._minGivens; }
    get blankBoard(): string { return this.blankChar.repeat(this.nrSquares); }
}

const config: SudokuConfig = SudokuConfig.instance;

export class SudokuMeta {
    private static _instance: SudokuMeta | null = null;
    static get instance(): SudokuMeta {
        if(SudokuMeta._instance) {
            return SudokuMeta._instance;
        }
        throw 'Not Initialized';
    }

    static initialize(cross: (a: string | string[], b: string | string[]) => string[], getAllUnits: (rows: string | string[], cols: string | string[]) => string[][], getSquareUnitsMap: (squares: string[], units: string[][]) => Dict<string[][]>, getSquarePeersMap: (squares: string[], unitsMap: Dict<string[][]>) => Dict<string[]>): void {
        if(SudokuMeta._instance) { return; }
        const squares: string[] = cross(config.rows, config.cols);
        const units: string[][] = getAllUnits(config.rows, config.cols);
        const squareUnitsMap = getSquareUnitsMap(squares, units);
        const squarePeersMap = getSquarePeersMap(squares, squareUnitsMap);
        SudokuMeta._instance = new SudokuMeta(squares, units, squareUnitsMap, squarePeersMap);
    }

    private readonly _squares: string[];
    private readonly _units: string[][];
    private readonly _squareUnitsMap: Dict<string[][]>;
    private readonly _squarePeersMap: Dict<string[]>;

    private constructor(squares: string[], units: string[][], squareUnitsMap: Dict<string[][]>, squarePeersMap: Dict<string[]>) {
        this._squares = squares;
        this._units = units;
        this._squareUnitsMap = squareUnitsMap;
        this._squarePeersMap = squarePeersMap;
    }

    get squares(): string[] { return this._squares; }
    get units(): string[][] { return this._units; }
    get squareUnitsMap(): Dict<string[][]> { return this._squareUnitsMap; }
    get squarePeersMap(): Dict<string[]> { return this._squarePeersMap; }
}

