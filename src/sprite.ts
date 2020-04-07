export class Sprite {
    private readonly text: string;
    public readonly width: number;
    public readonly height: number;

    constructor(text: string, width: number, height: number) {
        this.text = text;
        this.width = width;
        this.height = height;
    }

    public static load(name: string, width: number, height: number): Promise<Sprite> {
        return fetch('build/sprites/' + name + '.txt')
            .then(response => response.text())
            .then(text => {
                console.log(text);
                let stripped = text.replace(/(\r\n|\n|\r)/gm, '');
                return new Sprite(stripped, width, height);
            });
    }

    public sample(x: number, y: number): string {
        let pixelX = Math.floor(x * this.width);
        let pixelY = Math.floor(y * this.height);

        return this.text[pixelY * this.width + pixelX];
    }
}
