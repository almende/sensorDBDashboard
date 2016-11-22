/**
 * Created by ludo on 22-11-16.
 */


//Select user URL (query param!)
//Get graphs for each sensorId

function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var agent = getParameterByName("agent");
var agentUrl = "";
if (agent && typeof agent === "string") {
  if (agent.startsWith("http")) {
    agentUrl = agent;
  } else {
    agentUrl = "http://localhost:8888/agents/" + agent;
  }
}

//Get dataset from agentUrl
var options = { "legend":true, "defaultGroup":"Sensor Value"};
var request = {"json-rpc": "2.0", "id": 1, "method": "getGraphData", "params": {}};
$.ajax({
  "url": agentUrl,
  "method": "POST",
  "data": JSON.stringify(request)
}).done(function (data) {
  var i = 0;
  for (sensor in data.result) {
    if (data.result.hasOwnProperty(sensor)) {
      var dataset = data.result[sensor].values;
      if (dataset.length > 0) {
        i++;
        var graph = $('#graph' + i);
        graph.html("<h3>Sensor:" + sensor + "</h3>");
        var dataset = new vis.DataSet(dataset);
        var dataview = new vis.DataView(dataset, {
          fields: {'timestamp': 'x', 'value': 'y', 'group':'group'},
          type: {'timestamp': 'Date', 'value': 'Number'},
          order: 'timestamp'
        });
        if (data.result[sensor].groups){
          data.result[sensor].groups.map(function(item){
             var list = item.values.map(function(val){
               val["group"]=item.name;
               return val;
             });
            dataset.add(list);
          });
        }
        new vis.Graph2d(graph.get(0), dataview, options);
      }
    }
  }

});
