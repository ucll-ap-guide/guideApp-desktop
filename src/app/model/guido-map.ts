import {Floor} from "./floor";
import {GuidoNode} from "./guido-node";

export class GuidoMap {
    constructor(
        public name: string,
        public lastId: number = 0,
        public floors: Floor[] = [],
        public nodes: GuidoNode[] = []
    ) {
    }
}
