import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { RegistraPlacaPage } from './registra-placa';

@NgModule({
  declarations: [
    RegistraPlacaPage,
  ],
  imports: [
    IonicPageModule.forChild(RegistraPlacaPage),
  ],
})
export class RegistraPlacaPageModule {}
