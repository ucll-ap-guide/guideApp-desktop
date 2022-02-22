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

    copy(): GuidoMap {
        return new GuidoMap(
            this.name,
            this.length,
            this.width,
            this.lastId,
            this.floors.map((floor: Floor) => floor.copy()),
            this.nodes.map((node: GuidoNode) => node.copy())
        );
    }
}
