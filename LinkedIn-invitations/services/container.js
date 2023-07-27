const { Container, decorate, injectable, inject } = require('inversify');
const Driver = require('./driver');
const Profile = require('./profile/profile');
const Message = require('./message/message');
const SfdcAccounts = require('./sfdc-accounts/sfdc-accounts');
const Mailer = require('./mailer/mailer');
const AI = require('./ai/ai');
const {Publisher, Subscriber} = require('./message-bus/message-bus');
const Network = require('./network/network')

myObj = {
    a:1,
    b:2
}
// decorate(injectable(), MyService);
// decorate(inject("MyDependency"), MyService, 0)

const container = new Container();

container.bind('prop').toConstantValue(myObj);

container.bind('driver').to(Driver);
container.bind('profile').to(Profile);
container.bind('network').to(Network)
container.bind('message').to(Message);
container.bind('sfdc-accounts').to(SfdcAccounts);
container.bind('mailer').to(Mailer);
container.bind('publisher').to(Publisher);
container.bind('subscriber').to(Subscriber);
container.bind('ai').to(AI);


module.exports = container;

