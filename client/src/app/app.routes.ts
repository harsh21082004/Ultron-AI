import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Home } from './home/home';
import { Signup } from './signup/signup';
import { Profile } from './profile/profile';
import { AuthCallbackComponent } from './auth-callback-component/auth-callback-component';

export const routes: Routes = [
    { path: 'home', redirectTo: '', pathMatch: 'full' },
    { path: 'login', component: Login, pathMatch: 'full' },
    { path: '', component: Home, pathMatch: 'full' },
    { path: 'signup', component: Signup, pathMatch: 'full' },
    { path: 'profile', component: Profile, pathMatch: 'full' },
    { path: '**', redirectTo: '', pathMatch: 'full' },
    { path: 'auth/callback', component: AuthCallbackComponent, pathMatch: 'full' },
    // { path: 'chat/:id', component: Home, pathMatch: 'full' }
];
