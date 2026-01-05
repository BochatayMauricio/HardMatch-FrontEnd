import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { UserI } from '../../Interfaces/user.interface';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [ɵInternalFormsSharedModule, ReactiveFormsModule],
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
    role: new FormControl('Usuario', Validators.required)
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
          const user = await this.authService.login(email, password);
          if (user) {
            this.toastr.success('Inicio de sesión exitoso', 'Éxito');
            localStorage.setItem('email', JSON.stringify(email));
            this.router.navigate(['/']);
          } else {
            this.toastr.error('Credenciales inválidas', 'Error de inicio de sesión');
          }
        }
      } else {
        this.toastr.warning('Formulario de inicio de sesión no válido', 'Datos incorrectos');
      }
      this.loginForm.reset();
    }else{
      if (this.registerForm.valid) {
        const name = this.registerForm.get('name')?.value;
        const surname = this.registerForm.get('surname')?.value;
        const username = this.registerForm.get('username')?.value;
        const email = this.registerForm.get('email')?.value;
        const password = this.registerForm.get('password')?.value;
        const confirmPassword = this.registerForm.get('confirmPassword')?.value;
        const role = this.registerForm.get('role')?.value;

        if (password !== confirmPassword) {
          this.toastr.warning('Las contraseñas ingresadas no coinciden', 'Contraseñas no coinciden');
          return;
        }

        if (name && surname && username && email && password && role) {
          const newUser: UserI = {
            name,
            surname,
            username,
            email,
            password,
            role
          };

          const registeredUser = await this.authService.register(newUser);
          if (registeredUser) {
            this.toastr.success('Usuario registrado correctamente', 'Registro exitoso');
            this.isLoginMode = true;
            this.router.navigate(['/']);
          } else {
            this.toastr.error('No se pudo registrar el usuario', 'Error de registro');
          }
        }
      } else {
        this.toastr.warning('Formulario de registro no válido', 'Datos incorrectos');
      }
      this.registerForm.reset();
    }

  }



}
