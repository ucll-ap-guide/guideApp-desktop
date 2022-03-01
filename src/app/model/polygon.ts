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
        public color: number[] = [204,204,204]
    ) {
    }

    copy(): Polygon {
        return new Polygon(
            this.id,
            this.name,
            this.floor,
            this.type,
            this.description,
            this.points.map((point: Point) => point.copy()),
            this.color
    );
    }
}
