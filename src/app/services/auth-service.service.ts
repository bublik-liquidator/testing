import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { environment } from '../environment';

@Injectable( {
  providedIn: 'root'
} )
export class AuthServiceService {

  constructor( private http: HttpClient) { }

  login( name: string, password: string ): Observable<{ token: string }> {
    return this.http.post<{ token: string }>( environment.serverUrl + '/login', { name, password } );
  }
}
