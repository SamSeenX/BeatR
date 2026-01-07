/**
 * Audio Engine
 * Synthesizes drum sounds using Web Audio API without external samples
 */

/**
 * Channel Class
 * Manages effects chain for a single instrument
 */
class Channel {
    constructor(ctx, masterGain) {
        this.ctx = ctx;
        this.input = ctx.createGain();

        // EQ Nodes (3-band)
        this.lowShelf = ctx.createBiquadFilter();
        this.lowShelf.type = 'lowshelf';
        this.lowShelf.frequency.value = 320;

        this.midPeaking = ctx.createBiquadFilter();
        this.midPeaking.type = 'peaking';
        this.midPeaking.frequency.value = 1000;
        this.midPeaking.Q.value = 0.5;

        this.highShelf = ctx.createBiquadFilter();
        this.highShelf.type = 'highshelf';
        this.highShelf.frequency.value = 3200;

        // Volume Gain
        this.outputGain = ctx.createGain();

        // Pan
        this.panner = ctx.createStereoPanner();
        this.panner.pan.value = 0; // Center

        // Reverb Send
        this.reverbSend = ctx.createGain();
        this.reverbSend.gain.value = 0; // Default dry

        // Chain Connection: Input -> Low -> Mid -> High -> Pan -> Volume -> Master
        this.input.connect(this.lowShelf);
        this.lowShelf.connect(this.midPeaking);
        this.midPeaking.connect(this.highShelf);
        this.highShelf.connect(this.panner);
        this.panner.connect(this.outputGain);
        this.outputGain.connect(masterGain);

        // Reverb Connection: Input -> ReverbSend -> ReverbInput (Global)
        // This is done in the main engine since reverb is global
    }

    setEQ(bass, mid, treble) {
        this.lowShelf.gain.value = bass; // dB
        this.midPeaking.gain.value = mid; // dB
        this.highShelf.gain.value = treble; // dB
    }

    setVolume(value) {
        this.outputGain.gain.value = value;
    }

    setPan(value) {
        this.panner.pan.value = value; // -1 (left) to 1 (right)
    }

    setReverbSend(amount) {
        this.reverbSend.gain.value = amount;
    }
}

class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;

        // Global Reverb - More pronounced
        this.reverbNode = this.ctx.createConvolver();
        this.reverbNode.buffer = this.createReverbImpulse(3.0, 3.0); // Longer, more decay
        this.reverbGain = this.ctx.createGain();
        this.reverbGain.gain.value = 1.5; // Boost wet signal

        this.reverbNode.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);

        // Initialize Channels
        this.channels = {};
        const instruments = ['KICK', 'SNARE', 'HI-HAT', 'TOM', 'CLAP', 'RIM'];
        instruments.forEach(inst => {
            const channel = new Channel(this.ctx, this.masterGain);
            // Connect reverb send
            channel.input.connect(channel.reverbSend);
            channel.reverbSend.connect(this.reverbNode);
            this.channels[inst] = channel;
        });

        // Analyser for visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;

        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
    }

    createReverbImpulse(duration, decay) {
        const length = this.ctx.sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
        const left = impulse.getChannelData(0);
        const right = impulse.getChannelData(1);
        for (let i = 0; i < length; i++) {
            // Simple noise with exponential decay
            const n = i;
            left[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
            right[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
        return impulse;
    }

    resume() {
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    /**
     * Kick Drum - Deep bass thump
     */
    playKick(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);

        gain.gain.setValueAtTime(1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);

        osc.connect(gain);
        gain.connect(this.channels['KICK'].input); // Connect to channel

        osc.start(time);
        osc.stop(time + 0.5);
    }

    /**
     * Snare Drum - Crisp snap with noise
     */
    playSnare(time) {
        // White noise for snare body
        const noise = this.ctx.createBufferSource();
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < this.ctx.sampleRate; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.value = 1000;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(1, time);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.channels['SNARE'].input);

        // Tone for body
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, time);
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

        osc.connect(oscGain);
        oscGain.connect(this.channels['SNARE'].input);

        noise.start(time);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    /**
     * Hi-Hat - Bright metallic sound
     */
    playHiHat(time) {
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const bandpass = this.ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 10000;

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 7000;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.6, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        noise.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(gain);
        gain.connect(this.channels['HI-HAT'].input);

        noise.start(time);
    }

    /**
     * Tom - Mid-range drum
     */
    playTom(time) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.frequency.setValueAtTime(200, time);
        osc.frequency.exponentialRampToValueAtTime(50, time + 0.4);

        gain.gain.setValueAtTime(0.8, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);

        osc.connect(gain);
        gain.connect(this.channels['TOM'].input);

        osc.start(time);
        osc.stop(time + 0.4);
    }

    /**
     * Clap - Hand clap sound
     */
    playClap(time) {
        const noise = this.ctx.createBufferSource();
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < buffer.length; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500;
        filter.Q.value = 1;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.8, time + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.channels['CLAP'].input);

        noise.start(time);
    }

    /**
     * Rim Shot - Sharp percussive hit
     */
    playRim(time) {
        const osc = this.ctx.createOscillator();
        osc.type = 'square';
        const gain = this.ctx.createGain();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 800;

        osc.frequency.setValueAtTime(400, time);
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.channels['RIM'].input);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    /**
     * Play sound by instrument type
     */
    playSound(type, time) {
        switch (type) {
            case 'KICK': this.playKick(time); break;
            case 'SNARE': this.playSnare(time); break;
            case 'HI-HAT': this.playHiHat(time); break;
            case 'TOM': this.playTom(time); break;
            case 'CLAP': this.playClap(time); break;
            case 'RIM': this.playRim(time); break;
            default: break;
        }
    }
}
