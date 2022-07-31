function changeNarrative(element){
  if (element.name != '2016') allAnnotations = false;
  else {
    d3.select("g.annot").remove();
    allAnnotations = true;
  }

  if (element.classList.contains('active') && element.name != '2016'){
    change = true;
    buildElements(element.name);
    return;
  }

  // find active year
  var active = document.getElementsByClassName("active")[0];
  hideYear(active);
  showYear(element.name);
}

function nextNarrative(element){
  allAnnotations = false;
  // find active year
  var active = document.getElementsByClassName("active")[0];
  hideYear(active);
  year = Number(active.name);

  if (year == 2022) {
    showSummary();
  } else {
    year += 1;
    year = year.toString();
    showYear(year);
  }
}

function hideYear(active){
    // hide active div
    document.getElementsByClassName(active.name)[0].style.display = "none";
    document.getElementsByClassName(`${active.name} footer`)[0].style.display = "none";
    // mark year inactive
    active.classList.remove("active");
    active.classList.add("inactive");
}

function showYear(year){
  // mark new year active
  document.getElementsByName(year)[0].classList.add("active");
  // show new div
  document.getElementsByClassName(year)[0].style.display = "block";
  document.getElementsByClassName(`${year} footer`)[0].style.display = "block";
  change = true;
  year = year == '2016' ? '2022' : year;
  buildElements(year);
}

function showSummary(){
  document.getElementsByClassName("summary")[1].style.display = "block";
  document.getElementsByClassName("2016 footer")[0].style.display = "block";
  document.getElementsByName("2016")[0].classList.add("active");
  marker.transition().duration(0).style("opacity", 0);
  svg.selectAll(".YrGroups_drwn")
    .transition()
    .duration(0)
    .attrTween("stroke-dasharray", tweenDash)
  allAnnotations = true;
  createAnnotations('2022');
}
