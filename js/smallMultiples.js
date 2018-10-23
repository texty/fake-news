/**
 * Created by yevheniia on 16.10.18.
 */


//тектовий набір даних, аби перевести порядковий номер макаронини на графіку в критерій оцінки
var indicators = [
    {"number":1, "value":"Фейк"},
    {"number":2, "value":"Мова ворожнечі"},
    {"number":3, "value":"Маніпуляції з емоціями"},
    {"number":4, "value":"Недостовірна новина"},
    {"number":5, "value":"Маніпулятивний заголовок"},
    {"number":6, "value":"Ненадійне джерело інформації"}
];


var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

//дані з короткими url, які відкриваються по кліку на макаронину
var shortUrlData;
d3.csv("./data/fixedUrlData.csv",
// d3.csv("./data/data2.csv",
    function(d){
        return { site: d.site, url: d.url, nonobs: d.nonobs }
    })
    .then( function(dataset) {
        shortUrlData = dataset
    });



//додаємо усі лінки в кінці тексту мобільної версії
var addLinksMob = function (site) {
    var mobUrls = shortUrlData.filter(function(k){
        return k.site == site;
    });

    var nested_data = d3.nest()
        .key(function(d) { return d.nonobs; })
        .entries(mobUrls);

    $("#mob-urlLinks").find("ul").remove();
    $("#mob-urlLinks").find("p").remove();

    for(var i = 0; i < nested_data.length; i++){
        d3.select('#mob-urlLinks')
            .append("p")
            .html(nested_data[i].key);

        var list = d3.select('#mob-urlLinks')
            .append("ul")
            .style("margin-bottom", "30px");

        for(var n = 0; n < nested_data[i].values.length; n++){
            var s = n + 1;
           list.append("li")
                .append('a')
                .attr("href", nested_data[i].values[n].url)
                .attr("target", "_blank")
                .html(s);
        }

    }

};


//дані для сторінки конкретного змі
var pageData;
d3.csv("./data/data.csv", function(d){
    return { site: d.site.toLowerCase(),
        name: d.name,
        lead: d.lead,
        instead: d.instead,
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



var a, b, c, d, e, f; //змінні для макаронин на сторінці конкретного ЗМІ


//ця функція малює сторінку, фільтруючи дані по кліку на назву ЗМІ
var drawPage = function (site) {

    $('#main-page').css("display", "none");
    var selectedData = pageData.filter(function (d) {
        return d.site === site;
    });
if(selectedData[0].instead){
    d3.select("#persons").html(selectedData[0].instead);
}
    else {
    d3.select("#persons").html(" <p style='margin-bottom:30px;'><b>Було зафіксовано публікації з ознаками замовлення щодо:</b></p>");

}
    

    //задаємо значення для змінних, щоб намалювати макаронини на сторінці ЗМІ
    a = +selectedData[0].uncertainSource;
    b = +selectedData[0].nonReliableNews;
    c = +selectedData[0].manipulativeHeading;
    d = +selectedData[0].manipulationsWithEmotions;
    e = +selectedData[0].hateSpeech;
    f = +selectedData[0].fakes;

    //додаємо текст на сторінку ЗМІ - назву, лід і опис
    d3.select('#name > h1').html(function () {
        return selectedData[0].name
    });
    d3.select('#lead').html(function () {
        return selectedData[0].lead
    });
    d3.select('#descript').html(function () {
        return selectedData[0].content
    });


    //додаємо барчарти у лід
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

    //додаємо персоналії і їх фото
    //1.сплітимо колонки з іменами персоналій і фото по комі
    var comma = ',';
    var personsArray = selectedData[0].persons.split(comma);
    var imagesArray = selectedData[0].images.split(comma);
    var len = personsArray.length;

    //якщо персоналії були, додаємо їх у відповідний div
    if(personsArray[0].length > 2) {
        for (var i = 0; i < len; i++) {
            d3.select("#persons")
                .append("div")
                .html(function () {
                    return "<img src='img/" + imagesArray[i] + "'/><p class='personName others'>" + personsArray[i] + "</p>"
                })
        }
    }
   
};




/* ------ Малюємо головну сторінку - small multiples   -------- */

//ширина графіки дорівнює ширині grid-column - 70%
var chartWidth;
if (screen.width < 800){
    chartWidth = screen.width * 0.95;
} else if (window.innerWidth > 2000){
    chartWidth = 1200;
}
else {
    chartWidth = window.innerWidth - 340;
}


//для маленьких екранів кількість колонок в рядку регулюється шириною екрану
var columns;
if (window.innerWidth > 1500){
    columns = 10 } else { columns = Math.floor(chartWidth / 115);
}

//висота в залежності від кількості колонок в рядку
var chartHeight =  200 * (50 / columns);


//функція, що скручує макароніни *Толя
var curve_it = function(lineData){
    var  newLineData  = [lineData[0]];
    for(var i = 1; i < lineData.length; i++  ){
        // var phi = getRandomArbitrary(-Math.PI/150, Math.PI/150); //випадкове число у діапазоні
        var phi = getRandomArbitrary(-Math.PI/35, Math.PI/35);
        var prev_point = lineData[i-1];
        newLineData[i] = { //зсуваємо у бік від попердньої точки???
            x: prev_point.x + length * Math.sin(phi), y: prev_point.y + length*Math.cos(phi)
        }
    }
    return newLineData;
};


// random number in any interval [min, max] *Толя
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

var length = 1; // відстань між точками


//ширина та висота одного мультіпл
var width = 115;
var height = 200;
//The data for our line


// готує дані таким чином, аби вони стали path *Толя
// var prepare_data = function(d){
//     var data = d.points.map(function(d, i){
//         var lineData = d3.range(1, d, 2)
//             .map(function(d){
//                 return {x:(i+1), y:d}
//             });
//         return curve_it(lineData);
//
//
//     });
//     return data;
// };

var prepare_data = function(d) {
    var data = d.points.map(function (d, i) {
        var lineData = d3.range(0, d)
            .map(function (d) {
                return {x: (i + 1), y: d}
            });
        return curve_it(lineData);
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
    .y(function(d) { return yScale(d.y); });
    // .curve(d3.curveCatmullRom.alpha(1));



//The SVG Container
var svgContainer = d3.select("#small-multiples").insert("svg", ".donors")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .attr("id", "sm-svg");


// Main work is here
var main =  function (data){
    data.reverse(); // bad sites first

    var media;


    var boxes = svgContainer.selectAll("g.smallmult")
        .data(data)
        .enter().append("g")
        .attr("class", "smallmult")
        .attr("transform", function(d,i){
            var xshift = (i % columns) * width;
            var yshift = ~~(i / columns) * height + 15;
            return "translate(" + xshift + "," + yshift + ")"} )

        .on("click", function(d) {
            console.log(this);
            media = d.site;
            drawPage(media);
            drawNoodle(media);
            div.transition()
                .duration(500)
                .style("display", "none");

            if(window.innerWidth < 800) {
                d3.select("#modal").style("display", "block");
                addLinksMob(media);
                d3.select("#firstScreen").style("display", "none");
                d3.select("#main-page").style("display", "none");
                $('html,body').animate({
                    scrollTop: $('#modal').offset().top }, 1, "linear");
            } else {
                d3.select("#modal").style("display", "grid");
                $('html,body').animate({
                    scrollTop: $('#modal').offset().top }, 1, "linear");
        }
    });

    //визначаємо змінні, щоб по кліку на кожну макаронину виводити праворуч лінки на статті (short_url)


    var path = boxes.selectAll("path")
        .data(function(d){
            return prepare_data(d);
        })
        .enter().append("path")
        .attr("stroke", "gold")
        .attr("stroke-width", 6)
        .attr("class", "line")
        .attr("stroke-linecap", "round")
        .attr("fill", "none")
        .attr("d", function(d){
            return d[0] ? lineFunction(d)  : '';
        })
        .on("mouseover", function(d) {
        //     // d3.select('#selectedIndicator').html();
        //     //у даних для мултіплс є лише порядок по вісі х, переводимо рядок в значення індикатор
            var selectedIndicator = indicators.filter(function(obj) {
                return obj.number === d[0].x;
            });
                var indicator = selectedIndicator[0].value;

            div.transition()
                .duration(200)
                .style("display", "block")
                .style("opacity", .9);
            div.html(indicator.toLowerCase())
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    /* ----- PROBLEM!
     Ідея в тому, щоб змінювати path кожні кулька секунд,
    але вони чомусь вирівнюються при анімації і реагують на скролл(скручуюються)*/
    // setInterval(function() {
    //     path = path.data(function (d) {
    //         return prepare_data(d);
    //     });
    //
    //     // Since this is created before enter.append, it only applies to updating nodes.
    //     path.transition()
    //         .duration(750)
    //         .attr("d", function(d){
    //             return d[0] ? lineFunction(d)  : '';})
    //
    // }, 200);



        //малюємо праву колонк головної сторінки


    //
    boxes
        .append("text")
        .attr("x", width/3)
        .attr("y", -15)
        .attr("dy", ".9em")
        .attr("text-anchor", "start")
        .attr("font-size", "0.7em")
        .attr("font-family", "Arial")
        // .attr("fill", "black")
        .attr("cursor", "pointer")
        .html(function(d, i) {
            var n = i + 1;
            return  "<tspan style='fill:gold'>" + n + ") </tspan> " + d.site});
};



d3.csv("./data/ranking_by_sum.csv",
    function(d){ return { site: d.site, position: d.Rank,
        points: [+d.total_fake, +d.hate_speech, +d.emotions,
            +d.fake, +d.title ,+d.nonreliable ]}
    })
    .then( function(data) {
        main(data);
    });



//Змінюємо кількість колонок мультіплс, коли звужується вікно
window.addEventListener("resize", function() {
    var chartWidth;
    if (screen.width < 800){
        chartWidth = screen.width * 0.95;
    } else {
        chartWidth = window.innerWidth - 340;
    }


    var columns;
    if (window.innerWidth > 1500){
        columns = 10 } else { columns = Math.floor(chartWidth / 115);
    }
    var chartHeight =  200 * (50 / columns);

    var svgContainer = d3.select("svg#sm-svg");
    svgContainer
        .attr("width", chartWidth)
        .attr("height", chartHeight);

    svgContainer.selectAll("g.smallmult")
        .attr("transform", function(d,i){
            var xshift = (i % columns) * width;
            var yshift = ~~(i / columns) * height + 15;
            return "translate(" + xshift + "," + yshift + ")"} );
    if (jQuery('#modal').css('display') !== ('none')){
        if(window.innerWidth > 800) {
            $('#modal').css("display", "grid")
        }
        if(window.innerWidth < 800 || screen.width < 800) {
            $('#modal').css("display", "block")
        }
    }
});


//По кліку на назву ЗМІ відвриваємо сторінку конкретного ЗМІ
$("#mediaTitle").on("click", function(){
    var siteName = $(this).text();
    d3.select("#modal").style("display", "grid");
    drawPage(siteName);
    drawNoodle(siteName);
});


/* По кліку на &times закриваємо її*/
$('#cross').on("click", function(){
    d3.select("#modal").style("display", "none");
    $('#main-page').css("display", "grid");
    $('#selectedIndicator').html("");
    $('#listOfLinks').html("");
    $('html,body').animate({
        scrollTop: $('#main-page').offset().top }, 1, "linear");
});

$('#mob-return').on("click", function(){
    d3.select("#modal").style("display", "none");
    $('#main-page').css("display", "block");
    $('html,body').animate({
        scrollTop: $('#main-page').offset().top }, 1, "linear");
});





