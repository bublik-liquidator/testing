import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Answer } from 'src/app/entities/answer';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { Question } from 'src/app/entities/question';
import { environment } from 'src/app/environment';
import { UserServiceService } from 'src/app/services/user-service.service';
import { Router } from '@angular/router';

@Component( {
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: [ './questions.component.css' ]
} )
export class QuestionsComponent {
  token: string | null = null;
  answers: Answer[] = [];
  showSubmitButton = true;
  questions: Question[] = [];

  constructor( private http: HttpClient, public dialog: MatDialog,private userService:UserServiceService,private router: Router ) { }
  ngOnInit() {
    this.token = localStorage.getItem('token');
    this.userService.checkTest().subscribe(
      (data: any) => {
        this.questions = data.questions;
        this.answers = new Array(this.questions.length).fill(undefined);
      },
      (error) => {
        this.showSubmitButton = false;
        this.openErrorDialog("Ошибка " + error.error);
      }
    );
  }
  submitAnswers() {
    if ( this.token ) {
      this.http.post( environment.serverUrl + '/test', { answers: this.answers, } )
        .subscribe(
          ( res ) => {
            console.log( res );
            //this.openErrorDialog(res);
          },
          ( err ) => {
            console.error( err.error );
            this.openErrorDialog( err.error );
          }
        );
      this.openErrorDialog( "Спасибо за ваши ответы" );
      localStorage.removeItem("token");
      setTimeout(  () => {
        this.router.navigate(['']);
      }, 2000 );
    }
  }

  openErrorDialog( inf: any ) {
    const dialogRef = this.dialog.open( ErrorDialogComponent, {
      data: { errorMessage: inf }
    } );

    dialogRef.afterClosed().subscribe( result => {
      console.log( `Dialog result: ${ result }` );
    } );
  }

  isFormValid() {
    return this.answers.every( ( answer ) => answer !== undefined );
  }
}
