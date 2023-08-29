import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatExpansionModule } from '@angular/material/expansion';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';
import { LoginComponent } from './login/login.component';

@NgModule( {
  declarations: [ AppComponent, ErrorDialogComponent, LoginComponent ],
  imports: [ BrowserModule, FormsModule, HttpClientModule, MatDialogModule, BrowserAnimationsModule, MatExpansionModule ],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  } ],
  bootstrap: [ AppComponent ],
} )
export class AppModule { }
