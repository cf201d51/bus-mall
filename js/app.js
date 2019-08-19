'use strict';

/*

Write constructor function to create busMallItem objects,
and add them to an array.

busMallItem objects include the following properties:
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

