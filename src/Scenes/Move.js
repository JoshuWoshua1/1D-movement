class Move extends Phaser.Scene {
    constructor(){
        super("move");

        this.my = {sprite: {}};

        //this.boolatActive = false;
    }

    preload() {
        this.load.setPath("./assets/");                  // Set load path
        this.load.image("Boolat", "tile_0000.png");     // boolatt
        this.load.image("Plane", "ship_0009.png");       // airplane
    }

    create() {
        let my = this.my;
        my.sprite.playerPlane = this.add.sprite(300, 900, "Plane");
        my.sprite.playerPlane.setScale(3);

        /* this.Boolat = this.add.sprite(0,0, "Boolat");
        this.Boolat.setScale(1.5);
        this.Boolat.setActive(false).setVisible(false) */

        my.sprite.Boolats = []; // Boolat sprite list

        this.shootCDC = 0;  //initalize boolat cooldown
        this.Cooldown = 3; //time between shots
        this.maxBoolat = 8; //max number of boolats

        this.shoot = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
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
        }
        if (this.right.isDown && my.sprite.playerPlane.x < 600) {
            my.sprite.playerPlane.x += 8;
        }

        //shooting boolats
        if (this.shoot.isDown && this.shootCDC <= 0 && my.sprite.Boolats.length < this.maxBoolat) {
        //if (Phaser.Input.Keyboard.JustDown(this.shoot)) {
            let Boolat = this.add.sprite(my.sprite.playerPlane.x, my.sprite.playerPlane.y - 27, "Boolat")
            Boolat.setActive(true).setVisible(true);
            my.sprite.Boolats.push(Boolat);
            
            this.shootCDC = this.Cooldown;
        }
        //moving the boolatts
        for (let Proj of my.sprite.Boolats) {
            if (Proj) {
                Proj.y -= 15;
                // Optionally deactivate if off screen
                if (Proj.y < 0) {   
                    my.sprite.Boolats = my.sprite.Boolats.filter((Proj) => Proj.y > 0); // delete old boolats
                }
            }
        }

    }
}