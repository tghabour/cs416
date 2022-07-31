function polygon(d) {
  return "M" + d.join("L") + "Z";
}

// move marker for year
function transition_c(current_path) {
  marker.transition()
    .duration(1000)
    .style("opacity", 1)
    .duration(7500)
    .attrTween("transform", translateAlong(current_path.node()))
    .transition()
    .duration(1000)
    .style("opacity", 0);
}

function translateAlong(path) {
  var l = path.getTotalLength();
  return function(d, i, a) {
    return function(t) {
      var p = path.getPointAtLength(t * l);
      return "translate(" + p.x + "," + p.y + ")";
    };
  };
}

// draw line for year
function transition_p(path) {
  path.transition()
    .duration(7500)
    .style("stroke-width", "2.5px")
    .attrTween("stroke-dasharray", tweenDash);
}

function tweenDash() {
  var l = this.getTotalLength(),
    i = d3.interpolateString("0," + l, l + "," + l);
  return function(t) {
    return i(t);
  };
}

function pulse(element, start, end) {
  element.transition()
    .duration(2000)
    .attr("r", end)
    // transitions can add listeners to the start and end states!!!
    .on("end", function() {
      d3.select(this).call(pulse, end, start);
    });
}
