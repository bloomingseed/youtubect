function isYoutubeUrlMatchFormat(url,output){
    let parts = url.split('?');
    if(parts.length!=2) return false;
    if(parts[0]!='https://www.youtube.com/watch') return false;
    let q = new URLSearchParams(parts[1]);
    let arr = ['timeout','comment','row','col'];
    for(let key of arr){
        if(q.get(key)==null) return false;
        output[key] = q.get(key);
    }
    return true;
}
function getTabListInstance(){
    if(globalThis.tabList==undefined){
        globalThis.tabList = [];
    }
    return globalThis.tabList;
}
/**
 * Called when a tab gets updated (refreshed, navigated, or internal updates?)
 */
function onTabUpdatedListener(tabId,changeInfo,tab){
    console.log(`TabId ${tabId}, Url ${tab.url}: updated.`);
    let output = {};
    let url = tab.url;
    if(!isYoutubeUrlMatchFormat(url,output)) return;    // ensures this url matches our format
    let tabList = getTabListInstance();
    if(tabList.indexOf(tabId)!=-1) return;  // ensures this tab id is not listed
    tabList.push(tabId);    // adds this tab id to list
    chrome.scripting.executeScript({    // inject content.js script
        target:{tabId},
        files: ['content.js']
    });
    console.log(`TabId ${tabId}, Url ${tab.url}: script injected.`);
}
function isMessageMatchFormat(msg){
    let arr = ['commentUrl','row','col'];
    for(let key of arr){
        if(msg[key]==undefined) return false;
    }
    return true;
}
/**
 * Called when receives message from a tab
 */
function onMessageListener(request, sender, sendResponse){
    let tabId = sender.tab.id;
    console.log(`TabId ${tabId}: ${request}.`);    
    if(!isMessageMatchFormat(request)) return;  // ensures sender's message contains our data
    let tabList = getTabListInstance();
    let indx = tabList.indexOf(tabId);  // gets index of this tabId in the list 
    if(indx==-1) return;  // ensures this tab id is in the list
    tabList.pop(indx);  // removes this tab id from the listed tabIds
    let {commentUrl, row, col} = request;
    // TODO: call GAS using Execution API here
}
// Events subscribing
try{
    chrome.tabs.onUpdated.addListener(onTabUpdatedListener);
    chrome.runtime.onMessage.addListener(function(req,s,res){
        if(s.tab) {     // checks if message comes from a tab
            onMessageListener(req,s,res)
        }
    });
} catch(e){console.log(e);}
