// Глобальная переменная для хранения курса
let currentExchangeRate = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadExchangeRate();
    setupTopButton();
    
    // Инициализация калькулятора с текущим курсом
    convertToCAD();
    
    // Если мы на странице курса валют, загружаем диаграмму
    if (document.getElementById('currencyChart')) {
        loadCurrencyChart();
    }
});

// Кнопка "Наверх"
function setupTopButton() {
    const topBtn = document.getElementById('topBtn');
    
    if (!topBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            topBtn.classList.add('show');
        } else {
            topBtn.classList.remove('show');
        }
    });
    
    topBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Загрузка актуального курса валют с API ЦБР
async function loadExchangeRate() {
    try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        const data = await response.json();
        
        // CAD курс
        if (data.Valute && data.Valute.CAD) {
            currentExchangeRate = data.Valute.CAD.Value;
            
            const currentRateEl = document.getElementById('currentRate');
            if (currentRateEl) {
                currentRateEl.textContent = `1 CAD = ${currentExchangeRate.toFixed(2)} RUB (актуально на ${new Date().toLocaleDateString('ru-RU')})`;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки курса:', error);
        // Используем резервный курс
        currentExchangeRate = 60; // Примерный курс
        const currentRateEl = document.getElementById('currentRate');
        if (currentRateEl) {
            currentRateEl.textContent = `1 CAD ≈ ${currentExchangeRate.toFixed(2)} RUB (приблизительно)`;
        }
    }
}

// Конвертация из RUB в CAD
function convertToCAD() {
    const rubleInput = document.getElementById('rubleInput');
    const cadResult = document.getElementById('cadResult');
    
    if (!rubleInput || !cadResult) return;
    
    if (!currentExchangeRate) {
        cadResult.textContent = '0.00';
        return;
    }
    
    const rublesToConvert = parseFloat(rubleInput.value) || 0;
    const cadAmount = rublesToConvert / currentExchangeRate;
    cadResult.textContent = cadAmount.toFixed(2);
}

// Конвертация из CAD в RUB
function convertToRUB() {
    const cadInput = document.getElementById('cadInput');
    const rubResult = document.getElementById('rubResult');
    
    if (!cadInput || !rubResult) return;
    
    if (!currentExchangeRate) {
        rubResult.textContent = '0.00';
        return;
    }
    
    const cadToConvert = parseFloat(cadInput.value) || 0;
    const rubAmount = cadToConvert * currentExchangeRate;
    rubResult.textContent = rubAmount.toFixed(2);
}

// Слушатели для калькулятора
document.addEventListener('DOMContentLoaded', function() {
    const rubleInput = document.getElementById('rubleInput');
    const cadInput = document.getElementById('cadInput');
    
    if (rubleInput) {
        rubleInput.addEventListener('input', convertToCAD);
    }
    
    if (cadInput) {
        cadInput.addEventListener('input', convertToRUB);
    }
});

// Функция для отображения полного текста новостей
function toggleNews(button) {
    const newsCard = button.closest('.news-card');
    const newsFullDiv = newsCard.querySelector('.news-full');
    
    if (newsFullDiv.style.display === 'none') {
        newsFullDiv.style.display = 'block';
        button.textContent = 'Скрыть';
    } else {
        newsFullDiv.style.display = 'none';
        button.textContent = 'Показать полностью';
    }
}

// Загрузка диаграммы курса валют за последний месяц
async function loadCurrencyChart() {
    try {
        // Получаем данные за последний месяц
        const chartData = await getCurrencyHistoryData();
        
        if (chartData && chartData.dates && chartData.rates) {
            const ctx = document.getElementById('currencyChart').getContext('2d');
            
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartData.dates,
                    datasets: [{
                        label: 'Курс CAD/RUB',
                        data: chartData.rates,
                        backgroundColor: 'rgba(212, 175, 55, 0.7)',
                        borderColor: 'rgba(139, 115, 85, 0.9)',
                        borderWidth: 2,
                        hoverBackgroundColor: 'rgba(139, 115, 85, 0.8)',
                        hoverBorderColor: 'rgba(212, 175, 55, 1)',
                        borderRadius: 5,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                font: {
                                    size: 14
                                },
                                color: 'rgb(51, 51, 51)',
                                padding: 20
                            }
                        },
                        title: {
                            display: true,
                            text: 'Динамика курса канадского доллара за последний месяц',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: 'rgb(26, 26, 26)',
                            padding: 20
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                font: {
                                    size: 12
                                },
                                color: 'rgb(102, 102, 102)'
                            },
                            grid: {
                                drawBorder: true,
                                color: 'rgba(200, 200, 200, 0.2)'
                            }
                        },
                        y: {
                            beginAtZero: false,
                            title: {
                                display: true,
                                text: 'Курс (RUB)',
                                font: {
                                    size: 12,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                font: {
                                    size: 12
                                },
                                color: 'rgb(102, 102, 102)',
                                callback: function(value) {
                                    return value.toFixed(1);
                                }
                            },
                            grid: {
                                color: 'rgba(200, 200, 200, 0.2)'
                            }
                        }
                    }
                }
            });
            
            // При клике на столбец показываем информацию
            const canvasElement = document.getElementById('currencyChart');
            canvasElement.addEventListener('click', function(event) {
                const points = chart.getElementsAtEventForMode(event, 'nearest', { intersect: true }, true);
                
                if (points.length > 0) {
                    const index = points[0].index;
                    const rate = chartData.rates[index];
                    const date = chartData.dates[index];
                    
                    alert(`Дата: ${date}\nКурс: 1 CAD = ${rate.toFixed(2)} RUB`);
                }
            });
        }
    } catch (error) {
        console.error('Ошибка загрузки диаграммы:', error);
    }
}

// Получение исторических данных курса за последний месяц
async function getCurrencyHistoryData() {
    try {
        const dates = [];
        const rates = [];
        
        // Получаем данные за последние 30 дней
        const today = new Date();
        
        for (let i = 30; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Пропускаем выходные
            if (date.getDay() === 0 || date.getDay() === 6) {
                continue;
            }
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;
            
            try {
                const response = await fetch(`https://www.cbr-xml-daily.ru/archive/${year}/${month}/${day}/daily_json.js`);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.Valute && data.Valute.CAD) {
                        const rate = data.Valute.CAD.Value;
                        dates.push(`${day}.${month}`);
                        rates.push(rate);
                    }
                }
            } catch (e) {
                // Пропускаем ошибки при загрузке отдельных дат
            }
        }
        
        // Если не получилось загрузить реальные данные, используем примерные
        if (rates.length === 0) {
            const baseRate = 60;
            for (let i = 0; i < 22; i++) {
                const variance = (Math.random() - 0.5) * 4;
                rates.push(baseRate + variance);
                
                const date = new Date(today);
                date.setDate(date.getDate() - (22 - i));
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                dates.push(`${day}.${month}`);
            }
        }
        
        return { dates, rates };
    } catch (error) {
        console.error('Ошибка получения исторических данных:', error);
        
        // Возвращаем примерные данные в случае ошибки
        const dates = [];
        const rates = [];
        const today = new Date();
        const baseRate = 60;
        
        for (let i = 0; i < 22; i++) {
            const variance = (Math.random() - 0.5) * 4;
            rates.push(baseRate + variance);
            
            const date = new Date(today);
            date.setDate(date.getDate() - (22 - i));
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            dates.push(`${day}.${month}`);
        }
        
        return { dates, rates };
    }
}
