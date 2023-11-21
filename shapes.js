export class Point {
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
        return new Point(this.x + point.x,
            this.y + point.y); 
    }

    equals(point) {
        return point.x === this.x && point.y === this.y;
    }
}

// Define 3 points relative to main anchor point each Tetromino has -> defines the shapes of a tetromino
class TetrominoShape {
    constructor(b, c, d) {
        this.pointB = b;
        this.pointC = c;
        this.pointD = d;
    }

    getRotatedPoints(rotation) {
        return this.getPoints().map((point) => {
            return new Point(
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

// Tetromino is defined by a Shape, its rotation and the the position of the anchor point
export class Tetromino {
    constructor(gameAreaSize) {
        this.originPosition = new Point(Math.floor(gameAreaSize.x / 2), 0);
        this.rotation = 0;
        this.shape = new TetrominoShape();
    }

    rotate(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(null, Math.PI / 2, deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.rotation = this.rotation + Math.PI / 2;
        return true;
    }

    moveDown(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(new Point(0, 1), null, deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.originPosition.moveDown();
        return true;
    }

    moveLeft(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(new Point(-1, 0), null, deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.originPosition.moveLeft();
        return true;
    }

    moveRight(deadPoints, gameAreaSize) {
        const collision = this.detectCollision(new Point(1, 0), null, deadPoints, gameAreaSize);
        if (collision) {
            return false;
        }
        this.originPosition.moveRight();
        return true;
    }

    detectCollision(offset, rotation, deadPoints, gameAreaSize) {
        for (const point of this.getPoints(offset, rotation)) {
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

    getPoints(withOffset, withRotation) {
        const rotatedPoints = this.shape.getRotatedPoints(this.rotation + (withRotation || 0));
    
        const points = [this.originPosition]
            .concat(rotatedPoints.map((rotatedPoint) => this.originPosition.add(rotatedPoint)));
        
        if (withOffset) {
            return points.map((point) => point.add(withOffset));
        }
        return points;
    }
}

export class I extends Tetromino {
    /**
     * Shape:
     * 
     *    #x##
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(-1, 0), new Point(1, 0), new Point(2, 0))
    }
}

export class Box extends Tetromino {
    /**
     * Shape:
     * 
     *    x#
     *    ##
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(1, 1), new Point(1, 0), new Point(0, 1))
    }
}

export class Mushroom extends Tetromino {
     /**
     * Shape:
     * 
     *     #
     *    #x#
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(0, 1), new Point(-1, 0), new Point(1, 0))
    }
}

export class LeftS extends Tetromino {
    /**
     * Shape:
     * 
     *     ##
     *    #x
     * 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(-1, 0), new Point(0, -1), new Point(1, -1))
    }
}

export class RightS extends Tetromino {
    /**
     * Shape:
     * 
     *   ##
     *    x#
     * 
     * @param {Point} gameAreaSize 
     */

    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(1, 0), new Point(0, 1), new Point(-1, 1))
    }
}

export class LeftL extends Tetromino {
    /**
     * Shape:
     * 
     *    #
     *    #x#
     * 
     * @param {Point} gameAreaSize 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(-1, -1), new Point(1, 0), new Point(-1, 0))
    }
}

export class RightL extends Tetromino {
    /**
     * Shape:
     * 
     *      #
     *    #x#
     * 
     * @param {Point} gameAreaSize 
     */
    constructor(gameAreaSize) {
        super(gameAreaSize);
        this.shape = new TetrominoShape(new Point(1, -1), new Point(1, 0), new Point(-1, 0))
    }
}
