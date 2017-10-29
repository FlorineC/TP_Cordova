let storeFavorites = localforage.createInstance({ storeName: 'favorites' });

favoritesSessionsId = [];
storeFavorites.keys().then(function (keys) {
    favoritesSessionsId = keys;
    favoritesSessionsId = favoritesSessionsId.sort((a, b) => a - b);

}).catch(function (err) {
    console.log(err);
}).then(function () {
    fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/schedule.json')
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            // lecture du corps de la réponse en tant que JSON.
            return response.json();
        })
        .then(function (schedulesJson) {
            // traitement de l'objet
            let dates = [];
            var agendaJeudi = document.getElementById('agendaJeudi');
            var agendaVendredi = document.getElementById('agendaVendredi');
            var agenda = [agendaJeudi, agendaVendredi];
            for (let i in schedulesJson) {
                for (let j in schedulesJson[i].timeslots) {
                    for (let k in schedulesJson[i].timeslots[j].sessions) {
                        if (favoritesSessionsId.includes("" + schedulesJson[i].timeslots[j].sessions[k][0] + "")) {
                            detailsSessionPromise = findDetailsSession(schedulesJson[i].timeslots[j].sessions[k][0]);
                            detailsSessionPromise.then(function (details) {
                                startTime = schedulesJson[i].timeslots[j].startTime;
                                endTime = schedulesJson[i].timeslots[j].endTime;
                                agenda[i].innerHTML += "<h4>" + startTime + " - " + endTime + "</h4>" + details;
                            });
                        }
                    }
                }
            }
        });
});

function findDetailsSession(idSession) {
    return fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json')
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            // lecture du corps de la réponse en tant que JSON.
            return response.json();
        })
        .then(function (sessionsJson) {
            // traitement de l'objet
            for (i in sessionsJson) {
                if (idSession === sessionsJson[i].id) {
                    speakersPromise = findSpeakersName(sessionsJson[i].speakers);
                    let title = sessionsJson[i].title;
                    let id = sessionsJson[i].id;
                    return speakersPromise.then(function (speakers) {
                        return createSessionCard(id, title, speakers);
                    })
                }
            }
        })
};



