const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbpath = path.join(__dirname, "cricketTeam.db");
let db = null;
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};
const initializedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`DB ERROR:${e.message}`);
    process.exit(1);
  }
};
initializedb();

//allplayersfromtable API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
 SELECT
 *
 FROM
 cricket_team;`;
  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//CREATE NEW PLAYER API 2
app.post("/players/", async (request, response) => {
  const playerdetails = request.body;
  const { playerName, jerseyNumber, role } = playerdetails;
  const addplayerquery = `INSERT INTO cricket_team (player_name,jersey_number,role) 
    VALUES ('${playerName}',${jerseyNumber},'${role}');`;
  const dbresponse = await db.run(addplayerquery);
  const playerId = dbresponse.lastID;
  response.send("Player Added to Team");
});

//find play with playerid API 3
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getoneplayerquery = `select * from cricket_team where player_id=${playerId};`;
  const singleplayer = await db.get(getoneplayerquery);
  response.send(singleplayer.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    ));
});

//update player details API 4
app.put("/players/:playerId/", async (request, response) => {
  const playerdetails = request.body;
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = playerdetails;
  const updateplayerquery = `UPDATE cricket_team
  SET player_name='${playerName}',jersey_number=${jerseyNumber},role='${role}' where player_id=${playerId};`;
  await db.run(updateplayerquery);
  response.send("Player Details Updated");
});

//delete player API 5
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteplayerquery = `DELETE from cricket_team where player_id=${playerId};`;
  await db.run(deleteplayerquery);
  response.send("Player Removed");
});

module.exports = app;
