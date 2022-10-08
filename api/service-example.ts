// Essa é uma função de um service

updateSomething (id: number, user: User) {

    // Realiza alguma operação..

    // Isso emite para todos os users conectados naquela companhia/canal...
    this.appGateway.server
      .in(`company_base/${user.companies.at(0).company_base_id}`)
      .emit('orderUpdated', {});
}