function createAnswerFields(measures, answerFieldsDiv, timeSignature) {
    answerFieldsDiv.innerHTML = '';
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    const measuresData = Array(measures).fill().map(() => []);

    for (let i = 0; i < measures; i++) {
        const label = document.createElement('label');
        label.textContent = `Такт ${i + 1}:`;
        const canvas = document.createElement('div');
        canvas.className = 'rhythm-canvas';
        canvas.dataset.measure = i;
        canvas.addEventListener('click', () => {
            const canvases = answerFieldsDiv.getElementsByClassName('rhythm-canvas');
            for (let c of canvases) c.classList.remove('active');
            canvas.classList.add('active');
        });
        const clearBtn = document.createElement('button');
        clearBtn.className = 'clear-btn';
        clearBtn.textContent = 'Очистить';
        clearBtn.addEventListener('click', () => {
            measuresData[i] = [];
            renderMeasure(canvas, measuresData[i], timeSignature, numerator, denominator, i === 0);
        });

        answerFieldsDiv.appendChild(label);
        answerFieldsDiv.appendChild(canvas);
        answerFieldsDiv.appendChild(clearBtn);

        renderMeasure(canvas, measuresData[i], timeSignature, numerator, denominator, i === 0);
    }

    if (measures > 0) {
        const firstCanvas = answerFieldsDiv.getElementsByClassName('rhythm-canvas')[0];
        firstCanvas.classList.add('active');
    }

    return measuresData;
}

function setupDurationButtons(durationButtons, answerFieldsDiv, measuresData, timeSignature) {
    const [numerator, denominator] = timeSignature.split('/').map(Number);
    durationButtons.forEach(button => {
        button.addEventListener('click', () => {
            const duration = button.dataset.duration;
            const activeCanvas = answerFieldsDiv.querySelector('.rhythm-canvas.active');
            if (activeCanvas) {
                const measureIndex = parseInt(activeCanvas.dataset.measure);
                const newNote = { name: duration, value: getDurationValue(duration) };
                const tempNotes = [...measuresData[measureIndex], newNote];
                if (checkDuration(tempNotes, numerator, denominator)) {
                    measuresData[measureIndex].push(newNote);
                    renderMeasure(activeCanvas, measuresData[measureIndex], timeSignature, numerator, denominator, measureIndex === 0);
                }
            }
        });
    });
}

function getUserAnswer(measuresData) {
    return measuresData.map((measure, i) => `Такт ${i + 1}: ${measure.map(n => n.name).join(' ')}`).join('\n').trim();
}

function checkAnswer(userAnswer, correctRhythm) {
    const userLines = userAnswer.split('\n').map(line => line.replace(/^Такт \d+:\s*/, '').trim());
    const correctLines = correctRhythm.split('\n').map(line => line.replace(/^Такт \d+:\s*/, '').trim());

    if (userLines.length !== correctLines.length) return false;

    for (let i = 0; i < userLines.length; i++) {
        if (userLines[i] !== correctLines[i]) return false;
    }
    return true;
}