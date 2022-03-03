import {Point} from "./point";

export class Label {
    constructor(
        public id: number,
        public description: string,
        public point: Point,
        public color: [number, number, number]
    ) {
    }

    public static copy(label: Label): Label {
        return new Label(
            label.id,
            label.description,
            Point.copy(label.point),
            [label.color[0], label.color[1], label.color[2]]
        );
    }
}
