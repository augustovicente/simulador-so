let Simulador = require('./simulador-class');
let eventEmitter = {on: ()=>{}};
const cadastro = require('./cadastro');
var simulador = [], procs = [], cmd = "", warning = "", backup_simulador = [], fila_inicio = [], fila_pronto = [], is_ready_to_exec = false, proc_atual = [];
let do_backup = ()=>
{
    backup_simulador = simulador;
};
let trocar_estados = ()=>
{
    // caso já tenha algum processo pronto
    if(!!is_ready_to_exec)
    {
        // recebendo primeiro da fila e removendo da primeira posição
        proc_atual = fila_pronto.splice(0,1);
        procs[proc_atual.id].estado = "EXECUÇÃO  ";
        // executando
        proc_atual.main();
        // adicinando na fila de pronto outro processo
        if(!!fila_inicio.length)
        {
            fila_pronto.push(fila_inicio.splice(0,1));
        }
    }
    else
    {
        let p = new Promise((res, rej)=>
        {
            proc_atual = fila_inicio.splice(0,1);
            procs[proc_atual.id].estado = "PRONTO    ";            
            fila_pronto.push(proc_atual);
            is_ready_to_exec = true;
            setTimeout(() =>
            {
                res();
            }, 3000);
        })
        await p();
        trocar_estados();
    }
};
let load_process = ()=>
{
    procs = cadastro.get_processos().map((p, i)=>
    {
        simulador[i] = new Simulador(eventEmitter, i);
        fila_inicio.push(simulador[i]);
        return {
            nome: p,
            estado: "INICIO    ",
            cont: 0,
            id: ("0"+i).slice(-2)
        };
    });
    // todo: iniciar troca de estados
    trocar_estados();
    do_backup();
}
let show_screen = ()=>
{
    // verifica se o processo foi carregado
    if(!procs.length) load_process();
    // vendo se tem alguma mensagem de erro
    var m = (!!warning)?warning:"";
    process.stdout.write('\033[2J');
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
        var contador = ((proc.cont == 0)?5:proc.cont);
        console.log(nome+"|"+proc.id+"|"+proc.estado+"|"+contador);
    });
    console.log("\n\n[K+ID] FINALIZAR PROCESSO\n[I+ID] INTERROMPER PROCESSO\n[E] SAIR");
}
// detecta keys do simulador
let listen = (ch, key)=>
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
let set_emitter = (emit) =>
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
    do_backup();
}
module.exports = {
    set_emitter: set_emitter,
    show_screen: show_screen,
    listen: listen
}