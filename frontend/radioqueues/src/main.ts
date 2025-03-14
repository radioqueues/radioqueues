import { enableProdMode, isDevMode, importProvidersFrom } from '@angular/core';

import { environment } from './environments/environment';
import { AppComponent } from './app/app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { withInterceptorsFromDi, provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(
			BrowserModule,
			CommonModule,
			FormsModule,
			ServiceWorkerModule.register('ngsw-worker.js', {
	            enabled: !isDevMode(),
	            // Register the ServiceWorker as soon as the application is stable
	            // or after 30 seconds (whichever comes first).
	            registrationStrategy: 'registerWhenStable:30000'
        	})
		),
        provideHttpClient(withInterceptorsFromDi()),
		provideAnimationsAsync()
    ]
}).catch(err => console.error(err));
