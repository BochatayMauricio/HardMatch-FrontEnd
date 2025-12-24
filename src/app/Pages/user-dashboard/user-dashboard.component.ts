import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


const STATIC_USER = {
    id: 1,
    name: 'Carolina',
    surname: 'Gómez',
    email: 'carolina.gomez@techshop.com',
    username: 'caroGomez',
    role: 'Cliente',
    createdAt: new Date('2024-03-10T11:00:00'),
    updatedAt: new Date('2025-12-11T09:15:00')
};

@Component({
  selector: 'app-user-dashboard',
  imports: [
    ReactiveFormsModule
],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})

export class UserDashboardComponent implements OnInit{
// Usamos el tipo any o la interfaz UserI si está importada
  user: any = STATIC_USER; 
  profileForm: FormGroup;
  notificationsEnabled: boolean = true;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: [this.user.name, Validators.required],
      surname: [this.user.surname, Validators.required],
      username: [this.user.username, Validators.required],
      email: [this.user.email, [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmitProfile() {
    if (this.profileForm.valid) {
      // Simulación de actualización de datos estáticos
      const updatedUser = { ...this.user, ...this.profileForm.value };
      console.log('Datos ficticios a guardar:', updatedUser);
      this.user = updatedUser; // Actualiza el objeto local
      alert('Perfil actualizado (Simulación Estática)');
      this.profileForm.markAsPristine();
    }
  }
  
  onNotificationChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.notificationsEnabled = input.checked;
    console.log(`Notificaciones por email: ${this.notificationsEnabled ? 'Activadas' : 'Desactivadas'}`);
  }
}