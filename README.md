# NeurosityUE5-NeurogameTemplate

![GitHub](https://img.shields.io/github/release/neuromodgames/NeurosityUE5-NeurogameTemplate?style=for-the-badge)
![GitHub](https://img.shields.io/github/license/neuromodgames/NeurosityUE5-NeurogameTemplate?style=for-the-badge)

UE5 Neurogame Template using Neurosity and experimental NodeJS plugin. See how the Javascript can be used to get information from your Neurosity device and be used in-game.

![NeurogameTemplate_LowRes](https://user-images.githubusercontent.com/88777150/135772416-407f038e-a107-4943-9f5a-bf1b7b4dba7a.gif)


## What can you do with it?

You can log into your device and play some games with it. Take care to stop the script between levels as you continue making more levels!
The neurogame example level uses the Calm score to make a sphere float and the focus score to make a cube glow brighter.
Oh, the pause button is **P**, by the way.

The template may be a bit rushed but I wanted to share my progress with ther interested game designers.
Be sure to add your name to the credits before you push any innovations.

## External Assets

This project was built upon the hard work of others. As such, it is also dependent on the scrutiny and update of the tools they so generously provide. Make sure to check their sites and repositories if you want to upgrade your own project or if you want to try your hand at older versions of Unreal Engine.

- Thanks to [AJ Keller](https://www.linkedin.com/in/andrewjaykeller/) and [Alex Castillo](https://www.linkedin.com/in/alexcas/) for coming up with the [Crown](https://neurosity.co/) hardware and the [Neurosity SDK](https://docs.neurosity.co/docs/overview). 

- Thanks to [Jan Kaniewski](https://github.com/getnamo) for developing the [Node.js plugin](https://github.com/getnamo/nodejs-ue4) for Unreal Engine 5. 

- Thanks to Epic Games, Inc. for making [Unreal Engine 5](https://www.unrealengine.com/) accessible for everyone and for offering default assets.

## Where's the important stuff?

I use the example assets provided by Epic Games, Inc. for their Third Person example game template. 

The magic happens in the *NeurosityInterfacer.js* in the *NeurogameTemplate\Content\Scripts* folder. It's inundated with helpful comments! You cannot see it directly in the Editor, you have to look for it using your file explorer and open it in your favorite code editor.

You can find all my blueprints in the *Content/Neurogame* folder, inside the Editor. Don't forget to also open the Level Blueprints as well. Those are super important!

The *BP_NeurosityInterface* does all of the communication between *NeurosityInterfacer.js* and Unreal. 
Beware, the Node.js plugin does not stop scripts when a Node instance is destroyed, so I provided a way to tell the script to stop so that it can be automatically be restarted upon creating a new BP_NeurosityInterface instance. For examples on how this is done, check the Level Blueprints in *Map_Title* and *Map_ExampleLevel* (Content/Neurogame/Maps) and the *WBP_TitleMenu* and *WBP_PauseMenu* (Content/Neurogame/Widgets).

## How can I set up my own from scratch?

1. Download and install [Unreal Engine](https://www.unrealengine.com/en-US/download). Sign up or sign in as necessary.
2. Download and install [Git](https://git-scm.com/).
3. Download and install [Node.js](https://nodejs.org/en/).
4. Download the [Node.js plugin](https://github.com/getnamo/nodejs-ue4). Also download the [SocketIO Client plugin](https://github.com/getnamo/socketio-client-ue4) if you're downloading the Node.js plugin v0.7.0 for UE 4.26 or below.
5. Create a new project if you haven't made a project already.
6. Browse to your project folder (typically found at *.../Documents/Unreal Project/{Your Project Root}*).
7. Copy *Plugins* folder from the *Node.js plugin* download into your Project root. If working with an older version of the plugin, also place the aforementioned *socketio-client-ue4* folder in the Plugins folder.
8. Create a *Scripts* folder inside the *{Your Project Root}/Contents* folder. The name and location is very important for the plugin to run.
9. Copy/paste the *node_modules* folder from *{Your Project Root}/Plugins/nodejs-ue4/Content/Scripts* folder to your *{Your Project Root}/Contents/Scripts* folder.
10. Follow the setup instructions and install dependencies in your *{Your Project Root}/Contents/Scripts* folder, just as you would in [Your First Node App](https://docs.neurosity.co/docs/getting-started) example project. Ignore the section where you authenticate with an .env file. The plugin doesn't support that workflow.
11. Add your Unreal Project path to your environment variables.
12. Open your project in Unreal Engine. It is not necessary to "Import Changes", but make sure the Node.js and the SocketIO plugins are enabled.
13. You're good to start your own journey! Check this very example project or [getnamo's examples](https://github.com/getnamo/nodejs-ue4) to figure out how to use [Neurosity's SDK](https://docs.neurosity.co/docs/overview) with the Node.js plugin.

## Packaging

Make sure to add the folder where your project Scripts are as additional non-asset directories to copy relative to the Content directory (e.g. for the typical Content/Scripts folder add just Scripts).

![image](https://user-images.githubusercontent.com/88777150/133001784-82c17074-3fe2-40ec-a41b-ffab2cab2fe1.png)

## Problems

- You need to add the Unreal Engine project path to your Environment Variables.
- You won't be able to see your javascripts inside the UE editor. You'll have to access them from the file explorer and open them in your favorite code editor.
- The experimental Node.js plugin can only package games for Windows and that even [is buggy](https://github.com/getnamo/nodejs-ue4/issues/35).

## To Do

- ReplaceNode.js plugin workarounds with proper Neurosity SDK.

## Frequently Asked Questions

**Q: Why are there no questions here?**

A: People haven't yet asked me questions to populate this section.
