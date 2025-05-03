import { Component } from '@angular/core';
import { SignInComponent } from './sign-in/sign-in.component';
import { RouterOutlet } from '@angular/router';
import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';
import { HttpClientModule } from '@angular/common/http';


const config: SocketIoConfig = { url: 'https://votre-backend', options: {} };
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,
    SignInComponent,
    SocketIoModule.forRoot(config)
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'academia_front';
}

