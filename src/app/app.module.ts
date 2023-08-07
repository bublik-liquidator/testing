import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [AppComponent, ErrorDialogComponent],
  imports: [BrowserModule, FormsModule,HttpClientModule,MatDialogModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
