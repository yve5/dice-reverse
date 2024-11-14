export const Battle = function () {
  this.dn = 0; // Dice number (position to stop)
  this.arm = 0; // Dice color
  this.dmax = 0; // Number of Dice
  this.deme = [0, 0, 0, 0, 0, 0, 0, 0];
  this.sum = 0;
  this.fin = [0, 0, 0, 0, 0, 0, 0, 0]; // end flag
  this.usedice = [0, 1, 2, 3, 4, 5, 6, 7]; // Dice to use
};
