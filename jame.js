// version: 0.1.0 beta
// author: smturtle2
/* MAIN JS */
const jame = {
    INSTANCES_ID: 0,
    gameSpeed: 60,
    IS_SCENE_END: true,
    runner: null,
    ROOMS: {},
    OBJECTS: {},
    SPRITES: {},
    INSTANCES: [],
    NOW_ROOM: null,
    ROOM: class {
        constructor() {
            this.CANVAS = null;
            this.CONTEXT = null;
            this.background = "black";
        }
        initialize(width, height) {
            this.CANVAS = document.createElement("canvas");
            this.CONTEXT = this.CANVAS.getContext("2d");
            this.CANVAS.width = width;
            this.CANVAS.height = height;
        }
        clear() {
            this.CONTEXT.fillStyle = this.background;
            this.CONTEXT.fillRect(0, 0, this.CANVAS.width, this.CANVAS.height);
        }
    },
    OBJECT: class {
        constructor() {
            this.room = null;
            this.sprite = null;
            this.x = 0;
            this.y = 0;
            this.xscale = 1;
            this.yscale = 1;
            this.rotation = 0;
            this.color = "white";
            this.id = null;
            this.depth = 0;
        }
        getObject() { return this.name; }
        initialize() { this.id = jame.INSTANCES_ID++; }
        remove() { this.destroyEvent(); jame.INSTANCES = jame.INSTANCES.filter((instance) => instance.id != this.id); }
        // Below are the functions that you can override
        createEvent() {}
        updateEvent() {}
        drawEvent() { if(this.sprite != null) jame.drawSprite(this.sprite, this.x, this.y, this.xscale, this.yscale, this.rotation, this.room); }
        destroyEvent() {}
    },
    SPRITE: class {
        constructor(src=null) {
            this.image = null;
            this.width = 0;
            this.height = 0;
            this.xoffset = 0;
            this.yoffset = 0;
            if(src != null) this.createImage(src);
        }
        createImage(src) {
            this.image = new Image();
            this.image.src = src;
            this.image.onload = () => {
                this.width = this.image.width;
                this.height = this.image.height;
                this.onload();
            };
        }
        onload() {}
    },
    mouse: {
        x: 0,
        y: 0,
        leftDown: false,
        leftPressed: false,
        leftReleased: false,
        rightDown: false,
        rightPressed: false,
        rightReleased: false,
        middleDown: false,
        middlePressed: false,
        middleReleased: false
    },
    keyboard: {
        keyString: "",
        HangulMode: false,
        assembler: "",
        keyDown: [],
        keyPressed: [],
        keyReleased: [],
    },
    manager() {
        // Prevent from running when there is no room
        if(Object.keys(jame.ROOMS).length == 0) return;

        // Prevent from running multiple times
        if(!jame.IS_SCENE_END) return;
        jame.IS_SCENE_END = false;

        // Clear room
        for(let room in jame.ROOMS) jame.ROOMS[room].clear();

        // Sort instances by depth
        jame.INSTANCES.sort((a, b) => a.depth - b.depth);

        // Update and draw instances
        jame.INSTANCES.forEach((instance) => {
            instance.updateEvent();
        });
        jame.INSTANCES.forEach((instance) => {
            instance.drawEvent();
        });
        jame.IS_SCENE_END = true;
    },

    /* INITIAL FUNCTIONS */
    start() {
        jame.runner = setInterval(jame.manager, 1000 / jame.gameSpeed);
    },
    stop() { clearInterval(jame.runner); jame.runner = null; },
    createRoom(name=null) {
        if(name == null) name = "room" + Object.keys(jame.ROOMS).length;
        let room = new jame.ROOM();
        room.initialize();
        jame.ROOMS[name] = room;
        return room;
    },
    setRoom(room) { jame.NOW_ROOM = room; },

    /* SPRITE FUNCTIONS */
    createSprite(name=null) {
        if(name == null) name = "sprite" + Object.keys(jame.SPRITES).length;
        let sprite = new jame.SPRITE();
        jame.SPRITES[name] = sprite;
        return sprite;
    },

    /* OBJECT FUNCTIONS */
    // Instance
    createInstance(obj, x, y, room=null) {
        if(room == null) room = jame.NOW_ROOM;
        let instance = new obj();
        instance.initialize();
        instance.room = room;
        instance.createEvent();
        instance.x = x;
        instance.y = y;
        jame.INSTANCES.push(instance);
        return instance;
    },
    // Draw
    drawSprite(sprite, x, y, xscale=1, yscale=1, rotation=0, room=null) {
        if(room == null) room = jame.NOW_ROOM;
        let ctx = room.CONTEXT;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.scale(xscale, yscale);
        ctx.drawImage(sprite.image, -sprite.xoffset, -sprite.yoffset);
        ctx.restore();
    },
    drawText(text, x, y, room=null) {
        if(room == null) room = jame.NOW_ROOM;
        let ctx = room.CONTEXT;
        // support \n
        let lines = text.split("\n");
        let lineHeight = ctx.measureText("....").width;
        lines.forEach((line, i) => {
            ctx.fillText(line, x, y + lineHeight * i);
        });
    },
    drawRect(x, y, width, height, color, room=null) {
        if(room == null) room = jame.NOW_ROOM;
        let ctx = room.CONTEXT;
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    },
    drawCircle(x, y, radius, color, room=null) {
        if(room == null) room = jame.NOW_ROOM;
        let ctx = room.CONTEXT;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    },
};


/* Mouse and Keyboard Support */
// Hangul Support
function reverseElement(arr) {
    for(let i = 0; i < arr.length; i++) {
        arr[i] = arr[i].split("").reverse().join("")
    }
    return arr;
}

function splitHangul(seq) { // return hangul characters
    let hangul = [
        // jaum and moum
        "r", "R", "rt", "s", "sw", "sg", "e", "E", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "Q", "qt", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g",
        "k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l"
    ];
    let moum = [
        "k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l"
    ];
    hangul = reverseElement(hangul);
    seq = seq.split("").reverse().join("")
    let splited = [];
    while(seq.length > 0) {
        ind = -1;
        for(let i = 0; i < hangul.length; i++) {
            if(splited.length > 0 && moum.includes(splited[splited.length - 1]) && hangul[i].length == 2) continue;
            if(seq.startsWith(hangul[i])) ind = i;
            if(ind != -1 && hangul[ind].length == 2) break;
        }
        splited.push(hangul[ind].split("").reverse().join(""));
        seq = seq.slice(hangul[ind].length);
    }
    return splited;
}

function assembleHangul(splited) { // return hangul and left
    let hangul = [
        // jaum
        ["r", "R", "rt", "s", "sw", "sg", "e", "E", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "Q", "qt", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g"],
        // cho
        ["r", "R", "s", "e", "E", "f", "a", "q", "Q", "t", "T", "d", "w", "W", "c", "z", "x", "v", "g"],
        // moum
        ["k", "o", "i", "O", "j", "p", "u", "P", "h", "hk", "ho", "hl", "y", "n", "nj", "np", "nl", "b", "m", "ml", "l"],
        // jong
        ["", "r", "R", "rt", "s", "sw", "sg", "e", "f", "fr", "fa", "fq", "ft", "fx", "fv", "fg", "a", "q", "qt", "t", "T", "d", "w", "c", "z", "x", "v", "g"]
    ];
    let temp = splited;
    let jong = -1;
    for(let i = 0; i < hangul[3].length; i++) {
        if(temp.length > 0 && temp[0] == hangul[3][i]) {
            jong = i;
            temp = temp.slice(1);
            break;
        }
    }
    let moum = -1;
    for(let i = 0; i < hangul[2].length; i++) {
        if(temp.length > 0 && temp[0] == hangul[2][i]) {
            moum = i;
            temp = temp.slice(1);
            break;
        }
    }
    let cho = -1;
    for(let i = 0; i < hangul[1].length; i++) {
        if(temp.length > 0 && temp[0] == hangul[1][i]) {
            cho = i;
            temp = temp.slice(1);
            break;
        }
    }
    if(moum == -1 || (cho == -1 && jong != -1)) {
        let jaum = -1;
        for(let i = 0; i < hangul[0].length; i++) {
            if(splited.length > 0 && splited[0] == hangul[0][i]) {
                jaum = i;
                splited = splited.slice(1);
                break;
            }
        }
        let jaum_alt = {
            // 0x3131 to 0x314E
            "r": 0x3131, "R": 0x3132, "rt": 0x3133, "s": 0x3134, "sw": 0x3135, "sg": 0x3136, "e": 0x3137, "E": 0x3138, "f": 0x3139, "fr": 0x313A, "fa": 0x313B, "fq": 0x313C, "ft": 0x313D, "fx": 0x313E, "fv": 0x313F, "fg": 0x3140, "a": 0x3141, "q": 0x3142, "Q": 0x3143, "qt": 0x3144, "t": 0x3145, "T": 0x3146, "d": 0x3147, "w": 0x3148, "W": 0x3149, "c": 0x314A, "z": 0x314B, "x": 0x314C, "v": 0x314D, "g": 0x314E,
        };
        return [jaum_alt[hangul[0][jaum]], splited, hangul[0][jaum]];
    }
    if(cho == -1 && jong == -1) {
        let moum = -1;
        for(let i = 0; i < hangul[2].length; i++) {
            if(splited.length > 0 && splited[0] == hangul[2][i]) {
                moum = i;
                splited = splited.slice(1);
                break;
            }
        }
        return [0x314F + moum, splited, hangul[2][moum]];
    }

    let result = 0xAC00;
    let result3 = "";
    if(cho != -1)  { result += cho * 588; result3 += hangul[1][cho]; }
    if(moum != -1) { result += moum * 28; result3 += hangul[2][moum]; }
    if(jong != -1) { result += jong; result3 += hangul[3][jong]; }
    return [result, temp, result3];
}

// Mouse and Keyboard Event
document.addEventListener("mousemove", (e) => {
    let rect = jame.NOW_ROOM.CANVAS.getBoundingClientRect();
    jame.mouse.x = e.clientX - rect.left;
    jame.mouse.y = e.clientY - rect.top;
});
document.addEventListener("mousedown", (e) => {
    switch(e.button) {
        case 0:
            jame.mouse.leftDown = true;
            jame.mouse.leftPressed = true;
            setTimeout(() => { jame.mouse.leftPressed = false; }, 1);
            break;
        case 1:
            jame.mouse.middleDown = true;
            jame.mouse.middlePressed = true;
            setTimeout(() => { jame.mouse.middlePressed = false; }, 1);
            break;
        case 2:
            jame.mouse.rightDown = true;
            jame.mouse.rightPressed = true;
            setTimeout(() => { jame.mouse.rightPressed = false; }, 1);
            break;
    }
});
document.addEventListener("mouseup", (e) => {
    switch(e.button) {
        case 0:
            jame.mouse.leftDown = false;
            jame.mouse.leftReleased = true;
            setTimeout(() => { jame.mouse.leftReleased = false; }, 1);
            break;
        case 1:
            jame.mouse.middleDown = false;
            jame.mouse.middleReleased = true;
            setTimeout(() => { jame.mouse.middleReleased = false; }, 1);
            break;
        case 2:
            jame.mouse.rightDown = false;
            jame.mouse.rightReleased = true;
            setTimeout(() => { jame.mouse.rightReleased = false; }, 1);
            break;
    }
}
);
document.addEventListener("keydown", (e) => {
    let lower = e.key.toLowerCase();
    jame.keyboard.keyDown.push(lower);
    jame.keyboard.keyPressed.push(lower);
    setTimeout(() => { jame.keyboard.keyPressed = jame.keyboard.keyPressed.filter((key) => key != lower); }, 1);
    // keyString is input format
    if(e.key.length == 1) {
        if(jame.keyboard.HangulMode) {
            if(!e.key.match(/["a-zA-Z"]/)) {
                jame.keyboard.keyString += e.key;
                jame.keyboard.assembler = "";
            }
            else{
                if(jame.keyboard.assembler.length > 0) jame.keyboard.keyString = jame.keyboard.keyString.slice(0, -1);
                let key = e.key;
                if(e.shiftKey) key = e.key.toUpperCase();
                else key = e.key.toLowerCase();
                let upperUnable = ["Y", "U", "I", "A", "S", "D", "F", "G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"];
                if(upperUnable.includes(key)) key = key.toLowerCase();
                jame.keyboard.assembler += key;
            }
        }
        else {
            if(e.shiftKey) jame.keyboard.keyString += e.key.toUpperCase();
            else jame.keyboard.keyString += e.key.toLowerCase();
            jame.keyboard.assembler = "";
        }
    } else if(e.key == "Backspace") {
        if(jame.keyboard.HangulMode && jame.keyboard.assembler.length > 0) jame.keyboard.assembler = jame.keyboard.assembler.slice(0, -1);
        jame.keyboard.keyString = jame.keyboard.keyString.slice(0, -1);
    }
    else if(e.key == "Enter") {
        jame.keyboard.assembler = "";
        jame.keyboard.keyString += "\n";
    }
    else if(e.key == "HangulMode") {
        jame.keyboard.HangulMode = !jame.keyboard.HangulMode;
        jame.keyboard.assembler = "";
    }
    else if(e.key != "Shift"){
        jame.keyboard.assembler = "";
    }
    if(jame.keyboard.HangulMode && e.key != "Shift") {
        let splited = splitHangul(jame.keyboard.assembler);
        let left = 0;
        let isMore = false;
        let result = "";
        if(splited.length > 0) {
            let temp = assembleHangul(splited);
            result += String.fromCharCode(temp[0]);
            splited = temp[1];
            left = temp[2].length;
        }
        while(splited.length > 0) {
            isMore = true;
            let temp = assembleHangul(splited);
            result += String.fromCharCode(temp[0]);
            splited = temp[1];
        }
        result = result.split("").reverse().join("");
        if(isMore) jame.keyboard.assembler = jame.keyboard.assembler.slice(-left);
        jame.keyboard.keyString += result;
    }
});
document.addEventListener("keyup", (e) => {
    let lower = e.key.toLowerCase();
    jame.keyboard.keyDown = jame.keyboard.keyDown.filter((key) => key != lower);
    jame.keyboard.keyReleased.push(lower);
    setTimeout(() => { jame.keyboard.keyReleased = jame.keyboard.keyReleased.filter((key) => key != lower); }, 1);
});