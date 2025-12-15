import { HomeComponent } from './Pages/home/home.component';
import { SearchProductComponent } from './Pages/search-product/search-product.component';
import { LoginComponent } from './Pages/login/login.component';
import { UserDashboardComponent } from './Pages/user-dashboard/user-dashboard.component';
import { UserPurchasesComponent } from './Pages/user-purchases/user-purchases.component';

export const routes = [
    { path: '', component: HomeComponent },
    { path: 'categoria/:category', component: SearchProductComponent },
    { path: 'buscar/:search', component: SearchProductComponent },
    {path: 'login', component:LoginComponent},
    {path: 'perfil', component: UserDashboardComponent},
    {path: 'mis-compras', component: UserPurchasesComponent},
    {path: '**', redirectTo: '' },

];
