import {AfterViewInit, Component, HostListener, Input} from '@angular/core';
import {Point} from "../model/point";
import {GuidoNode} from "../model/guido-node";
import {GuidoMap} from "../model/guido-map";
import {Polygon} from "../model/polygon";
import {Floor} from "../model/floor";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";
import {ToastrService} from "ngx-toastr";

declare var d3: any;

@Component({
    selector: 'app-create-floor',
    templateUrl: 'create-floor.component.html',
    styleUrls: ['create-floor.component.css']
})
export class CreateFloorComponent implements AfterViewInit {

    @Input() jsonData!: GuidoMap;
    @Input() floor!: number;
    @Input() deleteMode: boolean = false;

    @Input()
    set changeEditMode(value: boolean) {
        this.editMode = value;
        this.deleteMode = false;
    }

    @Input()
    set changeSetNeighborMode(value: boolean) {
        this.setNeighborMode = value;
        this.deleteMode = false;
        if (this.setNeighborMode) {
            this.setConnectingNeighbors(this)
        } else {
            this.removeConnectingNeighbors(this);
        }
    }

    setNeighborMode: boolean = false;
    editMode: boolean = false;
    imageWidth = 720;
    imageHeight = 487;
    imageRatio = this.imageHeight / this.imageWidth;
    mapWidth = 720;
    mapHeight = 487;
    imageUrl = "https://vryghem.synology.me/maps/C0.png";
    xScale: any;
    yScale: any;
    map: any;
    imageLayer = d3.floorplan.imagelayer();
    overlays = d3.floorplan.overlays().editMode(true);
    mapData: any = {};
    observer!: MutationObserver;
    paramsToGiveToDialogBoxes: any = {
        createPolygonWithNVertices: {},
        createPolygon: {},
        updatePolygon: {},
        createDoor: {},
        updateDoor: {},
        createNode: {},
        createPointOfInterest: {},
        setNeighbors: {}
    };

    constructor(private toastr: ToastrService) {
    }

    ngAfterViewInit(): void {
        this.regenerateFloorMap(true);
        let floor = this.jsonData["floors"].find((f: Floor) => f.floor === this.floor) as Floor;
        this.mapData[this.overlays.id()] = floor.overlays;

        let svg = d3.select("#demo" + this.floor).append("svg")
            .attr("height", this.mapHeight)
            .attr("width", this.mapWidth)
            .datum(this.mapData)
            .call(this.map);

        svg.on("dblclick.zoom", null);

        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "doors" + this.floor);
        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "nodes" + this.floor);
        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "pointsOfInterest" + this.floor);
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

        this.jsonData.nodes.filter((elem: GuidoNode) => elem.floor === this.floor).map((elem: GuidoNode) => {
            switch (elem.type) {
                case NodeType.DOOR:
                case NodeType.EMERGENCY_EXIT:
                    let doorProperties = this.getDoorDimensions(elem.displayPoints);
                    this.createDoor(elem.id, doorProperties.height, doorProperties.width, CreateFloorComponent.pointStringFromArrayOfPoints(elem.displayPoints), elem.name, elem.neighbors, elem.type === NodeType.EMERGENCY_EXIT, this);
                    break;
                case NodeType.NODE:
                    this.createNode(elem.id, elem.point, elem.name, elem.neighbors, this);
                    break;
                default:
                    console.error(`Type ${elem.type} is currently not supported yet`);
            }
        });
        this.setEventListeners(floor);
    }

    getFloorName(): string {
        return this.jsonData["floors"].find((f: Floor) => f.floor === this.floor)!.name;
    }

    getPointsOfInterest(): string[] {
        const nodeTypes: string[] = [];
        for (const nodeTypesKey of Object.values(NodeType)) {
            nodeTypes.push(nodeTypesKey);
        }
        return nodeTypes.filter((nodeType: string) => nodeType != NodeType.DOOR && nodeType != NodeType.EMERGENCY_EXIT && nodeType != NodeType.NODE);
    }

    /**
     * (Re)loads all elements displayed on the drawing area of the floor
     * @param floor
     */
    loadData(floor: Floor): void {
        let svg = d3.select("#demo" + this.floor).select("svg");
        this.mapData[this.overlays.id()] = floor.overlays;

        svg.select("g.map-layers").remove();
        svg.select("g.map-controls").remove();

        svg.attr("height", this.mapHeight)
            .attr("width", this.mapWidth)
            .datum(this.mapData)
            .call(this.map);

        //Place all figures on top layers of the svg
        let orig = document.getElementById("demo" + this.floor)!.getElementsByTagName("svg")[0];
        orig.appendChild(document.getElementById("demo" + this.floor + "lineGroup")!);
        orig.appendChild(document.getElementById("doors" + this.floor)!);
        orig.appendChild(document.getElementById("nodes" + this.floor)!);
        orig.appendChild(document.getElementById("pointsOfInterest" + this.floor)!);

        svg.on("dblclick.zoom", null);
        this.setEventListeners(floor);
    }

    setEventListeners(floor: Floor) {
        let self = this;

        Array.from(document.querySelectorAll(`[removable]`)).filter(elem => document.getElementById("demo" + this.floor)!.contains(elem))
            .forEach((elem: Element) => {
                if ((elem.getAttribute("type")) && ![NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(elem.getAttribute("type") as NodeType)) {
                    elem.addEventListener("click", (e: Event) => {
                        if (self.deleteMode && !self.setNeighborMode) {
                            this.removeElement(e);
                        }
                    });

                    if (elem.getAttribute("type") === PolygonType.ROOM) {
                        elem.addEventListener("click", () => {
                            if (self.editMode) {
                                self.deleteMode = false;
                                let polygons = self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!.overlays.polygons;
                                let index = polygons.map(elem => elem.id).indexOf(parseInt(elem.id));
                                self.displayDialogBox("updatePolygon", {
                                    defaultValues: [polygons[index].name, polygons[index].description],
                                    id: elem.id
                                })
                            }
                        });
                    }
                }
            });

        d3.select("#demo" + this.floor).selectAll(".polygon").on("dblclick", function () {
            //@ts-ignore
            self.addVerticeToPolygon(this, self);
        });

        Array.from(document.getElementsByClassName("pointOfInterest")).filter((elem: Element) => parseInt(String(elem.getAttribute("floor"))) === floor.floor).forEach(elem =>
            elem.addEventListener("dblclick", (e: Event) => {
                this.openDisplayNeighborsDialog(e, self);
            }));

        this.observer = new MutationObserver(this.setZoom);
        this.observer.observe(document.querySelector('#demo' + this.floor)!.querySelector('.map-layers') as Node, {attributes: true});
    }

    updateDoor(id: number, name: string, height: number, width: number) {
        let door = document.querySelector(`[id='${String(id)}']`)!;
        let previousPoints = CreateFloorComponent.arrayOfPointsFromPointString(String(door.getAttribute("points")));
        door.setAttribute("name", name);
        door.setAttribute("height", String(height));
        door.setAttribute("width", String(width));

        //Point used in reconstructing the polygon after dragging
        let toBuildFrom = previousPoints[0];

        let points = [
            toBuildFrom,
            new Point(toBuildFrom.x + width, toBuildFrom.y),
            new Point(toBuildFrom.x + width, toBuildFrom.y + height),
            new Point(toBuildFrom.x, toBuildFrom.y + height)
        ];

        let pointsString = CreateFloorComponent.pointStringFromArrayOfPoints(points);
        let degreesRotated = parseFloat(String(door.getAttribute("degreesRotated")));

        if (degreesRotated !== 0) {
            pointsString = CreateFloorComponent.calculateNewCoordinatesForRotation(pointsString, degreesRotated);
        }

        door.setAttribute("points", pointsString);
    }

    updatePolygon(id: number, name: string, description: string, self: CreateFloorComponent = this) {
        let polygons = self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!.overlays.polygons;
        let index = polygons.map(elem => elem.id).indexOf(id);
        polygons[index].name = name;
        polygons[index].description = description;

        self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!.overlays.polygons = polygons;
        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
    }

    /**
     * Removes an element based upon its type, given the click event that triggered the remove function
     * @param e
     */
    removeElement(e: Event) {
        if (e.target) {
            // @ts-ignore
            let id: number = parseInt(e.target.getAttribute(isNaN(parseInt(e.target.getAttribute("id"))) ? "pointsOfInterestId" : "id"));
            let type: string = document.querySelector(`[id='${String(id)}']`)!.getAttribute("type")!;
            switch (type) {
                case PolygonType.ROOM:
                    let array: Polygon[] = this.jsonData["floors"].find((f: Floor) => f.floor === this.floor)!.overlays.polygons;
                    let index = array.map(function (x: Polygon) {
                        return x.id;
                    }).indexOf(id);
                    if (index > -1) {
                        array.splice(index, 1);
                    }
                    break;

                case NodeType.DOOR:
                case NodeType.EMERGENCY_EXIT:
                case NodeType.NODE:
                    let elem = document.querySelector(`[id='${id}']`);
                    if (elem) {
                        this.removeNodeFromNeighborData(id);
                        elem.remove();
                    }
                    break;

                default:
                    let nodesArray: GuidoNode[] = this.jsonData["floors"].find((f: Floor) => f.floor === this.floor)!.overlays.nodes;
                    let i = nodesArray.map(function (x: GuidoNode) {
                        return x.id;
                    }).indexOf(id);
                    if (i > -1) {
                        nodesArray.splice(i, 1);
                    }
            }
        }
        this.loadData(this.jsonData["floors"].find((f: Floor) => f.floor === this.floor)!);
    }

    removeNodeFromNeighborData(id: number) {
        let nodes = document.querySelectorAll("[node]");
        nodes.forEach(node => {
            let neighbors = String(node.getAttribute("neighbors")).split(",").map(elem => parseInt(elem));
            let removeIndex = neighbors.indexOf(id);

            if (removeIndex !== -1)
                neighbors.splice(removeIndex, 1);

            node.setAttribute("neighbors", neighbors.join(","));
        });
    }

    displayDialogBox(action: string, params: {}) {
        this.paramsToGiveToDialogBoxes[action] = params;
        this.paramsToGiveToDialogBoxes[action].self = this;
        document.getElementById(`${action}DialogBoxFloor${this.floor}`)!.classList.replace("hidden", "flex");
    }

    /**
     * Function used to zoom non floor plan objects to the same level as floor plan objects
     * @param mutationsList
     */
    setZoom = (mutationsList: MutationRecord[]) => {
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
     * Creates a polygon given the amountOfVertices to determine the amount of vertices or asks the user for input
     *
     * @param previousId id when reloading the svg elements
     * @param name The name of the polygon
     * @param amountOfVertices The amount of vertices each room has
     * @param description The description of rooms purpose
     * @param self The instance of the CreateFloorComponent class
     */
    createPolygon(previousId: number | null = null, name: string, amountOfVertices: number, description: string, self: CreateFloorComponent = this) {
        let radius = 30;
        let angle = Math.PI * 2 / amountOfVertices;
        let vertices: Point[] = [];

        for (let i = 0; i < amountOfVertices; i++) {
            const x = 75 + radius * Math.sin(i * angle);
            const y = 75 + radius * Math.cos(i * angle);
            vertices[i] = new Point(x, y);
        }

        const polygons = self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!.overlays.polygons;
        polygons.push(new Polygon(previousId === null ? self.jsonData.lastId + 1 : previousId, name, self.floor, PolygonType.ROOM, description, vertices));
        if (polygons.length > 1) {
            polygons[0].type = PolygonType.FLOOR;
        }

        if (previousId === null)
            self.jsonData.lastId += 1;
        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
    }

    /**
     * Adds an extra vertice to a polygon.
     */
    addVerticeToPolygon(event: any, self: CreateFloorComponent = this) {
        if (d3.event.ctrlKey || d3.event.metaKey) {
            function determineDistanceBetweenCoords(coords1: [number, number], coords2: [number, number]) {
                return Math.sqrt(Math.pow(coords2[0] - coords1[0], 2) + Math.pow(coords2[1] - coords1[1], 2));
            }

            const mouseCoordinates = d3.mouse(event);
            let clickedPolygon = d3.select(event);
            const clickedPolygonId = parseInt(clickedPolygon.attr("id"));
            let vertices: [number, number][] = clickedPolygon.attr("d").substring(1).split("L").map((elem: any) => elem.split(",").map((elem: any) => parseFloat(elem)));
            let distances = vertices.map((elem: any) => determineDistanceBetweenCoords(elem, mouseCoordinates));
            let indexOfClosestExistingPoint = distances.indexOf(Math.min(...distances));

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

            let floorNr: number = 0;

            for (let i = 0; i !== this.jsonData.floors.length; i++) {
                const index = this.jsonData.floors[i].overlays.polygons.map(elem => elem.id).indexOf(clickedPolygonId);
                if (index !== -1) {
                    this.jsonData.floors[i].overlays.polygons[index].points = vertices.map((elem: [number, number]) => new Point(elem[0], elem[1]));
                    floorNr = i;
                    break;
                }
            }

            self.loadData(this.jsonData.floors[floorNr]);
        }
    }

    removeFloor(): void {
        const newFloors = this.jsonData.floors.slice();
        for (let i = 0; i < this.jsonData.floors.length; i++) {
            if (newFloors[i].floor === this.floor) {
                newFloors.splice(i, 1);
                break;
            }
        }
        this.toastr.success(`Removed ${this.getFloorName()}!`, "", {positionClass: "toast-bottom-right"});
        this.jsonData.floors = newFloors;
        this.jsonData.nodes = this.jsonData.nodes.filter((node: GuidoNode) => this.floor !== node.floor);
    }

    previousWindowWidth = 0;

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

            this.mapData[this.imageLayer.id()] = [{
                url: this.imageUrl,
                x: 0,
                y: 0,
                width: this.mapWidth,
                height: this.mapHeight
            }];

            this.map = d3.floorplan().xScale(this.xScale).yScale(this.yScale);
            this.map.addLayer(this.imageLayer)
                .addLayer(this.overlays);

            if (!force)
                this.loadData(this.jsonData["floors"].find((f: any) => f.floor === this.floor)!);
        }
    }

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
                    self.loadData(self.jsonData["floors"].find((f: any) => f.floor === self.floor)!)
                }
            }
        }
    }

    getDoorDimensions(doorCoords: Point[]): { height: number, width: number } {
        const distance1 = Math.round(Math.sqrt(Math.pow(doorCoords[1].x - doorCoords[0].x, 2) + Math.pow(doorCoords[1].y - doorCoords[0].y, 2)));
        const distance2 = Math.round(Math.sqrt(Math.pow(doorCoords[2].x - doorCoords[1].x, 2) + Math.pow(doorCoords[2].y - doorCoords[1].y, 2)));
        return {
            height: distance1 > distance2 ? distance1 : distance2,
            width: distance1 > distance2 ? distance2 : distance1
        }
    }

    setNeighbors(id: number, neighbors: [string, boolean][], self: CreateFloorComponent = this): void {
        const elem = d3.select(`[id='${id}']`);
        let newNeighbors: number[] = [];
        for (const neighbor of neighbors) {
            newNeighbors.push(parseInt(neighbor[0]));
            const neighborElement = document.querySelector(`[id='${neighbor[0]}']`);
            if (neighborElement === null) {
                console.error(`The neighbor with id ${neighbor[0]} does not exist.`)
            } else {
                let neighborsNeighbors: number[] = neighborElement!.getAttribute("neighbors")!.split(",").filter((n: string) => n !== "").map((n: string) => parseInt(n));
                if (neighbor[1] && !neighborsNeighbors.includes(id)) {
                    neighborsNeighbors.push(id);
                } else if (!neighbor[1]) {
                    neighborsNeighbors = neighborsNeighbors.filter((n: number) => n !== id);
                }
                neighborElement.setAttribute("neighbors", neighborsNeighbors.join(","));
                self.saveNeighborsInJson(parseInt(neighbor[0]), neighborsNeighbors, self);
            }
        }
        elem.attr("neighbors", newNeighbors.join(","));
        self.saveNeighborsInJson(id, newNeighbors, self);

        self.setConnectingNeighbors(self);
    }

    /**
     * Saves the new neighbors list on the right place in the JSON
     * @param id The id of the node that you want to update
     * @param neighbors The new list of neighbors
     * @param self The instance of the CreateFloorClass
     */
    saveNeighborsInJson(id: number, neighbors: number[], self: CreateFloorComponent = this): void {
        const elem = d3.select(`[id='${id}']`);
        if (![NodeType.DOOR, NodeType.EMERGENCY_EXIT, NodeType.NODE].includes(elem.attr("type"))) {
            self.jsonData.floors[parseInt(elem.attr("floor"))].overlays.nodes.forEach((node: GuidoNode) => {
                if (node.id === id) {
                    node.neighbors = neighbors;
                }
            });
        }
    }

    setConnectingNeighbors(self: CreateFloorComponent = this): void {
        let group = d3.select("#demo" + self.floor + "lineGroup");
        group.selectAll("line").remove();
        let nodes: Element[] = Array.from(document.querySelectorAll("[node]")).filter(elem => parseInt(elem.getAttribute("floor")!) === self.floor);
        nodes.forEach((elem: Element) => {
            const origin = self.getConnectablePoint(parseInt(elem.id));
            const neighborsStr = elem.getAttribute("neighbors")!.split(",");

            let neighbors: number[];
            if (neighborsStr.length === 1 && neighborsStr[0] === "") {
                neighbors = [];
            } else {
                neighbors = neighborsStr.map((elem: string) => parseInt(elem));
            }

            neighbors.map((neighborId: number) => {
                const connectableNeighborPoint = self.getConnectablePoint(neighborId);
                const neighborNode = document.querySelector(`[id='${neighborId}']`);

                let isReciprical = false;
                if (neighborNode && String(neighborNode.getAttribute("neighbors")).split(",").some(neighborIdEntry => parseInt(neighborIdEntry) === parseInt(elem.id)))
                    isReciprical = true;

                group.append("line")
                    .attr("x1", origin.x)
                    .attr("y1", origin.y)
                    .attr("x2", connectableNeighborPoint.x)
                    .attr("y2", connectableNeighborPoint.y)
                    .attr("stroke", isReciprical ? "green" : "orange")
                    .attr("stroke-width", "5px")
                    .attr("marker-end", isReciprical ? "" : "url(#arrow)");
            });
        })
    }

    removeConnectingNeighbors(self: CreateFloorComponent = this) {
        let group = d3.select("#demo" + self.floor + "lineGroup");
        group.selectAll("line").remove();
    }

    getConnectablePoint(id: number): Point {
        let elem = d3.select(`[id='${id}']`);
        if (elem === null) {
            console.error(`The node with id ${id} does not exist.`);
        }
        switch (elem.attr("type")) {
            case NodeType.DOOR:
            case NodeType.EMERGENCY_EXIT:
                let points = CreateFloorComponent.arrayOfPointsFromPointString(elem.attr("points"));
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

    createPointOfInterest(nodeType: NodeType, neighbors: number[] = [], self: CreateFloorComponent = this): void {
        const origin = new Point(25, 25);

        const nodes = self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!.overlays.nodes;
        nodes.push(new GuidoNode(self.jsonData.lastId + 1, String(self.jsonData.lastId + 1), self.floor, origin, [], [], nodeType));

        self.jsonData.lastId += 1;
        self.loadData(self.jsonData.floors.find((f: Floor) => f.floor === self.floor)!);
    }

    /**
     * Creates a door
     */
    createDoor(previousId: number | null = null, height: number, width: number, previousPoints: string | null = null, name: string | null = "", neighbors: number[] = [], emergency: boolean = false, self: CreateFloorComponent = this): void {
        let origin = new Point(25, 25);

        if (previousPoints === null) {
            previousPoints = CreateFloorComponent.pointStringFromArrayOfPoints([
                origin,
                new Point(origin.x + width, origin.y),
                new Point(origin.x + width, origin.y + height),
                new Point(origin.x, origin.y + height)
            ]);
        }

        let door = d3.select("#doors" + self.floor)
            .append("polygon")
            .attr("id", previousId === null ? self.jsonData.lastId + 1 : previousId)
            .attr("points", previousPoints)
            .attr("width", width)
            .attr("height", height)
            .attr("type", emergency ? NodeType.EMERGENCY_EXIT : NodeType.DOOR)
            .attr("class", emergency ? NodeType.EMERGENCY_EXIT : NodeType.DOOR)
            .attr("node", "")
            .attr("neighbors", neighbors.join(","))
            .attr("name", name)
            .attr("removable", "")
            .attr("floor", self.floor)
            .attr("degreesRotated", 0)
            .on("contextmenu", self.rotateDoor)
            .call(d3.behavior.drag().on("drag", function () {
                if (!self.setNeighborMode) {
                    // @ts-ignore
                    self.moveDoorCoordinates(this)
                }
            }));

        door.node().addEventListener("click", (e: Event) => {
            if (self.editMode) {
                self.deleteMode = false;
                self.displayDialogBox("updateDoor", {
                    defaultValues: [
                        door.attr("name"), door.attr("height"), door.attr("width")
                    ], id: previousId === null ? self.jsonData.lastId + 1 : previousId
                })
            } else if (self.deleteMode && !self.setNeighborMode) {
                self.removeElement(e);
            }
        });

        door.node().addEventListener('dblclick', (event: Event) => self.openDisplayNeighborsDialog(event, self));

        if (previousId === null)
            self.jsonData.lastId += 1;
    }

    /**
     * Creates passThrough node
     */
    createNode(previousId: number | null = null, previousOrigin: Point | null = null, name: string, neighbors: number[] = [], self: CreateFloorComponent = this): void {
        let origin = previousOrigin === null ? new Point(25, 25) : previousOrigin;
        let radius = 5;

        let node = d3.select("#nodes" + self.floor)
            .append("circle")
            .attr("id", previousId === null ? self.jsonData.lastId + 1 : previousId)
            .attr('cx', origin.x)
            .attr('cy', origin.y)
            .attr('r', radius)
            .attr("floor", this.floor)
            .attr("name", name)
            .attr("neighbors", neighbors.join(","))
            .attr("node", "")
            .attr("type", NodeType.NODE)
            .attr("class", NodeType.NODE)
            .attr('stroke', 'black')
            .attr("removable", "")
            .attr('fill', '#ff0000')
            .on("mouseover", function () {
                // @ts-ignore
                d3.select(this)
                    .attr("r", 15);

                if (!self.setNeighborMode) {
                    // @ts-ignore
                    d3.select(this)
                        .style("opacity", 0.5);
                }
            })
            .on("mouseout", function () {
                // @ts-ignore
                d3.select(this)
                    .attr("r", 5);
                if (!self.setNeighborMode) {
                    // @ts-ignore
                    d3.select(this)
                        .style("opacity", 1);
                }
            })
            .call(d3.behavior.drag().on("drag", function () {
                if (!self.setNeighborMode) {
                    // @ts-ignore
                    self.moveNodeCoordinates(this);
                }
            }));

        node.node().addEventListener("click", (e: Event) => {
            if (self.deleteMode && !self.setNeighborMode) {
                self.removeElement(e);
            }
        });

        node.node().addEventListener('dblclick', (event: Event) => self.openDisplayNeighborsDialog(event, self));

        if (previousId === null)
            self.jsonData.lastId += 1;
    }

    /**
     * Opens the DialogBox for setNeighbors.
     *
     * @param event The event which triggered this function
     * @param self The instance of the class CreateFloorComponent
     */
    openDisplayNeighborsDialog(event: Event, self: CreateFloorComponent) {
        if (self.setNeighborMode) {
            const id = (event.target as Element).id === "" ? (event.target as Element).getAttribute("pointsOfInterestId") : (event.target as Element).id;
            if (id != null && id !== "") {
                const elem = document.getElementById(id)!;
                const neighbors = document.querySelector(`[id='${id}']`)!.getAttribute("neighbors");
                self.displayDialogBox("setNeighbors", {
                    id: id,
                    defaultValues: [neighbors === null ? [] :
                        neighbors!.split(",").filter((neighbor: string) => neighbor !== "")
                            .map((neighbor: string) => [neighbor, document.querySelector(`[id='${neighbor}']`)!.getAttribute("neighbors")!.split(",").includes(String(id))])],
                    /*
                     * The List of values has 3 [] because the first one is to group all possible input type fields
                     * (in this case there is only one), the second is to group all the input fields for the infinite
                     * field type (there are 2 fields in this case, but the checkbox doesn't need a select, so it is
                     * omitted) and the last one is to group all the different kind of groups of values
                     */
                    values: [[[
                        {
                            group: "Stairs",
                            values: this.jsonData.floors.filter((f: Floor) => (elem.getAttribute("type") === NodeType.STAIRS) ? (f.floor === this.floor - 1 || f.floor === this.floor + 1) : (f.floor === this.floor))
                                .map((f: Floor) => f.overlays.nodes)[0].flat(1)
                                .filter((g: GuidoNode) => g.type === NodeType.STAIRS)
                                .map((g: GuidoNode) => g.id)
                        },
                        {
                            group: "Lifts",
                            values: this.jsonData.floors.filter((f: Floor) => (elem.getAttribute("type") === NodeType.LIFT) ? (f.floor === this.floor - 1 || f.floor === this.floor + 1) : (f.floor === this.floor))
                                .map((f: Floor) => f.overlays.nodes)[0].flat(1)
                                .filter((g: GuidoNode) => g.type === NodeType.LIFT)
                                .map((g: GuidoNode) => g.id)
                        },
                        {
                            group: "Points of interest",
                            values: this.jsonData.floors.filter((f: Floor) => f.floor === this.floor)[0].overlays.nodes
                                .filter((p: GuidoNode) => ![NodeType.STAIRS, NodeType.LIFT].includes(p.type)).map((g: GuidoNode) => g.id)
                        },
                        {
                            group: "Doors",
                            values: Array.from(document.getElementById(`doors${this.floor}`)!.getElementsByTagName("polygon")).map((p: SVGPolygonElement) => p.id)
                            //values: this.jsonData.nodes.filter((g: GuidoNode) => g.floor === this.floor && (g.type === NodeType.DOOR || g.type === NodeType.EMERGENCY_EXIT)).map((g: GuidoNode) => g.id)
                        },
                        {
                            group: "Nodes",
                            values: Array.from(document.getElementById(`nodes${this.floor}`)!.getElementsByTagName("circle")).map((c: SVGCircleElement) => c.id)
                            //values: this.jsonData.nodes.filter((g: GuidoNode) => g.floor === this.floor && g.type === NodeType.NODE).map((g: GuidoNode) => g.id)
                        }
                    ]]]
                });
            }
        }
    }

    /**
     * Moves passThrough node
     */
    moveNodeCoordinates(self: this) {
        let node = d3.select(self);
        node.attr('cx', d3.event.x).attr('cy', d3.event.y)
    }

    /**
     * Moves the door according to drag, only executes on left click drag
     */
    moveDoorCoordinates(self: CreateFloorComponent): void {
        if (d3.event.sourceEvent.which === 1) {
            let door = d3.select(self);
            let width = parseFloat(door.attr("width"));
            let height = parseFloat(door.attr("height"));

            //Point used in reconstructing the polygon after dragging
            let toBuildFrom = new Point(parseFloat(d3.event.x), parseFloat(d3.event.y));

            let points = [
                toBuildFrom,
                new Point(toBuildFrom.x + width, toBuildFrom.y),
                new Point(toBuildFrom.x + width, toBuildFrom.y + height),
                new Point(toBuildFrom.x, toBuildFrom.y + height)
            ];

            let pointsString = CreateFloorComponent.pointStringFromArrayOfPoints(points);
            let degreesRotated = parseFloat(d3.select(self).attr("degreesRotated"));

            if (degreesRotated !== 0) {
                pointsString = CreateFloorComponent.calculateNewCoordinatesForRotation(pointsString, degreesRotated);
            }

            door.attr("points", pointsString);
        }
    }

    rotateDoor(): void {
        d3.event.preventDefault();

        let previousPoints = d3.select(this).attr("points");
        let result = CreateFloorComponent.calculateNewCoordinatesForRotation(previousPoints, 15);
        d3.select(this).attr("degreesRotated", parseFloat(d3.select(this).attr("degreesRotated")) + 15);

        d3.select(this).attr("points", result);
    }

    static calculateNewCoordinatesForRotation(previousPoints: string, degreesRotated: number): string {
        function rotatePoint(pointX: number, pointY: number, originX: number, originY: number, angle: number) {
            angle = angle * Math.PI / 180.0;
            return new Point(
                Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
                Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
            );
        }

        let poppedPoints: Point[] = CreateFloorComponent.arrayOfPointsFromPointString(previousPoints);

        let middleX = (poppedPoints[0].x + poppedPoints[2].x) / 2;
        let middleY = (poppedPoints[0].y + poppedPoints[2].y) / 2;

        let resultArray = poppedPoints.map((elem: Point) => rotatePoint(elem.x, elem.y, middleX, middleY, degreesRotated));
        return this.pointStringFromArrayOfPoints(resultArray);
    }

    static arrayOfPointsFromPointString(points: string): Point[] {
        let splitUpPoints = points.split(" ");
        let poppedPoints: Point[] = [];

        while (splitUpPoints.length !== 0) {
            let elems = splitUpPoints.pop()!.split(",");
            poppedPoints.push(new Point(parseFloat(elems[0]), parseFloat(elems[1])));
        }

        return poppedPoints
    }

    static pointStringFromArrayOfPoints(array: Point[]): string {
        return array.map(function (d: Point) {
            return [d.x, d.y].join(",");
        }).join(" ");
    }
}
