public with sharing class ReportContainerController {
    @AuraEnabled(cacheable=true)
    public static String getReportMetadata ( Id reportId, String startDate, String endDate){
        String str1 = JSON.serializePretty(Reports.ReportManager.runReport( reportId, true ) );
        
        if(String.isNotBlank(String.valueOf(startDate)) && String.isNotBlank(String.valueOf(endDate))){
            System.debug('called filter');
            List<Reports.ReportFilter> lstFilters = new List<Reports.ReportFilter>();
            Reports.ReportDescribeResult describe = Reports.ReportManager.describeReport(reportId);
            Reports.ReportMetadata reportMd = describe.getReportMetadata();
            lstFilters.add(new Reports.ReportFilter('Opportunity_Product__c.Start_Date__c', 'lessOrEqual',endDate));
            lstFilters.add(new Reports.ReportFilter('Opportunity_Product__c.End_Date__c', 'greaterOrEqual',endDate));
            lstFilters.add(new Reports.ReportFilter('Opportunity_Product__c.End_Date__c', 'lessOrEqual',endDate));
            lstFilters.add(new Reports.ReportFilter('Opportunity_Product__c.End_Date__c', 'greaterOrEqual',startDate));
            lstFilters.add(new Reports.ReportFilter('Opportunity_Product__c.Start_Date__c', 'greaterOrEqual',startDate));
            /*lstFilters.add(new Reports.ReportFilter(endDate, 'greaterOrEqual','Opportunity_Product__c.Start_Date__c'));
            lstFilters.add(new Reports.ReportFilter(endDate, 'lessOrEqual','Opportunity_Product__c.End_Date__c'));
            lstFilters.add(new Reports.ReportFilter(endDate, 'greaterOrEqual','Opportunity_Product__c.End_Date__c'));
            lstFilters.add(new Reports.ReportFilter(startDate, 'lessOrEqual','Opportunity_Product__c.End_Date__c'));
            lstFilters.add(new Reports.ReportFilter(startDate, 'lessOrEqual','Opportunity_Product__c.Start_Date__c'));*/
            reportMd.setReportFilters(lstFilters);
            reportMd.setReportBooleanFilter('((1 AND 2) OR (3 AND 4) OR (1 AND 5))');
            Reports.ReportResults results= Reports.ReportManager.runReport(reportId, reportMd,true);
            System.debug('describe' +JSON.serializePretty(results));
            string str = JSON.serializePretty(results);
            return str;
        }else{
            return str1; 
            
        }
    }
}