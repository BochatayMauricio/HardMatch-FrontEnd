import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { ResponseLoginErrorPayload } from '../../Interfaces/response-login.interface';
import { UserRegisterI } from '../../Interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';
import { NavbarLoginComponent } from '../../Components/navbar-login/navbar-login.component';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    NavbarLoginComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  isLoginMode: boolean = true;
  
  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  registerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
    role: new FormControl('Usuario', Validators.required),
    phone: new FormControl('', Validators.required),
    isActive: new FormControl(true)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  private getBackendErrorPayload(error: unknown): ResponseLoginErrorPayload {
    if (error instanceof HttpErrorResponse && error.error) {
      return error.error as ResponseLoginErrorPayload;
    }
    return {};
  }

  async onSubmit(): Promise<void> {
    if(this.isLoginMode){
      if (this.loginForm.valid) {
        const email = this.loginForm.get('email')?.value;
        const password = this.loginForm.get('password')?.value;
        if (email && password) {
          try {
            const user = await this.authService.login(email, password);
            if (user) {
              this.toastr.success('Inicio de sesión exitoso', 'Éxito');
              localStorage.setItem('email', JSON.stringify(email));
              this.router.navigate(['/']);
            } else {
              this.toastr.error('Credenciales inválidas', 'Error de inicio de sesión');
            }
          } catch (error: unknown) {
            const payload = this.getBackendErrorPayload(error);
            const errorMsg = payload.error?.message || 'Credenciales inválidas';
            this.toastr.error(errorMsg, 'Error');
          }
        }
      } else {
        this.toastr.warning('Formulario de inicio de sesión no válido', 'Datos incorrectos');
      }
    }else{
      if (this.registerForm.valid) {
        const name = this.registerForm.get('name')?.value;
        const surname = this.registerForm.get('surname')?.value;
        const username = this.registerForm.get('username')?.value;
        const email = this.registerForm.get('email')?.value;
        const password = this.registerForm.get('password')?.value;
        const confirmPassword = this.registerForm.get('confirmPassword')?.value;
        const phone = this.registerForm.get('phone')?.value;

        if (password !== confirmPassword) {
          this.toastr.warning('Las contraseñas ingresadas no coinciden', 'Contraseñas no coinciden');
          return;
        }

        if (name && surname && username && email && password && phone) {
          const newUser: UserRegisterI = {
            name,
            surname,
            username,
            email,
            password,
            phone,
          };
          try {
            const registeredUser = await this.authService.register(newUser);
            if (registeredUser) {
              this.toastr.success('Usuario registrado correctamente', 'Registro exitoso');
              this.isLoginMode = true;
              this.registerForm.reset();
            }
          } catch (error: unknown) {
            if (error instanceof HttpErrorResponse && error.status === 409) {
              this.toastr.warning(
                'Ya existe un usuario con ese email o nombre de usuario',
                'Registro duplicado'
              );
              return;
            }

            const payload = this.getBackendErrorPayload(error);
            const validationErrors = payload.error?.validationErrors;

            if (validationErrors?.length) {
              const mensajes = validationErrors.map((e) => e.message).join('<br>');
              this.toastr.error(mensajes, 'Revisa los datos', { enableHtml: true });
            } else {
              const errorMsg = payload.error?.message || 'No se pudo registrar el usuario';
              this.toastr.error(errorMsg, 'Error de registro');
            }
          }
        }
      } else {
        this.toastr.warning('Formulario de registro no válido', 'Datos incorrectos');
      }
    }
  }
}

