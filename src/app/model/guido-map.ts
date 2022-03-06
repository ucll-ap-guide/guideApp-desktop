import {Floor} from "./floor";
import {GuidoNode} from "./guido-node";

/**
 * Class containing all the information about the building.
 */
export class GuidoMap {
    /**
     * @constructor
     * @param name The name of the building.
     * @param length The length of the building (the width of the screen).
     * @param width The width of the map (the height of the screen).
     * @param lastId The id of the last object that has been added to the map.
     * @param floors A list of all the {@link Floor}s of the map.
     * @param nodes A list of all the {@link GuidoNode}s of the map (excluded points of interest, those are saved on
     *              each {@link Floor}).
     */
    constructor(
        public name: string,
        public length: number,
        public width: number,
        public lastId: number = 0,
        public floors: Floor[] = [],
        public nodes: GuidoNode[] = []
    ) {
    }

    /**
     * The **copy()** function makes a copy of the given {@link GuidoMap}.
     *
     * @param guidoMap The {@link GuidoMap} to copy.
     * @return A copy (by value) of the {@link GuidoMap}.
     */
    public static copy(guidoMap: GuidoMap): GuidoMap {
        return new GuidoMap(
            guidoMap.name,
            guidoMap.length,
            guidoMap.width,
            guidoMap.lastId,
            guidoMap.floors.map((floor: Floor) => Floor.copy(floor)),
            guidoMap.nodes.map((node: GuidoNode) => GuidoNode.copy(node))
        );
    }
}
