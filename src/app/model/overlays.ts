import {Polygon} from "./polygon";
import {GuidoNode} from "./guido-node";
import {Label} from "./label";

/**
 * Class grouping the different objects on a {@link Floor}.
 */
export class Overlays {
    /**
     * @constructor
     * @param polygons The collection of all the {@link Polygon}s on a {@link Floor}.
     * @param nodes The collection of all the {@link GuidoNode}s on a {@link Floor}.
     * @param labels The collection of all the {@link Label}s on a {@link Floor}.
     */
    constructor(
        public polygons: Polygon[] = [],
        public nodes: GuidoNode[] = [],
        public labels: Label[] = []
    ) {
    }
}