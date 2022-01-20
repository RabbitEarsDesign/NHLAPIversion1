// 1) First check if local storage is set with an array of all players and their respective ID (we will use this to search based on ID later)
// 2) If local storage is not already set then call getRoster() which will return the array of players and ID's
// 3) getRoster() awaits the result of creating the roster by calling createRoster()
// 4) getRoster() return a promise such that we can set its result to localStorage
// 5) When the user searches a name we get the array from localStorage and filter for all names that match the query
// 6) We then loop over and array of all relevent names and fetch their resective data by ID
// 7) as we fetch each player by ID we append a template literal with the applicable data to the html variable
// 8) Output the html to the screen using the element we grabbed at the beginning (output)

// setLS with roster
setLS();

// Get elements
const searchForm = document.getElementById("searchForm");
const output = document.getElementById("output");

// Listen for submit and capture user query
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = e.target[0].value;
  const allPlayers = JSON.parse(localStorage.getItem("playerArr"));

  let searchedPlayers = allPlayers.filter(
    (player) => player.fullName.toUpperCase() === query.toUpperCase()
  );

  getPlayersByQuery(searchedPlayers);
});

// Get array of player with respective ID from local storage
function getLS() {
  const allPlayers = JSON.parse(localStorage.getItem("playerArr"));
  console.log(allPlayers);
  let searchedPlayers = allPlayers.filter(
    (player) => player.fullName.toUpperCase() === query.toUpperCase()
  );
  return searchedPlayers;
}

// Get specific players and output to screen
async function getPlayersByQuery(searchedPlayers) {
  if (searchedPlayers.length > 0) {
    let html = "";
    for (const player of searchedPlayers) {
      const res = await fetch(
        `https://statsapi.web.nhl.com/api/v1/people/${player.id}`
      );
      const data = await res.json();
      const person = data.people[0];

      html += `<div class="card">
      <div class="card-top">
        <div class="number">
          <p>${person.primaryNumber}</p>
          <small>Jersey</small>
        </div>
        <div class="name">
          <p>${person.fullName}</p>
        </div>
      </div>
      <div class="card-bottom">
        <div class="card-bottom-stats">
          <div class="stat">
            <p>${person.birthCity}</p>
            <small>Hometown</small>
          </div>
          <div class="stat">
            <p>${person.captain ? "Yes" : "No"}</p>
            <small>Captain</small>
          </div>
        </div>
        <div class="card-bottom-stats">
          <div class="stat">
            <p>${person.height}</p>
            <small>Height</small>
          </div>
          <div class="stat">
            <p>${person.weight} lbs</p>
            <small>Weight</small>
          </div>
        </div>
        <div class="card-bottom-stats">
          <div class="stat">
            <p>${person.currentTeam.name}</p>
            <small>Team</small>
          </div>
          <div class="stat">
            <p>${person.currentAge}</p>
            <small>Age</small>
          </div>
        </div>
      </div>
    </div>`;
    }
    output.innerHTML = html;
  } else {
    output.innerText = "No player found";
  }
}

// SET LS WITH ROSTER
function setLS() {
  if (localStorage.getItem("playerArr")) {
    console.log("Roster already stored");
    return;
  } else {
    console.log("storing data...");
    getRoster().then((res) => {
      setTimeout(
        () => localStorage.setItem("playerArr", JSON.stringify(res)),
        2000
      );
    });
  }
}

// GET ROSTER
async function getRoster() {
  const roster = await createRoster();
  return roster;
}

// CREATE THE ROSTER - the roster is an array of players fullName and respecitve ID
async function createRoster() {
  const playerArr = localStorage.getItem("playerArr");

  const res = await fetch("https://statsapi.web.nhl.com/api/v1/teams");
  const data = await res.json();
  // Loop over array of team objs and
  let arrOfTeamIds = [];
  console.log(data.teams);
  data.teams.forEach((team) => {
    arrOfTeamIds.push({ name: team.name, id: team.id });
  });

  localStorage.setItem("teamArr", JSON.stringify(arrOfTeamIds));

  let rosterArr = [];
  arrOfTeamIds.forEach(async (team) => {
    const res = await fetch(
      `https://statsapi.web.nhl.com/api/v1/teams/${team.id}/roster`
    );
    const data = await res.json();

    data.roster.forEach((player) => {
      const newPlayer = {
        fullName: player.person.fullName,
        id: player.person.id,
      };
      rosterArr.push(newPlayer);
    });
  });
  return rosterArr;
}
