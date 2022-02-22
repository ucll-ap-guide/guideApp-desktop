import {AfterViewInit, Component, HostListener, Input} from '@angular/core';
import {Point} from "../model/point";
import {GuidoNode} from "../model/guido-node";
import {GuidoMap} from "../model/guido-map";
import {Polygon} from "../model/polygon";
import {Floor} from "../model/floor";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";

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
    @Input() setNeighborMode: boolean = false;
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
    paramsToGiveToDialogBoxes: any = {};

    constructor() {
    }

    ngAfterViewInit(): void {
        this.regenerateFloorMap(true);

        this.jsonData.nodes.filter((elem: GuidoNode) => elem.floor === this.floor && elem.type === NodeType.DOOR).map((elem: GuidoNode) => {
            this.createDoor(elem.id, CreateFloorComponent.pointStringFromArrayOfPoints(elem.displayPoints), elem.name, elem.neighbors);
        });

        this.jsonData.nodes.filter((elem: GuidoNode) => elem.floor === this.floor && elem.type === NodeType.NODE).map((elem: GuidoNode) => {
            this.createNode(elem.id, elem.point, elem.name, elem.neighbors);
        });
    }

    getFloorName(): string {
        return this.jsonData["floors"].find((f: Floor) => f.floor === this.floor)!.name;
    }

    getNodeTypes(): string[] {
        const nodeTypes: string[] = [];
        for (const nodeTypesKey of Object.values(NodeType)) {
            nodeTypes.push(nodeTypesKey);
        }
        return nodeTypes;
    }

    /**
     * (Re)loads all elements displayed on the drawing area of the floor
     * @param data
     */
    loadData(data: Floor): void {
        let elementsToBeSaved = Array.from(document.querySelectorAll('.door'));
        elementsToBeSaved = elementsToBeSaved.concat(Array.from(document.querySelectorAll('.node')));
        d3.select("#demo" + this.floor).selectAll("*").remove();

        this.mapData[this.overlays.id()] = data.overlays;

        d3.select("#demo" + this.floor).append("svg")
            .attr("height", this.mapHeight)
            .attr("width", this.mapWidth)
            .datum(this.mapData)
            .call(this.map);

        this.reloadAllNodes(elementsToBeSaved);

        document.querySelectorAll("[removable]").forEach(elem =>
            elem.addEventListener("click", (e) => {
                if (this.deleteMode)
                    this.removeElement(e);
            }));

        d3.select("#demo" + this.floor).select("svg").on("dblclick.zoom", null);
    }

    /**
     * Removes an element based upon its type, given the click event that triggered the remove function
     * @param e
     */
    removeElement(e: any) {
        if (e.target) {
            let id = parseInt(e.target.getAttribute("id"));
            let type = e.target.getAttribute("type");
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
                    let door = document.getElementById(String(id));
                    if (door) {
                        this.removeNodeFromNeighborData(id);
                        door.remove();
                    }
                    break;

                case NodeType.NODE:
                    let node = document.getElementById(String(id));
                    if (node) {
                        this.removeNodeFromNeighborData(id);
                        node.remove();
                    }
                    break;

                default:
                    console.error(`Element type ${type} is unknown.`);
            }
        }
        this.loadData(this.jsonData["floors"].find((f: Floor) => f.floor === this.floor)!);
    }

    removeNodeFromNeighborData(id: number) {
        this.jsonData.nodes.forEach(elem => {
            let removeIndex = elem.neighbors.indexOf(id);

            if (removeIndex !== -1)
                this.jsonData.nodes.splice(removeIndex, 1);
        });
    }

    /**
     * Reloads all elements stored in the nodes Array in jsonData
     * @param elementsToBeSaved
     */
    reloadAllNodes(elementsToBeSaved: Element[]): void {
        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "doors" + this.floor);
        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "nodes" + this.floor);
        this.observer = new MutationObserver(this.setZoom);
        this.observer.observe(document.getElementsByClassName("map-layers")[0] as Node, {attributes: true})

        elementsToBeSaved.filter(elem => elem.getAttribute("class") === NodeType.DOOR)
            .filter(elem => parseInt(String(elem.getAttribute("floor"))) === this.floor)
            .map(elem => this.createDoor(parseInt(elem.getAttribute("id") + ""), elem.getAttribute("points"), elem.getAttribute("name")));

        elementsToBeSaved.filter(elem => elem.getAttribute("class") === NodeType.NODE)
            .filter(elem => parseInt(String(elem.getAttribute("floor"))) === this.floor)
            .map(elem => this.createNode(parseInt(elem.getAttribute("id") + ""), new Point(parseFloat(String(elem.getAttribute("cx"))), parseFloat(String(elem.getAttribute("cy")))), String(elem.getAttribute("name"))));

    }

    displayDialogBox(action: string, params: {}) {
        this.paramsToGiveToDialogBoxes = params;
        this.paramsToGiveToDialogBoxes.self = this;
        document.getElementById(`${action}DialogBoxFloor${this.floor}`)!.classList.replace("hidden", "flex");
    }

    /**
     * Function used to zoom non floor plan objects to the same level as floor plan objects
     * @param mutationsList
     */
    setZoom = (mutationsList: MutationRecord[]) => {
        for (const mutation of mutationsList) {
            if (
                mutation.type !== "attributes" ||
                mutation.attributeName !== "transform"
            ) {
                break;
            }
            // @ts-ignore
            d3.select("#doors" + this.floor).attr('transform', mutation.target.getAttribute("transform"));
            // @ts-ignore
            d3.select("#nodes" + this.floor).attr('transform', mutation.target.getAttribute("transform"));
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
        polygons.push(new Polygon(previousId ? previousId : self.jsonData.lastId + 1, name, self.floor, PolygonType.ROOM, description, vertices));
        if (polygons.length > 1) {
            polygons[0].type = PolygonType.FLOOR;
        }

        if (previousId !== null)
            self.jsonData.lastId += 1;
        self.loadData(self.jsonData["floors"].find((f: Floor) => f.floor === self.floor)!);
    }

    removeFloor(): void {
        const newFloors = this.jsonData.floors.slice();
        for (let i = 0; i < this.jsonData.floors.length; i++) {
            if (this.floor === newFloors[i].floor) {
                newFloors.splice(i, 1);
                break;
            }
        }
        this.jsonData.floors = newFloors;
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
                }
            }
        }
    }

    createDoor(previousId: number | null = null, previousPoints: string | null = null, name: string | null = "", neighbors: number[] = [], self: CreateFloorComponent = this): void {
        let origin = new Point(25, 25);
        let width = 50;
        let height = 15;

        let points = [
            origin,
            new Point(origin.x + width, origin.y),
            new Point(origin.x + width, origin.y + height),
            new Point(origin.x, origin.y + height)
        ];

        let pointsString = CreateFloorComponent.pointStringFromArrayOfPoints(points)

        let door = d3.select("#doors" + self.floor)
            .append("polygon")
            .attr("id", previousId === null ? self.jsonData.lastId + 1 : previousId)
            .attr("points", previousPoints === null ? pointsString : previousPoints)
            .attr("width", width)
            .attr("height", height)
            .attr("type", NodeType.DOOR)
            .attr("class", NodeType.DOOR)
            .attr("node", "")
            .attr("neighbors", neighbors.join(","))
            .attr("name", name)
            .attr("removable", "")
            .attr("floor", self.floor)
            .attr("degreesRotated", 0)
            .on("contextmenu", self.rotateDoor)
            .call(d3.behavior.drag().on("drag", function(){
                if (!self.setNeighborMode) { // @ts-ignore
                    self.moveDoorCoordinates(this)
                }
            }));

        door.node().addEventListener("click", (e: Event) => {
            if (self.deleteMode && !self.setNeighborMode)
                self.removeElement(e);
        });

        door.node().addEventListener('dblclick', function (e: Event) {
            if (self.setNeighborMode) {
                self.displayDialogBox("setNeighbors", {id: (e.target as Element).id})
            }
        });

        if (previousId === null)
            self.jsonData.lastId += 1;
    }

    setNeighbors(id: number, neighbors: string) {
        let elem = document.getElementById(String(id))
        if (elem !== null)
            elem.setAttribute("neighbors", neighbors)
    }

    /**
     * Creates passThrough node
     */
    createNode(previousId: number | null = null, previousOrigin: Point | null = null, name: string, neighbors: number[] = [], self: any = this): void {
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
                    .attr("r", 15)
                    .style("opacity", 0.5);
            })
            .on("mouseout", function () {
                // @ts-ignore
                d3.select(this)
                    .attr("r", 5)
                    .style("opacity", 1)
            })
            .call(d3.behavior.drag().on("drag", function() {
                if (!self.setNeighborMode) { // @ts-ignore
                    self.moveNodeCoordinates(this)
                }
            }));

        node.node().addEventListener("click", (e: Event) => {
            if (self.deleteMode && !self.setNeighborMode)
                self.removeElement(e);
        });

        node.node().addEventListener('dblclick', function (e: Event) {
            if (self.setNeighborMode) {
                self.displayDialogBox("setNeighbors", {id: (e.target as Element).id})
            }
        });

        if(previousId === null)
            self.jsonData.lastId += 1;
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
    moveDoorCoordinates(self: any): void {
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

        let splitUpPreviousPoints = previousPoints.split(" ");
        let poppedPoints: Point[] = [];

        while (splitUpPreviousPoints.length !== 0) {
            let elems = splitUpPreviousPoints.pop()!.split(",");
            poppedPoints.push(new Point(parseFloat(elems[0]), parseFloat(elems[1])));
        }

        let middleX = (poppedPoints[0].x + poppedPoints[2].x) / 2;
        let middleY = (poppedPoints[0].y + poppedPoints[2].y) / 2;

        let resultArray = poppedPoints.map((elem: Point) => rotatePoint(elem.x, elem.y, middleX, middleY, degreesRotated));
        return this.pointStringFromArrayOfPoints(resultArray);
    }

    static pointStringFromArrayOfPoints(array: Point[]): string {
        return array.map(function (d: Point) {
            return [d.x, d.y].join(",");
        }).join(" ");
    }
}
