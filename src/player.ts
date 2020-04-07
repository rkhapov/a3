export class Player {
    public x: number;
    public y: number;
    public viewAngle: number;
    public fov: number;
    public viewDepth: number;

    constructor() {
        this.x = 1.0;
        this.y = 1.0;
        this.viewAngle = 0.0;
        this.fov = 3.14159 / 3;
        this.viewDepth = 8.0;
    }
}
