import {Point} from "./point";

export class Polygon {
    constructor(
        public id: number,
        public name: string,
        public floor: number,
        public type: string,
        public description: string,
        public points: Point[]
    ) {
    }
}
