import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserDetailsEditPage } from './user-details-edit.page';

const routes: Routes = [
  {
    path: '',
    component: UserDetailsEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDetailsEditPageRoutingModule {}
