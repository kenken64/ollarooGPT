import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SunoApiService {
  constructor(private http:HttpClient) { }

  generateSongFromSuno(message:string): Promise<any>{
    message = message.trim();
    const options = message ? {params: 
            new HttpParams().set('message', message)} : {};

    const url = '/api/generate-song';
    return lastValueFrom(this.http.get(url, options));
  }

}
