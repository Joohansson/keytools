//nano-base32 from https://github.com/termhn/nano-base32/blob/d6b160aba47595180b67cc8a30096a11525e4010/index.js
//blake2b from https://github.com/emilbayes/blake2b/blob/f0a7c7b550133eca5f5fc3b751ccfd2335ce736f/index.js

const alphabet = '13456789abcdefghijkmnopqrstuwxyz'

/**
  * Encode provided Uint8Array using the Nano-specific Base-32 implementeation.
  * @param {Uint8Array} view Input buffer formatted as a Uint8Array
  * @returns {string}
  */
export function encode(view) {
    if (view.constructor !== Uint8Array) {
        throw new Error('View must be a Uint8Array!')
    }
    const length = view.length
    const leftover = (length * 8) % 5
    const offset = leftover === 0 ? 0 : 5 - leftover

    let value = 0
    let output = ''
    let bits = 0

    for (var i = 0; i < length; i++) {
        value = (value << 8) | view[i]
        bits += 8

        while (bits >= 5) {
            output += alphabet[(value >>> (bits + offset - 5)) & 31]
            bits -= 5
        }
    }

    if (bits > 0) {
        output += alphabet[(value << (5 - (bits + offset))) & 31]
    }

    return output
}

export function readChar(char) {
    var idx = alphabet.indexOf(char)

    if (idx === -1) {
        throw new Error('Invalid character found: ' + char)
    }

    return idx
}

/**
  * Decodes a Nano-implementation Base32 encoded string into a Uint8Array
  * @param {string} input A Nano-Base32 encoded string
  * @returns {Uint8Array}
  */
export function decode(input) {
    if (typeof input !== 'string') {
        throw new Error('Input must be a string!')
    }
    var length = input.length
    const leftover = (length * 5) % 8
    const offset = leftover === 0 ? 0 : 8 - leftover

    var bits = 0
    var value = 0

    var index = 0
    var output = new Uint8Array(Math.ceil(length * 5 / 8))

    for (var i = 0; i < length; i++) {
        value = (value << 5) | readChar(input[i])
        bits += 5

        if (bits >= 8) {
            output[index++] = (value >>> (bits + offset - 8)) & 255
            bits -= 8
        }
    }
    if (bits > 0) {
        output[index++] = (value << (bits + offset - 8)) & 255
    }

    if (leftover !== 0) {
        output = output.slice(1)
    }
    return output
}

// 64-bit unsigned addition
// Sets v[a,a+1] += v[b,b+1]
// v should be a Uint32Array
export function ADD64AA(v, a, b) {
    var o0 = v[a] + v[b]
    var o1 = v[a + 1] + v[b + 1]
    if (o0 >= 0x100000000) {
        o1++
    }
    v[a] = o0
    v[a + 1] = o1
}

// 64-bit unsigned addition
// Sets v[a,a+1] += b
// b0 is the low 32 bits of b, b1 represents the high 32 bits
export function ADD64AC(v, a, b0, b1) {
    var o0 = v[a] + b0
    if (b0 < 0) {
        o0 += 0x100000000
    }
    var o1 = v[a + 1] + b1
    if (o0 >= 0x100000000) {
        o1++
    }
    v[a] = o0
    v[a + 1] = o1
}

// Little-endian byte access
export function B2B_GET32(arr, i) {
    return (arr[i] ^
        (arr[i + 1] << 8) ^
        (arr[i + 2] << 16) ^
        (arr[i + 3] << 24))
}

// G Mixing function
// The ROTRs are inlined for speed
export function B2B_G(a, b, c, d, ix, iy) {
    var x0 = m[ix]
    var x1 = m[ix + 1]
    var y0 = m[iy]
    var y1 = m[iy + 1]

    ADD64AA(v, a, b) // v[a,a+1] += v[b,b+1] ... in JS we must store a uint64 as two uint32s
    ADD64AC(v, a, x0, x1) // v[a, a+1] += x ... x0 is the low 32 bits of x, x1 is the high 32 bits

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated to the right by 32 bits
    var xor0 = v[d] ^ v[a]
    var xor1 = v[d + 1] ^ v[a + 1]
    v[d] = xor1
    v[d + 1] = xor0

    ADD64AA(v, c, d)

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 24 bits
    xor0 = v[b] ^ v[c]
    xor1 = v[b + 1] ^ v[c + 1]
    v[b] = (xor0 >>> 24) ^ (xor1 << 8)
    v[b + 1] = (xor1 >>> 24) ^ (xor0 << 8)

    ADD64AA(v, a, b)
    ADD64AC(v, a, y0, y1)

    // v[d,d+1] = (v[d,d+1] xor v[a,a+1]) rotated right by 16 bits
    xor0 = v[d] ^ v[a]
    xor1 = v[d + 1] ^ v[a + 1]
    v[d] = (xor0 >>> 16) ^ (xor1 << 16)
    v[d + 1] = (xor1 >>> 16) ^ (xor0 << 16)

    ADD64AA(v, c, d)

    // v[b,b+1] = (v[b,b+1] xor v[c,c+1]) rotated right by 63 bits
    xor0 = v[b] ^ v[c]
    xor1 = v[b + 1] ^ v[c + 1]
    v[b] = (xor1 >>> 31) ^ (xor0 << 1)
    v[b + 1] = (xor0 >>> 31) ^ (xor1 << 1)
}

// Initialization Vector
var BLAKE2B_IV32 = new Uint32Array([
    0xF3BCC908, 0x6A09E667, 0x84CAA73B, 0xBB67AE85,
    0xFE94F82B, 0x3C6EF372, 0x5F1D36F1, 0xA54FF53A,
    0xADE682D1, 0x510E527F, 0x2B3E6C1F, 0x9B05688C,
    0xFB41BD6B, 0x1F83D9AB, 0x137E2179, 0x5BE0CD19
])

var SIGMA8 = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3,
    11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4,
    7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8,
    9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13,
    2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9,
    12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11,
    13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10,
    6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5,
    10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0,
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3
]

// These are offsets into a uint64 buffer.
// Multiply them all by 2 to make them offsets into a uint32 buffer,
// because this is Javascript and we don't have uint64s
var SIGMA82 = new Uint8Array(SIGMA8.map(function (x) { return x * 2 }))

// Compression function. 'last' flag indicates last block.
// Note we're representing 16 uint64s as 32 uint32s
var v = new Uint32Array(32)
var m = new Uint32Array(32)
export function blake2bCompress(ctx, last) {
    var i = 0

    // init work variables
    for (i = 0; i < 16; i++) {
        v[i] = ctx.h[i]
        v[i + 16] = BLAKE2B_IV32[i]
    }

    // low 64 bits of offset
    v[24] = v[24] ^ ctx.t
    v[25] = v[25] ^ (ctx.t / 0x100000000)
    // high 64 bits not supported, offset may not be higher than 2**53-1

    // last block flag set ?
    if (last) {
        v[28] = ~v[28]
        v[29] = ~v[29]
    }

    // get little-endian words
    for (i = 0; i < 32; i++) {
        m[i] = B2B_GET32(ctx.b, 4 * i)
    }

    // twelve rounds of mixing
    for (i = 0; i < 12; i++) {
        B2B_G(0, 8, 16, 24, SIGMA82[i * 16 + 0], SIGMA82[i * 16 + 1])
        B2B_G(2, 10, 18, 26, SIGMA82[i * 16 + 2], SIGMA82[i * 16 + 3])
        B2B_G(4, 12, 20, 28, SIGMA82[i * 16 + 4], SIGMA82[i * 16 + 5])
        B2B_G(6, 14, 22, 30, SIGMA82[i * 16 + 6], SIGMA82[i * 16 + 7])
        B2B_G(0, 10, 20, 30, SIGMA82[i * 16 + 8], SIGMA82[i * 16 + 9])
        B2B_G(2, 12, 22, 24, SIGMA82[i * 16 + 10], SIGMA82[i * 16 + 11])
        B2B_G(4, 14, 16, 26, SIGMA82[i * 16 + 12], SIGMA82[i * 16 + 13])
        B2B_G(6, 8, 18, 28, SIGMA82[i * 16 + 14], SIGMA82[i * 16 + 15])
    }

    for (i = 0; i < 16; i++) {
        ctx.h[i] = ctx.h[i] ^ v[i] ^ v[i + 16]
    }
}

// reusable parameter_block
var parameter_block = new Uint8Array([
    0, 0, 0, 0,      //  0: outlen, keylen, fanout, depth
    0, 0, 0, 0,      //  4: leaf length, sequential mode
    0, 0, 0, 0,      //  8: node offset
    0, 0, 0, 0,      // 12: node offset
    0, 0, 0, 0,      // 16: node depth, inner length, rfu
    0, 0, 0, 0,      // 20: rfu
    0, 0, 0, 0,      // 24: rfu
    0, 0, 0, 0,      // 28: rfu
    0, 0, 0, 0,      // 32: salt
    0, 0, 0, 0,      // 36: salt
    0, 0, 0, 0,      // 40: salt
    0, 0, 0, 0,      // 44: salt
    0, 0, 0, 0,      // 48: personal
    0, 0, 0, 0,      // 52: personal
    0, 0, 0, 0,      // 56: personal
    0, 0, 0, 0       // 60: personal
])

// Creates a BLAKE2b hashing context
// Requires an output length between 1 and 64 bytes
// Takes an optional Uint8Array key
export function Blake2b(outlen, key, salt, personal) {
    // zero out parameter_block before usage
    parameter_block.fill(0)
    // state, 'param block'

    this.b = new Uint8Array(128)
    this.h = new Uint32Array(16)
    this.t = 0 // input count
    this.c = 0 // pointer within buffer
    this.outlen = outlen // output length in bytes

    parameter_block[0] = outlen
    if (key) parameter_block[1] = key.length
    parameter_block[2] = 1 // fanout
    parameter_block[3] = 1 // depth

    if (salt) parameter_block.set(salt, 32)
    if (personal) parameter_block.set(personal, 48)

    // initialize hash state
    for (var i = 0; i < 16; i++) {
        this.h[i] = BLAKE2B_IV32[i] ^ B2B_GET32(parameter_block, i * 4)
    }

    // key the hash, if applicable
    if (key) {
        blake2bUpdate(this, key)
        // at the end
        this.c = 128
    }
}

Blake2b.prototype.update = function (input) {
    this.assert(input instanceof Uint8Array, 'input must be Uint8Array or Buffer')
    blake2bUpdate(this, input)
    return this
}

Blake2b.prototype.digest = function (out) {
    var buf = (!out || out === 'binary' || out === 'hex') ? new Uint8Array(this.outlen) : out
    this.assert(buf instanceof Uint8Array, 'out must be "binary", "hex", Uint8Array, or Buffer')
    this.assert(buf.length >= this.outlen, 'out must have at least outlen bytes of space')
    blake2bFinal(this, buf)
    if (out === 'hex') return this.hexSlice(buf)
    return buf
}

Blake2b.prototype.final = Blake2b.prototype.digest

Blake2b.ready = function (cb) {
    this.b2wasm.ready(function () {
        cb() // ignore the error
    })
}

// Updates a BLAKE2b streaming hash
// Requires hash context and Uint8Array (byte array)
export function blake2bUpdate(ctx, input) {
    for (var i = 0; i < input.length; i++) {
        if (ctx.c === 128) { // buffer full ?
            ctx.t += ctx.c // add counters
            blake2bCompress(ctx, false) // compress (not last)
            ctx.c = 0 // counter to zero
        }
        ctx.b[ctx.c++] = input[i]
    }
}

// Completes a BLAKE2b streaming hash
// Returns a Uint8Array containing the message digest
export function blake2bFinal(ctx, out) {
    ctx.t += ctx.c // mark last block offset

    while (ctx.c < 128) { // fill up with zeros
        ctx.b[ctx.c++] = 0
    }
    blake2bCompress(ctx, true) // final block flag = 1

    for (var i = 0; i < ctx.outlen; i++) {
        out[i] = ctx.h[i >> 2] >> (8 * (i & 3))
    }
    return out
}