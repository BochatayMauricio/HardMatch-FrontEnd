import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserI } from '../../Interfaces/user.interface';
import { AuthService } from '../../Services/auth.service';
import { UserService } from '../../Services/user.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  showCurrentPass: boolean = false;
  showNewPass: boolean = false;
  showConfirmPass: boolean = false;
  
  notificationsEnabled: boolean = true;
  private currentUser: UserI | null = null;
  
  isSaving: boolean = false;
  isSavingPassword: boolean = false;
  isPasswordModalOpen: boolean = false;
  
  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    if (field === 'current') this.showCurrentPass = !this.showCurrentPass;
    else if (field === 'new') this.showNewPass = !this.showNewPass;
    else if (field === 'confirm') this.showConfirmPass = !this.showConfirmPass;
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    // 1. Formulario Principal
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      surname: ['', Validators.required],
      username: ['', Validators.required],
      email: [{value: '', disabled: true}, [Validators.required, Validators.email]], 
      phone: ['', Validators.required]
    });

    // 2. Formulario del Modal de Contraseña
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      // Replicamos la validación típica de Zod (ej. mínimo 6 caracteres)
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator }); // Le pasamos el validador personalizado
  }

  // Validador personalizado: Comprueba que newPassword y confirmPassword sean iguales
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  ngOnInit(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser) as UserI;
      this.patchProfileForm(this.currentUser);
    }

    this.authService.getCurrentUser().subscribe((user) => {
      if (!user) return;
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
    if (this.profileForm.invalid || !this.currentUser) return;
    this.isSaving = true;
    
    // Obtenemos los datos (incluyendo el email si usás getRawValue, o sin él con .value)
    const formData = this.profileForm.getRawValue(); 

    this.userService.updateProfile(formData).subscribe({
      next: (response) => {
        if (response.success) {
          const updatedUser: UserI = { ...this.currentUser!, ...formData };
          this.currentUser = updatedUser;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.authService.currentUser.next(updatedUser);
          this.profileForm.markAsPristine();
          alert('¡Perfil actualizado con éxito!');
        }
        this.isSaving = false;
      },
      error: (error) => {
        if (error.status === 409) {
          alert(error.error?.message || 'El nombre de usuario o teléfono ya están en uso.');
        } else {
          alert('Ocurrió un error al intentar guardar los datos.');
        }
        this.isSaving = false;
      }
    });
  }

  // --- MÉTODOS DEL MODAL DE CONTRASEÑA ---

  openPasswordModal(): void {
    this.isPasswordModalOpen = true;
    this.passwordForm.reset();
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen = false;
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) return;
    this.isSavingPassword = true;

    // Extraemos solo lo que el backend de Node.js va a necesitar (Ignoramos el confirmPassword)
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

      this.userService.updatePassword(passwordData).subscribe({
      next: (res) => {
        alert('Contraseña actualizada correctamente');
        this.closePasswordModal();
        this.isSavingPassword = false;
      },
      error: (err) => {
        alert(err.error?.message || 'Error al cambiar la contraseña (¿Contraseña actual incorrecta?)');
        this.isSavingPassword = false;
      }
    });
    
  }

  onNotificationChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.notificationsEnabled = input.checked;
  }
}