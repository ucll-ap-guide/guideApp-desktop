import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CreateMapComponent} from "./create-map/create-map.component";
import {CreateFloorComponent} from './create-floor/create-floor.component';
import {MapService} from "./map.service";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        AppComponent,
        CreateMapComponent,
        CreateFloorComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule
    ],
    providers: [MapService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
