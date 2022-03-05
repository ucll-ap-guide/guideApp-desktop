import {Point} from "../model/point";
import {pointsOfInterest} from "./point-of-interest";
import * as select from "ajv-keywords";
import {Polygon} from "../model/polygon";
import {Label} from "../model/label";
import {GuidoNode} from "../model/guido-node";


declare var d3: any;
type OverlayData = {polygons: Polygon[], labels: Label[], nodes: GuidoNode[]}

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

    constructor() {
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

    }

    createOverlays(groups: any) {
        console.log(groups.data())
        let self = this;
        groups.each(function (data: OverlayData) {
            if (!data) return;
            // @ts-ignore
            var g = d3.select(this);

            // setup rectangle for capturing events
            setupCanvas(g, self);

            // draw polygons
            drawPolygons(data, g, self);

            // draw nodes
            drawNodes(data, g, self);

            //draw labels
            drawLabels(data, g, self);
        })
    }


    getId() {
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
     * Drag rooms and floor (polygon) except if in editMode deleteMode or setNeighborMode.
     * Floors can also only be dragged if the attribute "draggable" is set to true
     */
    __mousemove(event: any, self: any) {
        // @ts-ignore
        if (self.dragged && (event.getAttribute("type") !== "Floor" || !document.getElementById("lockFloor" + event.parentElement.parentElement.parentElement.parentElement.parentElement.id.split("demo")[1])!.checked) && document.getElementById("setNeighborModeButton")!.className.includes("text-white") && document.getElementById("editModeButton")!.className.includes("text-white") && document.getElementById("deleteModeButton")!.className.includes("text-white")) {
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

    __mouseup(event: any, self: any) {
        if (self.dragged) {
            self.moveCallbacks.forEach(function (cb: any) {
                self.dragged.parent ? cb(self.dragged.parent.id, self.dragged.parent.points, self.dragged.index) :
                    cb(self.dragged.id, self.dragged.points);
            });
            self.dragged = null;
        }
    }
}

function setupCanvas(g: any, self: Overlays) {
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


function drawPolygons(data: OverlayData, g: any, self: Overlays) {
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
        if (data.polygons[i].type !== "Floor") {
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
    type PointData = {index: number, parent: Polygon};
    if (self.editMode) {
        let pointData: PointData[] = [];
        if (data.polygons) {
            data.polygons.forEach(function (polygon: any) {
                if (polygon.type !== "Floor") {
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

function drawNodes(data: OverlayData, g: any, self: Overlays) {
    var nodes = g.selectAll("svg.pointOfInterest")
        .data(data.nodes || [], function (d: any) {
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
            if (document.getElementById("setNeighborModeButton")!.className.includes("text-white") && document.getElementById("editModeButton")!.className.includes("text-white") && document.getElementById("deleteModeButton")!.className.includes("text-white")) {
                // @ts-ignore
                let d3node = d3.select(this)
                const node = data.nodes.find((elem: GuidoNode) => elem.id === parseInt(d3node.attr("id")))!;
                let svg = document.getElementById("demo" + node.floor)!.getElementsByTagName("svg")[0];
                let width = parseFloat(String(svg.getAttribute("width")));
                let height = parseFloat(String(svg.getAttribute("height")));
                let x = d3.event.x;
                let y = d3.event.y;

                if (x > 0 && y > 0 && x < width && y < height) {
                    node.point = new Point(x, y);

                    // Apply the translation to the shape:
                    // @ts-ignore
                    d3.select(this)
                        // @ts-ignore
                        .attr("x", x - (parseInt(d3.select(this).attr("width").split("px")) / 2))
                        // @ts-ignore
                        .attr("y", y - (parseInt(d3.select(this).attr("height").split("px")) / 2));
                }
            }
        }));

    for (let i = 0; i < nodes[0].length; i++) {
        nodes[0][i].id = data.nodes[i].id;
        const elem = document.querySelector("[id='" + data.nodes[i].id + "']")!;
        elem.setAttribute("id", String(data.nodes[i].id));
        elem.setAttribute("pointsOfInterestId", String(data.nodes[i].id));
        elem.setAttribute("type", data.nodes[i].type);
        elem.setAttribute("x", String(data.nodes[i].point.x - 15));
        elem.setAttribute("y", String(data.nodes[i].point.y - 15));
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

    for (let i = 0; i < nodes[0].length; i++) {
        const pointOfInterest = document.querySelector("[id='" + data.nodes[i].id + "']")!;
        pointOfInterest.setAttribute("floor", String(data.nodes[i].floor));
        pointOfInterest.setAttribute("neighbors", data.nodes[i].neighbors.join(","));
        // @ts-ignore
        const logo = pointsOfInterest[data.nodes[i].type];
        if (logo.backgroundColor !== undefined) {
            pointOfInterest.setAttribute("fill", logo.backgroundColor);
        }
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("viewBox", `${logo.viewBox[0] + (logo.viewBox[2] * -.1)} ${logo.viewBox[1] + (logo.viewBox[3] * -.1)} ${logo.viewBox[2] * 1.2} ${logo.viewBox[3] * 1.2}`);
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("d", logo.d);
        // Needed for when user selects child instead of parent for remove element
        pointOfInterest.getElementsByTagName("rect")[0].setAttribute("pointsOfInterestId", String(data.nodes[i].id));
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("pointsOfInterestId", String(data.nodes[i].id));
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("pointsOfInterestId", String(data.nodes[i].id));
    }
}

function drawLabels(data: OverlayData, g: any, self: Overlays) {
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
            if (document.getElementById("setNeighborModeButton")!.className.includes("text-white") && document.getElementById("editModeButton")!.className.includes("text-white") && document.getElementById("deleteModeButton")!.className.includes("text-white")) {
                // @ts-ignore
                let d3node = d3.select(this)
                const label = data.labels.find((elem: Label) => elem.id === parseInt(d3node.attr("id")))!;
                // @ts-ignore
                const floor = this.parentElement.parentElement.parentElement.parentElement.parentElement.id.split("demo")[1]

                let svg = document.getElementById("demo" + floor)!.getElementsByTagName("svg")[0];
                let width = parseFloat(String(svg.getAttribute("width")));
                let height = parseFloat(String(svg.getAttribute("height")));
                let x = d3.event.x;
                let y = d3.event.y;

                if (x > 0 && y > 0 && x < width && y < height) {
                    label.point = new Point(x, y);

                    // Apply the translation to the shape:
                    // @ts-ignore
                    d3.select(this)
                        // @ts-ignore
                        .attr("x", x - (parseInt(d3.select(this).attr("width").split("px")) / 2))
                        // @ts-ignore
                        .attr("y", y - (parseInt(d3.select(this).attr("height").split("px")) / 2));
                }
            }
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
        const logo = pointsOfInterest["Info"];
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("viewBox", `${logo.viewBox[0] + (logo.viewBox[2] * -.1)} ${logo.viewBox[1] + (logo.viewBox[3] * -.1)} ${logo.viewBox[2] * 1.2} ${logo.viewBox[3] * 1.2}`);
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("d", logo.d);
        // Needed for when user selects child instead of parent for remove element
        pointOfInterest.getElementsByTagName("rect")[0].setAttribute("pointsOfInterestId", String(data.labels[i].id));
        pointOfInterest.getElementsByTagName("svg")[0].setAttribute("pointsOfInterestId", String(data.labels[i].id));
        pointOfInterest.getElementsByTagName("path")[0].setAttribute("pointsOfInterestId", String(data.labels[i].id));
    }
}


