// 1) get all players info [done]
// 2) create array of player name and id [done]
// 3) if localStorage.getItem('playerArr') === undefined
// 4) then localStorage.setItem('playerArr', playerArr) [done]
// 5) When user searches a name get the playerArr and loop over it to find the corresponding id [done]
// 6) Multiple players could match so create searchedPlayerArr and push and ID that corespond with search [done]
// 7) Loop over serachPlayerArr and fetch each ID [done]
// 8) push each player onto an array [done]
// 9) output that array to the screen [done]

// INIT
setLS();

// Get elements
const searchForm = document.getElementById("searchForm");
const output = document.getElementById("output");
const dropdown = document.getElementById("dropdown");

// Listen for submit and capture user query
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const query = e.target[1].value;

  if (query.trim().length > 0) {
    // If searching players call getPlayers() else call getTeam()
    switch (e.target[0].value) {
      // GET team
      case "team":
        const teamArr = JSON.parse(localStorage.getItem("teamArr"));

        let currentTeam = teamArr.filter(
          (team) => team.name.toUpperCase() === query.toUpperCase()
        );

        getTeam(currentTeam);
      // GET players
      case "players":
        const playersArr = JSON.parse(localStorage.getItem("playerArr"));

        let searchedPlayers = playersArr.filter(
          (player) => player.fullName.toUpperCase() === query.toUpperCase()
        );

        getPlayers(searchedPlayers);

      default:
        return;
    }
  } else {
    output.innerText = "Search cannot be empty";
  }
});

// get specific team and output to screen
async function getTeam(searchedTeam) {
  if (searchedTeam.length === 1) {
    let html = "";

    const res = await fetch(
      `https://statsapi.web.nhl.com/api/v1/teams/${searchedTeam[0].id}/roster`
    );
    const data = await res.json();
    html += `<h2>${searchedTeam[0].name}</h2>`;

    for (let i = 0; i < data.roster.length; i++) {
      console.log(data.roster[i]);
      html += `
       <p class="cardTeam"><a>${data.roster[i].person.fullName}</a></p>
          `;
    }

    output.innerHTML = html;
  } else {
    output.innerText = "No team found";
  }
}

// Get specific players and output to screen
async function getPlayers(searchedPlayers) {
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

// SET LS ON INIT

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
