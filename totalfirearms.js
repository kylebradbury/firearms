totalfirearms();

function totalfirearms() {
  // Create the SVG canvas
  var svg = d3.select("#worldpercapita")
              .append("svg")
              .attr("width",700)
              .attr('height', 400) ;
  var margin = {top: 20, right: 20, bottom: 150, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom;

  // Create the x and y scales
  var x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
      y = d3.scaleLinear().rangeRound([height, 0]);

  // Include a border around the SVG group that is being created
  var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Load the data
  d3.csv("firearmsbycountry.csv", function(d) {
    d.country   = d.country;
    d.percapita = +d.percapita;
    d.region    = d.region;
    return d;
  }, function(error, data) {
    if (error) throw error;

    x.domain(data.map(function(d) { return d.country; }));
    y.domain([0, d3.max(data, function(d) { return d.percapita; })]);

    // Add x-axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("dy", "-0.6em")
        .attr("dx", "-1em")
        .attr("text-anchor", "end")
        .attr("transform", function(d) {
                  return "rotate(-90)" ;
        });

    // Add y-axis
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).ticks(10))
        .attr("transform", "translate(" + height/10 + ",0)") ;

    // now add titles to the axes
    g.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("transform", "translate("+ (margin.left/2 - width/20) +","+(height/2)+")rotate(-90)")
        .text("Civilian guns per 100 people");

    // Add bars to plots
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.country); })
        .attr("y", function(d) { return y(d.percapita); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.percapita); });
  });
}