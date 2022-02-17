import {AfterViewInit, Component, Input} from '@angular/core';

declare var d3: any;

@Component({
    selector: 'app-create-floor',
    templateUrl: 'create-floor.component.html',
    styles: []
})
export class CreateFloorComponent implements AfterViewInit {

    @Input() jsonData: any;
    @Input() floor: any;
    lastId = 1;
    xScale = d3.scale.linear().domain([0, 50.0]).range([0, 720]);
    yScale = d3.scale.linear().domain([0, 33.79]).range([0, 487]);
    map = d3.floorplan().xScale(this.xScale).yScale(this.yScale);
    imageLayer = d3.floorplan.imagelayer();
    overlays = d3.floorplan.overlays().editMode(true);
    mapData: any = {};

    constructor() {
    }

    ngAfterViewInit(): void {
        this.mapData[this.imageLayer.id()] = [{
            url: 'https://dciarletta.github.io/d3-floorplan/Sample_Floorplan.jpg',
            x: 0,
            y: 0,
            height: 33.79,
            width: 50.0
        }];

        this.map.addLayer(this.imageLayer)
            .addLayer(this.overlays)

        this.loadData(this.jsonData["floors"].find((f: any) => f.floor === this.floor));

        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "doors" + this.floor);
    }

    getFloorName(): string {
        return this.jsonData["floors"].find((f: any) => f.floor === this.floor).name;
    }

    loadData(data: any) {
        let elementsToBeSaved = Array.from(document.querySelectorAll('.door'));
        d3.select("#demo" + this.floor).selectAll("*").remove();

        this.mapData[this.overlays.id()] = data.overlays;

        d3.select("#demo" + this.floor).append("svg")
            .attr("height", 487).attr("width", 720)
            .datum(this.mapData).call(this.map);

        d3.select("#demo" + this.floor).select("svg").append("g").attr("id", "doors" + this.floor);
        elementsToBeSaved.filter(elem => elem.getAttribute("class") === "door")
            .map(elem => this.createDoor(elem.getAttribute("points"), elem.getAttribute("name")));
    }

    createPolygon(input: number | null) {
        let name = window.prompt("Enter the room's name: ") + "";
        let nVertices = input === null ? parseInt(window.prompt("Enter the number of vertices: ") + "") : input;

        let radius = 2;
        let angle = Math.PI * 2 / nVertices;
        let vertices = [];

        for (let i = 0; i < nVertices; i++) {
            const x = 5 + radius * Math.sin(i * angle);
            const y = 5 + radius * Math.cos(i * angle);
            vertices[i] = {"x": x, "y": y};
        }

        let temp = {
            "id": this.lastId + 1,
            "name": name,
            "type": "room",
            "description": "iets",
            "points": vertices
        };

        this.jsonData["floors"].find((f: any) => f.floor === this.floor).overlays.polygons.push(temp);
        this.lastId++;


        this.loadData(this.jsonData["floors"].find((f: any) => f.floor === this.floor));

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

    createDoor(previousPoints: string | null = null, previousName: string | null = null) {
        let doorName = previousName === null ? window.prompt("Door's name: ") : previousName;
        let origin = {"x": 25, "y": 25};
        let width = 50;
        let height = 15;

        let points = [
            origin,
            {"x": origin.x + width, "y": origin.y},
            {"x": origin.x + width, "y": origin.y + height},
            {"x": origin.x, "y": origin.y + height}];

        let pointsString = points.map(function (d) {
            return [d.x, d.y].join(",");
        }).join(" ");

        d3.select("#doors" + this.floor)
            .append("polygon")
            .attr("points", previousPoints === null ? pointsString : previousPoints)
            .attr("width", width)
            .attr("height", height)
            .attr("class", "door")
            .attr("name", doorName)
            .attr("degreesRotated", 0)
            .on("contextmenu", this.rotateDoor)
            .call(d3.behavior.drag().on("drag", this.moveDoorCoordinates));
    }

    moveDoorCoordinates() {
        if (d3.event.sourceEvent.which === 1) {
            let door = d3.select(this);
            let width = parseFloat(door.attr("width"));
            let height = parseFloat(door.attr("height"));

            let toBuildFrom = {"x": parseFloat(d3.event.x), "y": parseFloat(d3.event.y)};

            let points = [
                toBuildFrom,
                {"x": toBuildFrom.x + width, "y": toBuildFrom.y},
                {"x": toBuildFrom.x + width, "y": toBuildFrom.y + height},
                {"x": toBuildFrom.x, "y": toBuildFrom.y + height}];

            let pointsString = points.map(function (d: { "x": number, "y": number }) {
                return [d.x, d.y].join(",");
            }).join(" ");

            let degreesRotated = parseFloat(d3.select(this).attr("degreesRotated"));

            if (degreesRotated !== 0) {
                pointsString = CreateFloorComponent.calculateNewCoordinatesForRotation(pointsString, degreesRotated);
            }

            door.attr("points", pointsString);
        }
    }

    rotateDoor() {
        d3.event.preventDefault();

        let previousPoints = d3.select(this).attr("points");
        let result = CreateFloorComponent.calculateNewCoordinatesForRotation(previousPoints, 15);
        d3.select(this).attr("degreesRotated", parseFloat(d3.select(this).attr("degreesRotated")) + 15);

        d3.select(this).attr("points", result);
    }

    static calculateNewCoordinatesForRotation(previousPoints: string, degreesRotated: number) {
        function rotatePoint(pointX: number, pointY: number, originX: number, originY: number, angle: number) {
            angle = angle * Math.PI / 180.0;
            return {
                x: Math.cos(angle) * (pointX - originX) - Math.sin(angle) * (pointY - originY) + originX,
                y: Math.sin(angle) * (pointX - originX) + Math.cos(angle) * (pointY - originY) + originY
            };
        }

        let splitUpPreviousPoints = previousPoints.split(" ");
        let poppedPoints = [];

        while (splitUpPreviousPoints.length !== 0) {
            // @ts-ignore
            let elems = splitUpPreviousPoints.pop().split(",");
            poppedPoints.push([parseFloat(elems[0]), parseFloat(elems[1])]);
        }

        let middleX = (poppedPoints[0][0] + poppedPoints[2][0]) / 2;
        let middleY = (poppedPoints[0][1] + poppedPoints[2][1]) / 2;

        let resultArray = poppedPoints.map(elem => rotatePoint(elem[0], elem[1], middleX, middleY, degreesRotated));

        return resultArray.map(function (d) {
            return [d.x, d.y].join(",");
        }).join(" ");
    }
}
