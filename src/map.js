export var Cell = {
    Wall: {index: 0, symbol: '#'},
    Empty: {index: 1, symbol: '.'}
}

export class Map {
    constructor(map, height, width) {
        this.map = map;
        this.height = height;
        this.width = width;
    }

    static fromStrings(strings) {
        let height = strings.length;
        let width = strings[0].length;
        let map = new Array(height);

        for (let i = 0; i < height; i++) {
            map[i] = Array.from(strings[i].split('').map(c => c === '#' ? Cell.Wall : Cell.Empty));
        }

        return new Map(map, height, width);
    }

    inBound(y, x) {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }

    at(y, x) {
        return this.map[y][x];
    }    
}
