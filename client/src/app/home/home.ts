import { Component } from '@angular/core';
import { ChatComponent } from '../Components/chat/chat';

@Component({
  selector: 'app-home',
  imports: [ChatComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
