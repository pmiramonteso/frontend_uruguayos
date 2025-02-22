import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as L from 'leaflet';
(window as any).L = L;

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
