// set the dimensions and margins of the graph
var margin = {
        top: 10,
        right: 30,
        bottom: 50,
        left: 75
    },
    width = window.innerWidth - 550 - margin.left - margin.right-100,
    height = window.innerHeight - 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "whitesmoke")
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
  .text("Data: https://finance.yahoo.com/quote/BTC-USD/history/")
  .attr("x", 710)
  .attr("y", 625)
  .style("font-size", 'x-small')
  .style("fill", "grey");

// add labels
svg.append('g')
    .attr('transform', 'translate(' + -50 + ', ' + height / 2 + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('BTC Price (USD)');

svg.append('g')
    .attr('transform', 'translate(' + width / 2 + ', ' + (height + 40) + ')')
    .append('text')
    .attr('text-anchor', 'middle')
    .text('Volume (Billions)');


// Set the ranges
var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

// define the x axis
var xAxis = d3.axisBottom(xScale);

// define the y axis
var yAxis = d3.axisLeft(yScale);

// Set the color scheme
var colors = d3.scaleOrdinal()
    .domain(["2017", "2018", "2019", "2020", "2021", "2022"])
    .range(["#A93226", "#E74C3C", "#f0b216", "#339966", "#5965A3", "#730099"]);

// Define the line
var valueLine = d3.line().curve(d3.curveCatmullRom)
    .x(function(d) {
        return xScale(+d.volume);
    })
    .y(function(d) {
        return yScale(+d.price);
    })

// Define the points
var point = function(d) {
    return "translate(" + valueLine.x()(d) + " " + valueLine.y()(d) + ")";
};

// create a tooltip
var Tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "dimgray")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("padding", "5px")
    .style("position", "absolute")
    .style("color", "white")

var year = 2022;
var marker = '';
var all_data = '';
var nest = '';
var change = false;
var allAnnotations = true;

// Import the CSV data
d3.csv("BTC_scatter_data.csv", function(error, data) {
    if (error) throw error;

    // Format the data
    data.forEach(function(d) {
        d.price = +d.price;
        d.volume = +d.volume;
    });

    all_data = data;

    nest = d3.nest()
        .key(function(d) {
            return d.year;
        })
        .entries(data)

    // Set the x/y max and scale
    x_max = d3.max(data, function(d) {
        return d.volume;
    });

    y_max = d3.max(data, function(d) {
        return d.price;
    });

    xScale.domain([0, x_max]);
    yScale.domain([0, y_max]);

    // Add the x axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "xaxis")
        .call(xAxis
            .ticks(14)
            .tickSize(0, 0)
            .tickSizeInner(0)
            .tickPadding(10));

    // Add the Y Axis
    svg.append("g")
        .attr("class", "yaxis")
        .call(yAxis
            .ticks(5)
            .tickSizeInner(0)
            .tickPadding(6)
            .tickSize(0, 0));

    buildElements(year);
})


// Three function that change the tooltip when user hover / move / leave a cell
var mouseover = function(d) {
    var pnt = d3.selectAll(".date_" + d.month + d.year);

    Tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.95)
        pnt.attr("r", 6).style("stroke", "#000");
}

var mousemove = function(d) {
    var pnt = d3.selectAll(".date_" + d.month + d.year);

    var element = document.getElementById('my_dataviz');
    var rect = element.getBoundingClientRect();

    Tooltip
        .html(d.month + ", " + d.year + "\n\n" +
        "Closing Price: $" + Math.round(d.price,0).toLocaleString('en-US') +   "\n" + "Monthly Volume: $" + Math.round(d.volume,0).toLocaleString('en-US') + 'B' + "\n" )
        .style("white-space", "pre-line")
        .style("top",  (rect.top  + yScale(d.price)  + 25) + "px")
        .style("left", (rect.left + xScale(d.volume) + 90) + "px")
}

var mouseleave = function(d) {
    var pnt = d3.selectAll(".date_" + d.month + d.year);

    Tooltip
        .transition()
        .duration(500)
        .style("opacity", 0)
        pnt.attr("r", 4).style("stroke", "lightgray");

d3.selectAll(".date_").raise();

}

function buildElements(button_year){
    // filter data by year
    var filtered_data = all_data.filter(function(d) {
        return +d.year <= button_year;
    });

    var filtered_nest = nest.filter(function(d) {
     return +d.key <= button_year;
    });

    x_max = d3.max(filtered_data, function(d) {
        return d.volume;
    });

    y_max = d3.max(filtered_data, function(d) {
        return d.price;
    });

    // Rescale axis
    xScale.domain([0, x_max]);
    yScale.domain([0, y_max]);
    svg.select(".xaxis").transition().duration(1000).call(xAxis);
    svg.select(".yaxis").transition().duration(1000).call(yAxis);

    // if (marker != '') marker.transition().style("opacity", 0);

    // Add points
    var points = svg.selectAll("g.month")
        .data(filtered_data)
        .enter()
        .append("g")
        .attr("class", "month")
        .append("circle")
        .attr("class", function(d, i) {
            return "date_" + d.month + d.year;
        })
        .attr("r", 4)
        .style("stroke", "lightgray")
        .style("fill", function(d) {
            return colors(d.year)
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    svg.selectAll("g.month").data(filtered_data).exit().remove();

    // svg.selectAll("g.month").attr("transform", point);
    if (!change) svg.selectAll("g.month").attr("transform", point);
    if (change) svg.selectAll("g.month").transition().duration(1000).attr("transform", point);

    // Add highlights
    var highlights = svg.selectAll("g.highlight")
        .data(filtered_data)
        .enter()
        .append("g")
        .attr("class", "highlight")
        .attr("transform", point)
        .append("circle")
        .attr("r", 2.5)
        .style("stroke", "lightgray")
        .style("fill", "pink")
        // .style("fill", "#26fce3")
        .style("opacity", .5);

    svg.selectAll("g.highlight").data(filtered_data).exit().remove();
    if (change) svg.selectAll("g.highlight").transition().attr("transform", point);

    var minRadius = 2,
        maxRadius = 6;

    svg.selectAll("g.highlight").selectAll('circle').call(pulse, minRadius, maxRadius);

    if(change){
        svg.selectAll(".marker").remove();
        marker = svg.append("circle")
          .style("fill", function(d) {
            return colors(button_year)
          })
          .attr("r", 5)
          .style("opacity", 1)
          .attr("class","marker")
    }

    var YrGroups = svg.selectAll(".YrGroups")
        .data(filtered_nest)
        .enter()
        .append("path")
        .attr("stroke", "#BDB76B")
        .attr("d", function(d) {
            return valueLine(d.values)
        })
        .attr("class","YrGroups")
        .style("fill", "none")
        .style("stroke-dasharray", "2,4")
        .style("stroke-width", "2px")

    svg.selectAll(".YrGroups").data(filtered_nest).exit().remove();

    if (change){
      svg.selectAll(".YrGroups")
        .attr("d", function(d) {
          return valueLine(d.values)
        })
        .filter(function(d, i) {
          return d.key === button_year;
        })
        .call(transition_c)
    }

    svg.selectAll("circle").raise();

    var YrGroups_drwn = svg.selectAll(".YrGroups_drwn")
        .data(filtered_nest)
        .enter()
        .append("path")
        .attr("stroke", function(d) {
            return colors(d.key)
        })
        .attr("d", function(d) {
            return valueLine(d.values)
        })
        .attr("class","YrGroups_drwn")
        .style("fill", "none")
        .style("opacity", 1)
        .style("stroke-width", "2.5px");

      svg.selectAll(".YrGroups_drwn").data(filtered_nest).exit().remove();

      if (change){
        svg.selectAll(".YrGroups_drwn")
          .attr("d", function(d) {
            return valueLine(d.values)
          })
          .transition()
          .duration(0)
          .attrTween("stroke-dasharray", tweenDash)


        svg.selectAll(".YrGroups_drwn")
          .filter(function(d, i) {
            return d.key === button_year;
          })
          .call(transition_p)
      }

    points.raise();

    createAnnotations(button_year)

    // set up voroni regions
    var line = d3.line().curve(d3.curveCatmullRom);

    var voronoi = d3.voronoi()
        .extent([
            [0, 0],
            [width + 20, height]
        ]);

    var pts = [];

    for (var i = 0; i < filtered_data.length; i++) {
        pts.push([xScale(filtered_data[i].volume), yScale(filtered_data[i].price)])
    }

    svg.append("g")
        .selectAll("path")
        .data(voronoi.polygons(pts)).enter().append("path")
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("opacity", 0)
        // .attr("fill", function(d,i) {return c10[i % 10]} )
        // .attr("d", function(d) { return "M" + d.join("L") + "Z" } );
        .attr("d", polygon)
        .data(filtered_data)
        .attr("class", function(d, i) {
            return "voronoi " + d.date;
        })
        .style("pointer-events", "all")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

}

function createAnnotations(button_year){
  var titles = {
    "2017":"Bitcoin Breaks Out",
    "2018":"Crypto Winter",
    "2019":"Rapid Recovery",
    "2020":"Crypto During COVID",
    "2021":"A New Scale",
    "2022":"Historic Inflation"
  }

  if (allAnnotations){
    // page load parameters
    var create = [2017,2018,2019,2020,2021,2022];
    var xShift = {
      "2017":-20,
      "2018":50,
      "2019":100,
      "2020":200,
      "2021":-30,
      "2022":-150
    }

    var yShift = {
      "2017":-50,
      "2018":-50,
      "2019":5,
      "2020":-50,
      "2021":75,
      "2022":-100
    }

    var attachMonth = {
      "2017":".date_Dec2017",
      "2018":".date_Jan2018",
      "2019":".date_Apr2019",
      "2020":".date_Oct2020",
      "2021":".date_Mar2021",
      "2022":".date_Jun2022"
    }
  }
  else {
    d3.selectAll("g.annot").remove();
    var create = [button_year];
    var xShift = {
      "2017":200,
      "2018":200,
      "2019":-100,
      "2020":-200,
      "2021":-30,
      "2022":-150
    }

    var yShift = {
      "2017":75,
      "2018":-50,
      "2019":-50,
      "2020":-50,
      "2021":75,
      "2022":-100
    }

    var attachMonth = {
      "2017":".date_Nov2017",
      "2018":".date_Dec2018",
      "2019":".date_Jun2019",
      "2020":".date_Nov2020",
      "2021":".date_Mar2021",
      "2022":".date_Jun2022"
    }
  }

  create.forEach((item, i) => {
    // var align = item=="2022" ? "right" : "left"
    const annotations = [{
        note: {
          label: item,
          title: titles[item],
          wrap: 160,
          // align: align
        },
        dx: xShift[item],
        dy: yShift[item]
      }]

      // Add annotation to the chart
      const makeAnnotations = d3.annotation()
        // .notePadding(10)
        .annotations(annotations)

      var obj = d3.select(attachMonth[item]);
      obj = obj.select(function(){return this.parentNode;})
        .append("g")
        .attr("class", 'annot')
        .call(makeAnnotations)


      obj.select(".annotation-note-title")
        // .style("font-size", "15px")
        .attr('fill', function(d) {
          return colors(d.year);
        })
  });
}
