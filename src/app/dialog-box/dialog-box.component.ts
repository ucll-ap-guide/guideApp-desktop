import {AfterViewInit, Component, Input} from '@angular/core';

@Component({
    selector: 'app-dialog-box',
    templateUrl: 'dialog-box.component.html',
    styles: []
})
export class DialogBoxComponent implements AfterViewInit {

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

    ngAfterViewInit(): void {
        const inputsDiv = <HTMLDivElement>document.getElementById(`${this.action}InputsFloor${this.floor}`);
        for (const formElement of this.formElements) {
            const label = document.createElement("label");
            if (formElement.name) {
                label.innerText = formElement.name + ":";
            }
            label.className = "text-white block mb-1";
            inputsDiv.appendChild(label);

            const elem = document.createElement(formElement.tagType ? formElement.tagType : "input");
            elem.className = "bg-white rounded-md py-1.5 px-2 mb-4";
            elem.onkeyup = (event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    this.successfullyCloseDialog();
                }
            };
            elem.required = formElement.required === true
            if (elem.nodeName === "INPUT") {
                (elem as HTMLInputElement).placeholder = formElement.name ? formElement.name : "";
                elem.type = formElement.inputType ? formElement.inputType : "text";
                if (formElement.inputType === "number") {
                    if (!isNaN(formElement.min)) {
                        elem.min = formElement.min;
                    }
                    elem.step = (isNaN(formElement)) ? 1 : formElement.step;
                }
            }
            if (formElement.defaultValue !== undefined) {
                elem.value = formElement.defaultValue
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
                this.confirmAction(null, null, inputFields[0].value, [], this.params.self);
                break;
            case "createNode":
                this.confirmAction(null, null, inputFields[0].value, [], this.params.self);
                break;
            case "setNeighbors":
                this.confirmAction(this.params.id, inputFields[0].value.split(",").map(elem => parseInt(elem)));
                break;
            default:
                console.error("This dialog action is currently not supported");
        }
        this.hideDialog();
    }
}
