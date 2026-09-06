require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function test() {
    const models = await groq.models.list();

    models.data.forEach((model) => {
        console.log(model.id);
    });
}

test().catch(console.error);