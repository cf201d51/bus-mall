'use strict';
// @ts-check

var displayAtOnce = 3;
var votesPerSession = 25;

// Find the element to receive the output
var reportContainer = document.getElementById('report_container');

/**
 * The global gameState object maintains the state of the application so it can be
 * stopped and resumed at any point by the user.
 *
 * This object uses local storage to track the following:
 *
 * - The current total vote count
 * - An array for the currently displayed set
 * - Another array for the previous set
 *
 * In addition to this object, the BusMallItem objects maintain in local storage
 * the display and vote counts for each Bus Mall item.
 */

// Local storage for game state
var gameState = {
  voteCount: 0,
  currentSet: [],
  previousSet: [],

  /**
   * Store the current data tracked by the gameState object to local storage.
   *
   */
  storeGameState: function () {
    var str = JSON.stringify(gameState);
    console.log('Saving state: ', str);
    localStorage.setItem('gameState', str);
  },

  /**
   * Restore the last saved state of the game from local storage if it is there.
   * If not, default values remain.
   *
   */
  getGameState: function () {
    var record = JSON.parse(localStorage.getItem('gameState'));
    if (record) {
      this.voteCount = record.voteCount;
      this.currentSet = record.currentSet;
      this.previousSet = record.previousSet;
    }
  },

  /**
   * Increment the total number of votes and update in local storage.
   *
   */
  incrementVoteCount: function () {
    this.voteCount++;
    this.storeGameState();
  },

  /**
   * Reset the state of the game.
   *
   * This is called when the final report is generated so
   * that if the browser session is restarted, a new game is begun.
   *
   */
  reset: function () {
    this.voteCount = 0;
    this.currentSet = [];
    this.previousSet = [];
    this.storeGameState();
  },

  /**
   * Generates a new randomly selected set of items.
   *
   * Randomly selects items to form a new set of items with a size determined
   * by the `displayAtOnce` global variable such that:
   *
   * - No item is included more than once in the new set
   * - No item in the new set is included in the previous set
   *
   * The function updates `gameState.previousSet` with the current set
   * and leaves the newly generated set in `gameState.currentSet`.
   *
   * The updated sets are then posted in local storage.
   *
   */
  getNextRandomSet: function () {
    this.previousSet = this.currentSet;
    this.currentSet = [];
    for (var i = 1; i <= displayAtOnce; i++) {
      this.currentSet.push(this.getNextRandomItem());
    }
    this.storeGameState();
  },

  /**
   * Used internally by the `getNextRandomSet()` method.
   *
   * This method performs the random selection for each item in the set
   * created by `getNextRandomSet()`.
   *
   * @returns The index to `BusMallItem.list[]` array of the selected item.
   */
  getNextRandomItem: function () {
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
 * Constructor function for BusMallItem objects.
 *
 * In addition to image file path and caption, BusMallItem objects
 * use local storage to track:
 *
 * - The number of times the item is shown (`voteCount`)
 * - The number of times the item is selected (`displayCount`)
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
  this._preRenderedEl = this.render();
}

// Array of BusMall item objects
BusMallItem.list = [];

/**
 * Update local storage for the item
 */
BusMallItem.prototype.updateLocalStorage = function () {
  var record = {
    voteCount: this.voteCount,
    displayCount: this.displayCount
  };
  var str = JSON.stringify(record);
  localStorage.setItem(`$item_${this.path}`, str);
};

/**
 * Increment displayCount properties for all displayed items.
 *
 * This static method of the BusMallItem module increments display
 * counts for all currently displayed items as represented by the
 * `gamesState.currentSet[]` array.  Local storage will be updated
 * for each item.
 *
 */
BusMallItem.incrementDisplayCounts = function () {
  for (var i = 0; i < gameState.currentSet.length; i++) {
    var index = gameState.currentSet[i];
    this.list[index].incrementDisplayCount();
  }
};

/**
 * Increment the displayCount property.
 *
 * Call this to increment the displayCount.
 * The object will update local storage with the change.
 *
 */
BusMallItem.prototype.incrementDisplayCount = function () {
  this.displayCount++;
  this.updateLocalStorage();
};

/**
 * Increment the voteCount property.
 *
 * Call this to increment the voteCount.
 * The object will update local storage with the change.
 *
 */
BusMallItem.prototype.incrementVoteCount = function () {
  this.voteCount++;
  this.updateLocalStorage();
};

/**
 * Renders the item to a <figure> element with an event handler that
 * captures click events that bubble up from the child <img> and <figcaption>
 * elements that each have id attributes that correspond to the index
 * of this item in the BusMallItem.list array.
 *
 * @returns the rendered element to be inserted into the DOM by the caller
 */
BusMallItem.prototype.render = function () {
  if (this._preRenderedEl)
    return this._preRenderedEl;
  else {
    var id = `${this.index}`;
    var el = addElement(undefined, 'div', '', 'item_cell', id);
    var fig = addElement(el, 'figure', '', 'item_class', id);
    var img = addElement(fig, 'img', undefined, undefined, id);
    img.src = this.path;
    img.alt = `${this.caption} product image`;
    addElement(fig, 'figcaption', this.caption, undefined, id);
    fig.addEventListener('click', onItemClick);
    return el;
  }
};

/**
 * Click event handler for the clickable elements in the presented set.
 *
 * Votes are processed here!
 * - The vote count for the item represented by the clicked on element is incremented
 * - The display counts for all currently displayed items are incremented at this time
 * - The total vote count is incremented.
 *
 * If the is the last vote (gameState.voteCount >= votesPerSession) then
 * - The item display is cleared
 * - The game state is reset (vote count set to zero, current and previous sets are cleared)
 * - The result report is run
 *
 * Otherwise, if there are more votes to be made then
 * - doNextSet() is called
 *
 * @param {*} event
 */
function onItemClick(event) {
  var index = parseInt(event.target.id);
  var item = BusMallItem.list[index];

  item.incrementVoteCount();
  gameState.incrementVoteCount();
  BusMallItem.incrementDisplayCounts();

  if (gameState.voteCount >= votesPerSession) {
    clearItemDisplay();
    gameState.reset();
    renderResults();
  } else {
    doNextSet();
  }
}

function clearItemDisplay() {
  var itemDisplay = document.getElementById('item_display');
  clearElement(itemDisplay);
}

/**
 * Renders the current set to the `#item_display` `<div>` element.
 *
 */
function renderCurrentSet() {
  var itemDisplay = document.getElementById('item_display');
  clearElement(itemDisplay);
  addElement(itemDisplay, 'div', `Set ${gameState.voteCount + 1} of ${votesPerSession}`, null, 'vote_count');
  var innerDiv = addElement(itemDisplay, 'div', null, null, 'item_row');

  for (var i = 0; i < gameState.currentSet.length; i++) {
    var item = BusMallItem.list[gameState.currentSet[i]];
    var el = item.render();
    el.classList.remove('opaque');
    innerDiv.appendChild(el);
    item.displayCount++;
  }
  itemDisplay.appendChild(innerDiv);
  itemDisplay.scrollIntoView(true);
  window.setTimeout(toggleOpaque);
}

/**
 * Toggles the opaque class of the of the rendered figures in oder to trigger 
 * a fade-in transition.  This is called after a minimum delay by window.setTimeout
 * above in oder for the browser to register the adding of the opaque class as a 
 * transition rather an initial condition.
 *
 */
function toggleOpaque(force) {
  var el = document.getElementById('item_row');
  el.classList.toggle('opaque', force);
  // for (var i = 0; i < el.childElementCount; i++) {
  //   el.children[i].classList.toggle('opaque', force);
  // }
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
  // TODO: Finish renderResultsAsTable()
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
          position: 'left',
          ticks: {
            beginAtZero: true,
          }
        }, {
          id: 'right-y-axis',
          type: 'linear',
          position: 'right',
          ticks: {
            beginAtZero: true,
          }
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

function startGame() {
  console.log('Starting...')
  // protect against infinite loop!
  if (displayAtOnce * 2 > BusMallItem.list.length) {
    alert(`Can't display ${displayAtOnce} in two sets without duplicating!`);
  } else {
    restoreGameState();
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

  // Start the game after all image assets are loaded
  window.onload = startGame;
  // document.addEventListener('load', startGame);
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

/**
 * Removes all child elements from the given element.
 *
 * The method used is faster than ```element.innerHTML = ''``` according to
 * https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
 *
 * @param {*} element
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/************************************************************************** */

/**
 * Start the page!
 *
 */
function run() {
  initializeBusMall();
}

// Execution starts here!
run();

/*


Function to render set on the page.  Each item should have:
- Image
- Caption
- id attribute based on the index of the item
- Click event listener


*/
