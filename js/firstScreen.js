/**
 * Created by yevheniia on 19.10.18.
 */
var curve_it3 = function (FSlineData) {
    var FSnewLineData = [FSlineData[0]];
    for (var i = 1; i < FSlineData.length; i++) {
        var phi = getRandomArbitrary(-Math.PI / 30, Math.PI / 30);
        var prev_point = FSlineData[i - 1];
        FSnewLineData[i] = {x: prev_point.x + FSlength * Math.sin(phi), y: prev_point.y + FSlength * Math.cos(phi)}
    }
    return FSnewLineData;
};


// random number in any interval [min, max]
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var FSlength = 5; //
var FSheight = window.innerHeight;

var FSwidth;
if (window.innerWidth > 2000){
    FSwidth = 900;
}
else if (screen.width < 800){
    FSwidth = screen.width;
}
else {
    FSwidth = 600;
}


var prepare_pointsData = function (d) {
    var ddd = d.map(function (d, i) {
        var FSlineData = d3.range(1, d, 2)
            .map(function (d) {
                return {x: (i + 1), y: d}
            });
        return curve_it3(FSlineData);


    });
    return ddd;
};

var FSxScale = d3.scaleLinear()
    .domain([0, 35]) // input
    .range([0, FSwidth]); // output

var FSyScale = d3.scaleLinear()
    .domain([0, 50]) // input
    .range([0, FSheight]); // output

var FSlineFunction = d3.line()
    .x(function (d) {
        return FSxScale(d.x);
    })
    .y(function (d) {
        return FSyScale(d.y);
    });


var firstScreenSVG = d3.select("#firstScreen").append("svg")
    .attr("width", FSwidth )
    .attr("height", FSheight)
    .style("margin-left", function() {
        if (window.innerWidth > 2000) {
            return (window.innerWidth - 900) / 2
        } else if (screen.width < 800){
            return 0;
        } else {
            return (window.innerWidth - 600) / 2
        }
    });

var FSchart =  function (FSpoints) {


    var FSbox = firstScreenSVG.append("g")
        .attr("width", FSwidth - 100)
        .attr("height", FSheight);


    var noodlesPath = FSbox.selectAll("path")
        .data(function () {
            return prepare_pointsData(FSpoints);
        })
        .enter().append("path")
        .attr("stroke", "gold")
        .attr("stroke-width", function (d) {
            if(screen.width < 800){
                return 6
            }
            else {
                return  12
            }

        })
        .attr("stroke-linecap", "round")
        .attr("fill", "none")
        .attr("d", function (d) {
            return d[0] ? FSlineFunction(d) : '';
        });

    setInterval(function() {
        noodlesPath = noodlesPath.data(function () {
            return prepare_pointsData(FSpoints);
        });

        // Since this is created before enter.append, it only applies to updating nodes.
        noodlesPath.transition()
            .duration(750)
            .attr("d", function(d){
                return d[0] ? FSlineFunction(d)  : '';})

    }, 200);


    window.addEventListener("resize", function(){
        var FSheight;
        var FSwidth;

        if (window.innerWidth > 2000){
            FSwidth = 900;
            FSheight = window.innerHeight;
        }
        else if (screen.width < 800){
            FSwidth = screen.width;
            FSheight = screen.height;
        }
        else {
            FSwidth = 600;
            FSheight = window.innerHeight;
        }
        var FSxScale = d3.scaleLinear()
            .domain([0, 35]) // input
            .range([0, FSwidth]); // output


        var FSyScale = d3.scaleLinear()
            .domain([0, 50]) // input
            .range([0, FSheight]); // output

        var FSlineFunction = d3.line()
            .x(function (d) {
                return FSxScale(d.x);
            })
            .y(function (d) {
                return FSyScale(d.y);
            });


        firstScreenSVG
            .attr("width", FSwidth )
            .attr("height", FSheight)
            .style("margin-left", function() {
                if (window.innerWidth > 2000) {
                    return (window.innerWidth - 900) / 2
                } else if (screen.width < 800){
                    return 0;
                } else {
                    return (window.innerWidth - 600) / 2
                }
            });

        noodlesPath
            .attr("d", function (d) {
            return d[0] ? FSlineFunction(d) : '';
        })
            .attr("stroke-width", function () {
                if(screen.width < 800){ return 6  }
                else { return  12 }

            })

    })
};



    var FSpoints = [4,25,0,6,15,8,7,4,19,24,32,34,40,35,13,38,44,16,40,35,13,7,5, 27,30,26,15,4,18,5,8,4,0,5];

    // var FSpoints = randomDataSet(40, 5, 24);
    FSchart(FSpoints);

// function randomDataSet(dataSetSize, minValue, maxValue) {
//     return new Array(dataSetSize).fill(0).map(function(n) {
//         return Math.round(Math.random() * (maxValue - minValue) + minValue);
//     });
// }
