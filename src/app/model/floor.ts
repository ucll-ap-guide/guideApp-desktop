import {Polygon} from "./polygon";

export class Floor {
    constructor(
        public floor: number,
        public name: string,
        public height: number,
        public overlays: { polygons: Polygon[] } = {polygons: []}
    ) {
    }

    copy(): Floor {
        return new Floor(
            this.floor,
            this.name,
            this.height,
            {polygons: this.overlays.polygons.map((polygon: Polygon) => polygon.copy())}
        );
    }
}
