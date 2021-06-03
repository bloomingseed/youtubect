// function injectJquery(){
//     let scriptElm = document.createElement('script');
//     scriptElm.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js';
//     document.body.appendChild(scriptElm);
// }
function validateRequest(request){
    return typeof(request.timeout)!='number' || typeof(request.comment)!='string';
}
function getViewportHeight(){
    return document.documentElement.clientHeight;
}
function getDocumentHeight(){
    let body = document.body;
    let html = document.documentElement;
    return Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
}
function getCommentElements(){
    let selector = '#header-author > yt-formatted-string > a';  // defines the selector
    return document.querySelectorAll(selector);
}
function stimulateKeyboardInput(target){
	let options = {code:"Space",key:" ",keyCode:32};
    let optionsInput = {data:' '};
        let events = [new FocusEvent('focus'), new KeyboardEvent('keydown',options), new KeyboardEvent('keypress',options), new InputEvent('input',optionsInput), new KeyboardEvent('keyup',options)];
    events.forEach(e=>target.dispatchEvent(e));  
    console.log('done');//debugging
}
function solve(root, cb){
	let queue = [];
    queue.push(root);
    while(queue.length>0){
        let node = queue.shift();	// pop head
        cb(node);
        let children = node.children;
        for(let i = 0; i<children.length; ++i){
            queue.push(children[i]);
        }
    }
}
function makeComment(comment){
    let interval = 100; // sets a small interval
    let t = setInterval(function(){
        console.log('checking webpage loaded..');
        if(getViewportHeight()/getDocumentHeight()>0.7) return; // checks if youtube has not finished loading
        clearInterval(t);   // stops checking if webpage is loaded
        let height = getDocumentHeight();   // gets current full document height
        scroll(0,getViewportHeight());  // scrolls to one viewport height
        let t2 = setInterval(function(){
            console.log('checking comments loaded..');
            if(height==getDocumentHeight()) return; // waits for youtube to load comments
            
            let commentBox = document.querySelector('#placeholder-area');    // gets the clickable comment box
            if(commentBox==null) return;
            
            clearInterval(t2);
            console.log('making comment..');
            commentBox.click();     // clicks onto the box so DOM renders the input area
            let commentInput = document.querySelector('#contenteditable-root');     // gets youtube comment input element
            commentInput.innerText = comment;   // sets the comment
            let root = document.querySelector('#creation-box');
            solve(root,stimulateKeyboardInput);     // sends key input to all these elements
            let commentButton = document.querySelector('#submit-button');
            console.log('comment ready');
            commentButton.click();  // clicks comment button
            let urls = getCommentElements();
            let t3 = setInterval(function(){
                let currUrls = getCommentElements();
                if(currUrls.length<= urls.length) return;
                
                clearInterval(t3);
                return currUrls[0].url;
            },interval);
        },interval);
    },interval);
}
function sendMessage(message){
    let payload = {message};
    chrome.runtime.sendMessage(payload);
    console.log('This is content script! we sent our extension a message',payload);
}
function main({timeout,comment}){
    // calls makeComment after `timeout` interval
    setTimeout(function(){
        let commentUrl = makeComment(comment);
        sendMessage(commentUrl);    // sends the url href to extension side
    },timeout)
}
// listens for messages
chrome.runtime.onMessage(function(request,sender,sendResponse){
    if(!sender.tab){    // checks if the message comes from the extension
        if(!validateRequest(request)){
            console.error({message:'Either timeout or comment param is not expected data types',request:request});
        } else{
            main(request);
        }
    }
})