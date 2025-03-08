let sessionStats = [];

function updateStatsTable(statsBody) {
    statsBody.innerHTML = '';
    const reversedStats = [...sessionStats].reverse();
    reversedStats.forEach((stat, index) => {
        const row = document.createElement('tr');
        if (index === 0) row.classList.add('latest');
        row.innerHTML = `
            <td>${stat.difficulty}</td>
            <td>${stat.timeSignature}</td>
            <td>${stat.measures}</td>
            <td>${stat.correct ? 'Да' : 'Нет'}</td>
            <td>${stat.listens}</td>
            <td>${stat.userAnswer.replace(/\n/g, '<br>')}</td>
            <td>${stat.correctRhythm.replace(/\n/g, '<br>')}</td>
        `;
        statsBody.appendChild(row);
    });
}

function addStat(stat) {
    sessionStats.push(stat);
}