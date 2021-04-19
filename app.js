const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "covid19India.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log(`Server is Running at http://localhost:3000/`);
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//1 API for getting all states
app.get("/states/", async (request, response) => {
  const getStatesQuery = `SELECT * FROM state;`;
  const statesArray = await db.all(getStatesQuery);
  response.send(statesArray);
});

//2 API for get state
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  //   stateId = Number(stateId);
  const getStateQuery = `SELECT * FROM state WHERE state_id = ${stateId};`;
  const state = await db.get(getStateQuery);
  response.send(state);
});

//3 API for create district in district table
app.post("/districts/", async (request, response) => {
  const districtDetails = request.body;
  const {
    districtName,
    stateId,
    cases,
    cured,
    active,
    deaths,
  } = districtDetails;
  const addStateQuery = `INSERT INTO district
  (district_name,state_id,cases,cured,active,deaths)
  VALUES
  (
      '${districtName}',
      ${stateId},
      ${cases},
      ${cured},
      ${active},
      ${deaths}
  );`;
  const dbResponse = await db.run(addStateQuery);
  response.send("District Successfully Added");
});

//4 API get specific district
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getSpecificDistrictQuery = `SELECT * FROM district WHERE district_id = ${districtId};`;
  //   console.log(getSpecificDistrictQuery);
  const district = await db.get(getSpecificDistrictQuery);
  response.send(district);
});

//5 API for delete district
app.delete("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const deleteDistrictQuery = `DELETE FROM district WHERE district_id =${districtId};`;
    const dbResponse = await db.run(deleteDistrictQuery);
    response.send(`District Removed`);
  } catch (e) {
    console.log(`ERRor:${e.message}`);
  }
});

//6 API for update district
app.put("/districts/:districtId/", async (request, response) => {
  try {
    const { districtId } = request.params;
    const districtDetails = request.body;
    const {
      districtName,
      stateId,
      cases,
      cured,
      active,
      deaths,
    } = districtDetails;
    //   console.log(districtDetails);
    const updateDistrict = `UPDATE district
      SET
      district_name = '${districtName}',
      state_id = ${stateId},
      cases = ${cases},
      cured = ${cured},
      active = ${active},
      deaths = ${deaths}
      WHERE district_id = ${districtId};`;
    await db.run(updateDistrict);
    response.send(`District Details Updated`);
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
});

//7 API for getting total cases in states
app.get("/states/:stateId/stats", async (request, response) => {
  const { stateId } = request.params;
  const totalCasesQuery = `SELECT SUM(district.cases) AS totalCases,SUM(district.cured) AS totalCured,
  SUM(district.active) AS totalActive, SUM(district.deaths) AS totalDeaths
  FROM state INNER JOIN district ON state.state_id = district.state_id
  WHERE state.state_id = ${stateId};`;
  const statistics = await db.get(totalCasesQuery);
  response.send(statistics);
});

// 8 API
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getDistrict = `SELECT state.state_name FROM  
  district  INNER JOIN state ON district.state_id = state.state_id
  WHERE district_id = ${districtId};`;
  const state = await db.get(getDistrict);
  response.send(state);
});
//9 API for get districts
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtsQuery = `SELECT * FROM district WHERE district_id=${districtId}`;
  const districts = await db.all(districtsQuery);
  response.send(districts);
});

module.exports = app;
