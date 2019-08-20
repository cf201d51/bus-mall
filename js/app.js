'use strict';

var displayAtOnce = 4;
var votePerSession = 25;
var voteCount = 0;

var currentSet = [];
var previousSet = [];

/**
 * Constructor function for BusMallItem objects
 *
 * @param {*} aPath The path to the image file
 * @param {*} aCaption The caption to be displayed for the item
 */
function BusMallItem(aPath, aCaption) {
  this.path = aPath;
  this.caption = aCaption;
  this.voteCount = 0;
  this.displayCount = 0;
  BusMallItem.list.push(this);
}

// Array of BusMall item objects
BusMallItem.list = [];

BusMallItem.getNextRandomItem = function () {
  newRandom: do {
    var x = Math.floor(Math.random() * this.list.length);

    for (i = 0; i < previousSet.length; i++) {
      if (x === previousSet[i]) {
        continue newRandom;
      }
    }
    for (var i = 0; i < currentSet.length; i++) {
      if (x === currentSet[i]) {
        continue newRandom;
      }
    }
    break;
  } while (true);
  return x;
};

BusMallItem.getNextRandomSet = function () {
  previousSet = currentSet;
  currentSet = [];
  for (var i = 1; i <= displayAtOnce; i++) {
    currentSet.push(this.getNextRandomItem());
  }
};

function test() {
  for (var i = 1; i <= 10; i++) {
    BusMallItem.getNextRandomSet();
    console.log(currentSet);
  }
}

function renderCurrentSet() {
  var itemDisplay = document.getElementById('report_container');
  clearElement(itemDisplay);

}


function renderResults() {
  // Find the element to receive the output
  var reportContainer = document.getElementById('report_container');
  clearElement(reportContainer);

}

function doNextSet() {
  BusMallItem.getNextRandomSet();
  renderCurrentSet();
}

function initializeBusMall() {
  new BusMallItem('/assets/images/bag.jpg', 'Bag');
  new BusMallItem('/assets/images/banana.jpg', 'Banana');
  new BusMallItem('/assets/images/bathroom.jpg', 'Bathroom');
  new BusMallItem('/assets/images/boots.jpg', 'Boots');
  new BusMallItem('/assets/images/breakfast.jpg', 'Breakfast');
  new BusMallItem('/assets/images/bubblegum.jpg', 'Bubblegum');
  new BusMallItem('/assets/images/chair.jpg', 'Chair');
  new BusMallItem('/assets/images/cthulhu.jpg', 'Cthulhu');
  new BusMallItem('/assets/images/dog-duck.jpg', 'Dog-Duck');
  new BusMallItem('/assets/images/dragon.jpg', 'Dragon');
  new BusMallItem('/assets/images/pen.jpg', 'Pen');
  new BusMallItem('/assets/images/pet-sweep.jpg', 'Pet-Sweep');
  new BusMallItem('/assets/images/scissors.jpg', 'Scissors');
  new BusMallItem('/assets/images/shark.jpg', 'Shark');
  new BusMallItem('/assets/images/sweep.png', 'Sweep');
  new BusMallItem('/assets/images/tauntaun.jpg', 'Taun-taun');
  new BusMallItem('/assets/images/unicorn.jpg', 'Unicorn');
  new BusMallItem('/assets/images/usb.gif', 'USB');
  new BusMallItem('/assets/images/water-can.jpg', 'Water Can');
  new BusMallItem('/assets/images/wine-glass.jpg', 'Wine Glass');

  // protect against infinite loop!
  if (displayAtOnce * 2 > BusMallItem.list.length) {
    alert(`Can't display ${displayAtOnce} in two sets without duplicating!`);
  } else {
    doNextSet();
  }
}

// Helper Functions -----------------------------------------------------

/**
 * This is a helper function to add an element with given tag name optional text and class names to the given parent
 *
 * @param {*} parent
 * @param {*} tagName
 * @param {*} text
 * @param {*} className
 * @returns
 */
function addElement(parent, tagName, text, className) {
  var newElement = document.createElement(tagName);
  if (text) {
    newElement.textContent = text;
  }
  if (className) {
    newElement.className = className;
  }
  if (parent) {
    parent.appendChild(newElement);
  }
  return newElement;
}

function clearElement(element) {
  // Clear it
  // the below is faster than main.innerHTML = '';
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

