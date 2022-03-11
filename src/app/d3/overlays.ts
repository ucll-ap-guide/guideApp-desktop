import {Point} from "../model/point";
import {nodeIcons} from "./node-icons";
import * as select from "ajv-keywords";
import {Polygon} from "../model/polygon";
import {Label} from "../model/label";
import {GuidoNode} from "../model/guido-node";
import {GuidoMap} from "../model/guido-map";
import {NodeType} from "../model/node-type";
import {PolygonType} from "../model/polygon-type";
import {GuidoOverlays} from "../model/guido-overlays";

declare var d3: any;

/**
 * A class that generates all the {@link Polygon}s and {@link GuidoNode}s on the workspace.
 *
 * Code partially from {@link https://dciarletta.github.io/d3-floorplan/}, completely refactored to TypeScript and
 * fitted to project.
 */
export class Overlays {
    x = d3.scale.linear();
    y = d3.scale.linear();
    id = "fp-overlays-" + new Date().valueOf();
    name = "Objects";
    canvasCallbacks = [];
    selectCallbacks = [];
    moveCallbacks = [];
    editMode = true;
    line: any;
    dragBehavior: any;
    dragged = null;
    jsonData: GuidoMap;
    floor: number;

    constructor(jsonData: GuidoMap, floor: number) {
        let self = this;
        this.line = d3.svg.line()
            .x(function (d: any) {
                return self.x(d.x);
            })
            .y(function (d: any) {
                return self.y(d.y);
            });

        this.dragBehavior = d3.behavior.drag()
            .on("dragstart", function () {
                // @ts-ignore
                self.__dragItem(this)
            })
            .on("drag", function () {
                // @ts-ignore
                self.__mousemove(this, self);
            })
            .on("dragend", function () {
                // @ts-ignore
                self.__mouseup(this, self)
            });

        this.jsonData = jsonData;
        this.floor = floor;
    }

    createOverlays(groups: any): void {
        let self = this;
        groups.each(function (data: GuidoOverlays) {
            if (!data) return;
            // @ts-ignore
            var g = d3.select(this);

            // setup rectangle for capturing events
            setupCanvas(g, self);

            // draw polygons
            drawPolygons(data, g, self);

            //draw nodes
            drawNodes(g, data, self);

            //draw doors
            drawDoors(g, data, self);

            // draw pointsOfInterest
            drawPointsOfInterest(data, g, self);

            //draw labels
            drawLabels(data, g, self);
        });
    }


    getId(): string {
        return this.id;
    }

    xScale(scale?: any) {
        if (!arguments.length) return this.x;
        this.x = scale;
        return this.x;
    };

    yScale(scale?: any) {
        if (!arguments.length) return this.y;
        this.y = scale;
        return this.y;
    };

    title(n?: any) {
        if (!arguments.length) return this.name;
        this.name = n;
        return this.name;
    };

    getSetEditMode(enable: boolean) {
        if (!arguments.length) return this.editMode;
        this.editMode = enable;
        return this.editMode;
    };

    registerCanvasCallback(cb: any) {
        if (arguments.length) { // @ts-ignore
            this.canvasCallbacks.push(cb);
        }
        return this;
    };

    registerSelectCallback(cb: any) {
        if (arguments.length) { // @ts-ignore
            select.Callbacks.push(cb);
        }
        return this;
    };

    registerMoveCallback(cb: any) {
        if (arguments.length) { // @ts-ignore
            this.moveCallbacks.push(cb);
        }
        return this;
    };

    __dragItem(d: any) {
        if (this.editMode) this.dragged = d3.select(d).data()[0];
    }

    /**
     * The **__mousemove()** function drags the {@link PolygonType.ROOM}s and the {@link PolygonType.FLOOR} except if
     * the editMode, deleteMode or setNeighborMode is disabled. The {@link PolygonType.FLOOR} also requires that the
     * "Lock floor" checkbox is disabled.
     */
    __mousemove(event: any, self: any): void {
        // @ts-ignore
        if (self.dragged && !self.jsonData.setNeighborMode && !self.jsonData.editMode && !self.jsonData.deleteMode && (event.getAttribute("type") !== PolygonType.FLOOR || !document.getElementById("lockFloor" + self.floor)!.checked)) {
            var dx = self.x.invert(d3.event.dx) - self.x.invert(0);
            var dy = self.y.invert(d3.event.dy) - self.y.invert(0);

            if (self.dragged.parent && self.dragged.parent.points.every((elem: Point) => elem.x > 0 && elem.y > 0)) { // a point
                let svg = document.getElementById("demo" + self.dragged.parent.floor)!.getElementsByTagName("svg")[0]
                let width = parseFloat(svg.getAttribute("width")!);
                let height = parseFloat(svg.getAttribute("height")!);

                if (width > d3.event.x && height > d3.event.y) {
                    self.dragged.parent.points[self.dragged.index].x += dx;
                    self.dragged.parent.points[self.dragged.index].y += dy;
                }
            } else if (self.dragged.points && d3.event.x > 0 && d3.event.y > 0) { // a composite object
                let svg = document.getElementById("demo" + self.dragged.floor)!.getElementsByTagName("svg")[0];
                let width = parseFloat(svg.getAttribute("width")!);
                let height = parseFloat(svg.getAttribute("height")!);

                if (width > d3.event.x && height > d3.event.y) {
                    self.dragged.points.forEach(function (pt: Point) {
                        pt.x += dx;
                        pt.y += dy;
                    });
                }
            }

            // parent is container for overlays
            self.createOverlays(d3.select(event.parentNode));
        }
    }

    __mouseup(event: any, self: any): void {
        if (self.dragged) {
            self.moveCallbacks.forEach(function (cb: any) {
                self.dragged.parent ? cb(self.dragged.parent.id, self.dragged.parent.points, self.dragged.index) :
                    cb(self.dragged.id, self.dragged.points);
            });
            self.dragged = null;
        }
    }
}

/**
 * Teh **setUpCanvas()** function creates the background layer to the {@link GuidoMap}.
 *
 * @param g The parent element of the overlay in which the objects need to be rendered.
 * @param self The instance of the {@link Overlays} class.
 */
function setupCanvas(g: any, self: Overlays): void {
    var canvas = g.selectAll("rect.overlay-canvas").data([0]);

    canvas.enter().append("rect")
        .attr("class", "overlay-canvas")
        .style("opacity", 0)
        .attr("pointer-events", "all")
        .on("click", function () {
            if (self.editMode) {
                // @ts-ignore
                var p = d3.mouse(this);
                self.canvasCallbacks.forEach(function (cb: any) {
                    cb(self.x.invert(p[0]), self.y.invert(p[1]));
                });
            }
        })
        .on("mouseup.drag", function () {
            // @ts-ignore
            self.__mouseup(this, self)
        })
        .on("touchend.drag", function () {
            // @ts-ignore
            self.__mouseup(this, self)
        });

    canvas.attr("x", self.x.range()[0])
        .attr("y", self.y.range()[0])
        .attr("height", self.y.range()[1] - self.y.range()[0])
        .attr("width", self.x.range()[1] - self.x.range()[0]);

}

/**
 * The **drawPolygons()** function draws the {@link Polygon}s on the D3 floorplan.
 *
 * @param data All the objects inside the {@link GuidoOverlays} that need to be rendered on the workspace.
 * @param g The parent element of the overlay in which the {@link Polygon}s need to be rendered.
 * @param self The instance of the {@link Overlays} class.
 */
function drawPolygons(data: GuidoOverlays, g: any, self: Overlays): void {
    var polygons = g.selectAll("path.polygon")
        .data(data.polygons || [], function (d: any) {
            return d.id;
        });

    polygons.enter().append("path")
        .attr("class", "polygon")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("pointer-events", "all")
        .on("mousedown", function (d: any) {
            self.selectCallbacks.forEach(function (cb: any) {
                cb(d.id);
            });
        })
        .call(self.dragBehavior)
        .append("title");

    for (let i = 0; i < polygons[0].length; i++) {
        polygons[0][i].id = data.polygons[i].id;
        const elem = document.querySelector("[id='" + data.polygons[i].id + "']")!;
        elem.setAttribute("id", String(data.polygons[i].id));
        elem.setAttribute("type", data.polygons[i].type);
        if (data.polygons[i].type !== PolygonType.FLOOR) {
            elem.setAttribute("removable", "");
        }
        const index = data.polygons.map((elem: Polygon) => elem.id).indexOf(parseInt(polygons[0][i].id));
        if (data.polygons[index].color) {
            elem.setAttribute("fill", "rgb(" + data.polygons[index].color.join(",") + ")");
        }
    }

    polygons.exit().transition().style("opacity", 1e-6).remove();
    polygons
        .attr("d", function (d: any) {
            return self.line(d.points) + "Z";
        })
        .style("cursor", self.editMode ? "move" : "pointer")
        .select("title")
        .text(function (d: any) {
            return d.name
        });


    //Set draggable points to change shape of polygon
    type PointData = { index: number, parent: Polygon };
    if (self.editMode) {
        let pointData: PointData[] = [];
        if (data.polygons) {
            data.polygons.forEach(function (polygon: any) {
                if (polygon.type !== PolygonType.FLOOR || !(document.getElementById("lockFloor" + self.floor) as HTMLInputElement).checked) {
                    polygon.points.forEach(function (pt: any, i: any) {
                        pointData.push({
                            "index": i,
                            "parent": polygon
                        });
                    });
                }
            });
        }

        // determine current view scale to make appropriately
        // sized points to drag
        var scale = 1;
        var node = g.node();
        while (node.parentNode) {
            node = node.parentNode;
            if (node.__scale__) {
                scale = node.__scale__;
                break;
            }
        }

        var points = g.selectAll("circle.vertex")
            .data(pointData, function (d: PointData) {
                return d.parent.id + "-" + d.index;
            });

        points.exit().transition()
            .attr("r", 1e-6).remove();

        points.enter().append("circle")
            .attr("class", "vertex")
            .attr("pointer-events", "all")
            .attr("vector-effect", "non-scaling-stroke")
            .style("cursor", "move")
            .attr("r", 1e-6)
            .call(self.dragBehavior);

        points
            .attr("cx", function (d: PointData) {
                return self.x(d.parent.points[d.index].x);
            })
            .attr("cy", function (d: PointData) {
                return self.y(d.parent.points[d.index].y);
            })
            .attr("r", 4 / scale);
    } else {
        g.selectAll("circle.vertex").transition()
            .attr("r", 1e-6).remove();
    }
}

/**
 * The **drawNodes()** function draws the {@link GuidoNode}s of type {@link NodeType.NODE} on the D3 floorplan.
 *
 * @param g The parent element of the overlay in which the {@link GuidoNode}s need to be rendered.
 * @param data All the objects inside the {@link GuidoOverlays} that need to be rendered on the workspace.
 * @param self The instance of the {@link Overlays} class.
 */
function drawNodes(g: any, data: GuidoOverlays, self: Overlays): void {
    let dataNodes = data.nodes.filter(elem => elem.type === NodeType.NODE)
    let nodes = g.selectAll("circle.node")
        .data(dataNodes || [], function (d: any) {
            return d.id;
        });

    nodes.enter()
        .append("circle")
        .attr("node", "")
        .attr("type", NodeType.NODE)
        .attr("class", NodeType.NODE)
        .attr('stroke', 'black')
        .attr("removable", "")
        .attr("degreesRotated", 0)
        .attr('fill', '#ff0000')
        .on("mouseover", function () {
            // @ts-ignore
            d3.select(this)
                .attr("r", 15);

            if (!self.jsonData.setNeighborMode) {
                // @ts-ignore
                d3.select(this)
                    .style("opacity", 0.5);
            }
        })
        .on("mouseout", function () {
            // @ts-ignore
            d3.select(this)
                .attr("r", 5);
            if (!self.jsonData.setNeighborMode) {
                // @ts-ignore
                d3.select(this)
                    .style("opacity", 1);
            }
        })
        .call(d3.behavior.drag().on("drag", function () {
            if (!self.jsonData.setNeighborMode && !self.jsonData.editMode && !self.jsonData.deleteMode) {
                let svg = document.getElementById("demo" + self.floor)!.getElementsByTagName("svg")[0];
                let width = parseFloat(String(svg.getAttribute("width")));
                let height = parseFloat(String(svg.getAttribute("height")));
                let x = parseFloat(d3.event.x)
                let y = parseFloat(d3.event.y);

                // @ts-ignore
                let node = d3.select(this);

                if (x > 0 && y > 0 && x < width && y < height) {
                    node.attr('cx', d3.event.x).attr('cy', d3.event.y)
                    data.nodes.find((elem: GuidoNode) => elem.id === parseInt(node.attr("id")))!.point = new Point(x, y);
                }
            }
        }));

    for (let i = 0; i < dataNodes.length; i++) {
        nodes[0][i].id = dataNodes[i].id;
        const elem = document.querySelector("[id='" + dataNodes[i].id + "']")!;
        elem.setAttribute("id", String(dataNodes[i].id));
        elem.setAttribute("cx", String(dataNodes[i].point.x));
        elem.setAttribute("cy", String(dataNodes[i].point.y));
        elem.setAttribute("r", String(5));
        elem.setAttribute("floor", String(dataNodes[i].floor));
    }
}

/**
 * The **drawDoors()** function draws the {@link GuidoNode}s of type {@link NodeType.DOOR} and
 * {@link NodeType.EMERGENCY_EXIT} on the D3 floorplan.
 *
 * @param g The parent element of the overlay in which the {@link GuidoNode}s need to be rendered.
 * @param data All the objects inside the {@link GuidoOverlays} that need to be rendered on the workspace.
 * @param self The instance of the {@link Overlays} class.
 */
function drawDoors(g: any, data: GuidoOverlays, self: Overlays): void {
    let dataDoors = data.nodes.filter(elem => elem.type === NodeType.DOOR).concat(data.nodes.filter(elem => elem.type === NodeType.EMERGENCY_EXIT))
    let doors = g.selectAll("polygon.door")
        .data(dataDoors || [], function (d: any) {
            return d.id;
        });

    doors.enter()
        .append("polygon")
        .attr("node", "")
        .attr("removable", "")
        .attr("floor", self.floor)
        .on("contextmenu", function () {
            // @ts-ignore
            rotateDoor(this, data, self);
        })
        .call(d3.behavior.drag().on("drag", function () {
            if (!self.jsonData.setNeighborMode && !self.jsonData.editMode && !self.jsonData.deleteMode) {
                // @ts-ignore
                moveDoorCoordinates(this, data, self)
            }
        }));

    for (let i = 0; i < dataDoors.length; i++) {
        doors[0][i].id = dataDoors[i].id;
        const elem = document.querySelector("[id='" + dataDoors[i].id + "']")!;
        elem.setAttribute("id", String(dataDoors[i].id));
        elem.setAttribute("points", dataDoors[i].displayPoints.map(elem => String(elem.x) + "," + String(elem.y)).flat().join(" "))
        elem.setAttribute("fill", "rgb(" + dataDoors[i].color.join(",") + ")")
        elem.setAttribute("type", dataDoors[i].type)
        elem.setAttribute("class", dataDoors[i].type)
    }
}

/**
 * The **rotateDoor()** function rotates {@link GuidoNode}s of type {@link NodeType.DOOR} and
 * {@link NodeType.EMERGENCY_EXIT} with an angle of `15°`.
 *
 * @param door The D3 instance of the door.
 * @param data The {@link Map} containing the {@link Polygon}s and {@link GuidoNode}s of the overlay.
 * @param self The instance of the {@link Overlays} class.
 */
function rotateDoor(door: any, data: GuidoOverlays, self: Overlays): void {
    if (!self.jsonData.setNeighborMode && !self.jsonData.editMode && !self.jsonData.deleteMode) {
        d3.event.preventDefault();
        let doorElem = d3.select(door);
        let doorData = data.nodes.find((elem: GuidoNode) => elem.id === parseInt(doorElem.attr("id")))!;

        let result = Point.calculateNewCoordinatesForRotation(doorData.displayPoints, 15);
        doorData.degreesRotated += 15;
        doorData.displayPoints = result;
        d3.select(door).attr("points", Point.pointStringFromArrayOfPoints(result));
    }
}

/**
 * The **moveDoorCoordinates()** function moves the door coordinates when they are being dragged by the user.
 *
 * @param door The D3 instance of the door element.
 * @param data The {@link Map} containing the {@link Polygon}s and {@link GuidoNode}s of the overlay.
 * @param floorComp The instance of the {@link Overlays} class.
 */
function moveDoorCoordinates(door: any, data: GuidoOverlays, floorComp: Overlays): void {
    if (d3.event.sourceEvent.which === 1) {
        let doorElem = d3.select(door);
        let doorData = data.nodes.find((elem: GuidoNode) => elem.id === parseInt(doorElem.attr("id")))!;

        let svg = document.getElementById("demo" + floorComp.floor)!.getElementsByTagName("svg")[0];
        let svgWidth = parseFloat(String(svg.getAttribute("width")));
        let svgHeight = parseFloat(String(svg.getAttribute("height")));

        let dimensions = getDoorDimensions(doorData.displayPoints);

        // Point used in reconstructing the polygon after dragging
        let toBuildFrom = new Point(parseFloat(d3.event.x), parseFloat(d3.event.y));

        let points = [
            toBuildFrom,
            new Point(toBuildFrom.x + dimensions.width, toBuildFrom.y),
            new Point(toBuildFrom.x + dimensions.width, toBuildFrom.y + dimensions.length),
            new Point(toBuildFrom.x, toBuildFrom.y + dimensions.length)
        ];

        let degreesRotated = doorData.degreesRotated;

        if (degreesRotated !== 0) {
            points = Point.calculateNewCoordinatesForRotation(points, degreesRotated);
        }

        let middleX = (points[0].x + points[2].x) / 2;
        let middleY = (points[0].y + points[2].y) / 2;

        if (middleX > 0 && middleY > 0 && middleX < svgWidth && middleY < svgHeight) {
            doorElem.attr("points", Point.pointStringFromArrayOfPoints(points));
            doorData.displayPoints = points;
            doorData.point = toBuildFrom;
        }
    }
}

/**
 * The **getDoorDimensions()** function returns the door dimensions given its corners.
 *
 * @param doorCoords The {@link Array} containing the {@link Point}s of the door.
 * @return A map containing the length and width of the door.
 */
function getDoorDimensions(doorCoords: Point[]): { length: number, width: number } {
    const distance1 = Math.round(Math.sqrt(Math.pow(doorCoords[1].x - doorCoords[0].x, 2) + Math.pow(doorCoords[1].y - doorCoords[0].y, 2)));
    const distance2 = Math.round(Math.sqrt(Math.pow(doorCoords[2].x - doorCoords[1].x, 2) + Math.pow(doorCoords[2].y - doorCoords[1].y, 2)));
    return {
        length: distance1 > distance2 ? distance1 : distance2,
        width: distance1 > distance2 ? distance2 : distance1
    }
}

/**
 * The **drawPointsOfInterest()** function draws the point of interest {@link GuidoNode}s on the D3 floorplan.
 *
 * @param data All the objects inside the {@link GuidoOverlays} that need to be rendered on the workspace.
 * @param g The parent element of the overlay in which the point of interest {@link GuidoNode}s need to be rendered.
 * @param self The instance of the {@link Overlays} class.
 */
function drawPointsOfInterest(data: GuidoOverlays, g: any, self: Overlays): void {
    let pointsOfInterestData = data.nodes.filter(elem => elem.type !== NodeType.NODE && elem.type !== NodeType.EMERGENCY_EXIT && elem.type !== NodeType.DOOR);
    var nodes = g.selectAll("svg.pointOfInterest")
        .data(pointsOfInterestData || [], function (d: any) {
            return d.id;
        });

    const nodeGroup = nodes.enter().append("svg")
        .attr("height", "30px")
        .attr("width", "30px")
        .attr("removable", "")
        .attr("node", "")
        .attr("class", "pointOfInterest")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("pointer-events", "all")
        .attr("degreesRotated", 0)
        .on("mousedown", function (d: any) {
            self.selectCallbacks.forEach(function (cb: any) {
                cb(d.id);
            });
        })
        .call(d3.behavior.drag().on("drag", function () {
            // @ts-ignore
            generalDragBehavior(this, data, self)
        }));

    for (let i = 0; i < pointsOfInterestData.length; i++) {
        nodes[0][i].id = pointsOfInterestData[i].id;
        const elem = document.querySelector("[id='" + pointsOfInterestData[i].id + "']")!;
        elem.setAttribute("id", String(pointsOfInterestData[i].id));
        elem.setAttribute("pointsOfInterestId", String(pointsOfInterestData[i].id));
        elem.setAttribute("type", pointsOfInterestData[i].type);
        elem.setAttribute("floor", String(pointsOfInterestData[i].floor));
        elem.setAttribute("x", String(pointsOfInterestData[i].point.x - 15));
        elem.setAttribute("y", String(pointsOfInterestData[i].point.y - 15));
    }

    nodeGroup.append("rect")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("rx", "7");

    nodeGroup.append("svg")
        .attr("height", "100%")
        .attr("width", "100%")
        .append("path")
        .attr("fill", "#fff");

    for (let i = 0; i < pointsOfInterestData.length; i++) {
        const pointOfInterest = document.querySelector("[id='" + pointsOfInterestData[i].id + "']")!;
        pointOfInterest.setAttribute("floor", String(pointsOfInterestData[i].floor));
        pointOfInterest.setAttribute("neighbors", pointsOfInterestData[i].neighbors.join(","));
        // @ts-ignore
        const logo = nodeIcons[pointsOfInterestData[i].type];
        if (logo.backgroundColor !== undefined) {
            pointOfInterest.setAttribute("fill", logo.backgroundColor);
        }
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("viewBox", `${logo.viewBox[0] + (logo.viewBox[2] * -.1)} ${logo.viewBox[1] + (logo.viewBox[3] * -.1)} ${logo.viewBox[2] * 1.2} ${logo.viewBox[3] * 1.2}`);
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("d", logo.d);
        // Needed for when user selects child instead of parent for remove element
        pointOfInterest.getElementsByTagName("rect")[0].setAttribute("pointsOfInterestId", String(pointsOfInterestData[i].id));
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("pointsOfInterestId", String(pointsOfInterestData[i].id));
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("pointsOfInterestId", String(pointsOfInterestData[i].id));
    }
}

/**
 * The **drawLabels()** function draws the {@link GuidoNode}s of type Label on the D3 floorplan.
 *
 * @param data All the objects inside the {@link GuidoOverlays} that need to be rendered on the workspace.
 * @param g The parent element of the overlay in which the point of interest {@link GuidoNode}s need to be rendered.
 * @param self The instance of the {@link Overlays} class.
 */
function drawLabels(data: GuidoOverlays, g: any, self: Overlays): void {
    var labels = g.selectAll("svg.label")
        .data(data.labels || [], function (d: any) {
            return d.id;
        });

    const labelGroup = labels.enter().append("svg")
        .attr("height", "30px")
        .attr("width", "30px")
        .attr("removable", "")
        .attr("label", "")
        .attr("type", "Label")
        .attr("class", "label")
        .attr("vector-effect", "non-scaling-stroke")
        .attr("pointer-events", "all")
        .attr("degreesRotated", 0)
        .on("mousedown", function (d: any) {
            self.selectCallbacks.forEach(function (cb: any) {
                cb(d.id);
            });
        })
        .call(d3.behavior.drag().on("drag", function () {
            // @ts-ignore
            generalDragBehavior(this, data, self)
        }));

    for (let i = 0; i < labels[0].length; i++) {
        labels[0][i].id = data.labels[i].id;
        const elem = document.querySelector("[id='" + data.labels[i].id + "']")!;
        elem.setAttribute("id", String(data.labels[i].id));
        elem.setAttribute("pointsOfInterestId", String(data.labels[i].id));
        elem.setAttribute("x", String(data.labels[i].point.x - 15));
        elem.setAttribute("y", String(data.labels[i].point.y - 15));
    }

    labelGroup.append("rect")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("rx", "7");

    labelGroup.append("svg")
        .attr("height", "100%")
        .attr("width", "100%")
        .append("path")
        .attr("fill", "#fff");

    for (let i = 0; i < labels[0].length; i++) {
        const pointOfInterest = document.querySelector("[id='" + data.labels[i].id + "']")!;
        const logo = nodeIcons["Info"];
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("viewBox", `${logo.viewBox[0] + (logo.viewBox[2] * -.1)} ${logo.viewBox[1] + (logo.viewBox[3] * -.1)} ${logo.viewBox[2] * 1.2} ${logo.viewBox[3] * 1.2}`);
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("d", logo.d);
        // Needed for when user selects child instead of parent for remove element
        pointOfInterest.getElementsByTagName("rect")[0].setAttribute("pointsOfInterestId", String(data.labels[i].id));
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("pointsOfInterestId", String(data.labels[i].id));
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("pointsOfInterestId", String(data.labels[i].id));
    }
}

/**
 * The **generalDragBehavior()** function manages the drag behavior for all the {@link GuidoNode}s except for the types
 * {@link NodeType.DOOR} and {@link NodeType.EMERGENCY_EXIT} on the workspace.
 *
 * @param figure The {@link GuidoNode} {@link Element} that is being dragged.
 * @param data All the objects inside the {@link GuidoOverlays} that need to be rendered on the workspace.
 * @param self The instance of the {@link Overlays} class.
 */
function generalDragBehavior(figure: any, data: GuidoOverlays, self: Overlays): void {
    if (!self.jsonData.deleteMode && !self.jsonData.setNeighborMode && !self.jsonData.editMode) {
        let d3node = d3.select(figure);
        let elem: GuidoNode | Label;
        let floor: number;

        if (d3node.attr("type") !== "Label") {
            elem = data.nodes.find((elem: GuidoNode) => elem.id === parseInt(d3node.attr("id")))!;
            floor = elem.floor;
        } else {
            elem = data.labels.find((elem: Label) => elem.id === parseInt(d3node.attr("id")))!;
            floor = self.floor;
        }

        let svg = document.getElementById("demo" + floor)!.getElementsByTagName("svg")[0];
        let width = parseFloat(String(svg.getAttribute("width")));
        let height = parseFloat(String(svg.getAttribute("height")));
        let x = d3.event.x;
        let y = d3.event.y;

        if (x > 0 && y > 0 && x < width && y < height) {
            elem.point = new Point(x, y);

            // Apply the translation to the shape:
            d3.select(figure)
                .attr("x", x - (parseInt(d3.select(figure).attr("width").split("px")) / 2))
                .attr("y", y - (parseInt(d3.select(figure).attr("height").split("px")) / 2));
        }
    }
}
