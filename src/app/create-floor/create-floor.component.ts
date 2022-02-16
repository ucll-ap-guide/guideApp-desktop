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

        this.loadData(this.jsonData["floors"].find((f: any) => f.floor === this.floor));
    }

    getFloorName(): string {
        return this.jsonData["floors"].find((f: any) => f.floor === this.floor).name;
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

        this.jsonData["floors"].find((f: any) => f.floor === this.floor).overlays.polygons.push(temp);

        this.lastId++;

        d3.select("#demo" + this.floor).selectAll("*").remove();
        this.loadData(this.jsonData["floors"].find((f: any) => f.floor === this.floor));
    }
}
