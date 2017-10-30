var sessionId = getURLParameter("id");

var title = document.getElementById('sessionTitle');
var text = document.getElementById('sessionText');
var speakers = document.getElementById('speakers');
var rates = [document.getElementById('very_dissatisfied'), document.getElementById('dissatisfied'), document.getElementById('neutral'), document.getElementById('satisfied'), document.getElementById('very_satisfied')];

let storeFavorites = localforage.createInstance({ storeName: 'favorites' });
let storeRates = localforage.createInstance({ storeName: 'rates' });

notes.setAttribute('href', 'notes.html?id=' + sessionId);

fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/sessions.json')
    .then(function (response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        // lecture du corps de la réponse en tant que JSON.
        return response.json();
    })
    .then(function (sessionsJson) {
        // traitement de l'objet
        let session = Object.values(sessionsJson).find(e => e.id === parseInt(sessionId));
        title.innerHTML = session.title;
        text.innerHTML = session.description;
        speakersPromise = findSpeakersName(session.speakers);
        speakersPromise.then(function (speakersDetails) {
            for (i in speakersDetails) {
                speakers.innerHTML += "<div class=\"mdl-cell mdl-cell--12-col\">" +
                    "<i class=\"material-icons mdl-list__item-icon\">person</i> " +
                    "<a href=\"speakerDetails.html?id=" + speakersDetails[i].id + "\">" +
                    speakersDetails[i].name +
                    "</a></div>";
            }
        });
    })
    .catch(function (error) {
        console.log('Une erreur est survenue : ', error);
    });

function findSpeakersName(speakers) {
    return fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/speakers.json')
        .then(function (response) {
            if (!response.ok) {
                throw Error(response.statusText);
            }
            // lecture du corps de la réponse en tant que JSON.
            return response.json();
        })
        .then(function (speakersJson) {
            // traitement de l'objet
            let speakersDetails = [];
            for (i in speakersJson) {
                for (j in speakers) {
                    if (speakers[j] === speakersJson[i].id) {
                        let speakerDetail = { name: speakersJson[i].name, id: speakersJson[i].id };
                        speakersDetails.push(speakerDetail);
                    }
                }
            }
            return speakersDetails;
        });
};

var app = {
    // Application Constructor
    initialize: function () {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function () {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        console.log('Received Event: ' + id);
        document.getElementById('favorite').addEventListener("click", favoriteSession);
        rates[0].addEventListener("click", rateVeryDissatisfied);
        rates[1].addEventListener("click", rateDissatisfied);
        rates[2].addEventListener("click", rateNeutral);
        rates[3].addEventListener("click", rateSatisfied);
        rates[4].addEventListener("click", rateVerySatisfied);

    }
};

app.initialize();

//Récupère le favori
storeFavorites.getItem(sessionId).then(function (value) {
    if (value !== null) {
        document.getElementById('favorite').click();
    }
}).catch(function (err) {
    console.log(err);
});

//Récupère le rate
storeRates.getItem(sessionId).then(function (value) {
    if (value !== null) {
        document.getElementById(value).click();
    }
}).catch(function (err) {
    console.log(err);
});

function favoriteSession() {
    if (document.getElementById("favorite").checked) {
        storeFavorites.setItem(sessionId, 'favorited').then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    } else {
        storeFavorites.removeItem(sessionId).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    }
}

function rate(satisfaction) {
    if (document.getElementById(satisfaction).checked) {
        storeRates.setItem(sessionId, satisfaction).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
        for (let i in rates) {
            if (rates[i].id !== satisfaction && rates[i].checked) rates[i].click();
        }
    } else {
        storeRates.removeItem(sessionId).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    }
}

function rateVeryDissatisfied() {
    rate('very_dissatisfied');
}

function rateDissatisfied() {
    rate('dissatisfied');
}

function rateNeutral() {
    rate('neutral');
}

function rateSatisfied() {
    rate('satisfied');
}

function rateVerySatisfied() {
    rate('very_satisfied');
}

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}