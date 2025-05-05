class Move extends Phaser.Scene {
    constructor(){
        super("move");

        this.my = {sprite: {}};

        //this.boolatActive = false;
    }

    preload() {
        let l = this.load;
        l.setPath("./assets/");                           // Set load path
        l.image("Boolat", "tile_0000.png");              // boolatt
        l.image("Plane", "ship_0009.png");                // airplane
        l.image("tiles", "tiles_packed.png");            // background tileset
        l.image("enemy", "ship_0018.png");                // basic enemy plane
        l.tilemapTiledJSON("map", "Background.json");     // tilemap JSON
        for (let i = 0; i <= 9; i++) {                   // digits for score
            this.load.image(`digit_${i}`, `digit_${i}.png`);
        }
    }

    create() {
        let my = this.my;

        //tilemap 1
        this.map1 = this.add.tilemap("map", 16, 16, 10, 10);
        this.tileset = this.map1.addTilesetImage("tiles_packed", "tiles");
        this.bgLayer1 = this.map1.createLayer("Background", this.tileset, 0, 0);
        this.bgLayer1.setScale(2.5);
        //tilemap 2
        this.map2 = this.add.tilemap("map", 16, 16, 10, 10);
        this.tileset = this.map2.addTilesetImage("tiles_packed", "tiles");
        this.bgLayer2 = this.map2.createLayer("Background", this.tileset, 0, -this.bgLayer1.displayHeight);
        this.bgLayer2.setScale(2.5);

        //score & sprites
        this.score = 0;
        this.digitSprites = [];
        let digitSpacing = 24;

        //score initialization
        for (let i = 0; i < 6; i++) {
            let digit = this.add.image(460 + i * digitSpacing, 930, 'digit_0');
            digit.setScale(2);
            this.digitSprites.push(digit);
        }

        this.level = 1;
        this.levelDigitSprites = [];
        //level counter
        for (let i = 0; i< 2; i++) {
            let levelDig = this.add.image(20 + i * digitSpacing, 20, 'digit_0');
            levelDig.setScale(2);
            this.levelDigitSprites.push(levelDig);
        } this.updateLevelDisplay();

        //plane sprite
        my.sprite.playerPlane = this.physics.add.sprite(300, 850, "Plane"); 
        my.sprite.playerPlane.setScale(3);
        this.playerHP = 100;

        //Trash enemy sprite group
        this.trashMobs = this.physics.add.group();
        let collidersTime = Phaser.Math.Between(1000, 3000);
        this.trashHP = 3;
        
        this.time.addEvent({
            delay: collidersTime, // spawn random 0.5-3 seconds
            callback: () => this.spawnTrash(),
            loop: true
        });

        /* this.Boolat = this.add.sprite(0,0, "Boolat");
        this.Boolat.setScale(1.5);
        this.Boolat.setActive(false).setVisible(false) */

        // Boolat sprite group w/ physics
        my.sprite.Boolats = this.physics.add.group();

        this.boolatDmg = 1;  //initalize boolat damage
        this.shootCDC = 0;  //initalize boolat cooldown
        this.Cooldown = 3; //time between shots
        this.maxBoolat = 12; //max number of boolats


        //Physics events ----------------------------
        //trash hitting player
        this.physics.add.overlap(my.sprite.playerPlane, this.trashMobs, (playerPlane, trash) => {
            trash.destroy();
            this.playerHP -= trash.health*3;
            console.log(this.playerHP);
        })
        //bullets hitting trash
        this.physics.add.overlap(my.sprite.Boolats, this.trashMobs, (boolat, trash) => {
            boolat.destroy();
            
            trash.health -= this.boolatDmg;
            this.score += 5;
            this.updateScoreDisplay();
        
            if (trash.health <= 0) {
                trash.disableBody(true, true);  //disable dead enemy
                this.score += 50;
                this.updateScoreDisplay();
            }
        });

        //background scroll initialization
        this.bgLayers = [this.bgLayer1, this.bgLayer2];
        this.scrollSpeed = 3;

        this.shoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }

    update() {
        let my = this.my;

        if (this.shootCDC > 0) {
            this.shootCDC--;
        }
        
        //movment left and right
        if (this.left.isDown && my.sprite.playerPlane.x > 0) {
            my.sprite.playerPlane.x -= 8;
            if (this.shift.isDown && my.sprite.playerPlane.x > 0) {
                my.sprite.playerPlane.x -= 8;
            }
        }
        if (this.right.isDown && my.sprite.playerPlane.x < 600) {
            my.sprite.playerPlane.x += 8;
            if (this.shift.isDown && my.sprite.playerPlane.x < 600) {
                my.sprite.playerPlane.x += 8;
            }
        }

        //shooting boolats
        if (this.shoot.isDown && this.shootCDC <= 0 && my.sprite.Boolats.getLength() < this.maxBoolat) {
        //if (Phaser.Input.Keyboard.JustDown(this.shoot)) {
            let Boolat = this.physics.add.sprite(my.sprite.playerPlane.x, my.sprite.playerPlane.y - 27, "Boolat");
            Boolat.setScale(2);
            Boolat.setCollideWorldBounds(true);
            Boolat.body.onWorldBounds = true;
            my.sprite.Boolats.add(Boolat);  
            console.log(my.sprite.Boolats) //console log to show list of boolats
            this.shootCDC = this.Cooldown;
        }
        //moving the boolatts 
        for (let Proj of my.sprite.Boolats.getChildren()) {
            if (Proj) {
               Proj.y -= 15;
            }
            // deactivate if off screen
            if (Proj.y < 0) {
                Proj.destroy();
            }
        }

        // background scroll
        for (let layer of this.bgLayers) {
            layer.y += this.scrollSpeed;
        
            // If layer is entirely below the screen, move it back above the other
            if (layer.y >= this.bgLayer1.displayHeight) {
                // Find the other layer
                let other = this.bgLayers.find(l => l !== layer);
                layer.y = other.y - layer.displayHeight + this.scrollSpeed;
            }
        }
        
    }

    spawnTrash() {
        let trash = this.trashMobs.getFirstDead();
    
        if (!trash) {
            trash = this.trashMobs.create(Phaser.Math.Between(50, 550), -50, 'enemy'); // assuming 600px wide screen
            trash.setScale(2);
            trash.setVelocityY(200);
            trash.setCollideWorldBounds(false);
        } else {
            trash.setPosition(Phaser.Math.Between(50, 550), -50);
            trash.setVelocityY(200);
            trash.setActive(true).setVisible(true);
        }
        trash.health = this.trashHP;
    }

    updateScoreDisplay() {
        let scoreStr = this.score.toString().padStart(6, '0');
    
        for (let i = 0; i < scoreStr.length; i++) {
            let digitValue = scoreStr[i];
            this.digitSprites[i].setTexture(`digit_${digitValue}`);
        }
    }

    updateLevelDisplay() {
        let levelStr = this.level.toString().padStart(2, '0');
    
        for (let i = 0; i < levelStr.length; i++) {
            let digitValue = levelStr[i];
            this.levelDigitSprites[i].setTexture(`digit_${digitValue}`);
        }
    }

    nextWave() {
        this.trashHP += 1;
        
    }
}

