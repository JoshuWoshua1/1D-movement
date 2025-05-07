class Controls extends Phaser.Scene {

    constructor(){
        super("controls");

        this.my = {sprite: {}};
    }

    preload() {
        let l = this.load;
        l.setPath("./assets/");         // Set load path
        l.image("Shift", "Shift.png");  //shift key
        l.image("Space", "Space.png");  //space key
        l.image("Akey", "Akey.png");    //A key
        l.image("Dkey", "Dkey.png");    //D key
    }

    create() {
        this.add.rectangle(300, 600, 600, 200, 0x000000, 0.7);
        this.add.image(220, 540, "Space").setScale(3);
        this.add.text(300, 525, ": Shoot", { fontSize: '32px', color: '#ffffff' });
        this.add.image(220, 590, "Akey").setScale(3);
        this.add.text(300, 575, ": move left", { fontSize: '32px', color: '#ffffff' });
        this.add.image(220, 640, "Dkey").setScale(3);
        this.add.text(300, 625, ": move right", { fontSize: '32px', color: '#ffffff' });

        this.time.addEvent({
            delay: 4000,
            callback: () => this.scene.stop(),
            loop: false
        });
    }

    update() {

    }
}
