import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToolkitComponent } from './toolkit/toolkit.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule } from '@angular/common/http';
import { OutputComponent } from './toolkit/output/output.component';
import { HrefDataDirective } from './toolkit/output/href-data.directive';
import { LocalModelComponent } from './toolkit/local-model/local-model.component';
import { PlotsComponent } from './toolkit/plots/plots.component';

@NgModule({
  declarations: [
    AppComponent,
    ToolkitComponent,
    HeaderComponent,
    OutputComponent,
    HrefDataDirective,
    LocalModelComponent,
    PlotsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
