import {Point} from "./point";
import {PolygonType} from "./polygon-type";

/**
 * Class representing a polygon of a certain {@link PolygonType} on a {@link Floor}.
 */
export class Polygon {
    /**
     * @constructor
     * @param id
     * @param name
     * @param floor
     * @param type
     * @param description
     * @param points
     * @param color
     */
    constructor(
        public id: number,
        public name: string,
        public floor: number,
        public type: PolygonType,
        public description: string,
        public points: Point[],
        public color: [number, number, number] = [204, 204, 204]
    ) {
    }

    /**
     * The **copy()** function makes a copy of the given {@link Polygon}.
     *
     * @param polygon The {@link Polygon} to copy.
     * @return A copy (by value) of the {@link Polygon}.
     */
    public static copy(polygon: Polygon): Polygon {
        return new Polygon(
            polygon.id,
            polygon.name,
            polygon.floor,
            polygon.type,
            polygon.description,
            polygon.points.map((point: Point) => Point.copy(point)),
            [polygon.color[0], polygon.color[1], polygon.color[2]]
        );
    }
}
