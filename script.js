const difficultySelect = document.getElementById('difficulty');
const timeNumeratorSelect = document.getElementById('timeNumerator');
const timeDenominatorSelect = document.getElementById('timeDenominator');
const measuresInput = document.getElementById('measures');
const generateButton = document.getElementById('generate');
const showStatsButton = document.getElementById('showStats');
const resultDiv = document.getElementById('result');
const setupScreen = document.getElementById('setupScreen');
const gameScreen = document.getElementById('gameScreen');
const statsScreen = document.getElementById('statsScreen');
const referenceButton = document.getElementById('reference');
const playButton = document.getElementById('play');
const listenCountDiv = document.getElementById('listenCount');
const answerFieldsDiv = document.getElementById('answerFields');
const submitAnswerButton = document.getElementById('submitAnswer');
const backButton = document.getElementById('back');
const statsBody = document.getElementById('statsBody');
const backToMenuButton = document.getElementById('backToMenu');
const durationButtons = document.querySelectorAll('.duration-btn');

const difficultySettings = {
    1: {
        durations: [
            { name: 'целая', value: 1 },
            { name: 'половина', value: 0.5 },
            { name: 'четверть', value: 0.25 }
        ],
        timeNumerators: [2, 4],
        timeDenominators: [4],
        maxMeasures: 2,
        bpm: 60
    }
};

window.Telegram.WebApp.ready();
window.Telegram.WebApp.expand();

let generatedRhythm = [];
let listenCount = 0;
const maxListens = 5;
let currentTimeSignature = '';
let measuresData = [];

generateButton.addEventListener('click', () => {
    const difficulty = parseInt(difficultySelect.value);
    const timeNumerator = timeNumeratorSelect.value;
    const timeDenominator = timeDenominatorSelect.value;
    const timeSignature = `${timeNumerator}/${timeDenominator}`;
    const measures = parseInt(measuresInput.value);
    const settings = difficultySettings[difficulty];
    if (measures >= 1 && measures <= settings.maxMeasures) {
        generatedRhythm = generateRhythm(difficulty, timeSignature, measures);
        setupScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        statsScreen.classList.add('hidden');
        listenCount = 0;
        listenCountDiv.textContent = `Прослушиваний: ${listenCount}/${maxListens}`;
        playButton.disabled = false;
        referenceButton.disabled = false;
        currentTimeSignature = timeSignature;
        measuresData = createAnswerFields(measures, answerFieldsDiv, timeSignature);
        setupDurationButtons(durationButtons, answerFieldsDiv, measuresData, timeSignature); // Настраиваем кнопки здесь
        resultDiv.textContent = generatedRhythm.map((m, i) => `Такт ${i + 1}: ${m.notes.map(n => n.name).join(' ')}`).join('\n');
    } else {
        resultDiv.textContent = `Введите количество тактов от 1 до ${settings.maxMeasures}.`;
    }
});

referenceButton.addEventListener('click', () => {
    const difficulty = parseInt(difficultySelect.value);
    playReference(currentTimeSignature, difficultySettings[difficulty].bpm);
});

playButton.addEventListener('click', () => {
    if (listenCount < maxListens) {
        listenCount++;
        listenCountDiv.textContent = `Прослушиваний: ${listenCount}/${maxListens}`;
        const difficulty = parseInt(difficultySelect.value);
        playAudio(generatedRhythm, difficultySettings[difficulty].bpm, playButton, referenceButton);
    }
});

submitAnswerButton.addEventListener('click', () => {
    const userAnswer = getUserAnswer(measuresData);
    const correctRhythm = resultDiv.textContent;
    const isCorrect = checkAnswer(userAnswer, correctRhythm);
    addStat({
        difficulty: `Уровень ${difficultySelect.value}`,
        timeSignature: currentTimeSignature,
        measures: parseInt(measuresInput.value),
        correct: isCorrect,
        listens: listenCount,
        userAnswer: userAnswer,
        correctRhythm: correctRhythm
    });
    updateStatsTable(statsBody);
    gameScreen.classList.add('hidden');
    statsScreen.classList.remove('hidden');
});

showStatsButton.addEventListener('click', () => {
    setupScreen.classList.add('hidden');
    statsScreen.classList.remove('hidden');
    updateStatsTable(statsBody);
});

backButton.addEventListener('click', () => {
    gameScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    statsScreen.classList.add('hidden');
    resultDiv.textContent = '';
});

backToMenuButton.addEventListener('click', () => {
    statsScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    resultDiv.textContent = '';
});