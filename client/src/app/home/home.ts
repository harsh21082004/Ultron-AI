import { Component } from '@angular/core';
import { Sidebar } from "../Components/sidebar/sidebar";
import { ChatComponent } from '../Components/chat/chat';

@Component({
  selector: 'app-home',
  imports: [Sidebar, ChatComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

}
