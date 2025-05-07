class Upgrades extends Phaser.Scene {
    constructor(){
        super("upgrades");

        this.my = {sprite: {}};
    }

    preload() {
        let l = this.load;
        l.setPath("./assets/");         // Set load path
        l.image("one", "one.png");          //1 key
        l.image("two", "two.png");         //2 key
        l.image("three", "three.png");    //3 key
    }

    create() {
        this.add.rectangle(300, 600, 600, 200, 0x000000, 0.7);
        this.add.image(220, 540, "one").setScale(3);
        this.add.text(300, 525, ": heal 40 HP", { fontSize: '24px', color: '#ffffff' });
        this.add.image(220, 590, "two").setScale(3);
        this.add.text(300, 575, ": +1 Max bullets", { fontSize: '24px', color: '#ffffff' });
        this.add.image(220, 640, "two").setScale(3);
        this.add.text(300, 625, ": +20% bullet speed", { fontSize: '24px', color: '#ffffff' });

        let game = this.scene.get("move");
        game.bossKilled = false;

        this.input.keyboard.on('keydown-ONE', () => {
            game.playerHP += 40;
            if (game.playerHP >= 100) { game.playerHP = 100; }
            this.scene.stop();
            this.scene.resume("move");
            game.updateHpDisplay();
        });

        this.input.keyboard.on('keydown-TWO', () => {
            game.boolatDmg += 1;
            this.scene.stop();
            this.scene.resume("move");
        });
    }

    update() {
        
    }
}