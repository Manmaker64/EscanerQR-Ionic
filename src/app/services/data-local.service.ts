import { Injectable } from '@angular/core';
import { Registro } from '../models/registro.model';
import { Storage } from '@ionic/storage';
import { NavController } from '@ionic/angular';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { File } from '@ionic-native/file/ngx';
import { EmailComposer } from '@ionic-native/email-composer/ngx';

@Injectable({
  providedIn: 'root'
})
export class DataLocalService {

  public guardados: Registro[];

  constructor( private storage: Storage,
               private navCtrl: NavController,
               private iab: InAppBrowser,
               private file: File,
               private emailComposer: EmailComposer ) {
    this.guardados = [];
    this.cargarRegistros();
  }

  async guardarRegistro( format: string, text: string ) {
    await this.cargarRegistros();

    const nuevoRegistro = new Registro( format, text );
    this.guardados.unshift( nuevoRegistro );
    console.log( this.guardados );
    // Guardar en el localStorage
    this.storage.set( 'registros', this.guardados);
    // Abre el tab de registros
    this.abrirRegistro( nuevoRegistro );
  }

  async cargarRegistros() {
    // Cargar los registros del localStorage
    this.guardados = await this.storage.get( 'registros' ) || [];
  }

  abrirRegistro( registro: Registro ) {
    this.navCtrl.navigateForward( '/tabs/tab2' );

    switch ( registro.type ) {
      case 'http':
        // Abrir el navegador Web
        this.iab.create( registro.text, '_system' );
        break;

        case 'geo':
          // Abrir página mapas de la aplicación
          this.navCtrl.navigateForward(`/tabs/tab2/mapa/${ registro.text }`);
          break;
        case 'vcard':
          const position = registro.text.search('http');
          const http = registro.text.substr( position );
          const url = http.split('\n');
          // Abrir el navegador Web
          this.iab.create( url[0], '_system' );
          break;
    }
  }

  enviarCorreo() {
    const arrayTemp = [];
    const titulos = 'Tipo; Formato; Creado en; Texto\n';

    arrayTemp.push( titulos );

    this.guardados.forEach( registro => {
      const fila = `${ registro.type }; ${ registro.format }; ${ registro.created }; ${ registro.text.replace(',', '') }\n`;
      arrayTemp.push( fila );
    });

    this.crearArchivoFisico( arrayTemp.join('') );
  }

  crearArchivoFisico( text: string ) {
    this.file.checkFile( this.file.dataDirectory, 'registros.csv' )
             .then( existe => {
                console.log(existe);
                return this.escribirEnArchivo( text );
             })
             .catch( async () => {
                return await this.file.createFile( this.file.dataDirectory, 'registros.csv', false )
                                      .then( () => this.escribirEnArchivo( text ) )
                                      .catch( err2 => console.log( 'No se pudo crear el archivo', err2 ) );
             });
  }

  async escribirEnArchivo( text: string ) {
    await this.file.writeExistingFile( this.file.dataDirectory, 'registros.csv', text );
    const archivo = `${this.file.dataDirectory}registros.csv`;

    const email = {
      to: 'joseramon64eclipse@gmail.com',
      attachments: [
        archivo
      ],
      subject: 'Backup Scans',
      body: 'Copia de seguridad de los Escáneres - <strong>ScanApp</strong>',
      isHtml: true
    };

    // Envía un mensaje de texto usando opciones por defecto
    this.emailComposer.open(email);
  }
}
