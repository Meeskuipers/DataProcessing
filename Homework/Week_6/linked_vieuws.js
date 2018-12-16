var geo = "population.json"
var bmi = "output2016.tsv"

main("NLD")

function main(country){
  var request1 = [d3.json(geo)];
  var request2 = [d3.tsv(bmi)];
  var requests = [request1, request2];
  var dataset = [];

  Promise.all(requests).then(function(response) {
      main1(response, country, dataset);
  }).catch(function(e){
      throw(e);
  });
}

function main1(datas, country, dataset){
    globe(datas);
    graph(country, dataset);
}

function graph(country, dataset){
    var countries = "world_countries.json"
    var c = [d3.json(countries)]

    c[0].then(function(data){
        for (i=1975; i<2017; i++){
          var d = {};
          d["y"] = data[i][country]
          dataset.push(d)
        }
        make_graph(dataset, country)
    });
}

function make_graph(data, country){
  var margin = {top: 50, right: 80, bottom: 50, left: 50}
, width = window.innerWidth - margin.left - margin.right // Use the window's width
, height = window.innerHeight - margin.top - margin.bottom; // Use the window's height

// The number of datapoints
var n = 42;

// 5. X scale will use the index of our data
var xScale = d3.scaleLinear()
  .domain([0+1975, n-1+1975]) // input
  .range([0, width]); // output

// 6. Y scale will use the randomly generate number
var yScale = d3.scaleLinear()
  .domain([18, 36]) // input
  .range([height, 0]); // output

// 7. d3's line generator
var line = d3.line()
  .x(function(d, i) { return xScale(i + 1975); }) // set the x values for the line generator
  .y(function(d) { return yScale(d.y); }) // set the y values for the line generator
  .curve(d3.curveMonotoneX) // apply smoothing to the line

// 8. An array of objects of length N. Each object has key -> value pair, the key being "y" and the value is a random number
// var dataset = d3.range(n).map(function(d) { return {"y": d3.randomUniform(1)() } })
// console.log(dataset)
var dataset = data
// console.log(huh)

// 1. Add the SVG to the page and employ #2
var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 3. Call the x axis in a group tag
svg.append("g")
  .attr("class", "x-axis")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottom

svg.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + 30) + ")")
      .style("text-anchor", "middle")
      .text("Years")
      .attr("fill", "white");

// 4. Call the y axis in a group tag
svg.append("g")
  .attr("class", "y-axis")
  .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", - 45)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Average BMI")
      .attr("fill", "white");

svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text("BMI over the years of " + country)
        .attr("fill", "white");

// 9. Append the path, bind the data, and call the line generator
svg.append("path")
  .datum(dataset) // 10. Binds data to the line
  .attr("class", "line") // Assign a class for styling
  .attr("d", line); // 11. Calls the line generator

// var formatTime = d3.time.format("%e %B");
var tooltip = d3.select("body")
  .append("div")
  .attr('class', 'tooltip');
// 12. Appends a circle for each datapoint
svg.selectAll(".dot")
  .data(dataset)
.enter().append("circle") // Uses the enter().append() method
  .attr("class", "dot") // Assign a class for styling
  .attr("cx", function(d, i) { return xScale(i + 1975) })
  .attr("cy", function(d) { return yScale(d.y) })
  .attr("r", 5)
  //   .on("mouseover", function(a, b, c) {
  //     console.log(a, b)
  // })
  //   .on("mouseout", function() {  })
    .on("mouseover", function(a, b, c) {
      console.log(a)
      return tooltip.style("visibility", "visible").text('BMI of year ' + (b + 1975) + " is " + a["y"].toFixed(2));
    })
    .on("mousemove", function() {
        return tooltip.style("top", (event.pageY - 30) + "px")
          .style("left", event.pageX + "px");
      })
    // we hide our tooltip on "mouseout"
    .on("mouseout", function() {
      return tooltip.style("visibility", "hidden");
    });
}

function globe(datas){
  /**
   * d3.tip
   * Copyright (c) 2013 Justin Palmer
   *
   * Tooltips for d3.js SVG visualizations
   */
  // eslint-disable-next-line no-extra-semi
  ;(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
      // AMD. Register as an anonymous module with d3 as a dependency.
      define([
        'd3-collection',
        'd3-selection'
      ], factory)
    } else if (typeof module === 'object' && module.exports) {
      /* eslint-disable global-require */
      // CommonJS
      var d3Collection = require('d3-collection'),
          d3Selection = require('d3-selection')
      module.exports = factory(d3Collection, d3Selection)
      /* eslint-enable global-require */
    } else {
      // Browser global.
      var d3 = root.d3
      // eslint-disable-next-line no-param-reassign
      root.d3.tip = factory(d3, d3)
    }
  }(this, function(d3Collection, d3Selection) {
    // Public - contructs a new tooltip
    //
    // Returns a tip
    return function() {
      var direction = d3TipDirection,
          offset    = d3TipOffset,
          html      = d3TipHTML,
          node      = initNode(),
          svg       = null,
          point     = null,
          target    = null

      function tip(vis) {
        svg = getSVGNode(vis)
        if (!svg) return
        point = svg.createSVGPoint()
        document.body.appendChild(node)
      }

      // Public - show the tooltip on the screen
      //
      // Returns a tip
      tip.show = function() {
        var args = Array.prototype.slice.call(arguments)
        if (args[args.length - 1] instanceof SVGElement) target = args.pop()

        var content = html.apply(this, args),
            poffset = offset.apply(this, args),
            dir     = direction.apply(this, args),
            nodel   = getNodeEl(),
            i       = directions.length,
            coords,
            scrollTop  = document.documentElement.scrollTop ||
              document.body.scrollTop,
            scrollLeft = document.documentElement.scrollLeft ||
              document.body.scrollLeft

        nodel.html(content)
          .style('opacity', 1).style('pointer-events', 'all')

        while (i--) nodel.classed(directions[i], false)
        coords = directionCallbacks.get(dir).apply(this)
        nodel.classed(dir, true)
          .style('top', (coords.top + poffset[0]) + scrollTop + 'px')
          .style('left', (coords.left + poffset[1]) + scrollLeft + 'px')

        return tip
      }

      // Public - hide the tooltip
      //
      // Returns a tip
      tip.hide = function() {
        var nodel = getNodeEl()
        nodel.style('opacity', 0).style('pointer-events', 'none')
        return tip
      }

      // Public: Proxy attr calls to the d3 tip container.
      // Sets or gets attribute value.
      //
      // n - name of the attribute
      // v - value of the attribute
      //
      // Returns tip or attribute value
      // eslint-disable-next-line no-unused-vars
      tip.attr = function(n, v) {
        if (arguments.length < 2 && typeof n === 'string') {
          return getNodeEl().attr(n)
        }

        var args =  Array.prototype.slice.call(arguments)
        d3Selection.selection.prototype.attr.apply(getNodeEl(), args)
        return tip
      }

      // Public: Proxy style calls to the d3 tip container.
      // Sets or gets a style value.
      //
      // n - name of the property
      // v - value of the property
      //
      // Returns tip or style property value
      // eslint-disable-next-line no-unused-vars
      tip.style = function(n, v) {
        if (arguments.length < 2 && typeof n === 'string') {
          return getNodeEl().style(n)
        }

        var args = Array.prototype.slice.call(arguments)
        d3Selection.selection.prototype.style.apply(getNodeEl(), args)
        return tip
      }

      // Public: Set or get the direction of the tooltip
      //
      // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
      //     sw(southwest), ne(northeast) or se(southeast)
      //
      // Returns tip or direction
      tip.direction = function(v) {
        if (!arguments.length) return direction
        direction = v == null ? v : functor(v)

        return tip
      }

      // Public: Sets or gets the offset of the tip
      //
      // v - Array of [x, y] offset
      //
      // Returns offset or
      tip.offset = function(v) {
        if (!arguments.length) return offset
        offset = v == null ? v : functor(v)

        return tip
      }

      // Public: sets or gets the html value of the tooltip
      //
      // v - String value of the tip
      //
      // Returns html value or tip
      tip.html = function(v) {
        if (!arguments.length) return html
        html = v == null ? v : functor(v)

        return tip
      }

      // Public: destroys the tooltip and removes it from the DOM
      //
      // Returns a tip
      tip.destroy = function() {
        if (node) {
          getNodeEl().remove()
          node = null
        }
        return tip
      }

      function d3TipDirection() { return 'n' }
      function d3TipOffset() { return [0, 0] }
      function d3TipHTML() { return ' ' }

      var directionCallbacks = d3Collection.map({
            n:  directionNorth,
            s:  directionSouth,
            e:  directionEast,
            w:  directionWest,
            nw: directionNorthWest,
            ne: directionNorthEast,
            sw: directionSouthWest,
            se: directionSouthEast
          }),
          directions = directionCallbacks.keys()

      function directionNorth() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.n.y - node.offsetHeight,
          left: bbox.n.x - node.offsetWidth / 2
        }
      }

      function directionSouth() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.s.y,
          left: bbox.s.x - node.offsetWidth / 2
        }
      }

      function directionEast() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.e.y - node.offsetHeight / 2,
          left: bbox.e.x
        }
      }

      function directionWest() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.w.y - node.offsetHeight / 2,
          left: bbox.w.x - node.offsetWidth
        }
      }

      function directionNorthWest() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.nw.y - node.offsetHeight,
          left: bbox.nw.x - node.offsetWidth
        }
      }

      function directionNorthEast() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.ne.y - node.offsetHeight,
          left: bbox.ne.x
        }
      }

      function directionSouthWest() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.sw.y,
          left: bbox.sw.x - node.offsetWidth
        }
      }

      function directionSouthEast() {
        var bbox = getScreenBBox()
        return {
          top:  bbox.se.y,
          left: bbox.se.x
        }
      }

      function initNode() {
        var div = d3Selection.select(document.createElement('div'))
        div
          .style('position', 'absolute')
          .style('top', 0)
          .style('opacity', 0)
          .style('pointer-events', 'none')
          .style('box-sizing', 'border-box')

        return div.node()
      }

      function getSVGNode(element) {
        var svgNode = element.node()
        if (!svgNode) return null
        if (svgNode.tagName.toLowerCase() === 'svg') return svgNode
        return svgNode.ownerSVGElement
      }

      function getNodeEl() {
        if (node == null) {
          node = initNode()
          // re-add node to DOM
          document.body.appendChild(node)
        }
        return d3Selection.select(node)
      }

      // Private - gets the screen coordinates of a shape
      //
      // Given a shape on the screen, will return an SVGPoint for the directions
      // n(north), s(south), e(east), w(west), ne(northeast), se(southeast),
      // nw(northwest), sw(southwest).
      //
      //    +-+-+
      //    |   |
      //    +   +
      //    |   |
      //    +-+-+
      //
      // Returns an Object {n, s, e, w, nw, sw, ne, se}
      function getScreenBBox() {
        var targetel   = target || d3Selection.event.target

        while (targetel.getScreenCTM == null && targetel.parentNode == null) {
          targetel = targetel.parentNode
        }

        var bbox       = {},
            matrix     = targetel.getScreenCTM(),
            tbbox      = targetel.getBBox(),
            width      = tbbox.width,
            height     = tbbox.height,
            x          = tbbox.x,
            y          = tbbox.y

        point.x = x
        point.y = y
        bbox.nw = point.matrixTransform(matrix)
        point.x += width
        bbox.ne = point.matrixTransform(matrix)
        point.y += height
        bbox.se = point.matrixTransform(matrix)
        point.x -= width
        bbox.sw = point.matrixTransform(matrix)
        point.y -= height / 2
        bbox.w = point.matrixTransform(matrix)
        point.x += width
        bbox.e = point.matrixTransform(matrix)
        point.x -= width / 2
        point.y -= height / 2
        bbox.n = point.matrixTransform(matrix)
        point.y += height
        bbox.s = point.matrixTransform(matrix)

        return bbox
      }

      // Private - replace D3JS 3.X d3.functor() function
      function functor(v) {
        return typeof v === 'function' ? v : function() {
          return v
        }
      }

      return tip
    }
  // eslint-disable-next-line semi
  }));
  var format = d3.format(",");

  // Set tooltips
  var tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>BMI: </strong><span class='details'>" + format(d.bmi) +"</span>";
              })

  var margin = {top: -330, right: -300, bottom: 0, left: 0},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

  var colorScale = d3.scaleLinear()
                     .domain([17, 34])
                     .range([255, 200]);

   var colorScale1 = d3.scaleLinear()
                      .domain([17, 34])
                      .range([255, 100]);

  var colorScale2 = d3.scaleLinear()
                     .domain([17, 34])
                     .range([100, 50]);

  var path = d3.geoPath();

  var svg = d3.select("body")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
              .append('g')
              .attr('class', 'map');

  var projection = d3.geoMercator()
                     .scale(190)
                    .translate( [width / 2, height / 1.5]);

  var path = d3.geoPath().projection(projection);

  svg.call(tip);
  datas[0][0].then(function(data){
      datas[1][0].then(function(bmi){
        var bmiByID = {};
        bmi.forEach(function(d) { bmiByID[d.id] = +d.bmi; });
        data.features.forEach(function(d) { d.bmi = bmiByID[d.id] });
        svg.append("g")
            .attr("class", "countries")
          .selectAll("path")
            .data(data.features)
          .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) {
              return ("rgb("+colorScale(d.bmi)+"," + colorScale1(d.bmi) + ", " + colorScale2(d.bmi) + ")")
            })
            // .style("fill", function(d) { return color(bmiByID[d.id]); })
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity",0.8)
            // tooltips
              .style("stroke","white")
              .style('stroke-width', 0.3)
              .on('mouseover',function(d){
                tip.show(d);

                d3.select(this)
                  .style("opacity", 1)
                  .style("stroke","white")
                  .style("stroke-width",3);
              })
              .on('mouseout', function(d){
                tip.hide(d);

                d3.select(this)
                  .style("opacity", 0.8)
                  .style("stroke","white")
                  .style("stroke-width",0.3);
              })
              .on('click', function(d){
                  // d3.select("body").select("svg").remove()
                  d3.selectAll("svg").remove();
                  d3.select(".d3-tip").remove();
                  main(d.id)
              });

        svg.append("path")
            .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
             // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
            .attr("class", "names")
            .attr("d", path);
      })
  })
}
