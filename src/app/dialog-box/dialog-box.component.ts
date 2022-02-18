import {Component, HostListener, Input, OnInit} from '@angular/core';

@Component({
    selector: 'app-dialog-box',
    templateUrl: 'dialog-box.components.html',
    styles: []
})
export class DialogBoxComponent implements OnInit {

    @Input() action!: string;
    @Input() title!: string;
    @Input() dialogText!: string;
    @Input() confirmButtonText!: string;
    @Input() confirmAction!: Function;
    @Input() params: any;
    inputValue: any;

    constructor() {
    }

    ngOnInit(): void {
    }

    hideDialog(): void {
        document.getElementById(this.action + "DialogBox")!.classList.replace("flex", "hidden");
    }

    @HostListener('keydown.enter')
    successfullyCloseDialog(): void {
        this.hideDialog();
        switch (this.action) {
            case "createPolygon":
                this.confirmAction(this.inputValue, this.params.vertices, this.params.self);
                break;
            case "createDoor":
                this.confirmAction(null, this.inputValue, this.params.self);
                break;
            default:
                console.error("This dialog action is currently no supported");
        }
    }
}
