import Phaser from 'phaser';

class SpaceWarpScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SpaceWarpScene' });
    }

    preload() {
        this.load.spritesheet('star', 'assets/star.png', {
            frameWidth: 400,
            frameHeight: 500,
        });
        this.load.image('plane', 'assets/plane.png');

      
  
        var url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexvirtualjoystickplugin.min.js';
        this.load.plugin('rexvirtualjoystickplugin', url, true);
    }
    create() {
      

        this.starColor = 0xffffff;
        this.speed = 1; // Initial speed
        this.starScale = 0.01; // Default scale
        this.numStars = 500;
        this.stars = [];

        // Set the initial center with the x-offset
        this.centerX = this.sys.canvas.width / 2 - 175;
        this.centerY = this.sys.canvas.height / 2;

        // Define animation
        this.anims.create({
            key: 'flash',
            frames: this.anims.generateFrameNumbers('star', { start: 0, end: 19 }),
            frameRate: 10,
            repeat: -1
        });

        for (let i = 0; i < this.numStars; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * this.sys.canvas.width;

            const star = this.add.sprite(
                this.centerX + Math.cos(angle) * radius,
                this.centerY-100 + Math.sin(angle) * radius,
                'star'
            );
            star.depthValue = Math.random() * this.sys.canvas.width;
            star.setScale(this.starScale);
            star.originalX = star.x;
            star.originalY = star.y;
            star.play('flash');

            this.stars.push(star);
        }

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            enlarge: Phaser.Input.Keyboard.KeyCodes.A,
            shrink: Phaser.Input.Keyboard.KeyCodes.D,
            left: Phaser.Input.Keyboard.KeyCodes.J,
            right: Phaser.Input.Keyboard.KeyCodes.L,
            forward: Phaser.Input.Keyboard.KeyCodes.I,
            backward: Phaser.Input.Keyboard.KeyCodes.K,
        });

        this.time.addEvent({
            delay: 16,
            callback: this.convergeStars,
            callbackScope: this,
            loop: true
        });

        // Add the plane image and set its position matching the stars' center
        const image = this.add.image(this.centerX, this.centerY, 'plane');
        image.setOrigin(0.5, 0.5);
        image.setScale(2);
        const panelWidth = 350; // Width of the panel
        this.add.rectangle(
            this.sys.canvas.width - panelWidth / 2 , 
            this.sys.canvas.height / 2,
            panelWidth, 
            this.sys.canvas.height,
            0xffffff
        ).setOrigin(0.5, 0.5);

        this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
            x: this.sys.canvas.width - 150, // New x position calculated for right side
            y: this.sys.canvas.height / 2,
            radius: 100,
            base: this.add.circle(0, 0, 100, 0x888888),
            thumb: this.add.circle(0, 0, 50, 0xcccccc),
        });

         // Button configuration for sizing and positioning
    const buttonConfig = { width: 100, height: 40 };

    // Scale Control Buttons positioned side-by-side
    const scaleUpButton = this.createButton(this.sys.canvas.width - 200, this.sys.canvas.height / 2 - 150, 'Scale +', () => {
        this.starScale += 0.001;
    }, buttonConfig);

    const scaleDownButton = this.createButton(this.sys.canvas.width - 90, this.sys.canvas.height / 2 - 150, 'Scale -', () => {
        this.starScale = Math.max(0.005, this.starScale - 0.001);
    }, buttonConfig);

    // Speed Control Buttons positioned side-by-side
    const speedUpButton = this.createButton(this.sys.canvas.width - 200, this.sys.canvas.height / 2 + 150, 'Speed +', () => {
        this.speed += 0.1;
    }, buttonConfig);

    const speedDownButton = this.createButton(this.sys.canvas.width - 90, this.sys.canvas.height / 2 + 150, 'Speed -', () => {
        this.speed = Math.max(0, this.speed - 0.1);
    }, buttonConfig);
}

createButton(x, y, text, callback, config) {
    // Basic button setup
    const button = this.add.rectangle(x, y, config.width, config.height, 0x888888, 1)
        .setOrigin(0.5, 0.5)
        .setStrokeStyle(2, 0x000000)
        .setInteractive({
            useHandCursor: true,
        });

    const buttonText = this.add.text(x, y, text, {
        fontSize: '16px',
        color: '#fff',
        align: 'center'
    }).setOrigin(0.5, 0.5);

    let isHeldDown = false;
    let holdInterval = null;

    const pressInterval = 100; // How frequently to execute the callback while held down

    button.on('pointerover', () => {
        button.setFillStyle(0xaaaaaa);
    });

    button.on('pointerout', () => {
        button.setFillStyle(0x888888);
        stopHold();
    });

    button.on('pointerdown', () => {
        button.setFillStyle(0x444444);
        isHeldDown = true;
        callback(); // Trigger initially
        holdInterval = this.time.addEvent({
            delay: pressInterval,
            callback: callback,
            callbackScope: this,
            loop: true
        });
    });

    button.on('pointerup', () => {
        button.setFillStyle(0x888888);
        stopHold();
    });

    function stopHold() {
        if (isHeldDown) {
            isHeldDown = false;
            if (holdInterval) {
                holdInterval.remove(false);
                holdInterval = null;
            }
        }
    }

    return button;
    }

    update() {
        const force = this.joyStick.force;
        const angle = this.joyStick.angle;
    
        if (force > 0) { // Check if joystick is being pushed
            // Joystick direction for vertical movement
            if (angle >= 45 && angle <= 135) { // Joystick pushed up
                this.centerY -= 2;
            }
            if (angle >= 225 && angle <= 315) { // Joystick pushed down
                this.centerY += 2;
            }
    
            // Joystick direction for horizontal movement
            if (angle > 135 && angle < 225) { // Joystick pushed left
                this.centerX += 2;
            }
            if ((angle > 315 || angle < 45)) { // Joystick pushed right
                this.centerX -= 2;
            }
        }
    
      

        if (this.cursors.up.isDown) {
            this.speed += 0.01;
        }
        if (this.cursors.down.isDown) {
            this.speed = Math.max(0, this.speed - 0.01);
        }
        if (this.cursors.enlarge.isDown) {
            this.starScale += 0.001;
        }
        if (this.cursors.shrink.isDown) {
            this.starScale = Math.max(0.005, this.starScale - 0.001);
        }

        const moveAmount = 2;
        if (this.cursors.left.isDown) {
            this.centerX += moveAmount;
        }
        if (this.cursors.right.isDown) {
            this.centerX -= moveAmount;
        }
        if (this.cursors.forward.isDown) {
            this.centerY += moveAmount;
        }
        if (this.cursors.backward.isDown) {
            this.centerY -= moveAmount;
        }

        // Gradually return center to initial position with offset
        this.centerX += (this.sys.canvas.width / 2 - 175 - this.centerX) * 0.02;
        this.centerY += (this.sys.canvas.height / 2 - this.centerY) * 0.02;
    }

    convergeStars() {
        this.stars.forEach((star) => {
            star.depthValue -= this.speed;
            if (star.depthValue <= 0) {
                star.depthValue = this.sys.canvas.width;

                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.sys.canvas.width;
                star.originalX = this.centerX + Math.cos(angle) * radius;
                star.originalY = this.centerY + Math.sin(angle) * radius;
            }

            const k = 128.0 / star.depthValue;
            star.x = this.centerX + (star.originalX - this.centerX) * k;
            star.y = this.centerY + (star.originalY - this.centerY) * k;
            star.scale = (1 - star.depthValue / this.sys.canvas.width) * this.starScale + 0.01;
            star.setTint(this.starColor);
        });
    }
}

export default SpaceWarpScene;