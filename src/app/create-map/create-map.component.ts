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
        "name": "UCLL",
        "lastId": 0,
        "floors": [] as { floor: number, name: string, height: number, overlays: { polygons: { name: string, points: { x: number, y: number }[] }[] } }[],
        "nodes": [] as { id: number, name: string, floor: number, point: { x: number, y: number }, displayPoints: { x: number, y: number }[], neighbors: number[], type: string }[]
    };

    deleteMode = false;
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
        document.getElementById("uploadedMapFromComputer")!.onchange = function (event: Event) {
            const reader = new FileReader();
            reader.onload = function (event: ProgressEvent<FileReader>) {
                let tempName = self.jsonData.name;
                self.jsonData = JSON.parse(<string>event.target!.result);
                self.jsonData.name = tempName;
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
        if (this.jsonData.name !== "") {
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
        if (!isNaN(floor) && name !== "" && !isNaN(height) && !this.jsonData.floors.find((f: any) => f.floor === floor)) {
            this.jsonData.floors.push({
                "floor": floor,
                "name": name,
                "height": height,
                "overlays": {
                    "polygons": []
                }
            });
            this.createFloorForm.floor++;
            this.createFloorForm.name = "Verdieping " + this.createFloorForm.floor;
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
        this.setAllNodes();
        let blob = new Blob([(JSON.stringify(this.jsonData))]);
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.target = '_blank';
        downloadLink.download = this.jsonData.name + ".json";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    /**
     * Saves the map on the server
     */
    saveMapRemotely(): void {
        this.setAllNodes();
        let map = JSON.parse(JSON.stringify(this.jsonData));
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
        this.jsonData.floors = [];
    }

    /**
     * Gets all nodes and adds them to the JSON structure before saving
     */
    setAllNodes() {
        this.jsonData.nodes = [];


        //Doors
        this.jsonData.nodes = this.jsonData.nodes.concat(this.getAllDoors());
        this.jsonData.nodes = this.jsonData.nodes.concat(this.getAllNodes());

    }

    getAllNodes() {
        let nodes = document.getElementsByClassName("node");
        let handledNodes = [];

        for (let i = 0; i != nodes.length; i++) {
            let cx = parseFloat(nodes[i].getAttribute("cx") + "");
            let cy = parseFloat(nodes[i].getAttribute("cy") + "");
            let r = parseFloat(nodes[i].getAttribute("r") + "");

            let neighbors: number[] = [];


            let handledDoor = {
                id: this.jsonData.lastId + 1,
                name: nodes[i].getAttribute("name") + "",
                floor: parseInt(nodes[i].getAttribute("floor") + ""),
                point: {
                    x: cx,
                    y: cy
                },
                displayPoints: [{"x": cx + r, "y": cy + r}],
                neighbors: neighbors,
                type: "node"
            }
            handledNodes.push(handledDoor);
            this.jsonData.lastId++;
        }

        return handledNodes;
    }

    getAllDoors() {
        let doors = document.getElementsByClassName("door");
        let handledDoors = [];

        function getDoorCoords(previousPoints: string) {
            let splitUpPreviousPoints = previousPoints.split(" ");
            let poppedPoints = [];

            while (splitUpPreviousPoints.length !== 0) {
                let elems = splitUpPreviousPoints.pop()!.split(",");
                poppedPoints.push({"x": parseFloat(elems[0]), "y": parseFloat(elems[1])});
            }

            let middleX = (poppedPoints[0].x + poppedPoints[2].x) / 2;
            let middleY = (poppedPoints[0].y + poppedPoints[2].y) / 2;

            return {"displayPoints": poppedPoints, "middle": {"x": middleX, "y": middleY}};
        }

        for (let i = 0; i != doors.length; i++) {
            let doorCoords = getDoorCoords(doors[i].getAttribute("points") + "");
            let neighbors: number[] = [];

            let handledDoor = {
                id: this.jsonData.lastId + 1,
                name: doors[i].getAttribute("name") + "",
                floor: parseInt(doors[i].getAttribute("floor") + ""),
                point: {
                    x: doorCoords.middle.x,
                    y: doorCoords.middle.y
                },
                displayPoints: doorCoords.displayPoints,
                neighbors: neighbors,
                type: "door"
            }
            handledDoors.push(handledDoor);
            this.jsonData.lastId++;
        }

        return handledDoors;
    }
}
