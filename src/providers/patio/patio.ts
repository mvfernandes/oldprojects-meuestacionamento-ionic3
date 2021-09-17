import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Storage } from '@ionic/storage';
import { AlertController, Events, ToastController } from 'ionic-angular';

@Injectable()
export class PatioProvider {

  public patio: any = [];

  public old_patio: any;

  categorias = [
    { tipo: "CARRO", valor: "5.00", modo_pagamento: 'saida', tolerancia: 20 },
    { tipo: "MOTO", valor: "2.50", modo_pagamento: 'saida', tolerancia: 15 },
    { tipo: "TÁXI", valor: "0.00", modo_pagamento: 'saida', tolerancia: 0 },
    { tipo: "ENTREGA", valor: "0.00", modo_pagamento: 'saida', tolerancia: 0 },
  ];

  constructor(
    public datepipe: DatePipe,
    public store: Storage,
    public alertCtrl: AlertController,
    public event: Events,
    public toast: ToastController,
  ) {
  }

  public async getQuantidadeVagas() {
    return (await this.store.get('quantidade_vagas')) || 10;
  }
  public async setQuantidadeVagas(qtd = 10) {
    this.store.set('quantidade_vagas', qtd);
  }

  public async getCategoriasVeiculos() {
    return (await this.store.get('categorias_veiculos')) || this.categorias;
  }
  public async setCategoriasVeiculos(array = []) {
    this.store.set('categorias_veiculos', array);
  }

  showAlerta(msg = "") {
    this.alertCtrl.create({
      message: msg,
      buttons: ['ok']
    }).present()
  }

  public async insertCar(placa) {

    this.old_patio = await this.store.get('patio') || [];

    if (this.old_patio.find(item => item.placa === placa)) {
      this.showAlerta("Placa já está no pátio");
      this.event.publish('patio:clear_input_placa');
      return;
    }

    await this.showTipoAuto(placa);
  }

  public async tipoSelecionado(tipo) {

    this.patio = [...this.old_patio, tipo];
    this.store.set('patio', this.patio);

    this.toast.create({
      message: "Registrado",
      duration: 750,
      position: "top"
    }).present();
    this.event.publish('patio:clear_input_placa');
  }

  public async showTipoAuto(placa) {
    let alert = this.alertCtrl.create({
      enableBackdropDismiss: false,
      cssClass: 'style-confirm-remove-placa-patio',
      title: "Qual o tipo de veículo?",
      buttons: [
        {
          text: 'Cancelar',
          cssClass: 'color-danger',
        }
      ]
    });

    const categorias = await this.store.get('categorias_veiculos') || this.categorias;

    let isvisible_btn_Continuar = false;

    const addBtns = () => {
      return alert.addButton({
        text: 'Continuar',
        handler: data => {
          if (data) {
            const item = categorias[parseInt(data)];
            this.tipoSelecionado({ ...item, placa, hora_entrada: new Date() });
          }
        }
      });
    }

    categorias.forEach((item, index) => {
      alert.addInput({
        type: 'radio',
        // label: item.tipo + ' - R$' + item.valor + ' - Tolerância: ' + item.tolerancia + ' min.',
        label: `${item.tipo} - R$ ${item.valor} \n Tolerância: ${item.tolerancia} min.`,
        value: index.toString(),
        checked: false,
        handler: () => {
          if (!isvisible_btn_Continuar) {
            isvisible_btn_Continuar = true;
            addBtns();
          }
        }
      });
    });

    alert.present();
  }

}
