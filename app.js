const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertMovieObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

const convertDirectorObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

// get Movie Name API 1

app.get('/movies/', async (request, response) => {
  const getMovieNameQuery = `
    SELECT
        movie_name
    FROM
        movie;`
  const movieNameArray = await db.all(getMovieNameQuery)
  response.send(
    movieNameArray.map(eachMovieName => ({movieName: eachMovie.movie_name})),
  )
})

// Add movie API 2

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = ` 
  INSERT INTO
      movie(director_id, movie_name, lead_actor)
  VALUES
  (${directorId}, '${movieName}', '${leadActor}');`
  const movie = await db.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

// get movie by Movie Id API 3

app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT
      *
  FROM
      movie
  WHERE
      movie_id = ${movieId};`
  const getMovie = await db.get(getMovieQuery)
  response.send(convertMovieObjectToResponseObject(getMovie))
})

// update the movie API 4

app.put('/movies/:movieId', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateMovieQuery = `
  UPDATE
      movie
  SET
      director_id = ${directorId},
      movie_name = '${movieName}',
      lead_actor = '${leadActor}'
  WHERE
      movie_id = ${movieId};`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// Delete movie API 5

app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
  DELETE FROM
      movie
  WHERE
      movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

// get Director API 6

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
  SELECT
      *
  FROM
      director;`
  const getDirectorsArray = await db.all(getDirectorsQuery)
  response.send(
    getDirectorsArray.map(eachDirector =>
      convertDirectorObjectToResponseObject(eachDirector),
    ),
  )
})

// get all directors movies API 7

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMovieQuery = `
  SELECT 
      movie_name
  FROM
      movie
  WHERE
      director_id = ${directorId};`
  const movieNameArr = await db.all(getDirectorMovieQuery)
  response.send(
    movieNameArr.map(movieName => ({movieName: movieName.movie_name})),
  )
})

module.exports = app
