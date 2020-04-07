export var Cell = {
    Wall: {index: 0, symbol: '#'},
    Empty: {index: 1, symbol: '.'}
};

export class Map {
    private readonly map: Array<any[]>;
    public readonly height: number;
    public readonly width: number;

    constructor(map: Array<any[]>, height: number, width: number) {
        this.map = map;
        this.height = height;
        this.width = width;
    }

    public static fromStrings(strings: string[]) {
        let height = strings.length;
        let width = strings[0].length;
        let map = new Array(height);

        for (let i = 0; i < height; i++) {
            map[i] = Array.from(strings[i].split('').map(c => c === '#' ? Cell.Wall : Cell.Empty));
        }

        return new Map(map, height, width);
    }

    public inBound(y: number, x: number): boolean {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }

    public at(y: number, x: number): any {
        return this.map[y][x];
    }
}
