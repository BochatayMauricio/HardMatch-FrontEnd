import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { UserI } from '../../Interfaces/user.interface';
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
          } catch (error:any) {
            const errorMsg = error.error?.error?.message || 'Credenciales inválidas';
            this.toastr.error(errorMsg, 'Error');
          }
        }
      } else {
        this.toastr.warning('Formulario de inicio de sesión no válido', 'Datos incorrectos');
      }
      // this.loginForm.reset();
    }else{
      if (this.registerForm.valid) {
        const name = this.registerForm.get('name')?.value;
        const surname = this.registerForm.get('surname')?.value;
        const username = this.registerForm.get('username')?.value;
        const email = this.registerForm.get('email')?.value;
        const password = this.registerForm.get('password')?.value;
        const confirmPassword = this.registerForm.get('confirmPassword')?.value;
        const role = this.registerForm.get('role')?.value;
        const phone = this.registerForm.get('phone')?.value;

        if (password !== confirmPassword) {
          this.toastr.warning('Las contraseñas ingresadas no coinciden', 'Contraseñas no coinciden');
          return;
        }

        if (name && surname && username && email && password && phone) {
          const newUser: any = {
            name,
            surname,
            username,
            email,
            password,
            phone
          };
          try {
            const registeredUser = await this.authService.register(newUser);
            if (registeredUser) {
              this.toastr.success('Usuario registrado correctamente', 'Registro exitoso');
              this.isLoginMode = true; // Lo pasamos al login
              this.registerForm.reset(); // Limpiamos el form
            }
          } catch (error: any) {
            // Manejo de errores hiper específico
            if (error.error?.error?.validationErrors) {
              // Si fue error de Zod (400)
              const mensajes = error.error.error.validationErrors.map((e: any) => e.message).join('<br>');
              this.toastr.error(mensajes, 'Revisa los datos', { enableHtml: true });
            } else {
              // Si fue error de Duplicado (409) u otro
              const errorMsg = error.error?.error?.message || 'No se pudo registrar el usuario';
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
