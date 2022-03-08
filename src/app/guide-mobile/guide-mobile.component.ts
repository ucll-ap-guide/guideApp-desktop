import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
    selector: 'app-guide-mobile',
    templateUrl: 'guide-mobile.component.html',
    styleUrls: ['guide-mobile.component.css']
})
export class GuideMobileComponent implements OnInit {

    constructor(public router: Router) {
    }

    ngOnInit(): void {
    }

}
