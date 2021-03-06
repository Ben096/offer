define([
    'postmonger'
], function (
    Postmonger
) {
    'use strict';

    var connection = new Postmonger.Session();
    var authTokens = {};
    var payload = {};


	
	var AdCode = '';

    $(window).ready(onRender);

    connection.on('initActivity', initialize);

    //running modal
    connection.on('initActivityRunningModal', initRunningModal);
    //hover modal
    connection.on('initActivityRunningHover', initRunningHover);

    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);

    connection.on('clickedNext', save);
   
    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');

        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
		console.log ('onRender function');
		
    }

    function initialize(data) {
        console.log("init==>"+JSON.stringify(data));
        if (data) {
            payload = data;
            initOperation(data);
        }
       console.log('initActivity function');
    }

    function initRunningModal(data){
        console.log("initRunningModal function==>"+JSON.stringify(data));
        if (data) {
            initOperation(data);
        }
    }

    function initRunningHover(data){
        console.log("initRunningHover function==>"+JSON.stringify(data));
        if (data) {
            initOperationForHover(data);
        }
    }



    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }
	
	var eventDefinitionKey;
	connection.trigger('requestTriggerEventDefinition');
	connection.on('requestedTriggerEventDefinition',
	function(eventDefinitionModel) {
		if(eventDefinitionModel){

			eventDefinitionKey = eventDefinitionModel.eventDefinitionKey;
			console.log(">>>Event Definition Key " + eventDefinitionKey);
			/*If you want to see all*/
			console.log('>>>Request Trigger', 
			JSON.stringify(eventDefinitionModel));
		}

	});
	
	var entrySchema;
	connection.trigger('requestSchema');
	connection.on('requestedSchema', function (data) {
	   // save schema, retrieve field attributes
	   console.log('*** Schema ***', JSON.stringify(data['schema']));
	   entrySchema = data['schema'];
	});

    //trigger JB, and retrieve its information
    connection.trigger('requestInteraction');
    connection.on('requestedInteraction', function(interaction) {
        console.log("interaction==>"+JSON.stringify(interaction));
    });

	String.prototype.replaceAll = function (FindText, RepText) {
		var regExp = new RegExp(FindText, "g");
		return this.replace(regExp, RepText);
	}
 
    function save() {
        console.log('customActivity Save function');
        var postcardURLValue = $('#postcard-url').val();
        var postcardTextValue = $('#postcard-text').val();

        //retrieve the input field value
        var AdC = $('#AdCode').val();
        var AdStartDate = $('#AdStartDate').val();
        var LocationGroup = $('#LocationGroup').val();
        var AdPosition = $('#AdPosition').val();
        var RankedValue = $('#RankedValue').val();
        //check required field
        if(AdPosition==""){
            $("#AdPositionInfo").addClass("show");
            $("#AdPositionInfo").removeClass("hide");
            $("#AdPosition").addClass("inputStyle");
            return;
        }
        if(AdC==""){
            $("#adCodeInfo").addClass("show");
            $("#adCodeInfo").removeClass("hide");
            $("#AdCode").addClass("inputStyle");
            return;
        }
         
        //CA UI Input value
        payload['arguments'].execute.inArguments.push({"ADCode": AdC });

        // if(AdStartDate==''){
        //     console.log('set startDate to today');
        //     var today = new Date();
        //     AdStartDate = dateFormat(today);
        // }

        payload['arguments'].execute.inArguments.push({"startDate": AdStartDate });



        var AdEndDate = $('#AdEndDate').val();
        var duration = $('#Duration').val();
        
        payload['arguments'].execute.inArguments.push({"Duration": duration });

        // if(duration != ''){
        //     console.log("se enddate with duration");
        //     var startDate = new Date(AdStartDate);
        //     var i = parseInt(duration);
        //     console.log("i==>"+i);
        //     var endDate = +startDate + 1000*60*60*24*i;
        //     console.log("duration enddate==>"+new Date(endDate));
        //     AdEndDate = dateFormat(new Date(endDate));
        // }
        // else if(AdEndDate==''){
        //     console.log('set endDate to today');
        //     var today = new Date();
        //     AdEndDate = dateFormat(today);
        // }

        payload['arguments'].execute.inArguments.push({"endDate": AdEndDate });

        
        
        payload['arguments'].execute.inArguments.push({"LocationGroup": LocationGroup });
    
  
        payload['arguments'].execute.inArguments.push({"AdPosition": AdPosition });
    
        payload['arguments'].execute.inArguments.push({"RankedValue": RankedValue });
        
		
		//
		//payload['arguments'].execute.inArguments.push({"DEName": "{{Event." + eventDefinitionKey+".name}}" });



		for(var i = 0; i < entrySchema.length; i++) {
			var fld = entrySchema[i];
			console.log('cx debug fld', JSON.stringify(fld));
			var fieldval = JSON.stringify(fld.key).replaceAll('"','');
			var fieldname = fieldval.split('.')[2];
			console.log('cx debug fieldname ', fieldname);
			console.log('cx debug fieldval ', fieldval);
            if("LoyaltyID"==fieldname){
                payload['arguments'].execute.inArguments.push({"LoyaltyID": "{{Event." + eventDefinitionKey+".LoyaltyID}}" });
            }
			//payload['arguments'].execute.inArguments.push({[fieldname]: "{{" + fieldval+"}}" });
 		}
        

        payload['metaData'].isConfigured = true;

        console.log('payload=='+JSON.stringify(payload));
        console.log('payload attribute=='+payload['arguments'].execute.inArguments);
        connection.trigger('updateActivity', payload);
    }

    function dateFormat(date){
        var y = date.getFullYear();
        var m = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
        var d = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
        var h = date.getHours() < 10 ? ('0' + date.getHours()) : date.getHours();
        var f = date.getMinutes() < 10 ? ('0' + date.getMinutes()) : date.getMinutes();
        var formatdate = y+'-'+m+'-'+d + "T" + h + ":" + f;
        console.log("formdate===>"+formatdate);
        return formatdate;
    }

    function initOperation(payLoadTemp){

        var hasInArguments = Boolean(
            payLoadTemp['arguments'] &&
            payLoadTemp['arguments'].execute &&
            payLoadTemp['arguments'].execute.inArguments &&
            payLoadTemp['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payLoadTemp['arguments'].execute.inArguments : {};

        var map = {};
        map.ADCode = '';
        map.duration='';
        map.endDate = '';
        map.startDate = '';
        map.LocationGroup = '';
        map.AdPosition = '';
        map.RankedValue = '';
        //init UI data form
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                console.log("customActivity key==>"+key);
                console.log("customActivity val==>"+val);
                if(key=='startDate'){
                    map.startDate = val;
                }
                else if(key=='endDate'){
                    map.endDate = val;
                }
                else if(key=='ADCode'){
                    map.ADCode = val;
                }
                else if(key=='Duration'){
                    map.duration = val;
                }
                else if(key=='LocationGroup'){
                    map.LocationGroup = val;
                }
                else if(key=='AdPosition'){
                    map.AdPosition = val;
                }
                else if(key=='RankedValue'){
                    map.RankedValue = val;
                }
            });
        });

        //init 
        $('#AdCode').val(map.ADCode);
        $('#Duration').val(map.duration);
        $('#AdEndDate').val(map.endDate);
        $('#AdStartDate').val(map.startDate);
        $('#LocationGroup').val(map.LocationGroup);
        $('#AdPosition').val(map.AdPosition);
        $('#RankedValue').val(map.RankedValue);
    }

    function initOperationForHover(payLoadTemp){

        var hasInArguments = Boolean(
            payLoadTemp['arguments'] &&
            payLoadTemp['arguments'].execute &&
            payLoadTemp['arguments'].execute.inArguments &&
            payLoadTemp['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payLoadTemp['arguments'].execute.inArguments : {};

        var map = {};
        map.ADCode = '';
        map.duration='';
        map.endDate = '';
        map.startDate = '';
        map.LocationGroup = '';
        map.AdPosition = '';
        map.RankedValue = '';
        //init UI data form
        $.each(inArguments, function (index, inArgument) {
            $.each(inArgument, function (key, val) {
                console.log("customActivity key==>"+key);
                console.log("customActivity val==>"+val);
                if(key=='startDate'){
                    map.startDate = val;
                }
                else if(key=='endDate'){
                    map.endDate = val;
                }
                else if(key=='ADCode'){
                    map.ADCode = val;
                }
                else if(key=='Duration'){
                    map.duration = val;
                }
                else if(key=='LocationGroup'){
                    map.LocationGroup = val;
                }
                else if(key=='AdPosition'){
                    map.AdPosition = val;
                }
                else if(key=='RankedValue'){
                    map.RankedValue = val;
                }
            });
        });

        //init 
        var startDate = map.startDate;
        var endDate = map.endDate;
        $('#AdCode').text(map.ADCode);
        $('#Duration').text(map.duration);
        $('#AdEndDate').text(endDate.replace("T"," "));
        $('#AdStartDate').text(startDate.replace("T"," "));
        $('#LocationGroup').text(map.LocationGroup);
        $('#AdPosition').text(map.AdPosition);
        $('#RankedValue').text(map.RankedValue);
    }



});