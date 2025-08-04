
//board
let board;
let boardWidth = 360;
let boardHeight = 640;
let context;

//bird
let birdWidth = 75; //width/height ratio = 408/228 = 17/12
let birdHeight = 65;
let birdX = boardWidth/8;
let birdY = boardHeight/2;
let birdImg;

let bird = {
    x : birdX,
    y : birdY,
    width : birdWidth,
    height : birdHeight
}

//pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

//physics
let velocityX = -2; //pipes moving left speed
let velocityY = 1; //bird jump speed
let gravity = 0.2;

let gameOver = false;
let score = 0;

window.onload = function() {
    board = document.getElementById("board");
    // ... other initializations
    context = board.getContext("2d");

    // Create and style the jump button
    const jumpButton = document.createElement("button");
    jumpButton.id = "jumpButton";
    jumpButton.innerHTML = "<b>Jump</b>";
    document.body.appendChild(jumpButton);

    jumpButton.addEventListener("click", moveBird);

    // Initial call to set up the responsive layout
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // ... rest of your window.onload code
}

function resizeCanvas() {
    const canvas = document.getElementById('board');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const aspectRatio = originalBoardWidth / originalBoardHeight;

    let newBoardWidth, newBoardHeight;

    // คำนวณขนาดบอร์ดใหม่โดยรักษาสัดส่วน
    if (windowWidth / windowHeight > aspectRatio) {
        newBoardHeight = windowHeight * 0.9;
        newBoardWidth = newBoardHeight * aspectRatio;
    } else {
        newBoardWidth = windowWidth * 0.9;
        newBoardHeight = newBoardWidth / aspectRatio;
    }

    canvas.width = newBoardWidth;
    canvas.height = newBoardHeight;

    // คำนวณสัดส่วนการปรับขนาด
    const widthScale = newBoardWidth / originalBoardWidth;
    const heightScale = newBoardHeight / originalBoardHeight;

    // อัปเดตตัวแปรทั่วโลกด้วยค่าที่ถูกปรับขนาดแล้ว
    boardWidth = newBoardWidth;
    boardHeight = newBoardHeight;
    
    // ปรับขนาดและตำแหน่งของนก
    bird.width = birdWidth * widthScale;
    bird.height = birdHeight * heightScale;
    bird.x = (originalBoardWidth / 8) * widthScale;
    bird.y = (originalBoardHeight / 2) * heightScale;

    // ปรับขนาดและตำแหน่งของท่อ
    pipeWidth = originalPipeWidth * widthScale;
    pipeHeight = originalPipeHeight * heightScale;
    pipeX = originalPipeX * widthScale;

    // ปรับตัวแปรฟิสิกส์
    velocityX = -2 * widthScale;
    gravity = 0.2 * heightScale;

    // วาดเกมใหม่
    if (!gameOver) {
        update();
    }
}

    //draw flappy bird
    // context.fillStyle = "green";
    // context.fillRect(bird.x, bird.y, bird.width, bird.height);

    //load images
    birdImg = new Image();
    birdImg.src = "./santa-srichan.png";
    birdImg.onload = function() {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe02.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe01.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds
    document.addEventListener("keydown", moveBird);


function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //bird
    velocityY += gravity;
    // bird.y += velocityY;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    //pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    //clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    //score
    context.fillStyle = "red";
    context.font="40px sans-serif";
    context.fillText(score, 20, 50);

    // ...inside the update() function...
if (gameOver) {
    // Draw semi-transparent background
    context.fillStyle = "rgba(0, 0, 0, 0.5)";
    context.fillRect(0, 0, board.width, board.height);

    // Draw "GAME OVER" text
    context.fillStyle = "red";
    context.font = "50px sans-serif";
    context.textAlign = "center";
    context.fillText("GAME OVER", board.width / 2, board.height / 2 - 20);

    // Draw "Press Space to Restart" text
    context.fillStyle = "white";
    context.font = "20px sans-serif";
    context.fillText("Press Space or Tap to Restart", board.width / 2, board.height / 2 + 20);
    return; // Stop the update loop once the game is over
}






}

function moveBird(e) {
     if (e.type === "click" || e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyX") {
        // jump
        velocityY = -6;

        //game reset
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}

// ...existing code...
window.addEventListener('resize', resizeCanvas);




// Original dimensions for scaling
const originalBoardWidth = 360;
const originalBoardHeight = 640;
const originalPipeWidth = 64;
const originalPipeHeight = 512;
const originalPipeX = 360;

// ... โค้ดที่มีอยู่ ...

function placePipes() {
    if (gameOver) return;

    let openingSpace = boardHeight / 4;

    // ใช้ pipeHeight ที่ปรับขนาดแล้วเลย
    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);

    let topPipe = {
        img: topPipeImg,
        x: boardWidth,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: boardWidth,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);
   
}


