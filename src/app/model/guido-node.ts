import {Point} from "./point";

export class GuidoNode {
    constructor(
        public id: number,
        public name: string,
        public floor: number,
        public point: Point,
        public displayPoints: Point[],
        public neighbors: number[],
        public type: string
    ) {
    }
}
