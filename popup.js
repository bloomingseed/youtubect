console.log('You opened my extension.');
document.body.style.backgroundColor=randomRgb();
function randomRgb(){
    let c = 'rgb('
    for(let i = 0; i<3; ++i){
        c+= Math.floor(Math.random()*256)
        if(i<2) c+=','
    }
    c+=')'
    return c;
}
const input = document.querySelector('input');
input.value = chrome.runtime.id;    // sets this extension's ID to the input box