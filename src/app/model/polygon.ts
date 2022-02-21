import {Point} from "./point";
import {PolygonType} from "./polygon-type";

export class Polygon {
    constructor(
        public id: number,
        public name: string,
        public floor: number,
        public type: PolygonType,
        public description: string,
        public points: Point[]
    ) {
    }
}
