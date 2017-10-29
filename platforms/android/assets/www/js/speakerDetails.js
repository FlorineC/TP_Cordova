function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

var name = document.getElementById('speakerName');
var bio = document.getElementById('speakerBio');
var sessions = document.getElementById('sessions');
speakerInfos = document.getElementById('speakerInfos');
var speakerId = getURLParameter("id");
let speaker;

fetch('https://raw.githubusercontent.com/DevInstitut/conference-data/master/speakers.json')
    .then(function (response) {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        // lecture du corps de la réponse en tant que JSON.
        return response.json();
    })
    .then(function (speakersJson) {
        // traitement de l'objet

        speaker = Object.values(speakersJson).find(e => e.id === parseInt(speakerId));
        name.innerHTML = speaker.name;
        bio.innerHTML = speaker.bio;
        sessionsPromise = findSessions(speaker.id);
        speakerInfos.style.background = "url('https://devfest.gdgnantes.com" + speaker.photoUrl + "') center / cover";
        sessionsPromise.then(function (sessionsDetails) {
            for (i in sessionsDetails) {
                sessions.innerHTML += "<div class=\"mdl-cell mdl-cell--12-col\">" +
                    "<i class=\"material-icons mdl-list__item-icon\">today</i> " +
                    "<a href=\"sessionDetails.html?id=" + sessionsDetails[i].id + "\">" +
                    sessionsDetails[i].title +
                    "</a></div>";
            }
        });
    });

function findSessions(speaker) {
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
            let sessionsDetails = [];
            for (i in sessionsJson) {
                for (j in sessionsJson[i].speakers) {
                    if (speaker === sessionsJson[i].speakers[j]) {
                        let sessionDetail = { title: sessionsJson[i].title, id: sessionsJson[i].id };
                        sessionsDetails.push(sessionDetail);
                    }
                }
            }
            return sessionsDetails;
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
        document.getElementById('ajoutContact').addEventListener("click", addOrRemoveContact);
    }
};

app.initialize();

function addOrRemoveContact() {
    document.getElementById('ajoutContact').checked ? addContact() : removeContact();
}

function addContact() {
    links = [];
    speaker.socials.forEach(social =>
        links.push(new ContactField(social.name, social.link, false)));
    monContact = navigator.contacts.create(
        {
            "displayName": speaker.name,
            "name": speaker.name,
            "nickname": speaker.name,
            "urls": links,
            "organizations": speaker.company,
            "note": speaker.bio,
        }
    );
    console.log(monContact);
    monContact.save(onSuccessCreate, onErrorCreate);
}

function removeContact() {
    var optionsRecherche = new ContactFindOptions();
    optionsRecherche.filter = speaker.name;
    optionsRecherche.desiredFields = [navigator.contacts.fieldType.id];
    var champsRecherche = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];

    navigator.contacts.find(champsRecherche, onSuccessFind, onErrorFind, optionsRecherche);

}
function onSuccessFind(existingContact) {
    existingContact[0].remove(onSuccessRemove, onErrorRemove);
}

function onErrorFind(error) {
    alert('Failed because: ' + error);
}

function onSuccessRemove(contact) { // Suppression OK 
};

function onErrorRemove(error) { // Suppression KO 
    alert('Failed because: ' + error);
};

function onSuccessCreate(contact) { // Suppression OK 
    console.log("contact ajouté");
};

function onErrorCreate(contactError) { // Suppression KO 
    alert('Failed because: ' + contactError);
};