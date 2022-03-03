import {Floor} from "./floor";
import {GuidoNode} from "./guido-node";

export class GuidoMap {
    constructor(
        public name: string,
        public length: number,
        public width: number,
        public lastId: number = 0,
        public floors: Floor[] = [],
        public nodes: GuidoNode[] = []
    ) {
    }

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
