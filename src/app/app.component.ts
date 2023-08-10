import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwt_decode from 'jwt-decode';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { NgForm } from '@angular/forms';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import * as FileSaver from 'file-saver';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: typeof import('jspdf-autotable').default;
    }
}
interface Question {
    id: number;
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    option5: string;

}

interface User {
    username: string;
    password: string;
}
interface Result {
    question: string;
    option1_count: number;
    option2_count: number;
    option3_count: number;
    option4_count: number;
    option5_count: number;
}
interface CheckTestCompletedResponse {
    testCompleted: boolean;
}
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],

})
export class AppComponent {

    adres: string = "http://localhost:3000";
    username = '';
    password = '';
    errorMessage = '';
    newPassword: string = "";
    users: User[] = [];
    testCompleted: boolean = false;
    isAdmin: boolean = false;

    EditUsername: string = "";
    token: string | null = null;
    questions: Question[] = [];
    answers: number[] = [];
    results: Result[] = [];
    userCount: number = 0;
    usersNotCompleted: string[] = [];
    Squestions: any;
    users_create_tables: any;
    tableName_change_password: any;
    questionId: any;
    tableName = '';
    tableName1 = '';
    tableName2 = '';
    answersName = '';
    question = '';
    option1 = '';
    option2 = '';
    option3 = '';
    option4 = '';
    option5 = '';

    updateoption1 = '';
    updateoption2 = '';
    updateoption3 = '';
    updateoption4 = '';
    updateoption5 = '';
    tables: any;
    NewtableName = "";
    createusername = '';
    createpassword = '';
    createrole = '';
    createtableName = '';
    Ansswers: any;
    title = 'my-app';
    showSubmitButton = true;

    constructor(private http: HttpClient, public dialog: MatDialog) { }

    ngOnInit() {
    }


    saveTable() {
        const tableElement = document.querySelector('.tablicc');
        if (tableElement) {
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
          tableHtml = tableHtml.replace(/<br>/g, '\n');
          const blob = new Blob([tableHtml], { type: 'application/vnd.ms-word' });
          FileSaver.saveAs(blob, 'table.doc');
        } else {
          this.openErrorDialog('Table element not found');
        }
      }
      

    login() {
        this.http
            .post<{ token: string }>(this.adres + '/login', { username: this.username, password: this.password })
            .subscribe(
                (res) => {
                    localStorage.setItem('token', res.token);

                    if (res.token) {
                        this.token = res.token;
                        const decodedToken = jwt_decode<{ user_id: number; isAdmin: boolean }>(this.token);
                        if (decodedToken.isAdmin) {//если зашёл админ
                            this.isAdmin = true;
                            this.http.get<Result[]>(this.adres + '/results', {
                                headers: new HttpHeaders({
                                    Authorization: `Bearer ${this.token}`,
                                }),
                            })
                                .subscribe((data) => {
                                    this.results = data; //as unknown as GroupedResults;
                                });
                            this.http.get<number>(this.adres + '/user-count', {
                                headers: new HttpHeaders({
                                    Authorization: `Bearer ${this.token}`,
                                }),
                            })
                                .subscribe((count) => {
                                    this.userCount = count;
                                });
                            this.http.get<string[]>(this.adres + '/users-not-completed', {
                                headers: new HttpHeaders({
                                    Authorization: `Bearer ${this.token}`,
                                }),
                            })
                                .subscribe((users) => {
                                    this.usersNotCompleted = users;
                                });

                        }

                        else {

                            this.http
                                .get<Question[]>(this.adres + '/test', {
                                    headers: new HttpHeaders({
                                        Authorization: `Bearer ${this.token}`,
                                    }),
                                })
                                .subscribe((data) => {
                                    this.questions = data;
                                    this.answers = new Array(this.questions.length).fill(undefined);
                                    // this.message = "Спасибо за ваш ответ"
                                    // this.token = null;
                                    // this.questions = [];
                                    // this.answers = [];
                                    // // this.results = [];
                                    // this.username = '';
                                    // this.password = '';

                                }, (error) => {
                                    this.showSubmitButton = false;

                                    if (error.status === 500) {
                                        this.openErrorDialog('Internal server error')
                                    } else if (error.status === 403) {
                                        this.openErrorDialog('Вы уже проходили этот тест, данный тест можно пройти только один раз')
                                    } else if (error.status === 401) {
                                        this.openErrorDialog('Вы не авторизованы,те вас нет в базе данных')
                                    } else {
                                        this.openErrorDialog('Какие-то неполадки, попробуйте еще раз то, что вы делали или обратитесь к админу')
                                    }
                                });
                        }
                    }
                },
                (error) => {
                    this.showSubmitButton = false;

                    if (error.status === 500) {
                        this.openErrorDialog('Internal server error')
                    } else if (error.status === 403) {
                        this.openErrorDialog('Вы уже проходили этот тест, данный тест можно пройти только один раз')
                    } else if (error.status === 401) {
                        this.openErrorDialog('Вы не авторизованы,те вас нет в базе данных')
                    } else {
                        this.openErrorDialog('Какие-то неполадки, попробуйте еще раз то, что вы делали или обратитесь к админу')
                    }
                });
    }

    onSubmit() {
        this.http
            .post(
                this.adres + '/test',
                { answers: this.answers }, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.token}`,
                }),
            }
            )
            .subscribe((data) => {
                console.log(data);
            });
        this.openErrorDialog("Спасиба за ваши овтеты")
        setTimeout(function () {
            location.reload();
        }, 2000);
    }

    changePassword() {
        // Get the token from localStorage
        const token = localStorage.getItem('token');

        // Send a request to the server to change the user's password
        this.http
            .post<{ message: string }>(
                this.adres + '/change-password',
                { username: this.EditUsername, newPassword: this.newPassword, tableName: this.tableName_change_password },
                {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${token}`,
                    }),
                }
            )
            .subscribe(
                (res) => {
                    console.log(res);
                    this.openErrorDialog("Пароль для юзера " + this.EditUsername + " был изменён на " + this.newPassword);
                },
                (err) => {
                    console.error(err);
                }
            );
    }


    isFormValid() {
        return this.answers.every((answer) => answer !== undefined);
    }

    checkTestCompleted(userId: string) {
        this.http
            .get<CheckTestCompletedResponse>(`/check-test-completed/${userId}`)
            .subscribe((response) => (this.testCompleted = response.testCompleted));
    }


    openErrorDialog(inf: any) {
        const dialogRef = this.dialog.open(ErrorDialogComponent, {
            data: { errorMessage: inf }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }
    createTables() {
        console.log(this.NewtableName);
        console.log(this.answersName);
        console.log(this.users_create_tables);
        this.http.post(this.adres + '/create-tables', { tableName: this.NewtableName, answersName: this.answersName, users: this.users_create_tables }, {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.token}`,
            }),
        }).subscribe(
            (res) => {
                console.log(res);
                this.openErrorDialog(res);

            },
            (err) => {
                this.openErrorDialog("Не успешно " + err);
                console.error(err);
            }
        );
    }

    addQuestion() {
        this.http.post(this.adres + '/add-question', { tableName: this.tableName1, question: this.question, option1: this.option1, option2: this.option2, option3: this.option3, option4: this.option4, option5: this.option5 }, {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.token}`,
            }),
        }).subscribe(
            (res) => {
                this.openErrorDialog(res);
                console.log(res);
            },
            (err) => {
                this.openErrorDialog("Не успешно " + err);
                console.error(err);
            }
        );
    }

    updateQuestion() {
        this.http.post(this.adres + '/update-question', { tableName: this.tableName2, questionId: this.questionId, question: this.question, option1: this.updateoption1, option2: this.updateoption2, option3: this.updateoption3, option4: this.updateoption4, option5: this.updateoption5 }, {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.token}`,
            }),
        }).subscribe(
            (res) => {
                this.openErrorDialog(res);
                console.log(res);
            },
            (err) => {
                this.openErrorDialog("Не успешно " + err);
                console.error(err);
            }
        );
    }
    getAnswers() {
        this.http.get(this.adres + '/get-ansver?tableName=' + this.tableName2, {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.token}`,
            }),
        })
            .subscribe(
                (data) => {
                    this.Ansswers = data;
                    console.log(data)
                },
                (error) => {
                    console.error(error);
                }
            );
    }
    getQuestions() {
        this.http.get(this.adres + '/get-questions?tableName=' + this.tableName2, {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.token}`,
            }),
        })
            .subscribe(
                (data) => {
                    this.Squestions = data;
                    console.log(data)
                },
                (error) => {
                    console.error(error);
                }
            );
    }
    getUsers(tableName: any) {
        this.http
            .get<User[]>(this.adres + '/users', {
                headers: new HttpHeaders({
                    Authorization: `Bearer ${this.token}`,
                }),
                params: {
                    tableName: tableName,
                },
            })
            .subscribe(
                (data) => {
                    this.users = data;

                },
                (err) => {
                    console.error(err);
                    this.openErrorDialog("Не успешно " + err);

                }
            );
    }

    createUsers() {
        // Send a POST request to the /add-user endpoint with the user data
        this.http
            .post(
                this.adres + '/add-user',
                {
                    username: this.createusername,
                    password: this.createpassword,
                    role: this.createrole,
                    tableName: this.createtableName,
                },
                {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${this.token}`,
                    })

                }
            )
            .subscribe((res) => {
                console.log(res);
                this.openErrorDialog(res);

            });
    }
    GetTables() {
        this.http.get(this.adres + '/tables', {
            headers: new HttpHeaders({
                Authorization: `Bearer ${this.token}`,
            }),
        }).subscribe(
            (data: any) => {
                this.tables = data.map((row: any) => row.table_name);
            },
            (error) => {
                // Handle error response
                console.error(error);
            }
        );
    }

    Clear(form: NgForm) {
        if (form.valid) {
            const formData = {
                tableName: form.value.tableNameClear
            };

            const headers = new HttpHeaders({
                Authorization: `Bearer ${localStorage.getItem('token')}`
            });

            this.http.post(this.adres + '/clear-table', formData, { headers }).subscribe(
                res => this.openErrorDialog(res),

                err => this.openErrorDialog("Не успешно " + err)
            );
        }
    }

}