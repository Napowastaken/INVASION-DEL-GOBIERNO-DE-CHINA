// esto lo tenia hecho en typescript pero el puto host de mierda no lo tolera asi que me tome el trabajo de pasarlo a la cagada que es j*vascript

const { AttachmentBuilder, BaseGuildTextChannel, Client, Options} = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

class MyClient extends Client {

    constructor() {
        super({ 
            intents: 0,
            makeCache: Options.cacheWithLimits(
                Object.keys(Options.DefaultMakeCacheSettings).reduce((acc, c) => ({
                    ...acc, [c]: 0
                }), {})
            )
        });
        this.rest.setToken(process.env.TOKEN);
        this.token = process.env.TOKEN;
    }

    schedule() {
        const date = new Date();
        let timeout = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 9, 30, 0, 0) - date.getTime();
        if (timeout < 0) {
            timeout += 86400 * 1000;
        }

        setTimeout(() => { 
            this.post();
            setInterval(this.post, 86400 * 1000)
        }, timeout);
    }

    /** @param {string} text */
    async emojify(text) {
        const req = await fetch('https://api.github.com/emojis', { method: 'GET' });
        const emojis = (Object.values(await req.json())).filter(e => e.includes('unicode'));

        let emojifiedText = text.split(' ');

        for (let count = 1; count < text.length; count += Math.floor(Math.random() * 4)) {
            if (emojifiedText[count] === undefined) break;

            const emoji = emojis[Math.floor(Math.random() * emojis.length)].split('unicode/').at(-1).split('.png')[0];
            emojifiedText[count] += ' ' + String.fromCodePoint(...emoji.split('-').map(e => parseInt(e, 16)));
        }

        return emojifiedText.join(' ');
    }

    async post() {
        /** @type {fetch.Response} */
        let req;
        let text = '';

        while (text === '' || text.length > 4000) {
            req = await fetch('https://reddit.com/r/copypasta_es/hot.json?limit=50', {  method: 'GET' });
            text = (await req.json()).data.children[Math.floor(Math.random() * 50)].data.selftext;
        }

        /** @type {BaseGuildTextChannel} */
        const channel = await this.channels.fetch('1319168698132729877', {
            allowUnknownGuild: true, force: true, cache: false
        });

        const image = fs.readFileSync('src/xi jinping.jpg');
        const file = new AttachmentBuilder(image);

        await channel.send({
            content: await this.emojify(text),
            files: [file]
        });
    }

}

// aca esta la magia
new MyClient().schedule();
console.log('listo ya esta andando')