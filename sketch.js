let spriteSheet;
let jumpSpriteSheet;
let hitSpriteSheet;
let stopSpriteSheet;
let stop3SpriteSheet;
let touch3SpriteSheet;
let smile2SpriteSheet;
let animation = [];
let jumpAnimation = [];
let hitAnimation = [];
let stopAnimation = [];
let stop3Animation = [];
let touch3Animation = [];
let smile2Animation = [];

const frameCountTotal = 12; // 跑步精靈圖的總影格數
const jumpFrameCountTotal = 13; // 跳躍精靈圖的總影格數
const hitFrameCountTotal = 6; // 打擊精靈圖的總影格數
const stopFrameCountTotal = 8; // 新增角色的總影格數
const stop3FrameCountTotal = 7; // 第三個角色的總影格數
const touch3FrameCountTotal = 11; // 角色3互動動畫的總影格數
const smile2FrameCountTotal = 6; // 角色2互動動畫的總影格數
const animationSpeed = 5; // 跑步動畫速度
const jumpAnimationSpeed = 4; // 跳躍動畫速度
const hitAnimationSpeed = 4; // 打擊動畫速度
const stopAnimationSpeed = 6; // 新增角色的動畫速度
const stop3AnimationSpeed = 8; // 第三個角色的動畫速度
const touch3AnimationSpeed = 5; // 角色3互動動畫的速度
const smile2AnimationSpeed = 5; // 角色2互動動畫的速度

// 角色屬性
let characterX, characterY;
let groundY; // 地面位置
let moveSpeed = 5;
let direction = 1; // 1: 右, -1: 左
let isMoving = false;

// 新增角色的屬性
let newCharacterX, newCharacterY;
let newCharacter3X, newCharacter3Y;
let interactionDistance = 120; // 觸發互動的距離

// --- 對話互動屬性 ---
let inputBox;
let isInteractingWithChar2 = false;
let char2Text = '';
let char2Response = '';
let quizTable; // 儲存CSV測驗題庫
let currentQuestion = null; // 儲存當前抽到的題目物件
let quizState = 'idle'; // 問答狀態: idle, asking, answered

// 跳躍屬性
let isJumping = false;
let velocityY = 0;
let gravity = 0.6;
let jumpForce = -12;
let jumpFrame = 0;

// 打擊屬性
let isHitting = false;
let hitFrame = 0;


function preload() {
  // 預先載入圖片資源
  spriteSheet = loadImage('1/run/run_1.png');
  jumpSpriteSheet = loadImage('1/jump/jump_1.png');
  hitSpriteSheet = loadImage('1/hit/hit_1.png');
  stopSpriteSheet = loadImage('2/stop/stop_2.png');
  stop3SpriteSheet = loadImage('3/stop/stop_3.png');
  touch3SpriteSheet = loadImage('3/touch/touch_3.png');
  smile2SpriteSheet = loadImage('2/smile/smile_2.png');

  // 載入CSV題庫，'header'表示第一行為標題
  quizTable = loadTable('data/quiz.csv', 'csv', 'header');
}

function setup() {
  // 建立一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // --- 處理跑步動畫 ---
  let frameWidth = spriteSheet.width / frameCountTotal;
  let frameHeight = spriteSheet.height;
  for (let i = 0; i < frameCountTotal; i++) {
    let frame = spriteSheet.get(i * frameWidth, 0, frameWidth, frameHeight);
    animation.push(frame);
  }

  // --- 處理跳躍動畫 ---
  let jumpFrameWidth = jumpSpriteSheet.width / jumpFrameCountTotal;
  let jumpFrameHeight = jumpSpriteSheet.height;
  for (let i = 0; i < jumpFrameCountTotal; i++) {
    let frame = jumpSpriteSheet.get(i * jumpFrameWidth, 0, jumpFrameWidth, jumpFrameHeight);
    jumpAnimation.push(frame);
  }
  
  // --- 處理打擊動畫 ---
  let hitFrameWidth = hitSpriteSheet.width / hitFrameCountTotal;
  let hitFrameHeight = hitSpriteSheet.height;
  for (let i = 0; i < hitFrameCountTotal; i++) {
    let frame = hitSpriteSheet.get(i * hitFrameWidth, 0, hitFrameWidth, hitFrameHeight);
    hitAnimation.push(frame);
  }

  // --- 處理新增角色動畫 ---
  let stopFrameWidth = stopSpriteSheet.width / stopFrameCountTotal;
  let stopFrameHeight = stopSpriteSheet.height;
  for (let i = 0; i < stopFrameCountTotal; i++) {
    let frame = stopSpriteSheet.get(i * stopFrameWidth, 0, stopFrameWidth, stopFrameHeight);
    stopAnimation.push(frame);
  }
  
  // --- 處理第三個角色動畫 ---
  let stop3FrameWidth = stop3SpriteSheet.width / stop3FrameCountTotal;
  let stop3FrameHeight = stop3SpriteSheet.height;
  for (let i = 0; i < stop3FrameCountTotal; i++) {
    let frame = stop3SpriteSheet.get(i * stop3FrameWidth, 0, stop3FrameWidth, stop3FrameHeight);
    stop3Animation.push(frame);
  }

  // --- 處理角色3互動動畫 ---
  let touch3FrameWidth = touch3SpriteSheet.width / touch3FrameCountTotal;
  let touch3FrameHeight = touch3SpriteSheet.height;
  for (let i = 0; i < touch3FrameCountTotal; i++) {
    let frame = touch3SpriteSheet.get(i * touch3FrameWidth, 0, touch3FrameWidth, touch3FrameHeight);
    touch3Animation.push(frame);
  }

  // --- 處理角色2互動動畫 ---
  let smile2FrameWidth = smile2SpriteSheet.width / smile2FrameCountTotal;
  let smile2FrameHeight = smile2SpriteSheet.height;
  for (let i = 0; i < smile2FrameCountTotal; i++) {
    let frame = smile2SpriteSheet.get(i * smile2FrameWidth, 0, smile2FrameWidth, smile2FrameHeight);
    smile2Animation.push(frame);
  }

  // 將圖片的繪製模式設定為以中心點為基準
  imageMode(CENTER);

  // 初始化角色位置在畫面中央
  characterX = width / 2;
  characterY = height / 2;
  groundY = height / 2; // 將初始Y位置設為地面

  // 初始化新角色的位置，使其固定在原角色初始位置的左邊
  newCharacterX = characterX - 150;
  newCharacterY = groundY;

  // 初始化第三個角色的位置，使其固定在原角色初始位置的右邊
  newCharacter3X = characterX + 150;
  newCharacter3Y = groundY;
}

function draw() {
  // 設定背景顏色
  background('#f2e9e4');

  // --- 狀態更新 ---
  if (isJumping) {
    // 1. 跳躍狀態 (最高優先級)
    velocityY += gravity; // 套用重力
    characterY += velocityY;
    jumpFrame += 1 / jumpAnimationSpeed;

    // 判斷是否落地
    if (characterY >= groundY) {
      characterY = groundY; // 確保角色回到地面
      isJumping = false;
      jumpFrame = 0;
    }
  } else if (isHitting) {
    // 2. 打擊狀態
    hitFrame += 1 / hitAnimationSpeed;
    if (hitFrame >= hitFrameCountTotal) {
      isHitting = false;
      hitFrame = 0;
    }
  } else {
    // 3. 地面待機/移動狀態
    isMoving = false; // 先假設角色沒有移動
    if (keyIsDown(RIGHT_ARROW)) {
      characterX += moveSpeed;
      direction = 1;
      isMoving = true;
    }
    if (keyIsDown(LEFT_ARROW)) {
      characterX -= moveSpeed;
      direction = -1;
      isMoving = true;
    }
    // 監聽跳躍鍵
    if (keyIsDown(UP_ARROW)) {
      isJumping = true;
      velocityY = jumpForce;
    }
    // 監聽空白鍵 (打擊)
    if (keyIsDown(32)) { // 32 是空白鍵的 keycode
      isHitting = true;
    }
  }

  // --- 繪製新增的角色 ---
  push();
  // 檢查角色1和角色2的距離
  let distance2 = abs(characterX - newCharacterX);
  let isClose2 = distance2 < interactionDistance;
  
  // --- 處理與角色2的問答互動 ---
  if (isClose2 && quizState === 'idle') { // 靠近且處於閒置狀態
    // 檢查題庫是否成功載入
    if (!quizTable || quizTable.getRowCount() === 0) {
      char2Text = "糟糕，題庫讀取失敗了！";
      // 可以在此處停留，或設定一個狀態讓玩家知道問題
      return; // 提前結束 draw 函式中關於此角色的後續處理
    }

    // 靠近時，如果處於閒置狀態，則開始提問
    quizState = 'asking';
    isInteractingWithChar2 = true;
    
    // 從題庫中隨機抽取一題
    let questionIndex = floor(random(quizTable.getRowCount()));
    currentQuestion = quizTable.getRow(questionIndex);
    
    char2Text = currentQuestion.getString('question'); // 顯示題目
    char2Response = ''; // 清空回答
    inputBox = createInput();
    inputBox.position(characterX - 75, characterY - 100);
    inputBox.size(150); 
    inputBox.changed(checkAnswer); // 將Enter事件綁定到新的答案檢查函式
  } else if (!isClose2 && isInteractingWithChar2) {
    // 結束互動
    isInteractingWithChar2 = false;
    char2Text = '';
    char2Response = '';
    inputBox.remove();
  } else if (!isClose2 && quizState === 'answered') {
    // 當玩家回答完問題並離開後，重置狀態以便下次提問
    quizState = 'idle';
    char2Text = '';
    char2Response = '';
  }
  if (!isClose2 && quizState !== 'idle') {
    quizState = 'idle'; // 遠離時重置問答狀態
  }

  // 如果正在互動，更新輸入框位置
  if (isInteractingWithChar2) {
    inputBox.position(characterX - 75, characterY - 100);
  }

  // 讓角色2總是面向角色1
  let direction2;
  if (characterX > newCharacterX) {
    direction2 = 1; // 角色1在右邊，角色2朝右 (不翻轉)
  } else {
    direction2 = -1; // 角色1在左邊，角色2朝左 (水平翻轉)
  }

  translate(newCharacterX, newCharacterY); // 將原點移動到角色2的位置
  scale(direction2, 1); // 根據方向翻轉

  let imageToDraw2;
  if (isClose2) {
    // 如果靠近，播放互動動畫
    let smile2FrameIndex = floor(frameCount / smile2AnimationSpeed) % smile2FrameCountTotal;
    imageToDraw2 = smile2Animation[smile2FrameIndex];
  } else {
    // 如果遠離，播放待機動畫
    let stopFrameIndex = floor(frameCount / stopAnimationSpeed) % stopFrameCountTotal;
    imageToDraw2 = stopAnimation[stopFrameIndex];
  }
  image(imageToDraw2, 0, 0); // 在新的原點繪製角色

  // --- 在角色2頭上繪製文字 ---
  if (isInteractingWithChar2) {
    push();
    scale(direction2, 1); // 將文字方向翻轉回來，使其總是正向
    
    // 如果有回饋，顯示回饋；否則顯示問題
    let textToShow = char2Response || char2Text;

    // 設定文字樣式並計算方框大小
    textSize(16);
    textFont('Noto Sans TC'); // 使用更纖細的 Noto Sans TC 字體
    let padding = 10;
    let boxWidth = textWidth(textToShow) + padding * 2;
    let boxHeight = textSize() + padding;

    // 繪製方框
    rectMode(CENTER);
    stroke(0); // 設定邊框為黑色
    strokeWeight(2); // 設定邊框粗細
    fill(255); // 設定背景為白色
    rect(0, -65, boxWidth, boxHeight);

    // 繪製文字
    fill(0); // 文字顏色
    textAlign(CENTER, CENTER);
    text(textToShow, 0, -65);
    pop();
  }
  pop();

  // --- 繪製第三個角色 ---
  push();
  // 檢查角色1和角色3的距離
  let distance3 = abs(characterX - newCharacter3X);
  let isClose3 = distance3 < interactionDistance;

  // 判斷角色1是否在角色3的左邊
  let direction3 = 1; // 預設方向 (不翻轉)
  if (characterX < newCharacter3X) {
    direction3 = -1; // 如果角色1在左邊，則水平翻轉
  }

  translate(newCharacter3X, newCharacter3Y); // 將原點移動到角色3的位置
  scale(direction3 * 1.5, 1.5); // 根據方向翻轉並放大1.5倍

  let imageToDraw;
  if (isClose3) {
    // 如果靠近，播放互動動畫
    let touch3FrameIndex = floor(frameCount / touch3AnimationSpeed) % touch3FrameCountTotal;
    imageToDraw = touch3Animation[touch3FrameIndex];
  } else {
    // 如果遠離，播放待機動畫
    let stop3FrameIndex = floor(frameCount / stop3AnimationSpeed) % stop3FrameCountTotal;
    imageToDraw = stop3Animation[stop3FrameIndex];
  }
  image(imageToDraw, 0, 0); // 在新的原點繪製角色3
  pop();

  // --- 繪製角色 ---
  push(); // 儲存當前的繪圖設定
  translate(characterX, characterY); // 將畫布原點移動到角色位置
  scale(direction, 1); // 根據方向翻轉畫布 (1 不變, -1 水平翻轉)
  
  let currentImage;
  if (isJumping) {
    let currentJumpFrameIndex = floor(jumpFrame) % jumpFrameCountTotal;
    currentImage = jumpAnimation[currentJumpFrameIndex];
  } else if (isHitting) {
    let currentHitFrameIndex = floor(hitFrame);
    currentImage = hitAnimation[currentHitFrameIndex];
  } else {
    if (isMoving) {
      // 如果在移動，就播放跑步動畫
      let currentFrameIndex = floor(frameCount / animationSpeed) % frameCountTotal;
      currentImage = animation[currentFrameIndex];
    } else {
      // 如果靜止，就顯示第一個影格
      currentImage = animation[0];
    }
  }
  
  // 在新的原點 (0,0) 繪製角色
  image(currentImage, 0, 0);
  
  pop(); // 恢復原本的繪圖設定

  // --- 繪製右上角文字 ---
  push();
  fill(0); // 黑色字體
  textAlign(RIGHT, TOP);
  textSize(20); // 設定一個適當的大小
  text('414730605羅郁婷', width - 10, 10); // 繪製在右上角，留10px邊距
  pop();
}

// 當瀏覽器視窗大小改變時，自動調整畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 同時更新地面位置，避免角色懸空或陷入地下
  groundY = height / 2;
}

function checkAnswer() {
  // 當使用者在輸入框按下Enter後，檢查答案
  let userAnswer = inputBox.value();
  let correctAnswer = currentQuestion.getString('answer');

  if (userAnswer === correctAnswer) {
    // 答對了
    char2Response = currentQuestion.getString('correct_feedback');
  } else {
    // 答錯了
    char2Response = currentQuestion.getString('incorrect_feedback');
  }

  char2Text = ''; // 清除題目文字，只顯示回饋
  inputBox.remove(); // 移除輸入框
  quizState = 'answered'; // 更新狀態為已回答
  // isInteractingWithChar2 保持 true，直到玩家離開，這樣才能持續顯示回饋
}
