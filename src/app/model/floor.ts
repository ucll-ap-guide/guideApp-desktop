import {Polygon} from "./polygon";
import {GuidoNode} from "./guido-node";

export class Floor {
    constructor(
        public floor: number,
        public name: string,
        public height: number,
        public overlays: { polygons: Polygon[], nodes: GuidoNode[] } = {polygons: [], nodes: []}
    ) {
    }

    copy(): Floor {
        return new Floor(
            this.floor,
            this.name,
            this.height,
            {
                polygons: this.overlays.polygons.map((polygon: Polygon) => polygon.copy()),
                nodes: this.overlays.nodes.map((node: GuidoNode) => node.copy())
            }
        );
    }
}
