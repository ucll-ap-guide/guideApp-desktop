import {AfterViewInit, Component} from '@angular/core';
import {MapService} from "../map.service";
import {Floor} from "../model/floor";
import {GuidoMap} from "../model/guido-map";
import {Point} from "../model/point";
import {GuidoNode} from "../model/guido-node";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";
import {ToastrService} from "ngx-toastr";
import {CreateFloorComponent} from "../create-floor/create-floor.component";
import {Router} from "@angular/router";

declare var d3: any;

@Component({
    selector: 'create-map',
    templateUrl: 'create-map.component.html',
    styleUrls: ['create-map.component.css']
})
export class CreateMapComponent implements AfterViewInit {
    jsonData = new GuidoMap("UCLL", 0, 0);
    deleteMode = false;
    setNeighborMode = false;
    editMode = false;
    mapNames: string[] = [];
    initializedMap: boolean = false;
    createFloorForm = new Floor(0, "Verdieping 0", 2.5);
    paramsToGiveToDialogBoxes: any = {
        updateMap: {}
    };

    constructor(public router: Router, private mapService: MapService, private toastr: ToastrService) {
    }

    ngAfterViewInit() {
        const self = this;
        document.getElementById("uploadedMapFromComputer")!.onchange = function (event: Event) {
            const reader = new FileReader();
            self.clearMap(false);
            reader.onload = function (event: ProgressEvent<FileReader>) {
                let tempName = self.jsonData.name;
                self.jsonData = JSON.parse(<string>event.target!.result);
                self.jsonData.name = tempName;
            }
            if ((event.target as HTMLInputElement)!.files!.length > 0) {
                reader.readAsText((event.target as HTMLInputElement)!.files![0]);
                self.initializedMap = true;
                self.moveFileInputField();
            }
        };
        this.getMapNames();
    }

    /**
     * Moves the file input field from the top of the page to the taskbar
     */
    moveFileInputField() {
        let toBeMoved = document.getElementById("uploadedMapFromComputer");
        let toMoveTo = document.getElementById("uploadedMapFromComputerTaskBarLocation");
        (toMoveTo as Element).insertBefore((toBeMoved as Element), (toMoveTo as Element).firstChild);
    }

    /**
     * Displays the map editor screen.
     */
    createMap(): void {
        document.getElementById("mapNameError")!.innerText =
            this.jsonData.name === "" ? "No map name given." : "";
        // document.getElementById("floorLengthError")!.innerText =
        //     this.jsonData.length < 0 ? "The floor length can't be negative" : "";
        // document.getElementById("floorWidthError")!.innerText =
        //     this.jsonData.length < 0 ? "The floor width can't be negative" : "";

        if (!(Array.from(document.querySelectorAll("#addMapForm .error")) as HTMLParagraphElement[]).find((element: HTMLParagraphElement) => element.innerText !== "")) {
            this.initializedMap = true;
            this.moveFileInputField();
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
            if (mapNames.length === 0) {
                this.toastr.error('No maps available', '', {positionClass: 'toast-bottom-right'});
            } else {
                this.mapNames = mapNames;
            }
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
     * Displays a DialogBox with the given parameters for a certain action.
     *
     * @param action The name of the DialogBox that needs to be displayed.
     * @param params The params to give to the DialogBox.
     */
    displayDialogBox(action: string, params: {}): void {
        this.getMapNames();
        this.paramsToGiveToDialogBoxes[action] = params;
        this.paramsToGiveToDialogBoxes[action].self = this;
        document.getElementById(`${action}DialogBoxFloor0`)!.classList.replace("hidden", "flex");
    }

    /**
     * Loads the map from the server with the given name.
     *
     * @param name The name of the map on the server that needs to be loaded.
     * @param self The instance of the CreateMapComponent.
     */
    editMap(name: string, self: CreateMapComponent): void {
        document.getElementById("submitMap")!.innerText = "Update map";
        self.clearMap(false);
        self.mapService.getMap(name).subscribe((map: GuidoMap) => {
            if (map === null) {
                self.toastr.error('No map with the given name found.', '', {positionClass: 'toast-bottom-right'});
            } else {
                self.jsonData = map;
            }
        });
        self.initializedMap = true;
        self.moveFileInputField();
    }

    toggleDeleteMode(): void {
        this.deleteMode = !this.deleteMode;
        if (this.deleteMode) {
            this.toastr.warning('Delete mode enabled!', '', {positionClass: 'toast-bottom-right'});
        } else {
            this.toastr.success('Delete mode disabled!', '', {positionClass: 'toast-bottom-right'});
        }
    }

    /**
     * Removes all the floors from the current map.
     */
    clearMap(displayMessage: boolean = true): void {
        this.jsonData.floors = [];
        this.jsonData.nodes = [];
        if (displayMessage) {
            this.toastr.success('Cleared map!', "", {positionClass: "toast-bottom-right"});
        }
    }

    enableSetNeighborMode() {
        this.deleteMode = false;
        document.querySelectorAll('.map-layers').forEach(elem => elem.setAttribute("transform", "translate(0,0)scale(1)"));
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
            const node = d3.select("[id='" + elem.getAttribute("id") + "']");
            const floorTextLabels = d3.select("#demo" + node.attr("floor") + "textLabels");
            const group = floorTextLabels.append("g");
            let textLabel;
            let labelCoordinates: Point;
            switch (elem.getAttribute("type")) {
                case NodeType.DOOR:
                case NodeType.EMERGENCY_EXIT:
                    let points = CreateFloorComponent.arrayOfPointsFromPointString(node.attr("points"));
                    let middleX = (points[0].x + points[2].x) / 2;
                    let middleY = (points[0].y + points[2].y) / 2;
                    let point = new Point(middleX, middleY);

                    labelCoordinates = new Point(point.x, point.y);
                    break;

                case NodeType.NODE:
                    labelCoordinates = new Point(
                        parseFloat(node.attr("cx")) + 6,
                        parseFloat(node.attr("cy")) - 1
                    );
                    break;

                default:
                    labelCoordinates = new Point(
                        30 + parseFloat(node.attr("x")),
                        parseFloat(node.attr("y")) + 5
                    );
            }

            textLabel = group.append("text")
                .attr("x", labelCoordinates.x)
                .attr("y", labelCoordinates.y)
                .style("font-size", "0.5em")
                .text(node.attr("id"));

            if (textLabel) {
                const SVGRect = group.node().getBBox();
                const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                rect.setAttribute("x", SVGRect.x);
                rect.setAttribute("y", SVGRect.y);
                rect.setAttribute("width", SVGRect.width);
                rect.setAttribute("height", SVGRect.height);
                rect.setAttribute("fill", "white");
                rect.setAttribute("stroke", "black");
                rect.setAttribute("stroke-width", "0.5px");

                group.node().insertBefore(rect, textLabel.node());
            }

            group.node().addEventListener('click', function (e: Event) {
                // @ts-ignore
                e.target.parentNode.parentNode.appendChild(e.target.parentNode)
            });
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

        this.jsonData.nodes = this.jsonData.nodes.concat(this.getAllDoorsAndPointsOfInterest());
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
            let neighbors = String(nodes[i].getAttribute("neighbors")).split(",").filter((e: string) => e !== "").map(elem => parseInt(elem));

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

    getAllDoorsAndPointsOfInterest() {
        const handledDoors: GuidoNode[] = [];

        for (const nodeType of Object.values(NodeType).filter((nodeType: NodeType) => nodeType !== NodeType.NODE)) {
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
                const neighbors = neighborsStr.filter((e: string) => e !== "").map(elem => parseInt(elem));
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
