/**
 * Created by yevheniia on 16.10.18.
 */
var drawNoodle;
var onFrame;

//тектовий набір даних, аби перевести порядковий номер макаронини на графіку в критерій оцінки
var indicators = [
    {"number":1, "value":"Фейк"},
    {"number":2, "value":"Мова ворожнечі"},
    {"number":3, "value":"Маніпуляції з емоціями"},
    {"number":4, "value":"Недостовірна новина"},
    {"number":5, "value":"Маніпулятивний заголовок"},
    {"number":6, "value":"Ненадійне джерело інформації"}
];


var fuckingdata;
d3.csv("./data/data2.csv",
    function(d){
        return { site: d.site, url: d.url, nonobs: d.nonobs, short_url:d.short_url }
    })
    .then( function(dataset) {
        fuckingdata = dataset
    });


var pageData;
d3.csv("./data/data.csv", function(d){
    return { site: d.site.toLowerCase(),
        name: d.name,
        lead: d.lead,
        highQaulityNews: d.highQaulityNews,
        uncertainSource:d.uncertainSource,
        nonReliableNews: d.nonReliableNews,
        manipulativeHeading: d.manipulativeHeading,
        manipulationsWithEmotions:d.manipulationsWithEmotions,
        hateSpeech: d.hateSpeech,
        fakes: d.fakes,
        content: d.content,
        persons: d.persons,
        images: d.images
    }
})
    .then(function (thePage) {
    pageData = thePage
});

var a, b, c, d, e, f;

var drawPage = function (site) {
    d3.select("#persons").html(" <p>Було зафіксовано публікації з ознаками замовлення щодо:</p>");
    var selectedData = pageData.filter(function (d) {
        return d.site === site;
    });
    a = +selectedData[0].uncertainSource + 1;
    b = +selectedData[0].nonReliableNews + 1;
    c = +selectedData[0].manipulativeHeading + 1;
    d = +selectedData[0].manipulationsWithEmotions + 1;
    e = +selectedData[0].hateSpeech + 1;
    f = +selectedData[0].fakes + 1;


    d3.select('#name > h1').html(function () {
        return selectedData[0].name
    });
    d3.select('#lead').html(function () {
        return selectedData[0].lead
    });
    d3.select('#descript').html(function () {
        return selectedData[0].content
    });



    $('span#highQaulityNews').css("width", function () {
        return +selectedData[0].highQaulityNews
    });
    $('span#uncertainSource').css("width", function () {
        return +selectedData[0].uncertainSource
    });
    $('span#nonReliableNews').css("width", function () {
        return +selectedData[0].nonReliableNews
    });
    $('span#manipulativeHeading').css("width", function () {
        return +selectedData[0].manipulativeHeading
    });
    $('span#manipulationsWithEmotions').css("width", function () {
        return +selectedData[0].manipulationsWithEmotions
    });
    $('span#hateSpeech').css("width", function () {
        return +selectedData[0].hateSpeech
    });
    $('span#fakes').css("width", function () {
        return +selectedData[0].fakes
    });

    var comma = ',';

    var personsArray = selectedData[0].persons.split(comma);

    var imagesArray = selectedData[0].images.split(comma);
    var len = personsArray.length;

    if(personsArray[0].length > 2) {
        for (var i = 0; i < len; i++) {
            d3.select("#persons")
                .append("div")
                .html(function () {
                    return "<img src='img/" + imagesArray[i] + "'/><p class='personName'>" + personsArray[i] + "</p>"
                })
        }
    }
};




/* ------ Small multiples   -------- */

var chartWidth = window.innerWidth * 0.7;
var columns;

if (window.innerWidth > 1500){
    columns = 10 } else { columns = Math.floor(chartWidth / 100);

}


var chartHeight =  200 * (50 / columns);

var curve_it = function(lineData){
    var  newLineData  = [lineData[0]];
    for(var i = 1; i < lineData.length; i++  ){
        var phi = getRandomArbitrary(-Math.PI/100, Math.PI/100);
        var prev_point = lineData[i-1];
        newLineData[i] = { x: prev_point.x + length * Math.sin(phi), y: prev_point.y + length*Math.cos(phi) }
    }
    return newLineData;
};

var curve_it2 = function(lineData){
    var  newLineData  = [lineData[0]];
    for(var i = 1; i < lineData.length; i++  ){
        var phi = getRandomArbitrary(-Math.PI/100, Math.PI/100);
        var prev_point = lineData[i-1];
        newLineData[i] = { x: prev_point.x + length * Math.sin(phi), y: prev_point.y + length*Math.cos(phi) }
    }
    return newLineData;
};




// random number in any interval [min, max]
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
var length = 5; //
var width = 100;
var height = 200;
//The data for our line

var prepare_data = function(d){
    var data = d.points.map(function(d, i){
        var lineData = d3.range(1, d, 2)
            .map(function(d){
                return {x:(i+1), y:d}
            });
        return curve_it(lineData);


    });
    return data;
};


var prepare_data2 = function(d){
    var data = d.points.map(function(d, i){
        var lineData = d3.range(1, d, 2)
            .map(function(d){
                return {x:(i+1), y:d}
            });
        return curve_it2(lineData);


    });
    return data;
};

var xScale = d3.scaleLinear()
    .domain([0, 7]) // input
    .range([0, width]); // output
var yScale = d3.scaleLinear()
    .domain([0, 50]) // input
    .range([0, height]); // output

var lineFunction = d3.line()
    .x(function(d) { return xScale(d.x); })
    .y(function(d) { return yScale(d.y); })
    .curve(d3.curveCatmullRom.alpha(0.5));



//The SVG Container
var svgContainer = d3.select("#small-multiples").append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight);






// Main work is here
var main =  function (data){
    data.reverse(); // bad sites first

    var boxes = svgContainer.selectAll("g.smallmult")
        .data(data)
        .enter().append("g")
        .attr("class", "smallmult")
        //.attr("width", width)
        //.attr("height", height)
        .attr("transform", function(d,i){
            var xshift = (i % columns) * width;
            var yshift = ~~(i / columns) * height + 15;
            return "translate(" + xshift + "," + yshift + ")"} );




    var indicator;
    var media;

    var path = boxes.selectAll("path")
        .data(function(d){return prepare_data(d);})
        .enter().append("path")
        .attr("stroke", "gold")
        .attr("stroke-width", 7)
        .attr("class", "line")
        .attr("stroke-linecap", "round")
        .attr("fill", "none")
        .attr("d", function(d){ return d[0] ? lineFunction(d)  : '';})
        .on("click", function(d) {
            // console.log(d[0].x);
            var selectedIndicator = indicators.filter(function(obj) {
                return obj.number === d[0].x;
            });
                indicator = selectedIndicator[0].value;
        });


    setInterval(function() {
        path = path.data(function (d) {
            return prepare_data2(d);
        });

        // Since this is created before enter.append, it only applies to updating nodes.
        path.transition()
            .duration(750)
            .attr("d", function(d){ return d[0] ? lineFunction(d)  : '';})

    }, 200);

        boxes.on("click", function(d) {
            d3.select('#listOfLinks').selectAll("li").remove();
            console.log(d.site);
            $("#mediaTitle").html("<h4>"+ d.site + "</h4>");

            media = d.site;
            var mylist = fuckingdata.filter(function(k){
                return k.site == media && k.nonobs == indicator;
            });
            var urls = mylist.map(function(t){
                return t.short_url;
            });

            if(urls.length != 0){
                $('#selectedIndicator').html(indicator);
            }
            for(var n=0; n < urls.length; n++) {
                d3.select('#listOfLinks')
                    .append("li")
                    .append("a")
                    .attr("href", urls[n])
                    .attr("target", "_blank")
                    .html(urls[n])
            }

        });


    boxes
        .append("text")
        .attr("x", width/3)
        .attr("y", -15)
        .attr("dy", ".9em")
        .attr("text-anchor", "start")
        .attr("font-size", "0.7em")
        .attr("font-family", "Arial")
        .attr("fill", "gray")
        .text(function(d) {
            // console.log(d);
            return d.site});
};



d3.csv("./data/ranking_by_sum.csv",
    function(d){ return { site: d.site, position: d.Rank,
        points: [+d.total_fake, +d.hate_speech, +d.emotions,
            +d.fake, +d.title ,+d.nonreliable ]}
    })
    .then( function(data) {
        main(data);
    });


window.addEventListener("resize", function() {
    var chartWidth = window.innerWidth * 0.7;
    var columns;

    if (window.innerWidth > 1500){
        columns = 10 } else { columns = Math.floor(chartWidth / 100);
    }



    var chartHeight =  200 * (50 / columns);

    var svgContainer = d3.select("svg");
    svgContainer
        .attr("width", chartWidth)
        .attr("height", chartHeight);

    svgContainer.selectAll("g.smallmult")
        .attr("transform", function(d,i){
            var xshift = (i % columns) * width;
            var yshift = ~~(i / columns) * height + 15;
            return "translate(" + xshift + "," + yshift + ")"} );
});

$("#mediaTitle").on("click", function(){
    var siteName = $(this).text();
    d3.select("#modal").style("display", "grid");
    drawPage(siteName);
    drawNoodle();
});

$('#cross').on("click", function(){
    d3.select("#modal").style("display", "none");

});



