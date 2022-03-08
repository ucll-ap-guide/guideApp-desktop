import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
    selector: 'guide',
    templateUrl: 'guide-desktop.component.html',
    styles: []
})
export class GuideDesktopComponent implements OnInit {

    constructor(public router: Router) {
    }

    ngOnInit(): void {
    }

}
