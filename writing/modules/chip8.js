const Chip8_fontset = [
    0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
    0x20, 0x60, 0x20, 0x20, 0x70, // 1
    0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
    0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
    0x90, 0x90, 0xF0, 0x10, 0x10, // 4
    0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
    0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
    0xF0, 0x10, 0x20, 0x40, 0x40, // 7
    0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
    0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
    0xF0, 0x90, 0xF0, 0x90, 0x90, // A
    0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
    0xF0, 0x80, 0x80, 0x80, 0xF0, // C
    0xE0, 0x90, 0x90, 0x90, 0xE0, // D
    0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
    0xF0, 0x80, 0xF0, 0x80, 0x80  // F
];

class Chip8 {
    constructor() {
        this.memory = new Uint8Array(new ArrayBuffer(0x1000));
        this.v = new Uint8Array(new ArrayBuffer(0x10));
        this.pc = 0x200;
        this.I = 0;
        this.stack = [];
        this.key = new Uint8Array(new ArrayBuffer(0x10));
        this.key_wait = false;
        this.delay_timer = 0;
        this.sound_timer = 0;

        this.opcode = 0;
        this.x = 0;
        this.y = 0;
        this.n = 0;
        this.nn = 0;
        this.nnn = 0;

        // load fontset
        for (let i = 0; i < Chip8_fontset.length; i++) {
            memory[i] = Chip8_fontset[i];
            
        }
    }
    emulateCycle() {
        opcode = memory[pc] << 8 | memory[pc + 1];
        x = memory[pc] & 0xf;
        y = memory[pc + 1] >> 4;
        n = memory[pc + 1] & 0xf;
        nn = memory[pc + 1];
        nnn = x << 8 | nn;
        pc += 2;
        switch (memory[pc] >> 4) {
            case 0:
                if (opcode == 0x00e0) {
                    this.disp_clear()
                } else if (opcode == 0x0ee) {
                    this.pc = this.stack.pop();
                }
                break;

            case 1:
                pc = nnn;
                break;

            case 2:
                this.stack.push(pc);
                this.pc = nnn;
                break;

            case 3:
                if (v[x] == nn) {
                    pc += 2;
                }
                break;

            case 4:
                if (v[x] != nn) {
                    pc += 2;
                }
                break;

            case 5:
                if (v[x] == v[y]) {
                    pc += 2;
                }
                break;

            case 6:
                v[x] = nn;
                break;

            case 7:
                v[x] += nn;
                break;

            case 8:
                switch (n) {
                    case 0:
                        v[x] = v[y];
                        break;

                    case 1:
                        v[x] |= v[y];
                        break;

                    case 2:
                        v[x] &= v[y];
                        break;

                    case 3:
                        v[x] ^= v[y];
                        break;

                    case 4:
                        let z = v[x] + v[y];
                        v[0xf] = z > 0xff;
                        v[x] = z;
                        break;

                    case 5:
                        v[0xf] = v[x] > v[y];
                        v[x] -= v[y];
                        break;

                    case 6:
                        v[0xf] = v[x] & 0x1;
                        v[x] >>= 1;
                        break;

                    case 7:
                        v[0xf] = v[y] > v[x];
                        v[y] -= v[x];
                        break;

                    case 0xe:
                        v[0xf] = v[x] >> 7;
                        v[x] << 1;
                        break;

                    default:
                        break; // raise invalid opcode?
                }
                break;

            case 9:
                if (v[x] != v[y]) {
                    pc += 2;
                }
                break;

            case 0xa:
                this.I = nnn;
                break;

            case 0xb:
                pc = v[0] + nnn;
                break;

            case 0xc:
                v[x] = Math.floor(Math.random() * 0xff) & nn;
                break;

            case 0xd:
                break; // display

            case 0xe:
                if (nn == 0x9e) {
                    if (key[v[x]]) {
                        pc += 2;
                    }
                } else if (nn == 0xa1) {
                    if (!key[v[x]]) {
                        pc += 2;
                    }
                }
                break;

            case 0xf:
                switch (nn) {
                    case 0x07:
                        v[x] = this.delay_timer;
                        break;

                    case 0x0A:
                        this.key_wait = true;
                        break;

                    case 0x15:
                        this.delay_timer = v[x];
                        break;

                    case 0x18:
                        this.sound_timer = v[x];
                        break;

                    case 0x1E:
                        this.I += v[x];
                        break;

                    case 0x29:
                        this.I = v[x] * 5;
                        break;

                    case 0x33:
                        this.memory[this.I] = v[x] / 100;
                        this.memory[this.I + 1] = v[x] / 10 % 10;
                        this.memory[this.I + 2] = v[x] % 10;
                        break;

                    case 0x55:
                        for (let i = 0; i <= x; i++) {
                            this.memory[this.I + i] = v[i];
                        };
                        break;

                    case 0x55:
                        for (let i = 0; i <= x; i++) {
                            v[i] = this.memory[this.I + i];
                        };
                        break;

                    default:
                        break;
                }

            default:
                break;
        }
    }
    disp_clear() { }
}

export {Chip8};