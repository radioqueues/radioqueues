import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QueueManagerMainWindowComponent } from './queuemanager/queue-manager-main-window.component';

const routes: Routes = [
	{
		path: '',
		component: QueueManagerMainWindowComponent
	}
];

@NgModule({
  imports: [
	  RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
