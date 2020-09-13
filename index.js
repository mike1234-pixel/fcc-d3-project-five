// set the dimensions and margins of the graph
var margin = { top: 10, right: 10, bottom: 10, left: 10 },
  width = 1500 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#vis-container")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load all three datasets and await the results of all before moving on
const videogameData =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

// prepare a color scale
const fader = (color) => {
    return d3.interpolateRgb(color, "#fff")(0.6);
  },
  color = d3.scaleOrdinal(d3.schemeCategory10.map(fader)),
  format = d3.format(",d");

console.log(color(1));

// d3.v4 multi-load syntax - for v5 check choropleth-map project
d3.queue()
  .defer(d3.json, videogameData)
  .await((error, videogameData) => {
    if (error) throw error;
    console.log(videogameData);

    let dataset = videogameData;

    let description = "Top 100 Most Sold Video Games Grouped by Platform";

    const createTreemap = (dataset) => {
      d3.select("#title-description-container")
        .append("h1")
        .text(dataset.name)
        .attr("id", "title")
        .append("p")
        .text(description)
        .attr("id", "description");
      // Give the data to this cluster layout:
      var root = d3.hierarchy(dataset).sum((d) => {
        return d.value;
      }); // Here the size of each leave is given in the 'value' field in input data

      // Then d3.treemap computes the position of each element of the hierarchy
      d3.treemap().size([width, height]).padding(1)(root);

      //   tooltip
      const tooltip = d3
        .select("#tooltip-container")
        .append("div")
        .style("opacity", 0)
        .attr("id", "tooltip");

      // use this information to add rectangles:
      svg
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", "tile")
        .attr("x", (d) => {
          return d.x0;
        })
        .attr("y", (d) => {
          return d.y0;
        })
        .attr("width", (d) => {
          return d.x1 - d.x0;
        })
        .attr("height", (d) => {
          return d.y1 - d.y0;
        })
        .style("stroke", "black")
        .style("fill", (d, i, j) => {
          return color(d.data.category);
        }) // apply colors by category
        .attr("data-name", (d) => {
          return d.data.name;
        })
        .attr("data-category", (d) => {
          return d.data.category;
        })
        .attr("data-value", (d) => {
          return d.data.value;
        })
        // tooltip;
        .on("mouseover", (d) => {
          tooltip.style("opacity", 0.9);
          tooltip.attr("id", "tooltip");
          tooltip.attr("data-value", d.data.value);
          tooltip
            .html(
              `<p>Name: ${d.data.name}</p><p>Category: ${d.data.category}</p><p>Value: ${d.data.value}</p>`
            )
            .style("position", "absolute")
            .style("background-color", "grey")
            .style("padding", "10px");
          tooltip.style("left", d3.event.pageX + 10 + "px");
          tooltip.style("top", d3.event.pageY - 28 + "px"); // tooltip location = hover location
        })
        .on("mouseout", (d) => {
          tooltip.style("opacity", 0);
        });
      svg
        .selectAll("text")
        .data(root.leaves())
        .enter()
        .append("text")
        .selectAll("tspan")
        .attr("x", (d) => {
          return d.x0 + 5;
        }) // +10 to adjust position (more right)
        .attr("y", (d) => {
          return d.y0 + 20;
        }) // +20 to adjust position (lower)
        .data((d) => {
          return d.data.name
            .split(/(?=[A-Z][^A-Z])/g) // split the name of movie
            .map((v) => {
              return {
                text: v,
                x0: d.x0, // keep x0 reference
                y0: d.y0, // keep y0 reference
              };
            });
        })
        .enter()
        .append("tspan")
        .attr("x", (d) => d.x0 + 5)
        .attr("y", (d, i) => d.y0 + 15 + i * 10) // offset by index
        .text((d) => d.text)
        .attr("font-size", "0.6em")
        .attr("fill", "white");

      var categories = root.leaves().map((nodes) => {
        return nodes.data.category;
      });
      categories = categories.filter((category, index, self) => {
        return self.indexOf(category) === index;
      });

      const legendContainerHeight = 70;
      const legendContainerWidth = 600;

      d3.select("#legend")
        .append("svg")
        .attr("id", "legend-svg")
        .attr("height", legendContainerHeight)
        .attr("width", legendContainerWidth);

      const legendGroup = d3
        .select("#legend-svg")
        .append("g")
        .attr("height", legendContainerHeight)
        .attr("width", legendContainerWidth);

      legendGroup
        .selectAll()
        .data(categories)
        .enter()
        .append("rect")
        .attr("class", "legend-item")
        .attr("height", 30)
        .attr("width", 30)
        .attr("fill", (d) => color(d))
        .attr("x", (d, i) => {
          return i * 40;
        })
        .attr("y", 7);

      legendGroup
        .selectAll()
        .data(categories)
        .enter()
        .append("text")
        .text((d) => d)
        .attr("x", (d, i) => i * 40)
        .attr("y", 50)
        .style("font-size", 10);
    };

    createTreemap(dataset);
  });
