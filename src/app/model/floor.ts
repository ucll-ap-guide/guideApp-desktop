import {Polygon} from "./polygon";
import {GuidoNode} from "./guido-node";
import {Label} from "./label";

/**
 * Class representing a floor of the {@link GuidoMap}.
 */
export class Floor {
    /**
     * @constructor
     * @param floor The floor number.
     * @param name The name of the floor.
     * @param height The height of the floor.
     * @param overlays A map containing the rooms, floor, point of interests and labels of the floor.
     * @param overlays.polygons A list of all the {@link Polygon}'s of the floor.
     * @param overlays.nodes A list of all the points of interests ({@link GuidoNode}) of the floor.
     * @param overlays.labels A list of all the {@link Label}'s of the floor.
     */
    constructor(
        public floor: number,
        public name: string,
        public height: number,
        public overlays: { polygons: Polygon[], nodes: GuidoNode[], labels: Label[] } = {
            polygons: [],
            nodes: [],
            labels: []
        }
    ) {
    }

    /**
     * The **copy()** function makes a copy of the given {@link Floor}.
     *
     * @param floor The {@link Floor} to copy.
     * @return A copy (by value) of the {@link Floor}.
     */
    public static copy(floor: Floor): Floor {
        return new Floor(
            floor.floor,
            floor.name,
            floor.height,
            {
                polygons: floor.overlays.polygons.map((polygon: Polygon) => Polygon.copy(polygon)),
                nodes: floor.overlays.nodes.map((node: GuidoNode) => GuidoNode.copy(node)),
                labels: floor.overlays.labels.map((label: Label) => Label.copy(label))
            }
        );
    }
}
