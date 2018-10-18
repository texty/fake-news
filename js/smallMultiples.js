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

//дані з короткими url, які відкриваються по кліку на макаронину
var shortUrlData;
d3.csv("./data/data2.csv",
    function(d){
        return { site: d.site, url: d.url, nonobs: d.nonobs, short_url:d.short_url }
    })
    .then( function(dataset) {
        shortUrlData = dataset
    });

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
    var selectedData = pageData.filter(function (d) {
        return d.site === site;
    });
if(selectedData[0].instead){
    d3.select("#persons").html(selectedData[0].instead);
}
    else {
    d3.select("#persons").html(" <p><b>Було зафіксовано публікації з ознаками замовлення щодо:</b></p>");

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
                    return "<img src='img/" + imagesArray[i] + "'/><p class='personName'>" + personsArray[i] + "</p>"
                })
        }
    }
   
};




/* ------ Малюємо головну сторінку - small multiples   -------- */

//ширина графіки дорівнює ширині grid-column - 70%
var chartWidth = window.innerWidth * 0.7;
var columns;

//для маленьких екранів кількість колонок в рядку регулюється шириною екрану
if (window.innerWidth > 1500){
    columns = 10 } else { columns = Math.floor(chartWidth / 100);
}

//висота в залежності від кількості колонок в рядку
var chartHeight =  200 * (50 / columns);


//функція, що скручує макароніни *Толя
var curve_it = function(lineData){
    var  newLineData  = [lineData[0]];
    for(var i = 1; i < lineData.length; i++  ){
        var phi = getRandomArbitrary(-Math.PI/50, Math.PI/50); //випадкове число у діапазоні
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

var length = 5; // відстань між точками


//ширина та висота одного мультіпл
var width = 100;
var height = 200;
//The data for our line


// готує дані таким чином, аби вони стали path *Толя
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
        .attr("transform", function(d,i){
            var xshift = (i % columns) * width;
            var yshift = ~~(i / columns) * height + 15;
            return "translate(" + xshift + "," + yshift + ")"} );

    //визначаємо змінні, щоб по кліку на кожну макаронину виводити праворуч лінки на статті (short_url)
    var indicator;
    var media;

    var path = boxes.selectAll("path")
        .data(function(d){
            return prepare_data(d);
        })
        .enter().append("path")
        .attr("stroke", "gold")
        .attr("stroke-width", 7)
        .attr("class", "line")
        .attr("stroke-linecap", "round")
        .attr("fill", "none")
        .attr("d", function(d){
            return d[0] ? lineFunction(d)  : '';
        })
        .on("click", function(d) {
            d3.select('#selectedIndicator').html();
            //у даних для мултіплс є лише порядок по вісі х, переводимо рядок в значення індикатор
            var selectedIndicator = indicators.filter(function(obj) {
                return obj.number === d[0].x;
            });
                indicator = selectedIndicator[0].value;
        });

    /* ----- PROBLEM!
     Ідея в тому, щоб змінювати path кожні кулька секунд,
    але вони чомусь вирівнюються при анімації і реагують на скролл(скручуюються)*/
    setInterval(function() {
        path = path.data(function (d) {
            return prepare_data(d);
        });

        // Since this is created before enter.append, it only applies to updating nodes.
        path.transition()
            .duration(750)
            .attr("d", function(d){
                return d[0] ? lineFunction(d)  : '';})

    }, 200);



        //малюємо праву колонк головної сторінки
        boxes.on("click", function(d) {
            d3.select('#listOfLinks').selectAll("li").remove();


            //назву ЗМІ у відповідне поле
            $("#mediaTitle").html("<h4>"+ d.site + "</h4>");
            $("#hint").css("display", "block");
            media = d.site;

            //робимо датасет із списком коротких лінків для кожного випадку
            var mylist = shortUrlData.filter(function(k){
                return k.site == media && k.nonobs == indicator;
            });

            var urls = mylist.map(function(t){
                return t.short_url;
            });

            // якщо список не порожній, виводимо назву індикатора перед ним
            if(urls.length != 0){
                $('#selectedIndicator').html(indicator);
            } else {
                $('#selectedIndicator').html(" ");
            }

            //додаємо лінки
            for(var n=0; n < urls.length; n++) {
                d3.select('#listOfLinks')
                    .append("li")
                    .append("a")
                    .attr("href", urls[n])
                    .attr("target", "_blank")
                    .html(urls[n])
            }

        });

    //
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



//Змінюємо кількість колонок мультіплс, коли звужується вікно
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

});



