'use strict';

var displayAtOnce = 3;
var votesPerSession = 25;

// Find the element to receive the output
var reportContainer = document.getElementById('report_container');

// Local storage for game state
var gameState = {
  voteCount: 0,
  currentSet: [],
  previousSet: [],

  storeGameState: function () {
    var str = JSON.stringify(gameState);
    localStorage.setItem('gameState', str);
  },

  getGameState: function () {
    var record = JSON.parse(localStorage.getItem('gameState'));
    if (record) {
      this.voteCount = record.voteCount;
      this.currentSet = record.currentSet;
      this.previousSet = record.previousSet;
    }
  },

  incrementVoteCount: function () {
    this.voteCount++
    this.storeGameState();
  },

  reset: function () {
    this.voteCount = 0;
    this.currentSet = [];
    this.previousSet = [];
    this.storeGameState();
  },

  getNextRandomSet = function () {
    this.previousSet = this.currentSet;
    this.currentSet = [];
    for (var i = 1; i <= displayAtOnce; i++) {
      this.currentSet.push(this.getNextRandomItem());
    }
  },

  getNextRandomItem = function () {
    tryAgain: do {
      var x = Math.floor(Math.random() * BusMallItem.list.length);

      for (i = 0; i < this.previousSet.length; i++) {
        if (x === this.previousSet[i]) {
          continue tryAgain;
        }
      }
      for (var i = 0; i < this.currentSet.length; i++) {
        if (x === this.currentSet[i]) {
          continue tryAgain;
        }
      }
      break;
    } while (true);
    return x;
  },

};

/**
 * Constructor function for BusMallItem objects
 *
 * @param {*} aPath The path to the image file
 * @param {*} aCaption The caption to be displayed for the item
 */
function BusMallItem(aPath, aCaption) {
  this.path = aPath;
  this.caption = aCaption;

  var record = JSON.parse(localStorage.getItem(`$item_${aPath}`));
  if (record) {
    this.voteCount = record.voteCount;
    this.displayCount = record.displayCount;
  } else {
    this.voteCount = 0;
    this.displayCount = 0;
    this.updateLocalStorage();
  }
  this.index = BusMallItem.list.push(this) - 1;
}

// Array of BusMall item objects
BusMallItem.list = [];

BusMallItem.prototype.updateLocalStorage = function () {
  var record = {
    voteCount: this.voteCount,
    displayCount: this.displayCount
  }
  var str = JSON.stringify(record);
  localStorage.setItem(`$item_${path}`, str);
};

BusMallItem.prototype.incrementDisplayCount = function () {
  this.displayCount++;
  this.updateLocalStorage();
};

BusMallItem.prototype.incrementVoteCount = function () {
  this.voteCount++;
  this.updateLocalStorage();
};

function onItemClick(event) {
  var index = parseInt(event.target.id);
  var item = BusMallItem.list[index];
  item.incrementVoteCount;
  gameState.incrementVoteCount;
  console.log('Vote Count: ', gameState.voteCount);
  if (gameState.voteCount >= votesPerSession) {
    clearItemDisplay();
    gameState.reset();
    renderResults();
  } else {
    doNextSet();
  }
}

BusMallItem.prototype.render = function () {
  var id = `${this.index}`;
  var el = addElement(undefined, 'figure', '', 'item_class', id);
  addElement(el, 'img', undefined, undefined, id).src = this.path;
  addElement(el, 'figcaption', this.caption, undefined, id);
  el.addEventListener('click', onItemClick);
  return el;
};

function clearItemDisplay() {
  var itemDisplay = document.getElementById('item_display');
  clearElement(itemDisplay);
}

function renderCurrentSet() {
  var itemDisplay = document.getElementById('item_display');
  clearElement(itemDisplay);
  addElement(itemDisplay, 'div', `${gameState.voteCount} of ${votesPerSession}`,null,'item_display');

  for (var i = 0; i < gameState.currentSet.length; i++) {
    var item = BusMallItem.list[gameState.currentSet[i]];
    itemDisplay.appendChild(item.render());
    item.displayCount++;
  }
  itemDisplay.scrollIntoView(true);
}

function onClickRunAgain(e) {
  doNextSet();
}

function renderResultsAsList() {
  for (var i = 0; i < BusMallItem.list.length; i++) {
    var item = BusMallItem.list[i];
    var reportLine = `${item.caption}: ${item.voteCount} votes out of ${item.displayCount} times displayed`;
    addElement(reportContainer, 'p', reportLine);
  }
}

function renderResultsAsTable() {

}

function renderResultsAsChart() {
//  <canvas id="report_canvas"></canvas>
  var canvas = addElement(reportContainer, 'canvas', undefined, undefined, 'report_canvas');
  var ctx = canvas.getContext('2d');
  var labels = [];
  var countData = [];
  var percentData = [];

  for (var i = 0; i < BusMallItem.list.length; i++) {
    var item = BusMallItem.list[i];
    labels.push(item.caption);
    countData.push(item.voteCount);
    percentData.push(Math.round((item.voteCount / item.displayCount) * 100));
  }

  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: labels,
      datasets: [{
        label: 'Number of Votes',
        backgroundColor: 'rgb(209, 43, 43)',
        // borderColor: 'rgb(255, 99, 132)',
        data: countData,
        yAxisID: 'left-y-axis',
      }, {
        label: 'Percent of Time Selected when Displayed',
        backgroundColor: 'rgb(42, 207, 207)',
        // borderColor: 'rgb(255, 99, 132)',
        data: percentData,
        yAxisID: 'right-y-axis',
      }]
    },

    // Configuration options go here
    options: {
      scales: {
        yAxes: [{
          id: 'left-y-axis',
          type: 'linear',
          position: 'left'
        }, {
          id: 'right-y-axis',
          type: 'linear',
          position: 'right'
        }]
      }
    }
  });
}

function renderResults() {
  clearElement(reportContainer);
  renderResultsAsChart();
  
  var btn = addElement(reportContainer, 'button', 'Run Again');
  btn.addEventListener('click', onClickRunAgain);
  reportContainer.scrollIntoView(true);
}

function doNextSet() {
  console.log('NextSet');
  gameState.getNextRandomSet();
  renderCurrentSet();
}

function restoreGameState() {
  // Load the previous game state if there is one
  gameState.getGameState();
  if (gameState.currentSet.length > 0) {
    renderCurrentSet();
  } else {
    doNextSet();
  }
}

function initializeBusMall() {
  // Load all BusMallItem objects
  new BusMallItem('assets/images/bag.jpg', 'Bag');
  new BusMallItem('assets/images/banana.jpg', 'Banana');
  new BusMallItem('assets/images/bathroom.jpg', 'Bathroom');
  new BusMallItem('assets/images/boots.jpg', 'Boots');
  new BusMallItem('assets/images/breakfast.jpg', 'Breakfast');
  new BusMallItem('assets/images/bubblegum.jpg', 'Bubblegum');
  new BusMallItem('assets/images/chair.jpg', 'Chair');
  new BusMallItem('assets/images/cthulhu.jpg', 'Cthulhu');
  new BusMallItem('assets/images/dog-duck.jpg', 'Dog-Duck');
  new BusMallItem('assets/images/dragon.jpg', 'Dragon');
  new BusMallItem('assets/images/pen.jpg', 'Pen');
  new BusMallItem('assets/images/pet-sweep.jpg', 'Pet-Sweep');
  new BusMallItem('assets/images/scissors.jpg', 'Scissors');
  new BusMallItem('assets/images/shark.jpg', 'Shark');
  new BusMallItem('assets/images/sweep.png', 'Sweep');
  new BusMallItem('assets/images/tauntaun.jpg', 'Taun-taun');
  new BusMallItem('assets/images/unicorn.jpg', 'Unicorn');
  new BusMallItem('assets/images/usb.gif', 'USB');
  new BusMallItem('assets/images/water-can.jpg', 'Water Can');
  new BusMallItem('assets/images/wine-glass.jpg', 'Wine Glass');

  // protect against infinite loop!
  if (displayAtOnce * 2 > BusMallItem.list.length) {
    alert(`Can't display ${displayAtOnce} in two sets without duplicating!`);
  } else {
    restoreGameState();
  }
}

// Helper Functions -----------------------------------------------------

/**
 * This is a helper function to add an element with given tag name optional text, class name, and id to the given parent
 *
 * @param {*} parent
 * @param {*} tagName
 * @param {*} text
 * @param {*} className
 * @param {*} id
 * @returns
 */
function addElement(parent, tagName, text, className, id) {
  var newElement = document.createElement(tagName);
  if (text) {
    newElement.textContent = text;
  }
  if (className) {
    newElement.className = className;
  }
  if (id) {
    newElement.id = id;
  }
  if (parent) {
    parent.appendChild(newElement);
  }
  return newElement;
}

function clearElement(element) {
  // Clear it the below is faster than main.innerHTML = '';
  // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

initializeBusMall();

/*

Write constructor function to create BusMallItem objects,
and add them to an array.

BusMallItem objects include the following properties:
- path to image file
- caption
- number of times shown
- number of times selected

Should code reference busMallItem objects by object variable reference,
or by list index number?

Maintain an array for the currently displayed set,
and another array for the previous set.

Function to generate a random selection not in the current or previous set.
- Loop
  - Get random number representing the list index of an item (0 - list length)
  - Compare with all items of the current and previous set arrays.
  - If there was no previous set the array should be empty.
- Repeat the loop if the random number is found in either array.

Function to render set on the page.  Each item should have:
- Image
- Caption
- id attribute based on the index of the item
- Click event listener

- Use a global variable to count votes.
- When the vote count reaches(or exceeds) 25,
  - reset the vote count to zero
  - remove event listeners on the item images
  - display the result report

Function to render results report.

*/

