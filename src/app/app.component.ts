import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

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
    username = '';
    password = '';
    message = "";
    errorMessage = '';
    usersNotTakenTest!: string[];
    newPassword: string = "";
    users: User[] = [];
    testCompleted: boolean = false;

    token: string | null = null;
    questions: Question[] = [];
    answers: number[] = [];
    // results: Result[] = [];
    results: Result[] = [];
    userCount: number = 0;
    usersNotCompleted: string[] = [];


    title = 'my-app';
    showSubmitButton = true;

    constructor(private http: HttpClient) { }

    ngOnInit() {
    }
    getUsersNotTakenTest() {
        if (this.username === 'admin') {
            this.http
                .get<string[]>('http://localhost:3000/usersNotTakenTest', {
                    headers: new HttpHeaders({
                        Authorization: `Bearer ${this.token}`,
                    }),
                })
                .subscribe((data) => {
                    this.usersNotTakenTest = data;
                });
        }
    }
    
    handleLogin(event: Event) {
        event.preventDefault();
        this.http
            .post<{ token: string }>('http://localhost:3000/login', { username: this.username, password: this.password })
            .subscribe((data) => {
                if (data.token) {
                    this.token = data.token;
                    if (this.username === 'admin') {
                        this.showSubmitButton = false;
                        this.http
                            .get<Result[]>('http://localhost:3000/results', {
                                headers: new HttpHeaders({
                                    Authorization: `Bearer ${this.token}`,
                                }),
                            })
                            .subscribe((data) => {
                                this.results = data; //as unknown as GroupedResults;
                            }); this.http.get<number>('http://localhost:3000/user-count', {
                                headers: new HttpHeaders({
                                    Authorization: `Bearer ${this.token}`,
                                }),
                            })
                                .subscribe((count) => {
                                    this.userCount = count;
                                }); this.http.get<string[]>('http://localhost:3000/users-not-completed', {
                                    headers: new HttpHeaders({
                                        Authorization: `Bearer ${this.token}`,
                                    }),
                                })
                                    .subscribe((users) => {
                                        this.usersNotCompleted = users;
                                    });
                        this.http.get<User[]>('http://localhost:3000/users')
                            .subscribe((users) => (this.users = users));

                    } else {
                        this.http
                            .get<Question[]>('http://localhost:3000/test', {
                                headers: new HttpHeaders({
                                    Authorization: `Bearer ${this.token}`,
                                }),
                            })
                            .subscribe((data) => {
                                this.questions = data;
                                this.answers = new Array(this.questions.length).fill(undefined);
                            }, (error) => {
                                this.showSubmitButton = false;

                                if (error.status === 500) {
                                    this.errorMessage = 'Internal server error';
                                } else
                                    if (error.status === 403) {
                                        this.errorMessage = 'You have already taken the test';
                                        
                                    } else
                                        if (error.status === 401) {
                                            this.errorMessage = 'Unauthorized: Invalid username or password.';
                                        } else {
                                            this.errorMessage = 'An error occurred while logging in. Please try again.';
                                        }
                            });
                    }
                }
            },
                (error) => {
                    this.showSubmitButton = false;

                    if (error.status === 500) {
                        this.errorMessage = 'Internal server error';
                    } else
                        if (error.status === 403) {
                            this.errorMessage = 'You have already taken the test';
                            this.showSubmitButton = false;

                        } else {
                            this.errorMessage = 'An error occurred while logging in. Please try again.';
                        }
                })
    }



    handleSubmit(event: Event) {
        event.preventDefault();
        this.http
            .post(
                'http://localhost:3000/test',
                { answers: this.answers },
                {
                    headers: new HttpHeaders({
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.token}`,
                    }),
                }
            )
        .subscribe((data) => {
            console.log(data);
           
        });

        this.message = "Спасибо за ваш ответ"
        this.token = null;
        this.questions = [];
        this.answers = [];
        // this.results = [];
        this.username = '';
        this.password = '';

    }

    changePassword(username: string, newPassword: string) {
        this.http
            .post('/change-password', { username, newPassword })
            .subscribe((response) => {
                console.log(response);
            });
    }
    isFormValid() {
        return this.answers.every((answer) => answer !== undefined);
    }
    showUsers(token: string) {
        this.http
            .get<User[]>('/users', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .subscribe((users) => (this.users = users));
    }

    checkTestCompleted(userId: string) {
        this.http
            .get<CheckTestCompletedResponse>(`/check-test-completed/${userId}`)
            .subscribe((response) => (this.testCompleted = response.testCompleted));
    }
}
