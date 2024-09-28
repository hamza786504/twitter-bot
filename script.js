require("dotenv").config({ path: __dirname + "/.env" });
const { TwitterApi } = require("twitter-api-v2");

// Initialize the Twitter clients
const client = new TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET,
});

const bearer = new TwitterApi(process.env.BEARER_TOKEN);
const twitterClient = client.readWrite;

async function generateTweetContent() {
    try {
        console.log("Generating tweet content...");

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OpenaiApiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a social service writer helping people access low-income social services named Angel and this is your twitter profile.",
                    },
                    {
                        role: "user",
                        content: `Write an engaging tweet following the things below: 1- Just write the tweet, don't write anything else. 2- Don't Exceed 270 characters. 3- Don't use quotation marks. 4- Use 3 relevant hashtags. 5- Don't Use Emojis. 6- Only Promote Angel.io in every post that includes a link. 7- Start the tweet from the word 'Huroku'`,
                    },
                ],
                max_tokens: 70,
                temperature: 0.7,
                top_p: 1,
            }),
        });

        const result = await response.json();
        if (response.ok) {
            const tweetContent = result.choices[0].message.content.trim();
            return tweetContent;
        } else {
            console.error(`Error from OpenAI: ${result.error.message}`);
            return null;
        }
    } catch (error) {
        console.error("An error occurred:", error);
        return null;
    }
}


async function postTweet(content) {
    try {
        const newTweet = await twitterClient.v2.tweet(content);
        console.log("New Tweet Posted:", content);
    } catch (error) {
        console.error("Error posting tweet:", error);
    }
}



const tweet = async () => {
    try {
        const content = await generateTweetContent();
        if (content) {
            await postTweet(content);
        }
    } catch (e) {
        console.log("Error while posting or replying to the tweet!");
        console.log({ "Error": e });
    }
};


setInterval(() => {
    tweet();
}, 1000 * 60 * 120);
