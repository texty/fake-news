/**
 * Created by yevheniia on 19.10.18.
 */
var curve_it2 = function (lineData) {
    var newLineData = [lineData[0]];
    for (var i = 1; i < lineData.length; i++) {
        var phi = getRandomArbitrary(-Math.PI / 30, Math.PI / 30);
        var prev_point = lineData[i - 1];
        newLineData[i] = {x: prev_point.x + length * Math.sin(phi), y: prev_point.y + length * Math.cos(phi)}
    }
    return newLineData;
};


// random number in any interval [min, max]
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var length = 4; //

var prepare_pointsData = function (d) {
    var ddd = d.map(function (d, i) {
        var lineData = d3.range(1, d, 2)
            .map(function (d) {
                return {x: (i + 1), y: d}
            });
        return curve_it2(lineData);


    });
    return ddd;
};

var xScale = d3.scaleLinear()
    .domain([0, 45]) // input
    .range([0, chartWidth]); // output

var yScale = d3.scaleLinear()
    .domain([0, 50]) // input
    .range([0, chartHeight]); // output

var lineFunction = d3.line()
    .x(function (d) {
        return xScale(d.x);
    })
    .y(function (d) {
        return yScale(d.y);
    });

var fSHeight = window.innerHeight;

var firstScreenSVG = d3.select("#firstScreen").append("svg")
    .attr("width", chartWidth )
    .attr("height", fSHeight);

var mainChart =  function (points) {


    var box = firstScreenSVG
        .append("g")
        .attr("width", chartWidth - 100)
        .attr("height", fSHeight);


    var noodlesPath = box.selectAll("path")
        .data(function () {
            return prepare_pointsData(points);
        })
        .enter().append("path")
        .attr("stroke", "gold")
        .attr("stroke-width", 12)
        .attr("class", "line")
        .attr("stroke-linecap", "round")
        .attr("fill", "none")
        .attr("d", function (d) {
            return d[0] ? lineFunction(d) : '';
        });

    setInterval(function() {
        noodlesPath = noodlesPath.data(function () {
            return prepare_pointsData(points);
        });

        // Since this is created before enter.append, it only applies to updating nodes.
        noodlesPath.transition()
            .duration(750)
            .attr("d", function(d){
                return d[0] ? lineFunction(d)  : '';})

    }, 200);
};



   // var points =  [2,11,4,8,14,13,18,3,9,10,7,20,25,19,10,4,0,16,10,18,6  ];
    var points = randomDataSet(40, 5, 24);
    mainChart(points);

function randomDataSet(dataSetSize, minValue, maxValue) {
    return new Array(dataSetSize).fill(0).map(function(n) {
        return Math.round(Math.random() * (maxValue - minValue) + minValue);
    });
}
