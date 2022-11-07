import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserDetailsEditPageRoutingModule } from './user-details-edit-routing.module';

import { UserDetailsEditPage } from './user-details-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserDetailsEditPageRoutingModule
  ],
  declarations: [UserDetailsEditPage]
})
export class UserDetailsEditPageModule {}
