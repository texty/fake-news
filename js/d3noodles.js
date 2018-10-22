/**
 * Created by yevheniia on 17.10.18.
 */
drawNoodle = function(site) {
    $('#pageChart').find('svg').remove();
    var chartWidth;
    if(screen.width < 380) {
        chartWidth = screen.width
    } else {
        chartWidth = 380
    }
    var chartHeight;
    if (window.innerWidth < 800) {
        chartHeight = window.innerHeight / 2;
    } else {
        chartHeight = window.innerHeight * 0.8;
    }

    var curve_it2 = function (lineData) {
        var newLineData = [lineData[0]];
        for (var i = 1; i < lineData.length; i++) {
            var phi = getRandomArbitrary(-Math.PI / 150, Math.PI / 150);
            var prev_point = lineData[i - 1];
            newLineData[i] = {x: prev_point.x + length * Math.sin(phi), y: prev_point.y + length * Math.cos(phi)}
        }
        return newLineData;
    };


// random number in any interval [min, max]
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    var length = 10; //

//The data for our line

    var prepare_pageData = function (d) {
        var data = d[0].points.map(function (d, i) {
            var lineData = d3.range(1, d, 2)
                .map(function (d) {
                    return {x: (i + 1), y: d}
                });
            return curve_it2(lineData);


        });
        return data;
    };


    var xScale = d3.scaleLinear()
        .domain([0, 7]) // input
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
// .curve(d3.curveCatmullRom.alpha(1));


//The SVG Container
var svg = d3.select("#pageChart").insert("svg", "#selectedIndicator")
            .attr("width", chartWidth)
            .attr("height", chartHeight);


// Main work is here
    var mainChart =  function (data) {
        var pageData = data.filter(function(d) {
            return d.site === site;
        }); // bad sites first

        var box = svg.selectAll("g")
            .data(pageData)
            .enter().append("g")
            // .attr("id", "bigchart")
            .attr("width", chartWidth)
            .attr("height", chartHeight);


        var pagePath = box.selectAll("path")
            .data(function () {
                return prepare_pageData(pageData);
            })
            .enter().append("path")
            .attr("stroke", "gold")
            .attr("stroke-width", 12)
            .attr("class", "line")
            .attr("stroke-linecap", "round")
            .attr("fill", "none")
            .attr("d", function (d) {
                return d[0] ? lineFunction(d) : '';
            })
            .on("click", function(d) {
                if(window.innerWidth >= 800) {
                    d3.select('#selectedIndicator').html('');
                    d3.select('#listOfLinks').html('');
                    //у даних для мултіплс є лише порядок по вісі х, переводимо рядок в значення індикатор
                    var selectedIndicator = indicators.filter(function (obj) {
                        return obj.number === d[0].x;
                    });
                    var indicator = selectedIndicator[0].value;

                    //робимо датасет із списком коротких лінків для кожного випадку
                    var myList = shortUrlData.filter(function (k) {
                        return k.site == site && k.nonobs == indicator;
                    });

                    var urls = myList.map(function (t) {
                        return t.short_url;
                    });

                    // якщо список не порожній, виводимо назву індикатора перед ним
                    if (urls.length != 0) {
                        $('#selectedIndicator').html(indicator + "<br>(приклади новин)");
                    } else {
                        $('#selectedIndicator').html(" ");
                    }

                    //додаємо лінки
                    for (var n = 0; n < urls.length; n++) {
                        d3.select('#listOfLinks')
                            .append("li")
                            .append("a")
                            .attr("href", urls[n])
                            .attr("target", "_blank")
                            .html(n)
                    }
                }
            });

        setInterval(function() {
            pagePath = pagePath.data(function () {
                return prepare_pageData(pageData);
            });

            // Since this is created before enter.append, it only applies to updating nodes.
            pagePath.transition()
                .duration(750)
                .attr("d", function(d){
                    return d[0] ? lineFunction(d)  : '';})

        }, 200);
        
        
        
    };

    d3.csv("./data/ranking_by_sum.csv",
        function(d){ return { site: d.site, position: d.Rank,
            points: [+d.total_fake, +d.hate_speech, +d.emotions,
                +d.fake, +d.title ,+d.nonreliable ]}
        })
        .then( function(data) {
            mainChart(data);
        });



    };




