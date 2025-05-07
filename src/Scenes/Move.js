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
        l.image("missile", "missile.png");            // missile
        l.image("enemy2", "ship_0012.png");                // bigger enemy plane
        l.image("enemy", "ship_0018.png");                // basic enemy plane
        l.image("boss", "ship_00151.png");               // boss enemy plane
        l.image("health", "tile_0024.png");              // health indicator
        l.image("boom", "tile_0005.png");                 // explodey
        //l.tilemapTiledJSON("map", "Background.json");     // tilemap JSON
        for (let i = 0; i <= 9; i++) {                   // digits for score
            this.load.image(`digit_${i}`, `digit_${i}.png`);
        }
        l.audio("shoot", "shoot.wav");                    //shoot sound
        l.audio("explosion", "explosion03.wav");         //explosion sound
        l.audio("clang", "hitmarker_2.mp3");            //ding sound
        l.audio("damage", "458867__raclure__damage-sound-effect.mp3"); //taking damage sound
    }

    create() {
        let my = this.my;

        //background & UI vars and etc. ---------------------------------------
        this.shootSound = this.sound.add("shoot");
        this.explodeSound = this.sound.add("explosion");
        this.hitSound = this.sound.add("clang");
        this.damageSound = this.sound.add("damage");

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

        //Sprite Groups & Sprite related variables ------------------------------
        //plane sprite
        my.sprite.playerPlane = this.physics.add.sprite(300, 850, "Plane"); 
        my.sprite.playerPlane.setScale(3);

        //Trash enemy sprite group
        this.trashMobs = this.physics.add.group();
        this.collidersTime = Phaser.Math.Between(1500, 1500);
        this.trashHP = 3;
        
        //trash enemy spawner
        this.time.addEvent({
            delay: this.collidersTime, //   spawn random 0.4-1.5 seconds
            callback: () => {
                this.spawnTrash(),
                this.collidersTime = Phaser.Math.Between(400, 1500)
            },
            loop: true
        });

        //regular enemy sprite group
        this.regMobs = this.physics.add.group();
        this.mobsTime = Phaser.Math.Between(8000, 8000);
        this.regHP = 10;

        //reg enemy spawner
        this.time.addEvent({
            delay: this.mobsTime,  //spawn every 4-8 seconds
            callback: () => {
                this.spawnReg(),
                this.collidersTime = Phaser.Math.Between(4000, 8000)
            },
            loop: true
        });
        //regular enemy pathing
        this.regPoints = [
            300, -30,
            360, 186,
            240, 377,
            360, 543,
            240, 759,
            360, 990
        ];

        // boss enemy group
        this.bossMobs = this.physics.add.group();
        this.bossTime = 40;
        this.enemykill = 0;
        this.bossActive = 0;
        this.bossHP = 70;
        this.bossKilled = false;
        //boss starting path
        this.bossStartPath = [
            750, 700,
            100, 200
        ];
        //boss looping path
        this.bossLoopPath = [
            100, 200,
            500, 200
        ];

        // Boolat sprite group w/ physics
        my.sprite.Boolats = this.physics.add.group();
        my.sprite.evilBoolats = this.physics.add.group();
        my.sprite.evilerBoolats = this.physics.add.group();

        this.boolatDmg = 1;  //initalize boolat damage
        this.shootCDC = 0;  //initalize boolat cooldown
        this.Cooldown = 3; //time between shots
        this.maxBoolat = 8; //max number of boolats


        //Physics events ----------------------------
        //trash hitting player
        this.physics.add.overlap(my.sprite.playerPlane, this.trashMobs, (playerPlane, trash) => {
            this.bigBoom(playerPlane);
            this.damageSound.play({
                volume: 0.8,
            });

            trash.destroy();
            this.playerHP -= trash.health * 3;
            this.updateHpDisplay();
        });
        //reg enemy hitting player
        this.physics.add.overlap(my.sprite.playerPlane, this.regMobs, (playerPlane, mob) => {
            this.bigBoom(playerPlane);
            this.damageSound.play({
                volume: 0.8,
            });

            mob.destroy();
            this.playerHP -= mob.health * 2;
            this.updateHpDisplay();
        });
        //evilBoolat hitting player
        this.physics.add.overlap(my.sprite.playerPlane, my.sprite.evilBoolats, (playerPlane, evilBoolat) => {
            this.smallBoom(playerPlane);
            this.damageSound.play({
                volume: 0.8,
            });

            evilBoolat.destroy();
            this.playerHP -= 5;
            this.updateHpDisplay();
        });
        //evilerBoolat hitting player
        this.physics.add.overlap(my.sprite.playerPlane, my.sprite.evilerBoolats, (playerPlane, evilBoolat) => {
            this.bigBoom(playerPlane);
            this.damageSound.play({
                volume: 0.8,
            });

            evilBoolat.destroy();
            this.playerHP -= 10;
            this.updateHpDisplay();
        });
        //bullets hitting trash
        this.physics.add.overlap(my.sprite.Boolats, this.trashMobs, (boolat, trash) => {
            boolat.destroy();
            this.hitSound.play({
                volume: 0.2,
            });
            this.smallBoom(trash);
            
            trash.health -= this.boolatDmg;
            this.score += 5;
            this.updateScoreDisplay();
        
            if (trash.health <= 0) {
                this.bigBoom(trash);
                this.explodeSound.play({
                    volume: 0.3,
                });
                trash.destroy();  //disable dead enemy
                this.enemykill += 1;
                this.score += 50;
                this.updateScoreDisplay();
            }
        });
        //bullets hitting reg mobs
        this.physics.add.overlap(my.sprite.Boolats, this.regMobs, (boolat, mob) => {
            boolat.destroy();
            this.hitSound.play({
                volume: 0.2,
            });
            this.smallBoom(mob);

            mob.health -= this.boolatDmg;
            this.score += 5;
            this.updateScoreDisplay();
        
            if (mob.health <= 0) {
                this.bigBoom(mob);
                this.explodeSound.play({
                    volume: 0.3,
                });
                mob.destroy();  //disable dead enemy
                this.score += 500;
                this.enemykill += 5;
                this.updateScoreDisplay();
            }
        });
        //bullets hitting boss mobs
        this.physics.add.overlap(my.sprite.Boolats, this.bossMobs, (boolat, boss) => {
            boolat.destroy();
            this.hitSound.play({
                volume: 0.2,
            });
            this.smallBoom(boss);

            boss.health -= this.boolatDmg;
            this.score += 5;
            this.updateScoreDisplay();
        
            if (boss.health <= 0) {
                this.bigBoom(boss);
                this.explodeSound.play({
                    volume: 0.5,
                });
                if (boss.fireTimer) {
                    boss.fireTimer.remove(false);
                }
                boss.destroy();  //disable dead enemy
                this.bossActive = 0;
                this.bossKilled = true;
                this.score += 3330;
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

        //control screen
        this.scene.launch('controls');
    }

    update() {
        let my = this.my;

        if (this.shootCDC > 0) {
            this.shootCDC--;
        }
        
        //movment left and right
        if (this.left.isDown && my.sprite.playerPlane.x > 40) {
            my.sprite.playerPlane.x -= 8;
            if (this.shift.isDown && my.sprite.playerPlane.x > 40) {
                my.sprite.playerPlane.x -= 8;
            }
        }
        if (this.right.isDown && my.sprite.playerPlane.x < 560) {
            my.sprite.playerPlane.x += 8;
            if (this.shift.isDown && my.sprite.playerPlane.x < 560) {
                my.sprite.playerPlane.x += 8;
            }
        }

        //shooting boolats
        if (this.shoot.isDown && this.shootCDC <= 0 && my.sprite.Boolats.getLength() < this.maxBoolat) {
        //if (Phaser.Input.Keyboard.JustDown(this.shoot)) {
            this.shootSound.play({
                volume: 0.3,
                rate: Phaser.Math.FloatBetween(0.93, 1.07)
            });
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
            // deactivate if off screen
            if (Proj.y > 950) {
                Proj.destroy();
            }
        }
        for (let Proj of my.sprite.evilerBoolats.getChildren()) {
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

        //game-over screen on death
        if (this.playerHP <= 0) {
            if (this.score >= highScore) {
                highScore = this.score;
            }
            this.scene.launch('gameOver');
            this.scene.pause();
        }
        
        //boss spawning after x kills
        if (this.enemykill >= this.bossTime && this.bossActive == 0) {
            this.spawnBoss();
            this.enemykill = 0;
        }
        
        if (this.bossKilled == true) {
            this.nextWave();
            this.scene.launch('upgrades');
            this.scene.pause();
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


    spawnBoss() {    
        //path setup
        let startPath = new Phaser.Curves.Spline(this.bossStartPath);
        let loopPath = new Phaser.Curves.Spline(this.bossLoopPath);
        let boss = this.add.follower(startPath, startPath.points[0].x, startPath.points[0].y, 'boss');
        this.physics.add.existing(boss); 
        this.bossMobs.add(boss);
        this.bossActive = 1;
    
        boss.setScale(4);
    
        boss.startFollow({
            from: 0,
            to: 1,
            duration: 3000,
            ease: 'Linear',
            repeat: 0,
            rotateToPath: false,
            rotationOffset: -90,
            onComplete: () => {
                boss.fireTimer = this.time.addEvent({
                    delay: 4000, //every 4 seconds
                    loop: true,
                    callback: () => this.spawnBossBoolat(boss)
                });
                boss.setPath(loopPath);
                boss.startFollow({
                    from: 0,
                    to: 1,
                    duration: 10000,
                    ease: 'Linear',
                    repeat: -1,
                    rotateToPath: false,
                    yoyo: true,
                    rotationOffset: -90,
                });
            }
        });
        boss.health = this.bossHP;
    }

    spawnReg() {
        //let mob = this.regMobs.getFirstDead();
        let startX = Phaser.Math.Between(-200, 200); // Random left/right variation
        let path = this.makeOffsetPath(this.regPoints, startX);
    
        //path setup
        let mob = this.add.follower(path, path.points[0].x, path.points[0].y, 'enemy2');
        this.physics.add.existing(mob); 
        this.regMobs.add(mob);
    
        mob.setScale(2.5);
        mob.setFlipY(true);

        mob.startFollow({
            from: 0,
            to: 1,
            duration: 12000,
            ease: 'Linear',
            repeat: 0,
            rotateToPath: true,
            rotationOffset: -90,
            onComplete: () => {
                if (mob.boolatTime) {
                    mob.boolatTime.remove(false);
                }
                mob.destroy();
            }
        });

        /*if (!mob) {
            mob = this.regMobs.create(Phaser.Math.Between(50, 550), -50, 'enemy2');
            mob.setFlipY(true);
            mob.setScale(2.5);
            mob.setVelocityY(100);
            mob.setCollideWorldBounds(false);
        } else {
            mob.setPosition(Phaser.Math.Between(50, 550), -50);
            mob.setVelocityY(100);
            mob.setActive(true).setVisible(true);
        } */
        mob.boolatTime = this.time.addEvent({
            delay: 2000,  //spawn every 2 seconds
            callback: () => {
                if (mob.active) {
                    this.spawnEvilBoolat(mob);
                }
            },
            loop: true
        });

        mob.health = this.regHP;
    }

    spawnBossBoolat(boss) {
        const player = this.my.sprite.playerPlane;
    
        // Create evil boolat at boss location
        let boolat2 = this.physics.add.sprite(boss.x, boss.y + 30, "evilBoolat");
        let boolat3 = this.physics.add.sprite(boss.x, boss.y + 30, "evilBoolat");
        let boolat = this.physics.add.sprite(boss.x, boss.y + 30, "missile");
        boolat2.setScale(2).setFlipY(true);
        boolat3.setScale(2).setFlipY(true);
        boolat.setScale(4);
        boolat.setFlipY(true);
        this.my.sprite.evilerBoolats.add(boolat);
        this.my.sprite.evilBoolats.add(boolat2);
        this.my.sprite.evilBoolats.add(boolat3);
    
        // Calculate velocity vector from boss to player
        const angle = Phaser.Math.Angle.Between(boss.x, boss.y, player.x, player.y);
        const speed = 500; // tweak for difficulty
        const velocity = this.physics.velocityFromRotation(angle, speed);
    
        boolat.setVelocity(velocity.x, velocity.y);
        boolat2.setVelocity(velocity.x-120, velocity.y);
        boolat3.setVelocity(velocity.x+120, velocity.y);
    }

    spawnEvilBoolat(name) {
        let evilBoolat = this.physics.add.sprite(name.x, name.y + 27, "evilBoolat");
        this.my.sprite.evilBoolats.add(evilBoolat);
        evilBoolat.setFlipY(true);
        evilBoolat.setVelocityY(200);
        evilBoolat.setScale(2);
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
        this.level += 1;
        this.regHP += 2;
        this.bossHP += 5;
        this.updateLevelDisplay();
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

    makeOffsetPath(pointsArray, offsetX) {
        let offsetPoints = [];
        for (let i = 0; i < pointsArray.length; i += 2) {
            offsetPoints.push(pointsArray[i] + offsetX, pointsArray[i + 1]);
        }
        return new Phaser.Curves.Spline(offsetPoints);
    }
}

