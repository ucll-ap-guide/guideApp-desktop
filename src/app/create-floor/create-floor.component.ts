import {AfterViewInit, Component, HostListener, Input} from '@angular/core';
import {Point} from "../model/point";
import {GuidoNode} from "../model/guido-node";
import {GuidoMap} from "../model/guido-map";
import {Polygon} from "../model/polygon";
import {Floor} from "../model/floor";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";
import {ToastrService} from "ngx-toastr";
import {Label} from "../model/label";
import {Floorplan} from "../d3/floorplan";
import {Imagelayer} from "../d3/imagelayer";
import {Overlays} from "../d3/overlays";

declare var d3: any;

@Component({
    selector: 'app-create-floor',
    templateUrl: 'create-floor.component.html',
    styleUrls: ['create-floor.component.css']
})
/**
 * A component that can be used to edit a {@link Floor} of a {@link Map} using the D3 floorplan.
 */
export class CreateFloorComponent implements AfterViewInit {

    @Input() jsonData!: GuidoMap;
    @Input() floor!: number;
    @Input() deleteMode: boolean = false;

    @Input()
    set changeEditMode(value: boolean) {
        this.editMode = value;
        this.deleteMode = false;
    }

    imageUrl = "";

    setNeighborMode: boolean = false;
    editMode: boolean = false;
    imageWidth = 720;
    imageHeight = 487;
    imageRatio = this.imageHeight / this.imageWidth;
    mapWidth = 720;
    mapHeight = 487;

    @Input()
    set changeSetNeighborMode(value: boolean) {
        this.setNeighborMode = value;
        this.deleteMode = false;
        if (this.setNeighborMode) {
            this.setConnectingNeighbors(this);
        } else {
            this.removeConnectingNeighbors(this);
        }
    }

    xScale: any;
    yScale: any;
    imageLayer: any;
    overlays: any;
    mapData: any;
    floorplan: any;
    observer!: MutationObserver;
    paramsToGiveToDialogBoxes: any = {
        createPolygonWithNVertices: {},
        createPolygon: {},
        updatePolygon: {},
        createDoor: {},
        updateDoor: {},
        createNode: {},
        createPointOfInterest: {},
        createLabel: {},
        updateLabel: {},
        setNeighbors: {},
        updateNode: {}
    };

    constructor(private toastr: ToastrService) {
    }

    /**
     * The **floorName()** getter gets the name of the {@link Floor} with id {@link floor}.
     *
     * @return The name of the {@link Floor}.
     */
    get floorName(): string {
        return this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.name;
    }

    /**
     * The **getPointsOfInterest()** function gets the name of all the {@link GuidoNode}s of type the points of interest
     * (alle the types in {@link GuidoNode} except for {@link GuidoNode.DOOR}, {@link NodeType.EMERGENCY_EXIT} and
     * {@link NodeType.NODE}).
     *
     * @return An {@link Array} of all the names of the points of interest.
     */
    getPointsOfInterestTypes(): string[] {
        return Object.values(NodeType).map((nodeType: string) => nodeType).filter((nodeType: string) => nodeType != NodeType.DOOR && nodeType != NodeType.EMERGENCY_EXIT && nodeType != NodeType.NODE);
    }

    /**
     * The **loadData()** function resets the whole map layer by removing all the D3 elements inside the
     * {@link SVGElement} and then reloading all the elements with D3 floorplan.
     *
     * @param floor The {@link Floor} who needs to be reloaded.
     */
    loadData(floor: Floor): void {
        let svg = d3.select("#demo" + this.floor).select("svg");
        this.mapData.set(this.overlays.getId(), floor.overlays);

        svg.select("g.map-layers").select(".Objects").remove();
        svg.select("g.map-controls").remove();

        svg.attr("height", this.mapHeight)
            .attr("width", this.mapWidth)
            .datum(this.mapData);

        this.floorplan.generateMap(svg);

        // Place all figures on top layers of the svg
        let orig = document.getElementById("demo" + this.floor)!.getElementsByTagName("svg")[0];
        orig.appendChild(document.getElementById("demo" + this.floor + "lineGroup")!);

        svg.on("dblclick.zoom", null);
        this.setEventListeners(floor);
    }

    /**
     * The **setEventListeners()** function adds {@link EventListener}s to update and remove {@link Polygon}s and
     * {@link GuidoNode}s.
     *
     * @param floor The {@link Floor} for which the {@link EventListener}s need to be added.
     */
    setEventListeners(floor: Floor): void {
        let self = this;
        Array.from(document.querySelectorAll(`[removable], [type=${PolygonType.FLOOR}]`)).filter(elem => document.getElementById("demo" + this.floor)!.contains(elem))
            .forEach((elem: Element) => {
                elem.addEventListener("click", (e: any) => {
                    if (self.deleteMode && !self.setNeighborMode && !e.ctrlKey) {
                        self.removeElement(e);
                    }
                });
            });

        Array.from(document.getElementsByClassName("polygon"))
            .forEach((elem: Element) => {
                elem.addEventListener("click", () => {
                    console.log(self.editMode)
                    if (self.editMode) {
                        let polygons = floor.overlays.polygons;
                        let index = polygons.map(elem => elem.id).indexOf(parseInt(elem.id));
                        self.displayDialogBox("updatePolygon", {
                            defaultValues: [polygons[index].name, polygons[index].description, polygons[index].color.join(",")],
                            id: elem.id
                        });
                    }
                });
            });

        Array.from(document.querySelectorAll("[type='Label']"))
            .forEach((elem: Element) => {
                elem.addEventListener("click", () => {
                    if (self.editMode) {
                        let labels = floor.overlays.labels;
                        let index = labels.map(elem => elem.id).indexOf(parseInt(elem.id));
                        self.displayDialogBox("updateLabel", {
                            defaultValues: [labels[index].description, labels[index].color.join(",")],
                            id: elem.id
                        });
                    }
                });
            });

        Array.from(document.querySelectorAll(`[type='.${NodeType.DOOR}'], [type='${NodeType.EMERGENCY_EXIT}']`))
            .forEach((elem: Element) => {
                elem.addEventListener("click", () => {
                    if (self.editMode) {
                        let door = floor.overlays.nodes.find((element: GuidoNode) => parseInt(elem.id) === element.id)!;
                        let dimensions = this.getDoorDimensions(door.displayPoints);
                        self.displayDialogBox("updateDoor", {
                            defaultValues: [door.name, dimensions.length, dimensions.width, door.color],
                            id: elem.id
                        });
                    }
                });
            });

        Array.from(document.getElementsByClassName(NodeType.NODE))
            .forEach((elem: Element) => {
                elem.addEventListener("click", () => {
                    if (self.editMode) {
                        let node = floor.overlays.nodes.find(element => parseInt(elem.id) === element.id)!;
                        self.displayDialogBox("updateNode", {
                            defaultValues: [node.name],
                            id: elem.id
                        });
                    }
                });
            });

        d3.select("#demo" + this.floor).selectAll(".polygon").on("dblclick", function () {
            // @ts-ignore
            self.changeVerticeCountOfPolygon(this, !self.deleteMode, self);
        });

        Array.from(document.querySelectorAll(`[node]`))
            .filter((elem: Element) => parseInt(elem.getAttribute("floor")!) === floor.floor)
            .forEach((elem: Element) => {
                elem.addEventListener("dblclick", (e: Event) => {
                    this.openDisplayNeighborsDialog(e, self);
                });
            });

        this.observer = new MutationObserver(this.setZoom);
        this.observer.observe(document.querySelector('#demo' + this.floor)!.querySelector('.map-layers') as Node, {attributes: true});
    }

    ngAfterViewInit(): void {
        this.floorplan = new Floorplan();
        this.mapData = new Map();
        this.imageLayer = new Imagelayer();
        this.overlays = new Overlays(this.jsonData, this.floor);

        this.regenerateFloorMap(true);
        let floor = this.jsonData.floors.find((f: Floor) => f.floor === this.floor) as Floor;
        this.mapData.set(this.overlays.getId(), floor.overlays);

        let svg = d3.select("#demo" + this.floor).append("svg")
            .attr("height", this.mapHeight)
            .attr("width", this.mapWidth)
            .datum(this.mapData);

        this.floorplan.generateMap(svg);

        svg.on("dblclick.zoom", null);

        d3.select("#demo" + this.floor).select("svg").insert("g", "#doors" + this.floor).attr("setNeighborModeLineGroup", "").attr("id", "demo" + this.floor + "lineGroup");

        d3.select("#demo" + this.floor).select("svg").select("defs")
            .append("marker")
            .attr("id", "arrow")
            .attr("refX", 3)
            .attr("refY", 3)
            .attr("markerWidth", 15)
            .attr("markerHeight", 15)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,1 " +
                "L3,3 " +
                "L0,5 ")
            .attr("fill", "orange");

        this.setEventListeners(floor);
    }

    /**
     * The **updatePolygon()** function updates the {@link Polygon} with the given {@link id} with the given properties
     * in the {@link jsonData} and will call the {@link loadData} function to refresh the view.
     *
     * @param id The unique identifier of the {@link Polygon}.
     * @param name The (new) name of the {@link Polygon}.
     * @param description The (new) description of the {@link Polygon}.
     * @param color The (new) color of the {@link Polygon}, it is represented as an {@link Array} of `integers` between
     *              0 and 255.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    updatePolygon(id: number, name: string, description: string, color: [number, number, number], self: CreateFloorComponent = this): void {
        let polygons = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.polygons;
        let index = polygons.map((polygon: Polygon) => polygon.id).indexOf(id);
        polygons[index].name = name;
        polygons[index].description = description;
        polygons[index].color = color;

        self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.polygons = polygons;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **updateNode()** function updates the {@link GuidoNode} (of type {@link NodeType.NODE}) with the given
     * {@link id} with the given properties in the {@link SVGElement}. This function must only be used to update
     * {@link GuidoNode}s of type {@link NodeType.NODE}!
     *
     * @param id The unique identifier of the {@link GuidoNode}.
     * @param name The (new) name of the {@link GuidoNode}.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    updateNode(id: number, name: string, self: CreateFloorComponent = this): void {
        let node = self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!.overlays.nodes.find(elem => elem.id === id)!;
        node.name = name;

        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **updateLabel()** function updates the {@link Label} with the given {@link id} with the given properties in
     * the {@link jsonData}. And reloads the floorplan with the new data.
     *
     * @param id The unique identifier of the {@link Label}.
     * @param description The (new) description of the {@link Label}.
     * @param color The (new) color of the {@link Label}, it is represented as an {@link Array} of `integers` between 0
     *              and 255.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    updateLabel(id: number, description: string, color: [number, number, number], self: CreateFloorComponent = this): void {
        let labels = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.labels;
        let index = labels.map((label: Label) => label.id).indexOf(id);
        labels[index].description = description;
        labels[index].color = color;

        self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.labels = labels;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **removeElement()** function removes the {@link Polygon}, {@link GuidoNode} or {@link Label} from the
     * {@link jsonData} and then reloads the floorplan again with the new {@link Overlays}.
     *
     * @param event The {@link Event} that triggered the delete action.
     */
    removeElement(event: Event): void {
        if (event.target) {
            // @ts-ignore
            let id: number = parseInt(event.target.getAttribute(isNaN(parseInt(event.target.getAttribute("id"))) ? "pointsOfInterestId" : "id"));
            let type: string = document.querySelector(`[id='${id}']`)!.getAttribute("type")!;
            switch (type) {
                case PolygonType.ROOM:
                    let array: Polygon[] = this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.overlays.polygons;
                    let index = array.map((polygon: Polygon) => polygon.id).indexOf(id);
                    if (index > -1) {
                        array.splice(index, 1);
                    }
                    break;

                case "Label":
                    let labelsArray: Label[] = this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.overlays.labels;
                    let j = labelsArray.map((label: Label) => label.id).indexOf(id);
                    if (j > -1) {
                        labelsArray.splice(j, 1);
                    }
                    break;

                case PolygonType.FLOOR:
                    // You can't remove the floor
                    break;

                // For all the nodes
                default:
                    let nodesArray: GuidoNode[] = this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.overlays.nodes;
                    let i = nodesArray.map((guidoNode: GuidoNode) => guidoNode.id).indexOf(id);
                    if (i > -1) {
                        nodesArray.splice(i, 1);
                    }
                    this.removeNodeFromNeighborData(id);
            }

            if (type !== PolygonType.FLOOR) {
                this.resetZoom(this);
                this.loadData(this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!);
            }
        }
    }

    /**
     * The **removeNodeFromNeighborData()** function removes the given {@link id} from the attribute neighbors for all
     * the nodes {@link Element}s, it also removes the given {@link id} from the {@link GuidoNode.neighbors} for all the
     * points of interest in the {@link jsonData}.
     *
     * @param id The id of the node that needs to be removed in all his neighbors.
     */
    removeNodeFromNeighborData(id: number): void {
        this.jsonData.floors
            .find((floor: Floor) => floor.floor === this.floor)!.overlays.nodes
            .forEach((node: GuidoNode) => {
                let neighbors = node.neighbors;
                let removeIndex = neighbors.indexOf(id);

                if (removeIndex !== -1) {
                    neighbors.splice(removeIndex, 1);
                }
            });

    }

    /**
     * The **displayDialogBox()** function displays the {@link DialogBoxComponent} with the name {@link action} and
     * updates the params (which will call the {@link DialogBoxComponent.ngOnChanges} function).
     *
     * @param action The name that identifies the action of the {@link DialogBoxComponent} that should be displayed.
     * @param params The parameters that are passed to the {@link DialogBoxComponent.ngOnChanges} function.
     */
    displayDialogBox(action: string, params: {}): void {
        this.paramsToGiveToDialogBoxes[action] = params;
        this.paramsToGiveToDialogBoxes[action].self = this;
        document.getElementById(`${action}DialogBoxFloor${this.floor}`)!.classList.replace("hidden", "flex");
    }

    /**
     * The **setZoom()** function is used to zoom non floorplan objects to the same level as floor plan objects.
     *
     * @param mutationsList TODO
     */
    setZoom = (mutationsList: MutationRecord[]): void => {
        for (const mutation of mutationsList) {
            if (mutation.type !== "attributes" || mutation.attributeName !== "transform") {
                break;
            }
            // @ts-ignore
            d3.select("#doors" + this.floor).attr('transform', mutation.target.getAttribute("transform"));
            // @ts-ignore
            d3.select("#nodes" + this.floor).attr('transform', mutation.target.getAttribute("transform"));
            // @ts-ignore
            d3.select("#pointsOfIntrest" + this.floor).attr('transform', mutation.target.getAttribute("transform"));
            // @ts-ignore
            d3.select("#demo" + this.floor + "textLabels").attr('transform', mutation.target.getAttribute("transform"));
            // @ts-ignore
            d3.select("#demo" + this.floor + "lineGroup").attr('transform', mutation.target.getAttribute("transform"));
        }
    }

    /**
     * The **resetZoom()** function resets the `transform` attribute of the `.map-layers` of the {@link Floor}s
     * {@link SVGElement}.
     *
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    resetZoom(self: CreateFloorComponent = this): void {
        d3.select("#demo" + self.floor).select("svg").select(".map-layers").attr("transform", "");
    }

    /**
     * The **updateDoor()** function updates the {@link GuidoNode} (of type {@link NodeType.DOOR} &
     * {@link NodeType.EMERGENCY_EXIT}) with the given {@link id} with the given properties. And reloads the floorplan
     * with the new data.
     *
     * @param id The unique identifier of the door.
     * @param name The (new) name of the door.
     * @param length The (new) length of the door.
     * @param width The (new) width of the door.
     * @param color The (new) color of the {@link GuidoNode}, it is represented as an {@link Array} of integers between 0 and 255.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    updateDoor(id: number, name: string, length: number, width: number, color: [number, number, number], self: CreateFloorComponent = this): void {
        let door = self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!.overlays.nodes.find(elem => elem.id === id)!;
        door.name = name;
        door.color = color;

        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);

        let toBuildFrom = door.point;

        let points = [
            toBuildFrom,
            new Point(toBuildFrom.x + width, toBuildFrom.y),
            new Point(toBuildFrom.x + width, toBuildFrom.y + length),
            new Point(toBuildFrom.x, toBuildFrom.y + length)
        ];

        let degreesRotated = door.degreesRotated;

        if (degreesRotated !== 0) {
            points = Point.calculateNewCoordinatesForRotation(points, degreesRotated);
        }

        door.displayPoints = points;
        door.point = toBuildFrom;

        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **changeVerticeCountOfPolygon()** function adds an extra vertice between the nearest {@link Polygon} point
     * and the neighboring point that is the closest to the {@link MouseEvent} click OR removes the clicked vertice.
     *
     * @param event The {@link MouseEvent} that triggered this function.
     * @param isAdding The `boolean` indicating if a vertice needs to be added or removed.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    changeVerticeCountOfPolygon(event: MouseEvent, isAdding: boolean, self: CreateFloorComponent = this): void {
        if (d3.event.ctrlKey || d3.event.metaKey) {
            const mouseCoordinates = d3.mouse(event);
            let clickedPolygon = d3.select(event);
            const clickedPolygonId = parseInt(clickedPolygon.attr("id"));
            let vertices: [number, number][] = clickedPolygon.attr("d").substring(1).split("L").map((elem: string) => elem.split(",").map((elem: string) => parseFloat(elem)));
            const distances = vertices.map((elem: [number, number]) => Point.determineDistanceBetweenCoords(Point.toPoint(elem), Point.toPoint(mouseCoordinates)));
            const indexOfClosestExistingPoint = distances.indexOf(Math.min(...distances));

            if (isAdding) {
                const neighbor1Index = indexOfClosestExistingPoint === 0 ? distances.length - 1 : indexOfClosestExistingPoint - 1;
                const neighbor2Index = indexOfClosestExistingPoint === distances.length - 1 ? 0 : indexOfClosestExistingPoint + 1;

                let closestIndex = distances[neighbor1Index] > distances[neighbor2Index] ? neighbor2Index : neighbor1Index;

                const newX = vertices[indexOfClosestExistingPoint][0] + (vertices[closestIndex][0] - vertices[indexOfClosestExistingPoint][0]) * 0.5;
                const newY = vertices[indexOfClosestExistingPoint][1] + (vertices[closestIndex][1] - vertices[indexOfClosestExistingPoint][1]) * 0.5;
                let toBeInsertedAt: number;

                if (indexOfClosestExistingPoint !== 0 && indexOfClosestExistingPoint !== vertices.length - 1) {
                    toBeInsertedAt = indexOfClosestExistingPoint < closestIndex ? indexOfClosestExistingPoint + 1 : closestIndex + 1;
                } else if (indexOfClosestExistingPoint === 0) {
                    toBeInsertedAt = closestIndex === indexOfClosestExistingPoint + 1 ? indexOfClosestExistingPoint + 1 : closestIndex + 1;
                } else if (indexOfClosestExistingPoint === vertices.length - 1) {
                    toBeInsertedAt = closestIndex === indexOfClosestExistingPoint - 1 ? closestIndex + 1 : 0;
                }

                vertices.splice(toBeInsertedAt!, 0, [newX, newY]);
            } else {
                vertices.splice(indexOfClosestExistingPoint, 1);
            }

            let floorNr: number = 0;

            for (let i = 0; i !== this.jsonData.floors.length; i++) {
                const index = this.jsonData.floors[i].overlays.polygons.map((polygon: Polygon) => polygon.id).indexOf(clickedPolygonId);
                if (index !== -1) {
                    this.jsonData.floors[i].overlays.polygons[index].points = vertices.map((elem: [number, number]) => Point.toPoint(elem));
                    floorNr = i;
                    break;
                }
            }

            self.loadData(this.jsonData.floors[floorNr]);
        }
    }

    /**
     * The **removeFloor()** function removes the {@link Floor} with the floor number {@link floor} from the {@link jsonData}.
     */
    removeFloor(): void {
        const newFloors = this.jsonData.floors.slice();
        for (let i = 0; i < this.jsonData.floors.length; i++) {
            if (newFloors[i].floor === this.floor) {
                newFloors.splice(i, 1);
                break;
            }
        }
        this.toastr.success(`Removed ${this.floorName}!`, "", {positionClass: "toast-bottom-right"});
        this.jsonData.floors = newFloors;
    }

    previousWindowWidth = 0;

    /**
     * The **regenerateFloorMap()** function manages the floorplan dimensions. It will resize the map if you switch to
     * another screen with different dimensions. With these dimensions (with a max width of `1536` and a max height of
     * `864`) the floorplan dimensions are calculated based on the image ratio and saved in the jsonData.
     *
     * @param force This will force the (re)calculation of the floorplan's dimensions even when the window hasn't been
     * resized.
     */
    @HostListener('window:resize')
    regenerateFloorMap(force: boolean = false): void {
        if (force || this.previousWindowWidth !== window.screen.width) {
            this.previousWindowWidth = window.screen.width;
            if (this.jsonData.length === 0) {
                this.jsonData.length = window.screen.width < 1536 ? window.screen.width : 1536;
                this.jsonData.width = window.screen.height < 864 ? window.screen.height : 864;
            }

            this.mapWidth = 0.70 * this.jsonData.length;
            this.mapHeight = this.mapWidth * this.imageRatio;
            if (this.mapHeight > 0.70 * this.jsonData.width) {
                this.mapHeight = 0.70 * this.jsonData.width;
                this.mapWidth = this.mapHeight * (1 / this.imageRatio);
            }

            this.xScale = d3.scale.linear().domain([0, this.mapWidth]).range([0, this.mapWidth]);
            this.yScale = d3.scale.linear().domain([0, this.mapHeight]).range([0, this.mapHeight]);

            this.mapData.set(this.imageLayer.getId(), [{
                url: this.imageUrl,
                x: 0,
                y: 0,
                width: this.mapWidth,
                height: this.mapHeight
            }]);
            this.mapData.set(this.overlays.getId(), this.overlays);

            this.floorplan.getSetxScale(this.xScale);
            this.floorplan.getSetyScale(this.yScale);
            this.floorplan.addLayer(this.imageLayer, 0);
            this.floorplan.addLayer(this.overlays, 1);

            if (!force)
                this.loadData(this.jsonData.floors.find((f: any) => f.floor === this.floor)!);
        }
    }

    /**
     * The **updateNewBackground()** function is triggered when a user uploads a new background image for a floor. It
     * will add the image to floorplan's ImageLayer.
     *
     * @param event The event that triggered this function (when a user uploads a background image).
     */
    updateNewBackground(event: any): void {
        if (event.target.files.length > 0) {
            const reader = new FileReader();
            reader.readAsDataURL(event.target.files[event.target.files.length - 1]);
            const self = this;
            reader.onload = function (e: any) {
                const image = new Image();
                image.src = e.target.result;
                image.onload = function () {
                    self.imageHeight = image.height;
                    self.imageWidth = image.width;
                    self.imageRatio = image.height / image.width;
                    self.imageUrl = URL.createObjectURL(event.target!.files[event.target.files.length - 1]);
                    self.regenerateFloorMap(true);
                    self.resetZoom(self);
                    self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
                }
            }
        }
    }

    /**
     * The **getDoorDimensions()** function returns the door dimensions given his corners.
     *
     * @param doorCoords The {@link Array} containing the {@link Point}s of the door.
     * @return A map containing the length and width of the door.
     */
    getDoorDimensions(doorCoords: Point[]): { length: number, width: number } {
        const distance1 = Math.round(Math.sqrt(Math.pow(doorCoords[1].x - doorCoords[0].x, 2) + Math.pow(doorCoords[1].y - doorCoords[0].y, 2)));
        const distance2 = Math.round(Math.sqrt(Math.pow(doorCoords[2].x - doorCoords[1].x, 2) + Math.pow(doorCoords[2].y - doorCoords[1].y, 2)));
        return {
            length: distance1 > distance2 ? distance1 : distance2,
            width: distance1 > distance2 ? distance2 : distance1
        };
    }

    /**
     * The **setNeighbors()** function sets/updates the neighbors of the {@link GuidoNode} with the given {@link id} to
     * the {@link Array} of {@link neighbors}.
     *
     * @param id The unique identifier of the {@link GuidoNode} for which the new {@link neighbors} need to be set.
     * @param neighbors The {@link Array} of id's of all the neighbors.
     * @param self The instance of the {@link CreateFloorComponent}.
     */

    setNeighbors(id: number, neighbors: [string, boolean][], self: CreateFloorComponent = this): void {
        let newNeighbors: number[] = [];
        for (const neighbor of neighbors) {
            newNeighbors.push(parseInt(neighbor[0]));
            const neighborElement = document.querySelector(`[id='${neighbor[0]}']`);
            if (neighborElement === null) {
                console.error(`The neighbor with id ${neighbor[0]} does not exist.`);
            } else {
                let neighborFloor = parseInt(neighborElement.getAttribute("floor")!);
                let ownFloor = parseInt(document.querySelector(`[id='${id}']`)!.getAttribute("floor")!);
                let neighborsNeighbors: number[]

                if (neighborFloor === ownFloor) {
                    neighborsNeighbors = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.nodes.find(element => element.id === parseInt(neighbor[0]))!.neighbors;
                } else {
                    if (neighborElement.getAttribute("type") === NodeType.STAIRS || neighborElement.getAttribute("type") === NodeType.LIFT) {
                        neighborsNeighbors = self.jsonData.floors.find((f: Floor) => f.floor === neighborFloor)!.overlays.nodes.find(element => element.id === parseInt(neighbor[0]))!.neighbors;
                    } else {
                        neighborsNeighbors = [];
                    }
                }

                if (neighbor[1] && !neighborsNeighbors.includes(id)) {
                    neighborsNeighbors.push(id);
                } else if (!neighbor[1]) {
                    neighborsNeighbors = neighborsNeighbors.filter((n: number) => n !== id);
                }
                self.saveNeighborsInJson(parseInt(neighbor[0]), neighborsNeighbors, self);
            }
        }
        newNeighbors = newNeighbors.filter((neighbor: number, index: number) => newNeighbors.indexOf(neighbor) === index);
        self.saveNeighborsInJson(id, newNeighbors, self);
        self.setConnectingNeighbors(self);
    }

    /**
     * The **saveNeighborsInJson()** function saves the {@link Array} of new {@link neighbors} in the {@link jsonData}.
     *
     * @param id The unique identifier of the {@link GuidoNode} that you which to update.
     * @param neighbors The new {@link Array} of neighbors.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    saveNeighborsInJson(id: number, neighbors: number[], self: CreateFloorComponent = this): void {
        const elem = d3.select(`[id='${id}']`);
        self.jsonData.floors[parseInt(elem.attr("floor"))].overlays.nodes.forEach((node: GuidoNode) => {
            if (node.id === id) {
                node.neighbors = neighbors;
            }
        });
    }

    /**
     * The **setConnectingNeighbors()** function (re)draws all the lines between the different {@link GuidoNode}s when
     * the {@link setNeighborMode} is enabled.
     *
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    setConnectingNeighbors(self: CreateFloorComponent = this): void {
        this.removeConnectingNeighbors(self);
        let group = d3.select("#demo" + self.floor + "lineGroup");
        let floorNodes = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.nodes;
        let nodes: Element[] = Array.from(document.querySelectorAll("[node]")).filter(elem => parseInt(elem.getAttribute("floor")!) === self.floor);

        nodes.forEach((elem: Element) => {
            const origin = self.getConnectablePoint(parseInt(elem.id));
            floorNodes
                .find(element => element.id === parseInt(elem.id))!.neighbors
                .map((neighborId: number) => {
                    const neighborElement = document.getElementById(String(neighborId))!;
                    const connectableNeighborPoint = self.getConnectablePoint(neighborId);
                    const neighborFloor = parseInt(neighborElement.getAttribute("floor")!);
                    const ownFloor = parseInt(elem.getAttribute("floor")!);
                    let neighbor = self.jsonData.floors.find((f: Floor) => f.floor === neighborFloor)!.overlays.nodes.find(elem => elem.id === neighborId)!;

                    let isReciprocal = false;
                    if (neighbor.neighbors.some(neighborIdEntry => neighborIdEntry === parseInt(elem.id))) {
                        isReciprocal = true;
                    }

                    if (ownFloor === neighborFloor) {
                        group.append("line")
                            .attr("x1", origin.x + ([NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(elem.getAttribute("type") as NodeType) ? 0 : parseFloat(elem.getAttribute("width")!.split("px")[0]) / 2))
                            .attr("y1", origin.y + ([NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(elem.getAttribute("type") as NodeType) ? 0 : parseFloat(elem.getAttribute("height")!.split("px")[0]) / 2))
                            .attr("x2", connectableNeighborPoint.x + ([NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(neighborElement.getAttribute("type") as NodeType) ? 0 : parseFloat(neighborElement.getAttribute("width")!.split("px")[0]) / 2))
                            .attr("y2", connectableNeighborPoint.y + ([NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(neighborElement.getAttribute("type") as NodeType) ? 0 : parseFloat(neighborElement.getAttribute("height")!.split("px")[0]) / 2))
                            .attr("stroke", isReciprocal ? "green" : "orange")
                            .attr("stroke-width", "5px")
                            .attr("marker-end", isReciprocal ? "" : "url(#arrow)");
                    }
                });
        });
    }

    /**
     * The **removeConnectingNeighbors()** function removes all the lines between the different {@link GuidoNode}s.
     *
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    removeConnectingNeighbors(self: CreateFloorComponent = this): void {
        let group = d3.select("#demo" + self.floor + "lineGroup");
        group.selectAll("line").remove();
    }

    /**
     * The **createPolygon()** function creates a {@link Polygon} with the given properties and saves it in the
     * {@link jsonData} which will automatically reload the floorplan.
     *
     * @param id The unique identifier of the {@link Polygon}. TODO can he still be null?
     * @param name The name of the {@link Polygon}.
     * @param amountOfVertices The amount of vertices of the {@link Polygon}.
     * @param description The description of {@link Polygon}s purpose.
     * @param color The color of the {@link Polygon}, it is represented as an {@link Array} of `integers` between 0 and
     *              255.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    createPolygon(id: number | null = null, name: string, amountOfVertices: number, description: string, color: [number, number, number] = [204, 204, 204], self: CreateFloorComponent = this): void {
        let radius = 30;
        let angle = Math.PI * 2 / amountOfVertices;
        let vertices: Point[] = [];

        for (let i = 0; i < amountOfVertices; i++) {
            const x = 75 + radius * Math.sin(i * angle);
            const y = 75 + radius * Math.cos(i * angle);
            vertices[i] = new Point(x, y);
        }

        const polygons = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.polygons;
        polygons.push(new Polygon(id === null ? self.jsonData.lastId + 1 : id, name, self.floor, PolygonType.ROOM, description, vertices, color));
        if (polygons.length > 1) {
            polygons[0].type = PolygonType.FLOOR;
        }

        if (id === null) {
            self.jsonData.lastId += 1;
        }
        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **createPointOfInterest()** function creates a Point of Interest ({@link GuidoNode}) with the given
     * properties and saves it in the {@link jsonData} which will automatically reload the floorplan.
     *
     * @param nodeType The type of the {@link GuidoNode}.
     * @param neighbors The unique identifiers of all the neighbor {@link GuidoNode}s.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    createPointOfInterest(nodeType: NodeType, neighbors: number[] = [], self: CreateFloorComponent = this): void {
        self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.nodes.push(new GuidoNode(self.jsonData.lastId + 1, String(self.jsonData.lastId + 1), self.floor, new Point(25, 25), [], [], nodeType, [], 0));

        self.jsonData.lastId += 1;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **createLabel()** function creates a {@link Label} with the given properties and saves it in the
     * {@link jsonData} which will automatically reload the floorplan.
     *
     * @param description The description of the label.
     * @param color The color of the {@link Label}, it is represented as an {@link Array} of `integers` between 0 and
     *              255.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    createLabel(description: string, color: [number, number, number], self: CreateFloorComponent = this): void {
        self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.labels.push(new Label(self.jsonData.lastId + 1, description, new Point(25, 25), color));

        self.jsonData.lastId += 1;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self)
    }


    /**
     * The **createNode()** function creates a new {@link GuidoNode} of type {@link NodeType.NODE} with the given
     * properties and saves ot in the {@link jsonData} which will automatically reload the floorplan.
     *
     * @param name The name of the {@link GuidoNode} (if omitted the {@link GuidoNode} will be seen as a pass through
     *             node, otherwise it will be seen as a start & end destination).
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    createNode(name: string, self: CreateFloorComponent): void {
        self.jsonData.floors
            .find((f: Floor) => f.floor === self.floor)!.overlays.nodes
            .push(new GuidoNode(self.jsonData.lastId + 1, name, self.floor, new Point(25, 25), [], [], NodeType.NODE, [], 0));

        self.jsonData.lastId += 1;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **createDoor()** function creates a {@link GuidoNode} of type {@link NodeType.DOOR} or
     * {@link NodeType.EMERGENCY_EXIT} with the given properties and saves it in the {@link jsonData} which will
     * automatically reload the floorplan.
     *
     * @param length The length of the door.
     * @param width  The width of the door.
     * @param name The name of the {@link GuidoNode} (if omitted the {@link GuidoNode} will be seen as a pass through
     *             door, otherwise it will be seen as a start & end destination).
     * @param emergency The `boolean` who determines if the {@link GuidoNode} is either of type {@link NodeType.DOOR} or
     *                  {@link NodeType.EMERGENCY_EXIT}.
     * @param color The color of the {@link GuidoNode}, it is represented as an {@link Array} of `integers` between 0
     *              and 255.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    createDoor(name: string, length: number, width: number, color: number[], emergency: boolean, self: CreateFloorComponent) {
        const doors = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.nodes
        const origin = new Point(25, 25)

        let points = [
            origin,
            new Point(origin.x + width, origin.y),
            new Point(origin.x + width, origin.y + length),
            new Point(origin.x, origin.y + length)
        ];

        doors.push(new GuidoNode(self.jsonData.lastId + 1, name, self.floor, origin, points, [], emergency ? NodeType.EMERGENCY_EXIT : NodeType.DOOR, color, 0));
        self.jsonData.lastId += 1;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
        self.resetZoom(self);
    }

    /**
     * The **getConnectablePoint()** function returns the {@link Point} to which the line must connect in the
     * {@link setNeighborMode}.
     *
     * @param id The unique identifier of the {@link Point} that needs to be found.
     * @return The point to which the line needs to be connected.
     */
    getConnectablePoint(id: number): Point {
        let elem = d3.select(`[id='${id}']`);
        if (elem === null) {
            throw `The node with id ${id} does not exist.`;
        } else {
            switch (elem.attr("type")) {
                case NodeType.DOOR:
                case NodeType.EMERGENCY_EXIT:
                    let points = Point.arrayOfPointsFromPointString(elem.attr("points"));
                    let middleX = (points[0].x + points[2].x) / 2;
                    let middleY = (points[0].y + points[2].y) / 2;
                    return new Point(middleX, middleY);

                case PolygonType.ROOM:
                case PolygonType.FLOOR:
                case NodeType.NODE:
                    return new Point(parseFloat(elem.attr("cx")), parseFloat(elem.attr("cy")));

                default:
                    return new Point(parseFloat(elem.attr("x")), parseFloat(elem.attr("y")));
            }
        }
    }

    /**
     * The **openDisplayNeighborsDialog()** function opens the {@link DialogBoxComponent} for the action `setNeighbors`
     * and passes the current neighbors of the {@link GuidoNode} and the possible neighbors to which he can connect.
     *
     * @param event The {@link Event} which triggered this function.
     * @param self The instance of the {@link CreateFloorComponent}.
     */
    openDisplayNeighborsDialog(event: Event, self: CreateFloorComponent): void {
        if (self.setNeighborMode) {
            const id = (event.target as Element).id === "" ? (event.target as Element).getAttribute("pointsOfInterestId") : (event.target as Element).id;
            if (id != null && id !== "") {
                const elem = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.nodes.find(elem => elem.id === parseInt(id))!;
                const neighbors = elem.neighbors;
                self.displayDialogBox("setNeighbors", {
                    id: id,
                    defaultValues: [neighbors === null ? [] :
                        neighbors
                            .map((neighbor: number) => [neighbor, self.jsonData.floors.find((f: Floor) => f.floor === parseInt(document.querySelector(`[id='${neighbor}']`)!.getAttribute("floor")!))!.overlays.nodes.find(elem => elem.id === neighbor)!.neighbors])],
                    /*
                     * The List of values has 3 [] because the first one is to group all possible input type fields
                     * (in this case there is only one), the second is to group all the input fields for the infinite
                     * field type (there are 2 fields in this case, but the checkbox doesn't need a select, so it is
                     * omitted) and the last one is to group all the different kind of groups of values
                     */
                    values: [[[
                        {
                            group: "Stairs",
                            values: this.jsonData.floors.filter((f: Floor) => (elem.type === NodeType.STAIRS) ? (f.floor === this.floor - 1 || f.floor === this.floor + 1) : (f.floor === this.floor))
                                .map((f: Floor) => f.overlays.nodes)[0].flat(1)
                                .filter((g: GuidoNode) => g.type === NodeType.STAIRS)
                                .map((g: GuidoNode) => g.id)
                                .filter((i: number) => i !== parseInt(id))
                        },
                        {
                            group: "Lifts",
                            values: this.jsonData.floors.filter((f: Floor) => (elem.type === NodeType.LIFT) ? (f.floor === this.floor - 1 || f.floor === this.floor + 1) : (f.floor === this.floor))
                                .map((f: Floor) => f.overlays.nodes)[0].flat(1)
                                .filter((g: GuidoNode) => g.type === NodeType.LIFT)
                                .map((g: GuidoNode) => g.id)
                                .filter((i: number) => i !== parseInt(id))
                        },
                        {
                            group: "Points of interest",
                            values: this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.overlays.nodes
                                .filter((p: GuidoNode) => ![NodeType.STAIRS, NodeType.LIFT, NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(p.type)).map((g: GuidoNode) => g.id)
                                .filter((i: number) => i !== parseInt(id))
                        },
                        {
                            group: "Doors",
                            values: this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.overlays.nodes
                                .filter((g: GuidoNode) => g.type === NodeType.DOOR || g.type === NodeType.EMERGENCY_EXIT)
                                .map((g: GuidoNode) => g.id)
                        },
                        {
                            group: "Nodes",
                            values: this.jsonData.floors.find((f: Floor) => f.floor === this.floor)!.overlays.nodes
                                .filter((g: GuidoNode) => g.type === NodeType.NODE)
                                .map((g: GuidoNode) => g.id)
                        }
                    ]]]
                });
            }
        }
    }
}
