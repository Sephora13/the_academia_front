import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root'
}) 
export class CompositionService {

  constructor(
    private httpClient : HttpClient  
  ) {}

  private apiUrl = 'http://localhost:3000/composition';

  isAble():Observable<any>{
    return this.httpClient.get<any>(this.apiUrl, {
      headers:{
        'X-Forwarded-For': '192.168.1.20'
      }
    })
  }
}