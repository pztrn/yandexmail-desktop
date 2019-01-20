console.log(window);
var ipc = require("electron").ipcRenderer;

function checkForUnreads() {
    unread = parseInt(document.title.split(" ")[0]);
    if (typeof (unread) != NaN && unread > 0) {
        ipc.send('has-unread', unread);
    } else {
        ipc.send('has-no-unread');
    };
}

setInterval(checkForUnreads, 1000);