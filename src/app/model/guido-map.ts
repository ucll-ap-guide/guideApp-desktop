import {Floor} from "./floor";

/**
 * Class containing all the information about the building.
 */
export class GuidoMap {
    /**
     * @constructor
     * @param editMode Is set to `true` when the Edit Mode is enabled.
     * @param setNeighborMode Is set to `true` when the Neighbor Mode is enabled.
     * @param deleteMode Is set to `true` when the Delete Mode is enabled.
     * @param name The name of the building.
     * @param length The length of the building (the width of the screen).
     * @param width The width of the map (the height of the screen).
     * @param lastId The id of the last object that has been added to the map.
     * @param floors A list of all the {@link Floor}s of the map.
     */
    constructor(
        public editMode: boolean = false,
        public setNeighborMode: boolean = false,
        public deleteMode: boolean = false,
        public name: string,
        public length: number,
        public width: number,
        public lastId: number = 0,
        public floors: Floor[] = []
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
            guidoMap.editMode,
            guidoMap.setNeighborMode,
            guidoMap.deleteMode,
            guidoMap.name,
            guidoMap.length,
            guidoMap.width,
            guidoMap.lastId,
            guidoMap.floors.map((floor: Floor) => Floor.copy(floor))
        );
    }
}
