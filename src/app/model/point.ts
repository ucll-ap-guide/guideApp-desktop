export class Point {
    constructor(
        public x: number,
        public y: number
    ) {
    }

    public static copy(point: Point): Point {
        return new Point(
            point.x,
            point.y
        );
    }

    public static toArray(point: Point): [number, number] {
        return [point.x, point.y];
    }

    public static pointStringFromArrayOfPoints(array: Point[]): string {
        return array.map(function (d: Point) {
            return Point.toArray(d).join(",");
        }).join(" ");
    }

    public static arrayOfPointsFromPointString(points: string): Point[] {
        let splitUpPoints = points.split(" ");
        let poppedPoints: Point[] = [];

        while (splitUpPoints.length !== 0) {
            let elems = splitUpPoints.pop()!.split(",");
            poppedPoints.push(new Point(parseFloat(elems[0]), parseFloat(elems[1])));
        }

        return poppedPoints;
    }
}
