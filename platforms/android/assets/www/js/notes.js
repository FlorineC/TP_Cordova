function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [null, ''])[1].replace(/\+/g, '%20')) || null;
}

let sessionId = getURLParameter("id");
let title = document.getElementById('sessionTitle');
let notes = document.getElementById('notes');
let image = document.getElementById('myImage');
let audio = document.getElementById('myAudio');
let video = document.getElementById('myVideo');
let storeNotes = localforage.createInstance({ storeName: 'notes' });
let storeImages = localforage.createInstance({ storeName: 'images' });
let storeAudios = localforage.createInstance({ storeName: 'audios' });
let storeVideos = localforage.createInstance({ storeName: 'videos' });

getData();

function getData() {
    //Récupère le titre de la session
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
        })
        .catch(function (error) {
            console.log('Une erreur est survenue : ', error);
        });

    //Récupère la note
    storeNotes.getItem(sessionId).then(function (value) {
        if (value !== null) {
            notes.value = value;
        }
    }).catch(function (err) {
        console.log(err);
    });

    //Récupère l'image
    storeImages.getItem(sessionId).then(function (value) {
        if (value !== null) {
            image.src = value;
            image.hidden = false;
        }
    }).catch(function (err) {
        console.log(err);
    });

    //Récupère l'audio
    storeAudios.getItem(sessionId).then(function (value) {
        if (value !== null) {
            audio.src = value;
            audio.hidden = false;
        }
    }).catch(function (err) {
        console.log(err);
    });

    //Récupère la vidéo
    storeVideos.getItem(sessionId).then(function (value) {
        if (value !== null) {
            video.src = value;
            video.hidden = false;
        }
    }).catch(function (err) {
        console.log(err);
    });
}


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
        image.addEventListener("click", ShareDeleteSheet);
        document.getElementById('camera').addEventListener("click", openCamera);
        document.getElementById('gallery').addEventListener("click", openGallery);
        document.getElementById('audio').addEventListener("click", captureAudio);
        document.getElementById('video').addEventListener("click", captureVideo);
        document.getElementById('save').addEventListener("click", valider);
    }
};

app.initialize();

function openCamera() {
    navigator.camera.getPicture(onSuccessPicture, onFailPicture, { quality: 100, correctOrientation: true });
};

function openGallery() {
    navigator.camera.getPicture(onSuccessPicture, onFailPicture, { sourceType: Camera.PictureSourceType.PHOTOLIBRARY, mediaType: Camera.MediaType.PICTURE, quality: 100, correctOrientation: true });
};

function onSuccessPicture(imageData) {
    var image = document.getElementById('myImage');
    image.src = imageData;
    image.hidden = false;
}

function onFailPicture(message) {
}

function captureAudio() {
    navigator.device.capture.captureAudio(function (mediaFiles) {
        audio.src = mediaFiles[0].fullPath;
        audio.hidden = false;
    }, function (e) {
        // cas d'erreur 
    },
        {
            limit: 1, // nombre de clip audio
            duration: 10 // durée limite en seconde 
        });
}

function captureVideo() {
    navigator.device.capture.captureVideo(function (mediaFiles) {
        video.src = mediaFiles[0].fullPath;
        video.hidden = false;
    }, function (e) {
        // cas d'erreur 
    },
        {
            limit: 1, // nombre de clip vidéo
            duration: 10 // durée limite en seconde 
        });
}


function valider() {
    //enregistrement de la note
    let note = document.getElementById('notes').value;
    storeNotes.setItem(sessionId, note).then(function (value) {
    }).catch(function (err) {
        console.log(err);
    });

    //enregistrement de l'image
    if (image.getAttribute('src') !== "") {
        storeImages.setItem(sessionId, image.src).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    } else if (image.getAttribute('src') === "" && storeImages.getItem(sessionId) !== null) {
        storeImages.removeItem(sessionId).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    }

    //enregistrement de l'audio
    if (audio.getAttribute('src') !== "") {
        storeAudios.setItem(sessionId, audio.src).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    }

    //enregistrement de la vidéo
    if (video.getAttribute('src') !== "") {
        storeVideos.setItem(sessionId, video.src).then(function (value) {
        }).catch(function (err) {
            console.log(err);
        });
    }
}

//Callback de la fenêtre de partage/suppression
var callback = function (buttonIndex) {
    setTimeout(function () {
        // like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1)
        if (buttonIndex === 1) {
            console.log("title : " + title.value);
            window.plugins.socialsharing.share(notes.value, title.innerHTML, image.src);
        }
        else if (buttonIndex === 2) {
            image.src = '';
            image.hidden = true;
        }
    });
};

function ShareDeleteSheet() {
    var options = {
        androidTheme: window.plugins.actionsheet.ANDROID_THEMES.THEME_DEVICE_DEFAULT_LIGHT, // default is THEME_TRADITIONAL
        title: 'Que voulez vous faire avec cette image ?',
        buttonLabels: ['Partager'],
        androidEnableCancelButton: true, // default false
        addCancelButtonWithLabel: 'Annuler',
        addDestructiveButtonWithLabel: 'Supprimer',
        destructiveButtonLast: true // you can choose where the destructive button is shown
    };
    window.plugins.actionsheet.show(options, callback);
};