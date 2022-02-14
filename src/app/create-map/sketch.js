const squares = [];

let valueX = 0;
let valueY = 0;

let selected = [];

let gridHeight;
let gridWidth;
let squareSize = 30;

function setup() {
    gridHeight = Math.floor((windowHeight - 0.2 * windowHeight) / squareSize) * squareSize - 1;
    gridWidth = Math.floor((windowWidth - 0.1 * windowWidth) / squareSize) * squareSize - 1;

    const canvas = createCanvas(gridWidth, gridHeight);
    for (let x = 0; x < width; x += squareSize) {
        for (let y = 0; y < height; y += squareSize) {
            squares.push(new Square(x, y));
        }
    }
    canvas.parent("p5-container");
}

function mouseClicked() {
    let vX = floor(mouseX / squareSize);
    let vY = floor(mouseY / squareSize);

    if (vX >= 0 && vX <= gridWidth / squareSize && vY >= 0 && vY <= gridWidth / squareSize) {
        valueX = floor(mouseX / squareSize);
        valueY = floor(mouseY / squareSize);
        selected.push([valueX, valueY]);
    }
}

function draw() {
    background(240);
    for (let b = 0; b < squares.length; b++) {
        squares[b].show();
    }

    fill(255);
    stroke(0);
    for (let b = 0; b < selected.length - 1; b++) {
        line(selected[b][0] * squareSize + (squareSize / 2), selected[b][1] * squareSize + (squareSize / 2), selected[b + 1][0] * squareSize + (squareSize / 2), selected[b + 1][1] * squareSize + (squareSize / 2));
    }

    fill('yellow');
    ellipse(mouseX, mouseY, 5, 5);

    fill('red');
    textSize(30);

    text("[X: " + valueX + ", Y: " + valueY + "]", 0, 25);
}

function Square(x, y) {
    this.x = x;
    this.y = y;

    this.show = function () {
        fill(255, 0.5);
        noStroke();

        fill('white');

        let contains = false;
        for (let i = 0; i < selected.length; i++) {
            if (selected[i][0] === this.x / squareSize && selected[i][1] === this.y / squareSize) {
                contains = true;
            }
        }

        if (contains) {
            fill('red');
        }
        rect(this.x, this.y, squareSize - 1, squareSize - 1);
    }
}

function getSelected() {
    alert(JSON.stringify(selected));
}
