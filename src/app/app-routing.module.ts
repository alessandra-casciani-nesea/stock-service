import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ErrorPageComponent } from './components/error-page/error-page.component';
import { HomepageComponent } from './components/homepage/homepage.component';
import { SentimentPageComponent } from './components/sentiment-page/sentiment-page.component';

const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'sentiment/:symbol', component: SentimentPageComponent },
  { path: '**', component: ErrorPageComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
