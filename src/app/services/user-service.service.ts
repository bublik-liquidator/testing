import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../entities/result ';
import { User } from '../entities/user';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment';
import { Question } from '../entities/question';

@Injectable( {
  providedIn: 'root'
} )
export class UserServiceService {

  constructor( private http: HttpClient) { }

  getUsersNotCompleted(): Observable<string[]> {
    return this.http.post<string[]>( environment.serverUrl + '/users-not-completed', {} );
  }

  getUserCount(): Observable<number> {
    return this.http.post<number>( environment.serverUrl + '/user-count', {} );
  }

  getResults(): Observable<Result[]> {
    return this.http.post<Result[]>( environment.serverUrl + '/results', {} );
  }

  getUsers(): Observable<User[]> {
    return this.http.post<User[]>( environment.serverUrl + '/users', {} );
  }

  getUsersGroupId(): Observable<string[]> {
    return this.http.post<string[]>( environment.serverUrl + '/users_group_id', {} );
  }
  checkTest(): Observable<Question[]> {
    return this.http.post<Question[]>(environment.serverUrl + '/checkTest', {});
  }

}
