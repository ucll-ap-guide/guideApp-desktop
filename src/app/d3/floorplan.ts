import {Imagelayer} from "./imagelayer";
import {Overlays} from "./overlays";

declare var d3: any

/**
 * A class that manages and scales the different layers.
 *
 * Code partially from {@link https://dciarletta.github.io/d3-floorplan/}, completely refactored to TypeScript and
 * fitted to project.
 */
export class Floorplan {
    layers: any = [];
    panZoomEnabled = true;
    maxZoom = 5;
    xScale = d3.scale.linear();
    yScale = d3.scale.linear();

    generateMap(groups: any) {
        let width = this.xScale.range()[1] - this.xScale.range()[0];
        let height = this.yScale.range()[1] - this.yScale.range()[0];
        let self = this;

        groups.each(function(data: any){
            if(!data) return;

            // @ts-ignore
            let svg = d3.select(this);

            // define common graphical elements
            self.__init_defs(svg.selectAll("defs").data([0]).enter().append("defs"));

            // setup container for layers and area to capture events
            let vis = svg.selectAll(".map-layers").data([0]);
            let visEnter = vis.enter().append("g").attr("class", "map-layers").attr("id", "map-layers");
            let visUpdate = d3.transition(vis);

            visEnter.append("rect")
                .attr("class", "canvas")
                .attr("pointer-events", "all")
                .style("opacity", 0);

            visUpdate.attr("width", width)
                .attr("height", height)
                .attr("x", self.xScale.range()[0])
                .attr("y", self.yScale.range()[0]);

            // setup map controls
            let controls = svg.selectAll(".map-controls").data([0]);
            let controlsEnter = controls.enter().append("g").attr("class", "map-controls");

            self.__init_controls(controlsEnter);

            let offset = controls.select(".hide").classed("ui-show-hide") ? 95 : 10;
            let panelHt = Math.max(45, 10 + self.layers.length * 20);
            controls.attr("view-width", width)
                .attr("transform", "translate(" + (width - offset) + ",0)")
                .select("rect")
                .attr("height", panelHt);

            // render and reorder layer controls
            let layerControls = controls.select("g.layer-controls").selectAll("g").data(self.layers, function (l: any) {
                return l.getId();
            });
            let layerControlsEnter = layerControls.enter()
                .append("g").attr("class", "ui-active")
                .style("cursor", "pointer")
                .on("click", function (l: any) {
                    // @ts-ignore
                    let button = d3.select(this);
                    let layer = svg.selectAll("g." + l.getId());
                    if (button.classed("ui-active")) {
                        layer.style("display", "none");
                        button.classed("ui-active", false)
                            .classed("ui-default", true);
                    } else {
                        layer.style("display", "inherit");
                        button.classed("ui-active", true)
                            .classed("ui-default", false);
                    }
                });

            layerControlsEnter.append("rect")
                .attr("x", 0)
                .attr("y", 1)
                .attr("rx", 5)
                .attr("ry", 5)
                .attr("width", 75)
                .attr("height", 18)
                .attr("stroke-width", "1px");

            layerControlsEnter.append("text")
                .attr("x", 10)
                .attr("y", 15)
                .style("font-size", "12px")
                .style("font-family", "Helvetica, Arial, sans-serif")
                .text(function (l: any) {
                    return l.title();
                });

            layerControls.transition().duration(1000)
                .attr("transform", function (d: any, i: any) {
                    return "translate(0," + ((self.layers.length - (i + 1)) * 20) + ")";
                });

            // render and reorder layers
            var maplayers = vis.selectAll(".maplayer").data(self.layers, function (l: any) {
                return l.getId();
            });
            maplayers.enter()
                .append("g")
                .attr("class", function (l: any) {
                    return "maplayer " + l.title();
                })
                .append("g")
                .attr("class", function (l: any) {
                    return l.getId();
                })
                .datum(null);
            maplayers.exit().remove();
            maplayers.order();

            // redraw layers
            maplayers.each(function (layer: any) {
                // @ts-ignore
                d3.select(this).select("g." + layer.getId()).datum(data.get(layer.getId())).call(function () {
                    if (layer instanceof Imagelayer) {
                        // @ts-ignore
                        return layer.createImageLayer(this);
                    } else if (layer instanceof Overlays) {
                        // @ts-ignore
                        return layer.createOverlays(this);
                    }
                });
            });

            // add pan - zoom behavior
            svg.call(d3.behavior.zoom().scaleExtent([1, self.maxZoom])
                .on("zoom", function () {
                    if (self.panZoomEnabled) {
                        self.__set_view(svg, d3.event.scale, d3.event.translate);
                    }
                }));
        });
    }

    getSetxScale(scale?: any) {
        if (!arguments.length) return this.xScale;
        this.xScale = scale;
        let self = this;
        this.layers.forEach(function (l: any) {
            l.xScale(self.xScale);
        });
    }

    getSetyScale(scale?: any) {
        if (!arguments.length) return this.yScale;
        this.yScale = scale;
        let self = this;
        this.layers.forEach(function (l: any) {
            l.yScale(self.yScale);
        });
    }

    panZoom(enabled: boolean) {
        if (!arguments.length) return this.panZoomEnabled;
        this.panZoomEnabled = enabled;
        return this.panZoomEnabled;
    };

    addLayer(layer: any, index: number) {
        layer.xScale(this.xScale);
        layer.yScale(this.yScale);

        if (arguments.length > 1 && index >= 0) {
            this.layers.splice(index, 0, layer);
        } else {
            this.layers.push(layer);
        }

        return this;
    }

    /**
     * The **clearLayers()** function removes all the floorplan layers.
     */
    clearLayers(): void {
        this.layers = [];
    }

    __set_view(svg: any, scale: any, translation: any) {
        if (!svg) return;
        if (scale) svg.__scale__ = scale;
        if (translation && translation.length > 1) svg.__translate__ = translation;

        // limit translate to edges of extents
        var minXTranslate = (1 - svg.__scale__) * (this.xScale.range()[1] - this.xScale.range()[0]);
        var minYTranslate = (1 - svg.__scale__) * (this.yScale.range()[1] - this.yScale.range()[0]);

        svg.__translate__[0] = Math.min(this.xScale.range()[0], Math.max(svg.__translate__[0], minXTranslate));
        svg.__translate__[1] = Math.min(this.yScale.range()[0], Math.max(svg.__translate__[1], minYTranslate));
        svg.selectAll(".map-layers")
            .attr("transform", "translate(" + svg.__translate__ + ")scale(" + svg.__scale__ + ")");
    }

    __init_defs(selection: any) {
        selection.each(function () {
            // @ts-ignore
            var defs = d3.select(this);

            var grad = defs.append("radialGradient")
                .attr("id", "metal-bump")
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "50%")
                .attr("fx", "50%")
                .attr("fy", "50%");

            grad.append("stop")
                .attr("offset", "0%")
                .style("stop-color", "rgb(170,170,170)")
                .style("stop-opacity", 0.6);

            grad.append("stop")
                .attr("offset", "100%")
                .style("stop-color", "rgb(204,204,204)")
                .style("stop-opacity", 0.5);

            var grip = defs.append("pattern")
                .attr("id", "grip-texture")
                .attr("patternUnits", "userSpaceOnUse")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", 3)
                .attr("height", 3);

            grip.append("rect")
                .attr("height", 3)
                .attr("width", 3)
                .attr("stroke", "none")
                .attr("fill", "rgba(204,204,204,0.5)");

            grip.append("circle")
                .attr("cx", 1.5)
                .attr("cy", 1.5)
                .attr("r", 1)
                .attr("stroke", "none")
                .attr("fill", "url(#metal-bump)");
        });
    }

    __init_controls(selection: any) {
        selection.each(function () {
            // @ts-ignore
            var controls = d3.select(this);

            controls.append("path")
                .attr("class", "ui-show-hide")
                .attr("d", "M10,3 v40 h-7 a3,3 0 0,1 -3,-3 v-34 a3,3 0 0,1 3,-3 Z")
                .attr("fill", "url(#grip-texture)")
                .attr("stroke", "none")
                .style("opacity", 0.5);

            controls.append("path")
                .attr("class", "show ui-show-hide")
                .attr("d", "M2,23 l6,-15 v30 Z")
                .attr("fill", "rgb(204,204,204)")
                .attr("stroke", "none")
                .style("opacity", 0.5);

            controls.append("path")
                .attr("class", "hide")
                .attr("d", "M8,23 l-6,-15 v30 Z")
                .attr("fill", "rgb(204,204,204)")
                .attr("stroke", "none")
                .style("opacity", 0);

            controls.append("path")
                .attr("d", "M10,3 v40 h-7 a3,3 0 0,1 -3,-3 v-34 a3,3 0 0,1 3,-3 Z")
                .attr("pointer-events", "all")
                .attr("fill", "none")
                .attr("stroke", "none")
                .style("cursor", "pointer")
                .on("mouseover", function () {
                    controls.selectAll("path.ui-show-hide").style("opacity", 1);
                })
                .on("mouseout", function () {
                    controls.selectAll("path.ui-show-hide").style("opacity", 0.5);
                })
                .on("click", function () {
                    if (controls.select(".hide").classed("ui-show-hide")) {
                        controls.transition()
                            .duration(1000)
                            .attr("transform", "translate(" + (controls.attr("view-width") - 10) + ",0)")
                            .each("end", function () {
                                controls.select(".hide")
                                    .style("opacity", 0)
                                    .classed("ui-show-hide", false);
                                controls.select(".show")
                                    .style("opacity", 1)
                                    .classed("ui-show-hide", true);
                                controls.selectAll("path.ui-show-hide")
                                    .style("opacity", 0.5);
                            });
                    } else {
                        controls.transition()
                            .duration(1000)
                            .attr("transform", "translate(" + (controls.attr("view-width") - 95) + ",0)")
                            .each("end", function () {
                                controls.select(".show")
                                    .style("opacity", 0)
                                    .classed("ui-show-hide", false);
                                controls.select(".hide")
                                    .style("opacity", 1)
                                    .classed("ui-show-hide", true);
                                controls.selectAll("path.ui-show-hide")
                                    .style("opacity", 0.5);
                            });
                    }
                });

            controls.append("rect")
                .attr("x", 10)
                .attr("y", 0)
                .attr("width", 85)
                .attr("fill", "rgba(204,204,204,0.9)")
                .attr("stroke", "none");

            controls.append("g")
                .attr("class", "layer-controls")
                .attr("transform", "translate(15,5)");
        });
    }
}
