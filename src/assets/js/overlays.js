//
//   Copyright 2012 David Ciarletta
//
//   Licensed under the Apache License, Version 2.0 (the "License");
//   you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//
//       http://www.apache.org/licenses/LICENSE-2.0
//
//   Unless required by applicable law or agreed to in writing, software
//   distributed under the License is distributed on an "AS IS" BASIS,
//   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//   See the License for the specific language governing permissions and
//   limitations under the License.
//

class Point {
    x;
    y;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

d3.floorplan.overlays = function () {
    var x = d3.scale.linear(),
        y = d3.scale.linear(),
        id = "fp-overlays-" + new Date().valueOf(),
        name = "overlays",
        canvasCallbacks = [],
        selectCallbacks = [],
        moveCallbacks = [],
        editMode = false,
        line = d3.svg.line()
            .x(function (d) {
                return x(d.x);
            })
            .y(function (d) {
                return y(d.y);
            }),
        dragBehavior = d3.behavior.drag()
            .on("dragstart", __dragItem)
            .on("drag", __mousemove)
            .on("dragend", __mouseup),
        dragged = null;

    function overlays(g) {
        g.each(function (data) {
            if (!data) return;
            var g = d3.select(this);

            // setup rectangle for capturing events
            var canvas = g.selectAll("rect.overlay-canvas").data([0]);

            canvas.enter().append("rect")
                .attr("class", "overlay-canvas")
                .style("opacity", 0)
                .attr("pointer-events", "all")
                .on("click", function () {
                    if (editMode) {
                        var p = d3.mouse(this);
                        canvasCallbacks.forEach(function (cb) {
                            cb(x.invert(p[0]), y.invert(p[1]));
                        });
                    }
                })
                .on("mouseup.drag", __mouseup)
                .on("touchend.drag", __mouseup);

            canvas.attr("x", x.range()[0])
                .attr("y", y.range()[0])
                .attr("height", y.range()[1] - y.range()[0])
                .attr("width", x.range()[1] - x.range()[0]);

            // draw polygons (currently only type supported)
            var polygons = g.selectAll("path.polygon")
                .data(data.polygons || [], function (d) {
                    return d.id;
                });

            polygons.enter().append("path")
                .attr("class", "polygon")
                .attr("vector-effect", "non-scaling-stroke")
                .attr("pointer-events", "all")
                .on("mousedown", function (d) {
                    selectCallbacks.forEach(function (cb) {
                        cb(d.id);
                    });
                })
                .call(dragBehavior)
                .append("title");

            for (let i = 0; i < polygons[0].length; i++) {
                polygons[0][i].id = data.polygons[i].id;
                const elem = document.querySelector("[id='" + data.polygons[i].id + "']");
                elem.setAttribute("id", data.polygons[i].id);
                elem.setAttribute("type", data.polygons[i].type);
                if (data.polygons[i].type === "Floor") {
                    elem.setAttribute("fill", "#0004ff");
                } else {
                    elem.setAttribute("removable", "");
                }
            }

            polygons.exit().transition().style("opacity", 1e-6).remove();
            g.attr("id", function (a) {
                return a.id;
            });
            g.attr("floor", function (a) {
                return a.floor;
            })
            polygons
                .attr("d", function (d) {
                    return line(d.points) + "Z";
                })
                .style("cursor", editMode ? "move" : "pointer")
                .select("title")
                .text(function (d) {
                    return d.name || d.id;
                });

            // draw nodes (currently only type supported)
            var nodes = g.selectAll("path.node")
                .data(data.nodes || [], function (d) {
                    return d.id;
                });

            const nodeGroup = nodes.enter().append("g")
                .attr("class", "node")
                .attr("vector-effect", "non-scaling-stroke")
                .attr("pointer-events", "all")
                .on("mousedown", function (d) {
                    selectCallbacks.forEach(function (cb) {
                        cb(d.id);
                    });
                })
                .call(d3.behavior.drag().on("drag", function () {
                    const node = data.nodes.find((elem) => elem.id === parseInt(this.id))
                    // Current position:
                    this.x = node.point.x;
                    this.y = node.point.y;
                    // Update thee position with the delta x and y applied by the drag:
                    this.x += d3.event.dx;
                    this.y += d3.event.dy;

                    console.log(node.point)
                    const point = new Point(this.x, this.y)
                    node.point = point;
                    node.displayPoints = [
                        point,
                        new Point(this.x + 100, this.y),
                        new Point(this.x + 100, this.y + 100),
                        new Point(this.x, this.y + 100)
                    ]

                    // Apply the translation to the shape:
                    d3.select(this)
                        .attr("transform", "translate(" + this.x + "," + this.y + ")");
                }))

            for (let i = 0; i < nodes[0].length; i++) {
                nodes[0][i].id = data.nodes[i].id;
                const elem = document.querySelector("[id='" + data.nodes[i].id + "']");
                elem.setAttribute("id", data.nodes[i].id);
                elem.setAttribute("type", data.nodes[i].type);
                elem.setAttribute("removable", "");
                nodeGroup.attr("transform", `translate(${data.nodes[i].point.x},${data.nodes[i].point.y})`);
            }

            nodeGroup.append("path")
                .attr("d", "M30.39,35.84v66.43a4.87,4.87,0,0,1-4.85,4.86h0a4.88,4.88,0,0,1-4.86-4.86V63.21H18.77v39.06a4.87,4.87,0,0,1-4.85,4.86h0a4.88,4.88,0,0,1-4.86-4.86V35.84H7.37V60.25a3.7,3.7,0,0,1-3.69,3.68h0A3.7,3.7,0,0,1,0,60.25V34c0-4.27,1.44-7.27,4.05-9.24,4.5-3.39,26.72-3.39,31.22,0,2.62,2,4.07,5,4.06,9.24V60.25a3.7,3.7,0,0,1-3.68,3.68h0A3.7,3.7,0,0,1,32,60.25V35.84ZM53.51,2.78a2.81,2.81,0,0,1,5.62,0V107.13a2.81,2.81,0,0,1-5.62,0V2.78ZM115,33c.06.15.11.3.16.46l7.59,27a3.77,3.77,0,1,1-7.27,2L108,35.81l-.11,0H106.3v1.69l10,39.74h-10v25a4.87,4.87,0,0,1-4.85,4.86h0a4.88,4.88,0,0,1-4.85-4.86v-25H94.68v25a4.88,4.88,0,0,1-4.86,4.86h0A4.87,4.87,0,0,1,85,102.27v-25H74.38L85,36.48v-.64h-1.7l-.14,0L75.64,62.46a3.77,3.77,0,1,1-7.27-2L75.8,34l-.08,0c1.14-4.25,2.09-7.27,4.71-9.24,4.5-3.39,26.24-3.39,30.75,0C113.6,26.56,114,29,115,33ZM95.57,2.78a8.78,8.78,0,1,1-8.78,8.78,8.78,8.78,0,0,1,8.78-8.78Zm-75.91,0a8.78,8.78,0,1,1-8.78,8.78,8.78,8.78,0,0,1,8.78-8.78Z")

            nodes.exit().transition().style("opacity", 1e-6).remove();
            g.attr("id", function (a) {
                return a.id;
            });
            g.attr("floor", function (a) {
                return a.floor;
            })

            if (editMode) {
                var pointData = [];
                if (data.polygons) {
                    data.polygons.forEach(function (polygon) {
                        if (polygon.type !== "Floor") {
                            polygon.points.forEach(function (pt, i) {
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
                    .data(pointData, function (d) {
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
                    .call(dragBehavior);

                points
                    .attr("cx", function (d) {
                        return x(d.parent.points[d.index].x);
                    })
                    .attr("cy", function (d) {
                        return y(d.parent.points[d.index].y);
                    })
                    .attr("r", 4 / scale);
            } else {
                g.selectAll("circle.vertex").transition()
                    .attr("r", 1e-6).remove();
            }
        });
    }

    overlays.xScale = function (scale) {
        if (!arguments.length) return x;
        x = scale;
        return overlays;
    };

    overlays.yScale = function (scale) {
        if (!arguments.length) return y;
        y = scale;
        return overlays;
    };

    overlays.id = function () {
        return id;
    };

    overlays.title = function (n) {
        if (!arguments.length) return name;
        name = n;
        return overlays;
    };

    overlays.editMode = function (enable) {
        if (!arguments.length) return editMode;
        editMode = enable;
        return overlays;
    };

    overlays.registerCanvasCallback = function (cb) {
        if (arguments.length) canvasCallbacks.push(cb);
        return overlays;
    };

    overlays.registerSelectCallback = function (cb) {
        if (arguments.length) select.Callbacks.push(cb);
        return overlays;
    };

    overlays.registerMoveCallback = function (cb) {
        if (arguments.length) moveCallbacks.push(cb);
        return overlays;
    };

    function __dragItem(d) {
        if (editMode) dragged = d;
    }

    function __mousemove() {
        if (dragged) {
            var dx = x.invert(d3.event.dx) - x.invert(0);
            var dy = y.invert(d3.event.dy) - y.invert(0);
            if (dragged.parent) { // a point
                dragged.parent.points[dragged.index].x += dx;
                dragged.parent.points[dragged.index].y += dy;
            } else if (dragged.points) { // a composite object
                dragged.points.forEach(function (pt) {
                    pt.x += dx;
                    pt.y += dy;
                });
            }
            // parent is container for overlays
            overlays(d3.select(this.parentNode));
        }
    }

    function __mouseup() {
        if (dragged) {
            moveCallbacks.forEach(function (cb) {
                dragged.parent ? cb(dragged.parent.id, dragged.parent.points, dragged.index) :
                    cb(dragged.id, dragged.points);
            });
            dragged = null;
        }
    }

    return overlays;
};
