class Game {

    gameSpeed = 200;

    constructor() {
        this.gameArea = new GameArea();
        this.level = 1;
        this.setupKeys();
        
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
        this.size = new Coordinate(10, 20);
        this.deadPoints = [];
    }

    draw(activePiece) {
        console.clear();

        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                let isActive = false;
                let isDead = false;
                const currentPoint = new Coordinate(x, y);
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
                const currentPoint = new Coordinate(x, y);
                const isDead = this.deadPoints.find((deadPoint) => deadPoint.equals(currentPoint));
                if (!isDead) {
                    rowFull = false;
                    break;
                }
            }
            if (rowFull) {
                this.deadPoints = this.deadPoints
                    .filter((deadPoint) => deadPoint.y !== y)
                    .map((deadPoint) => deadPoint.y < y ? deadPoint.add(new Coordinate(0, 1)) : deadPoint);
                console.log(this.deadPoints);
                
            }
        } 
    }
}

class Piece {
    constructor(gameAreaSize) {
        this.originPosition = new Coordinate(Math.floor(gameAreaSize.x / 2), 0);
        this.rotation = 0;
        this.shape = new Shape();
    }

    rotate() {
        // TODO if collision occurs before rotating
        this.rotation = this.rotation + Math.PI / 2;
    }

    moveDown(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(new Coordinate(0, 1), deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.originPosition.moveDown();
        return true;
    }

    moveLeft(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(new Coordinate(-1, 0), deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.originPosition.moveLeft();
        return true;
    }

    moveRight(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(new Coordinate(1, 0), deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.originPosition.moveRight();
        return true;
    }

    detectCollision(offset, deadPoints, gameAreaSize) {
        for (const point of this.getPoints(offset)) {
            if (point.y >= gameAreaSize.y || point.x < 0 || point.x >= gameAreaSize.x) {
                return true;
            }
            for (const deadPoint of deadPoints) {
                if (deadPoint.equals(point)) {
                    return true;
                }
            }
        }

        return false;
    }

    getPoints(withOffset) {
        const rotatedPoints = this.shape.getRotatedPoints(this.rotation);
    
        const points = [this.originPosition]
            .concat(rotatedPoints.map((rotatedPoint) => this.originPosition.add(rotatedPoint)));
        
        if (withOffset) {
            return points.map((point) => point.add(withOffset));
        }
        return points;
    }

    draw() {
        const points = this.getPoints();
        for (const point of points) {
            point.draw();
        }
    }
}

class Coordinate {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    moveDown() {
        this.y++;
    }

    moveLeft() {
        this.x--;
    }

    moveRight() {
        this.x++;
    }

    add(point) {
        return new Coordinate(this.x + point.x,
            this.y + point.y); 
    }

    equals(point) {
        return point.x === this.x && point.y === this.y;
    }

    draw() {
        console.log(this.x, this.y);
    }
}

class I extends Piece {
    /**
     * Shape:
     * 
     *    #x##
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(-1, 0), new Coordinate(1, 0), new Coordinate(2, 0))
    }
}

class Box extends Piece {
    /**
     * Shape:
     * 
     *    x#
     *    ##
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(1, 1), new Coordinate(1, 0), new Coordinate(0, 1))
    }
}

class Mushroom extends Piece {
     /**
     * Shape:
     * 
     *     #
     *    #x#
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(0, 1), new Coordinate(-1, 0), new Coordinate(1, 0))
    }
}

class LeftS extends Piece {
    /**
     * Shape:
     * 
     *     ##
     *    #x
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(-1, 0), new Coordinate(0, -1), new Coordinate(1, -1))
    }
}

class RightS extends Piece {
    /**
     * Shape:
     * 
     *   ##
     *    x#
     * 
     * @param {Coordinate} gameAreaSize 
     */

    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(1, 0), new Coordinate(0, 1), new Coordinate(-1, 1))
    }
}

class LeftL extends Piece {
    /**
     * Shape:
     * 
     *    #
     *    #x#
     * 
     * @param {Coordinate} gameAreaSize 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(-1, -1), new Coordinate(1, 0), new Coordinate(-1, 0))
    }
}

class RightL extends Piece {
    /**
     * Shape:
     * 
     *      #
     *    #x#
     * 
     * @param {Coordinate} gameAreaSize 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new Shape(new Coordinate(1, -1), new Coordinate(1, 0), new Coordinate(-1, 0))
    }
}

class Shape {
    constructor(b, c, d) {
        this.pointB = b;
        this.pointC = c;
        this.pointD = d;
    }

    getRotatedPoints(rotation) {
        return this.getPoints().map((point) => {
            return new Coordinate(
                // x' = xcosθ - ysinθ.
                // y' = xsinθ + ycosθ.
                Math.round(point.x * Math.cos(rotation) - point.y * Math.sin(rotation)),
                Math.round(point.y * Math.cos(rotation) + point.x * Math.sin(rotation)),
            );
        })
    }
    
    getPoints() {
        return [this.pointB, this.pointC, this.pointD];
    }
} 

const game = new Game();
game.createNewPiece();
game.draw();
