({
    getReport : function(component, event, helper) {
        //hide report and show spinner while we process
        //debugger;
        var loadingSpinner = component.find('loading');
        $A.util.removeClass(loadingSpinner, 'slds-hide');
        var reportContainer = component.find('report');
        $A.util.addClass(reportContainer, 'slds-hide');
        var reportError = component.find('report-error');
        $A.util.addClass(reportError, 'slds-hide');
        
        
        // alert('13');
        //get report data from Apex controller using report ID provided
        var action = component.get('c.getReportMetadata');
        action.setParams({ 
            reportId: component.get("v.reportIdAttribute"),
            includeDetailAttribute: component.get("v.includeDetailAttribute"),
            startDate : component.get("v.start"),
            endDate : component.get("v.end")
        });
        
        //handle response from Apex controller
        action.setCallback(this, function(response){
            // transform into JSON object
            var returnValue = JSON.parse(response.getReturnValue());
            var groupingLabels = {};
            
            if( returnValue && returnValue.reportExtendedMetadata ){
                // categorize groupings into levels so we can access them as we go down grouping level
                var columnInfo = returnValue.reportExtendedMetadata.groupingColumnInfo;
                for( var property in columnInfo ){
                    if( columnInfo.hasOwnProperty(property) ){
                        var level = columnInfo[property].groupingLevel;
                        var label = columnInfo[property].label;
                        groupingLabels[level] = label;
                    }
                }
                // set lightning attributes so we have access to variables in the view
                component.set("v.groupingLevelToLabel", groupingLabels)
                component.set("v.reportData", returnValue);
                component.set("v.factMap", returnValue.factMap);
                
                var includeDetailAttribute = component.get('v.includeDetailAttribute');
                if (includeDetailAttribute) {
                    // get all aggregated columns, 
                    var aggColumns = [];
                    var aggColumnsLabel = [];
                    var tableHeaders = [];
                    var isRowCountExists = false;
                    
                    for( var i = 0; i < returnValue.reportMetadata.aggregates.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.aggregates[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.aggregateColumnInfo[fieldAPIName].label;
                        
                        if (fieldAPIName == 'RowCount') {
                            isRowCountExists = true;
                        }
                        
                        // only capture the one starting with !
                        // coz there are patterns like s!, m!, mx!, a!,
                        var pos1 = fieldAPIName.indexOf('!');
                        aggColumns.push(fieldAPIName.substring(pos1+1));
                        aggColumnsLabel.push (fieldLabel);
                        
                    }
                    
                    //get column headers, this assumes that they are returned in order
                    var aggColumnsPos = [];
                    
                    for( var i = 0; i < returnValue.reportMetadata.detailColumns.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.detailColumns[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.detailColumnInfo[fieldAPIName].label;
                        var aggColumnsLabel1 = [];
                        
                        for (var j=0; j< aggColumns.length; j++) {
                            if (aggColumns[j] == '') {
                                continue;
                            }
                            
                            if (fieldAPIName == aggColumns[j]) {
                                // 1. push the aggregagte column name, take the first word before space (Sum, Min, Max, Avg)
                                // 2. set aggregate column api name to blank
                                // note that there may be multiple match due to the patterns will be stored in aggColumnsLabel1
                                var theLabel = aggColumnsLabel[j];
                                var pos1 = theLabel.indexOf(' ');
                                if (pos1 > 0) {
                                    theLabel = theLabel.substring(0, pos1);
                                }
                                aggColumnsLabel1.push(theLabel);
                                aggColumns[j] = '';
                            }
                        }
                        
                        aggColumnsPos.push(aggColumnsLabel1);
                        tableHeaders.push(fieldLabel);
                    }
                    
                    if (isRowCountExists) {
                        // add the rowcount column if there is such thing
                        tableHeaders.push('Record Count');
                        var aggColumnsLabel2 = [];
                        aggColumnsLabel2.push('Sum');
                        aggColumnsPos.push(aggColumnsLabel2);
                    }
                    
                    component.set("v.columnLabels", tableHeaders);
                    component.set("v.aggColumnsPosition", aggColumnsPos);
                } else {
                    // these are aggregated column value
                    var tableHeaders = [];
                    var aggColumnsPos = [];
                    for( var i = 0; i < returnValue.reportMetadata.aggregates.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.aggregates[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.aggregateColumnInfo[fieldAPIName].label;
                        tableHeaders.push(fieldLabel);
                        aggColumnsPos.push(i);
                    }
                    component.set("v.columnLabels", tableHeaders);
                    component.set("v.aggColumnsPosition", aggColumnsPos);
                }
                
                //hide spinner, reveal data
                $A.util.addClass(loadingSpinner, 'slds-hide');
                $A.util.removeClass(reportContainer, 'slds-hide');
            }
            else {
                $A.util.addClass(loadingSpinner, 'slds-hide');
                $A.util.removeClass(reportError, 'slds-hide');
            }
        })
        $A.enqueueAction(action);
    },
    
    getMonth : function (component, event, helper){
        component.set("v.noDataInFilterMonth",false);
        var loadingSpinner = component.find('loading');
        // console.log('loadingSpinner :: '+loadingSpinner)
        $A.util.removeClass(loadingSpinner, 'slds-hide');
        var reportContainer = component.find('report');
        $A.util.addClass(reportContainer, 'slds-hide');
        var reportError = component.find('report-error');
        $A.util.addClass(reportError, 'slds-hide');
        var monthval = event.target.value;
       // console.log('monthval' + monthval)
       // console.log('botton name ::'+event.target.name);
        var month = new Date().getMonth() + 1;
       // console.log("month :: ", month);
        var year = new Date().getFullYear();
       // console.log("year :: ", year);
        var day = new Date().getDate();
        var currentStart;
        if(month.toString() == '9'){
            currentStart =  year.toString()+'-'+ '0'+month.toString()+'-'+ day.toString(); 
        }else{
            currentStart =  year.toString()+'-'+month.toString()+'-'+ day.toString();  
        }
      //  console.log('currentStart :: '+currentStart)
      //  console.log("day :: ", day);
        if(event.target.name == 'current'){
       //     console.log('monthval :: '+monthval)
            monthval = month.toString();
        //    console.log('monthval 2 :: '+monthval)
        }
        switch(monthval) {
            case '1':
                component.set("v.start", "2022-01-01")
                component.set("v.end", "2022-01-31")
                break;
            case '2':
                component.set("v.start", "2022-02-01")
                component.set("v.end", "2022-02-28")
                break;
            case '3':
                component.set("v.start", "2022-03-01")
                component.set("v.end", "2022-03-31")
                break;
            case '4':
                component.set("v.start", "2022-04-01")
                component.set("v.end", "2022-04-30")
                break;
            case '5':
                component.set("v.start", "2022-05-01")
                component.set("v.end", "2022-05-30")
                break;
            case '6':
                component.set("v.start", "2022-06-01")
                component.set("v.end", "2022-06-30")
                break;
            case '7':
                component.set("v.start", "2022-07-01")
                component.set("v.end", "2022-07-30")
                break;
            case '8':
                component.set("v.start", "2022-08-01")
                component.set("v.end", "2022-08-30")
                break;
            case '9':
                if(event.target.name == 'current'){
                    component.set("v.start", currentStart)
                }else{
                    component.set("v.start", "2022-09-01")
                }
                
                component.set("v.end", "2022-09-30")
                break;
            case '10':
                if(event.target.name == 'current'){
                    component.set("v.start", currentStart)
                }else{
                    component.set("v.start", "2022-10-01")
                }
                component.set("v.end", "2022-10-30")
                break;
            case '11':
                if(event.target.name == 'current'){
                    component.set("v.start", currentStart)
                }else{
                    component.set("v.start", "2022-11-01")
                }
                
                component.set("v.end", "2022-11-30")
                break;
            case '12': 
                if(event.target.name == 'current'){
                    component.set("v.start", currentStart)
                }else{
                    component.set("v.start", "2022-12-01")
                }
                
                component.set("v.end", "2022-12-30")
                break;
            default :
                component.set("v.start", "2022-12-01")
                component.set("v.end", "2022-12-30")
        }
        
        
        //get report data from Apex controller using report ID provided
        //  alert('startDate 196'+component.get("v.start"));
        //  alert('endDate 197'+component.get("v.end"));
        
        //get report data from Apex controller using report ID provided
        var action = component.get('c.getReportMetadata');
        action.setParams({ 
            reportId: component.get("v.reportIdAttribute"),
            includeDetailAttribute: component.get("v.includeDetailAttribute"),
            startDate : component.get("v.start"),
            endDate : component.get("v.end")
        });
        
        //handle response from Apex controller
        action.setCallback(this, function(response){
            // transform into JSON object
            // console.log('response.getReturnValue() :: '+response.getReturnValue());
            // console.log('response.getReturnValue() :: '+JSON.stringify(response.getReturnValue()));
            var returnValue = JSON.parse(response.getReturnValue());
            var groupingLabels = {};
            
            if( returnValue && returnValue.reportExtendedMetadata ){
                // categorize groupings into levels so we can access them as we go down grouping level
                var columnInfo = returnValue.reportExtendedMetadata.groupingColumnInfo;
                for( var property in columnInfo ){
                    if( columnInfo.hasOwnProperty(property) ){
                        var level = columnInfo[property].groupingLevel;
                        var label = columnInfo[property].label;
                        groupingLabels[level] = label;
                    }
                }
                var groupingKey= "T";
                var rowData = returnValue.factMap[groupingKey+"!T"].rows;
                if($A.util.isUndefinedOrNull(rowData)){
                    // console.log('rowData ::: '+JSON.stringify(rowData));
                    $A.util.addClass(loadingSpinner, 'slds-hide');
                    $A.util.addClass(reportContainer, 'slds-hide');
                    component.set("v.noDataInFilterMonth",true);
                    //  console.log('get true value :: '+component.get("v.noDataInFilterMonth"))
                }else{
                    $A.util.removeClass(loadingSpinner, 'slds-hide');
                    // console.log('get true value :: '+component.get("v.noDataInFilterMonth"))
                    
                }
                // set lightning attributes so we have access to variables in the view
                component.set("v.groupingLevelToLabel", groupingLabels)
                component.set("v.reportData", returnValue);
                component.set("v.factMap", returnValue.factMap);
                
                var includeDetailAttribute = component.get('v.includeDetailAttribute');
                if (includeDetailAttribute) {
                    // get all aggregated columns, 
                    var aggColumns = [];
                    var aggColumnsLabel = [];
                    var tableHeaders = [];
                    var isRowCountExists = false;
                    
                    for( var i = 0; i < returnValue.reportMetadata.aggregates.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.aggregates[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.aggregateColumnInfo[fieldAPIName].label;
                        
                        if (fieldAPIName == 'RowCount') {
                            isRowCountExists = true;
                        }
                        
                        // only capture the one starting with !
                        // coz there are patterns like s!, m!, mx!, a!,
                        var pos1 = fieldAPIName.indexOf('!');
                        aggColumns.push(fieldAPIName.substring(pos1+1));
                        aggColumnsLabel.push (fieldLabel);
                        
                    }
                    
                    //get column headers, this assumes that they are returned in order
                    var aggColumnsPos = [];
                    
                    for( var i = 0; i < returnValue.reportMetadata.detailColumns.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.detailColumns[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.detailColumnInfo[fieldAPIName].label;
                        var aggColumnsLabel1 = [];
                        
                        for (var j=0; j< aggColumns.length; j++) {
                            if (aggColumns[j] == '') {
                                continue;
                            }
                            
                            if (fieldAPIName == aggColumns[j]) {
                                // 1. push the aggregagte column name, take the first word before space (Sum, Min, Max, Avg)
                                // 2. set aggregate column api name to blank
                                // note that there may be multiple match due to the patterns will be stored in aggColumnsLabel1
                                var theLabel = aggColumnsLabel[j];
                                var pos1 = theLabel.indexOf(' ');
                                if (pos1 > 0) {
                                    theLabel = theLabel.substring(0, pos1);
                                }
                                aggColumnsLabel1.push(theLabel);
                                aggColumns[j] = '';
                            }
                        }
                        
                        aggColumnsPos.push(aggColumnsLabel1);
                        tableHeaders.push(fieldLabel);
                    }
                    
                    if (isRowCountExists) {
                        // add the rowcount column if there is such thing
                        tableHeaders.push('Record Count');
                        var aggColumnsLabel2 = [];
                        aggColumnsLabel2.push('Sum');
                        aggColumnsPos.push(aggColumnsLabel2);
                    }
                    
                    component.set("v.columnLabels", tableHeaders);
                    component.set("v.aggColumnsPosition", aggColumnsPos);
                } else {
                    // these are aggregated column value
                    var tableHeaders = [];
                    var aggColumnsPos = [];
                    for( var i = 0; i < returnValue.reportMetadata.aggregates.length; i++ ){
                        var fieldAPIName = returnValue.reportMetadata.aggregates[i];
                        var fieldLabel = returnValue.reportExtendedMetadata.aggregateColumnInfo[fieldAPIName].label;
                        tableHeaders.push(fieldLabel);
                        aggColumnsPos.push(i);
                    }
                    component.set("v.columnLabels", tableHeaders);
                    component.set("v.aggColumnsPosition", aggColumnsPos);
                }
                
                //hide spinner, reveal data
                $A.util.addClass(loadingSpinner, 'slds-hide');
                $A.util.removeClass(reportContainer, 'slds-hide');
            }
            else {
                $A.util.addClass(loadingSpinner, 'slds-hide');
                $A.util.removeClass(reportError, 'slds-hide');
            }
        })
        $A.enqueueAction(action);
        
    }
})