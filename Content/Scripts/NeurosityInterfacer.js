//// This script was written by Diego Saldivar( https://www.neuromodgames.com ) in 2021 based upon
//// Neurosity's tutorials and API guides ( https://docs.neurosity.co/docs/getting-started )
//// with the goal of emmulating their Web App example written in CSS and Javascript ( https://docs.neurosity.co/docs/tutorials/your-first-web-app ).

//// Unreal Engine, however, does not natively support Node.js or Javascript, which is why I used
//// Jan Kaniewski's Node.js UE plugin ( https://github.com/getnamo/nodejs-ue4 ),
//// to use ipc-event-emitter modules to communicate information between this script and Unreal Engine 5.

//// Heads-up: if you try to reproduce my steps from scratch, remember to first install the plugin, then copy / paste the 'node_modules' folder
//// from '...\Plugins\nodejs - ue4\Content\Scripts' into the folder inside the '...Content\Scripts' folder where you found this very script.
//// It is important for the plugin that the scripts and used modules be found EXACTLY inside a '...Content\Scripts' folder.
//// Then feel free to install all Neurosity modules into the aforementioned Scripts folder as you would in your First Node App (https://docs.neurosity.co/docs/getting-started).

//// This example project is released into the wild, as is, for the benefit of the game development community under an MIT Licence (Open Source).

//// Make me proud!



const { Notion } = require("@neurosity/notion");                                                // This is necessary to communicate with the Neurosity cloud.
const ipc = require('ipc-event-emitter').default(process);                                      // This is necessary to communicate with Unreal Engine.

var email =  "";
var password = "";
var deviceId = "";

const notion = new Notion({ autoSelectDevice: false });                                         // autoselectDevice is false to allow for the selection of the device after logging in.


// Firebase, the module in charge of logging you in, breaks VERY easily when you submit empty info or an e-mail address without an @.
// Here's a function to make sure we feed Firebase some dummy login info in case the user submits data that Firebase cannot parse.

async function firebaseProofer () {

    // In case the user submits an empty space for an e-mail but you still want to tell them the e-mail is badly formatted, thus the lack of '.com' at the end.
    if (email === "") {
        email = "dummy@dummymail";
    }

    // In case the user types something random without an '@email.com' kind of format and you still want to tell them the e-mail is badly formatted.
    if (email.indexOf("@") > -1) {
    }
    else {
        email += "@dummymail";
    }

    // In case the user submits an empty space for a password. I hope no user actually has a single dot for a password...
    if (password === "") {
        password = ".";
    }
}


//// As you can see below, there are no functions for the app itself, but rather ipc events to call.
//// Inside of these events there's many emissions (ipc.emit) that return different kinds of information


//// This is the section in charge of logging in and listing all devices registered to the user.

ipc.on('neurosityLogger', async (args) => {                                                     // args in this case will be a string consinsting of [ email + " " + password ] givven by the user where the space is the separator.

    var varsInput = args.toString();                                                            // We cast the input as a string for good measure and in the next if/else statement we split it and assign the input into the email and password values.

    if (varsInput === "")
    {
        console.log("User input not received");
    }
    else
    {
        const loginArray = varsInput.split(" ");

        email = loginArray[0];
        password = loginArray[1];

        firebaseProofer();                                                                      // Here's where we make a check of the e-mail and password to avoid Firebase crashing and leaving us stuck in the login screen.

    }

    const user = await notion                                                                   // This is where we log in.
        .login({
            email,
            password
        })
        .catch((error) => {
            console.log(error);
            ipc.emit('loggedIn', false);
            ipc.emit('loginError', error.message);                                              // I am emitting the error message which will be displayed in the login screen for the user to understand the mistake.
            throw new Error(error);                                                             // Remember to throw any errors AFTER you emit, not before. Otherwise the event is not emitted.
        }
        );
      
    if (user) {
        ipc.emit('loggedIn', true);                                                             // First, emit a boolean informing us that the login was successful, because the if statement returned true for a user not being false.

        const devices = await notion.getDevices();                                              // Then get all devices' nicknames registered to the user, put them in a string separated by a " " and...

        let deviceList = "";

        for (let i = 0; i < devices.length; i++) {
            deviceList += devices[i].deviceNickname + " ";
        }

        ipc.emit('deviceList', deviceList);                                                     // ...send this string to UE to later be separated and used in a dropdown menu.
    }
    else
    {
        ipc.emit('loggedIn', false);
    }

});


//// This is the section in charge of communicating information about the device to UE.
//// Here's where you would add any more functionalities from the Neurosity API.

ipc.on('neurosityEmitter', async (args) => {                                                    // args here only receive one string: the nickname of the device you're getting the info from.

    await notion.disconnect();                                                                  // ...in case we change devices.
    await notion.selectDevice(["deviceNickname", args]);                                        // ...and here's the only place where the nickname is used.

    notion.status().subscribe(status => {                                                       // Then I get the status of the device to display whether it's on or how much battery it has. More info here: https://docs.neurosity.co/docs/api/status

        if (status.state != null) { ipc.emit('deviceStateString', status.state); }              // Returns a string with the following possible states: "online" | "offline" | "shuttingOff" | "updating" | "booting"
        if (status.battery != null) { ipc.emit('deviceBatteryInt', status.battery); }           // Returns a number. I take it as an Int in the Blueprints.
        if (status.charging != null) { ipc.emit('deviceChargingBool', status.charging); }       // Returns a boolean: true is charging, false is not charging.

    });

    notion.calm().subscribe((calm) => {                                                         // Subscribe to the calm score.
        
        ipc.emit('calmScore', calm.probability);                                                // We emit the calm probability as is. It is a float between 0 and 1.

    });

    notion.focus().subscribe((focus) => {                                                       // The exact same thing happens for the focus score.

        ipc.emit('focusScore', focus.probability);
        
    });
    
});


//// This is just to log out. 
//// I am not sure what kinds of errors we could get, but so far I have gotten none. 
//// So I do not emit the error, merely log it into the console for the editor to showcase.

ipc.on('neurosityLogout', async () => {

    await notion.logout().catch((error) => {
        console.log("Log out error", error);
    });

    ipc.emit('loggedOut', false);
});

//// This is to explicitly end the script, so we can properly restart this script on level load.
//// Otherwise, the emiters will not emit once switching levels.

ipc.on('interfacerExit', async () => {
    process.exit();
});


//// And a lonely main function here. 
//// There's no actual functions to call from here, but rather form Blueprint in UE.
const main = async () => {

};
  
main();