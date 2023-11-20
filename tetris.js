import {Point, LeftL, LeftS, RightL, RightS, Box, I, Mushroom} from './shapes.js';

export class Game {

    gameSpeed = 400;

    constructor() {
        this.gameArea = new GameArea();
        this.level = 1;
        this.setupKeys();
        this.createNewPiece();
        
        this.draw();
        setInterval(() => this.tick(), Math.round(this.gameSpeed / this.level));
    }

    setupKeys() {
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        
        process.stdin.on('data', (key) => {
            if (key == '\u0003') { process.exit(); }    // ctrl-c

            if (this.activePiece) {
                if (key == '\u001B\u005B\u0041') {
                    this.activePiece.rotate(this.gameArea.deadPoints, this.gameArea.size);
                }
                if (key == '\u001B\u005B\u0043') {
                    this.activePiece.moveRight(this.gameArea.deadPoints, this.gameArea.size);
                }
                if (key == '\u001B\u005B\u0042') {
                    this.activePiece.moveDown(this.gameArea.deadPoints, this.gameArea.size);
                }
                if (key == '\u001B\u005B\u0044') {
                    this.activePiece.moveLeft(this.gameArea.deadPoints, this.gameArea.size);
                }
            }
        });
    }

    tick() {
        // TODO lose condition
        // TODO award points
        if (!this.activePiece) {
            this.createNewPiece();
        }
        if (!this.activePiece.moveDown(this.gameArea.deadPoints, this.gameArea.size)) {
            this.gameArea.deadPoints.push(...this.activePiece.getPoints());
            this.gameArea.removeFullRows();
            this.activePiece = null;
        };
        this.draw()
    }

    createNewPiece() {
        const shapes = [RightL, LeftL, RightS, LeftS, I, Box, Mushroom];
        const RandomShape = shapes[Math.floor(Math.random() * shapes.length)];
        this.activePiece = new RandomShape(this.gameArea.size);
    }

    draw() {
        this.gameArea.draw(this.activePiece);
    }
}

class GameArea {
    constructor() {
        this.size = new Point(10, 20);
        this.deadPoints = [];
    }

    draw(activePiece) {
        console.clear();

        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                let isActive = false;
                let isDead = false;
                const currentPoint = new Point(x, y);
                if (activePiece) {
                    for (const point of activePiece.getPoints()) {
                        if (point.equals(currentPoint)) {
                            isActive = true;
                            break;
                        }
                    }
                }
                for (const deadPoint of this.deadPoints) {
                    if (deadPoint.equals(currentPoint)) {
                        isDead = true;
                    }
                }
                if (isActive) {
                    process.stdout.write('#');
                } else if (isDead) {
                    process.stdout.write('@');
                } else {
                    process.stdout.write('_');
                }
            }    
            process.stdout.write('\n');
        }
    }

    removeFullRows() {
        for (let y = 0; y < this.size.y; y++) {
            let rowFull = true;
            for (let x = 0; x < this.size.x; x++) {
                const currentPoint = new Point(x, y);
                const isDead = this.deadPoints.find((deadPoint) => deadPoint.equals(currentPoint));
                if (!isDead) {
                    rowFull = false;
                    break;
                }
            }
            if (rowFull) {
                this.deadPoints = this.deadPoints
                    .filter((deadPoint) => deadPoint.y !== y)
                    .map((deadPoint) => deadPoint.y < y ? deadPoint.add(new Point(0, 1)) : deadPoint);
                console.log(this.deadPoints);
                
            }
        } 
    }
}
