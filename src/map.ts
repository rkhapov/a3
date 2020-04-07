export var Cell = {
    Wall: {index: 0, symbol: '#'},
    Empty: {index: 1, symbol: '.'},
    Skeleton: {index: 2, symbol: '@'}
};

export class MapObject {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

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
            map[i] = Array.from(strings[i].split('').map(c => Map.getCellBySymbol(c)));
        }

        return new Map(map, height, width);
    }

    private static getCellBySymbol(smb: string) {
        switch(smb) {
            case '#': return Cell.Wall;
            case '@': return Cell.Skeleton;
            default: return Cell.Empty;
        }
    }

    public getObjects(): MapObject[] {
        let objects = new Array<MapObject>();

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (this.map[i][j] === Cell.Skeleton) {
                    objects.push(new MapObject(j + 0.5, i + 0.5));
                }
            }
        }

        return objects;
    }

    public inBound(y: number, x: number): boolean {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }

    public at(y: number, x: number): any {
        return this.map[y][x];
    }
}
