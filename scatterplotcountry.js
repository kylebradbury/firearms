scatterplotcountry() ;

function scatterplotcountry() {
	var svg = d3.select("#scatterplotcountry")
              .append("svg")
              .attr('width', 700)
              .attr('height', 450);
	var margin = {top: 20, right: 150, bottom: 30, left: 40},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom,
		g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	/* 
	 * value accessor - returns the value to encode for a given data object.
	 * scale - maps value to a visual display encoding, such as a pixel position.
	 * map function - maps from data value to display value
	 * axis - sets up axis
	 */

	// setup x 
	var xValue = function(d) { return d.gunsper100;}, // data -> value
		xScale = d3.scaleLog().range([0, width]), // value -> display
		xMap = function(d) { return xScale(xValue(d));}, // data -> display
		xAxis = d3.axisBottom(xScale)
					.tickFormat(d3.format(",.1r"))
					.tickValues([0.4, 0.5, 1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100]) ;

	// setup y
	var yValue = function(d) { return d.homicidesper100;}, // data -> value
		yScale = d3.scaleLog().range([height, 0]), // value -> display
		yMap = function(d) { return yScale(yValue(d));}, // data -> display
		yAxis = d3.axisLeft(yScale)
				  .tickFormat(d3.format(",.1r"))
				  .tickValues([0.01, 0.02, 0.03, 0.04, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 100]);

		var xMax = 150,
			yMax = 100,
			xMin = 0.4,
			yMin = 0.005;

		xScale.domain([xMin, xMax]);
		yScale.domain([yMin, yMax]);

	// setup fill color
	var cValue = function(d) { return d.region;},
		color = d3.scaleOrdinal(d3.schemeCategory10);

	// setup point width scale
	var gdpPerCapita = function(d) { return +d.gdppercapita;},
		pointSize = d3.scaleLinear().range([Math.pow(3,2), Math.pow(30,2)]) ;
		// pointSize = d3.scaleLinear().range([Math.pow(3,2), Math.pow(15,2)]) ;

	// add the tooltip area to the webpage
	var tooltip = d3.select("body").append("div")
		.attr("class", "tooltip")
		.style("opacity", 0);

	// load data
	d3.csv("data/CompiledFirearmData20161113.csv", function(error, data) {
		// change string (from CSV) into number format
		data.forEach(function(d) {
			d.gunsper100 = +d.gunsper100;
			d.homicidesper100 = +d.homicidesper100;
		});

		// don't want dots overlapping axis, so add in buffer to data domain
		var rMin = d3.min(data, gdpPerCapita),
			rMax = d3.max(data, gdpPerCapita);

		pointSize.domain([rMin, rMax]);
		var pointMap = function(d) { return Math.sqrt(pointSize(d)/Math.PI) } ;

		// x-axis
		g.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		// x-axis label
		g.append("text")
			.attr("class", "label")
			.attr("x", xScale(xMax))
			.attr("y", yScale(yMin) )
			.attr("dy", "-.71em")
			.style("text-anchor", "end")
			.text("Number of Guns Per 100 People");

		// y-axis
		g.append("g")
			.attr("class", "y axis")
			.call(yAxis);

		// y-axis label
		g.append("text")
			.attr("class", "label")
			.attr("transform", "rotate(-90)")
			.attr("x", xScale(xMin))
			.attr("y", yScale(yMax) + 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Gun Homicides Per 100,000 People");

		// draw dots
		var points = g.selectAll(".dot")
			.data(data).enter().append("g");
		
		points.append("circle")
			.attr("class", "dot")
			.attr("r", function(d,i) {return +Math.sqrt(pointSize(gdpPerCapita(d))/Math.PI);})
			.attr("cx", xMap)
			.attr("cy", yMap)
			.style("fill", function(d) { return color(cValue(d));})
			.attr('opacity',0.75)
			.on("mouseover", function(d) {
				var name = d.country ;
				name = '#' + name.replace(/\s/g,'');

				d3.selectAll("text.country-label")
					.style("visibility","hidden");

				d3.select(name)
					.classed("selected-country",true)
					.style("visibility","visible")
					.style("fill", '#000') ;
			})
			.on("mouseout",function(d){
				var name = d.country ;
				name = '#' + name.replace(/\s/g,'');

				d3.selectAll("text.country-label")
					.style("visibility","visible") ;

				d3.selectAll(name)
					.classed("selected-country",false)
					.style("fill", "black"); //function(d) { return color(cValue(d));})
			});

		// Draw text labels
		points.append("text")
			.attr("class", "country-label")
			.attr("x", function(d){return xMap(d) + Math.sqrt(pointSize(gdpPerCapita(d))/Math.PI)/Math.sqrt(2);})
			.attr("y", function(d){return yMap(d) - Math.sqrt(pointSize(gdpPerCapita(d))/Math.PI)/Math.sqrt(2);})
			.style("text-anchor", "left")
			.style("fill", "#222") //function(d) { return color(cValue(d));})
			.text(function(d) { return d.country;})
			.attr('id', function(d) {
				var name = d.country ;
				name = name.replace(/\s/g,'');
				return name ;
			});

		// draw legend
		var legend = svg.selectAll(".legend")
			.data(color.domain())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate("
				+ 0 + "," + (height -i * 20 - margin.bottom) + ")"; });

		// draw legend colored rectangles
		legend.append("rect")
			.attr("x", width + margin.right)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		// draw legend text
		legend.append("text")
			.attr("x", width + margin.right - 4)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d;});

		// DRAW CIRCLE SIZE LEGEND
		legData = [100, 20000, 50000] ;
		startLocation = height*0.4 ;

		var legendDs = svg.append('g') ;
		var legendDots = legendDs
			.selectAll(".legendcircles")
			.data(legData)
			.enter() ;

		// Functions to position the circles and the circle text
		function dotPosition(i) {
			switch(i) {
				case 0: return startLocation + pointMap(legData[2]) - pointMap(legData[0]) ;
				case 1: return startLocation + pointMap(legData[2]) - pointMap(legData[1]) ;
				case 2: return startLocation ;
			}
		}

		function dotTextPosition(i) {
			switch(i) {
				case 0: return startLocation + pointMap(legData[2]) - 2*pointMap(legData[0]) - 4 ;
				case 1: return startLocation + pointMap(legData[2]) - 2*pointMap(legData[1]) - 4 ;
				case 2: return startLocation - pointMap(legData[2]) - 4 ;
			}
		}

		// Make the circles
		legendDots.append("circle")
			.attr('class', 'legenddot')
			.attr("r", function(d) {return pointMap(d);})
			.attr("cx", width + margin.right + 9)
			.attr("cy", function(d,i){return dotPosition(i);});

		// Make the circle labels
		legendDots.append('text')
			.attr('class', 'legenddottext')
			.attr("x", width + margin.right + 9)
			.attr("y", function(d,i){return dotTextPosition(i);})
			.attr('font-size','8px')
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.text(function(d){return d/1e3;});

		// Add the title of the circle size
		legendDs.append('text')
			.attr('class', 'legenddottext')
			.attr("x", width + margin.right + 9)
			.attr("y", startLocation + pointMap(legData[2]) + 10)
			.attr('font-size','8px')
			.style("text-anchor", "middle")
			.text('GPD per capita');

		legendDs.append('text')
			.attr('class', 'legenddottext')
			.attr("x", width + margin.right + 9)
			.attr("y", startLocation + pointMap(legData[2]) + 18)
			.attr('font-size','8px')
			.style("text-anchor", "middle")
			.text('(Thousand USD)');

	});
}