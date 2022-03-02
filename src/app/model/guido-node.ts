import {Point} from "./point";
import {NodeType} from "./node-type";

export class GuidoNode {
    constructor(
        public id: number,
        public name: string,
        public floor: number,
        public point: Point,
        public displayPoints: Point[],
        public neighbors: number[],
        public type: NodeType,
        public color: number[] = [0,0,0]
    ) {
    }

    copy(): GuidoNode {
        return new GuidoNode(
            this.id,
            this.name,
            this.floor,
            this.point.copy(),
            this.displayPoints.map((point: Point) => point.copy()),
            this.neighbors.map((neighbor: number) => neighbor),
            this.type,
            this.color
        );
    }
}
