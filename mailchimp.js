const mailchimp = require("@mailchimp/mailchimp_marketing");
const cheerio = require("cheerio");

mailchimp.setConfig({
    apiKey: process.env.MAILCHIMP_API_KEY,
    server: "us7",
});

const listId = "2ffcde95d2";



async function addContact(email) {
    const response = await mailchimp.lists.addListMember(listId, {
        email_address: email,
        status: "subscribed",
    });

    console.log(
        `Successfully added contact as an audience member. The contact's id is ${response.id
        }.`
    );
}



const extractContent = (html) => {
    const $ = cheerio.load(html);
    return {
        title: $('h1:first').text().trim(),
        image: $('img:first').attr('src') || null
    };
};

async function getCampaigns(req, res) {
    try {
        // Step 1: Get campaigns from folder
        const { campaigns } = await mailchimp.campaigns.list({
            count: 10,
            folderId: "3c8e6b8146" // Replace with your folder ID
        });
        // Step 2: Process each campaign
        const results = [];
        for (const campaign of campaigns) {
            try {
                const content = await mailchimp.campaigns.getContent(campaign.id);
                const extracted = extractContent(content.html);

                results.push({
                    id: campaign.id,
                    date: campaign.send_time,
                    name: campaign.settings.from_name,
                    ...extracted
                });
            } catch (error) {
                console.error(`Error processing campaign ${campaign.id}:`, error.message);
                return res.status(500).json({ message: "An error occurred" });
            }
        }

        // Step 3: Output results
        console.log('Processed Campaigns:');
        console.log(results);
        res.status(200).json({ data: results });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: "An error occurred" });
    }
};

module.exports = { addContact, getCampaigns };