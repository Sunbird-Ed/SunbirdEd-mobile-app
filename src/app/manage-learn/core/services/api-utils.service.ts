import { Injectable } from '@angular/core';
import { CommonUtilService } from '../../../../services/common-util.service';

@Injectable({
  providedIn: 'root'
})
export class ApiUtilsService {
  public assessmentBaseUrl: string;
  public projectsBaseUrl: string;
  public appVersion;
  public appName;

  constructor(
    private commonUtilService: CommonUtilService,

  ) { }

  async initilizeML() {
    console.log("*****************************************");
    console.log("*****************************************");
    console.log("*****************************************");
    console.log("*****************************************");
    console.log(  this.appName,"  this.appName *****************************************");
    this.appName = !this.appName ? await this.commonUtilService.getAppName() : this.appName
    console.log(  this.appName,"  this.appName");
    await this.commonUtilService.getAppName().then(name =>{
      console.log(name,"name");
    },error =>{
      console.log(error,"error");
    })
  }

  getBaseUrl(key) {
    return this[key]
  }
}


// {
//   "Authorization": "Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Im1vYmlsZV9kZXZpY2V2Ml9rZXkxMiJ9.eyJpc3MiOiJ1bmRlZmluZWQtZGEzOWEzZWU1ZTZiNGIwZDMyNTViZmVmOTU2MDE4OTBhZmQ4MDcwOSIsImlhdCI6MTcxMTk3MjcxN30.aSzYi-ZBz06IwkVzzga3ns-YKJHnPpqyuH5nCGInCA7pG1nmj1ryfgpuxufgofHm0ZVXEhQ5nwAa34-g8eGNih9DO58RXEZk4M_TrrJb-OWu0bujHxNZusgJPa_I2I9JWgu8jOt8v5d44hhtj9YMU3nDqGpRvLM2Uy3uXm_Qoua7d2swkx5bwbsHvEI_jbxmrLTzwxWy3p-E28HPeAsAPQ9CZ3-d8ysS8MzqeiV_xnFG0VTOQq6cx2Ab4YKYa3VyQEzxcyIfoA5mvenez6hVW_vAXlIzaqf69gI5_cP7P0pHAigcIYatpKi0EwjshcIi7Xz1lBgWSUljuOLI5Eua8g",
//   "x-auth-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImFjY2Vzc3YxX2tleTcifQ.eyJhdWQiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwic3ViIjoiZjo5Nzk3MzhiNy0yNTNjLTRhZGYtOTY3My1hODU3ZWViODYxMTU6NTRkYzI4MTQtZTgxNS00ZWQ5LThhNTgtNjQ2NDc4NWExZjJjIiwicm9sZXMiOlt7InJvbGUiOiJQVUJMSUMiLCJzY29wZSI6W119XSwiaXNzIjoiaHR0cHM6Ly9zdGFnaW5nLnN1bmJpcmRlZC5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsInR5cCI6IkJlYXJlciIsImV4cCI6MTcxMjM3NjQ3NSwiaWF0IjoxNzEyMjkwMDc1fQ.WbRFLE375uZZ6rqgq-Iho0HC9gCAjvgBffkxAM7wtVqUR5oPSdFEvyqE0qsI0M2SHAMGT9jmkDrczr0DoU31wJGyBibb0oYtX9qnMSv_Zg-SOc45ptaeYbbh3YhUAXb1U9N5vX8iCpfiNcJRG6T3pb0J_lOf8suLwq4DwGKrZ15Z8Wjh9F1A1nnA5WKJxsWbJ-TwWZzK7QBrwnJ80sO-81u8FxFOEbjrbt4ljiMpSsTQ3u-Tu_qvsdtx0_A9cDeiCQ71XYeS-qsVBDMV1IAdvfBd4mCBbpBl7YN2g99zcHJAoRZt5DcEPm_8TcELnqDxVhDzqCadpNkKZnl9Bzh0Zg",
//   "X-authenticated-user-token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImFjY2Vzc3YxX2tleTcifQ.eyJhdWQiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwic3ViIjoiZjo5Nzk3MzhiNy0yNTNjLTRhZGYtOTY3My1hODU3ZWViODYxMTU6NTRkYzI4MTQtZTgxNS00ZWQ5LThhNTgtNjQ2NDc4NWExZjJjIiwicm9sZXMiOlt7InJvbGUiOiJQVUJMSUMiLCJzY29wZSI6W119XSwiaXNzIjoiaHR0cHM6Ly9zdGFnaW5nLnN1bmJpcmRlZC5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsInR5cCI6IkJlYXJlciIsImV4cCI6MTcxMjM3NjQ3NSwiaWF0IjoxNzEyMjkwMDc1fQ.WbRFLE375uZZ6rqgq-Iho0HC9gCAjvgBffkxAM7wtVqUR5oPSdFEvyqE0qsI0M2SHAMGT9jmkDrczr0DoU31wJGyBibb0oYtX9qnMSv_Zg-SOc45ptaeYbbh3YhUAXb1U9N5vX8iCpfiNcJRG6T3pb0J_lOf8suLwq4DwGKrZ15Z8Wjh9F1A1nnA5WKJxsWbJ-TwWZzK7QBrwnJ80sO-81u8FxFOEbjrbt4ljiMpSsTQ3u-Tu_qvsdtx0_A9cDeiCQ71XYeS-qsVBDMV1IAdvfBd4mCBbpBl7YN2g99zcHJAoRZt5DcEPm_8TcELnqDxVhDzqCadpNkKZnl9Bzh0Zg",
//   "Content-Type": "application/json",
//   "deviceId": "da39a3ee5e6b4b0d3255bfef95601890afd80709"
// }


// curl -XPOST -H 'Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6Im1vYmlsZV9kZXZpY2V2Ml9rZXkxMiJ9.eyJpc3MiOiJ1bmRlZmluZWQtZGEzOWEzZWU1ZTZiNGIwZDMyNTViZmVmOTU2MDE4OTBhZmQ4MDcwOSIsImlhdCI6MTcxMTk3MjcxN30.aSzYi-ZBz06IwkVzzga3ns-YKJHnPpqyuH5nCGInCA7pG1nmj1ryfgpuxufgofHm0ZVXEhQ5nwAa34-g8eGNih9DO58RXEZk4M_TrrJb-OWu0bujHxNZusgJPa_I2I9JWgu8jOt8v5d44hhtj9YMU3nDqGpRvLM2Uy3uXm_Qoua7d2swkx5bwbsHvEI_jbxmrLTzwxWy3p-E28HPeAsAPQ9CZ3-d8ysS8MzqeiV_xnFG0VTOQq6cx2Ab4YKYa3VyQEzxcyIfoA5mvenez6hVW_vAXlIzaqf69gI5_cP7P0pHAigcIYatpKi0EwjshcIi7Xz1lBgWSUljuOLI5Eua8g' 
// -H 'X-auth-token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImFjY2Vzc3YxX2tleTcifQ.eyJhdWQiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwic3ViIjoiZjo5Nzk3MzhiNy0yNTNjLTRhZGYtOTY3My1hODU3ZWViODYxMTU6NTRkYzI4MTQtZTgxNS00ZWQ5LThhNTgtNjQ2NDc4NWExZjJjIiwicm9sZXMiOlt7InJvbGUiOiJQVUJMSUMiLCJzY29wZSI6W119XSwiaXNzIjoiaHR0cHM6Ly9zdGFnaW5nLnN1bmJpcmRlZC5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsInR5cCI6IkJlYXJlciIsImV4cCI6MTcxMjM3NjQ3NSwiaWF0IjoxNzEyMjkwMDc1fQ.WbRFLE375uZZ6rqgq-Iho0HC9gCAjvgBffkxAM7wtVqUR5oPSdFEvyqE0qsI0M2SHAMGT9jmkDrczr0DoU31wJGyBibb0oYtX9qnMSv_Zg-SOc45ptaeYbbh3YhUAXb1U9N5vX8iCpfiNcJRG6T3pb0J_lOf8suLwq4DwGKrZ15Z8Wjh9F1A1nnA5WKJxsWbJ-TwWZzK7QBrwnJ80sO-81u8FxFOEbjrbt4ljiMpSsTQ3u-Tu_qvsdtx0_A9cDeiCQ71XYeS-qsVBDMV1IAdvfBd4mCBbpBl7YN2g99zcHJAoRZt5DcEPm_8TcELnqDxVhDzqCadpNkKZnl9Bzh0Zg'
// -H 'X-authenticated-user-token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImFjY2Vzc3YxX2tleTcifQ.eyJhdWQiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwic3ViIjoiZjo5Nzk3MzhiNy0yNTNjLTRhZGYtOTY3My1hODU3ZWViODYxMTU6NTRkYzI4MTQtZTgxNS00ZWQ5LThhNTgtNjQ2NDc4NWExZjJjIiwicm9sZXMiOlt7InJvbGUiOiJQVUJMSUMiLCJzY29wZSI6W119XSwiaXNzIjoiaHR0cHM6Ly9zdGFnaW5nLnN1bmJpcmRlZC5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsInR5cCI6IkJlYXJlciIsImV4cCI6MTcxMjM3NjQ3NSwiaWF0IjoxNzEyMjkwMDc1fQ.WbRFLE375uZZ6rqgq-Iho0HC9gCAjvgBffkxAM7wtVqUR5oPSdFEvyqE0qsI0M2SHAMGT9jmkDrczr0DoU31wJGyBibb0oYtX9qnMSv_Zg-SOc45ptaeYbbh3YhUAXb1U9N5vX8iCpfiNcJRG6T3pb0J_lOf8suLwq4DwGKrZ15Z8Wjh9F1A1nnA5WKJxsWbJ-TwWZzK7QBrwnJ80sO-81u8FxFOEbjrbt4ljiMpSsTQ3u-Tu_qvsdtx0_A9cDeiCQ71XYeS-qsVBDMV1IAdvfBd4mCBbpBl7YN2g99zcHJAoRZt5DcEPm_8TcELnqDxVhDzqCadpNkKZnl9Bzh0Zg'
// -H "Content-type: application/json" -d '{
//   "district": "24c36610-0640-45a3-b88e-fa92c9ebbec2",
//   "state": "bc75cc99-9205-463e-a722-5326857838f8",
//   "block": "e5be5e9c-3eea-4822-8754-9009c47c6782",
//   "school": "28140306106",
//   "role": "TEACHER"
// }' 'https://staging.sunbirded.org/api/surveys/mlsurvey/v1/details/62e228eedd8c6d0009da507d?solutionId=627dfc6509446e00072ccf78'