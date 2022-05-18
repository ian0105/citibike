class Barplot1 {
    margin = {
        top: 10, right: 100, bottom: 40, left: 40
    }

    constructor(svg, data, width = 250, height = 250) {
        this.svg = svg;
        this.data = data;
        this.width = width;
        this.height = height;

        this.handlers = {};
    }

    initialize() {
        this.svg = d3.select(this.svg);
        this.container = this.svg.append("g");
        this.xAxis = this.svg.append("g");
        this.yAxis = this.svg.append("g");
        this.legend = this.svg.append("g");

        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        this.svg
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.container.attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);



        this.brush = d3.brush()
            .extent([[0, 0], [this.width, this.height]])
            .on("start brush", (event) => {
                this.brushBars(event);
            })
    }

    update(sstation, estation) {
      let data_1 = data.filter(d => d["start station name"]===sstation)
      this.data_2 = data_1.filter(d => d["end station name"]===estation)

      const categories = [...new Set(this.data_2.map(d => d["starttime"]))].sort()
      const counts = {}

      categories.forEach(c => {
          counts[c] = this.data_2.filter(d => d["starttime"] === c).length;
      })


      this.xScale.domain(categories).range([0, this.width]).padding(0.3);
      this.yScale.domain([0, d3.max(Object.values(counts))]).range([this.height, 0]);

      // TODO: draw a histogram
      this.bars = this.container.selectAll("rect")
          .data(categories)
          .join("rect");

      this.bars
          .attr("x", d => this.xScale(d))
          .attr("y", d => this.yScale(counts[d]))
          .attr("width", this.xScale.bandwidth())
          .attr("height", d => this.height - this.yScale(counts[d]))
          .attr("fill", "blue")

      this.container.call(this.brush);


      this.xAxis
          .attr("transform", `translate(${this.margin.left}, ${this.margin.top + this.height})`)
          .call(d3.axisBottom(this.xScale));

      this.yAxis
          .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`)
          .call(d3.axisLeft(this.yScale));
    }

    isBrushed(d, selection) {
        let [[x0, y0], [x1, y1]] = selection; // destructuring assignment
        let x = this.xScale(d["starttime"]);

        return x0 <= x && x <= x1;

    }

    // this method will be called each time the brush is updated.
    brushBars(event) {
        let selection = event.selection;

        this.bars.classed("brushed", d => this.isBrushed(d, selection));

        if (this.handlers.brush)
            this.handlers.brush(this.data_2.filter(d => this.isBrushed(d, selection)));
    //    console.log(this.data.filter(d => this.isBrushed(d, selection)))
    }

    on(eventType, handler) {
        this.handlers[eventType] = handler;
    }
}
