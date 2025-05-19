function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    const targetTab = document.getElementById(tabName);
    targetTab.style.display = "block";
    setTimeout(() => targetTab.classList.add("active"), 10);
    evt.currentTarget.className += " active";
}

function resetForm(formId) {
    document.getElementById(formId).reset();
    const resultDiv = formId === 'comparisonForm' ? 'comparisonResult' : 'additiveResult';
    document.getElementById(resultDiv).classList.add("hidden");
}

function validateComparisonInputs(tTraditional, tAM, cFlex, cTotal, wasteAM, wasteTraditional) {
    if (isNaN(tTraditional) || tTraditional < 1) return "Время традиционного производства должно быть больше 0.";
    if (isNaN(tAM) || tAM < 1) return "Время аддитивного производства должно быть больше 0.";
    if (isNaN(cFlex) || cFlex < 0) return "Стоимость перенастройки не может быть отрицательной.";
    if (isNaN(cTotal) || cTotal < 1) return "Общая стоимость должна быть больше 0.";
    if (isNaN(wasteAM) || wasteAM < 0) return "Отходы аддитивного производства не могут быть отрицательными.";
    if (isNaN(wasteTraditional) || wasteTraditional < 0) return "Отходы традиционного производства не могут быть отрицательными.";
    return null;
}

function validateAdditiveInputs(volume, time, weights) {
    if (isNaN(volume) || volume < 1) return "Объем производства должен быть больше 0.";
    if (isNaN(time) || time < 1) return "Срок производства должен быть больше 0.";
    const sumWeights = weights.reduce((sum, w) => sum + w, 0);
    if (Math.abs(sumWeights - 1) > 0.01) return "Сумма весов критериев AHP должна быть равна 1.";
    if (weights.some(w => w < 0 || w > 1)) return "Веса критериев должны быть от 0 до 1.";
    return null;
}

function calculateComparison() {
    const button = document.querySelector("#comparisonForm .calculate-btn");
    button.classList.add("loading");
    button.disabled = true;

    const tTraditional = parseFloat(document.getElementById("tTraditional").value);
    const tAM = parseFloat(document.getElementById("tAM").value);
    const cFlex = parseFloat(document.getElementById("cFlex").value);
    const cTotal = parseFloat(document.getElementById("cTotal").value);
    const wasteAM = parseFloat(document.getElementById("wasteAM").value);
    const wasteTraditional = parseFloat(document.getElementById("wasteTraditional").value);

    const error = validateComparisonInputs(tTraditional, tAM, cFlex, cTotal, wasteAM, wasteTraditional);
    if (error) {
        alert(error);
        button.classList.remove("loading");
        button.disabled = false;
        return;
    }

    const alpha = 0.4, beta = 0.3, gamma = 0.3;
    const nDesign = 10, nTraditional = 2;

    const timeComponent = alpha * (tTraditional - tAM) / tTraditional;
    const costComponent = beta * cFlex / cTotal;
    const designComponent = gamma * Math.log(1 + nDesign / nTraditional);
    const Eadapt = timeComponent + costComponent + designComponent;

    const totalMaterial = 10;
    const wasteRatioAM = (wasteAM / totalMaterial) * 100;
    const wasteRatioTraditional = (wasteTraditional / totalMaterial) * 100;

    const costAM = cTotal * 0.8;
    const costTraditional = cTotal;

    let interpretation = "";
    if (Eadapt > 0.7) {
        interpretation = "Аддитивное производство значительно эффективнее. Рекомендуется для данных условий.";
    } else if (Eadapt > 0.4) {
        interpretation = "Аддитивное производство предпочтительнее. Обеспечивает экономию времени и гибкость.";
    } else if (Eadapt > 0.2) {
        interpretation = "Требуется дополнительный анализ. Преимущества аддитивного производства неочевидны.";
    } else {
        interpretation = "Традиционное производство более эффективно для данных условий.";
    }

    document.getElementById("efficiencyValue").innerHTML = 
        `E<sub>adapt</sub> = ${Eadapt.toFixed(3)}<br>
        Доля отходов (AM): ${wasteRatioAM.toFixed(1)}%<br>
        Доля отходов (традиц.): ${wasteRatioTraditional.toFixed(1)}%`;
    document.getElementById("efficiencyInterpretation").textContent = interpretation;

    document.getElementById("compTimeAM").textContent = tAM;
    document.getElementById("compTimeTraditional").textContent = tTraditional;
    document.getElementById("compWasteAM").textContent = wasteAM;
    document.getElementById("compWasteTraditional").textContent = wasteTraditional;
    document.getElementById("compCostAM").textContent = costAM.toFixed(2);
    document.getElementById("compCostTraditional").textContent = costTraditional.toFixed(2);

    document.getElementById("comparisonResult").classList.remove("hidden");

    button.classList.remove("loading");
    button.disabled = false;
}

function calculateAdditive() {
    const button = document.querySelector("#additiveForm .calculate-btn");
    button.classList.add("loading");
    button.disabled = true;

    const volume = parseInt(document.getElementById("productionVolume").value);
    const time = parseInt(document.getElementById("timeConstraint").value);
    const budget = document.getElementById("budget").value;
    const material = document.getElementById("material").value;
    const complexity = document.getElementById("complexity").value;
    const energy = document.getElementById("energy").value;
    const weights = [
        parseFloat(document.getElementById("weightSpeed").value),
        parseFloat(document.getElementById("weightCost").value),
        parseFloat(document.getElementById("weightEco").value),
        parseFloat(document.getElementById("weightMech").value),
        parseFloat(document.getElementById("weightGeom").value),
        parseFloat(document.getElementById("weightEnergy").value)
    ];

    const error = validateAdditiveInputs(volume, time, weights);
    if (error) {
        alert(error);
        button.classList.remove("loading");
        button.disabled = false;
        return;
    }

    const criteria = ["Скорость", "Себестоимость", "Экологичность", "Механические свойства", "Сложность геометрии", "Энергопотребление"];
    const techScores = {
        "FDM": { speed: 5, cost: 5, eco: 3, mech: 2, geom: 2, energy: 4 },
        "SLA": { speed: 3, cost: 3, eco: 2, mech: 3, geom: 5, energy: 3 },
        "SLS": { speed: 3, cost: 3, eco: 4, mech: 4, geom: 4, energy: 2 },
        "DMLS": { speed: 1, cost: 1, eco: 3, mech: 5, geom: 5, energy: 1 },
        "WAAM": { speed: 4, cost: 3, eco: 2, mech: 3, geom: 2, energy: 3 }
    };

    let scores = {};
    for (let tech in techScores) {
        scores[tech] = (
            weights[0] * techScores[tech].speed +
            weights[1] * techScores[tech].cost +
            weights[2] * techScores[tech].eco +
            weights[3] * techScores[tech].mech +
            weights[4] * techScores[tech].geom +
            weights[5] * techScores[tech].energy
        );
    }

    let recommendedTech = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    let explanation = "";
    let alternatives = [];

    if (material === "metal") {
        if (budget === "high" && volume < 50) {
            recommendedTech = "DMLS";
            explanation = "DMLS обеспечивает высокую точность и прочность для металлических деталей малой серии.";
            alternatives.push({ tech: "WAAM", desc: "Для крупных деталей с меньшей точностью" });
        } else {
            recommendedTech = "WAAM";
            explanation = "WAAM экономичен для крупных металлических деталей с высокой скоростью производства.";
            alternatives.push({ tech: "DMLS", desc: "Для более точных деталей" });
        }
    } else if (material === "plastic" && time < 5 && complexity === "low") {
        recommendedTech = "FDM";
        explanation = "FDM оптимален для быстрого и дешевого производства простых пластиковых деталей.";
        alternatives.push({ tech: "SLS", desc: "Для более прочных деталей" });
    } else if (complexity === "high") {
        recommendedTech = "SLA";
        explanation = "SLA обеспечивает высокую точность для сложных геометрий.";
        alternatives.push({ tech: "SLS", desc: "Для функциональных деталей" });
    } else {
        recommendedTech = "SLS";
        explanation = "SLS подходит для нейлона и сложных деталей с хорошими механическими свойствами.";
        alternatives.push({ tech: "FDM", desc: "Для более дешевого производства" });
    }

    if (energy === "low" && recommendedTech === "DMLS") {
        recommendedTech = "WAAM";
        explanation = "WAAM выбран из-за низкого приоритета энергопотребления, подходит для металлов.";
        alternatives.push({ tech: "DMLS", desc: "Для высокой точности" });
    }

    document.getElementById("recommendedTech").textContent = recommendedTech;
    document.getElementById("techExplanation").textContent = explanation;
    document.getElementById("criteriaWeights").textContent = criteria.map((c, i) => `${c}: ${weights[i].toFixed(2)}`).join(", ");

    const alternativesDiv = document.getElementById("alternatives");
    alternativesDiv.innerHTML = "";
    if (alternatives.length > 0) {
        const ul = document.createElement("ul");
        alternatives.forEach(alt => {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${alt.tech}</strong> - ${alt.desc}`;
            ul.appendChild(li);
        });
        alternativesDiv.appendChild(ul);
    }

    document.getElementById("additiveResult").classList.remove("hidden");

    button.classList.remove("loading");
    button.disabled = false;
}