import {Component, OnInit} from '@angular/core';

@Component({
    selector: 'create-map',
    templateUrl: './create-map.component.html',
    styles: [`
        @import "https://dciarletta.github.io/d3-floorplan/d3.floorplan.css";
    `]
})
export class CreateMapComponent implements OnInit {
    jsonData = {
        "name": "",
        "floors": [] as { floor: number, name: string, height: number, overlays: { polygons: { name: string, points: { x: number, y: number }[] }[] } }[]
    };

    constructor() {
    }

    ngOnInit() {
    }

    addFloor(
        floor: number = parseInt((<HTMLInputElement>document.getElementById("floorNumber")).value),
        name: string = (<HTMLInputElement>document.getElementById("floorName")).value,
        height: number = parseFloat((<HTMLInputElement>document.getElementById("floorHeight")).value)
    ) {
        if (!isNaN(floor) && name !== "" && !isNaN(height)) {
            this.jsonData.floors.push({
                "floor": floor,
                "name": name,
                "height": height,
                "overlays": {
                    "polygons": []
                }
            });
        }
    }

}
