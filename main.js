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
  { url: './sounds/fake.mp3', name: 'Fake', type: 'vocal' },
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

let animationTimer = null;
let animationPause = false;
let personUI = null;
let promises = [];
let appIsReady = false;
let isGame = false;
let isRestarted = false;
let isSinging = false;

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

let isMobile = mobileUser();
let eventName = isMobile ? 'touchstart' : 'click';

startBtn.addEventListener('click', runGame);
restartBtn.addEventListener(eventName, restartGame);

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

  setFakeWord();
  toggleSoundsButtons(true);

  for (var i = 0; i < soundsBtn.length; i++)
      soundBtnHandler(soundsBtn[i]);

  startDate = new Date();

  gameTimer();
  personSing();

  setTimeout(() => {
    shuffleButtons();
  }, 1200);

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
      isSinging = false;

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

      soundsBtn.forEach(btn => {
        btn.style = '';
        btn.removeAttribute('disabled');
      });
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

  soundsBtn.forEach(btn => {
    btn.style = '';
    btn.removeAttribute('disabled');
  });
}

function mobileUser() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};

function setFakeWord() {
  let fakeBtn = document.querySelector('.sound-btn[data-name="Fake"]');
  let words = ['Lust', 'Kiss', 'Wrist', 'Feet', 'Sin', 'Things'];

  fakeBtn.textContent = words[Math.floor(Math.random() * words.length)];
}

function shuffleButtons() {
  var movesCount = 4;
  var buttonsList = [];

  soundsBtn.forEach(el => { buttonsList.push(el) });

  let shuffleInterval = setInterval(() => {
    if (!movesCount || isRestarted) {
      clearInterval(shuffleInterval);
      return;
    }

    let rdmA = Math.floor(Math.random() * buttonsList.length);
    let btnA = buttonsList[rdmA];
    buttonsList.splice(rdmA, 1);

    let rdmB = Math.floor(Math.random() * buttonsList.length);
    let btnB = buttonsList[rdmB];
    buttonsList.splice(rdmB, 1);

    let buttonA = {
      row: btnA.getAttribute('data-row'),
      col: btnA.getAttribute('data-col'),
      ui: btnA,
      transform: { x: 0, y: 0 },
      relative: {
        x: 0,
        y: 0
      }
    }

    let buttonB = {
      row: btnB.getAttribute('data-row'),
      col: btnB.getAttribute('data-col'),
      transform: { x: 0, y: 0 },
      ui: btnB
    }

    buttonA.rect = buttonA.ui.getBoundingClientRect();
    buttonB.rect = buttonB.ui.getBoundingClientRect();

    buttonA.rect.x = Math.floor(buttonA.rect.x);
    buttonA.rect.y = Math.floor(buttonA.rect.y);

    buttonB.rect.x = Math.floor(buttonB.rect.x);
    buttonB.rect.y = Math.floor(buttonB.rect.y);

    if (buttonA.rect.x < buttonB.rect.x)
      buttonA.relative.x = -1; // lefter
     else if (buttonA.rect.x === buttonB.rect.x)
      buttonA.relative.x = 0; // same
    else
      buttonA.relative.x = 1; // righter

    if (buttonA.rect.y < buttonB.rect.y)
      buttonA.relative.y = -1; // higher
    else if (buttonA.rect.y === buttonB.rect.y)
      buttonA.relative.y = 0; // same
    else
      buttonA.relative.y = 1; // lower

    buttonA.transform.x = Math.abs(buttonA.rect.x - buttonB.rect.x);
    buttonA.transform.y = Math.abs(buttonA.rect.y - buttonB.rect.y);

    buttonB.transform.x = -Math.abs(buttonB.rect.x - buttonA.rect.x);
    buttonB.transform.y = -Math.abs(buttonB.rect.y - buttonA.rect.y);

    if (buttonA.relative.x === 1) {
      buttonA.transform.x = -buttonA.transform.x;
      buttonB.transform.x = Math.abs(buttonB.transform.x);
    }

    if (buttonA.relative.y === 1) {
      buttonA.transform.y = -buttonA.transform.y;
      buttonB.transform.y = Math.abs(buttonB.transform.y);
    }

    buttonA.ui.style.transform = `translate(${buttonA.transform.x}px, ${buttonA.transform.y}px)`;
    buttonB.ui.style.transform = `translate(${buttonB.transform.x}px, ${buttonB.transform.y}px)`;

    movesCount--;
  }, 600);
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

  if (sound)
    sound.button = btn;

  btn.addEventListener(eventName, () => {
      if (!isGame || activeVocal || btn.hasAttribute('disabled'))
          return

      activeVocal = true;

      preloadSound.audio.play();

      setPersonFrame(Math.floor(Math.random() * 3 + 4), 800);

      if (sound)
        if (answerWindow && sound.name === sounds[soundAnswerIndex].name) {
            hideHint(sound, 1);

            if (isSinging)
              btn.setAttribute('disabled', 'true');

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
          isSinging = true;
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

      if (soundIndex === sounds.length - 1 && !restartBtn.classList.contains('hide')) {
        restartBtn.classList.add('hide');

        setTimeout(() => {
            restartBtn.classList.add('hidden');
        }, 100);
      }

      // scoreUI.textContent = score + ' / 8';
  }, 10)
}

function preloadFiles(){
  for (var i = 0; i < imagesToLoad.length; i++)
      preloadImage(imagesToLoad[i]);

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

  // promises.push(new Promise(resolve => {
  //     let audio = new Audio(obj.url);

  //     obj.audio = audio;

  //     if (obj.type && obj.type === 'vocal')
  //         audio.addEventListener('ended', function(){
  //             audio.currentTime = 0;
  //             activeVocal = false;
  //         });

  //     if (obj.name && obj.name === 'theme')
  //         audio.addEventListener('ended', function(){
  //             audio.currentTime = 0;
  //             audio.play();
  //         });

  //     // let audioUI = document.createElement('audio');
  //     // audioUI.setAttribute('src', obj.url);
  //     // container.appendChild(audioUI);

  //     // if (obj.type && obj.type === 'vocal')
  //     //     audioUI.addEventListener('ended', function(){
  //     //         audioUI.currentTime = 0;
  //     //         activeVocal = false;
  //     //     });

  //     // obj.audio = audioUI;

  //     audio.oncanplaythrough = function() {
  //         resolve();
  //     };
  // }))
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
