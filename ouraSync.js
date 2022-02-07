// create click handler for Oura Sync button
if (window.ouraButton) document.removeEventListener(ouraButton.buttonClickHandler);
else window.ouraButton = {};

ouraButton.buttonClickHandler = async (e) => {
  if (e.target.tagName === 'BUTTON' ){
    let block = e.target.closest('.roam-block');
    if (!block) return;
    let uid = block.id.substring(block.id.length - 9);
    let content = await window.roamAlphaAPI.q(`[:find (pull ?block [:block/string]) 
					:where [?block :block/uid "${uid}"]]`)[0][0].string;
    if (!content) return;
    console.log(content);
    if (content === '{{Oura Sync}}'){
      window.roamAlphaAPI.updateBlock({
            block: {
                uid: uid,
                string: "**Oura data**:"
            }
        });
      addData(uid);
    };
    
  }
}

document.addEventListener("click", ouraButton.buttonClickHandler, false);

//place oura v1 api token here
let token = "XXXX"

//get current date
const today = new Date();
const yesterday = new Date(today)
yesterday.setDate(yesterday.getDate() - 1)

function formatDate(date){
  let dd = String(date.getDate()).padStart(2, '0');
  let mm = String(date.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();

  return `${yyyy}-${mm}-${dd}`;
}



//get data from API
async function getSleepData(){
  let api_url = `https://api.ouraring.com/v1/sleep?start=${formatDate(yesterday)}&end=${formatDate(today)}&access_token=${token}`;

  let response = await fetch(api_url)
  let data = await response.json()
  
  return data;
}

//create new block and place data 

//remember uid of daily page is dd-mm-yyyy
function uidForToday() {
    let today = new Date
    let yyyy = today.getFullYear()
    let mm = (today.getMonth() + 1).toString().padStart(2, '0')
    let dd = today.getDate().toString().padStart(2, '0')
    return `${mm}-${dd}-${yyyy}`
  }

async function addData(uid){
  // let page_uid = uidForToday();

  // let block_uid = window.getChildBlock(page_uid, "**Oura data**:");
  
  
  getSleepData().then( (data) => {
    addDayStart(data, uid);
    addSleep(data, uid);
  });
}

function addDayStart(data, page_uid){
  let day_start = new Date(data['sleep'][0]['bedtime_end']);

  var minute = String(day_start.getMinutes()).padStart(2, '0');
  var hour = String(day_start.getHours()).padStart(2, '0'); 

  
  
    window.roamAlphaAPI.createBlock(
    {
      "location": {"parent-uid": page_uid, "order": 0},
      "block": {"string": `Wake-up time:: ${hour}:${minute}`}
    }
  );
}

function addSleep(data, page_uid){
  let score = data['sleep'][0]['score'];
  total_sleep = Number(data['sleep'][0]['total']);

  let h = Math.floor(total_sleep / 3600);
  let m = Math.floor(total_sleep % 3600 / 60);
  
  window.roamAlphaAPI.createBlock(
    {
      "location": {"parent-uid": page_uid, "order": 0},
      "block": {"string": `Sleep score:: ${score}`}
    }
  );
  window.roamAlphaAPI.createBlock(
    {
      "location": {"parent-uid": page_uid, "order": 0},
      "block": {"string": `Total sleep:: ${h}:${m} hours`}
    }
  );
}



