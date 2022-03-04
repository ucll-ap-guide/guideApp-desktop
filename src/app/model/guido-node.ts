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
        public color: number[],
        public degreesRotated: number
    ) {
    }

    public static copy(node: GuidoNode): GuidoNode {
        return new GuidoNode(
            node.id,
            node.name,
            node.floor,
            Point.copy(node.point),
            node.displayPoints.map((point: Point) => Point.copy(point)),
            node.neighbors.map((neighbor: number) => neighbor),
            node.type,
            node.color.map((n: number) => n),
            node.degreesRotated
        );
    }
}
