const express = require('express');; 
const db = require('./dbInteraction');

const app = express();

app.get('/', (req, res) => {
    res.json({ 
        message: "This is the api for the cloudmesh launcher, the / route isn't used for anything, please use /api/getVersions/:game/:email instead",
        routes: {
            getVersions: "/api/getVersions/GAMENAME/EMAIL"
        }
    });
})

app.get('/api/getVersions/:game/:email', async (req, res) => {
    const accountMail = req.params.email;
    const game = req.params.game;
    if(game.toLowerCase() !== 'genesis'){
        return res.status(400).json({ error: "Invalid game (at the moment)" });
    }else{

    
    try {

        const gameConfig = await db.getGameConfig();

        if (!gameConfig || typeof gameConfig !== 'object' || !gameConfig.builds) {
            throw new Error("Invalid raw data structure: 'gameConfig' missing or invalid");
        }

        if (!Array.isArray(gameConfig.builds)) {
            throw new Error("Invalid JSON structure: 'builds' is not an array");
        }

        // Nutzerinformationen abrufen
        const user = await db.getUserByEmail(accountMail);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Zugelassene Builds filtern
        const userWave = user.wave;
        const availableBuilds = gameConfig.builds.filter(build => userWave <= build.requiredWaveAccess);

        return res.json({
            email: accountMail,
            waveAccess: userWave,
            allowedBuilds: availableBuilds,
        });
    } catch (error) {
        console.error("[main.js]: Error processing request:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }}
});

app.listen(8089, () => {
    console.log('API is running on https://localhost:8089');
});