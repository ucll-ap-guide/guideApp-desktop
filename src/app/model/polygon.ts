import {Point} from "./point";
import {PolygonType} from "./polygon-type";

export class Polygon {
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
