declare var d3: any;

export class Imagelayer {
    x = d3.scale.linear()
    y = d3.scale.linear();
    id = "fp-imagelayer-" + new Date().valueOf();
    name = "Image";

    createImageLayer(groups: any) {
        let self = this;
        groups.each(function (data: any) {
            if (!data) return;
            // @ts-ignore
            let g = d3.select(this);

            let imgs = g.selectAll("image").data(data, function(img: any) {
                return img.url;
            })

            imgs.enter().append("image")
                .attr("xlink:href", function (img: any) {
                    return img.url;
                })
                .style("opacity", 1e-6);

            imgs.exit().transition().style("opacity", 1e-6).remove();

            imgs.transition()
                .attr("x", function (img: any) {
                    return self.x(img.x);
                })
                .attr("y", function (img: any) {
                    return self.y(img.y);
                })
                .attr("height", function (img: any) {
                    return self.y(img.y + img.height) - self.y(img.y);
                })
                .attr("width", function (img: any) {
                    return self.x(img.x + img.width) - self.x(img.x);
                })
                .style("opacity", function (img: any) {
                    return img.opacity || 1.0;
                });
        });
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

    getId() {
        return this.id;
    };

    title(n?: any) {
        if (!arguments.length) return this.name;
        this.name = n;
        return this.name;
    };
}
