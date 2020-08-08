export class Registro {
    public format: string;
    public text: string;
    public type: string;
    public icon: string;
    public created: string;

    constructor( format: string, text: string ) {
        this.format = format;
        this.text = text;
        this.created = new Date().toLocaleString();
        this.determinarTipo();
    }

    private determinarTipo() {
        const inicioTexto = this.text.substr(0, 4);
        switch ( inicioTexto ) {
            case 'http':
                this.type = 'http';
                this.icon = 'globe';
                break;
            case 'geo:':
                this.type = 'geo';
                this.icon = 'pin';
                break;
            case 'BEGI':
                this.type = 'vcard';
                this.icon = 'card';
                break;
            default:
                this.type = 'No reconocido';
                this.icon = 'create';
                break;
        }
    }
}
