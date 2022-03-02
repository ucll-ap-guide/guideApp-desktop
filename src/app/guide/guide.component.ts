import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'guide',
  templateUrl: 'guide.component.html',
  styles: [
  ]
})
export class GuideComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit(): void {
  }

}
