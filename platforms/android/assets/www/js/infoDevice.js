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
        document.getElementById('cordova').innerHTML += device.cordova;
        document.getElementById('model').innerHTML += device.model;
        document.getElementById('platform').innerHTML += device.platform;
        document.getElementById('uuid').innerHTML += device.uuid;
        document.getElementById('version').innerHTML += device.version;
        document.getElementById('connection').innerHTML += navigator.connection.type;
    }
};

app.initialize();
