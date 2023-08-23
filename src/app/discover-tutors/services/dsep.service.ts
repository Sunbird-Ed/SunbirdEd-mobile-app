import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 
@Injectable({
  providedIn: 'root'
})
export class DsepService {
 
  private DSEP_URL = 'YOUR_DSEP_BACKEND_URL'; // Replace with your DSEP backend URL
 
  constructor(private http: HttpClient) {}
 
  searchTutors(context: any) {
    return this.http.post(`${this.DSEP_URL}/search`, { context });
  }
}