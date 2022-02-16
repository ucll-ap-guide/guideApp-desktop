import {Component, OnInit} from '@angular/core';
import {MapService} from "../map.service";

@Component({
    selector: 'create-map',
    templateUrl: './create-map.component.html',
    styles: [`
        @import "https://dciarletta.github.io/d3-floorplan/d3.floorplan.css";
    `]
})
export class CreateMapComponent implements OnInit {
    jsonData = {
        "name": "UCLL",
        "floors": [] as { floor: number, name: string, height: number, overlays: { polygons: { name: string, points: { x: number, y: number }[] }[] } }[]
    };
    mapNames: string[] = [];
    initializedMap: boolean = false;
    createFloorForm = {
        floor: 0,
        name: "Verdieping 0",
        height: 2.5
    };

    constructor(private mapService: MapService) {
    }

    ngOnInit() {
        const self = this;
        document.getElementById("uploadedMapFromComputer")!.onchange = function (event) {
            const reader = new FileReader();
            reader.onload = function (event: ProgressEvent<FileReader>) {
                let tempName = self.jsonData.name;
                self.jsonData = JSON.parse(<string>event.target!.result);
                self.jsonData.name = tempName;
            }
            if ((event.target as HTMLInputElement)!.files!.length > 0) {
                reader.readAsText((event.target as HTMLInputElement)!.files![0]);
            }
        };
    }

    createMap(): void {
        if (this.jsonData.name !== "") {
            this.initializedMap = true;
        }
    }

    addFloor(
        floor: number = this.createFloorForm.floor,
        name: string = this.createFloorForm.name,
        height: number = this.createFloorForm.height
    ): void {
        if (!isNaN(floor) && name !== "" && !isNaN(height) && !this.jsonData.floors.find((f: any) => f.floor === floor)) {
            this.jsonData.floors.push({
                "floor": floor,
                "name": name,
                "height": height,
                "overlays": {
                    "polygons": []
                }
            });
            this.createFloorForm.floor++;
            this.createFloorForm.name = "Verdieping " + this.createFloorForm.floor
        }
    }

    async getMapNames(): Promise<any> {
        this.mapService.getAllMapNames().subscribe((mapNames: any) => {
            this.mapNames = mapNames;
        });
    }

    saveMapRemotely(): void {
        this.mapService.addMap(JSON.parse(JSON.stringify(this.jsonData))).subscribe();
    }

    displayEditMapDialog(display: boolean): void {
        this.getMapNames().then(() => {
            if (display) {
                document.getElementById("editMapDialog")!.classList.replace("hidden", "flex");
            } else {
                document.getElementById("editMapDialog")!.classList.replace("flex", "hidden");
            }
        });
    }

    editMap(name: string = (<HTMLSelectElement>document.getElementById("editMapSelect")).value): void {
        this.displayEditMapDialog(false);
        document.getElementById("submitMap")!.innerText = "Update map";
        this.mapService.getMap(name).subscribe((v) => {
            this.jsonData = v;
        });
    }

    clearMap(): void {
        this.jsonData = {
            "name": "",
            "floors": []
        };
    }
}
