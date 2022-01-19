const searchForm = document.getElementById("searchForm");
const output = document.getElementById("output");

const DUMMY_DATA = [
  { fullName: "John Doe", id: 1 },
  { fullName: "John Doe", id: 2 },
  { fullName: "Peter Jackson", id: 2 },
  { fullName: "Steve Smith", id: 3 },
];

searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const allPlayers = JSON.parse(localStorage.getItem("playerArr"));
  const query = e.target[0].value;
  console.log(allPlayers);
  let searchedPlayers = allPlayers.filter(
    (player) => player.fullName.toUpperCase() === query.toUpperCase()
  );

  getSpecificPlayer(searchedPlayers);
});

async function getSpecificPlayer(searchedPlayers) {
  if (searchedPlayers.length > 0) {
    let html;
    for (const player of searchedPlayers) {
      const res = await fetch(
        `https://statsapi.web.nhl.com/api/v1/people/${player.id}`
      );
      const data = await res.json();
      const person = data.people[0];
      console.log(person);
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
            <p>${person.capitain}</p>
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

// 1) get all players info [done]
// 2) create array of player name and id [done]
// 3) if localStorage.getItem('playerArr') === undefined
// 4) then localStorage.setItem('playerArr', playerArr) [done]
// 5) When user searches a name get the playerArr and loop over it to find the corresponding id [done]
// 6) Multiple players could match so create searchedPlayerArr and push and ID that coreespon with search [done]
// 7) Loop over serachPlayerArr and fetch each ID [done]
// 8) push each player onto an array
// 9) output that array to the screen

async function createPlayerArray() {
  const playerArr = localStorage.getItem("playerArr");

  const res = await fetch("https://statsapi.web.nhl.com/api/v1/teams");
  const data = await res.json();
  // Loop over array of team objs and
  let arrOfTeamIds = [];
  data.teams.forEach((team) => {
    arrOfTeamIds.push(team.id);
  });

  let rosterArr = [];
  arrOfTeamIds.forEach(async (id) => {
    const res = await fetch(
      `https://statsapi.web.nhl.com/api/v1/teams/${id}/roster`
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

async function getRoster() {
  const roster = await createPlayerArray();
  return roster;
}

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

setLS();
