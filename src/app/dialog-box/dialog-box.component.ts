import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import input from "postcss/lib/input";

@Component({
    selector: 'app-dialog-box',
    templateUrl: 'dialog-box.component.html',
    styles: []
})
export class DialogBoxComponent implements AfterViewInit, OnChanges {

    @Input() action!: string;
    @Input() floor!: number;
    @Input() title!: string;
    @Input() dialogText!: string;
    @Input() confirmButtonText!: string;
    @Input() confirmAction!: Function;
    @Input() params: any;
    @Input() formElements: any[] = [];

    constructor() {
    }

    ngOnChanges(changes: SimpleChanges): void {
        const inputsDiv = document.getElementById(`${this.action}InputsFloor${this.floor}`);
        if (changes["params"] !== undefined && changes['params'].currentValue.defaultValues !== undefined) {
            const inputElements = inputsDiv!.getElementsByTagName("input");
            const defaultValues = changes['params'].currentValue.defaultValues;
            for (let i = 0; i < defaultValues.length; i++) {
                inputElements[i].value = defaultValues[i];
            }
        }
    }

    ngAfterViewInit(): void {
        const inputsDiv = <HTMLDivElement>document.getElementById(`${this.action}InputsFloor${this.floor}`);
        for (let i = 0; i < this.formElements.length; i++) {
            const label = document.createElement("label");
            if (this.formElements[i].name) {
                label.innerText = this.formElements[i].name + ":";
            }
            label.className = "text-white block mb-1";
            inputsDiv.appendChild(label);

            const elem = document.createElement(this.formElements[i].tagType ? this.formElements[i].tagType : "input");
            elem.className = "bg-white rounded-md py-1.5 px-2 mb-4";
            elem.onkeyup = (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    this.successfullyCloseDialog();
                }
            };
            elem.required = this.formElements[i].required === true
            if (elem.nodeName === "INPUT") {
                (elem as HTMLInputElement).placeholder = this.formElements[i].name ? this.formElements[i].name : "";
                elem.type = this.formElements[i].inputType ? this.formElements[i].inputType : "text";
                if (this.formElements[i].inputType === "number") {
                    if (!isNaN(this.formElements[i].min)) {
                        elem.min = this.formElements[i].min;
                    }
                    elem.step = (isNaN(this.formElements[i])) ? 1 : this.formElements[i].step;
                }
            }
            if (this.formElements[i].defaultValue !== undefined) {
                elem.value = this.formElements[i].defaultValue;
            }
            inputsDiv.appendChild(elem);
        }
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                this.hideDialog();
            }
        });
    }

    hideDialog(): void {
        const inputFields = document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!;
        inputFields.classList.replace("flex", "hidden");
        inputFields.querySelectorAll("input")!.forEach((inputField: HTMLInputElement) => {
            inputField.value = "";
        });
    }

    successfullyCloseDialog(): void {
        const inputFields = document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.getElementsByTagName("input");
        switch (this.action) {
            case "createPolygonWithNVertices":
                this.confirmAction(null, inputFields[0].value, this.params.vertices, inputFields[1].value, this.params.self);
                break;
            case "createPolygon":
                if (!isNaN(parseInt(inputFields[2].value))) {
                    this.confirmAction(null, inputFields[0].value, parseInt(inputFields[2].value), inputFields[1].value, this.params.self);
                }
                break;
            case "createDoor":
                this.confirmAction(null, parseFloat(inputFields[1].value), parseFloat(inputFields[2].value), null, inputFields[0].value, [], this.params.emergency, this.params.self);
                break;
            case "createNode":
                this.confirmAction(null, null, inputFields[0].value, [], this.params.self);
                break;
            case "setNeighbors":
                this.confirmAction(this.params.id, inputFields[0].value.split(",").map(elem => parseInt(elem)), this.params.self);
                break;
            default:
                console.error("This dialog action is currently not supported");
        }
        this.hideDialog();
    }
}
