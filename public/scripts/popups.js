/*function notificationPopup(title, message){
    createWidget(`<body style="overflow: hidden;">
                    <div class="notification-popup", style="">
                        <h2>${title}</h2>
                        <p>${message}</p>
                    </div>
                  </body>`, 
                  '0px', '33px', '300px', '10px', '200px', '25px', y=0, x=        document.getElementById('mainScreen').offsetWidth/2,  resizable=false, draggable=false);
}*/

function notificationPopup(title, message) {
    createWidget(
        `
        <body style="margin:0; overflow:hidden; font-family:sans-serif;">
            <div style="
                display:flex;
                align-items:center;
                gap:10px;
                padding:8px 12px;
                white-space:nowrap;
                overflow:hidden;
                text-overflow:ellipsis;
            ">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>
        </body>
        `,
        x='8px',//document.getElementById('mainScreen').offsetWidth/2,                         // x offset (centered by your system)
        '33px',                        // y
        '300px',                       // width
        '50px',                        // height (FIXED)
        '200px',                       // minWidth
        '40px',                        // minHeight
        'none',
        'none',
        false,                         // resizable
        false,                          // draggable
        //x=//document.getElementById('mainScreen').offsetWidth/2
    );
}

function passkeyPopup(){
    createWidget('<div class="passkey-popup"><h2>Enter Passkey</h2><input type="password" placeholder="Passkey"><button>Submit</button></div>', '0px', '0px', '300px', '50px', '200px', '100px', x=document.getElementById('mainScreen').offsetWidth/2, y=0, resizable=false, draggable=false);
}