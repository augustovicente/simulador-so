var Simulador = require('./simulador-class');
var eventEmitter = {on: ()=>{}};
const cadastro = require('./cadastro');
var simulador = [], procs = [], cmd = "", warning = "";
var load_process = ()=>
{
    procs = cadastro.get_processos().map((p, i)=>
    {
        simulador[i] = new Simulador(eventEmitter, i);
        simulador[i].main();
        return {
            nome: p,
            estado: "INICIO    ",
            cont: 0,
            id: ("0"+i).slice(-2)
        }
    });
}
var show_screen = ()=>
{
    // verifica se o processo foi carregado
    if(!procs.length) load_process();
    // vendo se tem alguma mensagem de erro
    var m = (!!warning)?warning:"";
    console.log(m+"\nPROCESSO         |ID|ESTADO    |CONTADOR");
    procs.forEach((proc)=>
    {
        // preenchendo de espaços caso menor
        var len = 17 - proc.nome.length, space = "";
        if(len > 0)
        {
            for (len == 0; len--;) 
            {
                space += " ";
            }
        }
        var nome = (proc.nome.length > 17)?proc.nome.substring(0,14)+"...":proc.nome+space;
        var contador = ((proc.cont == 0)?10:proc.cont);
        console.log(nome+"|"+proc.id+"|"+proc.estado+"|"+contador);
    });
    console.log("\n\n[K+ID] FINALIZAR PROCESSO\n[I+ID] INTERROMPER PROCESSO\n[E] SAIR");
}
// detecta keys do simulador
var listen = (ch, key)=>
{
    if(ch == "e")
    {
        simulador.forEach((s)=>
        {
            s.check_exit(true);
        })
        eventEmitter.emit('exit', {menu: 'g'})
    }
    else 
    {
        cmd += ch;
        if(cmd.length == 3)
        {
            if(cmd[0] == "k")
            {
                simulador[parseInt(cmd.slice(-2))].check_exit(true);
                cmd = "";
            }
            else if(cmd[0] == "i")
            {
                simulador[parseInt(cmd.slice(-2))].interrupt(ch);
                cmd = "";
            }
            else 
            {
                warning = "Comando inválido!";
                show_screen();
            }
        }
    }
}
var set_emitter = (emit) =>
{
    eventEmitter = emit;
    eventEmitter.on('simula', (opt) =>
    {
        procs = procs.map((p)=>
        {
            if(parseInt(p.id) == opt.id)
            {
                p.cont = opt.cont;
            }
            return p;
        });
        show_screen();
    });
}
module.exports = {
    set_emitter: set_emitter,
    show_screen: show_screen,
    listen: listen
}