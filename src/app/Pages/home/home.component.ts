import { Component } from '@angular/core';
import { CarruselComponent } from "../../Components/carrusel/carrusel.component";
import { CardComponent } from "../../Components/card/card.component";

@Component({
  selector: 'app-home',
  imports: [CarruselComponent, CardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
