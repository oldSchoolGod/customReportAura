({
	doInit : function(component, event, helper) {
		var factMap = component.get("v.factMap");
		var includeDetailAttribute = component.get("v.includeDetailAttribute");
		var isAggregateRow = component.get("v.isAggregateRow");
        var columnLabels= component.get("v.columnLabels");
       // console.log('columnLabels' + columnLabels)
		if( factMap ){
			var groupingKey = component.get("v.groupingKey");

			if (includeDetailAttribute) {
				if (isAggregateRow == 'no') {
                   var rowData = factMap[groupingKey+"!T"].rows;
                    console.log("===>"+rowData[0].dataCells[1].label);
                    console.log("===>"+rowData[0].dataCells[1].value);
                    for(var i = 0; i < rowData.length; i++){
                        if(columnLabels.indexOf("End Date")!=-1){
                        rowData[i].dataCells[columnLabels.indexOf("End Date")].cssClasstemp = 'greenwcolor';
                        }
                        if(columnLabels.indexOf("Duration (Weeks)")!=-1){
                            var weekIndex = columnLabels.indexOf("Duration (Weeks)");
                            var Weeks= parseInt(rowData[i].dataCells[weekIndex].value);
                        if(Weeks==1 ){
                            rowData[i].dataCells[weekIndex].cssClasstemp = 'Bluecolor';
                        }else if(Weeks==2){
                            rowData[i].dataCells[weekIndex].cssClasstemp = 'yellowcolor';
                        }else if(Weeks==3){
                            rowData[i].dataCells[weekIndex].cssClasstemp = 'orangecolor';
                        }else if(Weeks==4){
                            rowData[i].dataCells[weekIndex].cssClasstemp = 'pinckcolor';
                        }else if(Weeks>=5){
                            rowData[i].dataCells[weekIndex].cssClasstemp = 'greenwcolor';
                        }else{
                             rowData[i].dataCells[weekIndex].cssClasstemp = 'defaultcolor';
                        }
                        }
                       
                        
                        
                    }
                   
					component.set("v.dataRows",rowData);
				} else {
					// refomulate the data so that it can extract easily in lightning component
					var aggColumnsPosition = component.get("v.aggColumnsPosition");
					var tmpAgg = factMap[groupingKey+"!T"].aggregates;
					var theCount = 0;
					var aggLabelValue = [];
					for( var i = 0; i < aggColumnsPosition.length; i++ ){
						var labels = aggColumnsPosition[i];
						var labels1 = [];
						for( var j = 0; j < labels.length; j++ ){
							labels1[j] = labels[j] + ": " + tmpAgg[theCount].label;
							theCount++;
						}
						aggLabelValue.push(labels1);
					}
					component.set("v.aggLabelValue", aggLabelValue);				}
			} else {
				component.set("v.dataRows", factMap[groupingKey+"!T"].aggregates);
			}
		}
	},
	editRecord : function (component, event, helper) {
		var recordId = event.currentTarget.dataset.recordid;
		var editRecordEvent = $A.get("e.force:editRecord");
		editRecordEvent.setParams({
			 "recordId": recordId
		});
		editRecordEvent.fire();
	}
})