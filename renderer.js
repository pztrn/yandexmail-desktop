// This file is loaded by Chromium engine and executes in browser.

console.log(window);
const ipc = require('electron').ipcRenderer;
const { shell } = require('electron')

// Unread mails check.
function checkForUnreads() {
    //var unread = parseInt($(".mail-MessagesFilters-Item_unread .mail-LabelList-Item_count").html());
    var unread = 0;
    items = document.getElementsByClassName('mail-LabelList-Item_count');
    for (var i = 0; i < items.length; i++) {
        var unreadInt = parseInt(items[i].innerHTML);
        if (typeof (unreadInt) != NaN && unreadInt > 0) {
            unread += unreadInt;
        }
    }

    if (unread > 0) {
        ipc.send('has-unread', unread);
    } else {
        ipc.send('has-no-unread');
    };
}

setInterval(checkForUnreads, 1000);

// Handle all clicks on links.
function clickHandler(event) {
    console.log(event);

    // We should check not only specified element, but also all other
    // parent elements until we found a.daria-goto-anchor.
    var linkFound = false;
    var link = "";
    if (!event.target.hasOwnProperty('href')) {
        for (var i = 0; i < event.path.length; i++) {
            if (event.path[i].tagName == 'A' && (event.path[i].className.indexOf('daria-goto-anchor') !== -1 || event.path[i].className.indexOf('mail-ui-IconList-Item') !== -1 && event.path[i].hostname != "mail.yandex.ru")) {
                linkFound = true;
                link = event.path[i].href;
                break;
            }
        }
    } else {
        linkFound = true;
        link = event.target.href;
    }

    if (linkFound) {
        event.preventDefault();
        shell.openExternal(link);
    } else {
        console.log("No external link found, doing nothing");
    }
}

document.addEventListener('click', clickHandler);