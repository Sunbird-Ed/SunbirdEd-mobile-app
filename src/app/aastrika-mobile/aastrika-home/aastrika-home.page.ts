import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { RouterLinks } from '@app/app/app.constant';
import { AppHeaderService } from '@app/services';

@Component({
  selector: 'app-aastrika-home',
  templateUrl: './aastrika-home.page.html',
  styleUrls: ['./aastrika-home.page.scss'],
})
export class AastrikaHomePage implements OnInit {

  public data: any;
  content: any;
  constructor(
    private headerService: AppHeaderService,
    private router: Router,
    private http: HttpClient,
  ) { }

  ngOnInit() {
    this.getCourses();
  }

  async ionViewWillEnter() {
    this.headerService.hideHeader();
  }

  async getCourses() {
    let headers = {
      'Authorization' : 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJTNHNNVFdjZUZqYkxUWGxiczkzUzk4dmFtODBhdkRPUiJ9.nPOCY0-bVX28iNcxxnYbGpihY3ZzfNwx0-SFCnJwjas',
      'x-authenticated-user-token' : 'eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkelFFNjdiRmxRN0V2eUF3Tktndmk1X2ZQR0dsVUVKOGEyMnFlZ1R0TFU0In0.eyJqdGkiOiI3ZThlY2M3Zi01MTM5LTQzYzAtOTgwNi00NjIzNGQxYjc0MjciLCJleHAiOjE2NzQwMjIzNzEsIm5iZiI6MCwiaWF0IjoxNjcxNDMwMzcxLCJpc3MiOiJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvYXV0aC9yZWFsbXMvc3VuYmlyZCIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiJmOjkwN2I1YzY0LTFkNzktNDRkYi1iM2I1LWVjMTI5ZDU3ZjQyMTo2Njc4ZThhYy03ZTc2LTRhZjMtODM1NC1jMDk3MGRkNzg0MTkiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJwb3J0YWwiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiJiNDg2NWEyMi04ZGNkLTRiZmMtOGVmMC0yODg1ODA3MDJmYWEiLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vYWRtaW4tc3BoZXJlLmFhc3RyaWthLm9yZyIsImh0dHBzOi8vb3JnLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovY2JwLXNwaGVyZS5hYXN0cmlrYS5vcmciLCJodHRwczovL3NwaGVyZS5hYXN0cmlrYS5vcmcvKiIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiIiwibmFtZSI6IkFua2l0YSBLYXVzaGlrIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYW5raXRha2F1c2hpa19zOXUzIiwiZ2l2ZW5fbmFtZSI6IkFua2l0YSIsImZhbWlseV9uYW1lIjoiS2F1c2hpayIsImVtYWlsIjoic3AqKioqKioqKioqKioqKipAeW9wbWFpbC5jb20ifQ.rt9ocJV6pq81KLNu4p9YYal1hgcQxC9uyIdAvH1hICV4Hf66ZB8EQL2CFI0Fh9SACh1-qA8OWDMUAD2GiGYLoEqEdw4tcdMby64BTfJCJK8o54i9vN-ez7uiLHJqstVtLm990mfIwx3olghRRaGllcVYIYoFfsSp5K8DB2Me8nxJEXeNRmt9JiWhrjbW6jtatK7apmJZ3HkB5DDO37op2qHeLlyNJQov9OcnQmY50kD462xFxSRxyIyY5O8biwpLTkNcOlmlWVKNvp9u4B9pDrVif9TawOWbORPJv906VKw9GDbrkJn8XgUh0_1fLxM60YFoFn-1--MWwYvQpZNM_w',
      'Content-Type' : 'application/json'
    }
    let postData = {
      "request": {
          "filters": {
              "primaryCategory": [
                  "Course"
              ],
              "contentType": [
                  "Course"
              ],
              "status": [
                  "Live"
              ]
          },
          "sort_by": {
              "lastUpdatedOn": "desc"
          }
      },
      "query": "",
      "sort": [
          {
              "lastUpdatedOn": "desc"
          }
      ]
  }
    this.data = await this.http.post('https://sphere.aastrika.org/api/content/v1/search', postData).subscribe(data => {
      this.content = data['result'].content;     
     }, error => {
      console.log(error);
    });
  }

  courseDetails(data: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: data
    };
    this.router.navigate([RouterLinks.AASTRIKA_COURSE_OVERVIEW], navigationExtras)
  }

}
