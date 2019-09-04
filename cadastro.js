var eventEmitter = null;
var nome = "";
var processos = [];
var set_emitter = (emit) =>
{
    eventEmitter = emit;
}
var get_processos = () =>
{
    return processos;
}
var lista_processos = (exit) =>
{
    if(!!exit) eventEmitter.emit('exit', {menu: 'l'}); 
    else console.log(processos.join('\n'));
}
var read_nome = (ch, key) =>
{
    if(key.name != 'return')
    {
        nome += ch;
        process.stdout.write(ch);
    }
    else
    {
        processos.push(nome);
        process.stdout.write('\n');
        nome = "";
        eventEmitter.emit('exit', {menu: 'c'});
    }
}
var init_screen = () =>
{
    console.log("Digite o nome e pressione Enter:");    
}
module.exports = {
    read_nome: read_nome,
    set_emitter: set_emitter,
    init_screen:  init_screen,
    get_processos: get_processos,
    lista_processos: lista_processos
}