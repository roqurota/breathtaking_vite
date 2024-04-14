import './style.css'

var imagesToLoad = [
  { url: '/images/person/m_1.png', type: 'person' },
  { url: '/images/person/m_2.png', type: 'person' },
  { url: '/images/person/m_3.png', type: 'person' },
  { url: '/images/person/m_4.png', type: 'person' },
  { url: '/images/person/s_1.png', type: 'person' },
  { url: '/images/person/s_2.png', type: 'person' },
  { url: '/images/person/s_3.png', type: 'person' },
  { url: '/images/hand.svg', type: 'hint', name:'Hand' },
  { url: '/images/love.svg', type: 'hint', name:'Love' },
  { url: '/images/word.svg', type: 'hint', name:'Word' },
  { url: '/images/trust.svg', type: 'hint', name:'Trust' },
  { url: '/images/shelter.svg', type: 'hint', name:'Shelter' },
  { url: '/images/feel.svg', type: 'hint', name:'Feel' },
  { url: '/images/breathtaking.svg', type: 'hint', name:'Breathtaking' },
  { url: '/images/unreal.svg', type: 'hint', name:'Unreal' },
  { url: '/images/bg.jpeg' },
  { url: '/images/cover.png', type: 'cover' }
];

var soundsToLoad = [
  { url: './sounds/hand.mp3', name:'Hand' ,type: 'vocal' },
  { url: './sounds/love.mp3', name:'Love' ,type: 'vocal' },
  { url: './sounds/word.mp3', name:'Word' ,type: 'vocal' },
  { url: './sounds/trust.mp3', name:'Trust' ,type: 'vocal' },
  { url: './sounds/shelter.mp3', name:'Shelter' ,type: 'vocal' },
  { url: './sounds/feel.mp3', name:'Feel' ,type: 'vocal' },
  { url: './sounds/breathtaking.mp3', name:'Breathtaking' ,type: 'vocal' },
  { url: './sounds/real.mp3', name:'Unreal' ,type: 'vocal' },
  { url: './sounds/unreal.mp3' },
  { url: './sounds/main_cut.mp3', name: 'main' },
  { url: './sounds/theme.mp3', name: 'theme' }
];

var sounds = [
  { url: '/images/hand.svg', name:'Hand', seconds: 9, time: 0, frame: 4 },
  { url: '/images/love.svg', name:'Love', seconds: 11, time: 0, frame: 5 },
  { url: '/images/word.svg', name:'Word', seconds: 12, time: 0, frame: 6 },
  { url: '/images/trust.svg', name:'Trust', seconds: 14, time: 0, offset: 100, frame: 4 },
  { url: '/images/shelter.svg', name:'Shelter', seconds: 16, time: 0, offset: 100, frame: 5 },
  { url: '/images/feel.svg', name:'Feel', seconds: 19, time: 0, offset: 100, frame: 6 },
  { url: '/images/breathtaking.svg', name:'Breathtaking', seconds: 20, time: 0, offset: 130, frame: 4 },
  { url: '/images/unreal.svg', name:'Unreal', seconds: 22, time: 0, offset: 400, frame: 6 }
];

var gap = 1900;
var startTime = 9950;

sounds.forEach((sound, index) => { 
  sound.time = startTime + gap * index - (sound.offset ? sound.offset : 0); 
});

var person = [
  { url: '/images/person/m_1.png' },
  { url: '/images/person/m_2.png' },
  { url: '/images/person/m_3.png' },
  { url: '/images/person/m_4.png' },
  { url: '/images/person/s_1.png' },
  { url: '/images/person/s_2.png' },
  { url: '/images/person/s_3.png' }
];

let animationTimer = null;
let animationPause = false;
let personUI = null;
let promises = [];
let appIsReady = false;
let isGame = false;
let isRestarted = false;

preloadFiles();

Promise.all(promises).then(() => {
  runApp();
});

let soundIndex = 0;
let soundAnswerIndex = 0;
let correctAnswer = false;
let answerWindow = false;
let answerTimer = null;
let activeVocal = null;

let timer = null;
let startDate = null;
let imageTime = 1000;

let appUI = document.querySelector('.app');
let contentUI = document.querySelector('.content');
let startBtn = document.querySelector('.button-start');
let restartBtn = document.querySelector('.restart-button');
let soundsBtn = document.querySelectorAll('.sound-btn');
let soundsContainer = document.querySelector('.sounds-container');
let statusLine = document.querySelector('.status-line');
let scoreUI = document.querySelector('.score');
let score = 0;

startBtn.addEventListener('click', runGame);
restartBtn.addEventListener('click', restartGame);

function runApp() {
  appIsReady = true;

  appUI.classList.remove('hidden');

  var initScene = document.querySelector('.init-scene');
  initScene.classList.add('hide');

  setTimeout(() => {
      initScene.remove();
  }, 400);

  drawPerson();
  drawHints();

  let cover = imagesToLoad.find(el => el.type === 'cover');
  contentUI.querySelector('.cover-main').appendChild(cover.img.cloneNode(true));

  contentUI.classList.add('show');
}

function runGame() {
  if (!appIsReady || isGame)
      return;

  isGame = true;

  let music = soundsToLoad.find(el => el.name === 'main');
  music.audio.play();

  let themeMusic = soundsToLoad.find(el => el.name === 'theme');
  themeMusic.audio.pause();
  themeMusic.audio.currentTime = 0;

  startBtn.classList.add('hide');

  setTimeout(() => {
      startBtn.classList.add('hidden');
  }, 400);

  toggleSoundsButtons(true);

  for (var i = 0; i < soundsBtn.length; i++)
      soundBtnHandler(soundsBtn[i]);

  startDate = new Date();

  gameTimer();
  personSing();

  restartBtn.classList.remove('hidden');
  setTimeout(() => restartBtn.classList.remove('hide'), 100);

  contentUI.classList.remove('show');
  setTimeout(() => contentUI.classList.add('hidden'), 300);
}

function finishGame() {
  isGame = false;

  toggleSoundsButtons(false);

  setTimeout(() => {
      showScore();
  }, 1200);
}

function restartGame(force) {
  if ((!force && !isGame) || isRestarted)
      return

  if (isGame)
      toggleSoundsButtons(false);

  let dialogContainer = document.querySelector('.dialog-container');

  // call from end game screen
  if (force) {
      for (let i = 0; i < dialogContainer.children.length; i++)
          setTimeout(() => {
              dialogContainer.children[i].classList.remove('show');
          }, 200 * i)
  }

  setTimeout(() => {
      soundIndex = 0;
      soundAnswerIndex = 0;
      correctAnswer = false;
      answerWindow = false;
      answerTimer = null;
      activeVocal = null;
      timer = null;
      startDate = null;
      score = 0;

      startBtn.classList.remove('hidden');
      setTimeout(() => startBtn.classList.remove('hide'), 10);

      let music = soundsToLoad.find(el => el.name === 'main');
      music.audio.pause();
      music.audio.currentTime = 0;

      let themeMusic = soundsToLoad.find(el => el.name === 'theme');
      themeMusic.audio.play();

      for (let i = 0; i < sounds.length; i++) {
          sounds[i].ui.classList.remove('show', 'success', 'failure');
          sounds[i].ui.removeAttribute('active');
          sounds[i].ui.removeAttribute('showed');
      }

      restartBtn.classList.add('hide');

      setTimeout(() => {
          restartBtn.classList.add('hidden');
      }, 100);

      dialogContainer.innerHTML = '';

      contentUI.classList.remove('hidden');
      setTimeout(() => contentUI.classList.add('show'), 100);

      isRestarted = false;
  }, 1200);

  animationPause = false;
  personIDLE();

  isGame = false;
  isRestarted = true;
}

function showScore() {
  let dialogs = [
      {
          score: 0,
          frame: 0,
          text: "Oops. Next time try to press the buttons harder ;)",
          call: "Play again!"
      },
      {
          score: 3,
          frame: 1,
          text: "Not bad! Go ahead and try one more time!",
          call: "Let's go!"
      },
      {
          score: 6,
          frame: 4,
          text: "Good job! You almost did it! Dont give up!",
          call: "Again!"
      },
      {
          score: 8,
          frame: 5,
          text: "Nailed it! Good job!",
          call: "One more time!"
      }
  ];

  var answer = dialogs.reduce(function(prev, curr) {
      return (Math.abs(curr.score - score) < Math.abs(prev.score - score) ? curr : prev);
  });

  setPersonFrame(answer.frame, 0, true);

  let dialogContainer = document.querySelector('.dialog-container');

  let scoreUI = document.createElement('span');
  scoreUI.className = 'score';
  scoreUI.innerHTML = `You've reached <span class="user-score">${score}</span> breathtaking points out of 8!`
  dialogContainer.appendChild(scoreUI);

  let answerUI = document.createElement('span');
  answerUI.className = 'answer';
  answerUI.textContent = answer.text;
  dialogContainer.appendChild(answerUI);

  let callUI = document.createElement('div');
  callUI.className = 'call';
  callUI.innerHTML = `Don't forget to <span class="text-link">visit</span> my presave page to get full song on a release day!`
  dialogContainer.appendChild(callUI);

  let link = callUI.querySelector('.text-link');
  link.addEventListener('click', visitPage);

  let cover = imagesToLoad.find(el => el.type === 'cover');
  let coverUI = document.createElement('div');
  coverUI.className = 'cover';
  coverUI.appendChild(cover.img);
  dialogContainer.appendChild(coverUI);

  coverUI.addEventListener('click', visitPage);

  let actionButton = document.createElement('div');
  actionButton.className = 'action-button';
  actionButton.textContent = answer.call;
  dialogContainer.appendChild(actionButton);

  actionButton.addEventListener('click', restartGame.bind(this, true));

  for (let i = 0; i < dialogContainer.children.length; i++)
      setTimeout(() => {
          dialogContainer.children[i].classList.add('show');
      }, 200 * i)

  let music = soundsToLoad.find(el => el.name === 'main');
  music.audio.pause();
  music.audio.currentTime = 0;

  let themeMusic = soundsToLoad.find(el => el.name === 'theme');
  themeMusic.audio.play();

  restartBtn.classList.add('hide');

  setTimeout(() => {
      restartBtn.classList.add('hidden');
  }, 300);
}

function visitPage() {
  window.location.href = 'https://band.link/lB45F';
}

function toggleSoundsButtons(show) {
  let showTime = 150;

  soundsContainer.setAttribute('shown', show ? 'true' : 'false');

  for (var i = 0; i < soundsBtn.length; i++) {
      let index = i;
      setTimeout(() => {
          show ? soundsBtn[index].classList.add('show') : soundsBtn[index].classList.remove('show');
      }, showTime * index);
  }
}

function soundBtnHandler(btn, index){
  if (!isGame)
      return

  let buttonName = btn.getAttribute('data-name');

  var sound = sounds.find(el => el.name === buttonName);
  var preloadSound = soundsToLoad.find(el => el.name === buttonName);

  sound.button = btn;

  btn.addEventListener('click', () => {
      if (!isGame || activeVocal)
          return

      activeVocal = true;

      preloadSound.audio.play();

      setPersonFrame(Math.floor(Math.random() * 3 + 4), 900);

      if (answerWindow && sound.name === sounds[soundAnswerIndex].name) {
          hideHint(sound, 1);

          score++;
      } else
          hideHint(sound, 0);
  });
}

function gameTimer() {
  var interval = setInterval(function(){
      var sound = sounds[soundIndex];

      if (!isGame) {
          clearInterval(interval);
          return;
      }

      if (!sound) {
          setTimeout(() => {
              finishGame();
          }, 1000);

          clearInterval(interval);
          return;
      }

      var diff = new Date().getTime() - startDate.getTime();

      if (diff + 1000 >= sound.time) {
          // setActiveButton(sound.button);
          showHint(sound);
      }

      if (diff >= sound.time) {
          // setPersonFrame(sound.frame, 900);

          soundIndex++;
      }

      if (diff + 300 >= sound.time) {
          answerWindow = true;
          
      // if (!statusLine.classList.contains('active'))
      //     statusLine.classList.add('active');

      if (!answerTimer)
          answerTimer = setTimeout(() => {
              answerWindow = false;

              if (statusLine.classList.contains('active'))
                  statusLine.classList.remove('active');

              soundAnswerIndex++;

              answerTimer = null;
          }, 1000)
      }

      // scoreUI.textContent = score + ' / 8';
  }, 10)
}

function preloadFiles(){
  // for (var i = 0; i < imagesToLoad.length; i++)
  //     preloadImage(imagesToLoad[i]);

  for (var i = 0; i < soundsToLoad.length; i++)
      preloadAudio(soundsToLoad[i]);
}

function preloadImage(obj) {
  promises.push(new Promise(resolve => {
      let img = new Image();
      img.src = obj.url;

      obj.img = img;

      img.onload = resolve;
  }))
}

function preloadAudio(obj) {
  promises.push(new Promise(resolve => {
      let audio = new Audio(obj.url);

      obj.audio = audio;

      if (obj.type && obj.type === 'vocal')
          audio.addEventListener('ended', function(){
              audio.currentTime = 0;
              activeVocal = false;
          });

      if (obj.name && obj.name === 'theme')
          audio.addEventListener('ended', function(){
              audio.currentTime = 0;
              audio.play();
          });

      // let audioUI = document.createElement('audio');
      // audioUI.setAttribute('src', obj.url);
      // container.appendChild(audioUI);

      // if (obj.type && obj.type === 'vocal')
      //     audioUI.addEventListener('ended', function(){
      //         audioUI.currentTime = 0;
      //         activeVocal = false;
      //     });

      // obj.audio = audioUI;

      audio.oncanplaythrough = function() {
          resolve();
      };
  }))
}

function drawPerson() {
  let personContainer = document.querySelector('.person-container');
  let personUI = document.querySelector('.person');

  personContainer.style.top = soundsContainer.clientHeight + 10 + 'px';

  for (let i = 0; i < imagesToLoad.length; i++)
      if (imagesToLoad[i].type && imagesToLoad[i].type === 'person')
          personUI.appendChild(imagesToLoad[i].img);

  personIDLE();
}

function personIDLE(){
  let personUI = document.querySelector('.person');

  clearInterval(animationTimer);

  animationTimer = setInterval(() => {
      if (!animationPause) {
          let frame = Math.floor(Math.random() * 4);
  
          personUI.className = `person f${frame}`;
      }
  }, 1000)
}

function personSing() {
  let personUI = document.querySelector('.person');

  clearInterval(animationTimer);

  let frame = 0;

  animationTimer = setInterval(() => {
      if (!animationPause) {
          if (frame > 1)
              frame = 0;
  
          personUI.className = `person f${frame}`;
  
          frame++;
      }
  }, 600);
}

function setPersonFrame(frameNumber, delay, stopAnimation) {
  let personUI = document.querySelector('.person');

  animationPause = true;

  personUI.className = `person f${frameNumber}`;

  if (!stopAnimation)
      setTimeout(() => {
          animationPause = false;
      }, delay || 500);
}

function drawHints() {
  let container = document.querySelector('.person-container');

  for (let i = 0; i < sounds.length; i++) {
      let hintContainer = document.createElement('div');
      hintContainer.className = 'sound-hint-container';
      container.appendChild(hintContainer);

      let hint = document.createElement('div');
      hint.className = 'sound-hint';
      hintContainer.appendChild(hint);

      let soundImage = imagesToLoad.find(el => el.name === sounds[i].name);
      hint.appendChild(soundImage.img);

      let circle = document.createElement('div');
      circle.className = 'hint-circle';
      hintContainer.appendChild(circle);

      sounds[i].ui = hintContainer;
  }
}

function showHint(sound) { 
  sound.ui.classList.add('show');

  sound.ui.setAttribute('active', true);

  setTimeout(() => {
      hideHint(sound, sound.correct);
  }, 1500);
}

function hideHint(sound, correct) {
  if (!sound.ui.hasAttribute('active') || sound.ui.hasAttribute('showed'))
      return;

  if (correct)
      sound.ui.classList.add('success');
  else
      sound.ui.classList.add('failure');

  sound.button.classList.remove('active');

  sound.ui.setAttribute('showed', true);
}
