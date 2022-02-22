import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {CreateMapComponent} from "./create-map/create-map.component";
import {CreateFloorComponent} from './create-floor/create-floor.component';
import {MapService} from "./map.service";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";
import {DialogBoxComponent} from './dialog-box/dialog-box.component';
import {ToastrModule} from "ngx-toastr";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
    declarations: [
        AppComponent,
        CreateMapComponent,
        CreateFloorComponent,
        DialogBoxComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AppRoutingModule,
        HttpClientModule,
        FormsModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
    ],
    providers: [MapService],
    bootstrap: [AppComponent]
})
export class AppModule {
}
