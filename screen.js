var init_menu = () =>
{
    console.log("--- MENU ---\n [C] cadastrar novo\n [L] listar todos\n [E] executar todos os processos\n [G] gerenciador de processos");
}
var clear_menu = () =>
{
    return new Promise((res, rej) => 
    setTimeout(() => 
    {
        process.stdout.write('\033[2J');
        res(true);
    }, 500))
}
module.exports = {
    init_menu: init_menu,
    clear_menu: clear_menu
}