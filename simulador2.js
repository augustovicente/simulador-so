var eventEmitter = {on: ()=>{}};
// importando meus módulos
const screen = require('./screen');
const cadastro = require('./cadastro');
// variaveis de controle
var cont = 9, finish_count, limit = 5, id;
var set_emitter = (emit) =>
{
    eventEmitter = emit;
}
// função que verifica a saída
var check_exit = () =>
{
    finish_count++;
    if (finish_count >= limit) eventEmitter.emit('finaliza', {menu: 'e'});
}
// função de interrupção
var interrupt = (ch) =>
{
    try
    {
        throw ("Interrupção! Tecla: "+ch);
    }
    catch (e)
    {
        screen.clear_menu().then(() =>
        {
            init(e);
        });
    }
}
// função de inicio
var init = (e) => 
{
    if (e) eventEmitter.emit('simula', {id: id, cont: e});
    else
    {
        finish_count = -1;
        limit = 5;
    }
    cont = 9;
    check_exit();
}
// função de excessão
var main = async (_id) =>
{
    id = _id;
    init();
    while (finish_count < limit)
    {
        if (cont > 0 && finish_count < limit)
        {
            var p = () =>
            {
                return new Promise((res, rej) => 
                {
                    setTimeout(() =>
                    {
                        if(finish_count < limit) eventEmitter.emit('simula', {id: id, cont: cont});
                        cont -= 1;
                        res(true);
                    }, 1000);
                });
            }
            await p();
        }
        else
        {
            var p = () =>
            {
                return new Promise((res, rej) => 
                {
                    setTimeout(() => 
                    {
                        try
                        {
                            eventEmitter.emit('simula', {id: id, cont: 0});
                            throw ("Excessão!");
                        }
                        catch (e)
                        {
                            init(e);
                            res(true);
                        }
                    }, 1000);
                });
            }
            await p();
        }
    }
}
module.exports = {
    exccessao: main,
    interrupt: interrupt,
    set_emitter: set_emitter
}