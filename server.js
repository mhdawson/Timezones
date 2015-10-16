var http = require('http');
var fs = require('fs');
var url = require('url');

// read in the configuration data
var certsDir = '';
var serverPort = 3000;
var mqttServerUrl = '';
var options = '';
var dashBoardEntriesHTML = '';
var topicsArray = [];
var title = '';
var height = 0;
var entriesData = 'var entriesData = new Object();\n';

function readDefaultConfig(configFile) {
   var data = fs.readFileSync(configFile);
   setConfig(data);
}

function setConfig(data) {
   options = '';
   dashBoardEntriesHTML = '';
   topicsArray = [];
   height = 0;
   entriesData = 'var entriesData = new Object();\n';

   var lines = data.toString().split('\n');
   for (line in lines) {
      var configParts = lines[line].split('=');
      if (1 < configParts.length) {
         var configKey = configParts[0];
         var configValue = configParts[1];
         if ('serverPort' == configKey) {
            serverPort = configValue;
         } else if ('title' == configKey) {
           title = configValue;
         } else if ('dashboardEntries' == configKey) {
            dashboardEntries = configValue;
            var entriesArray = configValue.split(",");
            for(nextEntry in entriesArray) {
              var parts = entriesArray[nextEntry].split(":");
              topicsArray.push(parts[1]);
              dashBoardEntriesHTML = dashBoardEntriesHTML + '<tr><td>' + parts[0] +
                                                        ':</td><td id="' + parts[0] +
                                                        '">pending</td></tr>';

             entriesData = entriesData + "         entriesData['" + parts[0] + "'] = " + parts[1] + ";\n";
             height = height + 25;
            }
         }
      }
   }
}


// setup the websocket/server enpoint
var server = http.createServer(function(request,response) {
   var entries = '';
   var mainPage = fs.readFileSync('page.html').toString();
   var dashboardEntries = url.parse(request.url).query;
   readDefaultConfig(process.argv[2]);
   if (dashboardEntries != undefined) {
      dashboardEntries = dashboardEntries.replace("windowopen=y&","").replace("windowopen=y","");
      if (dashboardEntries!= "") {
         setConfig("dashboardEntries=" + dashboardEntries);
         entries = "&" + dashboardEntries;
      }
   }

   mainPage = mainPage.replace('<DASHBOARD TITLE>', title);
   mainPage = mainPage.replace('<UNIQUE_WINDOW_ID>', title);
   mainPage = mainPage.replace('<DASHBOARD_ENTRIES>', dashBoardEntriesHTML);
   mainPage = mainPage.replace('<ENTRIES_DATA>', entriesData);
   mainPage = mainPage.replace('<HEIGHT>', height);
   mainPage = mainPage.replace('<ENTRIES>', entries);

   response.writeHead(200, {'Content-Type': 'text/html'});
   response.end(mainPage);
});

server.listen(serverPort,function(){
});;

