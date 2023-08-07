import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import jwt_decode from 'jwt-decode';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
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


    title = 'my-app';
    showSubmitButton = true;

    constructor(private http: HttpClient, public dialog: MatDialog) { }

    ngOnInit() {
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
                            this.http
                                .get<User[]>(this.adres + '/users', {
                                    headers: new HttpHeaders({
                                        Authorization: `Bearer ${this.token}`,
                                    }),
                                })
                                .subscribe((data) => {
                                    this.users = data;
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
        // Получаем токен из localStorage
        const token = localStorage.getItem('token');

        // Отправляем запрос на сервер для изменения пароля пользователя
        this.http
            .post<{ message: string }>(
                this.adres + '/change-password',
                { username: this.EditUsername, newPassword: this.newPassword },
                {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${token}`,
                    }),
                }
            )
        this.openErrorDialog("Был изменен пользователь с именем:" + this.EditUsername + " новый пароль:" + this.newPassword)

    }
    isFormValid() {
        return this.answers.every((answer) => answer !== undefined);
    }

    checkTestCompleted(userId: string) {
        this.http
            .get<CheckTestCompletedResponse>(`/check-test-completed/${userId}`)
            .subscribe((response) => (this.testCompleted = response.testCompleted));
    }


    openErrorDialog(inf: string) {
        const dialogRef = this.dialog.open(ErrorDialogComponent, {
            data: { errorMessage: inf }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log(`Dialog result: ${result}`);
        });
    }


}
