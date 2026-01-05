/**
 * Audio Engine
 * Synthesizes drum sounds using Web Audio API without external samples
 */

class AudioEngine {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        
        // Analyser for visualizer
        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 2048;
        
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
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
        gain.connect(this.masterGain);
        
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
        noiseGain.connect(this.masterGain);
        
        // Tone for body
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, time);
        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.5, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain);

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
        gain.connect(this.masterGain);

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
        gain.connect(this.masterGain);

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
        gain.connect(this.masterGain);

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
        gain.connect(this.masterGain);

        osc.start(time);
        osc.stop(time + 0.05);
    }

    /**
     * Play sound by instrument type
     */
    playSound(type, time) {
        switch(type) {
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
