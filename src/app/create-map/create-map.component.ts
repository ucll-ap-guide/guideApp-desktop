import {AfterViewInit, Component} from '@angular/core';
import {MapService} from "../map.service";
import {Floor} from "../model/floor";
import {GuidoMap} from "../model/guido-map";
import {Point} from "../model/point";
import {GuidoNode} from "../model/guido-node";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";
import {ToastrService} from "ngx-toastr";
import {Router} from "@angular/router";
import {Polygon} from "../model/polygon";

declare var d3: any;

@Component({
    selector: 'create-map',
    templateUrl: 'create-map.component.html',
    styleUrls: ['create-map.component.css']
})
/**
 * A component that can be used to create a {@link Map} using a {@link CreateFloorComponent} to represent each
 * {@link Floor}.
 */
export class CreateMapComponent implements AfterViewInit {
    jsonData = new GuidoMap(false, false, false,"UCLL", 0, 0);
    newMap: boolean = false;
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
                let parsed = JSON.parse(<string>event.target!.result);

                if (self.newMap) {
                    parsed.name = tempName;
                }

                self.jsonData = parsed;
                self.jsonData.editMode = false;
                self.jsonData.deleteMode = false;
                self.jsonData.setNeighborMode = false;
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
     * The **moveFileInputField()** function moves the file {@link HTMLInputElement} from the first page to the taskbar
     * on the map editor screen (this way there is one {@link EventListener} less).
     */
    moveFileInputField(): void {
        let toBeMoved = document.getElementById("uploadedMapFromComputer");
        let toMoveTo = document.getElementById("uploadedMapFromComputerTaskBarLocation");
        (toMoveTo as Element).insertBefore((toBeMoved as Element), (toMoveTo as Element).firstChild);
    }

    /**
     * The **createMap()** function displays the map editor screen, the name in {@link jsonData} is automatically
     * updated with two-way binding in th form.
     */
    createMap(): void {
        document.getElementById("mapNameError")!.innerText = this.jsonData.name === "" ? "No map name given." : "";

        if (!(Array.from(document.querySelectorAll("#addMapForm .error")) as HTMLParagraphElement[]).find((errorField: HTMLParagraphElement) => errorField.innerText !== "")) {
            this.newMap = true;
            this.initializedMap = true;
            this.moveFileInputField();
        }
    }

    /**
     * The **addFloor()** function adds a new {@link Floor} to the existing {@link jsonData.floors}.
     *
     * @param floor The floor number this is a `number` that can be negative or positive.
     * @param name The name of the new floor.
     * @param height The height of the new floor.
     * @param importFloorFrom The floor number of the floor plan you want to copy (optional).
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
                const groundFloor = Polygon.copy(this.jsonData.floors.find((f: Floor) => f.floor === importFloorFrom)!.overlays.polygons.find((p: Polygon) => p.type === PolygonType.FLOOR)!);
                groundFloor.id = this.jsonData.lastId + 1;
                groundFloor.type = PolygonType.ROOM;
                this.jsonData.floors[this.jsonData.floors.length - 1].overlays.polygons.push(groundFloor);
                this.jsonData.lastId++;
            }
        }
    }

    /**
     * The **getMapNames()** function requests the names of all the {@link Map}s and saves it in the variable
     * {@link mapNames}.
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

    /**
     * The **hasAFloor()** function checks whether one {@link Floor} has a {@link Polygon} of type
     * {@link PolygonType.FLOOR}.
     */
    hasAFloor(): boolean {
        return this.jsonData.floors.find((f: Floor) => f.overlays.polygons.find((polygon: Polygon) => polygon.type === PolygonType.FLOOR)) !== undefined;
    }

    /**
     * The **saveMapLocally()** function downloads the current state of the {@link jsonData} by downloading it as a
     * JSON file.
     */
    saveMapLocally(): void {
        let downloadLink = document.createElement("a");
        let copy = GuidoMap.copy(this.jsonData);
        // @ts-ignore
        delete copy.deleteMode;
        // @ts-ignore
        delete copy.editMode;
        // @ts-ignore
        delete copy.setNeighborMode;
        let blob = new Blob([(JSON.stringify(copy))]);
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.target = '_blank';
        downloadLink.download = this.jsonData.name + ".json";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        this.disableSetNeighborMode();
    }

    /**
     * The **saveMapRemotely()** function saves the {@link Map} {@link jsonData} on the server.
     */
    saveMapRemotely(): void {
        let copy = GuidoMap.copy(this.jsonData);
        // @ts-ignore
        delete copy.deleteMode;
        // @ts-ignore
        delete copy.editMode;
        // @ts-ignore
        delete copy.setNeighborMode;
        let map = JSON.parse(JSON.stringify(copy));
        this.mapService.addMap(map).subscribe(() => {
            this.toastr.success('Successfully uploaded map!', "", {positionClass: "toast-bottom-right"});
        });
        this.disableSetNeighborMode();
    }

    /**
     * The **displayDialogBox()** function displays a {@link DialogBoxComponent} with the given parameters for a certain
     * action.
     *
     * @param action The name of the {@link DialogBoxComponent} that needs to be displayed.
     * @param params The parameters to give to the {@link DialogBoxComponent}.
     */
    displayDialogBox(action: string, params: {}): void {
        this.getMapNames();
        this.paramsToGiveToDialogBoxes[action] = params;
        this.paramsToGiveToDialogBoxes[action].self = this;
        document.getElementById(`${action}DialogBoxFloor0`)!.classList.replace("hidden", "flex");
    }

    /**
     * The **editMap()** function downloads the {@link Map} from the server with the given {@link name} and saves it in
     * the {@link jsonData}.
     *
     * @param name The name of the {@link Map} on the server that needs to be loaded.
     * @param self The instance of the {@link CreateMapComponent}.
     */
    editMap(name: string, self: CreateMapComponent): void {
        self.jsonData.editMode = false;
        self.jsonData.setNeighborMode = false;
        self.jsonData.deleteMode = false;
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

    /**
     * The **toggleDeleteMode()** function switches the {@link deleteMode} to `true` when it was `false` and the other
     * way around, and it displays a warning message.
     */
    toggleDeleteMode(): void {
        this.jsonData.deleteMode = !this.jsonData.deleteMode;
        if (this.jsonData.deleteMode) {
            this.disableSetNeighborMode()
            this.jsonData.editMode = false;
            this.toastr.warning('Delete mode enabled!', '', {positionClass: 'toast-bottom-right'});
        } else {
            this.toastr.success('Delete mode disabled!', '', {positionClass: 'toast-bottom-right'});
        }
    }

    /**
     * The **clearMap()** function removes all the floors from the current map by emptying the whole {@link Array} of {@link Floor}s.
     */
    clearMap(displayMessage: boolean = true): void {
        this.jsonData.lastId = 0;
        this.jsonData.floors = [] as Floor[];

        if (displayMessage) {
            this.toastr.success('Cleared map!', "", {positionClass: "toast-bottom-right"});
        }
    }

    /**
     * The **enableSetNeighborMode()** function switches the {@link setNeighborMode} to `true`, displays the id's of all
     * the {@link GuidoNode}s as a label and TODO displays the lines between the {@link GuidoNode}s.
     */
    enableSetNeighborMode() {
        this.jsonData.deleteMode = false;
        this.jsonData.editMode = false;
        document.querySelectorAll('.map-layers').forEach(elem => elem.setAttribute("transform", "translate(0,0)scale(1)"));
        this.jsonData.setNeighborMode = true;
        let floors = document.querySelectorAll('.floor');
        let nodes = document.querySelectorAll('[node]');

        // Set labels
        floors.forEach(elem => d3.select("#" + elem.getAttribute("id"))
            .select("svg")
            .append("g")
            .attr("setNeighborModeTextGroup", "")
            .attr("id", elem.getAttribute("id") + "textLabels"));

        nodes.forEach(elem => {
            const node = d3.select(`[id='${elem.getAttribute("id")}']`);
            const floorTextLabels = d3.select("#demo" + node.attr("floor") + "textLabels");
            const group = floorTextLabels.append("g");
            let textLabel;
            let labelCoordinates: Point;
            switch (elem.getAttribute("type")) {
                case NodeType.DOOR:
                case NodeType.EMERGENCY_EXIT:
                    let points = Point.arrayOfPointsFromPointString(node.attr("points"));
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

            group.node().addEventListener('click', function (e: any) {
                e.target.parentNode.parentNode.appendChild(e.target.parentNode);
            });
        });
    }

    /**
     * The **disableSetNeighborMode()** function disables the {@link setNeighborMode} and removes the labels for all the
     * {@link GuidoNode} and all the lines between neighbors.
     */
    disableSetNeighborMode() {
        document.querySelectorAll("[setNeighborModeTextGroup]").forEach((elem: Element) => elem.remove());
        document.querySelectorAll("[setNeighborModeLineGroup]").forEach((elem: Element) => elem.innerHTML = "");
        this.jsonData.setNeighborMode = false;
    }

    /**
     * The **toggleEditMode()** function switches the {@link editMode} to `true` when it was `false` and the other way
     * around, and it displays a warning message.
     */
    toggleEditMode() {
        if (!this.jsonData.editMode) {
            this.jsonData.deleteMode = false;
            this.disableSetNeighborMode()
        }
        this.jsonData.editMode = !this.jsonData.editMode;
    }
}
