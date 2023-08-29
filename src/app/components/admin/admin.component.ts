import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import * as FileSaver from 'file-saver';
import { Answer } from 'src/app/entities/answer';
import { Question } from 'src/app/entities/question';
import { Result } from 'src/app/entities/result ';
import { User } from 'src/app/entities/user';
import { ErrorDialogComponent } from '../error-dialog/error-dialog.component';
import { environment } from 'src/app/environment';
import { UserServiceService } from 'src/app/services/user-service.service';
import { Router } from '@angular/router';

@Component( {
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: [ './admin.component.css' ]
} )
export class AdminComponent {
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

  answers: Answer[] = [];
  ArrUsers: string[] = [];

  isAdmin: boolean = false;

  token: any;
  userCount: number = 0;

  title = 'my-app';
  constructor( private http: HttpClient, public dialog: MatDialog, private userService: UserServiceService,private router: Router ) { }
  ngOnInit() {
    this.token = localStorage.getItem( 'token' );
    this.userService.getUsersNotCompleted().subscribe( ( users ) => {
      console.log( users + ' users' );
      this.ArrUsers = users;
    } );
    this.userService.getUserCount().subscribe( ( count ) => {
      this.userCount = count;
    } );
    this.userService.getResults().subscribe(
      ( data ) => {
        this.Results = data;
      },
      ( err ) => {
        console.error( err );
        this.openErrorDialog( "Не успешно " + err.message );
      }
    );
    this.userService.getUsers().subscribe(
      ( data ) => {
        this.users = data;
      },
      ( err ) => {
        console.error( err );
        this.openErrorDialog( "Не успешно " + err.message );
      }
    );
    this.userService.getUsersGroupId().subscribe( ( data: any ) => {
      console.log( data + 'data ' );
      this.group_id = data;
    } );
  }

  saveTable() {
    const tableElement = document.querySelector( '.tablicc' );
    const dateElement = document.querySelector( '#date' );
    const descriptionElement = document.querySelector( '#description' );
    if ( tableElement && dateElement && descriptionElement ) {
      let tableHtml = tableElement.outerHTML;
      tableHtml = tableHtml.replace(
        /<table/g,
        '<table style="border-collapse: collapse; max-width: 100%;"'
      );
      tableHtml = tableHtml.replace(
        /<td/g,
        '<td style="border: 1px solid black; padding: 5px;"'
      );
      tableHtml = tableHtml.replace(
        /<th/g,
        '<th style="border: 1px solid black; padding: 5px;"'
      );
      tableHtml = tableHtml.replace( /<br>/g, '\n' );
      const dateElement = document.querySelector( '#date' ) as HTMLInputElement;
      const dateValue = dateElement.value;
      const descriptionElement = document.querySelector( '#description' ) as HTMLInputElement;
      const descriptionValue = descriptionElement.value;
      const content = `Дата: ${ dateValue }\nОписание: ${ descriptionValue }\n\n${ tableHtml }`;
      const blob = new Blob( [ content ], { type: 'application/vnd.ms-word' } );
      FileSaver.saveAs( blob, 'table.doc' );
    } else {
      this.openErrorDialog( 'Table element not found' );
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


  GetUsersFromTable() {
    this.http.post<User[]>( environment.serverUrl + '/users', {} )
      .subscribe(
        ( data ) => {
          this.users = data;
        },
        ( err ) => {
          console.error( err );
          this.openErrorDialog( "Не успешно " + err );
        }
      );
  }

  getResults() {
    if ( this.token )
      this.http.post<Result[]>( environment.serverUrl + '/results', {} )
        .subscribe( ( data ) => {
          this.Results = data;
        },
          ( err ) => {
            console.error( err );
            this.openErrorDialog( "Не успешно " + err.message );
          } );
  }

  changePassword() {
    console.log( this.groups_name + "groups_name" )
    if ( this.token )
      this.http.post<{ message: string }>( environment.serverUrl + '/change-password', { name: this.UpdateUser.name, newPassword: this.UpdateUser.password, groups_name: this.groups_name } )
        .subscribe(
          ( res ) => {
            console.log( res );
            this.openErrorDialog( "Пароль для юзера " + this.UpdateUser.name + " был изменён на " + this.UpdateUser.password );
          },
          ( err ) => {
            console.error( err );
            this.openErrorDialog( "Ошибка " + err.error );
          }
        );
  }


  addQuestion() {
    if ( this.token )
      this.http
        .post(
          environment.serverUrl + '/add-question',
          {
            question: this.CreateQuestion.question,
            option1: this.CreateQuestion.option1,
            option2: this.CreateQuestion.option2,
            option3: this.CreateQuestion.option3,
            option4: this.CreateQuestion.option4,
            option5: this.CreateQuestion.option5,
            group_id: this.CreateQuestion.group_id,
          }
        )
        .subscribe(
          ( res ) => {
            this.openErrorDialog( res );
          },
          ( err ) => {
            this.openErrorDialog( 'Не успешно ' + err.error );
            console.error( err );
          }
        );
  }

  getQuestions() {
    this.http.post( environment.serverUrl + '/get-questions', {} ).subscribe(
      ( data: any ) => {
        // Handle successful response
        this.questions = data;
      },
      ( error ) => {
        // Handle error response
        console.error( error );
      }
    );
  }

  updateQuestion() {
    if ( this.token )
      this.http.post( environment.serverUrl + '/update-question', {
        question: this.UpdateQuestion.question,
        questionId: this.UpdateQuestion.id,
        option1: this.UpdateQuestion.option1,
        option2: this.UpdateQuestion.option2,
        option3: this.UpdateQuestion.option3,
        option4: this.UpdateQuestion.option4,
        option5: this.UpdateQuestion.option5,
        group_id: this.UpdateQuestion.group_id
      } )
        .subscribe(
          ( res ) => {
            this.openErrorDialog( res );
            console.log( res );
          },
          ( err ) => {
            this.openErrorDialog( "Не успешно " + err.error );
            console.error( err );
          }
        );
  }

  addUser() {
    this.http.post( environment.serverUrl + '/add-user', {
      name: this.CreatUser.name,
      password: this.CreatUser.password,
      group_id: this.CreatUser.group_id,
      role: this.CreatUser.role,
    } )
      .subscribe(
        ( data ) => {
          this.openErrorDialog( data );
          console.log( data );
        },
        ( error ) => {
          this.openErrorDialog( error.message );
          console.error( error );
        }
      );
  }

  getAnswers() {
    if ( this.token )
      this.http.post( environment.serverUrl + '/get-ansver', {} )
        .subscribe(
          ( data ) => {
            this.Ansswers = data;
            console.log( data )
          },
          ( error ) => {
            this.openErrorDialog( error.message );
            console.error( error );
          }
        );
  }

  ClearAnswers() {
    if ( this.token )
      this.http.post( environment.serverUrl + '/clear-table', {} ).subscribe(
        res => this.openErrorDialog( res ),
        err => this.openErrorDialog( "Не успешно " + err.error )
      );
  }

  exit(){
    localStorage.removeItem("token");
    this.router.navigate(['']);
  }
}
