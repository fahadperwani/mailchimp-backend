const express = require("express");
const { addContact, getCampaigns } = require("./mailchimp");

const app = express();
app.use(express.json());

app.post("/addContact", async (req, res) => {
    try {
        await addContact(req.body.email);
        res.status(200).json({ message: "Successfully added contact" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "An error occurred" });
    }
});

app.get("/getBlogs", getCampaigns);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});