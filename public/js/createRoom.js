// This is 'createRoom.js' File of Connect - A JS File containing the information about the meeting room

// Targeting Required variables by their respective "id's"
const cid = document.getElementById('copyId');
const curl = document.getElementById('copyUrl');
const copyText = document.getElementById("roomId");
const id = document.getElementById('id');
const url = document.getElementById('url');

// Filling the roomId value and url value
id.value = copyText.value;
url.value = `https://mane-meet.herokuapp.com/info/${copyText.value}`;

// Creating an Event Listener event
cid.addEventListener('click', copyId);
curl.addEventListener('click', copyUrl);

// Copy to Clipboard function - Meeting Room ID
function copyId() {

    console.log(id.value)
    id.select();
    id.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    
    alert( `Meeting Room Id Copied: ${copyText.value}`);
}

// Copy to Clipboard function - Meeting Room URL
function copyUrl() {
    
    console.log(url.value);
    url.select();
    url.setSelectionRange(0, 99999)
    navigator.clipboard.writeText(url.value);
    
    alert(`Meeting Link copied: ${url.value}`);
}