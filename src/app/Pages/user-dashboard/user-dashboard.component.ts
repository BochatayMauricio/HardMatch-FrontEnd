import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserI } from '../../Interfaces/user.interface';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  users: UserI[] = [];
  profileForm: FormGroup;
  notificationsEnabled: boolean = true;
  private readonly STORAGE_KEY = 'users';

  constructor(private fb: FormBuilder) {
    // 1. Inicializamos el formulario con campos vacíos
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // 2. Leemos del localStorage
    const data = localStorage.getItem(this.STORAGE_KEY);

    if (data) {
      this.users = JSON.parse(data);
      console.log("Datos del usuario parseados:", this.users);

      for (const user of this.users) {
        console.log(user.email);
        console.log(this.users[0].email);
        if(user.email === JSON.parse(localStorage.getItem('email') || '""')){
          // 3. Encontramos el usuario actual
          this.profileForm.patchValue({
            name: user.name,
            surname: user.surname,
            username: user.username,
            email: user.email
          });
          break;
        }
      }
    } else {
      console.warn("No se encontraron datos en el localStorage bajo la clave:", this.STORAGE_KEY);
    }
  }

  onSubmitProfile() {
    if (this.profileForm.valid) {
      // 5. Guardamos los nuevos datos
      const updatedUser = { ...this.users, ...this.profileForm.value };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedUser));
      
      console.log("Datos actualizados y guardados:", updatedUser);
      alert('Datos guardados en LocalStorage');
    }
  }

  onNotificationChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.notificationsEnabled = input.checked;
    // También podrías guardar esta preferencia en otro campo del localStorage
    console.log(`Notificaciones: ${this.notificationsEnabled}`);
  }
}