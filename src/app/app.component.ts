import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwt_decode from 'jwt-decode';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { NgForm } from '@angular/forms';
import * as FileSaver from 'file-saver';
import { User } from './entities/user';
import { Question } from './entities/question';
import { Answer } from './entities/answer';



interface Result {
    question: string;
    option1_count: number;
    option2_count: number;
    option3_count: number;
    option4_count: number;
    option5_count: number;
    group_name: number;
}
interface CheckTestCompletedResponse {
    testCompleted: boolean;
}
@Component( {
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: [ './app.component.css' ],

} )
export class AppComponent {
    CreatUser = new User();
    UpdateUser = new User();
    questions: Question[] = [];

    UpdateQuestion= new Question();
    CreateQuestion= new Question();

    adres: string = "http://localhost:3000";
    user = new User();
    users: User[] = [];

    question = new Question();
    answers: Answer[] = [];
    ArrUsers: string[] = [];

    newPassword: string = "";
    testCompleted: boolean = false;
    isAdmin: boolean = false;

    token: string | null = null;
    results: Result[] = [];
    userCount: number = 0;
    Squestions: any;
    questionId: any;

    updateoption1 = '';
    updateoption2 = '';
    updateoption3 = '';
    updateoption4 = '';
    updateoption5 = '';
    createname = '';
    createpassword = '';
    createrole = '';
    Ansswers: any;
    title = 'my-app';
    showSubmitButton = true;
    users_not_completed = ""
    constructor( private http: HttpClient, public dialog: MatDialog ) { }

    ngOnInit() {
    }


    saveTable() {
        const tableElement = document.querySelector( '.tablicc' );
        if ( tableElement ) {
            let tableHtml = tableElement.outerHTML;
            tableHtml = tableHtml.replace(
                /<table/g,
                '<table style="border-collapse: collapse;"'
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
            const blob = new Blob( [ tableHtml ], { type: 'application/vnd.ms-word' } );
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


    login() {
        this.http.post<{ token: string }>( this.adres + '/login', { name: this.user.name, password: this.user.password } )
            .subscribe(
                ( res ) => {
                    localStorage.setItem( 'token', res.token );
                    if ( res.token ) {
                        this.token = res.token;
                        const decodedToken = jwt_decode<{ user_id: number; isAdmin: boolean }>( this.token );
                        if ( decodedToken.isAdmin ) {//если зашёл админ
                            this.isAdmin = true;
                            this.http.post<string[]>( this.adres + '/users-not-completed', {}, { params: { token: this.token } } )
                                .subscribe( ( users ) => {
                                    console.log( users + 'users ' );
                                    this.ArrUsers = users;
                                } );
                            this.http.post<number>( this.adres + '/user-count', {}, { params: { token: this.token } } )
                                .subscribe( ( count ) => {
                                    this.userCount = count;
                                } );
                            this.http.post<Result[]>( this.adres + '/results', {}, { params: { token: this.token } } )
                                .subscribe( ( data ) => {
                                    this.results = data; //as unknown as GroupedResults;
                                },
                                    ( err ) => {
                                        console.error( err );
                                        this.openErrorDialog( "Не успешно " + err.message );
                                    } );
                            this.http.post<User[]>( this.adres + '/users', {}, { params: { token: this.token } } )
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
                        else {
                            this.http.post<Question[]>( this.adres + '/checkTest', {}, { params: { token: this.token, name: this.user.name } } )
                                .subscribe( ( data: any ) => {
                                    this.questions = data.questions;
                                    this.answers = new Array( this.questions.length ).fill( undefined );
                                }, ( error ) => {
                                    this.showSubmitButton = false;
                                    this.openErrorDialog( error.error )
                                } );
                        }
                    } else {
                        this.openErrorDialog( 'Какие-то неполадки, попробуйте еще раз то, что вы делали или обратитесь к админу' )
                    }
                },
                ( error ) => {
                    this.openErrorDialog( 'Ошибка:' + error.error )
                } );
    }

    submitAnswers() {
        if ( this.token ) {
            this.http.post( this.adres + '/test', { answers: this.answers, }, { params: { token: this.token} } )
            .subscribe(
                (res) => {
                  console.log(res);
                  //this.openErrorDialog(res);
                },
                (err) => {
                  console.error(err.error);
                  this.openErrorDialog(err.error);
                }
              );
              this.openErrorDialog("Спасибо за ваши ответы");

            setTimeout( function () {
                location.reload();
            }, 2000 );
        }
    }

    changePassword() {
        if ( this.token )
            this.http.post<{ message: string }>( this.adres + '/change-password', { name: this.createname, newPassword: this.newPassword }, { params: { token: this.token } } )
                .subscribe(
                    ( res ) => {
                        console.log( res );
                        this.openErrorDialog( "Пароль для юзера " + this.createname + " был изменён на " + this.newPassword );
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
                    this.adres + '/add-question',
                    {
                        question: this.CreateQuestion.question,
                        option1: this.CreateQuestion.option1,
                        option2: this.CreateQuestion.option2,
                        option3: this.CreateQuestion.option3,
                        option4: this.CreateQuestion.option4,
                        option5: this.CreateQuestion.option5,
                        group_id: this.CreateQuestion.group_id,
                    },
                    { params: { token: this.token } }
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
    // getQuestions(){
    //     this.http.post( this.adres + '/get-questions', {}, { params: { token: this.token } } )
    //     .subscribe(
    //         ( data ) => {
    //             this.Squestions = data;
    //             console.log( data )
    //         },
    //         ( error ) => {
    //             this.openErrorDialog( error.error );
    //             console.error( error );
    //         }
    //     );
    // }
    getQuestions() {
        this.http.post(this.adres + '/get-questions', {token: this.token} ).subscribe(
          (data: any) => {
            // Handle successful response
            this.questions = data;
          },
          (error) => {
            // Handle error response
            console.error(error);
          }
        );
      }
    updateQuestion() {
        if ( this.token )
            this.http.post( this.adres + '/update-question', {
                question:  this.UpdateQuestion.question,
                questionId: this.UpdateQuestion.id,
                option1: this.UpdateQuestion.option1,
                option2: this.UpdateQuestion.option2, 
                option3: this.UpdateQuestion.option3, 
                option4: this.UpdateQuestion.option4, 
                option5: this.UpdateQuestion.option5, 
                group_id: this.UpdateQuestion.group_id }, { params: { token: this.token } } )
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
        this.http.post( this.adres + '/add-user', {
            name: this.CreatUser.name,
            password: this.CreatUser.password,
            group_id: this.CreatUser.group_id,
            role: this.CreatUser.role,
            token: this.token,
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
            this.http.post( this.adres + '/get-ansver', {}, { params: { token: this.token } } )
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
            this.http.post( this.adres + '/clear-table', {}, { params: { token: this.token } } ).subscribe(
                res => this.openErrorDialog( res ),
                err => this.openErrorDialog( "Не успешно " + err.error )
            );
    }
}
