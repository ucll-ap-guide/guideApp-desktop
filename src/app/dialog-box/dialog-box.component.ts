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
     * Fills the inputs with their defaultValues (needs to be done like this because each node needs other neighbors
     * that can be set dynamically).
     *
     * @param changes
     */
    ngOnChanges(changes: SimpleChanges): void {
        const topLevelChildren = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div`);
        if (changes["params"] !== undefined && changes['params'].currentValue !== undefined) {
            // Set default values
            const defaultValues = changes['params'].currentValue.defaultValues;
            if (defaultValues !== undefined) {
                // For all top level children in defaultValues
                for (let i = 0; i < defaultValues.length; i++) {
                    if (this.formElements[i].infinite !== undefined) {
                        topLevelChildren.item(i).innerHTML = "";
                        let j;
                        // For all groups in top level children
                        for (j = 0; j < defaultValues[i].length; j++) {
                            const group = this.createInfiniteFieldsGroup(this.formElements[i].infinite, j);
                            const groupInputFields = group.getElementsByTagName("input");
                            // For all fields in group
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
                        if (topLevelChildren.item(i).nodeName === "INPUT") {
                            (topLevelChildren.item(i) as HTMLInputElement).value = defaultValues[i];
                        }
                    }
                }
            }

            // Set the search select
            const values = changes['params'].currentValue.values;
            if (values !== undefined) {
                // For all top level children in values
                for (let i = 0; i < topLevelChildren.length; i++) {
                    if (this.formElements[i].infinite !== undefined) {
                        // For all input/select field GROUPS in top level children
                        for (let j = 0; j < topLevelChildren[i].children.length; j++) {
                            this.formElements[i].infinite[i].values = values[i][j] ? values[i][j] : [];
                            // For all input/select fields in groups
                            for (let k = 0; k < topLevelChildren[i].children[j].getElementsByTagName("input").length; k++) {
                                if (values[i][k] !== undefined) {
                                    this.appendSearchSelectField(topLevelChildren[i].children[j].getElementsByTagName("input")[k], values[i][k]);
                                }
                            }
                        }
                    } else {
                        if (topLevelChildren.item(i).nodeName === "INPUT") {
                            this.appendSearchSelectField(topLevelChildren.item(i) as HTMLInputElement, values[i]);
                        }
                    }
                }
            }
        }
    }

    ngAfterViewInit(): void {
        const inputsDiv = <HTMLDivElement>document.getElementById(`${this.action}InputsFloor${this.floor}`);
        for (let i = 0; i < this.formElements.length; i++) {
            if (this.formElements[i].infinite !== undefined) {
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
                    for (let j = 0; j < inputsFields.length; j++) {
                        if ((inputsFields[j] as HTMLInputElement).id === input.id) {
                            input.parentElement!.parentElement!.appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, inputsFields[j].parentElement!.parentElement!.children.length));
                        }
                    }
                });
            } else {
                inputsDiv.appendChild(this.createLabel(this.formElements[i], String(i)));
                const field = this.createField(this.formElements[i], String(i));
                inputsDiv.appendChild(field);
                if (this.formElements[i].tagType === "search-select") {
                    this.appendSearchSelectField(field as HTMLInputElement, this.formElements[i].values);
                }
                if (this.formElements[i].required === true) {
                    document.querySelector(`#${field.id}${(this.formElements[i].values === undefined ? '' : '+section')}`)!.after(this.createErrorField(field as HTMLInputElement));
                }
            }
        }
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.addEventListener('click', (e: MouseEvent) => {
            if (e.target === e.currentTarget) {
                this.hideDialog();
            }
        });
        this.dragElement(document.querySelector(`#${this.action}DialogBoxFloor${this.floor}>div`)!);
    }

    /**
     * Makes the given element draggable.
     *
     * @param htmlDivElement The HTML element that needs to be draggable.
     */
    dragElement(htmlDivElement: HTMLDivElement) {
        const translate: string[] = htmlDivElement.style.transform.substring(10, htmlDivElement.style.transform.length - 1).split("px").filter((c: string) => c !== "");
        let originalPos = new Point(parseInt(translate[0]), parseInt(translate.length === 1 ? translate[0] : translate[1].substring(2)));
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
        };
    }

    createInfiniteFieldsGroup(infiniteFormElements: any[], upperLevelPosition: number): HTMLDivElement {
        const group = document.createElement("div");
        group.className = "infiniteFieldsGroup";
        for (let j = 0; j < infiniteFormElements.length; j++) {
            const label = this.createLabel(infiniteFormElements[j], `${upperLevelPosition}SubInput${j}`);
            const field = this.createField(infiniteFormElements[j], `${upperLevelPosition}SubInput${j}`);

            if (infiniteFormElements[j].inputType !== "checkbox") group.appendChild(label);
            group.appendChild(field);
            if (infiniteFormElements[j].inputType === "checkbox") group.appendChild(label);
            if (infiniteFormElements[j].tagType === "search-select") {
                this.appendSearchSelectField(field as HTMLInputElement, this.formElements[j].infinite[j].values);
            } else if (infiniteFormElements[j].required === true && document.getElementById(field.id + "Error") === null) {
                field.after(this.createErrorField(field as HTMLInputElement));
            }
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
        let elem = document.createElement(formElement.tagType && formElement.tagType !== "search-select" ? formElement.tagType : "input");
        elem.id = `${this.action}Floor${this.floor}Input${id}`;
        elem.className = (formElement.inputType === "checkbox" ? "inline mr-1" : "block") + " bg-white text-gray-700 focus:outline-none focus:shadow-outline rounded-md shadow w-auto py-1.5 px-2 mb-4";
        elem.onkeyup = (event: KeyboardEvent) => {
            if (event.key === "Enter") {
                this.successfullyCloseDialog();
            }
        };
        if (formElement.tagType && formElement.tagType === "search-select") {
            elem.setAttribute("customType", "search-select");
        }
        elem.required = formElement.required === true;
        switch (elem.nodeName) {
            case "INPUT":
                (elem as HTMLInputElement).placeholder = formElement.name ? formElement.name : "";
                elem.type = formElement.inputType ? formElement.inputType : "text";
                elem.pattern = formElement.pattern === undefined ? "" : formElement.pattern;
                switch (elem.type) {
                    case "number":
                        if (!isNaN(formElement.min)) {
                            elem.min = formElement.min;
                        }
                        if (!isNaN(formElement.max)) {
                            elem.max = formElement.max;
                        }
                        elem.step = (isNaN(formElement)) ? 1 : formElement.step;
                        break;
                    case "checkbox":
                        elem.checked = formElement.checked === true;
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

    /**
     * Hides all the elements in the select that don't contain the string in the search box.
     *
     * @param input The input field that is used as a search box.
     */
    filterSearchElements(input: HTMLInputElement): void {
        for (const idElem of Array.from(document.querySelectorAll(`#${input.id}Values>li>ul>li`)) as HTMLLIElement[]) {
            if (String(idElem.innerText).toLowerCase().includes(input.value.toLowerCase())) {
                idElem.className = idElem.className.replace("hidden", "block");
            } else {
                idElem.className = idElem.className.replace("block", "hidden");
            }
        }

        for (const groupElem of Array.from(document.querySelectorAll(`#${input.id}Values>li`)) as HTMLLIElement[]) {
            if (groupElem.getElementsByClassName("block").length === 0) {
                groupElem.className = groupElem.className.replace("block", "hidden");
            } else {
                groupElem.className = groupElem.className.replace("hidden", "block");
            }
        }
    }

    /**
     * Creates a select with possible values for the given input field.
     *
     * @param input The input field for which the select needs to be generated.
     * @param values The values that need to be displayed in the select.
     */
    appendSearchSelectField(input: HTMLInputElement, values: { group: string, values: any[] }[]): void {
        input.addEventListener("focusin", () => {
            document.getElementById(input.id + "Values")!.className = document.getElementById(input.id + "Values")!.className.replace("hidden", "block");
        });
        input.addEventListener("focusout", () => {
            setTimeout(() => document.getElementById(input.id + "Values")!.className = document.getElementById(input.id + "Values")!.className.replace("block", "hidden"), 300);
        });
        input.addEventListener("input", () => this.filterSearchElements(input));

        const ul = document.createElement("ul");
        ul.id = input.id + "Values"
        ul.className = "bg-white border-px absolute shadow-lg rounded-md hidden overflow-auto w-full max-h-fit my-px";
        ul.style.maxHeight = "25vh";
        ul.style.marginTop = "calc(-.9rem)";
        values = values.filter((g: { group: string, values: any[] }) => g.values.length !== 0);
        for (let i = 0; i < values.length; i++) {
            const subUl = document.createElement("ul");
            if (values.length > 1) {
                const title = document.createElement("li");
                title.className = "group font-semibold py-1 px-2";
                title.innerText = values[i].group;
                subUl.appendChild(title);
            }
            const li = document.createElement("li");
            li.className = "block";
            for (let j = 0; j < values[i].values.length; j++) {
                const subLi = document.createElement("li");
                subLi.className = `hover:bg-gray-500 cursor-pointer ${j === 0 && values.length === 1 ? 'rounded-t-md' : (i === values.length - 1 && j === values[i].values.length - 1) ? 'rounded-b-md' : ''} block py-1 px-4`;
                subLi.innerText = values[i].values[j];
                subLi.addEventListener("click", () => {
                    input.value = values[i].values[j];
                    input.dispatchEvent(new Event("change", {bubbles: true}));
                    input.dispatchEvent(new Event("input", {bubbles: true}));
                    document.getElementById(input.id + "Values")!.className = document.getElementById(input.id + "Values")!.className.replace("block", "hidden");
                });
                subUl.appendChild(subLi);
            }
            li.appendChild(subUl);
            ul.appendChild(li);
        }
        if (document.getElementById(ul.id) !== null) {
            document.getElementById(ul.id)!.replaceWith(ul);
        } else {
            const section = document.createElement("section");
            section.className = "relative"
            section.append(ul)
            input.after(section);
            if (input.required && document.getElementById(input.id + "Error") === null) {
                section.after(this.createErrorField(input));
            }
        }
        this.filterSearchElements(input);
    }

    /**
     * Creates an error field for the given input.
     *
     * @param input The input for which an error fields needs to be created.
     *              If none are provided the field will work like the normal input field validation.
     */
    createErrorField(input: HTMLInputElement): HTMLParagraphElement {
        const errorField = document.createElement("p");
        errorField.id = `${input.id}Error`;
        errorField.className = "text-red-600 mx-3 mb-1 hidden error";
        input.addEventListener('change', () => this.checkField(input));
        return errorField;
    }

    /**
     * Hides the dialog box and empties the input fields.
     */
    hideDialog(): void {
        document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.classList.replace("flex", "hidden");
        const topLevelInputs = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div`);
        for (let i = 0; i < topLevelInputs.length; i++) {
            switch ((topLevelInputs.item(i) as Element).nodeName) {
                case "INPUT":
                    (topLevelInputs.item(i) as HTMLInputElement).value = this.formElements[i].defaultValue === undefined ? "" : this.formElements[i].defaultValue;
                    if ((topLevelInputs.item(i) as HTMLInputElement).required) {
                        topLevelInputs.item(i).className = ((topLevelInputs.item(i) as HTMLInputElement).type === "checkbox" ? "inline mr-1" : "block") + " bg-white text-gray-700 focus:outline-none focus:shadow-outline rounded-md shadow w-auto py-1.5 px-2 mb-4";
                        document.getElementById(topLevelInputs.item(i).id + "Error")!.className = "text-red-600 mx-3 mb-1 hidden error";
                    }
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

    /**
     * Checks if input field has a correct value and displays an error message if needed.
     *
     * @param input The input field that needs to be checked.
     */
    checkField(input: HTMLInputElement): void {
        const errorField = document.getElementById(`${input.id}Error`) as HTMLParagraphElement;
        const values = document.getElementById(`${input.id}Values`);
        errorField.innerText = "";

        if (input.required && input.nodeName === "INPUT") {
            switch (input.type) {
                case "text":
                    if (input.getAttribute("customType") === "search-select") {
                        if (!(Array.from(values!.querySelectorAll("li>ul>li")) as HTMLLIElement[]).map((e: HTMLLIElement) => e.innerText).includes(input.value) && !(input.value === "" && input.parentElement!.className === "infiniteFieldsGroup")) {
                            errorField.innerText = "Please choose a correct value from the provided list.";
                        }
                    } else if (input.value === "") {
                        errorField.innerText = "Please provide a value.";
                    } else if (input.pattern !== "" && !input.value.match(input.pattern)) {
                        errorField.innerText = "Please provide a valid value.";
                    }
                    break;
                case "number":
                    if (isNaN(parseFloat(input.value)) && !(input.value === "" && input.parentElement!.className === "infiniteFieldsGroup")) {
                        errorField.innerText = "The given value must be a number.";
                    } else if (input.getAttribute("customType") === "search-select") {
                        if (!(Array.from(values!.querySelectorAll("li>ul>li")) as HTMLLIElement[]).map((e: HTMLLIElement) => e.innerText).includes(input.value) && !(input.value === "" && input.parentElement!.className === "infiniteFieldsGroup")) {
                            errorField.innerText = "Please choose a value from the provided list.";
                        }
                    } else if (parseFloat(input.value) < parseFloat(input.min)) {
                        errorField.innerText = `The value must be higher or equal to ${input.min}.`;
                    } else if (parseFloat(input.value) > parseFloat(input.max)) {
                        errorField.innerText = `The value must be lower or equal to ${input.max}.`;
                    }
            }
        }

        if (errorField.innerText !== "") {
            errorField.className = errorField.className.replace("hidden", "block");
            input.className = input.className.replace(" border-3 border-green-600", "");
            input.className = input.className.replace("mb-4", "mb-0.5 border-3 border-red-600");
            if (values !== null) {
                values.style.marginTop = "0";
            }
            // remove the margin of the error field and the padding of the input field
            errorField.style.maxWidth = `${input.offsetWidth - 40}px`;
        } else {
            errorField.className = errorField.className.replace("block", "hidden");
            input.className = input.className.replace("mb-0.5 border-3 border-red-600", "mb-4");
            input.className += " border-3 border-green-600";
            if (values !== null) {
                values.style.marginTop = "calc(-.9rem)";
            }
        }
    }

    /**
     * Trigger the onChange event for all input fields.
     */
    checkAllFields(): void {
        for (const inputField of Array.from(document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.getElementsByTagName("input"))) {
            inputField.dispatchEvent(new Event("change", {bubbles: true}));
        }
        for (const select of Array.from(document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.getElementsByTagName("select"))) {
            select.dispatchEvent(new Event("change", {bubbles: true}));
        }
    }

    /**
     * Closes the dialog box and executes the confirmAction function that is given to this component.
     */
    successfullyCloseDialog(): void {
        this.checkAllFields();
        if (document.getElementById(`${this.action}DialogBoxFloor${this.floor}`)!.querySelector(".error.block") === null) {
            const topLevelChildren = document.querySelectorAll(`#${this.action}InputsFloor${this.floor}>input, #${this.action}InputsFloor${this.floor}>div, #${this.action}InputsFloor${this.floor}>select`);
            switch (this.action) {
                case "createPolygonWithNVertices":
                    this.confirmAction(null, (topLevelChildren[0] as HTMLInputElement).value, this.params.vertices, (topLevelChildren[1] as HTMLInputElement).value, (topLevelChildren[2] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "createPolygon":
                    if (!isNaN(parseInt((topLevelChildren[2] as HTMLInputElement).value))) {
                        this.confirmAction(null, (topLevelChildren[0] as HTMLInputElement).value, parseInt((topLevelChildren[2] as HTMLInputElement).value), (topLevelChildren[1] as HTMLInputElement).value, (topLevelChildren[3] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    }
                    break;
                case "updatePolygon":
                    this.confirmAction(parseInt(this.params.id), (topLevelChildren[0] as HTMLInputElement).value, (topLevelChildren[1] as HTMLInputElement).value, (topLevelChildren[2] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "createDoor":
                    this.confirmAction(null, parseFloat((topLevelChildren[1] as HTMLInputElement).value), parseFloat((topLevelChildren[2] as HTMLInputElement).value), null, (topLevelChildren[0] as HTMLInputElement).value, [], this.params.emergency, (topLevelChildren[3] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "updateDoor":
                    this.confirmAction(parseInt(this.params.id), (topLevelChildren[0] as HTMLInputElement).value, parseFloat((topLevelChildren[1] as HTMLInputElement).value), parseFloat((topLevelChildren[2] as HTMLInputElement).value), (topLevelChildren[3] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)));
                    break;
                case "createNode":
                    this.confirmAction(null, null, (topLevelChildren[0] as HTMLInputElement).value, [], this.params.self);
                    break;
                case "createPointOfInterest":
                    this.confirmAction(this.formElements[0].values[(topLevelChildren[0] as HTMLSelectElement).selectedIndex], [], this.params.self);
                    break;
                case "createLabel":
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, (topLevelChildren[1] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "updateLabel":
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, (topLevelChildren[1] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "setNeighbors":
                    this.confirmAction(parseInt(this.params.id),
                        Array.from((topLevelChildren[0] as HTMLDivElement).getElementsByTagName("div"))
                            .filter((elem: HTMLDivElement) => elem.getElementsByTagName("input")[0].value.trim().length !== 0 && !isNaN(parseInt(elem.getElementsByTagName("input")[0].value)))
                            .map((group: HTMLDivElement) => Array.from(group.getElementsByTagName("input")).map((elem: HTMLInputElement) => elem.type === "checkbox" ? elem.checked : elem.value)), this.params.self);
                    break;
                case "updateMap":
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, this.params.self);
                    break;
                default:
                    console.error(`The dialog action ${this.action} is currently not supported`);
            }
            this.hideDialog();
        }
    }
}
