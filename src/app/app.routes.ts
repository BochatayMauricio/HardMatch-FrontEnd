import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { SearchProductComponent } from './Pages/search-product/search-product.component';
import { LoginComponent } from './Pages/login/login.component';
import { UserDashboardComponent } from './Pages/user-dashboard/user-dashboard.component';
import { UserPurchasesComponent } from './Pages/user-purchases/user-purchases.component';
import { AdminDashboardComponent } from './Pages/admin-dashboard/admin-dashboard.component';
import { UserFavoritesComponent } from './Pages/user-favorites/user-favorites.component';
import { StoreProfileComponent } from './Pages/store-profile/store-profile.component';
import { ComparativesComponent } from './Pages/comparatives/comparatives.component';
import { ViewProductDetailsComponent } from './Pages/view-product-details/view-product-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'categoria/:category', component: SearchProductComponent },
  { path: 'buscar/:search', component: SearchProductComponent },
  { path: 'login', component: LoginComponent },
  { path: 'perfil', component: UserDashboardComponent },
  { path: 'mis-compras', component: UserPurchasesComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'favoritos', component: UserFavoritesComponent },
  { path: 'stores/:name', component: StoreProfileComponent },
  { path: 'comparativas', component: ComparativesComponent },
  { path: 'producto/:id', component: ViewProductDetailsComponent },
  { path: '**', redirectTo: '' },
];
