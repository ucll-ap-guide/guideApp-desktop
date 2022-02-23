import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';

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

    /**
     * Fills the inputs with their defaultValues
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        const topLevelChildren = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div`);
        if (changes["params"] !== undefined && changes['params'].currentValue.defaultValues !== undefined) {
            const defaultValues = changes['params'].currentValue.defaultValues;
            for (let i = 0; i < changes['params'].currentValue.defaultValues.length; i++) {
                if (Array.isArray(defaultValues[i])) {
                    topLevelChildren.item(i).innerHTML = "";
                    let j;
                    for (j = 0; j < defaultValues[i].length; j++) {
                        const elem = this.createField(this.formElements[i], j);
                        if (elem.nodeName === "INPUT") {
                            (elem as HTMLInputElement).value = defaultValues[i][j];
                        }
                        topLevelChildren.item(i).appendChild(elem);
                    }
                    if (defaultValues[i][0] !== "") {
                        topLevelChildren.item(i).appendChild(this.createField(this.formElements[i], j));
                    }
                } else {
                    if (this.formElements[i].nodeName === "INPUT") {
                        (topLevelChildren.item(i) as HTMLInputElement).value = defaultValues[i];
                    }
                }
            }
        }
    }

    ngAfterViewInit(): void {
        const inputsDiv = <HTMLDivElement>document.getElementById(`${this.action}InputsFloor${this.floor}`);
        for (let i = 0; i < this.formElements.length; i++) {
            inputsDiv.appendChild(this.createLabel(this.formElements[i], String(i)));

            const elem = this.createField(this.formElements[i], i);
            if (this.formElements[i].infinite == true) {
                const container = document.createElement("div");
                container.id = `${this.action}InputsFloor${this.floor}${this.formElements[i].name}Container`
                container.className = "flex flex-col";
                container.setAttribute("infinite", String(i));
                container.appendChild(elem);
                inputsDiv.appendChild(container);
            } else {
                inputsDiv.appendChild(elem);
            }
        }
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                this.hideDialog();
            }
        });
        this.formElements.map((elem: any) => {
            if (elem.infinite === true) {
                inputsDiv.addEventListener("input", (event) => {
                    const input = (event.target as HTMLInputElement);
                    const inputsDiv = <HTMLDivElement>document.getElementById(`${this.action}InputsFloor${this.floor}${this.formElements[parseInt(input.parentElement!.getAttribute("infinite")!)].name}Container`)!;
                    if ((inputsDiv.lastChild as HTMLInputElement).id === input.id) {
                        const e = this.createField(this.formElements[0], inputsDiv.children.length);
                        inputsDiv.appendChild(e);
                    }
                });
            }
        });
    }

    createLabel(formElement: any, forId: string): HTMLLabelElement {
        const label = document.createElement("label");
        if (formElement.name) {
            label.innerText = formElement.name + ":";
        }
        label.className = "text-white block mb-1";
        label.htmlFor = forId;
        return label;
    }

    createField(formElement: any, id: number): Element {
        const elem = document.createElement(formElement.tagType ? formElement.tagType : "input");
        elem.id = `${this.action}Floor${this.floor}Input${id}`;
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
            elem.value = formElement.defaultValue;
        }
        return elem;
    }

    hideDialog(): void {
        const inputFields = document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!;
        inputFields.classList.replace("flex", "hidden");
        inputFields.querySelectorAll("input")!.forEach((inputField: HTMLInputElement) => {
            inputField.value = "";
        });
    }

    successfullyCloseDialog(): void {
        const topLevelChildren = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div`);
        switch (this.action) {
            case "createPolygonWithNVertices":
                this.confirmAction(null, (topLevelChildren[0] as HTMLInputElement).value, this.params.vertices, (topLevelChildren[1] as HTMLInputElement).value, this.params.self);
                break;
            case "createPolygon":
                if (!isNaN(parseInt((topLevelChildren[2] as HTMLInputElement).value))) {
                    this.confirmAction(null, (topLevelChildren[0] as HTMLInputElement).value, parseInt((topLevelChildren[2] as HTMLInputElement).value), (topLevelChildren[1] as HTMLInputElement).value, this.params.self);
                }
                break;
            case "createDoor":
                this.confirmAction(null, parseFloat((topLevelChildren[1] as HTMLInputElement).value), parseFloat((topLevelChildren[2] as HTMLInputElement).value), null, (topLevelChildren[0] as HTMLInputElement).value, [], this.params.emergency, this.params.self);
                break;
            case "createNode":
                this.confirmAction(null, null, (topLevelChildren[0] as HTMLInputElement).value, [], this.params.self);
                break;
            case "setNeighbors":
                this.confirmAction(this.params.id, Array.from((topLevelChildren[0] as HTMLDivElement).getElementsByTagName("input")).slice(0, -1).map((elem: HTMLInputElement) => elem.value), this.params.self);
                break;
            default:
                console.error("This dialog action is currently not supported");
        }
        this.hideDialog();
    }
}
