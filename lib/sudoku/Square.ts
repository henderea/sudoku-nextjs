import { getAcrossFromNumber, getDownFromNumber, getRegionFromNumber } from './utils';

export interface Square {
    get index(): number;
    get value(): number;
    set value(value: number);
    get across(): number;
    get down(): number;
    get region(): number;
    aligns(square: Square): boolean;
    copy(): Square;
}

class SquareImpl implements Square {
    private readonly _index: number;
    private _value: number;
    private readonly _across: number;
    private readonly _down: number;
    private readonly _region: number;

    constructor(index: number, value: number) {
        this._index = index;
        this._value = value;
        this._across = getAcrossFromNumber(index + 1);
        this._down = getDownFromNumber(index + 1);
        this._region = getRegionFromNumber(index + 1);
    }

    get index(): number { return this._index; }
    get value(): number { return this._value; }
    set value(value: number) { this._value = value; }
    get across(): number { return this._across; }
    get down(): number { return this._down; }
    get region(): number { return this._region; }
    aligns(square: Square): boolean {
        return square.value > 0 && this.value > 0 && ((square.across != 0 && square.across == this.across) || (square.down != 0 && square.down == this.down) || (square.region != 0 && square.region == this.region));
    }
    copy(): Square { return new SquareImpl(this.index, this.value); }
}

export function square(index: number, value: number): Square { return new SquareImpl(index, value); }
