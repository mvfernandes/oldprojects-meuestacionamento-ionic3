import { Component, ViewChild, ElementRef } from '@angular/core';
import {
  NavController, AlertController, IonicPage, NavParams,
  Events, MenuController, ToastController
} from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { DatePipe } from '@angular/common';
import { addSeconds, format } from 'date-fns';

import { PatioProvider } from '../../providers/patio/patio';
import { StateProvider } from '../../providers/state/state';

@IonicPage()
@Component({
  selector: 'page-registra-placa',
  templateUrl: 'registra-placa.html',
})
export class RegistraPlacaPage {
  @ViewChild('inputPlacaNum') inputNum: ElementRef;
  @ViewChild('inputPlacaText') inputText;

  public placaText = "";
  public placaNum = "";

  public contador = 0;

  public titlePage = "";

  public veiculos_no_patio_original: any = [];
  public veiculos_no_patio: any = [];


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alert: AlertController,
    public patio: PatioProvider,
    public state: StateProvider,
    public event: Events,
    public store: Storage,
    public datepipe: DatePipe,
    public menu: MenuController,
    public toast: ToastController,
  ) {
    event.subscribe('patio:clear_input_placa', async () => {
      this.placaNum = "";
      this.placaText = "";
    })
  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  async ionViewDidLoad() {

    this.menu.enable(false);
    const type = this.navParams.get('type') || "";
    if (type) {
      this.titlePage = type.toUpperCase();
    } else {
      this.navCtrl.setRoot('HomePage');
    }

    if (type === 'entrada') {
      setTimeout(() => {
        this.inputText.setFocus();
      }, 750);
    }
    await this.getQtdPlacas();
  }

  async getQtdPlacas() {
    const count = await this.store.get('patio') || [];
    this.veiculos_no_patio_original = count;
    this.veiculos_no_patio = count;
    this.contador = count.length;
  }

  public registerCar() {
    this.patio.insertCar((`${this.placaText}-${this.placaNum}`).toUpperCase())
  }

  handleInput(qual, text) {
    if (this.titlePage !== "SAIDA") return;

    if (qual === 1) {
      if (text === "") {
        this.veiculos_no_patio = this.veiculos_no_patio_original;
      }
      this.veiculos_no_patio = this.veiculos_no_patio_original.filter(item => item.placa.includes(text))
    }
    if (qual === 2) {
      this.veiculos_no_patio = this.veiculos_no_patio_original
        .filter(item => item.placa.replace('-', '').includes(this.placaText.concat(text)));
    }
  }

  tranformData(date = new Date()) {
    return {
      data: this.datepipe.transform(new Date(date), "dd/MM/yy"),
      hora: this.datepipe.transform(new Date(date), "HH:mm")
    }
  }

  saidaPlaca(placa) {

    const formattedTime = (seconds) => {
      let helperDate = addSeconds(new Date(0), seconds);
      return format(helperDate, 'mm:ss');
    }

    const diff_minutes = (dt2, dt1) => {
      let diff = (dt2.getTime() - dt1.getTime()) / 1000;
      diff /= 60;
      return Math.abs(Math.round(diff));
    }

    const entrada: any = new Date(placa.hora_entrada);

    const agora: any = new Date();

    const diferenca = diff_minutes(agora, entrada);
    const permanencia = formattedTime(diferenca);

    const array_valor = permanencia.split(':');
    const valor_hora = parseFloat(placa.valor) * parseFloat(array_valor[0]);

    const total = parseInt(array_valor[1]) > parseInt(placa.tolerancia) ?
      valor_hora + parseFloat(placa.valor) : valor_hora;

    this.alert.create({
      enableBackdropDismiss: false,
      cssClass: 'style-confirm-remove-placa-patio',
      title: 'Confirma saída?',
      message: `
        <label>PLACA: ${placa.placa}</label>
        <label>TIPO: ${placa.tipo}</label>
        <label ion-text color="danger">VALOR HORA: R$${placa.valor}</label>
        <label>TOLERÂNCIA: ${placa.tolerancia} minutos</label>
        <label>DATA ENTRADA: ${this.tranformData(placa.hora_entrada).data}</label>
        <label>HORA ENTRADA: ${this.tranformData(placa.hora_entrada).hora}</label>

        <label>DATA SAÍDA: ${this.tranformData().data}</label>
        <label>HORA SAÍDA: ${this.tranformData().hora}</label>

        <label>PERMANÊNCIA: ${permanencia}</label>

        <label class="negrito">TOTAL: R$ ${total.toFixed(2)}</label>
      `,
      buttons: [
        {
          text: 'CANCELAR',
          cssClass: 'style-confirm-remove-placa-patio-btn-cancel'
        },
        {
          text: "CONFIRMAR",
          handler: () => {
            this.finalizateOperation({
              ...placa,
              hora_saida: agora,
              permanencia,
              valor_pago: total.toFixed(2),
            });
          }
        }]
    }).present();
  }
  async finalizateOperation(placa) {
    const relatorio_hoje = await this.store.get('relatorio_hoje') || [];

    await this.store.set('relatorio_hoje', [
      ...relatorio_hoje,
      placa,
    ]);

    const novo_patio = await this.veiculos_no_patio_original
      .filter(item => item.placa !== placa.placa);

    await this.store.set('patio', novo_patio);

    this.veiculos_no_patio_original = novo_patio;
    this.veiculos_no_patio = novo_patio;

    this.toast.create({ message: "Saída efetuada", duration: 1000, position: 'top' }).present();
  }

  // async finalizateOperation(placa) {

  //   const data_key = this.datepipe.transform(new Date(placa.hora_saida), "dd/MM/yy");

  //   const relatorio = await this.store.get('relatorio') || [];

  //   const relatorio_ja_salvo = relatorio
  //     .find(item => item.data_key === data_key) || { list: [] };

  //   const relatorio_hoje = {
  //     data_key,
  //     list: [...relatorio_ja_salvo.list, placa]
  //   };

  //   await this.store.set('relatorio', [
  //     ...relatorio.filter(item => item.data_key !== data_key),
  //     relatorio_hoje,
  //   ]);

  //   const novo_patio = await this.veiculos_no_patio_original
  //     .filter(item => item.placa !== placa.placa);

  //   await this.store.set('patio', novo_patio);

  //   this.veiculos_no_patio_original = novo_patio;
  //   this.veiculos_no_patio = novo_patio;

  //   this.toast.create({ message: "Saída efetuada", duration: 1000, position: 'top' }).present();
  // }

}
