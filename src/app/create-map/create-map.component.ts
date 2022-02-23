import {Component, OnInit} from '@angular/core';
import {MapService} from "../map.service";
import {Floor} from "../model/floor";
import {GuidoMap} from "../model/guido-map";
import {Point} from "../model/point";
import {GuidoNode} from "../model/guido-node";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";
import {ToastrService} from "ngx-toastr";

declare var d3: any;

@Component({
    selector: 'create-map',
    templateUrl: './create-map.component.html',
    styles: [`
        @import "https://dciarletta.github.io/d3-floorplan/d3.floorplan.css";
    `]
})
export class CreateMapComponent implements OnInit {
    jsonData = new GuidoMap("UCLL", 0, 0);
    deleteMode = false;
    setNeighborMode = false;
    mapNames: string[] = [];
    initializedMap: boolean = false;
    createFloorForm = new Floor(0, "Verdieping 0", 2.5);

    constructor(private mapService: MapService, private toastr: ToastrService) {
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
        document.getElementById("mapNameError")!.innerText =
            this.jsonData.name === "" ? "No map name given." : "";
        document.getElementById("floorLengthError")!.innerText =
            this.jsonData.length < 0 ? "The floor length can't be negative" : "";
        document.getElementById("floorWidthError")!.innerText =
            this.jsonData.length < 0 ? "The floor width can't be negative" : "";

        if (!(Array.from(document.querySelectorAll("#addMapForm .error")) as HTMLParagraphElement[]).find((element: HTMLParagraphElement) => element.innerText !== "")) {
            this.initializedMap = true;
        }
    }

    /**
     * Adds a new floor to the existing map.
     *
     * @param floor The floor number this can be negative or positive
     * @param name The name of the floor
     * @param height The height of the floor
     * @param importFloorFrom The floor number of the floor plan you want to copy
     */
    addFloor(
        floor: number = this.createFloorForm.floor,
        name: string = this.createFloorForm.name,
        height: number = this.createFloorForm.height,
        importFloorFrom: number | null = document.getElementById("useGroundFloor") === null ? null : Number((document.getElementById("useGroundFloor") as HTMLSelectElement).value)
    ): void {
        document.getElementById("floorNumberError")!.innerText =
            floor === null || isNaN(floor) ? "Not a valid floor number1;" : this.jsonData.floors.find((f: Floor) => f.floor === floor) ? "This floor already exists." : "";
        document.getElementById("floorNameError")!.innerText =
            name === "" ? "The floor name cannot be empty." : "";
        document.getElementById("floorHeightError")!.innerText =
            height === null || isNaN(height) ? "This isn't a valid number." : height <= 0 ? "The floor height must be a positive number." : "";

        if (!(Array.from(document.querySelectorAll("#addFloorForm .error")) as HTMLParagraphElement[]).find((element: HTMLParagraphElement) => element.innerText !== "")) {
            this.jsonData.floors.push(new Floor(floor, name, height));
            this.createFloorForm.floor++;
            this.createFloorForm.name = "Verdieping " + this.createFloorForm.floor;
            if (importFloorFrom !== null) {
                const groundFloor = this.jsonData.floors.find((f: Floor) => f.floor === importFloorFrom)!.overlays.polygons[0].copy();
                groundFloor.id = this.jsonData.lastId + 1;
                groundFloor.type = PolygonType.ROOM;
                this.jsonData.floors[this.jsonData.floors.length - 1].overlays.polygons.push(groundFloor);
                this.jsonData.lastId++;
            }
        }
    }

    /**
     * Gets the names of all the maps and saves it in the variable mapNames.
     */
    getMapNames(): void {
        this.mapService.getAllMapNames().subscribe((mapNames: string[]) => {
            this.mapNames = mapNames;
        });
    }

    hasAFixedFloor(): boolean {
        return this.jsonData.floors.find((f: Floor) => f.overlays.polygons.length > 1) !== undefined;
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
        this.mapService.addMap(map).subscribe(() => {
            this.toastr.success('Successfully uploaded map!', "", {positionClass: "toast-bottom-right"});
        });
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

    toggleDeleteMode(): void {
        if (!this.setNeighborMode) {
            this.deleteMode = !this.deleteMode;
            if (this.deleteMode) {
                this.toastr.warning('Delete mode enabled!', '', {positionClass: 'toast-bottom-right'});
            } else {
                this.toastr.success('Delete mode disabled!', '', {positionClass: 'toast-bottom-right'});
            }
        } else {
            this.toastr.warning("You cannot enabled delete mode this action while Neighbor mode is enabled!", "", {positionClass: "toast-bottom-right"});
        }
    }

    /**
     * Removes all the floors from the current map.
     */
    clearMap(): void {
        this.jsonData.floors = [];
        this.jsonData.nodes = [];
        this.toastr.success('Cleared map!', "", {positionClass: "toast-bottom-right"});
    }

    enableSetNeighborMode() {
        this.deleteMode = false;
        this.setNeighborMode = true;
        let floors = document.querySelectorAll('.floor');
        let nodes = document.querySelectorAll('[node]');

        //SET LABELS
        floors.forEach(elem => d3.select("#" + elem.getAttribute("id"))
            .select("svg")
            .append("g")
            .attr("setNeighborModeTextGroup", "")
            .attr("id", elem.getAttribute("id") + "textLabels"));

        nodes.forEach(elem => {
            let node = d3.select("[id='" + elem.getAttribute("id") + "']");
            let floorTextLabels = d3.select("#demo" + node.attr("floor") + "textLabels");
            switch (elem.getAttribute("type")) {
                case NodeType.DOOR:
                case NodeType.EMERGENCY_EXIT:
                    let corner = node.attr("points").split(" ")[0].split(",")
                    let point = new Point(parseFloat(corner[0]), parseFloat(corner[1]));

                    floorTextLabels.append("text")
                        .attr("x", point.x + 25)
                        .attr("y", point.y - 1)
                        .text(node.attr("id"));
                    break;

                case NodeType.NODE:
                    floorTextLabels.append("text")
                        .attr("x", parseFloat(node.attr("cx")) + 6)
                        .attr("y", parseFloat(node.attr("cy")) - 1)
                        .text(node.attr("id"))
            }
        })
    }

    disableSetNeighborMode() {
        document.querySelectorAll("[setNeighborModeTextGroup]").forEach(elem => elem.remove());
        document.querySelectorAll("[setNeighborModeLineGroup]").forEach(elem => elem.innerHTML = "");
        this.setNeighborMode = false;
    }

    /**
     * Gets all nodes and adds them to the JSON structure before saving
     */
    setAllNodes() {
        this.jsonData.nodes = [];

        this.jsonData.nodes = this.jsonData.nodes.concat(this.getAllDoors());
        this.jsonData.nodes = this.jsonData.nodes.concat(this.getAllNodes());
    }

    getAllNodes(): GuidoNode[] {
        let nodes = document.getElementsByClassName(NodeType.NODE);
        let handledNodes: GuidoNode[] = [];

        for (let i = 0; i != nodes.length; i++) {
            let cx = parseFloat(String(nodes[i].getAttribute("cx")));
            let cy = parseFloat(String(nodes[i].getAttribute("cy")));
            let r = parseFloat(String(nodes[i].getAttribute("r")));
            let id = parseInt(String(nodes[i].getAttribute("id")));
            let neighbors = String(nodes[i].getAttribute("neighbors")).split(",").map(elem => parseInt(elem));

            let handledDoor = new GuidoNode(
                id,
                String(nodes[i].getAttribute("name")),
                parseInt(String(nodes[i].getAttribute("floor"))),
                new Point(cx, cy),
                [new Point(cx + r, cy + r)],
                neighbors === null ? [] : neighbors,
                NodeType.NODE
            );
            handledNodes.push(handledDoor);
            this.jsonData.lastId++;
        }

        return handledNodes;
    }

    getAllDoors() {
        const handledDoors: GuidoNode[] = [];

        for (const nodeType of [NodeType.DOOR, NodeType.EMERGENCY_EXIT]) {
            const doors = document.getElementsByClassName(nodeType);

            function getDoorCoords(previousPoints: string) {
                const splitUpPreviousPoints: string[] = previousPoints.split(" ");
                const poppedPoints: Point[] = [];

                while (splitUpPreviousPoints.length !== 0) {
                    const elems = splitUpPreviousPoints.pop()!.split(",");
                    poppedPoints.push(new Point(parseFloat(elems[0]), parseFloat(elems[1])));
                }

                const middleX = (poppedPoints[0].x + poppedPoints[2].x) / 2;
                const middleY = (poppedPoints[0].y + poppedPoints[2].y) / 2;

                return {"displayPoints": poppedPoints, "middle": new Point(middleX, middleY)};
            }

            for (let i = 0; i != doors.length; i++) {
                const doorCoords = getDoorCoords(String(doors[i].getAttribute("points")));
                const neighborsStr = String(doors[i].getAttribute("neighbors")).split(",");
                const neighbors = neighborsStr.map(elem => parseInt(elem));
                const id = parseInt(String(doors[i].getAttribute("id")));

                let handledDoor = new GuidoNode(
                    id,
                    String(doors[i].getAttribute("name")),
                    parseInt(String(doors[i].getAttribute("floor"))),
                    new Point(doorCoords.middle.x, doorCoords.middle.y),
                    doorCoords.displayPoints,
                    neighborsStr.length === 0 ? [] : neighbors,
                    nodeType
                );
                handledDoors.push(handledDoor);
                this.jsonData.lastId++;
            }
        }

        return handledDoors;
    }
}
