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
     * @param point The {@link Point} from which the array needs to be generated.
     * @return An {@link Array} containing the x and y coordinate from the given point.
     */
    public static toArray(point: Point): [number, number] {
        return [point.x, point.y];
    }

    /**
     * The **pointStringFromArrayOfPoints()** function converts an {@link Array} of {@link Point}s to a `string`.
     *
     * @param points The {@link Array} of {@link Point}'s to convert.
     * @return A `string` of space separated points.
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
}
