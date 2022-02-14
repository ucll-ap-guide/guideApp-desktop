import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CreateMapComponent} from "./create-map/create-map.component";

@NgModule({
    declarations: [
        AppComponent,
        CreateMapComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppRoutingModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
