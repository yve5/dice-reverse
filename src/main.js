import { Game } from './game';
import { sayHello } from './utils';
import { SOUND_MANIFEST } from './resources/constants';

sayHello();

let canvas;
let stage;
let builder;
let touchdev = false;

// event function
// let timerFunc = new Function();
// timerFunc = null;
let timerFunc;

// let clickFunc = new Function();
// clickFunc = null;
let clickFunc;

// let moveFunc = new Function();
// moveFunc = null;
let moveFunc;

// let releaseFunc = new Function();
// releaseFunc = null;
let releaseFunc;

let waitcount = 0;
let stat = 0;

// game object
const game = new Game();
const instance = [];

// Display position
const org = {
  viewW: 840,
  viewH: 840,
  celW: 27,
  celH: 18,
  yposMes: 688,
  yposArm: 770,
}; // Original Size

let nume = 1;
let deno = 1;
let viewW;
let viewH;
let celW; // The size of the card and
let celH;
let yposMes; // Message, location of battle dice
let yposArm; // Status display position for each army
// let dot; // Size of 1 dot

// Cell drawing position
const cposX = [];
const cposY = [];

// Sprite
const spr = [];

// Sprite Number
let snArea = 0;
let snFrom = 0; // Sprite number of the attack source area
let snTo = 0; // Sprite number of the attack target area
let snDice = 0;
let snInfo = 0;
let snBan = 0;
let snPlayer = 0;
let snBattle = 0;
let snSupply = 0;
let snGameover = 0;
let snWin = 0;
let snTitle = 0;
let snPmax = 0;
let snLoad = 0;
let snMes = 0;
let snBtn = 0;
let snMax = 0; // Maximum number

const prio = []; // Display order of area dice
const an2sn = []; // Returns the dice sprite number from the area number

// button
let bmax = 0;
let activebutton = -1;
const btnFunc = [];

// battle class
const Battle = function () {
  this.dn = 0; // Dice number (position to stop)
  this.arm = 0; // Dice color
  this.dmax = 0; // Number of Dice
  this.deme = [0, 0, 0, 0, 0, 0, 0, 0];
  this.sum = 0;
  this.fin = [0, 0, 0, 0, 0, 0, 0, 0]; // end flag
  this.usedice = [0, 1, 2, 3, 4, 5, 6, 7]; // Dice to use
};

const battle = [];
let bturn = 0; // Turn for Battle

// For replaying history
let replayC = 0;

// Sound related
let soundon = true;

// Link
const toppage = () => {
  location.href = 'https://www.gamedesign.jp/';
};

// Resize to scale
const resize = (n) => (n * nume) / deno;

const playSound = (soundid) => {
  if (soundon) {
    instance[soundid].setVolume(0.5);
    instance[soundid].play();
  }
};

// Event listener group
const mouseDownListner = (e) => {
  if (clickFunc != null) {
    clickFunc(e);
  }
  canvas.style.cursor = 'default'; // Changing the mouse cursor
};

const mouseMoveListner = (e) => {
  if (moveFunc != null) {
    moveFunc(e);
  }
  canvas.style.cursor = 'default'; // Changing the mouse cursor
};

const mouseUpListner = (e) => {
  if (releaseFunc != null) {
    releaseFunc(e);
  }

  canvas.style.cursor = 'default'; // Changing the mouse cursor

  if (activebutton >= 0 && btnFunc[activebutton] != null) {
    playSound('snd_button');
    btnFunc[activebutton]();
  }
};

// button
const checkButton = () => {
  let sn;
  let n = -1;

  for (let i = 0; i < bmax; i += 1) {
    sn = snBtn + i;

    if (spr[sn].visible) {
      const pt = spr[sn].globalToLocal(stage.mouseX, stage.mouseY);

      if (spr[sn].hitTest(pt.x, pt.y)) {
        n = i;
      }
    }
  }

  if (activebutton === n) {
    return;
  }

  activebutton = n;

  for (let i = 0; i < bmax; i += 1) {
    if (i === activebutton) {
      spr[snBtn + i].getChildAt(0).gotoAndStop('press');
    } else {
      spr[snBtn + i].getChildAt(0).gotoAndStop('btn');
    }
  }
  stage.update();
};

const onTick = () => {
  if (timerFunc != null) {
    timerFunc();
  }
  checkButton();
};

const startSound = (soundid) => {
  instance[soundid] = createjs.Sound.createInstance(soundid); // Play SoundJS instance (specify id)
};

const handleFileLoad = (event) => {
  const item = { ...event.item };

  if (item.type === createjs.LoadQueue.SOUND) {
    startSound(item.id);
  }
};

const drawAreashape = (sn, area, paintMode) => {
  if (game.adat[area].size === 0) {
    spr[sn].visible = false;
    return;
  }

  spr[sn].visible = true;
  spr[sn].graphics.clear();

  let cnt = 0;
  let c = game.adat[area].line_cel[cnt];
  let d = game.adat[area].line_dir[cnt];

  const ax = [celW / 2, celW, celW, celW / 2, 0, 0, celW / 2];
  const s = (3 * nume) / deno;
  const ay = [-s, s, celH - s, celH + s, celH - s, s, -s];

  let lineColor = '#222244';
  if (paintMode) {
    lineColor = '#ff0000';
  }

  spr[sn].graphics.beginStroke(lineColor);

  const armcolor = [
    '#b37ffe',
    '#b3ff01',
    '#009302',
    '#ff7ffe',
    '#ff7f01',
    '#b3fffe',
    '#ffff01',
    '#ff5858',
  ];

  let color = armcolor[game.adat[area].arm];

  if (paintMode) {
    color = '#000000';
  }

  spr[sn].graphics
    .setStrokeStyle((4 * nume) / deno, 'round', 'round')
    .beginFill(color);

  let px = ax[d];
  let py = ay[d];
  spr[sn].graphics.moveTo(cposX[c] + px, cposY[c] + py);

  for (let i = 0; i < 100; i += 1) {
    // Draw a line first
    px = ax[d + 1];
    py = ay[d + 1];
    spr[sn].graphics.lineTo(cposX[c] + px, cposY[c] + py);
    cnt += 1;
    c = game.adat[area].line_cel[cnt];
    d = game.adat[area].line_dir[cnt];

    if (
      c === game.adat[area].line_cel[0] &&
      d === game.adat[area].line_dir[0]
    ) {
      break;
    }
  }
};

const drawAreadice = (sn, area) => {
  if (game.adat[area].size === 0) {
    spr[sn].visible = false;
    return;
  }

  spr[sn].visible = true;
  const n = game.adat[area].cpos;
  spr[sn].x = Math.floor(cposX[n] + (6 * nume) / deno);
  spr[sn].y = Math.floor(cposY[n] - (10 * nume) / deno);
  spr[sn].gotoAndStop(game.adat[area].arm * 10 + game.adat[area].dice - 1);
};

const drawPlayerData = () => {
  let pnum = 0;

  for (let i = 0; i < 8; i += 1) {
    spr[snPlayer + i].visible = false;
    const p = game.jun[i];

    if (game.player[p].area_tc > 0) {
      spr[snPlayer + i].visible = true;
      pnum += 1;
    }
  }

  let c = 0;
  for (let i = 0; i < 8; i += 1) {
    const p = game.jun[i];

    if (game.player[p].area_tc !== 0) {
      const sn = snPlayer + i;
      const w = (100 * nume) / deno;

      const ox = viewW / 2 - ((pnum - 1) * w) / 2 + c * w;

      spr[sn].x = ox; // -22*nume/deno;
      spr[sn].y = yposArm;
      spr[sn].getChildAt(0).gotoAndStop(`d${p}0`);
      spr[sn].getChildAt(1).text = `${game.player[p].area_tc}`;
      spr[sn].getChildAt(2).text = '';

      if (game.player[p].stock > 0) {
        spr[sn].getChildAt(2).text = `${game.player[p].stock}`;
      }

      if (i === game.ban) {
        spr[snBan].x = ox;
        spr[snBan].y = yposArm;
        spr[snBan].gotoAndStop('ban');
        spr[snBan].visible = true;
      }

      c += 1;
    }
  }
};

const nextPlayer = () => {
  for (let i = 0; i < game.pmax; i += 1) {
    game.ban += 1;
    if (game.ban >= game.pmax) {
      game.ban = 0;
    }

    const pn = game.jun[game.ban];
    if (game.player[pn].area_tc) {
      break;
    }
  }
  if (game.jun[game.ban] === game.user) {
    playSound('snd_myturn');
  }

  startPlayer();
};

const supplyDice = () => {
  const pn = game.jun[game.ban];
  const list = [];
  let c = 0;

  for (let i = 0; i < game.AREA_MAX; i += 1) {
    if (game.adat[i].size === 0) {
      continue;
    }
    if (game.adat[i].arm !== pn) {
      continue;
    }
    if (game.adat[i].dice >= 8) {
      continue;
    }
    list[c] = i;
    c += 1;
  }

  if (c === 0 || game.player[pn].stock <= 0) {
    nextPlayer();
    return;
  }

  game.player[pn].stock -= 1;
  const an = list[Math.floor(Math.random() * c)];
  game.adat[an].dice += 1;
  drawAreadice(an2sn[an], an);

  for (let i = 0; i < game.STOCK_MAX; i += 1) {
    if (i < game.player[pn].stock) {
      spr[snSupply].getChildAt(i).visible = true;
    } else {
      spr[snSupply].getChildAt(i).visible = false;
    }
  }

  // log
  game.set_his(an, 0, 0);

  stage.update();
};

const supplyWaiting = () => {
  waitcount -= 1;

  if (waitcount > 0) {
    return;
  }

  timerFunc = supplyDice;
};

const startSupply = () => {
  spr[snFrom].visible = false;
  spr[snTo].visible = false;
  spr[snBtn + 4].visible = false;

  const pn = game.jun[game.ban];

  // game.player[pn].stock = 64;
  game.set_area_tc(pn);
  game.player[pn].stock += game.player[pn].area_tc;

  if (game.player[pn].stock > game.STOCK_MAX) {
    game.player[pn].stock = game.STOCK_MAX;
  }

  spr[snSupply].visible = true;

  for (let i = 0; i < game.STOCK_MAX; i += 1) {
    if (i < game.player[pn].stock) {
      spr[snSupply].getChildAt(i).visible = true;
      spr[snSupply].getChildAt(i).gotoAndStop(`d${pn}3`);
    } else {
      spr[snSupply].getChildAt(i).visible = false;
    }
  }
  stage.update();

  waitcount = 10;
  timerFunc = supplyWaiting;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};

const endTurn = () => {
  spr[snBtn + 4].visible = false;
  spr[snFrom].visible = false;
  spr[snTo].visible = false;
  spr[snMes].visible = false;

  timerFunc = null;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;

  startSupply();
};

const clickedArea = () => {
  let ret = -1;
  let sn;

  for (let i = 0; i < game.AREA_MAX; i += 1) {
    if (game.adat[i].size !== 0) {
      sn = snArea + i;
      const pt = spr[sn].globalToLocal(stage.mouseX, stage.mouseY);

      if (spr[sn].hitTest(pt.x, pt.y)) {
        ret = i;
      }
    }
  }

  for (let i = 0; i < game.AREA_MAX; i += 1) {
    const a = prio[i].an;

    if (game.adat[a].size !== 0) {
      sn = snDice + i;
      const pt = spr[sn].globalToLocal(stage.mouseX, stage.mouseY);

      if (spr[sn].hitTest(pt.x, pt.y)) {
        ret = a;
      }
    }
  }

  return ret;
};

const secondClick = () => {
  const p = game.jun[game.ban];
  const an = clickedArea();

  if (an < 0) {
    return;
  }

  // Deselect in the same area
  if (an === game.area_from) {
    startMan();
    return;
  }

  if (game.adat[an].arm === p) {
    return;
  }

  if (game.adat[an].join[game.area_from] === 0) {
    return;
  }

  game.area_to = an;
  drawAreashape(snTo, an, 1);
  stage.update();
  playSound('snd_click');
  startBattle();
};

const firstClick = () => {
  const p = game.jun[game.ban];
  const an = clickedArea();

  if (an < 0) {
    return;
  }
  if (game.adat[an].arm !== p) {
    return;
  }
  if (game.adat[an].dice <= 1) {
    return;
  }

  spr[snMes].visible = false;

  game.area_from = an;
  drawAreashape(snFrom, an, 1);

  playSound('snd_click');

  stage.update();
  clickFunc = secondClick;
};

const startMan = () => {
  spr[snMes].visible = true;
  spr[snMes].text = '1. Click your area. 2. Click neighbor to attack.';
  spr[snMes].color = '#000000';
  spr[snMes].textAlign = 'left';
  spr[snMes].x = viewW * 0.05;
  spr[snMes].y = yposMes;

  // button
  activebutton = -1; // Fixed a bug that causes endturn when the button is not clicked
  spr[snBtn + 4].x = viewW - (100 * nume) / deno;
  spr[snBtn + 4].y = yposMes;
  spr[snBtn + 4].visible = true;
  btnFunc[4] = endTurn;

  spr[snFrom].visible = false;
  spr[snTo].visible = false;
  stage.update();

  timerFunc = null;
  clickFunc = firstClick;
  moveFunc = null;
  releaseFunc = null;
};

const startPlayer = () => {
  for (let i = snInfo; i < snMax; i += 1) {
    spr[i].visible = false;
  }

  drawPlayerData();

  if (game.jun[game.ban] === game.user) {
    startMan();
  } else {
    startCom();
  }
};

const startGame = () => {
  game.start_game();
  startPlayer();
};

const makeMap = () => {
  let n;

  for (let i = 0; i < snMax; i += 1) {
    spr[i].visible = false;
  }

  game.make_map();

  // The order in which the dice are displayed
  for (let i = 0; i < game.AREA_MAX; i += 1) {
    n = prio[i].an;
    prio[i].cpos = game.adat[n].cpos;
  }

  for (let i = 0; i < game.AREA_MAX - 1; i += 1) {
    for (let j = i; j < game.AREA_MAX; j += 1) {
      if (prio[i].cpos > prio[j].cpos) {
        let tmp = prio[i].an;
        prio[i].an = prio[j].an;
        prio[j].an = tmp;
        tmp = prio[i].cpos;
        prio[i].cpos = prio[j].cpos;
        prio[j].cpos = tmp;
      }
    }
  }

  for (let i = 0; i < game.AREA_MAX; i += 1) {
    n = prio[i].an;
    an2sn[n] = snDice + i;
  }

  // area filling
  for (let i = 0; i < game.AREA_MAX; i += 1) {
    drawAreashape(snArea + i, i, 0);
  }

  // area dice
  for (let i = 0; i < game.AREA_MAX; i += 1) {
    drawAreadice(snDice + i, prio[i].an);
  }

  spr[snMes].visible = true;
  spr[snMes].text = 'Play this board?';
  spr[snMes].color = '#000000';
  spr[snMes].textAlign = 'left';
  spr[snMes].x = viewW * 0.1;
  spr[snMes].y = yposMes;

  // button
  spr[snBtn + 2].x = resize(500);
  spr[snBtn + 2].y = yposMes;
  spr[snBtn + 2].visible = true;
  btnFunc[2] = startGame;
  spr[snBtn + 3].x = resize(650);
  spr[snBtn + 3].y = yposMes;
  spr[snBtn + 3].visible = true;
  btnFunc[3] = makeMap;

  stage.update();

  timerFunc = null;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};

const startTitle = () => {
  for (let i = 0; i < snMax; i += 1) {
    spr[i].visible = false;
  }

  spr[snTitle].visible = true;
  spr[snTitle].x = 0;
  spr[snTitle].y = 0;
  spr[snTitle].gotoAndStop('title');

  spr[snMes].visible = true;
  spr[snMes].text = 'Copyright (C) 2001 GAMEDESIGN';
  spr[snMes].color = '#aaaaaa';
  spr[snMes].textAlign = 'right';
  spr[snMes].x = viewW * 0.9;
  spr[snMes].y = viewH * 0.24;

  spr[snPmax].visible = true;
  for (let i = 0; i < 7; i += 1) {
    spr[snPmax].getChildByName(`p${i}`).color =
      i === game.pmax - 2 ? '#aa0000' : '#cccccc';
  }

  // button
  spr[snBtn + 0].x = resize(640);
  spr[snBtn + 0].y = resize(390);
  spr[snBtn + 0].visible = true;
  btnFunc[0] = makeMap;
  spr[snBtn + 1].x = resize(640);
  spr[snBtn + 1].y = resize(490);
  spr[snBtn + 1].visible = true;
  btnFunc[1] = toppage;

  stage.update();

  timerFunc = null;
  clickFunc = clickPmax;
  moveFunc = null;
  releaseFunc = null;
};

const fakeLoading = () => {
  spr[snLoad].visible = true;
  spr[snLoad].text = ' ';
  spr[snMes].visible = true;
  spr[snMes].text = 'Now loading... ';
  spr[snMes].x = viewW / 2;
  spr[snMes].y = viewH / 2;
  stage.update();
  waitcount -= 1;

  if (waitcount <= 0) {
    timerFunc = null;
    startTitle();
  }
};

const handleComplete = () => {
  waitcount = 30;
  timerFunc = fakeLoading;
};

// launch
const init = () => {
  let c;

  canvas = document.getElementById('myCanvas');
  stage = new createjs.Stage(canvas);

  if (createjs.Touch.isSupported() === true) {
    createjs.Touch.enable(stage);
    touchdev = true;
  }

  // touchdev = true;
  if (touchdev) {
    soundon = false;
  }

  // Indicates location
  const iw = window.innerWidth;
  const ih = window.innerHeight;

  if (iw / org.viewW < ih / org.viewH) {
    nume = iw;
    deno = org.viewW;
  } else {
    nume = ih;
    deno = org.viewH;
  }

  viewW = Math.floor((org.viewW * nume) / deno);
  viewH = Math.floor((org.viewH * nume) / deno);
  stage.canvas.width = viewW;
  stage.canvas.height = viewH;
  celW = (org.celW * nume) / deno;
  celH = (org.celH * nume) / deno;
  yposMes = (org.yposMes * nume) / deno;
  yposArm = (org.yposArm * nume) / deno;
  // dot = (1 * nume) / deno;

  for (let i = 0; i < 2; i += 1) {
    battle[i] = new Battle();
  }

  // Sprite Number
  let sn = 0;

  // Cell position
  c = 0;
  for (let i = 0; i < game.YMAX; i += 1) {
    for (let j = 0; j < game.XMAX; j += 1) {
      cposX[c] = j * celW;
      if (i % 2) {
        cposX[c] += celW / 2;
      }
      cposY[c] = i * celH;
      c += 1;
    }
  }

  // Area drawing +2 (attack source and destination)
  snArea = sn;
  for (let i = 0; i < game.AREA_MAX + 2; i += 1) {
    spr[sn] = new createjs.Shape();
    spr[sn].x = viewW / 2 - (game.XMAX * celW) / 2 - celW / 4;
    spr[sn].y = (50 * nume) / deno;
    stage.addChild(spr[sn]);
    sn += 1;
  }
  snFrom = snArea + game.AREA_MAX; // Sprite number of the attack source area
  snTo = snArea + game.AREA_MAX + 1; // Sprite number of the attack target area

  // area dice
  snDice = sn;
  builder = new createjs.SpriteSheetBuilder();

  const mc = new lib.areadice();
  const rect = new createjs.Rectangle(0, 0, 80, 100);
  builder.addMovieClip(mc, rect, nume / deno);

  const spritesheet = builder.build();
  for (let i = 0; i < game.AREA_MAX; i += 1) {
    spr[sn] = new createjs.Sprite(spritesheet);
    stage.addChild(spr[sn]);
    sn += 1;
  }

  // Area Dice Display Order
  for (let i = 0; i < game.AREA_MAX; i += 1) {
    prio[i] = {};
    prio[i].an = i;
    prio[i].cpos = 0; // For later
  }

  // Sprite numbers other than the map (to delete them all at once)
  snInfo = sn;

  // player state
  snBan = sn;
  spr[sn] = new lib.mc();
  stage.addChild(spr[sn]);
  spr[sn].scaleX = nume / deno;
  spr[sn].scaleY = nume / deno;
  sn += 1;
  snPlayer = sn;

  for (let i = 0; i < 8; i += 1) {
    const pd = new lib.mc();
    pd.scaleX = 0.12;
    pd.scaleY = 0.12;
    pd.x = -22;
    pd.y = 0;
    spr[sn] = new createjs.Container();
    spr[sn].addChildAt(pd, 0);

    const txt = new createjs.Text('', '32px Anton', 'Black');
    txt.textBaseline = 'middle';
    txt.x = 5;
    spr[sn].addChildAt(txt, 1);

    const txt2 = new createjs.Text('', '16px Anton', 'Black');
    txt2.textBaseline = 'middle';
    txt2.x = 5;
    txt2.y = 28;
    spr[sn].addChildAt(txt2, 2);
    stage.addChild(spr[sn]);
    spr[sn].scaleX = nume / deno;
    spr[sn].scaleY = nume / deno;
    sn += 1;
  }

  // battle dice
  snBattle = sn;
  spr[sn] = new createjs.Container();
  spr[sn].y = yposMes;
  spr[sn].x = viewW / 2;
  spr[sn].scaleX = nume / deno;
  spr[sn].scaleY = nume / deno;

  const bgshape = new createjs.Shape();
  bgshape.graphics
    .beginFill('rgba(255,255,255,0.8)')
    .drawRect(-org.viewW / 2, -50, org.viewW, 360);
  spr[sn].addChild(bgshape);

  for (let i = 0; i < 2; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      const bs = new lib.mc();
      bs.scaleX = 0.15;
      bs.scaleY = 0.15;
      bs.name = `s${i}${j}`;
      spr[sn].addChild(bs);
    }

    for (let j = 0; j < 8; j += 1) {
      const bd = new lib.mc();
      bd.scaleX = 0.15;
      bd.scaleY = 0.15;
      bd.name = `d${i}${j}`;
      spr[sn].addChild(bd);
    }

    const txt = new createjs.Text('37', '80px Anton', 'Black');
    txt.textBaseline = 'middle';
    txt.textAlign = 'center';
    txt.name = `n${i}`;
    spr[sn].addChild(txt);
  }
  stage.addChild(spr[sn]);
  sn += 1;

  // Supply dices
  snSupply = sn;
  spr[sn] = new createjs.Container();
  spr[sn].y = yposMes;
  spr[sn].x = viewW / 2;
  spr[sn].scaleX = nume / deno;
  spr[sn].scaleY = nume / deno;

  for (let i = 0; i < game.STOCK_MAX; i += 1) {
    const sd = new lib.mc();
    const w = 40;
    sd.x = -(6.5 * w) + Math.floor(i / 4) * w - (i % 4) * w * 0.5;
    sd.y = -w * 0.7 + (Math.floor(i % 4) * w) / 2;
    sd.gotoAndStop('d00');
    sd.scaleX = 0.1;
    sd.scaleY = 0.1;
    spr[sn].addChildAt(sd, i);
  }
  stage.addChild(spr[sn]);
  sn += 1;

  // Gameover
  snGameover = sn;
  spr[sn] = new createjs.Container();
  spr[sn].x = viewW / 2;
  spr[sn].y = viewH / 2;
  spr[sn].scaleX = nume / deno;
  spr[sn].scaleY = nume / deno;

  const goshape = new createjs.Shape();
  goshape.graphics
    .beginFill('#000000')
    .drawRect(-org.viewW / 2 + 10, -180, org.viewW - 20, 360);
  goshape.name = 'bg';
  spr[sn].addChild(goshape);

  const gotext = new createjs.Text('G A M E O V E R', '80px Anton', 'White');
  gotext.textBaseline = 'middle';
  gotext.textAlign = 'center';
  gotext.name = 'mes';
  spr[sn].addChild(gotext);
  stage.addChild(spr[sn]);
  sn += 1;

  // You Win
  snWin = sn;
  spr[sn] = new lib.mc();
  spr[sn].scaleX = nume / deno;
  spr[sn].scaleY = nume / deno;
  stage.addChild(spr[sn]);
  sn += 1;

  // Title screen
  snTitle = sn;
  spr[sn] = new lib.mc();
  spr[sn].scaleX = nume / deno;
  spr[sn].scaleY = nume / deno;
  stage.addChild(spr[sn]);
  sn += 1;

  // Number of players setting
  snPmax = sn;
  spr[sn] = new createjs.Container();

  for (let i = 0; i < 7; i += 1) {
    const ptxt = new createjs.Text(
      `${i + 2} players`,
      `${Math.floor((32 * nume) / deno)}px Anton`,
      '#aaaaaa'
    );

    ptxt.name = `p${i}`;
    ptxt.x =
      viewW / 2 -
      (280 * nume) / deno +
      Math.floor(i % 4) * ((180 * nume) / deno);
    ptxt.y = viewH * 0.8 + Math.floor(i / 4) * ((60 * nume) / deno);
    ptxt.textAlign = 'center';
    ptxt.textBaseline = 'middle';
    spr[sn].addChild(ptxt);
  }
  stage.addChild(spr[sn]);
  sn += 1;

  // For loading (to read web fonts)
  snLoad = sn;
  spr[sn] = new createjs.Text(
    'Now loading...',
    `${Math.floor((24 * nume) / deno)}px Anton`,
    '#000000'
  );
  stage.addChild(spr[sn]);
  sn += 1;

  // generic message
  snMes = sn;
  spr[sn] = new createjs.Text(
    'Now loading...',
    `${Math.floor((30 * nume) / deno)}px Roboto`,
    '#000000'
  );
  spr[sn].textAlign = 'center';
  spr[sn].textBaseline = 'middle';
  stage.addChild(spr[sn]);
  sn += 1;

  // button
  const btxt = [
    'START',
    'TOP PAGE',
    'YES',
    'NO',
    'END TURN',
    'TITLE',
    'HISTORY',
  ];

  bmax = btxt.length;
  snBtn = sn;

  for (let i = 0; i < bmax; i += 1) {
    const bt = new lib.mc();
    spr[sn] = new createjs.Container();
    bt.gotoAndStop('btn');
    spr[sn].addChildAt(bt, 0);

    const txt = new createjs.Text(btxt[i], '32px Anton', 'Black');
    txt.textAlign = 'center';
    txt.textBaseline = 'middle';
    spr[sn].addChildAt(txt, 1);
    stage.addChild(spr[sn]);
    spr[sn].scaleX = nume / deno;
    spr[sn].scaleY = nume / deno;
    spr[sn].visible = true;
    sn += 1;

    // // Button functions
    // btnFunc[i] = new Function();
    // btnFunc[i] = null;
  }

  // Number of sprites
  snMax = sn;
  for (let i = 0; i < snMax; i += 1) {
    spr[i].visible = false;
  }

  stage.addEventListener('stagemousedown', mouseDownListner);
  stage.addEventListener('stagemousemove', mouseMoveListner);
  stage.addEventListener('stagemouseup', mouseUpListner);
  createjs.Ticker.addEventListener('tick', onTick);
  createjs.Ticker.setFPS(60);

  if (soundon) {
    // Load sound in the case of a PC
    const queue = new createjs.LoadQueue(false);
    queue.installPlugin(createjs.Sound);
    queue.loadManifest(SOUND_MANIFEST, true);
    queue.addEventListener('fileload', handleFileLoad);
    queue.addEventListener('complete', handleComplete);
  } else {
    waitcount = 60;
    timerFunc = fakeLoading;
  }
};

window.addEventListener('load', init);

const clickPmax = () => {
  let pmax = -1;

  for (let i = 0; i < 7; i += 1) {
    const o = spr[snPmax].getChildByName(`p${i}`);
    const pt = o.globalToLocal(stage.mouseX, stage.mouseY);

    if (
      Math.abs(pt.x) < (70 * nume) / deno &&
      Math.abs(pt.y) < (20 * nume) / deno
    ) {
      pmax = i + 2;
    }
  }

  if (pmax < 0) {
    return;
  }

  game.pmax = pmax;

  for (let i = 0; i < 7; i += 1) {
    spr[snPmax].getChildByName(`p${i}`).color =
      i === game.pmax - 2 ? '#aa0000' : '#cccccc';
  }
  stage.update();
};

// COM Thinking
const startCom = () => {
  const ret = game.com_thinking();

  if (ret === 0) {
    startSupply();
    return;
  }

  stage.update();

  waitcount = 5;
  timerFunc = comFrom;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};

const comFrom = () => {
  waitcount -= 1;

  if (waitcount > 0) {
    return;
  }

  drawAreashape(snFrom, game.area_from, 1);
  stage.update();

  waitcount = 5;
  timerFunc = comTo;
};

const comTo = () => {
  waitcount -= 1;

  if (waitcount > 0) {
    return;
  }

  drawAreashape(snTo, game.area_to, 1);
  stage.update();

  startBattle();
};

// Battle
const startBattle = () => {
  spr[snBtn + 4].visible = false; // Turn off the END TURN button.
  spr[snBan].visible = false;

  for (let i = 0; i < 8; i += 1) {
    spr[snPlayer + i].visible = false;
  }

  // letiables in the battle scene
  const an = [game.area_from, game.area_to];

  for (let i = 0; i < 2; i += 1) {
    battle[i].arm = game.adat[an[i]].arm;
    battle[i].dmax = game.adat[an[i]].dice;

    for (let j = 0; j < 8; j += 1) {
      const r = Math.floor(Math.random() * 8);
      const tmp = battle[i].usedice[j];

      battle[i].usedice[j] = battle[i].usedice[r];
      battle[i].usedice[r] = tmp;
    }

    battle[i].sum = 0;

    for (let j = 0; j < 8; j += 1) {
      battle[i].deme[j] = Math.floor(Math.random() * 6);

      if (battle[i].usedice[j] < battle[i].dmax) {
        battle[i].sum += 1 + battle[i].deme[j];
      }
      battle[i].fin[j] = false;
    }
  }
  spr[snBattle].visible = true;

  for (let i = 0; i < 2; i += 1) {
    const w = 4;
    const h = 2;
    const r = 8;
    const ox = i === 0 ? w * 100 : -w * 90;
    const oy = i === 0 ? -h * 50 : h * 60;

    for (let j = 0; j < 8; j += 1) {
      const o = spr[snBattle].getChildByName(`d${i}${j}`);

      o.vx =
        ox + (j % 3) * 10 * w - Math.floor(j / 3) * 10 * w + Math.random() * r;
      o.vy =
        oy + (j % 3) * 10 * h + Math.floor(j / 3) * 10 * h + Math.random() * r;
      o.x = o.vx;
      o.y = o.vy;
      o.z = Math.random() * 10;
      o.up = Math.random() * 22;
      o.bc = 0;
      o.visible = false;

      const s = spr[snBattle].getChildByName(`s${i}${j}`);
      s.x = o.vx;
      s.y = o.vy;
      s.gotoAndStop('shadow');
      s.visible = false;
    }
  }

  spr[snBattle].getChildByName('n0').x = 110;
  spr[snBattle].getChildByName('n0').y = -10;
  spr[snBattle].getChildByName('n0').visible = false;
  spr[snBattle].getChildByName('n1').x = -290;
  spr[snBattle].getChildByName('n1').y = -10;
  spr[snBattle].getChildByName('n1').visible = false;

  bturn = 0;

  stage.update();
  timerFunc = battleDice;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};

const battleDice = () => {
  const w = bturn === 0 ? -10 : 10;
  const h = bturn === 0 ? 6 : -6;
  let f = false;
  let soundflg = false;

  for (let i = 0; i < 8; i += 1) {
    if (battle[bturn].fin[i] > 0) {
      continue;
    }

    const o = spr[snBattle].getChildByName(`d${bturn}${i}`);

    o.visible = true;
    o.vx += w;
    o.vy += h;
    o.z += o.up;
    o.up -= 3;

    if (o.z < 0) {
      o.z = 0;
      o.up = 5 - o.bc * 3;
      o.bc += 1;

      if (o.bc >= 2) {
        battle[bturn].fin[i] = 1;

        if (bturn === 0) {
          if (i >= 3) {
            if (battle[bturn].fin[i - 3] === 0) {
              battle[bturn].fin[i] = 0;
            }
          }
          if (i >= 2) {
            if (battle[bturn].fin[i - 2] === 0) {
              battle[bturn].fin[i] = 0;
            }
          }
        } else {
          if (i < 5) {
            if (battle[bturn].fin[i + 3] === 0) {
              battle[bturn].fin[i] = 0;
            }
          }
          if (i < 6) {
            if (battle[bturn].fin[i + 2] === 0) {
              battle[bturn].fin[i] = 0;
            }
          }
        }
      }

      if (o.bc === 1) {
        if (battle[bturn].usedice[i] < battle[bturn].dmax) {
          soundflg = true;
        }
      }
    }

    o.x = o.vx;
    o.y = o.vy - o.z;
    o.gotoAndStop(`d${battle[bturn].arm}${Math.floor(Math.random() * 6)}`);

    if (battle[bturn].fin[i] > 0) {
      o.gotoAndStop(`d${battle[bturn].arm}${battle[bturn].deme[i]}`);
      if (battle[bturn].usedice[i] < battle[bturn].dmax) {
        soundflg = true;
      }
    }

    const s = spr[snBattle].getChildByName(`s${bturn}${i}`);
    s.visible = true;
    s.x = o.vx;
    s.y = o.vy;

    if (battle[bturn].usedice[i] >= battle[bturn].dmax) {
      o.visible = false;
      s.visible = false;
    }
    f = true;
  }

  if (!f) {
    spr[snBattle].getChildByName(`n${bturn}`).visible = true;
    spr[snBattle].getChildByName(`n${bturn}`).text = `${battle[bturn].sum}`;
    bturn += 1;

    if (bturn >= 2) {
      waitcount = 15;
      timerFunc = afterBattle;
    }
  }

  if (soundflg) {
    playSound('snd_dice');
  }

  stage.update();
};

const afterBattle = () => {
  waitcount -= 1;

  if (waitcount > 0) {
    return;
  }

  spr[snBattle].visible = false;
  spr[snFrom].visible = false;
  spr[snTo].visible = false;
  spr[snBan].visible = true;

  for (let i = 0; i < 8; i += 1) {
    spr[snPlayer + i].visible = true;
  }

  const arm0 = game.adat[game.area_from].arm;
  const arm1 = game.adat[game.area_to].arm;
  const defeat = battle[0].sum > battle[1].sum ? 1 : 0;

  if (defeat > 0) {
    game.adat[game.area_to].dice = game.adat[game.area_from].dice - 1;
    game.adat[game.area_from].dice = 1;
    game.adat[game.area_to].arm = arm0;
    game.set_area_tc(arm0);
    game.set_area_tc(arm1);
    playSound('snd_success');
  } else {
    game.adat[game.area_from].dice = 1;
    playSound('snd_fail');
  }

  drawAreashape(snArea + game.area_to, game.area_to, 0);
  drawAreadice(an2sn[game.area_from], game.area_from);
  drawAreadice(an2sn[game.area_to], game.area_to);

  // log
  game.set_his(game.area_from, game.area_to, defeat);

  if (game.player[game.user].area_tc === 0) {
    drawPlayerData();
    startGameover();
  } else {
    let c = 0;

    for (let i = 0; i < game.pmax; i += 1) {
      if (game.player[i].area_tc > 0) {
        c += 1;
      }
    }

    if (c === 1) {
      drawPlayerData();
      startWin();
    } else {
      startPlayer();
    }
  }
};

// Gameover
const startGameover = () => {
  spr[snGameover].visible = false;
  spr[snGameover].x = viewW / 2;
  spr[snGameover].y = viewH / 2;
  spr[snGameover].getChildByName('bg').alpha = 0;
  spr[snGameover].getChildByName('mes').alpha = 0;
  spr[snGameover].getChildByName('mes').y = -120;
  stage.update();
  stat = 0;
  waitcount = 0;
  timerFunc = gameover;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};

const gameover = () => {
  spr[snGameover].visible = true;
  waitcount += 1;

  if (stat === 0) {
    const a = (-80 + waitcount) / 100;
    spr[snGameover].getChildByName('bg').alpha = a;

    if (a > 0.8) {
      playSound('snd_over');
      waitcount = 0;
      stat += 1;
    }
    stage.update();
  } else if (stat === 1) {
    const a = waitcount / 100;
    const o = spr[snGameover].getChildByName('mes');

    o.alpha = a;
    o.y += 0.5;

    if (o.y > -70) {
      o.y = -70;
    }

    if (waitcount >= 160) {
      // button
      spr[snBtn + 5].x = viewW / 2 - resize(100);
      spr[snBtn + 5].y = viewH / 2 + resize(70);
      spr[snBtn + 5].visible = true;
      btnFunc[5] = startTitle;
      spr[snBtn + 6].x = viewW / 2 + resize(100);
      spr[snBtn + 6].y = viewH / 2 + resize(70);
      spr[snBtn + 6].visible = true;
      btnFunc[6] = startHistory;

      waitcount = 0;
      stat += 1;
    }

    stage.update();
  }
};

// You Win!
const startWin = () => {
  spr[snWin].visible = false;
  spr[snWin].x = viewW / 2;
  spr[snWin].y = viewH / 2 - resize(70);
  spr[snWin].gotoAndStop('win');
  waitcount = 0;
  timerFunc = win;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};

const win = () => {
  waitcount += 1;

  const a = Math.floor(waitcount / 2);

  if (a === 10 || a === 12 || a === 14 || a === 16 || a >= 18) {
    spr[snWin].visible = true;
  } else {
    spr[snWin].visible = false;
  }

  if (a === 10) {
    playSound('snd_clear');
  }

  if (a >= 40) {
    timerFunc = null;
    spr[snBtn + 6].x = viewW / 2;
    spr[snBtn + 6].y = viewH / 2 + resize(70);
    spr[snBtn + 6].visible = true;
    btnFunc[6] = startHistory;
  }
  stage.update();
};

// Log
const playHistory = () => {
  let an;

  if (stat === 0) {
    if (replayC >= game.his_c) {
      timerFunc = null; // end
    } else {
      stat = game.his[replayC].to === 0 ? 1 : 2;
    }
  } else if (stat === 1) {
    // replenishment
    an = game.his[replayC].from;
    game.adat[an].dice += 1;
    drawAreadice(an2sn[an], an);
    stage.update();
    replayC += 1;

    if (replayC >= game.his_c) {
      timerFunc = null; // end
    } else {
      stat = game.his[replayC].to === 0 ? 1 : 2;
    }
  } else if (stat === 2) {
    // attack origin
    an = game.his[replayC].from;
    drawAreashape(snFrom, an, 1);
    stage.update();
    waitcount = 0;
    stat += 1;
  } else if (stat === 3) {
    // target of attack
    if (waitcount > 2) {
      an = game.his[replayC].to;
      drawAreashape(snTo, an, 1);
      stage.update();
      waitcount = 0;
      stat += 1;
    }
  } else if (stat === 4) {
    // After attack
    if (waitcount > 10) {
      const an0 = game.his[replayC].from;
      const an1 = game.his[replayC].to;

      if (game.his[replayC].res > 0) {
        game.adat[an1].dice = game.adat[an0].dice - 1;
        game.adat[an0].dice = 1;
        game.adat[an1].arm = game.adat[an0].arm;
        playSound('snd_success');
      } else {
        game.adat[an0].dice = 1;
        playSound('snd_fail');
      }
      spr[snFrom].visible = false;
      spr[snTo].visible = false;
      drawAreadice(an2sn[an0], an0);
      drawAreadice(an2sn[an1], an1);
      drawAreashape(snArea + an1, an1, 0);
      stage.update();
      stat = 0;
      replayC += 1;
    }
  }

  waitcount += 1;
};

const startHistory = () => {
  spr[snWin].visible = false;
  spr[snGameover].visible = false;
  spr[snBan].visible = false;

  for (let i = 0; i < 8; i += 1) {
    spr[snPlayer + i].visible = false;
  }

  for (let i = 0; i < bmax; i += 1) {
    spr[snBtn + i].visible = false;
  }

  for (let i = 0; i < game.AREA_MAX; i += 1) {
    if (game.adat[i].size === 0) {
      continue;
    }

    game.adat[i].dice = game.his_dice[i];
    game.adat[i].arm = game.his_arm[i];
    drawAreashape(snArea + i, i, 0);
  }

  for (let i = 0; i < game.AREA_MAX; i += 1) {
    drawAreadice(snDice + i, prio[i].an);
  }

  // button
  spr[snBtn + 5].x = viewW / 2 - resize(100);
  spr[snBtn + 5].y = viewH * 0.88;
  spr[snBtn + 5].visible = true;
  btnFunc[5] = startTitle;
  spr[snBtn + 1].x = viewW / 2 + resize(100);
  spr[snBtn + 1].y = viewH * 0.88;
  spr[snBtn + 1].visible = true;
  btnFunc[1] = toppage;

  stage.update();
  replayC = 0;
  stat = 0;
  waitcount = 0;
  timerFunc = playHistory;
  clickFunc = null;
  moveFunc = null;
  releaseFunc = null;
};
