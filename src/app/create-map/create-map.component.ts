import {Component, OnInit} from '@angular/core';
import {MapService} from "../map.service";

@Component({
    selector: 'create-map',
    templateUrl: './create-map.component.html',
    styles: [`
        @import "https://dciarletta.github.io/d3-floorplan/d3.floorplan.css";
    `]
})
export class CreateMapComponent implements OnInit {
    jsonData = {
        "mapJSON": {
            "name": "UCLL",
            "floors": [] as { floor: number, name: string, height: number, overlays: { polygons: { name: string, points: { x: number, y: number }[] }[] } }[]
        },
        "nodeJSON": [] as { id: number, name: string, point: {x: number, y: number}, displayPoints: {x: number, y: number}[], neighbors: [], type: string}[]
    };

    mapNames: string[] = [];
    initializedMap: boolean = false;
    createFloorForm = {
        floor: 0,
        name: "Verdieping 0",
        height: 2.5
    };

    constructor(private mapService: MapService) {
    }

    ngOnInit() {
        const self = this;
        document.getElementById("uploadedMapFromComputer")!.onchange = function (event) {
            const reader = new FileReader();
            reader.onload = function (event: ProgressEvent<FileReader>) {
                let tempName = self.jsonData.mapJSON.name;
                self.jsonData = JSON.parse(<string>event.target!.result);
                self.jsonData.mapJSON.name = tempName;
            }
            if ((event.target as HTMLInputElement)!.files!.length > 0) {
                reader.readAsText((event.target as HTMLInputElement)!.files![0]);
            }
        };
        document.getElementById("editMapDialog")!.addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                this.displayEditMapDialog(false);
            }
        });
    }

    /**
     * Displays the map editor screen.
     */
    createMap(): void {
        if (this.jsonData.mapJSON.name !== "") {
            this.initializedMap = true;
        }
    }

    /**
     * Adds a new floor to the existing map.
     *
     * @param floor The floor number this can be negative or positive
     * @param name The name of the floor
     * @param height The height of the floor
     */
    addFloor(
        floor: number = this.createFloorForm.floor,
        name: string = this.createFloorForm.name,
        height: number = this.createFloorForm.height
    ): void {
        if (!isNaN(floor) && name !== "" && !isNaN(height) && !this.jsonData.mapJSON.floors.find((f: any) => f.floor === floor)) {
            this.jsonData.mapJSON.floors.push({
                "floor": floor,
                "name": name,
                "height": height,
                "overlays": {
                    "polygons": []
                }
            });
            this.createFloorForm.floor++;
            this.createFloorForm.name = "Verdieping " + this.createFloorForm.floor
        }
    }

    /**
     * Gets the names of all the maps and saves it in the variable mapNames.
     */
    getMapNames(): void {
        this.mapService.getAllMapNames().subscribe((mapNames: any) => {
            this.mapNames = mapNames;
        });
    }

    saveMapLocally(): void {
        let downloadLink = document.createElement("a");
        let blob = new Blob([(JSON.stringify(this.jsonData))]);
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.target = '_blank';
        downloadLink.download = this.jsonData.mapJSON.name + ".json";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    /**
     * Saves the map on the server
     *
     * @param map The JSON object to save on the server
     */
    saveMapRemotely(map: JSON = JSON.parse(JSON.stringify(this.jsonData))): void {
        this.mapService.addMap(map).subscribe();
    }

    /**
     * Displays the map get map from server dialog.
     *
     * @param display The dialog will be hidden if false and visible if true.
     */
    displayEditMapDialog(display: boolean): void {
        this.getMapNames();
        if (display) {
            document.getElementById("editMapDialog")!.classList.replace("hidden", "flex");
        } else {
            document.getElementById("editMapDialog")!.classList.replace("flex", "hidden");
        }
    }

    /**
     * Loads the map from the server with the given name.
     *
     * @param name The name of the map on the server that needs to be loaded.
     */
    editMap(name: string = (<HTMLSelectElement>document.getElementById("editMapSelect")).value): void {
        this.displayEditMapDialog(false);
        document.getElementById("submitMap")!.innerText = "Update map";
        this.mapService.getMap(name).subscribe((v) => {
            this.jsonData = v;
        });
    }

    /**
     * Removes all the floors from the current map.
     */
    clearMap(): void {
        this.jsonData.mapJSON.floors = [];
    }
}
