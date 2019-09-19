class Simulador 
{
    constructor(emit, _id)
    {
        this.final = 5;
        this.screen = require('./screen');
        this.cadastro = require('./cadastro');
        this.id = 0;
        this.finish_count = 0;
        this.cont = this.final-1;
        this.limit = this.final;
        this.eventEmitter = emit;
        this.id = _id;
    }
    // função que verifica a saída
    check_exit(finalizar)
    {
        if(!!finalizar) this.finish_count = this.final+1, this.cont = this.final;
        else this.finish_count++;
        if (this.finish_count >= this.limit) this.eventEmitter.emit('simula', {id: this.id, cont: this.cont});
    }
    // função de inicio
    init(e, interrupt) 
    {
        if(e) this.eventEmitter.emit('passou', {id: this.id, cont: e});
        else
        {
            this.finish_count = -1;
            this.limit = this.final;
        }
        // reiniciando o contador
        if(!interrupt) this.cont = this.final;
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
                                this.eventEmitter.emit('simula', {id: this.id, cont: this.final});
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
    get_id()
    {
        return this.id;
    }
}
module.exports = Simulador