import {Point} from "./point";

export class Label {
    constructor(
        public id: number,
        public description: string,
        public floor: number,
        public point: Point,
        public color: [number, number, number]
    ) {
    }

    copy(): Label {
        return new Label(
            this.id,
            this.description,
            this.floor,
            this.point.copy(),
            this.color
        );
    }
}
