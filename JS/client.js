const socket = io('http://localhost:8000');
const form = document.getElementById('send-container');
const messageInput = document.getElementById('messageInp');
const messageContainer = document.querySelector('.container');
const localVideo = document.getElementById('localVideo');
const remoteVideo = document.getElementById('remoteVideo');
const startCallBtn = document.getElementById('startCall');
const endCallBtn = document.getElementById('endCall');
const videoModal = document.getElementById('videoModal');
const closeModalBtn = document.getElementsByClassName('close')[0];

let localStream;
let remoteStream;
let pc; 

var audio = new Audio('ting.mp3');

// Function to format the current time
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

startCallBtn.addEventListener('click', async () => {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideo.srcObject = localStream;

        // Initialize peer connection
        pc = new RTCPeerConnection();

        // Add local stream to peer connection
        localStream.getTracks().forEach(track => pc.addTrack(track, localStream));

        // Set remote video stream when received
        pc.ontrack = event => {
            remoteVideo.srcObject = event.streams[0];
        };

        // Offer SDP
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        // Display video call modal
        videoModal.style.display = "block";

        // Close the modal if the user clicks on the close button
        closeModalBtn.onclick = function () {
            videoModal.style.display = "none";
        }
    } catch (error) {
        console.error('Error starting call:', error);
    }
});

// Function to handle ending the call
endCallBtn.addEventListener('click', async () => {
    try {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        remoteVideo.srcObject = null;
        pc.close();
        videoModal.style.display = "none";
    } catch (error) {
        console.error('Error ending call:', error);
    }
});

const append = (message, position) => {
    const messageElement = document.createElement('div');
    const timeElement = document.createElement('span');
    timeElement.classList.add('timestamp');
    timeElement.innerText = getCurrentTime();

    messageElement.innerText = message;
    messageElement.classList.add('message');
    messageElement.classList.add(position);
    messageElement.appendChild(timeElement);

    messageContainer.append(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    if (position === 'left') {
        console.log('sound is playing');
        audio.play();
    }
}

document.getElementById('endCall').addEventListener('click', function () {
    // Function to stop local video stream
    function stopLocalVideo() {
        const localVideo = document.getElementById('localVideo');
        localVideo.srcObject.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }

    // Function to stop remote video stream
    function stopRemoteVideo() {
        const remoteVideo = document.getElementById('remoteVideo');
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
    }

    // Function to close peer connection
    function closePeerConnection() {
        // Assuming `pc` is your RTCPeerConnection object
        if (pc) {
            pc.close();
            pc = null;
        }
    }

    // Function to hide video modal
    function hideVideoModal() {
        const videoModal = document.getElementById('videoModal');
        videoModal.style.display = 'none';
    }

    // Call the functions to end the video call
    stopLocalVideo();
    stopRemoteVideo();
    closePeerConnection();
    hideVideoModal();
});

//cursor 
const coords = { x: 0, y: 0 };
    const circles = document.querySelectorAll(".circle");

    const colors = [
      "#ffb56b",
      "#fdaf69",
      "#f89d63",
      "#f59761",
      "#ef865e",
      "#ec805d",
      "#e36e5c",
      "#df685c",
      "#d5585c",
      "#d1525c",
      "#c5415d",
      "#c03b5d",
      "#b22c5e",
      "#ac265e",
      "#9c155f",
      "#950f5f",
      "#830060",
      "#7c0060",
      "#680060",
      "#60005f",
      "#48005f",
      "#3d005e"
    ];

    circles.forEach(function (circle, index) {
      circle.x = 0;
      circle.y = 0;
      circle.style.backgroundColor = colors[index % colors.length];
    });

    window.addEventListener("mousemove", function (e) {
      coords.x = e.clientX;
      coords.y = e.clientY;

    });

    function animateCircles() {

      let x = coords.x;
      let y = coords.y;

      circles.forEach(function (circle, index) {
        circle.style.left = x - 12 + "px";
        circle.style.top = y - 12 + "px";

        circle.style.scale = (circles.length - index) / circles.length;

        circle.x = x;
        circle.y = y;

        const nextCircle = circles[index + 1] || circles[0];
        x += (nextCircle.x - x) * 0.3;
        y += (nextCircle.y - y) * 0.3;
      });

      requestAnimationFrame(animateCircles);
    }

    animateCircles();
    //
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value;
    append(`You: ${message}`, 'right');
    socket.emit('send', message);
    messageInput.value = '';
});

const name = prompt("Enter your name to join LetsChat");
socket.emit('new-user-joined', name);

socket.on('user-joined', name => {
    append(`${name} joined the chat`, 'right');
});

socket.on('receive', data => {
    append(`${data.name}: ${data.message}`, 'left');
});

socket.on('left', name => {
    append(`${name} left the chat`, 'left');
});
