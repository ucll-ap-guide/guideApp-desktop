import {Polygon} from "./polygon";

export class Floor {
    constructor(
        public floor: number,
        public name: string,
        public height: number,
        public length: number,
        public width: number,
        public overlays: { polygons: Polygon[] }
    ) {
    }
}
