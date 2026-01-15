import { Component } from '@angular/core';
import { NotificationComponent } from "../notification/notification.component";
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { UserI } from '../../Interfaces/user.interface';

@Component({
  selector: 'app-navbar',
  imports: [NotificationComponent, UpperCasePipe, RouterLink, ReactiveFormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  searchQuery = new FormControl('');
  currentUser: UserI | null = null;

  categories:string[]=[
    "Notebooks",
    "PCs de Escritorio",
    "Componentes",
    "Monitores",
    "Gaming",
    "Almacenamiento",
    "Perifericos",
    "Redes",
    "Impresoras",
    "Accesorios"
  ];



  constructor(private router:Router, private authService: AuthService){
      this.authService.getCurrentUser().subscribe(user => {
        this.currentUser = user;
      });
   }

  onSearch(): void{
    const query = this.searchQuery.value?.trim();
    if (query) {
      console.log("Searching for:", query);
      this.router.navigate(['/buscar', query]);
    }
    this.searchQuery.setValue('');
  }

  logout(): void {
    this.authService.logout();
    this.currentUser = null;
    this.router.navigate(['/']);
  }


}
