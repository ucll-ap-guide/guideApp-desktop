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
                        const group = this.createInfiniteFieldsGroup(this.formElements[i].infinite, j);
                        const groupInputFields = group.getElementsByTagName("input");
                        for (let k = 0; k < groupInputFields.length; k++) {
                            // Check needed for future extension where select fields can also be generated
                            if (groupInputFields[k].nodeName === "INPUT") {
                                if (this.formElements[i].infinite[k].inputType === "checkbox") {
                                    (groupInputFields[k] as HTMLInputElement).checked = defaultValues[i][j][k];
                                } else {
                                    (groupInputFields[k] as HTMLInputElement).value = defaultValues[i][j][k];
                                }
                            }
                        }
                        topLevelChildren.item(i).appendChild(group);
                    }
                    if (defaultValues[i][0][0] !== "") {
                        topLevelChildren.item(i).appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, j));
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
            if (Array.isArray(this.formElements[i].infinite)) {
                // Container containing all the groups of input fields
                const container = document.createElement("div");
                container.id = `${this.action}InputsFloor${this.floor}Infinite${i}Container`
                container.className = "flex flex-col";
                container.setAttribute("infinite", String(i));

                container.appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, i));

                inputsDiv.appendChild(container);

                // Listen to changes in input fields and adds fields if necessary
                inputsDiv.addEventListener("input", (event) => {
                    const input = (event.target as HTMLInputElement);
                    const inputsFields = Array.from(input.parentElement!.parentElement!.querySelectorAll("div:last-of-type>input"));
                    for (let i = 0; i < inputsFields.length; i++) {
                        if ((inputsFields[i] as HTMLInputElement).id === input.id) {
                            input.parentElement!.parentElement!.appendChild(this.createInfiniteFieldsGroup(this.formElements[0].infinite, inputsFields[i].parentElement!.parentElement!.children.length));
                        }
                    }
                });
            } else {
                inputsDiv.appendChild(this.createLabel(this.formElements[i], String(i)));
                inputsDiv.appendChild(this.createField(this.formElements[i], String(i)));
            }
        }
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.addEventListener('click', e => {
            if (e.target === e.currentTarget) {
                this.hideDialog();
            }
        });
    }

    createInfiniteFieldsGroup(infiniteFormElements: any[], upperLevelPosition: number): HTMLDivElement {
        const group = document.createElement("div");
        for (let j = 0; j < infiniteFormElements.length; j++) {
            const label = this.createLabel(infiniteFormElements[j], `${upperLevelPosition}SubInput${j}`);
            const field = this.createField(infiniteFormElements[j], `${upperLevelPosition}SubInput${j}`);

            if (infiniteFormElements[j].inputType !== "checkbox") group.appendChild(label);
            group.appendChild(field);
            if (infiniteFormElements[j].inputType === "checkbox") group.appendChild(label);
        }
        return group;
    }

    createLabel(formElement: any, forId: string): HTMLLabelElement {
        const label = document.createElement("label");
        if (formElement.name) {
            label.innerText = formElement.name + ":";
        }
        label.className = (formElement.inputType === "checkbox" ? "" : "block ") + "text-white mb-1";
        label.htmlFor = `${this.action}Floor${this.floor}Input${forId}`;
        return label;
    }

    createField(formElement: any, id: string): Element {
        const elem = document.createElement(formElement.tagType ? formElement.tagType : "input");
        elem.id = `${this.action}Floor${this.floor}Input${id}`;
        elem.className = (formElement.inputType === "checkbox" ? "inline mr-1" : "block") + " bg-white rounded-md py-1.5 px-2 mb-4";
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
                this.confirmAction(this.params.id, Array.from((topLevelChildren[0] as HTMLDivElement).getElementsByTagName("input")).slice(0, -1 * this.formElements[0].infinite.length).filter((e: HTMLInputElement) => e.type !== "checkbox").map((elem: HTMLInputElement) => elem.value), this.params.self);
                break;
            default:
                console.error("This dialog action is currently not supported");
        }
        this.hideDialog();
    }
}
