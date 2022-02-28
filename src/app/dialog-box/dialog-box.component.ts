import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Point} from "../model/point";

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
            // For all top level children in defaultValues
            for (let i = 0; i < defaultValues.length; i++) {
                if (Array.isArray(defaultValues[i])) {
                    topLevelChildren.item(i).innerHTML = "";
                    let j;
                    // For all groups in top level children
                    for (j = 0; j < defaultValues[i].length; j++) {
                        const group = this.createInfiniteFieldsGroup(this.formElements[i].infinite, j);
                        const groupInputFields = group.getElementsByTagName("input");
                        // For all fields in groups
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
                    topLevelChildren.item(i).appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, j));
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
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.addEventListener('click', (e: MouseEvent) => {
            if (e.target === e.currentTarget) {
                this.hideDialog();
            }
        });
        this.dragElement(document.querySelector(`#${this.action}DialogBoxFloor${this.floor}>div`)!);
    }

    dragElement(htmlDivElement: HTMLDivElement) {
        const translate: string[] = htmlDivElement.style.transform.substring(10, htmlDivElement.style.transform.length - 1).split("px").filter((c: string) => c !== "");
        let originalPos = new Point(parseInt(translate[0]), parseInt(translate.length === 1 ? translate[0] : translate[1].substring(2)));
        console.log(originalPos)
        htmlDivElement.ondblclick = (e: MouseEvent) => {
            e = e || window.event;
            e.preventDefault();
            originalPos = new Point(e.clientX - originalPos.x, e.clientY - originalPos.y);
            htmlDivElement.ondblclick = () => {
                document.onmouseup = null;
                document.onmousemove = null;
                this.dragElement(document.querySelector(`#${this.action}DialogBoxFloor${this.floor}>div`)!);
            };
            document.onmousemove = (e: MouseEvent) => {
                e = e || window.event;
                e.preventDefault();

                htmlDivElement.style.transform = `translate(${e.clientX - originalPos.x}px,${e.clientY - originalPos.y}px)`;
            };
        }
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
        switch (elem.nodeName) {
            case "INPUT":
                (elem as HTMLInputElement).placeholder = formElement.name ? formElement.name : "";
                elem.type = formElement.inputType ? formElement.inputType : "text";
                switch (elem.type) {
                    case "number":
                        if (!isNaN(formElement.min)) {
                            elem.min = formElement.min;
                        }
                        elem.step = (isNaN(formElement)) ? 1 : formElement.step;
                        break;
                    case "checkbox":
                        elem.checked = formElement.checked === true
                }
                if (formElement.defaultValue !== undefined) {
                    elem.value = formElement.defaultValue;
                }
                break;
            case "SELECT":
                for (const value of formElement.values) {
                    const option = document.createElement("option");
                    option.innerText = value;
                    option.value = value;
                    elem.appendChild(option);
                }
        }
        return elem;
    }

    hideDialog(): void {
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.classList.replace("flex", "hidden");
        const topLevelInputs = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div`);
        for (let i = 0; i < topLevelInputs.length; i++) {
            switch ((topLevelInputs.item(i) as Element).nodeName) {
                case "INPUT":
                    (topLevelInputs.item(i) as HTMLInputElement).value = this.formElements[i].defaultValue === undefined ? "" : this.formElements[i].defaultValue;
                    break;
                case "DIV":
                    for (let j = 0; j < topLevelInputs.item(i).children.length; j++) {
                        for (let k = 0; k < this.formElements[i].infinite.length; k++) {
                            ((topLevelInputs.item(i) as HTMLDivElement).children[j] as HTMLInputElement).value = this.formElements[i].infinite[k].defaultValue === undefined ? "" : this.formElements[i].defaultValue;
                        }
                    }
            }
        }
    }

    successfullyCloseDialog(): void {
        const topLevelChildren = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div, #${this.action}InputsFloor${this.floor}>select`);
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
            case "createPointOfInterest":
                this.confirmAction(this.formElements[0].values[(topLevelChildren[0] as HTMLSelectElement).selectedIndex], [], this.params.self);
                break;
            case "setNeighbors":
                this.confirmAction(parseInt(this.params.id), Array.from((topLevelChildren[0] as HTMLDivElement).getElementsByTagName("div")).filter((elem: HTMLDivElement) => elem.getElementsByTagName("input")[0].value.trim().length !== 0 && !isNaN(parseInt(elem.getElementsByTagName("input")[0].value))).map((group: HTMLDivElement) => Array.from(group.getElementsByTagName("input")).map((elem: HTMLInputElement) => elem.type === "checkbox" ? elem.checked : elem.value)), this.params.self);
                break;
            default:
                console.error("This dialog action is currently not supported");
        }
        this.hideDialog();
    }
}
