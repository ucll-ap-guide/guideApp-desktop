import {Polygon} from "./polygon";
import {GuidoNode} from "./guido-node";
import {Label} from "./label";

export class Floor {
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
