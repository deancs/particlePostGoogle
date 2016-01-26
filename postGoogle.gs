var errSheetID = "*********************************************";
var logSheetID = "*********************************************";
var particleToken = "*********************************************";
var addTimeStamp = true;

//------------------------------------
// Process particle payload
//

function doPost(e) {  
  
  try {
    
    var hook_payload = JSON.parse(e.postData.contents); 
    var device_payload = JSON.parse(hook_payload.data); 
    var deviceName = getDeviceName(hook_payload.coreid);
    var ws = setWorksheet(deviceName,device_payload);    
    
    var vals = Object.keys(device_payload).map(function (key) {
      return device_payload[key];
    });

    if (addTimeStamp) {    
      var t = new Date(hook_payload.published_at);
      vals.unshift(t);
    }
    //To manually add payload to columns  
    //ws.appendRow([t, device_payload.temp, device_payload.hum]);
    
    ws.appendRow(vals);
    var rowId = ws.getLastRow(); //appendRow doesnt return row-id therefore assume this call returns the number for the row just added.    
    
  } catch(err) {
    
      doLog(err);
      return ContentService.createTextOutput('{"status":"error"}');
  }

  return ContentService.createTextOutput(Utilities.formatString('{"status":"%s","device":"%s","row":"%s"}', 'ok',deviceName,rowId));
}

//------------------------------------
//Return device name from particle.io
//

function getDeviceName(deviceId) {

  try {  
    var response = UrlFetchApp.fetch("https://api.particle.io/v1/devices/" + deviceId + "?access_token="+particleToken);
    var device = JSON.parse(response);
    return device.name;
    
  } catch(err) {
    
      doLog(err);
      return deviceId;
  }

}

//------------------------------------
//Set the current worksheet to the device-name, if it doesnt exist create it.
//

function setWorksheet(deviceName,device_payload) {
  
  try {   

    var ss = SpreadsheetApp.openById(logSheetID);
    var ws = ss.getSheetByName(deviceName);

    if (ws == null) {
      ws = ss.insertSheet(deviceName);

      //Get field names from object to use for column titles
      var myKeys = Object.keys(device_payload);
      if (addTimeStamp) {    
        myKeys.unshift("Timestamp");
      }

      ws.appendRow(myKeys);
    }

   } catch(err) {
    
      doLog(err);
  }

  return ws;
  
}

//------------------------------------
//Log to betterlog.
//

function doLog(logEntry) {

  Logger = BetterLog.useSpreadsheet(errSheetID); 
  Logger.log(logEntry);
}
  