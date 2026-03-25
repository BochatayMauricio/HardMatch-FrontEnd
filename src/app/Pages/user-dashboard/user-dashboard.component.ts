import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserI } from '../../Interfaces/user.interface';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  profileForm: FormGroup;
  notificationsEnabled: boolean = true;
  private currentUser: UserI | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser) as UserI;
      this.patchProfileForm(this.currentUser);
    }

    this.authService.getCurrentUser().subscribe((user) => {
      if (!user) {
        return;
      }

      this.currentUser = user;
      this.patchProfileForm(user);
    });
  }

  private patchProfileForm(user: UserI): void {
    this.profileForm.patchValue({
      name: user.name,
      surname: user.surname,
      username: user.username,
      email: user.email,
      phone: user.phone
    });
    this.profileForm.markAsPristine();
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    const updatedUser: UserI = {
      ...this.currentUser,
      ...this.profileForm.value,
    };

    this.currentUser = updatedUser;
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.authService.currentUser.next(updatedUser);
    this.profileForm.markAsPristine();
    alert('Datos guardados en LocalStorage');
  }

  onNotificationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.notificationsEnabled = input.checked;
  }
}
