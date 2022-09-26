d3.csv("./beeColonies.csv").then(function (data) {

    console.log(data)

    // Define svg canvas
    var width = document.querySelector("#chart").clientWidth;
    var height = document.querySelector("#chart").clientHeight;
    const margin = { top: 50, left: 150, right: 50, bottom: 30 };
    

    var svg = d3.select("#chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet") // Preserve aspect ratio for resize

    // Find maximums and minimums of number of colonies for each quarter
    // Quarter 1
    const colonies1 = {
        min: d3.min(data, function (d) { return +d.jan_mar; }),
        max: d3.max(data, function (d) { return +d.jan_mar; })
    };

    // Quarter 2
    const colonies2 = {
        min: d3.min(data, function (d) { return +d.apr_jun; }),
        max: d3.max(data, function (d) { return +d.apr_jun; })
    };

    // Quarter 3
    const colonies3 = {
        min: d3.min(data, function (d) { return +d.jul_sep; }),
        max: d3.max(data, function (d) { return +d.jul_sep; })
    };

    // Quarter 4
    const colonies4 = {
        min: d3.min(data, function (d) { return +d.oct_dec; }),
        max: d3.max(data, function (d) { return +d.oct_dec; })
    };

    // xScale for x Axis to be used for each of the four charts
    var xScale = d3.scaleLinear()
        .domain([1000, 2000000])
        .range([100, width - 100]);

    // xScales for each quarter
    // Quarter 1
    var xScale1 = d3.scaleLinear()
        .domain([colonies1.min, colonies1.max])
        .range([150, width - 150]);

    // Quarter 2
    var xScale2 = d3.scaleLinear()
        .domain([colonies2.min, colonies2.max])
        .range([150, width - 150]);

    // Quarter 3
    var xScale3 = d3.scaleLinear()
        .domain([colonies3.min, colonies3.max])
        .range([150, width - 150]);

    // Quarter 4
    var xScale4 = d3.scaleLinear()
        .domain([colonies4.min, colonies4.max])
        .range([150, width - 150]);

    // Set radius of hexagons
    var radius = 16;

    // Color Scale for percent change
    const percent = {
        min: d3.min(data, function (d) { return +d["Percent Change"]; }),
        max: d3.max(data, function (d) { return +d["Percent Change"]; })
    };

    var fillScale = d3.scaleLinear()
        .domain([percent.min, percent.max])
        .range(["rgb(255, 226, 122)", "rgb(255, 200, 0)"])

    // Adding tooltip for later
    const tooltip = d3.select("#chart")
        .append("div")
        .attr("class", "tooltip");

    // Variables for tooltip position later
    let tw = svg.node().clientWidth;
    let th = svg.node().clientHeight;
    let sx = tw / width;
    let sy = th / height;

    // Adding fact div for later
    const funfact = d3.select("body")
        .append("div")
        .attr("class", "funfact")

    // Draw axis
    const xAxis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("stroke-width", 1)
        .call(d3.axisBottom().scale(xScale).ticks(7));

    /************************** BEE SWARMS *********************************/
    /***********************************************************************/

    /********QUARTER 1 BEESWARM *************/
    d3.select("#q1").on("click", function () {


        // Remove or hide any elements on the canvas from other beeswarm renderings
        svg.selectAll("image").remove();
        // Added a class to the date display in the back of chart to prevent removing 
        //all text and therefore removing axis labels
        const dates = document.querySelectorAll('.dates'); 
        dates.forEach(x => {
            x.remove();
        });

        funfact.style("visibility", "hidden");

        // Set up forces for beeswarm simulation 
        var simulation = d3.forceSimulation(data)
            .force('x', d3.forceX().x(function (d) {
                return xScale1(+d.jan_mar);
            }).strength(1))
            .force('y', d3.forceY().y(function (d) {
                return height / 2;
            }).strength(1))
            .force('collision', d3.forceCollide().radius(function (d) {
                return radius;
            }))
            .on('tick', ticked);

        // Display months behind beswarm 
        svg.append("text")
            .attr("class", "dates")
            .attr("font-size", 125)
            .attr("opacity", 0)
            .attr("font-family", "Work Sans")
            .attr("text-anchor", "center")
            .attr("font-weight", 500)
            .attr("x", width / 2 - 1200)
            .attr("y", height / 2)
            .text("Jan - Mar")
        
        // Fade in on click 
            .transition()
            .duration(800)
            .ease(d3.easeLinear)
            .attr("opacity", .05);

        // Mapping the data to data points
        // Using illustrator file of a hexagon in replace of circles
        function ticked() {
            var hex = svg
                .selectAll('image')
                .data(data)
                .join('image')
                .attr("xlink:href", "./hexagon-01.svg")
                .attr("width", 37.5)
                .attr("height", 37.5)
                .attr("opacity", .75)
                .attr('x', function (d) {
                    return d.x
                })
                .attr('y', function (d) {
                    return d.y
                })
                .attr("fill", function (d) {
                    return fillScale(+d["Percent Change"])
                })

                // Making tooltip visible on hover
                .on('mouseover', function (e, d) {
                    d3.select(this)
                        .style("opacity", 1);
                    tooltip.style("visibility", "visible")
                })

                // Adding tooltip text and fact text
                .on('mousemove', function (e, d) {

                    let displayValue = d3.format(",")(+d.jan_mar);

                    let xt = sx*(+d3.select(this).attr("x")) + 30;
                    let yt = sy*(+d3.select(this).attr("y")) - 30;

                    tooltip.style("top", `${yt}px`)
                        .style("left", `${xt}px`)
                        .html(d.state + "</br>" + displayValue); 

                })
                .on('mouseout', function () {
                    d3.select(this)
                        .style("opacity", 0.75);

                    tooltip.style("visibility", "hidden");
                })
                .on("click", function (e, d) {
                    funfact.style("visibility", "visible");
                    funfact.html(d.fact);
                })
        };



    });

    /******* QUARTER 2 BEESWARM ********/
    d3.select("#q2").on("click", function () {

        // Remove any elements on the canvas from other beeswarm renderings
        svg.selectAll("image").remove();
        const dates = document.querySelectorAll('.dates');
        dates.forEach(x => {
            x.remove();
        });

        funfact.style("visibility", "hidden");

        var simulation = d3.forceSimulation(data)
            .force('x', d3.forceX().x(function (d) {
                return xScale2(+d.apr_jun);
            }).strength(1))
            .force('y', d3.forceY().y(function (d) {
                return height / 2;
            }).strength(1))
            .force('collision', d3.forceCollide().radius(function (d) {
                return radius;
            }))
            .on('tick', ticked);

        svg.append("text")
            .attr("class", "dates")
            .attr("font-size", 125)
            .attr("opacity", 0)
            .attr("font-family", "Work Sans")
            .attr("text-anchor", "center")
            .attr("font-weight", 500)
            .attr("x", width / 2 - 1200)
            .attr("y", height / 2)
            .text("Apr - Jun")

            .transition()
            .duration(800)
            .ease(d3.easeLinear)
            .attr("opacity", .05)

        function ticked() {
            var hex = svg
                .selectAll('image')
                .data(data)
                .join('image')
                .attr("xlink:href", "./hexagon-01.svg")
                .attr("width", 37.5)
                .attr("height", 37.5)
                .attr("opacity", .75)
                .attr('x', function (d) {
                    return d.x;
                })
                .attr('y', function (d) {
                    return d.y;
                })
                .on('mouseover', function (e, d) {
                    d3.select(this)
                        .style("opacity", 1);
                    tooltip.style("visibility", "visible")
                })

                .on('mousemove', function (e, d) {

                    let displayValue = d3.format(",")(+d.apr_jun);

                    let xt = sx*(+d3.select(this).attr("x")) + 30;
                    let yt = sy*(+d3.select(this).attr("y")) - 30;

                    tooltip.style("top", `${yt}px`)
                        .style("left", `${xt}px`)
                        .html(d.state + "</br>" + displayValue); 

                })
                .on('mouseout', function () {
                    d3.select(this)
                        .style("opacity", 0.75);

                    tooltip.style("visibility", "hidden");
                })
                .on("click", function (e, d) {
                    funfact.style("visibility", "visible");
                    funfact.html(d.fact);
                })

        };

    });

    /****** QUARTER 3 BEESWARM *******/
    d3.select("#q3").on("click", function () {

        // Remove any elements on the canvas from other beeswarm renderings
        svg.selectAll("image").remove();
        const dates = document.querySelectorAll('.dates');
        dates.forEach(x => {
            x.remove();
        });

        funfact.style("visibility", "hidden");

        var simulation = d3.forceSimulation(data)
            .force('x', d3.forceX().x(function (d) {
                return xScale3(+d.jul_sep);
            }).strength(1))
            .force('y', d3.forceY().y(function (d) {
                return height / 2;
            }).strength(1))
            .force('collision', d3.forceCollide().radius(function (d) {
                return radius;
            }))
            .on('tick', ticked);

        svg.append("text")
            .attr("class", "dates")
            .attr("font-size", 125)
            .attr("opacity", 0)
            .attr("font-family", "Work Sans")
            .attr("text-anchor", "center")
            .attr("font-weight", 500)
            .attr("x", width / 2 - 1200)
            .attr("y", height / 2)
            .text("Jul - Sep")

            .transition()
            .duration(800)
            .ease(d3.easeLinear)
            .attr("opacity", .05)

        function ticked() {
            var hex = svg
                .selectAll('image')
                .data(data)
                .join('image')
                .attr("xlink:href", "./hexagon-01.svg")
                .attr("width", 37.5)
                .attr("height", 37.5)
                .attr("opacity", .75)
                .attr('x', function (d) {
                    return d.x;
                })
                .attr('y', function (d) {
                    return d.y;
                })
                .on('mouseover', function (e, d) {
                    d3.select(this)
                        .style("opacity", 1);
                    tooltip.style("visibility", "visible")
                })

                .on('mousemove', function (e, d) {

                    let displayValue = d3.format(",")(+d.jul_sep);

                    let xt = sx*(+d3.select(this).attr("x")) + 30;
                    let yt = sy*(+d3.select(this).attr("y")) - 30;

                    tooltip.style("top", `${yt}px`)
                        .style("left", `${xt}px`)
                        .html(d.state + "</br>" + displayValue); 

                })
                .on('mouseout', function () {
                    d3.select(this)
                        .style("opacity", 0.75);

                    tooltip.style("visibility", "hidden");
                })
                .on("click", function (e, d) {
                    funfact.style("visibility", "visible");
                    funfact.html(d.fact);
                })

        };

    });

    /*******QUARTER 4 BEESWARM *******/
    d3.select("#q4").on("click", function (event) {

        // Remove any elements on the canvas from other beeswarm renderings
        svg.selectAll("image").remove();

        const dates = document.querySelectorAll('.dates');
        dates.forEach(x => {
            x.remove();
        });

        const lines = document.querySelectorAll('.line');
        lines.forEach(x => {
            x.remove();
        });

        funfact.style("visibility", "hidden");

        var simulation = d3.forceSimulation(data)
            .force('x', d3.forceX().x(function (d) {
                return xScale4(+d.oct_dec);
            }).strength(1))
            .force('y', d3.forceY().y(function (d) {
                return height / 2;
            }).strength(1))
            .force('collision', d3.forceCollide().radius(function (d) {
                return radius;
            }))
            .on('tick', ticked);

        svg.append("text")
            .attr("class", "dates")
            .attr("font-size", 125)
            .attr("opacity", 0)
            .attr("font-family", "Work Sans")
            .attr("text-anchor", "center")
            .attr("font-weight", 500)
            .attr("x", width / 2 - 1200)
            .attr("y", height / 2)
            .text("Oct - Dec")

            .transition()
            .duration(800)
            .ease(d3.easeLinear)
            .attr("opacity", .05)

        function ticked() {
            var hex = svg
                .selectAll('image')
                .data(data)
                .join('image')
                .attr("xlink:href", "./hexagon-01.svg")
                .attr("width", 37.5)
                .attr("height", 37.5)
                .attr("opacity", .75)
                .attr('x', function (d) {
                    return d.x;
                })
                .attr('y', function (d) {
                    return d.y;
                })
                .on('mouseover', function (e, d) {
                    d3.select(this)
                        .style("opacity", 1);
                    tooltip.style("visibility", "visible");
                })
                .on('mousemove', function (e, d) {

                    let displayValue = d3.format(",")(+d.oct_dec);

                    let xt = sx*(+d3.select(this).attr("x")) + 30;
                    let yt = sy*(+d3.select(this).attr("y")) - 30;

                    tooltip.style("top", `${yt}px`)
                        .style("left", `${xt}px`)
                        .html(d.state + "</br>" + displayValue); 

                })
                .on('mouseout', function () {
                    d3.select(this)
                        .style("opacity", 0.75);

                    tooltip.style("visibility", "hidden");
                })
                .on("click", function (e, d) {
                    funfact.style("visibility", "visible");
                    funfact.html(d.fact);

                    // Attempt at drawing a line connecting the clicked hexagon and the fact 

                    /*let thisX = d3.select(this).attr("x", function(d) {return d.x})
                    let thisY = d3.select(this).attr("y", function(d){return d.y})

                    svg.selectAll("path")
                        .data(data)
                        .join("path")
                        .attr("class", "line")
                        .attr("stroke", "black")
                        .attr("stroke-width", 5)
                        .attr("x1", thisX)
                        .attr("x2", 3900)
                        .attr("y1", thisY)
                        .attr("y2", 900)  */
                }) 

        };

    });

    // Adding an event listener for window resize
    d3.select(window).on("resize", function(e) {

        let tw = svg.node().clientWidth;
        let th = svg.node().clientHeight;
        sx = tw / width;
        sy = th / height;

        let windowWidth = window.innerWidth;
        console.log(windowWidth);
        if(windowWidth > 1000) {

        } else {

        }
        
    });


});