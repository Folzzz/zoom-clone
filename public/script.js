// const { text } = require("body-parser");

// import socket.io
const socket = io('/');
// peer connection
const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});
// newcall ejs file
const videoGrid = document.getElementById('video-grid');
const chatInput = document.getElementById('chat_message');
const ul = document.querySelector('.messages');
const chatWindow = document.querySelector('.main__chat_window');

// create a video element to show our video in the page
const myVideo = document.createElement('video');

let myVideoStream;
const peers = {};

// mute the video
myVideo.muted = true;

// access our video and audio
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {

    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    // answer the user call and add his video stream
    peer.on('call', call => {
        call.answer(stream);
        const video = document.createElement('video');
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream);
        });
    });

    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    });
  })
  .catch(err => console.log(err));

//func to connect to new user - send stream
const connectToNewUser = (userId, stream) => {
    // call the user with the userid
    const call = peer.call(userId, stream);
    const video = document.createElement('video');

    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
    });

    call.on('close', () => {
        video.remove();
    });

    peers[userId] = call;
}

// disconnect user
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
})

// peer
peer.on('open', id => {
    // emit socket.io to join room
    socket.emit('join-room', ROOM_ID, id);
})

// func to add stream to html video grid
const addVideoStream = (video, stream) => {
    //play the stream
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    });
    // add video to grid
    videoGrid.append(video);
}


// event listener for chat input
chatInput.addEventListener('keydown', (e) => {
    // let text = chatInput.value;
    if (e.key == 'Enter' && chatInput.value.length !== 0) {
        console.log(chatInput.value);
        socket.emit('message', chatInput.value);
        chatInput.value = '';
    }
})

// scroll function for chat section
const scrollToBottom = () => {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// to receive and display typed messgae
socket.on('createMessage', message => {
    console.log(`this is a message from the server: ${message}`);
    const li = document.createElement('li');
    li.classList.add('message');
    li.innerHTML = `<span>User</span><br/>${message}`;
    ul.append(li);
    // scroll function for the chat section
    scrollToBottom();
})

// stop and mute button

// mute and unmute
const setMuteButton = () => {
    const html = `
        <i class="fa-solid fa-microphone"></i>
        <span>Mute</span>
    `;
    document.querySelector('.main__mute_button').innerHTML = html;
}
const setUnmuteButton = () => {
    const html = `
        <i class="stop fa-solid fa-microphone-slash"></i>
        <span>Unmute</span>
    `;
    document.querySelector('.main__mute_button').innerHTML = html;
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

// start and stop video
const setPlayVideo = () => {
    const html = `
        <i class="stop fa-solid fa-video-slash"></i>
        <span>Play Video</span>
    `;
    document.querySelector('.main__video_button').innerHTML = html;
}
const setStopVideo = () => {
    const html = `
        <i class="fa-solid fa-video"></i>
        <span>Stop Video</span>
    `;
    document.querySelector('.main__video_button').innerHTML = html;
}
// stop video
const playStop = () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}