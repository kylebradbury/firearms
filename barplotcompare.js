barplotcompare();

function barplotcompare() {
  // Create the SVG canvas
  var svg = d3.select("#barplotcompare")
              .append("svg")
              .attr("width",220)
              .attr('height', 200) ;
  var margin = {top: 20, right: 20, bottom: 20, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  // Create the x and y scales
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  // Include a border around the SVG group that is being created
  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var color = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  d3.csv("data/barData.csv", function(error, data) {

    color.domain(data.length);

    // Scale the data to sum to one for plotting
    data.forEach(function(d){d.value = +d.value;});
    dataSum = data.reduce(function(a,b){return a + b.value;},0) ;
    data.forEach(function(d){d.scaled = d.value / dataSum;}) ;

    // Create a cumulative sum of the data for plotting the bar
    data.reduce(function(a,b,i) { data[i].startSum = a ; return a + b.scaled; },0);
    data.reduce(function(a,b,i) { return data[i].endSum = a + b.scaled; },0);

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"));

    barWidth = 80 ;
    padding = 4 ;

    g.selectAll('.bars')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', padding)
      .attr('y', function(d){return d.startSum*height;})
      .attr('width', barWidth)
      .attr('height', function(d){return d.scaled*height;})
      .style('fill',function(d,i){return color(i);}) ;

    g.selectAll('.bartext')
      .data(data)
      .enter()
      .append('text')
      .attr("x", barWidth + padding + 2)
      .attr("y", function(d){return 0.5*(d.startSum + d.endSum)*height;})
      .attr('font-size','10px')
      .attr('alignment-baseline', 'middle')
      .style("text-anchor", "start")
      .text(function(d){return d.label;});
  });
}