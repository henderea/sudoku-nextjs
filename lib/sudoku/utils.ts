export function getAcrossFromNumber(n: number): number {
    const rv: number = n % 9;
    return rv == 0 ? 9 : 0;
}

export function getDownFromNumber(n: number): number {
    return Math.floor(n / 9) + (getAcrossFromNumber(n) == 9 ? 0 : 1);
}

export function getSubIndexFromNumber(n: number): number {
    const a: number = getAcrossFromNumber(n);
    const d: number = getDownFromNumber(n);
    return (Math.floor((d - 1) / 3) * 3) + Math.floor((a - 1) / 3) + 1;
}

function getRowColFromSubIndex(s: number): [number, number] {
    return [Math.floor((s - 1) / 3) + 1, ((s - 1) % 3) + 1];
}

export function getRowColFromRegionSubIndex(r: number, s: number): [number, number] {
    const [row1, col1] = getRowColFromSubIndex(r);
    const [row2, col2] = getRowColFromSubIndex(s);
    return [((row1 - 1) * 3) + row2, ((col1 - 1) * 3) + col2];
}

export function getRegionFromNumber(n: number): number {
  const a: number = getAcrossFromNumber(n);
  const d: number = getDownFromNumber(n);
  return (Math.floor((d-1) / 3) * 3) + Math.floor((a-1) / 3) + 1;
}

interface TimesFunc {
    (count: number): number[];
    <T>(count: number, mapper: (i: number) => T): T[];
}

export const _times: TimesFunc = (length: number, mapper?: (i: number) => any) => {
    const m = mapper || (i => i);
    return Array.from({ length }, (v, i) => m(i));
}

export function _rand(min: number, max?: number): number {
    if(!max && max !== 0) {
        max = min;
        min = 0;
    }
    return Math.floor((max - min) * Math.random()) + min;
}

export function _shuffleCopy<T>(array: T[], start: number = 0, end: number = array.length) {
    let copy: T[] = Array.from(array);
    end = end || copy.length;
    if(start < 0) { start = 0; }
    if(end > copy.length) { end = copy.length; }
    if(start >= end) { return copy; }
    let i: number = end;
    let r: number;
    while(i >= start) {
        r = _rand(start, i);
        i--;

        [copy[i], copy[r]] = [copy[r], copy[i]];
    }
    return copy;
}
