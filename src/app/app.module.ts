import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { XFormFieldComponent } from './x-form-field.component';

@NgModule({
    declarations: [
        AppComponent,
        XFormFieldComponent
    ],
    imports: [
        BrowserModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}
