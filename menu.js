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
// inicializando emiter
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
            screen.clear_menu().then(() =>
            {
                is_inside_menu = true;
                submenu_atual = ch.toLowerCase();
                cadastro.init_screen();
            });
            break;
        case 'l':
            screen.clear_menu().then(() =>
            {
                is_inside_menu = true;
                submenu_atual = ch.toLowerCase();
                cadastro.lista_processos();
            });
            break;
        case 'e':
            screen.clear_menu().then(() =>
            {
                is_inside_menu = true;
                submenu_atual = ch.toLowerCase();
                simulador.exccessao();
            });
            break;
        case 'g':
            screen.clear_menu().then(() =>
            {
                is_inside_menu = true;
                submenu_atual = ch.toLowerCase();
                // simulador.exccessao();
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
                // simulador.interrupt(ch);
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