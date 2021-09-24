// This is 'script.js' File of Connect - A JS File containing all other required js information

// Today's Time, Day and Date
const d = new Date();
const datestring = d.getHours() + ":" + d.getMinutes() + ", " + d.getDate()  + "-" + (d.getMonth()+1) + "-" + d.getFullYear() + " ";
document.getElementById('date-time').innerHTML = datestring;

// Copy to Clipboard function - Meeting Room ID
function roomID() {
    
    const copyText = document.getElementById("roomId");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    
    alert("Meeting Room ID Copied: " + copyText.value);
}

// Copy to Clipboard function - Meeting Room URL
function roomURL() {
    
    const copyText = document.getElementById("roomURL");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);

    alert("Meeting Link Copied: " + copyText.value);
}