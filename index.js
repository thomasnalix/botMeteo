const token = process.env.BOT_TOKEN;
const blagues = require('./messages.json');
const { Events, Client, GatewayIntentBits } = require('discord.js');
const meteo = require('./temps.json')
const tokenApi = process.env.API_TOKEN;

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});


function getRandom() {
    return blagues[Math.floor(Math.random() * blagues.length)];
}

client.on(Events.MessageCreate, async message => {
    let contentMessage = message.content.toLowerCase();
    let jokeCommands = ['!bl', '!blague', '!joke', '!j', '!jok'];
    if (jokeCommands.includes(contentMessage)) {
        let blague = getRandom();
        // client.users.fetch('555').then((user) => {
        //     user.send({
        //         embeds: [{
        //             title: blague.intitule,
        //             description: blague.reponse,
        //             tts: true,
        //             color: 0x00FFFF
        //         }]
        //     });
        // })
        message.channel.send({
            embeds: [{
                title: blague.intitule,
                description: blague.reponse,
                tts: true,
                color: Math.floor(Math.random() * 16777215)
            }]
        });
    } else if (contentMessage.substring(0, contentMessage.indexOf(' ')) === '!met') {
        let ville = contentMessage.substring(contentMessage.indexOf(' ') + 1, contentMessage.length)
        const villeObj = await getVilleObj(ville);
        if (villeObj.cities.length === 0) {
            message.channel.send({
                embeds: [{
                    title: 'Aucune ville trouvée',
                    description: 'Aucune ville ne correspond à votre recherche. Veuillez réessayer.',
                    color: 16711680
                }]
            });
            return;
        }
        let urlForecast = 'https://api.meteo-concept.com/api/forecast/daily/0?token=' + tokenApi + '&insee=' + villeObj.cities[0].insee;
        const daily = await fetch(urlForecast).then((response) => response.json());
        message.channel.send({
            embeds: [{
                title: 'Metéo à ' + villeObj.cities[0].name + ' (' + villeObj.cities[0].cp + ')',
                description: 'Voici les prévisions météorologique pour ' + villeObj.cities[0].name + ' jusqu\'à ce soir 23h59.',
                color: 22015,
                fields: [
                    {
                        name: 'Temps',
                        value: meteo[daily.forecast.weather].intitule,
                    },
                    {
                        name: 'Températures',
                        value: daily.forecast.tmin + '°C à ' + daily.forecast.tmax + '°C'
                    },
                    {
                        name: 'Probabilité de pluie',
                        value: daily.forecast.probarain + '%'
                    },
                    {
                        name: 'Vent moyen',
                        value: daily.forecast.wind10m + 'km/h'
                    }
                ]
            }]
        });
    } else if (contentMessage.substring(0, contentMessage.indexOf(' ')) === '!meteo') {
        let ville = contentMessage.substring(contentMessage.indexOf(' ') + 1, contentMessage.length)
        const villeObj = await getVilleObj(ville);
        if (villeObj.cities.length === 0) {
            message.channel.send({
                embeds: [{
                    title: 'Aucune ville trouvée',
                    description: 'Aucune ville ne correspond à votre recherche. Veuillez réessayer.',
                    color: 16711680
                }]
            });
            return;
        }
        const urlForecast = 'https://api.meteo-concept.com/api/forecast/daily/0?token=' + tokenApi + '&insee=' + villeObj.cities[0].insee;
        const daily = await fetch(urlForecast).then((response) => response.json());
        message.channel.send({
            embeds: [{
                title: 'Metéo à ' + villeObj.cities[0].name + ' (' + villeObj.cities[0].cp + ')',
                description: 'Voici les prévisions météorologique pour ' + villeObj.cities[0].name + ' jusqu\'à ce soir 23h59.',
                color: 16766208,
                fields: [
                    {
                        name: 'Temps',
                        value: meteo[daily.forecast.weather].intitule,
                    },
                    {
                        name: 'Températures',
                        value: daily.forecast.tmin + '°C à ' + daily.forecast.tmax + '°C'
                    },
                    {
                        name: 'Pluie',
                        value: '__Probabilité :__ ' + daily.forecast.probarain +
                            '%\n__Cumul :__ ' + daily.forecast.rr10 +
                            'mm\n__Cumul max :__ ' + daily.forecast.rr1 + 'mm'
                    },
                    {
                        name: 'Vent',
                        value: '__Vitesse :__ ' + daily.forecast.wind10m +
                            'km/h\n__Direction__: ' + daily.forecast.dirwind10m + '°'
                    },
                    {
                        name: 'Rafales',
                        value: '__Vitesse :__ ' + daily.forecast.gust10m + 'km/h'
                    },
                    {
                        name: 'Climat',
                        value: '__Temps d\'ensoleillement :__ ' + daily.forecast.sunHours +
                            'h\n__Cumul d\'évapotranspiration :__ ' + daily.forecast.etp +
                            'mm\n__Probabilité de gel :__ ' + daily.forecast.probafrost +
                            '%\n__Probabilité de brouillard :__ ' + daily.forecast.probafog + '%'
                    },
                ]
            }]
        });
    }
});

client.login(token);

function getVilleObj(ville) {
    let url = 'https://api.meteo-concept.com/api/location/cities?token=' + tokenApi + '&search=' + ville;
    return fetch(url).then((response) => response.json());
}

