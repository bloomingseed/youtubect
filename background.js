
function initMeta(){
    if(globalThis.meta==undefined){
        globalThis.meta = { spreadSheetUrl:"https://docs.google.com/spreadsheets/d/1oHExaxzet-1_2Jm3_vi1tasZjLQLl1dVozOnlb-BEmI",
                            spreadSheetTabId:undefined,
                            spreadSheetRequest:undefined,
                            tabsList:[] };
    }
}    
/**
 * Called when new tab is created
 * params: tab: tab object that is created.
 */
function onTabCreatedListener(tab){
    try{
        initMeta();
    } catch(e){console.log(e);}
    globalThis.meta.tabsList.push(tab.id);
}
/**
 * Called when a tab gets updated (refreshed, navigated, or internal updates?)
 */
function onTabUpdatedListener(tabId,changeInfo,tab){
    try{
        initMeta();
    } catch(e){console.log(e);}
    console.log(`Tab ${tabId} updated`)
    if(tab.url.indexOf(meta.spreadSheetUrl)>-1){
        console.log(`Detected our spreadsheet at tab#${tabId}.`)
        globalThis.meta.spreadSheetTabId=tabId;     // sets the current spreadsheet tab's ID
    }
    if(globalThis.meta.spreadSheetRequest &&    // checks if the spreadsheet request has been initialized
        tab.url === globalThis.meta.spreadSheetRequest.url){     // checks if it's the requested url
        console.log('Found requested Youtube URL.');
        chrome.scripting.executeScript({    // inject content.js script
            target:{tabId},
            files: ['content.js']
        });
        console.log('Injected content script.')
    }
    if(tab.url.indexOf('https://www.youtube.com/')>-1){
        console.log("Found youtube tab");
        console.log(tab.url,tab);
    }
}
/**
 * Called when the extension side receives a message from its content script
 */
function onMessageListener(request, sender, sendResponse){
    console.log(request);
    // sets spreadsheet request
    if(sender.id == globalThis.meta.spreadSheetTabId){
        console.log('Received request from our spreadsheet.');
        // let {url, timeout, comment} = request;
        // globalThis.meta.spreadSheetRequest = {url,timeout,comment}
    } else{
        // sends comment url to spreadsheet tab
        console.log('Received comment URL from requested Youtube URL.');
        // chrome.tabs.sendMessage(globalThis.meta.spreadSheetTabId, request);
    }

}
/**
 * Called when received a message sent to this extension ID
 */
function onExternalMessageListener(request,sender,sendResponse){
    console.log(request,sender);
    if(sender.id == globalThis.meta.spreadSheetTabId){
        console.log('Received request from our spreadsheet.');
        // let {url, timeout, comment} = request;
        // globalThis.meta.spreadSheetRequest = {url,timeout,comment}
    }
}
// Events subscribing
try{
    chrome.tabs.onCreated.addListener(onTabCreatedListener);
    chrome.tabs.onUpdated.addListener(onTabUpdatedListener);
    chrome.runtime.onMessage.addListener(function(req,s,res){
        if(s.tab) {
            onMessageListener(req,s,res)
        }
    });
    chrome.runtime.onMessageExternal.addListener(onExternalMessageListener);
} catch(e){console.log(e);}
