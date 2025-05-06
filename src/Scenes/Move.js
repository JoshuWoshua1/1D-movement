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
        l.image("evilBoolat", "eviltile_0000.png");     // evilboolatt
        l.image("Plane", "ship_0009.png");                // airplane
        l.image("tiles", "tiles_packed.png");            // background tileset
        l.image("enemy2", "ship_0012.png").FlipY;                 // bigger enemy plane
        l.image("enemy", "ship_0018.png").FlipY;                // basic enemy plane
        l.image("health", "tile_0024.png");              // health indicator
        l.image("boom", "tile_0005.png");                 // explodey
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

        this.playerHP = 100;
        this.hpDigitSprites = [];
        this.add.image(20, 930, "health").setScale(2);
        //health counter
        for (let i = 0; i< 3; i++) {
            let hpDig = this.add.image(50 + i * digitSpacing, 930, 'digit_0');
            hpDig.setScale(2);
            this.hpDigitSprites.push(hpDig);
        } this.updateHpDisplay();

        //plane sprite
        my.sprite.playerPlane = this.physics.add.sprite(300, 850, "Plane"); 
        my.sprite.playerPlane.setScale(3);

        //Trash enemy sprite group
        this.trashMobs = this.physics.add.group();
        let collidersTime = Phaser.Math.Between(1000, 3000);
        this.trashHP = 3;
        
        //trash enemy spawner
        this.time.addEvent({
            delay: collidersTime, // spawn random 0.5-3 seconds
            callback: () => this.spawnTrash(),
            loop: true
        });

        //regular enemy sprite group
        this.regMobs = this.physics.add.group();
        let mobsTime = Phaser.Math.Between(4000, 8000);
        this.regHP = 10;

        //reg enemy spawner
        this.time.addEvent({
            delay: mobsTime,  //spawn every 4-8 seconds
            callback: () => this.spawnReg(),
            loop: true
        });

        // Boolat sprite group w/ physics
        my.sprite.Boolats = this.physics.add.group();
        my.sprite.evilBoolats = this.physics.add.group();

        this.boolatDmg = 1;  //initalize boolat damage
        this.shootCDC = 0;  //initalize boolat cooldown
        this.Cooldown = 3; //time between shots
        this.maxBoolat = 12; //max number of boolats


        //Physics events ----------------------------
        //trash hitting player
        this.physics.add.overlap(my.sprite.playerPlane, this.trashMobs, (playerPlane, trash) => {
            this.bigBoom(playerPlane);

            trash.destroy();
            this.playerHP -= trash.health * 3;
            this.updateHpDisplay();
        });
        //reg enemy hitting player
        this.physics.add.overlap(my.sprite.playerPlane, this.regMobs, (playerPlane, mob) => {
            this.bigBoom(playerPlane);

            mob.destroy();
            this.playerHP -= mob.health * 2;
            this.updateHpDisplay();
        });
        //evilBoolat hitting player
        this.physics.add.overlap(my.sprite.playerPlane, my.sprite.evilBoolats, (playerPlane, evilBoolat) => {
            this.smallBoom(playerPlane);

            evilBoolat.destroy();
            this.playerHP -= 5;
            this.updateHpDisplay();
        });
        //bullets hitting trash
        this.physics.add.overlap(my.sprite.Boolats, this.trashMobs, (boolat, trash) => {
            boolat.destroy();
            this.smallBoom(trash);
            
            trash.health -= this.boolatDmg;
            this.score += 5;
            this.updateScoreDisplay();
        
            if (trash.health <= 0) {
                this.bigBoom(trash);
                trash.destroy();  //disable dead enemy
                this.score += 50;
                this.updateScoreDisplay();
            }
        });
        //bullets hitting reg mobs
        this.physics.add.overlap(my.sprite.Boolats, this.regMobs, (boolat, mob) => {
            boolat.destroy();
            this.smallBoom(mob);

            mob.health -= this.boolatDmg;
            this.score += 5;
            this.updateScoreDisplay();
        
            if (mob.health <= 0) {
                this.bigBoom(mob);
                mob.destroy();  //disable dead enemy
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
            //console.log(my.sprite.Boolats) //console log to show list of boolats
            this.shootCDC = this.Cooldown;
        }
        //moving the boolats 
        for (let Proj of my.sprite.Boolats.getChildren()) {
            if (Proj) {
               Proj.y -= 15;
            }
            // deactivate if off screen
            if (Proj.y < 0) {
                Proj.destroy();
            }
        }
        for (let Proj of my.sprite.evilBoolats.getChildren()) {
            if (Proj) {
               Proj.y += 10;
            }
            // deactivate if off screen
            if (Proj.y > 950) {
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
            trash.setFlipY(true);
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


    /*spawnBig() {
        let mob = this.regMobs.getFirstDead();
    
        if (!mob) {
            mob = this.regMobs.create(Phaser.Math.Between(50, 550), -50, 'enemy2'); // assuming 600px wide screen
            mob.setFlipY(true);
            mob.setScale(2.5);
            mob.setVelocityY(100);
            mob.setCollideWorldBounds(false);
        } else {
            mob.setPosition(Phaser.Math.Between(50, 550), -50);
            mob.setVelocityY(100);
            mob.setActive(true).setVisible(true);
        }
        mob.health = this.regHP;
    } */

    spawnReg() {
        let mob = this.regMobs.getFirstDead();
    
        if (!mob) {
            mob = this.regMobs.create(Phaser.Math.Between(50, 550), -50, 'enemy2');
            mob.setFlipY(true);
            mob.setScale(2.5);
            mob.setVelocityY(100);
            mob.setCollideWorldBounds(false);
        } else {
            mob.setPosition(Phaser.Math.Between(50, 550), -50);
            mob.setVelocityY(100);
            mob.setActive(true).setVisible(true);
        }
        mob.boolatTime = this.time.addEvent({
            delay: 3000,  //spawn every 3 seconds
            callback: () => {
                if (mob.active) {
                    this.spawnEvilBoolat(mob);
                }
            },
            loop: true
        });

        mob.health = this.regHP;
    }

    spawnEvilBoolat(name) {
        let evilBoolat = this.physics.add.sprite(name.x, name.y + 27, "evilBoolat");
        evilBoolat.setFlipY(true);
        evilBoolat.setScale(2);
        this.my.sprite.evilBoolats.add(evilBoolat);
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

    updateHpDisplay() {
        let hpStr = this.playerHP.toString().padStart(3, '0');

        if (this.playerHP <= 0) {
            for (let i = 0; i < hpStr.length; i++) {
                this.hpDigitSprites[i].setTexture(`digit_0`);
            }
        }
        if (this.playerHP > 0) {
            for (let i = 0; i < hpStr.length; i++) {
                let digitValue = hpStr[i];
                this.hpDigitSprites[i].setTexture(`digit_${digitValue}`);
            }
        }
    }

    nextWave() {
        this.trashHP += 1;
        
    }

    init_game() {
        this.trashHP = 3;
    }

    bigBoom(name) {
        let boom = this.add.sprite(name.x, name.y, "boom");
        boom.setScale(0.5);
        this.tweens.add({
            targets: boom,
            scale: 5,
            alpha: 0.5,
            duration: 200,
            ease: "Power1",
            onComplete: () => {
                boom.destroy();
            }
        });
    }

    smallBoom(name) {
        let boom = this.add.sprite(name.x, name.y, "boom");
        boom.setScale(0.3);
        this.tweens.add({
            targets: boom,
            scale: 2,
            alpha: 0.3,
            duration: 100,
            ease: "Power1",
            onComplete: () => {
                boom.destroy();
            }
        });
    }
}

