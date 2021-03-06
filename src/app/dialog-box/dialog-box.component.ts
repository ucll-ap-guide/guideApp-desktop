import {AfterViewInit, Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Point} from "../model/point";

@Component({
    selector: 'app-dialog-box',
    templateUrl: 'dialog-box.component.html',
    styles: []
})
/**
 * A component that can create dialog boxes with either {@link HTMLInputElement}, {@link HTMLSelectElement} fields
 * and/or group(s) of infinite fields in a {@link HTMLDivElement}.
 */
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
     * The **ngOnChanges()** function is automatically triggered by angular when the {@link DialogBoxComponent} is
     * created/opened and that the defaultValues have been set dynamically or when values for a `search-select` are
     * passed dynamically.
     *
     * @param changes The changes since the last time the {@link DialogBoxComponent} has been created/opened.
     * @param changes.params.currentValue.defaultValues The values of the {@link HTMLInputElement}s. *It's an
     *                                                  {@link Array} of type `string`, `number`, `boolean` or another
     *                                                  {@link Array} in case the field is an infinite fields group.*
     * @param changes.params.currentValue.values The values who should be displayed for the {@link HTMLInputElement} of
     *                                           tagType `search-select`. *It is an {@link Array} of type `string`,
     *                                           `number`, `boolean` or another {@link Array} in case the field is an
     *                                           infinite fields group.*
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
                            const group = this.createInfiniteFieldsGroup(this.formElements[i].infinite, j, i);
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
                        // For all fields in group
                        topLevelChildren.item(i).appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, j, i));
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
                // For each top level children in values
                for (let i = 0; i < values.length; i++) {
                    if (this.formElements[i].infinite !== undefined) {
                        // For each input/select fields in the group
                        for (let j = 0; j < values[i].length; j++) {
                            if (values[i][j] !== undefined) {
                                // Save the values so that automatic field creation can use them to generate the list
                                this.formElements[i].infinite[j].values = values[i][j];
                                // Create a search select field for every field inside the group for which values where provided
                                for (const group of Array.from(topLevelChildren[i].children)) {
                                    const fields = Array.from(group.querySelectorAll(`input, select`));
                                    if (fields[j].nodeName === "INPUT") {
                                        this.appendSearchSelectField(fields[j] as HTMLInputElement, values[i][j]);
                                    }
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
        // For all top level fields
        for (let i = 0; i < this.formElements.length; i++) {
            if (this.formElements[i].infinite !== undefined) {
                // Container containing all the groups of input fields
                const container = document.createElement("div");
                container.id = `${this.action}InputsFloor${this.floor}Infinite${i}Container`
                container.className = "flex flex-col";
                container.setAttribute("infinite", String(i));

                container.appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, 0, i));

                inputsDiv.appendChild(container);

                // Listen to changes in the last input field group and adds fields if necessary
                inputsDiv.addEventListener("input", (event: Event) => {
                    if ((event.target as Element).nodeName === "INPUT" && (event.target as HTMLInputElement).type !== "checkbox") {
                        const input = (event.target as HTMLInputElement);
                        const inputsFields: HTMLInputElement[] = Array.from(input.parentElement!.parentElement!.querySelectorAll("div:last-of-type>input"));
                        // For all fields in the last group of the infinite field container
                        for (let j = 0; j < inputsFields.length; j++) {
                            if (inputsFields[j] === input) {
                                input.parentElement!.parentElement!.appendChild(this.createInfiniteFieldsGroup(this.formElements[i].infinite, input.parentElement!.parentElement!.children.length, i));
                            }
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
     * The **dragElement()** function makes the given {@link HTMLDivElement} draggable when `Ctrl` + `Double Click` is
     * used.
     *
     * @param htmlDivElement The {@link HTMLDivElement} element that needs to be draggable.
     */
    dragElement(htmlDivElement: HTMLDivElement): void {
        const translate: string[] = htmlDivElement.style.transform.substring(10, htmlDivElement.style.transform.length - 1).split("px").filter((c: string) => c !== "");
        let originalPos = new Point(parseInt(translate[0]), parseInt(translate.length === 1 ? translate[0] : translate[1].substring(2)));
        htmlDivElement.ondblclick = (e: MouseEvent) => {
            if (e.ctrlKey) {
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
        };
    }

    /**
     * The **createInfiniteFieldsGroup()** function creates a {@link HTMLDivElement} that will contain an infinite
     * amount of {@link HTMLInputElement} and/or {@link HTMLSelectElement} of another {@link HTMLDivElement} containing
     * infinite fields. These will be automatically generated when the last group of fields doesn't contain the
     * defaultValue anymore.
     *
     * @param infiniteFormElements An {@link Array} containing the options to create the fields (see
     *                             {@link this.createField} for more info about the properties used within elements of
     *                             the {@link Array}).
     * @param groupIndex The index of the group inside the infinite container.
     * @param infiniteContainerIndex The index of the new container containing all the infinite fields.
     * @return A {@link HTMLDivElement} containing the infinite fields.
     */
    createInfiniteFieldsGroup(infiniteFormElements: any[], groupIndex: number, infiniteContainerIndex: number): HTMLDivElement {
        const group = document.createElement("div");
        group.className = "infiniteFieldsGroup";
        for (let j = 0; j < infiniteFormElements.length; j++) {
            const label = this.createLabel(infiniteFormElements[j], `${groupIndex}SubInput${j}`);
            const field = this.createField(infiniteFormElements[j], `${groupIndex}SubInput${j}`);

            if (infiniteFormElements[j].inputType !== "checkbox") group.appendChild(label);
            group.appendChild(field);
            if (infiniteFormElements[j].inputType === "checkbox") group.appendChild(label);
            if (infiniteFormElements[j].tagType === "search-select") {
                this.appendSearchSelectField(field as HTMLInputElement, this.formElements[infiniteContainerIndex].infinite[j].values);
            } else if (infiniteFormElements[j].required === true && document.getElementById(field.id + "Error") === null) {
                field.after(this.createErrorField(field as HTMLInputElement));
            }
        }
        return group;
    }

    /**
     * The **createLabel()** function creates an {@link HTMLLabelElement} with the given parameters.
     *
     * @param formElement The formElement is a map containing fields that you can specify to generate the desired field.
     *                    All fields are optional if none are given an empty label will be generated.
     * @param formElement.inputType Indicates the type of the {@link HTMLInputElement}. This will be used to know where
     *                              to place the label (by default it is put above the {@link HTMLInputElement} but when
     *                              the {@link HTMLInputElement.type} is oft type `checkbox` it will be placed next to it).
     * @param formElement.name The text that should be displayed inside the label.
     * @param forId The id of the {@link HTMLInputElement} that should be set in the {@link HTMLLabelElement.htmlFor}
     *              attribute.
     * @return A {@link HTMLLabelElement} with the given parameters.
     */
    createLabel(formElement: any, forId: string): HTMLLabelElement {
        const label = document.createElement("label");
        if (formElement.name) {
            label.innerText = formElement.name + ":";
        }
        label.className = (formElement.inputType === "checkbox" ? "" : "block ") + "text-white mb-1";
        label.htmlFor = `${this.action}Floor${this.floor}Input${forId}`;
        return label;
    }

    /**
     * The **createField()** function creates an {@link HTMLInputElement} or a {@link HTMLSelectElement} with the given
     * parameters.
     *
     * @param formElement The formElement is a map containing some of the following fields that you want to specify to
     *                    generate the desired field. All fields are optional if none are given an empty input box of
     *                    type text will be generated.
     * @param formElement.checked Used for {@link HTMLInputElement} of inputType `checkbox`.
     * @param formElement.defaultValue The default value that should be filled in the input filed by default.
     * @param formElement.infinite The list of fields that need to be automatically generated when the last field of the
     *                             infinite inputs is not empty anymore. Those fields need to be in a {@link Array} and
     *                             is of type {@link formElement}.
     * @param formElement.inputType Indicates the type of the {@link HTMLInputElement}.
     * @param formElement.max The maximum value for the {@link HTMLInputElement.max} attribute.
     * @param formElement.min The minimum value for the {@link HTMLInputElement.min} attribute.
     * @param formElement.name The name of the input field, this will be used for the {@link HTMLInputElement.placeholder}
     *                         and for the {@link HTMLLabelElement}.
     * @param formElement.pattern The pattern for the {@link HTMLInputElement.pattern} attribute. This will be used for
     *                            field validation.
     * @param formElement.required Indicates whether the field should be validated. By default, it only checks if the
     *                             field contains a value by the type that was given or the default type (`text`), but
     *                             if pattern, values, min or max are defined it will also check if those requirements
     *                             are met. (see {@link checkField} for more information)
     * @param formElement.step The {@link HTMLInputElement.step} of the {@link HTMLInputElement}.
     * @param formElement.tagType The type for the {@link HTMLInputElement.type} attribute.
     * @param formElement.values The values that need to be displayed in the select, they should be grouped.
     * @param formElement.values.group The group name that should be displayed for each group of values (can be omitted
     *                                 if there is only one group).
     * @param formElement.values.values The values that should be displayed for each group.
     * @param id The {@link HTMLElement.id} the field should have.
     * @return A {@link HTMLInputElement} or a {@link HTMLSelectElement} with the given parameters.
     */
    createField(formElement: any, id: string): Element {
        let elem = document.createElement(formElement.tagType && !["search-select", "color-picker"].includes(formElement.tagType) ? formElement.tagType : "input");
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
     * The **filterSearchElements()** function hides all the elements in the select that don't contain the string in the
     * search box.
     *
     * @param input The {@link HTMLInputElement} that is used as a search box.
     */
    filterSearchElements(input: HTMLInputElement): void {
        for (const idElem of Array.from(document.querySelectorAll(`#${input.id}Values>li>ul>li`)) as HTMLLIElement[]) {
            if (idElem.innerText.toLowerCase().includes(input.value.toLowerCase())) {
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
     * The **appendSearchSelectField()** function creates a select with possible values for the given input field.
     *
     * @param input The {@link HTMLInputElement} for which the select needs to be generated.
     * @param values The values that need to be displayed in the select, they should be grouped.
     * @param values.group The group name that should be displayed for each group of values (can be omitted if there is only
     *                     one group).
     * @param values.values The values that should be displayed for each group.
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
        ul.id = input.id + "Values";
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
     * The **createErrorField()** function creates an error field for the given {@link HTMLInputElement}.
     *
     * @param input The {@link HTMLInputElement} for which an error fields needs to be created.
     * @return A {@link HTMLParagraphElement} in which the error message will be displayed.
     */
    createErrorField(input: HTMLInputElement): HTMLParagraphElement {
        const errorField = document.createElement("p");
        errorField.id = `${input.id}Error`;
        errorField.className = "text-red-600 mx-3 mb-1 hidden error";
        input.addEventListener('change', () => this.checkField(input));
        return errorField;
    }

    /**
     * The **hideDialog()** function hides the dialog box and empties the {@link HTMLInputElement}s.
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
     * Checks if {@link HTMLInputElement} has a correct value and displays an error message if needed, only the fields
     * where the {@link HTMLInputElement.required} attribute is set to `true` will be checked.
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
     * The **checkAllFields()** function triggers the onChange event for all the {@link HTMLInputElement} and
     * {@link HTMLSelectElement} fields.
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
     * The **successfullyCloseDialog()** function checks if all the fields contain valid content and closes the dialog
     * box and executes the **confirmAction()** function that is given to this component.
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
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, parseFloat((topLevelChildren[1] as HTMLInputElement).value), parseFloat((topLevelChildren[2] as HTMLInputElement).value), (topLevelChildren[3] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.emergency, this.params.self);
                    break;
                case "updateDoor":
                    this.confirmAction(parseInt(this.params.id), (topLevelChildren[0] as HTMLInputElement).value, parseFloat((topLevelChildren[1] as HTMLInputElement).value), parseFloat((topLevelChildren[2] as HTMLInputElement).value), (topLevelChildren[3] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "createNode":
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, this.params.self);
                    break;
                case "updateNode":
                    this.confirmAction(parseInt(this.params.id), (topLevelChildren[0] as HTMLInputElement).value, this.params.self);
                    break;
                case "createPointOfInterest":
                    this.confirmAction(this.formElements[0].values[(topLevelChildren[0] as HTMLSelectElement).selectedIndex], [], this.params.self);
                    break;
                case "createLabel":
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, (topLevelChildren[1] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
                    break;
                case "updateLabel":
                    this.confirmAction(parseInt(this.params.id), (topLevelChildren[0] as HTMLInputElement).value, (topLevelChildren[1] as HTMLInputElement).value.split(",").map(elem => parseInt(elem)), this.params.self);
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
                case "deleteMap":
                    this.confirmAction((topLevelChildren[0] as HTMLInputElement).value, this.params.self);
                    break;
                default:
                    console.error(`The dialog action ${this.action} is currently not supported`);
            }
            this.hideDialog();
        }
    }
}
