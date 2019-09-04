var eventEmitter = null;
// importando meus módulos
const screen = require('./screen');
const cadastro = require('./cadastro');
// variaveis de controle
var cont = 9;
var finish_count;
var limit = 5;
var processos = cadastro.get_processos();
// recebendo limite
limit *= processos.length;
var set_emitter = (emit) =>
{
    eventEmitter = emit;
}
// função que verifica a saída
var check_exit = () =>
{
    finish_count++;
    if (finish_count >= limit) eventEmitter.emit('exit', {menu: 'e'});
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
    if (e) console.log(e);
    else
    {
        finish_count = -1;
        limit = 5;
        limit *= processos.length;
        processos = cadastro.get_processos();
    }
    cont = 9;
    var index_proc = (!finish_count || finish_count < 0) ? 0 : Math.floor(finish_count / 5);
    console.log("Simulando processo:",processos[index_proc]);    
    console.log("Pressione alguma tecla para interromper o código ou tenha uma exceção em 10 segundos");    
    check_exit();
}
// função de excessão
var main = async () =>
{
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
                        if(finish_count < limit)
                            console.log(cont);
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
                            console.log("0");
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