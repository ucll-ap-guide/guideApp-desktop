import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CreateMapComponent} from "./create-map/create-map.component";

// you can't use routerLink="/" for your navigation because otherwise the active tab css doesn't work
const routes: Routes = [
  {path: '', component: CreateMapComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
