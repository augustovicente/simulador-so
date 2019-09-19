let Simulador = require('./simulador-class');
let eventEmitter = {on: ()=>{}};
const cadastro = require('./cadastro');
var simulador = [], procs = [], cmd = "", warning = "";
let fila_inicio = [], fila_pronto = [], fila_terminado = [], is_ready_to_exec = false, proc_atual = null, proc_espera = null;
let trocar_estados = ()=>
{
    // caso já tenha algum processo pronto
    if(!!is_ready_to_exec)
    {
        // se tiver algum processo em espera, envia para fila de pronto
        if(!!proc_espera)
        {
            procs[proc_espera.id].estado = "PRONTO    ";
            fila_pronto.push(proc_espera);
            proc_espera = null;
        }
        // se tiver algum processo em execução, envia para espera
        if(!!proc_atual)
        {
            proc_espera = proc_atual;
            proc_espera.check_exit(true);
            procs[proc_espera.id].estado = "ESPERA    ";
            proc_atual = null;
        }
        // recebendo primeiro da fila e removendo da primeira posição
        if(fila_pronto.length)
        {
            proc_atual = fila_pronto.splice(0,1)[0];
            procs[proc_atual.id].estado = "EXECUÇÃO  ";
            // executando
            proc_atual.main();
        }
        // adicinando na fila de pronto outro processo
        if(!!fila_inicio.length)
        {
            let p_ini = fila_inicio.splice(0,1)[0]
            procs[p_ini.id].estado = "PRONTO    ";
            fila_pronto.push(p_ini);
        }
    }
    else
    {
        let p = new Promise((res, rej)=>
        {
            let p_ini = fila_inicio.splice(0,1)[0];
            procs[p_ini.id].estado = "PRONTO    ";
            fila_pronto.push(p_ini);
            is_ready_to_exec = true;
            setTimeout(() =>
            {
                res();
            }, 3000);
        });
        p.then(()=>trocar_estados());
    }
};
let load_process = ()=>
{
    fila_inicio = [], fila_pronto = [], fila_terminado = [], is_ready_to_exec = false, proc_atual = null, proc_espera = null, cmd = "";
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
    trocar_estados();
}
let show_screen = ()=>
{
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
        if(!!proc_atual) proc_atual.check_exit(true);
        if(!!proc_espera) proc_espera.check_exit(true);
        if(!!fila_pronto.length) fila_pronto.forEach((s)=>s.check_exit(true));
        if(!!fila_inicio.length) fila_inicio.forEach((s)=>s.check_exit(true))
        eventEmitter.emit('exit', {menu: 'g'})
    }
    else 
    {
        cmd += ch;
        if(cmd.length == 3)
        {
            if(cmd[0] == "k")
            {
                // procurando o processo nas filas
                let a = null, b = null;
                fila_pronto.forEach((p, i)=>
                {
                    (p.id == parseInt(cmd.slice(-2)))?a = i:"";
                });
                fila_inicio.forEach((p, i)=>
                {
                    (p.id == parseInt(cmd.slice(-2)))?b = i:"";
                });
                // se estiver na fila de início
                if(b != null)
                {
                    console.log("inicio")
                    // remove da fila_inicio, finaliza, coloca como terminado e adiciona aos terminados
                    let _proc = fila_inicio.splice(b, 1)[0];
                    _proc.check_exit(true);
                    procs[_proc.id].estado = "TERMINADO ";
                    fila_terminado.push(_proc);
                    trocar_estados();
                }
                // se estiver na fila de pronto
                else if(a != null)
                { 
                    console.log("pronto")
                    // remove da fila_pronto, finaliza, coloca como terminado e adiciona aos terminados
                    let _proc = fila_pronto.splice(a, 1)[0];
                    _proc.check_exit(true);
                    procs[_proc.id].estado = "TERMINADO ";
                    fila_terminado.push(_proc);
                    trocar_estados();
                }
                // se estiver em execução
                else if(!!proc_atual && proc_atual.id == parseInt(cmd.slice(-2)))
                {
                    console.log("exec")
                    // finaliza, coloca como terminado, adiciona aos terminados, zera o atual e roda os estados
                    proc_atual.check_exit(true);
                    procs[proc_atual.id].estado = "TERMINADO ";
                    fila_terminado.push(proc_atual);
                    proc_atual = null;
                    trocar_estados();
                }
                // se estiver em espera
                else if(!!proc_espera && proc_espera.id == parseInt(cmd.slice(-2)))
                {
                    console.log("esp")
                    proc_espera.check_exit(true);
                    // finaliza, coloca como terminado, adiciona aos terminados, zera o atual e roda os estados
                    proc_espera.check_exit(true);
                    procs[proc_espera.id].estado = "TERMINADO ";
                    fila_terminado.push(proc_espera);
                    proc_espera = null;
                    trocar_estados();
                }
                cmd = "";
                show_screen();
            }
            else if(cmd[0] == "i")
            {
                simulador[parseInt(cmd.slice(-2))].interrupt(ch);
                cmd = "";
            }
            else 
            {
                warning = "Comando inválido!";
                cmd = "";
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
    eventEmitter.on('passou', (opt) =>
    {
        trocar_estados();
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
    load_process: load_process,
    listen: listen
}