class GameOver extends Phaser.Scene {

    constructor(){
        super("gameOver");

        this.my = {sprite: {}};
    }

    preload() {
        let l = this.load;
        l.setPath("./assets/");                           // Set load path
        l.image("Plane", "ship_0009.png");                // airplane
        l.image("enemy", "ship_0018.png");               // basic enemy plane

    }

    create() {
        this.pausePlanes = this.physics.add.group();
        this.pausePlanes2 = this.physics.add.group();
        

        this.add.rectangle(300, 400, 600, 1100, 0x000000, 0.7);

        this.add.text(300, 400, "Game Over", { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);

        this.add.text(300, 500, "Press R to Restart", { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        this.add.text(300, 600, "Press ESC for Main Menu", { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);

        this.input.keyboard.on('keydown-R', () => {
            this.scene.stop("gameOver");
            this.scene.start("move");
        });

        this.input.keyboard.on('keydown-ESC', () => {
            this.scene.stop("move");
            this.scene.stop("gameOver");
            this.scene.start("homeScreen");
        });

        //big background spawner
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000), // spawn random 1-2 seconds
            callback: () => this.spawnPP(5, -500, "enemy2"),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(100, 200), // spawn random 0.1-0.2 seconds
            callback: () => this.spawnPP(2, -1000, "enemy"),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(500, 900), // spawn random 0.5-0.9 seconds
            callback: () => this.spawnPP(3.5, -700, "enemy"),
            loop: true
        });

        //other way big background spawner
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000), // spawn random 1-2 seconds
            callback: () => this.spawnPP2(5, 500),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(100, 200), // spawn random 0.1-0.2 seconds
            callback: () => this.spawnPP2(2, 1000),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(500, 900), // spawn random 0.5-0.9 seconds
            callback: () => this.spawnPP2(3.5, 700),
            loop: true
        });
    }

    spawnPP(scale, speed, sprite) {
        let pausePlane = this.pausePlanes.getFirstDead();
    
        if (!pausePlane) {
            pausePlane = this.pausePlanes.create(Phaser.Math.Between(20, 100), 1000, `${sprite}`);
            pausePlane.setScale(scale);
            pausePlane.setVelocityY(speed);
            pausePlane.setCollideWorldBounds(false);
        } else {
            pausePlane.setPosition(Phaser.Math.Between(20, 100), -1000);
            pausePlane.setVelocityY(speed);
            pausePlane.setActive(true).setVisible(true);
        }
    }

    spawnPP2(scale, speed) {
        let pausePlane2 = this.pausePlanes2.getFirstDead();
    
        if (!pausePlane2) {
            pausePlane2 = this.pausePlanes2.create(Phaser.Math.Between(500, 580), -50, 'Plane');
            pausePlane2.setFlipY(true);
            pausePlane2.setScale(scale);
            pausePlane2.setVelocityY(speed);
            pausePlane2.setCollideWorldBounds(false);
        } else {
            pausePlane2.setPosition(Phaser.Math.Between(500, 580), -1000);
            pausePlane2.setVelocityY(speed);
            pausePlane2.setActive(true).setVisible(true);
        }
    }

    update() {

    }
}
