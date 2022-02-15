import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CreateMapComponent} from "./create-map/create-map.component";
import {CreateFloorComponent} from './create-floor/create-floor.component';

@NgModule({
    declarations: [
        AppComponent,
        CreateMapComponent,
        CreateFloorComponent
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
