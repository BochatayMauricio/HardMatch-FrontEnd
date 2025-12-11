import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { SearchProductComponent } from './Pages/search-product/search-product.component';
import { LoginComponent } from './Pages/login/login.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'categoria/:category', component: SearchProductComponent },
    { path: 'buscar/:search', component: SearchProductComponent },
    {path: 'login', component:LoginComponent}
];
