class Simulador 
{
    constructor(emit, _id)
    {
        this.screen = require('./screen');
        this.cadastro = require('./cadastro');
        this.id = 0;
        this.finish_count = 0;
        this.cont = 9;
        this.limit = 5;
        this.eventEmitter = emit;
        this.id = _id;
    }
    // função que verifica a saída
    check_exit(finalizar)
    {
        if(!!finalizar) this.finish_count = 5;
        this.finish_count++;
        if (this.finish_count >= this.limit) this.eventEmitter.emit('simula', {id: this.id, cont: 'Terminado'});
    }
    // função de inicio
    init(e, interrupt) 
    {
        if(e) this.eventEmitter.emit('simula', {id: this.id, cont: e});
        else
        {
            this.finish_count = -1;
            this.limit = 5;
        }
        if(!interrupt) this.cont = 9;
        this.check_exit();
    }
    // função de interrupção
    interrupt(ch)
    {
        try
        {
            throw ("Interrupção! Tecla: "+ch);
        }
        catch(e)
        {
            this.screen.clear_menu().then(() =>
            {
                this.cont--;
                this.init(e, true);
            });
        }
    }
    // função de excessão
    async main()
    {
        this.init();
        while (this.finish_count < this.limit)
        {
            if (this.cont > 0 && this.finish_count < this.limit)
            {
                var p = () =>
                {
                    return new Promise((res, rej) => 
                    {
                        setTimeout(() =>
                        {
                            if(this.finish_count < this.limit) 
                                this.eventEmitter.emit('simula', {id: this.id, cont: this.cont});
                            this.cont -= 1;
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
                                this.eventEmitter.emit('simula', {id: this.id, cont: 10});
                                throw ("Excessão!");
                            }
                            catch (e)
                            {
                                this.init(e);
                                res(true);
                            }
                        }, 1000);
                    });
                }
                await p();
            }
        }
    }
}
module.exports = Simulador