import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard'

const redirectUnauthorizedToRegister = () => redirectUnauthorizedTo(['register'])
const redirectLoggedIntoList      = () => redirectLoggedInTo(['main'])

const routes: Routes = [
  {
    path: '',
    redirectTo: 'main',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'main',
    loadChildren: () => import('./pages/main/main.module').then(m => m.MainPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: redirectUnauthorizedToRegister }
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'recover-password',
    loadChildren: () => import('./pages/recover-password/recover-password.module').then(m => m.RecoverPasswordPageModule)
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'add-task',
    loadChildren: () => import('./pages/add-task/add-task.module').then(m => m.AddTaskPageModule)
  },
  {
    path: 'user-details',
    loadChildren: () => import('./pages/user-details/user-details.module').then(m => m.UserDetailsPageModule)
  },
  {
    path: 'edit-task/:id',
    loadChildren: () => import('./pages/edit-task/edit-task.module').then(m => m.EditTaskPageModule)
  },
  {
    path: 'view-task/:id',
    loadChildren: () => import('./pages/view-task/view-task.module').then(m => m.ViewTaskPageModule)
  },
  {
    path: 'user-details-edit',
    loadChildren: () => import('./pages/user-details-edit/user-details-edit.module').then( m => m.UserDetailsEditPageModule)
  }
];

routes.push({
  path: '**',
  redirectTo: 'main'
})


@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
