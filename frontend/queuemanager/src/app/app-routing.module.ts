import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { QueueManagerMainWindowComponent } from './component/queuemanager/queue-manager-main-window.component';
import { FileSystemService } from './service/filesystem.service';

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
	providers: [
		FileSystemService
	],
	exports: [
		RouterModule
	],
})
export class AppRoutingModule { }
