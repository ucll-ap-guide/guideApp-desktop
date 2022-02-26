export class Point {
    constructor(
        public x: number,
        public y: number
    ) {
    }

    copy(): Point {
        return new Point(
            this.x,
            this.y
        );
    }

    toArray(): [number, number] {
        return [this.x, this.y];
    }
}
