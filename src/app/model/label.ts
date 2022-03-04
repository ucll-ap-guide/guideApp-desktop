import {Point} from "./point";

/**
 * Class representing a label on a {@link Floor}.
 */
export class Label {
    /**
     * @constructor
     * @param id The (unique) id of the label.
     * @param description The description of something that will help the user to locate himself.
     * @param point The place where label should be rendered.
     * @param color The color is a list of `integers` consisting of 3 numbers that are between 0-255.
     */
    constructor(
        public id: number,
        public description: string,
        public point: Point,
        public color: [number, number, number]
    ) {
    }

    /**
     * The **copy()** function makes a copy of the given {@link Label}.
     *
     * @param label The {@link Label} to copy.
     * @return A copy (by value) of the {@link Label}.
     */
    public static copy(label: Label): Label {
        return new Label(
            label.id,
            label.description,
            Point.copy(label.point),
            [label.color[0], label.color[1], label.color[2]]
        );
    }
}
