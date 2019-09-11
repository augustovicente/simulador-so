var events = require('events');
var eventEmitter = new events.EventEmitter();
// readline
const readline = require('readline');
readline.emitKeypressEvents(process.stdin);
process.stdin.setRawMode(true);
// meus modulos
const screen = require('./screen');
const simulador = require('./simulador');
const cadastro = require('./cadastro');
const gerenciador = require('./gerenciador');
// inicializando emiter
gerenciador.set_emitter(eventEmitter);
simulador.set_emitter(eventEmitter);
cadastro.set_emitter(eventEmitter);
// variáveis de controle
var is_inside_menu = false;
var submenu_atual = "";
// função de menu
var main = (ch) =>
{
    switch (ch.toLowerCase())
    {
        case 'c':
            is_inside_menu = true;
            submenu_atual = ch.toLowerCase();
            screen.clear_menu().then(() =>
            {
                cadastro.init_screen();
            });
            break;
        case 'l':
            is_inside_menu = true;
            submenu_atual = ch.toLowerCase();
            screen.clear_menu().then(() =>
            {
                cadastro.lista_processos();
            });
            break;
        case 'e':
            is_inside_menu = true;
            submenu_atual = ch.toLowerCase();
            screen.clear_menu().then(() =>
            {
                simulador.exccessao();
            });
            break;
        case 'g':
            is_inside_menu = true;
            submenu_atual = ch.toLowerCase();
            screen.clear_menu().then(() =>
            {
                gerenciador.show_screen();
            });
            break;
        default:
            console.log("Comando inválido! Tente novamente...");
            screen.clear_menu().then(()=>screen.init_menu());
            break;
    }
}
// no keypress eu verifico a situação do sistema
process.stdin.on('keypress', function (ch, key)
{
    if (!is_inside_menu)
    {
        main(ch);
    }
    else
    {
        switch (submenu_atual)
        {
            case 'c':
                cadastro.read_nome(ch, key);
                break;
            case 'l':
                cadastro.lista_processos(true);
                break;
            case 'e':
                simulador.interrupt(ch);
                break;
            case 'g':
                gerenciador.listen(ch, key);
                break;
            default:
                break;
        }
    }
});
// detecta exit de algum menu
eventEmitter.on('exit', (opt) =>
{
    console.log("Saído")
    is_inside_menu = false;
    submenu_atual = "";
    screen.clear_menu().then(()=>screen.init_menu());
});
screen.init_menu();