let express = require('express')
let app = express()
app.use(express.json())
let path = require('path')
let sqlite3 = require('sqlite3')
let {open} = require('sqlite')
let path_drive = path.join(__dirname, 'cricketMatchDetails.db')

let db = null

let initaiazing_db_server = async () => {
  try {
    db = await open({
      filename: path_drive,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running on port 3000')
    })
  } catch (error) {
    console.log(error.message)
  }
}

let get_particular_player_detailes = each => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
  }
}

initaiazing_db_server()

app.get('/players/', async (request, response) => {
  let query = `
    SELECT 
    *
    FROM 
    player_details

    `
  let db_response = await db.all(query)
  console.log(db_response)
  response.send(
    db_response.map(each => {
      return {
        playerId: each.player_id,
        playerName: each.player_name,
      }
    }),
  )
})

app.get('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  let query = `
  SELECT 
  *
  FROM 
  player_details
  where 
  player_id =${playerId}


  `
  let db_response = await db.get(query)
  response.send(get_particular_player_detailes(db_response))
})

let get_particular_match_details = each => {
  return {
    matchId: each.match_id,
    match: each.match,
    year: each.year,
  }
}

app.put('/players/:playerId/', async (request, response) => {
  let {playerId} = request.params
  let {playerName} = request.body
  let query = `
  UPDATE 
  player_details
  SET 
  player_name='${playerName}'
  WHERE 
  player_id=${playerId};

  `
  let db_response = await db.run(query)
  console.log(db_response)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  let {matchId} = request.params
  let query = `
SELECT 
*
FROM
match_details
WHERE 
match_id=${matchId};


`
  let db_responsse = await db.get(query)
  response.send(get_particular_match_details(db_responsse))
})

app.get('/players/:playerId/matches', async (request, response) => {
  let {playerId} = request.params
  let query = `
  SELECT 
  *
  FROM
  player_match_score natural join match_details
  where 
  player_id =${playerId}
  
  `
  let db_response = await db.all(query)
  //console.log(db_response)
  response.send(
    db_response.map(each => {
      return {
        matchId: each.match_id,
        match: each.match,
        year: each.year,
      }
    }),
  )
})

app.get('/matches/:matchId/players', async (request, response) => {
  let {matchId} = request.params
  let query = `
  SELECT 
  player_details.player_id as playerId ,
  player_details.player_name as playerName 
   FROM 
   player_match_score natural join player_details
   WHERE 

   player_match_score.match_id =${matchId}

  
  `
  let db_response = await db.all(query)
  // console.log(db_response)

  response.send(db_response)
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  let {playerId} = request.params

  let query = `
 SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`

  let db_response = await db.get(query)
  response.send(db_response)
})

/*

  const getPlayerScored = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(player_match_score.fours) AS totalFours,
    SUM(player_match_score.sixes) AS totalSixes FROM 
    player_details  JOIN player_match_score 
    WHERE 
    player_match_score.player_id = ${playerId};
    `

  let db_response = await db.all(getPlayerScored)
  response.send(db_response)
  */

module.exports = app
