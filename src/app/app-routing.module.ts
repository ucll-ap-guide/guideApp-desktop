import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LandingPageComponent} from "./landing-page/landing-page.component";
import {CreateMapComponent} from "./create-map/create-map.component";
import {GuideDesktopComponent} from "./guide-desktop/guide-desktop.component";
import {GuideMobileComponent} from "./guide-mobile/guide-mobile.component";

// you can't use routerLink="/" for your navigation because otherwise the active tab css doesn't work
const routes: Routes = [
  {path: '', component: LandingPageComponent},
  {path: 'createMap', component: CreateMapComponent},
  {path: 'guide', component: GuideDesktopComponent},
  {path: 'guideMobile', component: GuideMobileComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
