// This is 'room.js' File of Connect - A JS File containing the all connection, chats, notifications and meeting controls information

// Targeting Required variabls by ID, ClassName and Query Selector

// Video variables
const videoGrid1 = document.getElementById('video-grid-1');
const videoGrid2 = document.getElementById('video-grid-2');

// Message variables
const participants = document.querySelector('.user-list ul');
const chat = document.querySelector('.chat-list');
const message = document.getElementsByClassName('emojionearea-editor')

// Menu variables
const audioOpt = document.getElementById('audioOption');
const videoOpt = document.getElementById('videoOption');
const screenShare = document.querySelector('#screen-share i');

// Connection variables
const socket = io('/');
const peer = new Peer();

/*
==================================================================================================================================================================================================
                                                            U T I L I T Y       R E Q U I R E M E N T S
==================================================================================================================================================================================================
*/

// Initializing My Video stream, Whiteboard and creating a empty call list
let myVideoStream;
let callList = [];
let isWhiteBoard = false;

// Video Grid Dimensions
const gridOfVideos = [
    {   //1
        height: '100%',
        width: '100%'
    },
    {   //2
        height: '50%',
        width: '50%'
    },
    {   //3
        height: '50%',
        width: '50%'
    },
    {   //4
        height: '50%',
        width: '50%'
    },
    {   //5
        height: '50%',
        width: '33.33%'
    },
    {   //6
        height: '50%',
        width: '33.33%'
    },
    {   //7
        height: '33.33%',
        width: '33.33%'
    },
    {   //8
        height: '33.33%',
        width: '33.33%'
    },
    {   //9
        height: '33.33%',
        width: '33.33%'
    },
    {   //10
        height: '25%',
        width: '33.33%'
    },
    {   //11
        height: '25%',
        width: '33.33%'
    },
    {   //12
        height: '33.33%',
        width: '25%'
    },
    {   //13
        height: '25%',
        width: '25%'
    },
    {   //14
        height: '25%',
        width: '25%'
    },
    {   //15
        height: '25%',
        width: '25%'
    },
    {   //16
        height: '25%',
        width: '25%'
    },
    {   //17
        height: '20%',
        width: '25%'
    },
    {   //18
        height: '20%',
        width: '25%'
    },
];

// Audio and Video Constraints
let constraints = {
    audio: {
        echoCancellation: { exact: true },
        googEchoCancellation: { exact: true },
        googAutoGainControl: { exact: true },
        googNoiseSuppression: { exact: true },
    },
    video: { width: 1440, height: 720 },

};


/*
==================================================================================================================================================================================================
                                                                     P E E R    C O N N E C T I O N
==================================================================================================================================================================================================
*/

// Peer Joining a Meeting
peer.on('open', id => {

    // Joining Sound
    sound('join');

    // Joining User Name in the Console
    console.log(USER_NAME);

    // Joining User Name in the Participant List
    createListElement(USER_NAME, USER_FNAME, USER_LNAME, USER_EMAIL, USER_PHONE);

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {

            myVideoStream = stream;

            // Informing others about someone joined
            socket.emit('join-room', ROOM_ID, id, USER_NAME);
            console.log("peer on", myVideoStream);

            const grid = videoGrid2;
            addVideoStream(grid, myVideoStream, `white`, id);
        });
});

// Peer Calling the New User Connected
socket.on('user-connected', (userId, userName, users) => {

    // Joining Sound
    sound('join')

    // Recreating the Participant List as someone entered the meet
    createParticipantList(users)

    // Calling the Connect to New User Function
    connectToNewUser(userId, myVideoStream, users);
});

// Function to Connect to New User to the existing stream
function connectToNewUser(userId, stream, users, flag = false) {

    // flag: false -> Normal Video
    // flag: true -> Removal of screen share

    console.log(`new user ${userId} connected`);

    const call = peer.call(userId, stream);
    const grid = videoGrid1;

    call.on('stream', userVideoStream => {

            if (!callList[call.peer]) {
                console.log("user", userVideoStream);

                if (!flag) {
                    addVideoStream(grid, userVideoStream, `green`, call.peer);
                } 
                else {
                    removeVideo(`ca${userId}`);
                }
                callList[call.peer] = call;
            }
        },
        function(err) {
            console.log('Failed to get local stream', err);
        });


    callList = [];

    const conn = peer.connect(userId);
    conn.on('open', function() {

        conn.send(users);
    });
}

//  Peer Answering a call
peer.on('call', call => {

    call.answer(myVideoStream);
    const grid = videoGrid1;

    console.log("answer", myVideoStream);

    call.on('stream', userVideoStream => {

            if (!callList[call.peer]) {
                console.log(call.peer);
                console.log("call", userVideoStream);
                addVideoStream(grid, userVideoStream, `red`, call.peer);

                callList[call.peer] = call;
            }
        },
        function(err) {
            console.log('Failed to get local stream', err);
        });

    callList = [];
});

peer.on('connection', function(conn) {
    conn.on('data', function(users) {

        createParticipantList(users);
    });
});

/*
==================================================================================================================================================================================================
                                                                        U S E R     D I S C O N N E C T E D
==================================================================================================================================================================================================
*/

// Function Leave 
function leave() {

    // Leaving Sound
    sound('leave');

    setTimeout(function() {
        window.location.href = '/thanks'; // Redirecting to Thanks Page
    }, 3000);
}

socket.on('user-disconnected', (userId, userName, users) => {
    console.log(`${userName} left`);
    sound('disconnect');

    // Recreating the Participant list when some user gets disconnected
    createParticipantList(users)

    removeVideo(`c${userId}`); // Normal video Removal of Disconnected User
    removeVideo(`ca${userId}`); // Shared Screen Removal of Disconnected User

});

/*
==================================================================================================================================================================================================
                                                                    P A R T I C I P A T I O N       L I S T
==================================================================================================================================================================================================
*/

//  Function to Activate PopUp
function popoverActivate() {

    $('[data-toggle="popover"]').popover({
        html: true,
        sanitize: false,
    })
}

// Function to create the List element
function createListElement(userName, fname, lname, email, phone) {
    const list = document.createElement('li');

    list.innerHTML = `
    <a href="#" class="pops" title="${fname} ${lname}" data-toggle="popover" 
    data-placement="bottom" data-html="true" data-trigger="hover" data-content="Email: ${email}<br>
    Contact no. : ${phone}" onclick="popoverActivate()">
    ${userName}
    </a>
    `;

    participants.appendChild(list);
}

// Function to create the Participant List
function createParticipantList(users) {
    participants.innerHTML = '';

    for (let i = 0; i < users.length; i++) {
        createListElement(users[i].nname, users[i].fname, users[i].lname, users[i].email, users[i].phone);
    }
}

/*
==================================================================================================================================================================================================
                                                                    A D D   /   R E M O V E     V I D E O
==================================================================================================================================================================================================
*/

// Function to Remove Videos from the Grid
function removeVideo(userId) {
    let index = 0;

    for (let i = 0; i < videoGrid1.childNodes.length; i++) {
        let tempId = videoGrid1.childNodes[i].getAttribute('id');

        if (tempId === userId) {
            index = i;
            videoGrid1.removeChild(videoGrid1.childNodes[index]);
            i--;
        } 
        else {
            if (!isWhiteBoard) {
                videoGrid1.childNodes[i].style.display = 'block';
            }
        }
    }

    gridCheck();
}

// Function to Add Videos to the Grid
function addVideoStream(grid, stream, color, userId) {

    const video = document.createElement('video');
    video.srcObject = stream;

    video.addEventListener('loadedmetadata', () => {
        video.play();
    });

    // Peer's Own Video
    if (grid === videoGrid2) {
        video.volume = 0;
        video.setAttribute('id', `${userId}`);
        grid.append(video);

    } 
    else {

        // Other Peer's Video
        const div = document.createElement('div');
        div.style.padding = '5px';

        const div1 = document.createElement('div');

        // id is given as " c + userId " so that while resizing and compressing we can access the correct division
        div.setAttribute('id', `c${userId}`);
        div1.classList.add('box-position');

        // creating the resize icon
        // id is given as userId so that we can later access the correct video while removing from grid.
        div1.innerHTML = `<div style="position: absolute; right: 10px; z-index: 2; color:rgb(255,255,255,0.5);" id="${userId}" onclick="resize(id)">
        <i class="fas fa-expand"></i>
        </div>`;

        let index;
        for (let i = 0; i < grid.childNodes.length; i++) {
            let tempId = grid.childNodes[i].getAttribute('id');
            if (tempId === `c${userId}`) {
                index = i;
                break;
            }
        }
        console.log(index)

        if (index !== undefined) {

            if (color === 'green') {
                div.setAttribute('id', `ca${userId}`);
                div1.childNodes[0].setAttribute('id', `a${userId}`);
                div.appendChild(div1);
                div1.appendChild(video);
                grid.append(div);
            }
        } 
        else {
            div.appendChild(div1);
            div1.appendChild(video);
            grid.append(div);
        }

        if (isWhiteBoard) {
            div.style.display = 'none';
        }
    }

    gridCheck();
}

/*
==================================================================================================================================================================================================
                                                                F U L L     S C R E E N     -   E N T E R   /   E X I T
==================================================================================================================================================================================================
*/

// Function to Enter Full Screen - Maximizing a particular video
function resize(e) {
    console.log(e)

    // Making other Videos Hidden
    for (let i = 0; i < videoGrid1.childNodes.length; i++) {
        let tempId = videoGrid1.childNodes[i].getAttribute('id');
        if (tempId !== `c${e}`) {
            videoGrid1.childNodes[i].style.display = 'none';
        }
    }

    // fs is the resize icon
    const fs = document.getElementById(e);
    fs.style.display = 'none';
    const box = document.getElementById(`c${e}`);

    box.classList.add('resize'); // will make the height and width 100%

    // creating the compress icon
    const div = document.createElement('div');
    div.innerHTML = '<i class="fas fa-compress"></i>';
    div.classList.add('compress');

    div.setAttribute('onclick', `back('${e}')`);

    box.childNodes[0].appendChild(div);
}

// Function to Exit Full Screen - Bringing back the normal videos
function back(e) {
    console.log(e);

    // Making all video back to flex
    for (let i = 0; i < videoGrid1.childNodes.length; i++) {
        let tempId = videoGrid1.childNodes[i].getAttribute('id');
        if (tempId !== `c${e}`) {
            videoGrid1.childNodes[i].style.display = 'flex';
        }
    }

    const fs = document.getElementById(e);
    fs.style.display = 'block';

    const box = document.getElementById(`c${e}`);

    box.classList.remove('resize'); 
    console.log(box, box.childNodes);
    box.childNodes[0].removeChild(box.childNodes[0].childNodes[2]); 

    gridCheck();
}

/*
==================================================================================================================================================================================================
                                                                            M E S S A G I N G
==================================================================================================================================================================================================
*/

// Function to create a Chat Box
function chatBox(msg, bgColor, align, userName) {

    const date = new Date();
    const hour = date.getHours();
    const min = date.getMinutes();

    const messageArea = document.createElement('div');
    messageArea.classList.add(`${align}`);

    const message = document.createElement('div');
    message.classList.add('chat-box');
    message.style.backgroundColor = bgColor;
    message.style.color = 'white';

    message.innerHTML = `
    <div class='d-flex flex-row justify-content-between' style='font-size:10px;'>
    <div>${userName}</div>
    <div>${hour}:${min}</div>
    </div>
    <div class="message">
    ${msg}
    </div>`;

    messageArea.appendChild(message)
    chat.appendChild(messageArea);

    chat.scrollTop = chat.scrollHeight;
}

// When User press enter key to sent message
$('#messageInput').emojioneArea({
    pickerPosition: 'top',

    events: {
        keydown: function(editor, event) {
            if (event.keyCode === 13) {
                sendMsg();
            }
        }
    }
});

// Functiont to Send Message
function sendMsg() {
    const msg = message[0].innerHTML;
    message[0].innerHTML = '';

    if (msg.length > 0) {
        chatBox(msg, '#25D366', 'end', 'Me');

        socket.emit('message', msg);
    }
}

// Chat Connection
socket.on('createMessage', (msg, userId, userName) => {

    // Chat Notification
    if (!document.getElementById('chat').classList.contains('active')) {
        document.getElementById('chat-noti').innerHTML = '•';
    }

    chatBox(msg, '#075E54', 'start', userName);

    // Message Sound
    sound('message');
});

/*
==================================================================================================================================================================================================
                                                           A U D I O,   V I D E O   -   M U T E   /   U N M U T E
==================================================================================================================================================================================================
*/

// Audio Mute or UnMute
const setMuteButton = () => {
    const html = `<i class="fas fa-microphone nav-link"></i>`
    audioOpt.innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `<i class="fas fa-microphone-slash nav-link"></i>`
    audioOpt.innerHTML = html;
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        setMuteButton();
    }
}

// Video Off or On
const setPlayVideo = () => {
    const html = `<i class="fas fa-video-slash nav-link"></i>`
    videoOpt.innerHTML = html;
}

const setStopVideo = () => {
    const html = `<i class="fas fa-video nav-link"></i>`
    videoOpt.innerHTML = html;
};

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        setStopVideo()
    }
}

/*
==================================================================================================================================================================================================
                                                                        S C R E E N     S H A R I N G
==================================================================================================================================================================================================
*/

let temp;

// Function to Stop Screen Sharing
function stopSharing() {
    console.log('stop-sharing', myVideoStream);

    videoGrid2.removeChild(videoGrid2.childNodes[1]);
    screenShare.classList.remove('screen-share-active');

    socket.emit('stop-screen-share', peer.id);
}

// Function to Start Screen Sharing
function screenSharing() {

    screenShare.classList.add('screen-share-active');

    navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(function(stream) {

            console.log("screen before", myVideoStream);

            temp = myVideoStream;
            myVideoStream = stream;

            console.log("screen after", myVideoStream);

            socket.emit('screen-share', peer.id);

            addVideoStream(videoGrid2, stream, 'blue', peer.id);

            stream.getVideoTracks()[0].addEventListener('ended', () => {
                myVideoStream = temp;

                stopSharing();
            });
        });

}

socket.on('screen-sharing', (userId, users) => {
    console.log('sharing' + userId)

    connectToNewUser(userId, myVideoStream, users);
});

socket.on('stop-screen-sharing', (userId, users) => {
    console.log('stop-sharing' + userId)

    connectToNewUser(userId, myVideoStream, users, true);
});

/*
==================================================================================================================================================================================================
                                                                            G R I D     C H E C K
==================================================================================================================================================================================================
*/

// Modification of the Grid Dimensions on Addition and Removal of User Video
function gridCheck() {

    for (let i = 0; i < videoGrid1.childNodes.length; i++) {

        videoGrid1.childNodes[i].style.height = gridOfVideos[videoGrid1.childNodes.length - 1].height;
        videoGrid1.childNodes[i].style.width = gridOfVideos[videoGrid1.childNodes.length - 1].width;

    }
}

/*
==================================================================================================================================================================================================
                                                                        N O T I F I C A T I O N S
==================================================================================================================================================================================================
*/

// Notification Function
function notifications() {
    if (document.getElementById('chat').classList.contains('active')) {
        document.getElementById('chat-noti').innerHTML = '';
    }
}

// Notification Sound
function sound(sound) {
    const audio = new Audio(`/sounds/${sound}.mp3`);
    audio.play();
}

setInterval(function() {
    notifications();
}, 100);

/*
==================================================================================================================================================================================================
                                                                            W H I T E B O A R D
==================================================================================================================================================================================================
*/

let pencilColor = 'black';
let pencilWidth = 5;

// Function to Create a Whiteboard
function whiteBoard() {

    isWhiteBoard = true;

    const div = document.createElement('div');
    div.style.padding = '5px';
    div.setAttribute('id', 'canvas');

    const div1 = document.createElement('div');
    div1.classList.add('box-position');


    div1.innerHTML = `<div class="white-board-icons" style="" id="" onclick="cross()">
    <i class="fas fa-times"></i>
        </div>
        <div class="white-board-icons" style="top:50px;" id="" onclick="pencil()">
        <i class="fas fa-pencil-alt"></i>
        </div>
        <div class="white-board-icons" style="top:100px;" id="" onclick="eraser()">
        <i class="fas fa-eraser"></i>
        </div>
        <div class="white-board-icons colour" style="top:150px; background-color:red;" id="" onclick="red()">
        </div>
        <div class="white-board-icons colour" style="top:200px; background-color:green;" id="" onclick="green()">
        </div>
        <div class="white-board-icons colour" style="top:250px; background-color:blue;" id="" onclick="blue()">
        </div>
        <div class="white-board-icons colour" style="top:300px; background-color:yellow;" id="" onclick="yellow()">
        </div>`;

    const canvas = document.createElement('canvas');

    div1.appendChild(canvas);
    div.appendChild(div1);

    for (let i = 0; i < videoGrid1.childNodes.length; i++) {
        videoGrid1.childNodes[i].style.display = 'none';
    }

    div.classList.add('resize');

    videoGrid1.appendChild(div);


    const ctx = canvas.getContext('2d');

    let painting = false;
    let lastX = 0;
    let lastY = 0;

    canvas.style.width = '100%';
    canvas.style.height = '100%';

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';


    console.log(ctx)

    function startPosition(e) {
        painting = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    function finishPosition(e) {
        painting = false;
    }

    // Function for Drawing the design and sending the coordinates, pencil-color and pencil-width immediately to other users.
    function draw(e) {

        if (!painting) return;

        ctx.strokeStyle = pencilColor;
        ctx.lineWidth = pencilWidth;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);

        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();

        socket.emit('draw', lastX, lastY, e.offsetX, e.offsetY, pencilColor, pencilWidth);

        lastX = e.offsetX;
        lastY = e.offsetY;
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishPosition);
    canvas.addEventListener('mouseout', finishPosition);
    canvas.addEventListener('mousemove', draw);
}

// Whiteboard Connection
socket.on('drawing', (lastX, lastY, offsetX, offsetY, pencilColor, pencilWidth) => {

    const canvas = document.querySelector('canvas');
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = pencilColor;
    ctx.lineWidth = pencilWidth;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);

    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
});

// Functon to Remove the Whiteboard and Make Videos visible
function cross() {
    isWhiteBoard = false;

    console.log(videoGrid1.childNodes)

    for (let i = 0; i < videoGrid1.childNodes.length; i++) {
        const tempId = videoGrid1.childNodes[i].getAttribute('id');
        console.log(videoGrid1.childNodes[i])
        if (tempId !== 'canvas') {
            videoGrid1.childNodes[i].style.display = 'block';
        } else {
            videoGrid1.removeChild(videoGrid1.childNodes[i]);
            i--;
        }
    }

    gridCheck();
}

// Function to use Pencil
function pencil() {
    pencilColor = 'black';
    pencilWidth = 5;
}

// Function to use Pencil with Red Colour
function red() {
    pencilColor = 'red';
    pencilWidth = 5;
}

// Function to use Pencil with Green Colour
function green() {
    pencilColor = 'green';
    pencilWidth = 5;
}

// Function to use Pencil with Blue Color
function blue() {
    pencilColor = 'blue';
    pencilWidth = 5;
}

// Function to use Pencil with Yellow Colour
function yellow() {
    pencilColor = 'yellow';
    pencilWidth = 5;
}

// Function to use Eraser
function eraser() {
    pencilColor = 'white';
    pencilWidth = 10;
}