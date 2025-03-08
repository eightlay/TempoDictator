const { Renderer, Stave, StaveNote, Voice, Formatter } = Vex.Flow;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();


class Measure {
    constructor(beats, denominator, durations) {
        this.beats = beats;
        this.denominator = denominator;
        this.notes = this.generate(durations);
    }

    generate(durations) {
        let remainingBeats = this.beats / this.denominator;
        let measure = [];
        while (remainingBeats > 0) {
            const available = getAvailableDurations(remainingBeats, durations);
            if (available.length === 0) break;
            const randomDuration = available[Math.floor(Math.random() * available.length)];
            measure.push(randomDuration);
            remainingBeats -= randomDuration.value;
        }
        return measure;
    }
}

function getAvailableDurations(remainingBeats, durations) {
    return durations.filter(d => d.value <= remainingBeats + 0.001);
}

function generateRhythm(difficulty, timeSignature, measures) {
    const settings = difficultySettings[difficulty];
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    let rhythm = [];
    for (let i = 0; i < measures; i++) {
        const measure = new Measure(numerator, denominator, settings.durations);
        rhythm.push(measure);
    }
    return rhythm;
}

function renderMeasure(canvas, measureNotes, timeSignature, numerator, denominator, isFirst) {
    canvas.innerHTML = '';
    const renderer = new Renderer(canvas, Renderer.Backends.SVG);
    renderer.resize(200, 40);
    const context = renderer.getContext();

    const stave = new Stave(0, -40, 200);
    if (isFirst) stave.addTimeSignature(timeSignature);
    stave.setContext(context).draw();

    const notes = [];

    measureNotes.forEach(duration => {
        let durationStr;
        switch (duration.name) {
            case 'целая': durationStr = 'w'; break;
            case 'половина': durationStr = 'h'; break;
            case 'четверть': durationStr = 'q'; break;
            default: durationStr = 'q';
        }
        notes.push(new StaveNote({ keys: ['f/4'], duration: durationStr }));
    });

    if (notes.length > 0) {
        const voice = new Voice({ num_beats: numerator, beat_value: denominator });
        voice.setStrict(false);
        voice.addTickables(notes);
        new Formatter().joinVoices([voice]).format([voice], 160, { justify: true });
        voice.draw(context, stave);
    }
}

function checkDuration(measureNotes, numerator, denominator) {
    const totalDuration = measureNotes.reduce((sum, note) => sum + getDurationValue(note.name), 0);
    return totalDuration <= (numerator / denominator);
}

function getDurationValue(name) {
    switch (name) {
        case 'целая': return 1;
        case 'половина': return 0.5;
        case 'четверть': return 0.25;
        default: return 0.25;
    }
}

function calculateRhythmDuration(rhythm, bpm) {
    const beatDuration = 60 / bpm;
    const gap = 0.02;
    let totalDuration = 0;
    rhythm.forEach(measure => {
        measure.notes.forEach(duration => {
            const attackTime = 0.05;
            const decayTime = duration.value * 4 * beatDuration * 0.2;
            const releaseTime = duration.value * 4 * beatDuration * 0.7;
            totalDuration += attackTime + decayTime + releaseTime + gap;
        });
    });
    return totalDuration;
}

function playAudio(rhythm, bpm, playButton, referenceButton) {
    let isPlaying = false;
    if (isPlaying) return;
    isPlaying = true;
    playButton.disabled = true;
    referenceButton.disabled = true;

    let currentTime = audioContext.currentTime;
    const beatDuration = 60 / bpm;
    const gap = 0.02;

    rhythm.forEach(measure => {
        measure.notes.forEach(duration => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            const filter = audioContext.createBiquadFilter();

            oscillator.type = 'triangle';
            oscillator.frequency.value = 440;
            filter.type = 'lowpass';
            filter.frequency.value = 1000;
            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioContext.destination);

            const attackTime = 0.05;
            const decayTime = duration.value * 4 * beatDuration * 0.2;
            const sustainLevel = 0.6;
            const releaseTime = duration.value * 4 * beatDuration * 0.7;

            gainNode.gain.setValueAtTime(0, currentTime);
            gainNode.gain.linearRampToValueAtTime(1, currentTime + attackTime);
            gainNode.gain.linearRampToValueAtTime(sustainLevel, currentTime + attackTime + decayTime);
            gainNode.gain.linearRampToValueAtTime(0, currentTime + attackTime + decayTime + releaseTime);

            oscillator.start(currentTime);
            oscillator.stop(currentTime + attackTime + decayTime + releaseTime);

            currentTime += (duration.value * 4 * beatDuration) + gap;
        });
    });

    const totalDuration = calculateRhythmDuration(rhythm, bpm);
    setTimeout(() => {
        isPlaying = false;
        playButton.disabled = false;
        referenceButton.disabled = false;
    }, totalDuration * 1000);
}

function playReference(timeSignature, bpm) {
    const beats = parseInt(timeSignature.split('/')[0]);
    const rhythm = [Array(beats).fill({ name: 'четверть', value: 0.25 })];
    playAudio(rhythm, bpm, document.getElementById('play'), document.getElementById('reference'));
}