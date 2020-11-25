const electron = require('electron');
const url = require('url');
const path = require('path');
const { createPublicKey } = require('crypto');

const {app, BrowserWindow,Menu, ipcMain} = electron;

//set env
process.env.NODE_ENV = 'production';
let mainWindow;
let addWindow;

// Listen for the app to be ready
app.on('ready',function(){
    //Create new window
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }
    });
    //Load Html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname,'mainWindow.html'),
        protocol:'file:',
        slashes: true
    }));

    //quit app when closed 

mainWindow.on('closed',function(){
    app.quit();
});


    //build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //insert menu
    Menu.setApplicationMenu(mainMenu);

});

//handle addWindow
function createAddWindow(){
    //Add new window
addWindow = new BrowserWindow({
    webPreferences: {
        nodeIntegration: true
    },
    width: 300,
    height:200,
    title:'Add New Task'
    
});

//Load Html into window
addWindow.loadURL(url.format({
    pathname: path.join(__dirname,'addWindow.html'),
    protocol:'file:',
    slashes: true
}));

//garbage collection handle
addWindow.on('close',function(){
    addWindow =null;
});
}

//catch task:add

ipcMain.on('task:add',function(e, task){
    mainWindow.webContents.send('task:add',task);
    addWindow.close();
});





//create menu template

const mainMenuTemplate = [
    
    {
        label: 'File',
        submenu:[
            {
                label: 'Add Tasks',
                click(){
                    createAddWindow();
                }
            },
            {
                label:'Clear Tasks',
                click(){
                    mainWindow.webContents.send('task:clear');
                }
            },
            {
                label:'Quit',
                accelerator: process.platform == 'darwin'?'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            
            }
        
        ]

    }
];

//if mac, add empty object to menu

if(process.platform=='darwin'){
    mainMenuTemplate.unshift({});
}

//add dev tools item if not in production
if(process.env.NODE_ENV !=='production'){
    mainMenuTemplate.push({
        label:'Developer Tools',
        submenu:[
            {
                label:'Toggle Devtools',
                click(item, focusedWindow ){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role:'reload'
            }
        ]
    });
}