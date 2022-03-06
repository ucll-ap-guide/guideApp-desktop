/**
 * Class representing a two-dimensional point.
 */
export class Point {
    /**
     * @constructor
     * @param x The x-coordinate of the point.
     * @param y The y-coordinate of the point.
     */
    constructor(
        public x: number,
        public y: number
    ) {
    }

    /**
     * The **copy()** function makes a copy of the given {@link Point}.
     *
     * @param point The {@link Point} to copy.
     * @return A copy (by value) of the {@link Point}.
     */
    public static copy(point: Point): Point {
        return new Point(
            point.x,
            point.y
        );
    }

    /**
     * The **toArray()** function converts a {@link Point} to an {@link Array}.
     *
     * @param point The {@link Point} from which the {@link Array} needs to be generated.
     * @return An {@link Array} containing the x and y coordinate from the given {@link Point}.
     */
    public static toArray(point: Point): [number, number] {
        return [point.x, point.y];
    }

    /**
     * The **toPoint()** function converts an {@link Array} to a {@link Point}.
     *
     * @param array The {@link Array} from which the {@link Point} needs to be generated.
     * @return A {@link Point} containing the x and y coordinate from the given {@link Array}.
     */
    public static toPoint(array: [number, number]): Point {
        return new Point(array[0], array[1]);
    }

    /**
     * The **pointStringFromArrayOfPoints()** function converts an {@link Array} of {@link Point}s to a `string`.
     *
     * @param points The {@link Array} of {@link Point}'s to convert.
     * @return A `string` of space separated points (the point coordinates are seperated by a `,`).
     */
    public static pointStringFromArrayOfPoints(points: Point[]): string {
        return points.map((point: Point) => Point.toArray(point).join(",")).join(" ");
    }

    /**
     * The **arrayOfPointsFromPointString()** function converts a `string` of points to an {@link Array} of
     * {@link Point}s.
     *
     * @param points A `string` of points (seperated by spaces).
     * @return An {@link Array} of {@link Point}s.
     */
    public static arrayOfPointsFromPointString(points: string): Point[] {
        return points.split(" ").map((point: string) => point.split(",")).map((point: string[]) => new Point(parseFloat(point[0]), parseFloat(point[1])));
    }

    /**
     * The **calculateNewCoordinatesForRotation()** function calculates the center of the figure given the
     * {@link previousPoints} and rotates those points with {@link degreesRotated} from the center of the figure.
     *
     * @param previousPoints The previous points
     * @param degreesRotated The amount of degrees the {@link previousPoints} need to be rotated
     * @return An {@link Array} of {@link Point}s that represents the newly rotated points.
     */
    public static calculateNewCoordinatesForRotation(previousPoints: Point[], degreesRotated: number): Point[] {
        function rotatePoint(pointX: number, pointY: number, originX: number, originY: number, angle: number) {
            angle = angle * Math.PI / 180.0;
            return new Point(
                Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
                Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
            );
        }

        let middleX = (previousPoints[0].x + previousPoints[2].x) / 2;
        let middleY = (previousPoints[0].y + previousPoints[2].y) / 2;

        return previousPoints.map((elem: Point) => rotatePoint(elem.x, elem.y, middleX, middleY, degreesRotated));
    }

    /**
     * The **rotatePoint()** function rotates a {@link point} around the {@link origin} with a given {@link angle}.
     *
     * @param point The {@link Point} that needs to be rotated.
     * @param origin The {@link Point} around which the {@link point} needs to be rotated with an {@link angle}.
     * @param angle The angle the {@link point} needs to be rotated.
     * @return The rotated point.
     */
    static rotatePoint(point: Point, origin: Point, angle: number): Point {
        angle = angle * Math.PI / 180.0;
        return new Point(
            Math.cos(angle) * (point.x - origin.x) - Math.sin(angle) * (point.y - origin.y) + origin.x,
            Math.sin(angle) * (point.x - origin.x) + Math.cos(angle) * (point.y - origin.y) + origin.y
        );
    }

    /**
     * The **determineDistanceBetweenCoords()** function calculates the distance between 2 {@link Point}s.
     *
     * @param point1 The first {@link Point}.
     * @param point2 The second {@link Point}.
     * @return The difference between the two {@link Point}s.
     */
    static determineDistanceBetweenCoords(point1: Point, point2: Point): number {
        return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
    }
}
