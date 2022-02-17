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
            .addLayer(this.overlays);

        this.loadData(this.jsonData["mapJSON"]["floors"].find((f: any) => f.floor === this.floor));
    }

    getFloorName(): string {
        return this.jsonData["mapJSON"]["floors"].find((f: any) => f.floor === this.floor).name;
    }

    loadData(data: any) {
        this.mapData[this.overlays.id()] = data.overlays;

        d3.select("#demo" + this.floor).append("svg")
            .attr("height", 487).attr("width", 720)
            .datum(this.mapData).call(this.map);
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

        this.jsonData["mapJSON"]["floors"].find((f: any) => f.floor === this.floor).overlays.polygons.push(temp);

        this.lastId++;

        d3.select("#demo" + this.floor).selectAll("*").remove();
        this.loadData(this.jsonData["mapJSON"]["floors"].find((f: any) => f.floor === this.floor));
    }

    removeFloor(): void {
        const newFloors = this.jsonData.mapJSON.floors.slice();
        for (let i = 0; i < this.jsonData.mapJSON.floors.length; i++) {
            if (this.floor === newFloors[i].floor) {
                newFloors.splice(i, 1);
                break;
            }
        }
        this.jsonData.mapJSON.floors = newFloors;
    }

    createDoor() {
        let origin = {"x":25,"y":25};
        let width = 50;
        let height = 15;

        let points = [
            origin,
            {"x":origin.x + width,"y":origin.y},
            {"x":origin.x + width, "y":origin.y + height},
            {"x":origin.x,"y":origin.y + height}];

        let pointsString = points.map(function(d) {
            return [d.x,d.y].join(",");
        }).join(" ");

        d3.select("#demo" + this.floor)
            .select("svg")
            .select(".map-layers")
            .select(".overlays")
            .select("g")
            .append("polygon")
            .attr("points", pointsString)
            .attr("width", width)
            .attr("height", height)
            .attr("class", "door")
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

            door.attr("points", pointsString);
        }
     }

    rotateDoor() {
        d3.event.preventDefault();

        function rotatePoint(pointX: number, pointY: number, originX: number, originY: number, angle: number) {
            angle = angle * Math.PI / 180.0;
            let result = {
                x: Math.cos(angle) * (pointX-originX) - Math.sin(angle) * (pointY-originY) + originX,
                y: Math.sin(angle) * (pointX-originX) + Math.cos(angle) * (pointY-originY) + originY
            };

            console.log(pointX, pointY, originX, originY, angle);

            return result;
        }

        let previousPoints = d3.select(this).attr("points");
        let splitUpPreviousPoints = previousPoints.split(" ");
        let prevAngle = parseFloat(d3.select(this).attr("prevAngle"));
        let poppedPoints = [];

        while (splitUpPreviousPoints.length !== 0) {
            let elems = splitUpPreviousPoints.pop().split(",");
            poppedPoints.push([parseFloat(elems[0]), parseFloat(elems[1])]);
        }

        let middleX = (poppedPoints[0][0] + poppedPoints[2][0]) / 2;
        let middleY = (poppedPoints[0][1] + poppedPoints[2][1]) / 2;

        let resultArray = poppedPoints.map(elem => rotatePoint(elem[0], elem[1], middleX, middleY, 15));

        let pointsString = resultArray.map(function(d) {
            return [d.x,d.y].join(",");
        }).join(" ");

        d3.select(this).attr("points", pointsString);
     }
}
