import {Component, OnInit} from '@angular/core';

declare var d3: any;

@Component({
    selector: 'create-map',
    templateUrl: './create-map.component.html',
    styles: [`
        @import "https://dciarletta.github.io/d3-floorplan/d3.floorplan.css";
    `]
})
export class CreateMapComponent implements OnInit {
    jsonData = {
        "overlays": {
            "polygons": [
                {
                    "id": "p1",
                    "name": "kitchen",
                    "points": [
                        {"x": 2.513888888888882, "y": 8.0},
                        {"x": 6.069444444444433, "y": 8.0},
                        {"x": 6.069444444444434, "y": 5.277535934291582},
                        {"x": 8.20833333333332, "y": 2.208151950718685},
                        {"x": 13.958333333333323, "y": 2.208151950718685},
                        {"x": 16.277777777777825, "y": 5.277535934291582},
                        {"x": 16.277777777777803, "y": 10.08151950718685},
                        {"x": 17.20833333333337, "y": 10.012135523613962},
                        {"x": 17.27777777777782, "y": 18.1387679671458},
                        {"x": 2.513888888888882, "y": 18.0}
                    ]
                }
            ]
        },

    };
    xScale = d3.scale.linear().domain([0, 50.0]).range([0, 720]);
    yScale = d3.scale.linear().domain([0, 33.79]).range([0, 487]);
    map = d3.floorplan().xScale(this.xScale).yScale(this.yScale);
    imageLayer = d3.floorplan.imagelayer();
    pathPlot = d3.floorplan.pathplot();
    overlays = d3.floorplan.overlays().editMode(true);
    mapData: any = {};

    constructor() {
    }

    ngOnInit() {
        this.mapData[this.imageLayer.id()] = [{
            url: 'https://dciarletta.github.io/d3-floorplan/Sample_Floorplan.jpg',
            x: 0,
            y: 0,
            height: 33.79,
            width: 50.0
        }];

        this.map.addLayer(this.imageLayer)
            .addLayer(this.overlays)
            .addLayer(this.pathPlot);

        this.loadData(this.jsonData);
    }

    loadData(data: any) {
        this.mapData[this.overlays.id()] = data.overlays;
        this.mapData[this.pathPlot.id()] = data.pathplot;

        d3.select("#demo").append("svg")
            .attr("height", 487).attr("width", 720)
            .datum(this.mapData).call(this.map);
    }

}
