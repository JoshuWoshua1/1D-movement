class HomeScreen extends Phaser.Scene {

    constructor(){
        super("homeScreen");

        this.my = {sprite: {}};
    }

    preload() {
        let l = this.load;
        l.setPath("./assets/");                           // Set load path
        l.image("Plane", "ship_0009.png");                // airplane
        l.image("enemy", "ship_0018.png");               // basic enemy plane
        l.image("tiles", "tiles_packed.png");            // background tileset
        l.tilemapTiledJSON("map", "Background.json");     // tilemap JSON
        l.image("enemy2", "ship_0012.png");                // bigger enemy plane
    }

    create() {
        
        this.menuPlanes = this.physics.add.group();
        this.menuPlanes2 = this.physics.add.group();
        
        this.homemap = this.add.tilemap("map", 16, 16, 10, 10);
        this.tileset = this.homemap.addTilesetImage("tiles_packed", "tiles");
        this.bgLayer1 = this.homemap.createLayer("Background", this.tileset, 0, 0);
        this.bgLayer1.setScale(2.5);

        this.add.rectangle(300, 400, 600, 1100, 0x000000, 0.7);

        this.add.text(300, 450, "Bombardillo Red!", { fontSize: '48px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(370, 480, "by Joshua Kim-Pearson", { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);


        this.add.text(300, 550, "Press ENTER to start!", { fontSize: '24px', color: '#ffffff' }).setOrigin(0.5);
        this.add.text(300, 580, `High Score: ${highScore}`, { fontSize: '18px', color: '#ffffff' }).setOrigin(0.5);

        
        this.input.keyboard.on('keydown-ENTER', () => {
            this.scene.stop("homeScreen");
            this.scene.start("move");
        });

        //big background spawner
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000), // spawn random 1-2 seconds
            callback: () => this.spawnMP(5, -500),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(100, 200), // spawn random 0.1-0.2 seconds
            callback: () => this.spawnMP(2, -1000),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(500, 900), // spawn random 0.5-0.9 seconds
            callback: () => this.spawnMP(3.5, -700),
            loop: true
        });

        //other way big background spawner
        this.time.addEvent({
            delay: Phaser.Math.Between(1000, 2000), // spawn random 1-2 seconds
            callback: () => this.spawnMP2(5, 500, "enemy2"),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(100, 200), // spawn random 0.1-0.2 seconds
            callback: () => this.spawnMP2(2, 1000, "enemy"),
            loop: true
        });

        this.time.addEvent({
            delay: Phaser.Math.Between(500, 900), // spawn random 0.5-0.9 seconds
            callback: () => this.spawnMP2(3.5, 700, "enemy"),
            loop: true
        });
    }

    spawnMP(scale, speed) {
        let menuPlane = this.menuPlanes.getFirstDead();
    
        if (!menuPlane) {
            menuPlane = this.menuPlanes.create(-50 , Phaser.Math.Between(20, 350), 'Plane');
            menuPlane.setScale(scale);
            menuPlane.setRotation(Math.PI / 2)
            menuPlane.setVelocityX(-speed);
            menuPlane.setCollideWorldBounds(false);
        } else {
            menuPlane.setPosition(-50, Phaser.Math.Between(20, 300));
            menuPlane.setVelocityX(-speed);
            menuPlane.setActive(true).setVisible(true);
        }
    }

    spawnMP2(scale, speed, sprite) {
        let menuPlane2 = this.menuPlanes2.getFirstDead();
    
        if (!menuPlane2) {
            menuPlane2 = this.menuPlanes2.create(650 ,Phaser.Math.Between(650, 930), `${sprite}`);
            menuPlane2.setFlipX(true);
            menuPlane2.setRotation(Math.PI + (Math.PI / 2))
            menuPlane2.setScale(scale);
            menuPlane2.setVelocityX(-speed);
            menuPlane2.setCollideWorldBounds(false);
        } else {
            menuPlane2.setPosition(650, Phaser.Math.Between(20, 300));
            menuPlane2.setVelocityX(-speed);
            menuPlane2.setActive(true).setVisible(true);
        }
    }

    update() {

    }
}
