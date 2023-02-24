const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjToResponseObj = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

const convertDbObjToResponseObj2 = (dbObj) => {
  return {
    directorId: dbObj.director_id,
    directorName: dbObj.director_name,
  };
};

// API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT 
        movie_name
    FROM 
    movie`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => convertDbObjToResponseObj(eachMovie))
  );
});

// API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const moviesQuery = `
    INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES
        (
        ${directorId},
        '${movieName}',
        '${leadActor}'
                    );`;
  const dbResponse = await db.run(moviesQuery);
  response.send("Movie Successfully Added");
});

//API 3
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE 
        movie_id = ${movieId};`;
  const dbResp = await db.get(getMovieQuery);
  response.send(convertDbObjToResponseObj(dbResp));
});

// API 4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const editingQuery = `
    UPDATE 
        movie
    SET 
     director_id = ${directorId},
     movie_name = '${movieName}',
     lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
  const dbResp = await db.run(editingQuery);
  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM 
        movie
    WHERE 
        movie_id = ${movieId};`;
  await db.run(deleteQuery);
  response.send("Movie Removed");
});

//API 6
app.get("/directors/", async (request, response) => {
  const dbQuery = `
    SELECT 
        *
    FROM 
        director;`;
  const dbResponse = await db.all(dbQuery);
  response.send(
    dbResponse.map((dbObject) => convertDbObjToResponseObj2(dbObject))
  );
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const dbQuery2 = `
    SELECT 
        movie_name
    FROM 
        director NATURAL JOIN movie
    WHERE
        director_id = ${directorId};`;
  const dbResponse = await db.all(dbQuery2);
  response.send(dbResponse.map((dbo) => convertDbObjToResponseObj(dbo)));
});

module.exports = app;
