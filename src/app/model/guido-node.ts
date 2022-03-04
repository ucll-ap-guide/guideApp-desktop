import {Point} from "./point";
import {NodeType} from "./node-type";

/**
 * Class representing a node of a certain {@link NodeType} on a {@link Floor}.
 */
export class GuidoNode {
    /**
     * @constructor
     * @param id The (unique) id of the node.
     * @param name The name of the node.
     * @param floor The floor number of the {@link Floor}.
     * @param point The {@link Point} with which the {@link displayPoints} are rendered.
     * @param displayPoints The corners of the node, used to render the {@link NodeType.DOOR},
     *                      {@link NodeType.EMERGENCY_EXIT}
     * @param neighbors A list of id's (`integer`) of the neighbor nodes.
     * @param type The {@link NodeType} of the node.
     * @param color The color of the node, this is either an empty list or a list of `integers` consisting of 3 numbers that are
     *              between 0-255.
     */
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

    /**
     * The **copy()** function makes a copy of the given {@link GuidoNode}.
     *
     * @param node The {@link GuidoNode} to copy.
     * @return A copy (by value) of the {@link GuidoNode}.
     */
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
