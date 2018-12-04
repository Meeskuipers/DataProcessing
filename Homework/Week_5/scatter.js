//Mees Kuipers
//11288477

//This file will show a scatter plot

var womenInScience = "http://stats.oecd.org/SDMX-JSON/data/MSTI_PUB/TH_WRXRS.FRA+DEU+KOR+NLD+PRT+GBR/all?startTime=2007&endTime=2015"
var consConf = "http://stats.oecd.org/SDMX-JSON/data/HH_DASH/FRA+DEU+KOR+NLD+PRT+GBR.COCONF.A/all?startTime=2007&endTime=2015"

var requests = [d3.json(womenInScience), d3.json(consConf)];

Promise.all(requests).then(function(response) {
    data([response[0], response[1]]);
}).catch(function(e){
    throw(e);
});

//This Function can be used by more then one file
function data(data){

    // access data property of the response
    var data_list = []
    var series_list = []
    for(i=0; i<data.length; i++){
        dataHere = data[i].dataSets[0].series;
        data_list.push(dataHere)
        series = data[i].structure.dimensions.series;
        seriesLength = series.length;
        series_list.push(series)
    }

    // set up array of variables and array of lengths
    var varArray_list = [];
    var lenArray_list = [];

    for(i=0; i<series_list.length; i++){
        var varArray = []
        var lenArray = []
        series_list[i].forEach(function(serie){
            varArray.push(serie);
            lenArray.push(serie.values.length);
        });
        varArray_list.push(varArray)
        lenArray_list.push(lenArray)
    }

    var observation_list = []
    for(i=0; i<data.length; i++){
        // get the time periods in the dataset
        var observation = data[i].structure.dimensions.observation[0];

        // add time periods to the variables, but since it's not included in the
        // 0:0:0 format it's not included in the array of lengths
        varArray_list[i].push(observation);
        observation_list.push(observation);
    }

    var strings_list = []
    for(i=0; i<data_list.length; i++){
        // create array with all possible combinations of the 0:0:0 format
        var strings = Object.keys(data_list[i]);
        strings_list.push(strings)
    }
    // set up output array, an array of objects, each containing a single datapoint
    // and the descriptors for that datapoint
    let dataArray_list = [];

    for(i=0; i<strings_list.length; i++){
        // for each string that we created
        var dataArray = []
        strings_list[i].forEach(function(string){
            // for each observation and its index
            observation_list[i].values.forEach(function(obs, index){
                let data = data_list[i][string].observations[index];
                if (data != undefined){

                    // set up temporary object
                    let tempObj = {};

                    let tempString = string.split(":").slice(0, -1);
                    tempString.forEach(function(s, indexi){
                        tempObj[varArray_list[i][indexi].name] = varArray_list[i][indexi].values[s].name;
                    });

                    // every datapoint has a time and ofcourse a datapoint
                    tempObj["time"] = obs.name;
                    tempObj["datapoint"] = data[0];
                    dataArray.push(tempObj);
                }
            });
        });
    dataArray_list.push(dataArray);
    }

    final_data = [];

    var y = 0;
    //This loop combine the files togheter
    for(x=0; x<(dataArray_list[1].length)-y; x++){
        var temp_info = {};
        //Some years were missing, this will fix that
        if(dataArray_list[0][x].time != dataArray_list[1][x+y].time){
            y = y + 1;
        }
        temp_info["time"] = dataArray_list[0][x].time;
        temp_info["Country"] = dataArray_list[1][x+y].Country;
        temp_info["datapoint_woman"] = dataArray_list[0][x].datapoint;
        temp_info["datapoint_consumer"] = dataArray_list[1][x+y].datapoint;
        final_data.push(temp_info);
    }
    scatter(final_data)
}

//Scatter will make the axis
function scatter(final_data){
    w = 1200;
    h = 600;
    padding = 40;

    x = d3.scaleLinear().domain([90, 102]).range([padding, w]);
    y = d3.scaleLinear().domain([10, 50]).range([h, padding]);

    var yAxis = d3.axisLeft()
                  .scale(y)
                  .ticks(5)
    var xAxis = d3.axisBottom()
                  .scale(x)
                  .ticks(5)

    svg = d3.select("body")
            .append("svg")
            .attr("width", w + padding)
            .attr("height", h + padding);

    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0," + h + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis)

    svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0)
          .attr("x",0 - (h / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Women researchers as a percentage of total researchers (headcount)")
          .attr("fill", "red");


    svg.append("text")
          .attr("transform",
                "translate(" + (w/2) + " ," +
                               (h + 28) + ")")
          .style("text-anchor", "middle")
          .text("Consumer confidence")
          .attr("fill", "red");

    check(final_data, svg, x, y);
}

//Check makes sure that only the checked country are going to be in the plot
function check(final_data, svg, x, y){
    console.log(final_data)
    for(i=0; i<final_data.length; i++){
        var checkBox_all = document.getElementById("Countrys");
        var checkBox_F = document.getElementById("France");
        var checkBox_N = document.getElementById("Netherlands");
        var checkBox_P = document.getElementById("Portugal");
        var checkBox_G = document.getElementById("Germany");
        var checkBox_U = document.getElementById("UK");
        var checkBox_K = document.getElementById("Korea");

        if(checkBox_all.checked == true){
            c = colour(final_data[i])
            draw(final_data[i], c, svg, x, y)
        }
        if(checkBox_F.checked == true){
            if(final_data[i].Country == "France"){
                c = "Blue"
                draw(final_data[i], c, svg, x, y)
            }
        }
        if(checkBox_N.checked == true){
            if(final_data[i].Country == "Netherlands"){
                c = "Orange"
                draw(final_data[i], c, svg, x, y)
            }
        }
        if(checkBox_P.checked == true){
            if(final_data[i].Country == "Portugal"){
                c = "Green"
                draw(final_data[i], c, svg, x, y)
            }
        }
        if(checkBox_G.checked == true){
            if(final_data[i].Country == "Germany"){
                c = "Black"
                draw(final_data[i], c, svg, x, y)
            }
        }
        if(checkBox_U.checked == true){
            if(final_data[i].Country == "United Kingdom"){
                c = "White"
                draw(final_data[i], c, svg, x, y)
            }
        }
        if(checkBox_K.checked == true){
            if(final_data[i].Country == "Korea"){
                c = "Red"
                draw(final_data[i], c, svg, x, y)
            }
        }
    }
}

//Draw the circkels one by one
function draw(data, c, svg, x, y){
  svg.append("circle")
     .attr("cx", x(data["datapoint_consumer"]))
     .attr("cy", y(data["datapoint_woman"]))
     .attr("r", 5)
     .attr("fill", c);
}

//The colour depends on the country
function colour(d){
    if(d.Country == "France"){
        c = "Blue";
    }

    else if(d.Country == "Netherlands"){
        c = "Orange";
    }

    else if(d.Country == "Portugal"){
        c = "Green";
    }

    else if(d.Country == "Germany"){
        c = "Black";
    }

    else if(d.Country == "United Kingdom"){
        c = "White";
    }

    else{
        c = "Red";
    }
    return c;
}

//If the check box are changed update will update the scatter plot
function update(final_data){
    d3.selectAll("circle").remove();
    check(final_data, svg, x, y)
}
