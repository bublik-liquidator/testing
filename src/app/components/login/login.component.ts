import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import jwt_decode from 'jwt-decode';
import { User } from 'src/app/entities/user';
import { Question } from 'src/app/entities/question';
import { Answer } from 'src/app/entities/answer';
import { Result } from 'src/app/entities/result ';
import { environment } from 'src/app/environment';
import { AuthServiceService } from 'src/app/services/auth-service.service';
import { Router } from '@angular/router';


@Component( {
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.css' ]
} )
export class LoginComponent {

  CreatUser = new User();
  UpdateUser = new User();
  group_id: any[] = [];
  groups_name: any;
  UpdateQuestion = new Question();
  CreateQuestion = new Question();
  Results: Result[] = [];
  questions: Question[] = [];

  //Ansswers: Answer[]=[]
  Ansswers: any;
  
  user = new User();
  users: User[] = [];

  question = new Question();
  answers: Answer[] = [];
  ArrUsers: string[] = [];

  isAdmin: boolean = false;

  token: string | null = null;
  userCount: number = 0;

  title = 'my-app';
  
  constructor( private http: HttpClient, public dialog: MatDialog,private authService: AuthServiceService, private router: Router) 
 { }

  login() {
    this.authService.login(this.user.name, this.user.password).subscribe(
      (res) => {
        localStorage.setItem('token', res.token);
        if (res.token) {
          this.token = res.token;
          const decodedToken = jwt_decode<{ user_id: number; isAdmin: boolean }>(this.token);
          if (decodedToken.isAdmin) {
            // если зашёл админ
            this.isAdmin = true;
            this.router.navigate(['/admin']);
          } else {
            // если не админ
            this.router.navigate(['/questions']);
          }
        } else {
          this.openErrorDialog('Какие-то неполадки, попробуйте еще раз то, что вы делали или обратитесь к админу');
        }
      },
      (error) => {
        this.openErrorDialog('Ошибка:' + error.error);
      }
    );
  }
  
  
  openErrorDialog( inf: any ) {
    const dialogRef = this.dialog.open( ErrorDialogComponent, {
      data: { errorMessage: inf }
    } );

    dialogRef.afterClosed().subscribe( result => {
      console.log( `Dialog result: ${ result }` );
    } );
  }

}
