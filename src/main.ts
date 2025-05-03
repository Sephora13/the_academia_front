import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(SocketIoModule.forRoot(config))
  ],
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
