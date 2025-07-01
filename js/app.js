// Variables globales
let currentToolKey = null;
let impactChart = null;
let autoRotateInterval = null;
let autoRotateTimeout = null;
let selectedAdvisor = 'chatgpt'; // Valor por defecto
let advisorAffinity = null;
let affinitySelection = null;

// Elementos del DOM
const dynamicContentArea = document.getElementById('dynamic-content-area');
const toolSelectorContainer = document.querySelector('#tool-selector .grid');
const overviewTitle = document.getElementById('overview-title');
const overviewIntro = document.getElementById('overview-intro');
const valueList = document.getElementById('overview-value-list');
const overviewIdealFor = document.getElementById('overview-ideal-for');
const useCaseTabsContainer = document.getElementById('use-case-tabs');
const useCaseContentContainer = document.getElementById('use-case-content');

// Elementos del formulario
const companyTypeSelector = document.getElementById('companyType');
const sectorSelector = document.getElementById('sector');
const businessActivitySelector = document.getElementById('businessActivity');
const otherActivityContainer = document.getElementById('other-activity-container');
const otherActivityInput = document.getElementById('other-activity');
const businessDescriptionInput = document.getElementById('business-description');
const improvementGoalInput = document.getElementById('improvement-goal');
const currentProblemInput = document.getElementById('current-problem');
const getRecommendationBtn = document.getElementById('get-recommendation-btn');
const recommendationResultContainer = document.getElementById('recommendation-result');

const deepDiveToolSelector = document.getElementById('deep-dive-tool-selector');
const deepDiveTabsContainer = document.getElementById('deep-dive-tabs');
const deepDiveContentContainer = document.getElementById('deep-dive-content');

const infoModal = document.getElementById('info-modal');
const closeInfoModalBtn = document.getElementById('close-info-modal-btn');
const infoModalTitle = document.getElementById('info-modal-title');
const infoModalContent = document.getElementById('info-modal-content');

const strategyModal = document.getElementById('strategy-modal');
const copyStrategyBtn = document.getElementById('copy-strategy-btn');
const closeModalBtnStrategy = document.getElementById('close-modal-btn-strategy');
const strategyModalContent = document.getElementById('strategy-modal-content');
const copyToast = document.getElementById('copy-toast');

const themeToggleBtn = document.getElementById('theme-toggle');
const lightIcon = document.getElementById('theme-icon-light');
const darkIcon = document.getElementById('theme-icon-dark');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

// Función principal de inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplicación iniciada correctamente');
    
    // Configuración inicial
    emailjs.init(EMAIL_CONFIG.publicKey);
    
    // Inicializar tema PRIMERO para que los colores se apliquen correctamente
    initTheme();
    
    // Inicializar componentes
    createToolCards();
    initChart();
    initTypingEffect();
    initSlider();
    initLogoScroller();
    initDeepDive();
    setupEventListeners();
    setupCursorEffect();
    
    // Asegurar que el gráfico tenga los colores correctos desde el inicio
    setTimeout(() => {
        updateChartTheme();
        updateFUSoftLogo();
        updateUniempresarialLogo();
        updateCCBLogo();
    }, 100);
    
    // Configurar rotación automática
    startAutoRotateTools();
    
    // Mostrar área de contenido dinámico
    if (dynamicContentArea) {
        dynamicContentArea.style.opacity = '1';
    }
    
    // Inicializar selección de asesor de IA
    setupAIAdvisorSelector();
    setupAdvisorAffinity();
    setupAffinityCards();
    
    console.log('Aplicación configurada correctamente');
});

function createToolCards() {
    if (!toolSelectorContainer) return;
    
    toolSelectorContainer.innerHTML = '';
    
    Object.entries(aiData).forEach(([key, tool]) => {
        const card = document.createElement('div');
        card.className = `tool-card-container bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-2 ${tool.borderColor} transition-all duration-300 ease-in-out flex flex-col justify-between`;
        
        card.innerHTML = `
            <div id="select-${key}" data-tool-key="${key}" class="flex-grow cursor-pointer">
                <h2 class="text-2xl font-bold ${tool.iconColor} mb-2">${tool.name}</h2>
                <p class="text-gray-600 dark:text-gray-400">${tool.description}</p>
            </div>
            <div class="mt-4 flex items-center justify-between">
                <button class="see-more-btn text-sm font-medium ${tool.iconColor} hover:underline" data-tool="${key}">Ver más</button>
                <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="link-btn inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:underline">Sitio Web <span class="ml-1">→</span></a>
            </div>
        `;
        
        toolSelectorContainer.appendChild(card);
    });
}

function initChart() {
    if (impactChart) {
        impactChart.destroy();
    }
    const isDark = document.documentElement.classList.contains('dark');
    const labelColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'; // Blanco en oscuro, negro en claro
    const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'; // Líneas de fondo más visibles

    const ctx = document.getElementById('impactChart');
    if (!ctx) return;
    
    impactChart = new Chart(ctx.getContext('2d'), {
        type: 'radar', 
        data: { 
            labels: CHART_CONFIG.labels, 
            datasets: [{ 
                label: '', 
                data: [], 
                backgroundColor: [], 
                borderColor: [], 
                borderWidth: 2, 
                pointBackgroundColor: [], 
                pointBorderColor: '#fff', 
                pointHoverBackgroundColor: '#fff', 
                pointHoverBorderColor: [] 
            }] 
        },
        options: { 
            responsive: true, 
            maintainAspectRatio: false, 
            scales: { 
                r: { 
                    beginAtZero: true, 
                    max: 5, 
                    ticks: { stepSize: 1, display: false }, 
                    pointLabels: { color: labelColor, font: { size: 12 } }, 
                    angleLines: { color: gridLineColor }, 
                    grid: { color: gridLineColor } 
                } 
            }, 
            plugins: { legend: { display: false } } 
        }
    });
}

function updateChartTheme() {
    if (!impactChart) return;
    const isDark = document.documentElement.classList.contains('dark');
    const labelColor = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)'; // Blanco en oscuro, negro en claro
    const gridLineColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'; // Líneas de fondo más visibles
    impactChart.options.scales.r.pointLabels.color = labelColor;
    impactChart.options.scales.r.angleLines.color = gridLineColor;
    impactChart.options.scales.r.grid.color = gridLineColor;
    impactChart.update();
}

function updateUI(toolKey) {
    if (!aiData[toolKey] || currentToolKey === toolKey) return;
    currentToolKey = toolKey;
    const currentToolData = aiData[toolKey];
    if (dynamicContentArea) dynamicContentArea.style.opacity = '0';
    
    setTimeout(() => {
        if (overviewTitle) overviewTitle.textContent = currentToolData.title;
        if (overviewIntro) overviewIntro.textContent = currentToolData.intro;
        if (overviewIdealFor) overviewIdealFor.textContent = currentToolData.successCase;
        
        if (valueList) {
            valueList.innerHTML = '';
            currentToolData.valueProps.forEach(prop => {
                valueList.innerHTML += `<li class="flex items-start"><span class="text-green-500 dark:text-green-400 mr-3 mt-1">&#10003;</span><span>${prop}</span></li>`;
            });
        }

        if (impactChart && currentToolData.chartData) {
            const chartDataset = impactChart.data.datasets[0];
            chartDataset.data = currentToolData.chartData.values;
            chartDataset.backgroundColor = currentToolData.chartData.bgColor;
            chartDataset.borderColor = currentToolData.chartData.borderColor;
            impactChart.update();
        }

        if (useCaseTabsContainer && currentToolData.useCases) {
            useCaseTabsContainer.innerHTML = '';
            const categories = Object.keys(currentToolData.useCases);
            categories.forEach((category, index) => {
                const button = document.createElement('button');
                button.textContent = category;
                button.className = 'tab-btn px-4 py-2 rounded-lg font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
                button.dataset.category = category;
                if (index === 0) { button.classList.add('active-tab'); }
                button.onclick = () => showUseCases(category);
                useCaseTabsContainer.appendChild(button);
            });
            
            showUseCases(categories[0]);
        }
        
        if (dynamicContentArea) dynamicContentArea.style.opacity = '1';
        document.querySelectorAll('.tool-card-container').forEach(card => card.classList.remove('active-tool'));
        const selectedCard = document.querySelector(`#select-${toolKey}`);
        if (selectedCard) selectedCard.parentElement.classList.add('active-tool');
        
        const checkbox = document.querySelector(`.tool-checkbox[value="${toolKey}"]`);
        if(checkbox && !checkbox.checked) {
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
        }

    }, 300);
}

function showUseCases(category) {
    if (!currentToolKey || !aiData[currentToolKey] || !useCaseContentContainer) return;
    const useCases = aiData[currentToolKey].useCases[category];
    useCaseContentContainer.innerHTML = '';
    if (!useCases) return;
    useCases.forEach(uc => {
        useCaseContentContainer.innerHTML += `<div class="bg-gray-100 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700"><h5 class="font-bold text-lg mb-2 text-gray-800 dark:text-gray-200">${uc.title}</h5><p class="text-gray-600 dark:text-gray-400">${uc.desc}</p></div>`;
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active-tab', btn.dataset.category === category);
    });
}

function setupCursorEffect() {
    window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--x', e.clientX + 'px');
        document.documentElement.style.setProperty('--y', e.clientY + 'px');
    });
}

function initTheme() {
    const isDark = localStorage.getItem('theme') === 'dark' || 
                  (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
    
    updateThemeIcons();
    updateFUSoftLogo();
    updateUniempresarialLogo();
    updateCCBLogo();
}

function updateThemeIcons() {
    const isDark = document.documentElement.classList.contains('dark');
    if (lightIcon) lightIcon.classList.toggle('hidden', isDark);
    if (darkIcon) darkIcon.classList.toggle('hidden', !isDark);
}

function updateFUSoftLogo() {
    const isDark = document.documentElement.classList.contains('dark');
    const fusoftLogoImg = document.getElementById('fusoft-logo-img');
    
    if (fusoftLogoImg) {
        if (isDark) {
            fusoftLogoImg.src = 'img/fu.logo-blue.png';
        } else {
            fusoftLogoImg.src = 'fUSoft logos actuales/completos/fUSoft complete 1.png';
        }
    }
}

function updateUniempresarialLogo() {
    const isDark = document.documentElement.classList.contains('dark');
    const uniempresarialLogoImg = document.querySelector('.logo-container img[alt="Logo Uniempresarial"]');
    
    if (uniempresarialLogoImg) {
        if (isDark) {
            uniempresarialLogoImg.src = 'img/logo-white.png';
        } else {
            uniempresarialLogoImg.src = 'img/Logo Completo Uniempresarial a color.png';
        }
    }
}

function updateCCBLogo() {
    const isDark = document.documentElement.classList.contains('dark');
    const ccbLogoImg = document.getElementById('ccb-logo-img');
    if (ccbLogoImg) {
        ccbLogoImg.src = isDark ? 'img/CCB-DARK.png' : 'img/CCB.png';
    }
}

function initTypingEffect() {
    const element = document.getElementById('typed-text');
    if (!element) return;
    
    const text = 'Inteligencia Artificial';
    let index = 0;
    
    function type() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(type, 150);
        }
    }
    
    setTimeout(type, 500);
}

function initSlider() {
    const viewport = document.querySelector('#ia-universal-slider .ia-slider-viewport');
    const track = document.querySelector('#ia-universal-slider .ia-slider-track');
    
    if (!viewport || !track) return;
    
    viewport.addEventListener('mouseover', (e) => {
        if (e.target.closest('.ia-slide')) {
            track.style.animationPlayState = 'paused';
        }
    });
    
    viewport.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget?.closest('.ia-slide')) {
            track.style.animationPlayState = 'running';
        }
    });
}

function initLogoScroller() {
    const scrollerInners = document.querySelectorAll('.scroller-inner');
    scrollerInners.forEach(scroller => {
        const logos = Object.values(aiData);
        const additionalLogos = [
            { logo: 'img/facebook.png', name: 'Facebook' },
            { logo: 'img/whatsapp.png', name: 'WhatsApp' },
            { logo: 'img/power.png', name: 'Power BI' },
            { logo: 'img/word.png', name: 'Word' },
            { logo: 'img/gmail.png', name: 'Gmail' }
        ];
        const allLogos = [...logos, ...additionalLogos];
        const logosToRender = [...allLogos, ...allLogos, ...allLogos, ...allLogos];
        
        scroller.innerHTML = '';
        logosToRender.forEach(tool => {
            const logoEl = document.createElement('img');
            logoEl.src = tool.logo;
            logoEl.alt = `Logo de ${tool.name}`;
            logoEl.className = 'h-16 w-16 object-contain rounded-md bg-white p-2 shadow-md flex-shrink-0 carousel-logo-hover';
            scroller.appendChild(logoEl);
        });
    });
}

function initDeepDive() {
    if (!deepDiveToolSelector) return;
    
    // Init Tool Selector
    deepDiveToolSelector.innerHTML = '';
    for (const key in aiData) {
        const tool = aiData[key];
        const selectorHTML = `
            <div>
                <input type="checkbox" id="check-${key}" value="${key}" class="hidden tool-checkbox" checked>
                <label for="check-${key}" class="flex items-center space-x-2 cursor-pointer p-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <span class="w-4 h-4 rounded-full" style="background-color: ${tool.chartData?.borderColor || '#000'}"></span>
                    <span class="font-semibold text-sm">${tool.name}</span>
                </label>
            </div>
        `;
        deepDiveToolSelector.innerHTML += selectorHTML;
    }
    
    document.querySelectorAll('.tool-checkbox').forEach(cb => cb.addEventListener('change', showDeepDiveContent));

    // Init Category Tabs
    if (deepDiveTabsContainer && deepDiveData) {
        const categories = Object.keys(deepDiveData);
        deepDiveTabsContainer.innerHTML = '';
        categories.forEach((category, index) => {
            const button = document.createElement('button');
            button.textContent = category;
            button.className = 'deep-dive-tab px-4 py-2 rounded-lg font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600';
            button.dataset.category = category;
            if (index === 0) { button.classList.add('active'); }
            button.addEventListener('click', () => {
                document.querySelectorAll('.deep-dive-tab').forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                showDeepDiveContent();
            });
            deepDiveTabsContainer.appendChild(button);
        });
        showDeepDiveContent();
    }
}

function showDeepDiveContent() {
    const activeTab = document.querySelector('.deep-dive-tab.active');
    if (!activeTab || !deepDiveContentContainer) return;
    const category = activeTab.dataset.category;

    const selectedTools = Array.from(document.querySelectorAll('.tool-checkbox:checked')).map(cb => cb.value);

    deepDiveContentContainer.innerHTML = '';

    if (selectedTools.length === 0) {
        deepDiveContentContainer.innerHTML = `<p class="text-center text-gray-500 col-span-full">Selecciona al menos una herramienta para comparar.</p>`;
        return;
    }

    selectedTools.forEach(toolKey => {
        const toolData = aiData[toolKey];
        const categoryData = deepDiveData[category][toolKey];
        const borderColorClass = toolData.chartData?.borderColor?.replace('rgba', 'rgb').replace(/, 1\)$/, ')') || '#000';
        
        let listItems = (Array.isArray(categoryData) ? categoryData : [categoryData]).map(item => `<li class="flex items-start"><span class="mr-2 mt-1 text-gray-400 dark:text-gray-500">&#8227;</span><span class="text-gray-700 dark:text-gray-300">${item}</span></li>`).join('');

        deepDiveContentContainer.innerHTML += `
            <div class="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-lg border-t-4" style="border-top-color: ${borderColorClass};">
                <h4 class="font-bold text-lg mb-3 ${toolData.iconColor}">${toolData.name}</h4>
                <ul class="space-y-2 text-sm">${listItems}</ul>
            </div>
        `;
    });
}

function setupEventListeners() {
    // Theme toggle
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Mobile menu
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Navigation links
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
            }
        });
    });
    
    // Tool selector
    if (toolSelectorContainer) {
        toolSelectorContainer.addEventListener('click', (e) => {
            const card = e.target.closest('[data-tool-key]');
            if(card) {
                updateUI(card.dataset.toolKey);
                resetAutoRotateTools();
                document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
            }
            
            const seeMoreBtn = e.target.closest('.see-more-btn');
            const linkBtn = e.target.closest('.link-btn');

            if (seeMoreBtn) {
                e.stopPropagation();
                showInfoModal(seeMoreBtn.dataset.tool);
            }
            if (linkBtn) {
                e.stopPropagation();
            }
        });
    }
    
    // Recommendation form
    if (getRecommendationBtn) {
        getRecommendationBtn.addEventListener('click', updateRecommendation);
    }
    
    // Business activity selector
    if (businessActivitySelector) {
        businessActivitySelector.addEventListener('change', toggleOtherActivityField);
    }
    
    // Modal close buttons
    if (closeInfoModalBtn) {
        closeInfoModalBtn.addEventListener('click', () => {
            if (infoModal) infoModal.classList.add('hidden');
        });
    }
    
    if (closeModalBtnStrategy) {
        closeModalBtnStrategy.addEventListener('click', () => {
            if (strategyModal) strategyModal.classList.add('hidden');
        });
    }
    
    // Copy strategy button
    if (copyStrategyBtn) {
        copyStrategyBtn.addEventListener('click', () => {
            const contentToCopy = strategyModalContent?.innerText || '';
            const textarea = document.createElement('textarea');
            textarea.value = contentToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);

            if (copyToast) {
                copyToast.classList.remove('opacity-0');
                setTimeout(() => {
                    copyToast.classList.add('opacity-0');
                }, 2000);
            }
        });
    }
    
    // Scroll spy
    window.addEventListener('scroll', handleScrollSpy);
    
    // Email sharing functionality
    setupEmailSharing();

    // Delegación de eventos para el botón de generar estrategia
    document.addEventListener('click', (e) => {
        const generateStrategyBtn = e.target.closest('#generate-strategy-btn');
        if (generateStrategyBtn) {
            const currentTools = Array.from(document.querySelectorAll('.recommended-tool-card')).map(card => card.getAttribute('data-tool-key'));
            const improvementGoal = improvementGoalInput?.value || '';
            const currentProblem = currentProblemInput?.value || '';
            generateStrategy(currentTools, improvementGoal, currentProblem);
        }
    });
}

function setupEmailSharing() {
    const shareBtn = document.getElementById('share-btn');
    const sharePanel = document.getElementById('share-panel');
    const closeSharePanel = document.getElementById('close-share-panel');
    const shareForm = document.getElementById('share-form');
    const shareEmail = document.getElementById('share-email');
    const shareMessage = document.getElementById('share-message');
    
    if (shareBtn && sharePanel) {
        shareBtn.addEventListener('click', () => {
            sharePanel.classList.remove('hidden');
            if (shareMessage) shareMessage.textContent = '';
            if (shareEmail) shareEmail.value = '';
        });
    }
    
    if (closeSharePanel && sharePanel) {
        closeSharePanel.addEventListener('click', () => sharePanel.classList.add('hidden'));
    }
    
    if (shareForm) {
        shareForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (shareMessage) shareMessage.textContent = 'Enviando...';
            let planText = strategyModalContent?.innerText || '';
            try {
                await emailjs.send('service_gmjhzna', 'template_bxpfw1d', {
                    a_email: shareEmail?.value || '',
                    plan_html: planText
                });
                if (shareMessage) {
                    shareMessage.textContent = '¡Plan enviado exitosamente!';
                    shareMessage.className = 'mt-4 text-center text-green-600';
                }
            } catch (err) {
                if (shareMessage) {
                    shareMessage.textContent = 'Ocurrió un error al enviar el correo.';
                    shareMessage.className = 'mt-4 text-center text-red-600';
                }
            }
        });
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcons();
    updateChartTheme();
    updateFUSoftLogo();
    updateUniempresarialLogo();
    updateCCBLogo();
}

function toggleOtherActivityField() {
    if (!businessActivitySelector || !otherActivityContainer) return;
    
    if (businessActivitySelector.value === 'otro') {
        otherActivityContainer.classList.remove('hidden');
        if (otherActivityInput) otherActivityInput.focus();
    } else {
        otherActivityContainer.classList.add('hidden');
        if (otherActivityInput) otherActivityInput.value = '';
    }
}

function handleScrollSpy() {
    const sections = document.querySelectorAll('main > section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100;
        let sectionId = current.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
               link.classList.remove('active');
               if(link.getAttribute('href') === '#' + sectionId) {
                   link.classList.add('active');
               }
            });
        }
    });
}

function showInfoModal(toolKey) {
    const toolData = aiData[toolKey];
    if (!toolData || !infoModal) return;
    
    if (infoModalTitle) infoModalTitle.textContent = toolData.title;
    if (infoModalContent) infoModalContent.textContent = toolData.functionality;
    infoModal.classList.remove('hidden');
}

function updateRecommendation() {
    if (!getRecommendationBtn || !recommendationResultContainer) return;
    
    const companyType = companyTypeSelector?.value || '';
    const sector = sectorSelector?.value || '';
    let businessActivity = businessActivitySelector?.value || '';
    
    // Si seleccionó "otro", usar el valor del campo personalizado
    if (businessActivity === 'otro' && otherActivityInput?.value.trim()) {
        businessActivity = otherActivityInput.value.trim().toLowerCase();
    }
    
    const improvementGoal = improvementGoalInput?.value || '';
    const currentProblem = currentProblemInput?.value || '';

    const scores = { notionAI: 0, pipedriveAI: 0, flikiAI: 0, canvaAI: 0, pictoryAI: 0, synthesiaAI: 0, merlinAI: 1, h2oAI: 0 };
    
    // Lógica de puntuación simplificada
    if (sector === 'terciario' || sector === 'cuaternario') { 
        scores.pipedriveAI += 2; scores.canvaAI +=1; scores.flikiAI +=1; scores.pictoryAI += 1; scores.synthesiaAI += 1; scores.h2oAI += 2; 
    }
    if (sector === 'primario' || sector === 'secundario') { 
        scores.notionAI += 2; scores.pipedriveAI += 1; scores.h2oAI += 2; 
    }
    
    const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const topScore = sortedScores[0][1];
    let recommendedTools = sortedScores.filter(item => item[1] === topScore && item[1] > 0).map(item => item[0]);

    if(recommendedTools.length === 0) {
         recommendedTools = ['notionAI', 'canvaAI', 'synthesiaAI'];
    }

    let justification = `Para una empresa del sector ${sector}, las herramientas más efectivas son:`;
    
    recommendationResultContainer.classList.remove('hidden');

    let toolsHTML = '<div class="flex flex-wrap justify-center gap-4 my-4" id="recommended-tools-list">';
    let removedTools = [];
    recommendedTools.forEach(toolKey => {
        const toolData = aiData[toolKey];
        const tip = typeof aiTips !== 'undefined' && aiTips[toolKey] ? aiTips[toolKey] : '';
        if (toolData) {
            toolsHTML += `<div class="flex flex-col items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[260px] max-w-[320px] relative recommended-tool-card" data-tool-key="${toolKey}">
                <button class='absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold close-recommendation-btn' title='Quitar recomendación' data-tool-key="${toolKey}" style="background:transparent;border:none;outline:none;cursor:pointer;z-index:10;">&times;</button>
                ${tip ? `<div class='mb-2 w-full bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200 text-sm rounded-md px-3 py-2 font-medium shadow-sm text-center'>💡 ${tip}</div>` : ''}
                <div class="flex items-center">
                  <span class="font-bold text-2xl mr-3" style="color:${toolData.chartData?.borderColor || '#000'};">&#9679;</span>
                  <div>
                    <p class="font-bold text-gray-800 dark:text-gray-200">${toolData.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">${toolData.description}</p>
                  </div>
                </div>
            </div>`;
        }
    });
    toolsHTML += '</div>';
    // Área para volver a agregar IAs eliminadas
    toolsHTML += '<div id="restore-removed-tools" class="flex flex-wrap justify-center gap-2 mt-4"></div>';

    const strategyButtonHTML = `<div class="mt-6 text-center"><button id="generate-strategy-btn" class="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300">⚙️ Generar Estrategia de Implementación</button></div>`;

    recommendationResultContainer.innerHTML = `<p class="text-center text-gray-600 dark:text-gray-400">${justification}</p>${toolsHTML}${strategyButtonHTML}`;

    // Agregar evento al botón de generar estrategia
    const generateStrategyBtn = document.getElementById('generate-strategy-btn');
    if (generateStrategyBtn) {
        generateStrategyBtn.addEventListener('click', () => {
            const currentTools = Array.from(document.querySelectorAll('.recommended-tool-card')).map(card => card.getAttribute('data-tool-key'));
            generateStrategy(currentTools, improvementGoal, currentProblem);
        });
    }

    // Lógica para eliminar y restaurar recomendaciones
    function updateCloseButtons() {
        const cards = document.querySelectorAll('.recommended-tool-card');
        const closeBtns = document.querySelectorAll('.close-recommendation-btn');
        if (cards.length <= 1) {
            closeBtns.forEach(btn => btn.style.display = 'none');
        } else {
            closeBtns.forEach(btn => btn.style.display = '');
        }
    }
    updateCloseButtons();

    // Guardar las eliminadas
    let removedToolKeys = [];
    document.querySelectorAll('.close-recommendation-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.recommended-tool-card');
            const toolKey = card.getAttribute('data-tool-key');
            removedToolKeys.push(toolKey);
            card.remove();
            renderRestoreChips();
            updateCloseButtons();
        });
    });

    function renderRestoreChips() {
        const restoreDiv = document.getElementById('restore-removed-tools');
        if (!restoreDiv) return;
        restoreDiv.innerHTML = '';
        removedToolKeys.forEach(toolKey => {
            const toolData = aiData[toolKey];
            if (toolData) {
                const chip = document.createElement('button');
                chip.className = 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full px-4 py-1 text-sm font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2';
                chip.innerHTML = `<span>+ ${toolData.name}</span>`;
                chip.addEventListener('click', function() {
                    // Restaurar la tarjeta
                    removedToolKeys = removedToolKeys.filter(k => k !== toolKey);
                    const recommendedList = document.getElementById('recommended-tools-list');
                    if (recommendedList) {
                        // Crear la tarjeta de nuevo
                        const tip = typeof aiTips !== 'undefined' && aiTips[toolKey] ? aiTips[toolKey] : '';
                        const card = document.createElement('div');
                        card.className = 'flex flex-col items-center bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-[260px] max-w-[320px] relative recommended-tool-card';
                        card.setAttribute('data-tool-key', toolKey);
                        card.innerHTML = `
                            <button class='absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold close-recommendation-btn' title='Quitar recomendación' data-tool-key="${toolKey}" style="background:transparent;border:none;outline:none;cursor:pointer;z-index:10;">&times;</button>
                            ${tip ? `<div class='mb-2 w-full bg-yellow-100 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200 text-sm rounded-md px-3 py-2 font-medium shadow-sm text-center'>💡 ${tip}</div>` : ''}
                            <div class="flex items-center">
                              <span class="font-bold text-2xl mr-3" style="color:${toolData.chartData?.borderColor || '#000'};">&#9679;</span>
                              <div>
                                <p class="font-bold text-gray-800 dark:text-gray-200">${toolData.name}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">${toolData.description}</p>
                              </div>
                            </div>
                        `;
                        recommendedList.appendChild(card);
                        // Reasignar evento a la nueva X
                        card.querySelector('.close-recommendation-btn').addEventListener('click', function(e) {
                            e.preventDefault();
                            removedToolKeys.push(toolKey);
                            card.remove();
                            renderRestoreChips();
                            updateCloseButtons();
                        });
                        updateCloseButtons();
                    }
                    renderRestoreChips();
                });
                restoreDiv.appendChild(chip);
            }
        });
    }
    renderRestoreChips();
}

async function generateStrategy(recommendedTools, improvementGoal, currentProblem) {
    if (!strategyModal || !strategyModalContent) return;
    
    strategyModal.classList.remove('hidden');
    strategyModalContent.innerHTML = `<div class="flex flex-col items-center justify-center h-64"><div class="loader"></div><p class="mt-4 text-gray-600 dark:text-gray-400">Generando estrategia con Gemini...</p></div>`;

    const companyType = companyTypeSelector?.options[companyTypeSelector.selectedIndex]?.text || '';
    const sector = sectorSelector?.options[sectorSelector.selectedIndex]?.text || '';
    let businessActivity = businessActivitySelector?.options[businessActivitySelector.selectedIndex]?.text || '';
    
    // Si seleccionó "otro", usar el valor del campo personalizado
    if (businessActivitySelector?.value === 'otro' && otherActivityInput?.value.trim()) {
        businessActivity = otherActivityInput.value.trim();
    }
    
    const businessDescription = businessDescriptionInput?.value || '';
    const toolNames = recommendedTools.map(t => aiData[t]?.name || t).join(' y ');

    const prompt = `Actúa como un consultor experto en transformación digital para PYMES en Colombia. Crea un plan de implementación detallado para una empresa con el siguiente perfil:
    - **Tipo de Empresa:** ${companyType}
    - **Sector Económico:** ${sector}
    - **Actividad Específica:** ${businessActivity}
    - **Descripción del Negocio:** "${businessDescription}"
    - **Objetivo Principal:** "${improvementGoal}"
    - **Desafío Actual:** "${currentProblem}"
    - **Herramientas Recomendadas:** ${toolNames}

    El plan debe ser claro, accionable y en español colombiano. Formatea la respuesta en HTML simple (usando <h3>, <ul>, <li>, <strong>, <p>) y debe incluir:
    <h3>1. Fases Clave del Proyecto (Plan 30-60-90 días)</h3>
    <h3>2. KPIs para Medir el Éxito</h3>
    <h3>3. Posibles Desafíos y Cómo Superarlos</h3>`;

    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const apiUrl = `${GEMINI_CONFIG.baseUrl}?key=${GEMINI_CONFIG.apiKey}`;

    try {
        const response = await fetch(apiUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(payload) 
        });
        if (!response.ok) { 
            throw new Error(`API request failed with status ${response.status}`); 
        }
        const result = await response.json();
        
        if (result.candidates && result.candidates[0]?.content.parts[0].text) {
            let strategyText = result.candidates[0].content.parts[0].text;
            // Limpiar markdown
            strategyText = strategyText.replace(/^```html\s*|^```\s*/i, '');
            strategyText = strategyText.replace(/<div class="flex justify-center mt-8">[\s\S]*?<\/div>/gi, '');
            // Agregar título principal si no existe
            if (!/^<h1/i.test(strategyText.trim())) {
                strategyText = `<h1 style="font-size:2.2rem;font-weight:800;margin-bottom:1.5rem;text-align:center;color:#374151;">Estrategia de implementación</h1>` + strategyText;
            }
            strategyModalContent.innerHTML = strategyText;
            
            // Asociar evento del botón PDF
            const downloadPdfBtn = document.getElementById('download-pdf-btn');
            if (downloadPdfBtn) {
                downloadPdfBtn.addEventListener('click', downloadPDF);
            }
        } else {
            strategyModalContent.innerHTML = `<p class="text-red-500">No se pudo generar una estrategia. La respuesta de la IA no fue válida.</p>`;
        }
    } catch (error) {
        console.error("Error fetching strategy:", error);
        strategyModalContent.innerHTML = `<p class="text-red-500">Ocurrió un error al contactar el servicio de IA. Revisa la consola para más detalles.</p>`;
    }
}

async function downloadPDF() {
    const content = document.getElementById('strategy-modal-content');
    if (!content) return;

    // Medidas PDF A4 en px (a 96dpi aprox)
    const PDF_WIDTH = 595;
    const PDF_HEIGHT = 842;
    const HEADER_HEIGHT = Math.floor(PDF_HEIGHT * 0.1); // 10% cabecera
    const FOOTER_HEIGHT = Math.floor(PDF_HEIGHT * 0.06); // 6% pie
    const CONTENT_HEIGHT = PDF_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT;
    const SCALE_FACTOR = 3;
    const PAGE_MARGIN = 24 * SCALE_FACTOR; // 24px de margen arriba y abajo

    // Cargar imágenes de cabecera y pie
    const loadImage = src => new Promise(resolve => { const img = new window.Image(); img.src = src; img.onload = () => resolve(img); });
    const headerImg = await loadImage('img/image001.png');
    const footerImg = await loadImage('img/image003.png');

    // Clonar el contenido para no afectar el DOM
    const clone = content.cloneNode(true);
    clone.style.background = '#fff';
    clone.style.color = '#000';
    clone.style.fontSize = '11pt';
    clone.style.lineHeight = '1.6';
    clone.style.padding = '20px';
    clone.style.width = content.offsetWidth + 'px';
    clone.style.boxSizing = 'border-box';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    // Forzar estilos en todos los elementos
    clone.querySelectorAll('*').forEach(el => {
        el.style.color = '#000';
        el.style.fontSize = '11pt';
        el.style.lineHeight = '1.6';
        if (el.tagName === 'H1') {
            el.style.fontSize = '16pt';
            el.style.fontWeight = 'bold';
        }
        if (el.tagName === 'H2' || el.tagName === 'H3') {
            el.style.fontSize = '14pt';
            el.style.fontWeight = 'bold';
        }
    });
    document.body.appendChild(clone);

    // Medir el alto total del contenido clonado
    const totalHeight = clone.scrollHeight;
    const numPages = Math.ceil(totalHeight / CONTENT_HEIGHT);

    // Crear PDF
    const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });

    for (let i = 0; i < numPages; i++) {
        if (i > 0) pdf.addPage();

        // Crear slice temporal
        const slice = clone.cloneNode(true);
        slice.style.height = CONTENT_HEIGHT + 'px';
        slice.style.overflow = 'hidden';
        slice.scrollTop = i * CONTENT_HEIGHT;
        slice.style.position = 'absolute';
        slice.style.top = '-9999px';
        slice.style.left = '-9999px';
        // Forzar estilos en todos los elementos del slice
        slice.querySelectorAll('*').forEach(el => {
            el.style.color = '#000';
            el.style.fontSize = '11pt';
            el.style.lineHeight = '1.6';
            if (el.tagName === 'H1') {
                el.style.fontSize = '16pt';
                el.style.fontWeight = 'bold';
            }
            if (el.tagName === 'H2' || el.tagName === 'H3') {
                el.style.fontSize = '14pt';
                el.style.fontWeight = 'bold';
            }
        });
        document.body.appendChild(slice);

        // Scroll el slice para mostrar la parte correcta
        slice.scrollTop = i * CONTENT_HEIGHT;

        // Renderizar slice con mayor escala para nitidez
        const sliceCanvas = await html2canvas(slice, { backgroundColor: null, scale: SCALE_FACTOR, useCORS: true });
        document.body.removeChild(slice);

        // Crear canvas final para la página (3x resolución)
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = PDF_WIDTH * SCALE_FACTOR;
        pageCanvas.height = PDF_HEIGHT * SCALE_FACTOR;
        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        // Cabecera
        ctx.drawImage(headerImg, 0, 0, pageCanvas.width, HEADER_HEIGHT * SCALE_FACTOR);
        // Contenido con margen arriba y espacio extra antes del pie
        ctx.drawImage(
            sliceCanvas,
            0, 0, sliceCanvas.width, sliceCanvas.height,
            0, HEADER_HEIGHT * SCALE_FACTOR + PAGE_MARGIN,
            pageCanvas.width,
            CONTENT_HEIGHT * SCALE_FACTOR - 2 * PAGE_MARGIN - FOOTER_HEIGHT * SCALE_FACTOR
        );
        // Pie (más delgado)
        ctx.drawImage(footerImg, 0, pageCanvas.height - FOOTER_HEIGHT * SCALE_FACTOR, pageCanvas.width, FOOTER_HEIGHT * SCALE_FACTOR);

        // Agregar al PDF (escalando a tamaño real)
        pdf.addImage(
            pageCanvas.toDataURL('image/png', 1.0),
            'PNG',
            0, 0, PDF_WIDTH, PDF_HEIGHT
        );
    }

    // Limpiar
    document.body.removeChild(clone);

    pdf.save('plan-accion-ia.pdf');
}

function startAutoRotateTools() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
    autoRotateInterval = setInterval(() => {
        const toolKeys = Object.keys(aiData);
        let currentIndex = toolKeys.indexOf(currentToolKey);
        let nextIndex = (currentIndex + 1) % toolKeys.length;
        updateUI(toolKeys[nextIndex]);
    }, 10000);
}

function resetAutoRotateTools() {
    if (autoRotateInterval) clearInterval(autoRotateInterval);
    if (autoRotateTimeout) clearTimeout(autoRotateTimeout);
    autoRotateTimeout = setTimeout(() => {
        startAutoRotateTools();
    }, 10000);
}

function setupAIAdvisorSelector() {
    const advisorBtns = document.querySelectorAll('.ai-advisor-btn');
    advisorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            advisorBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            selectedAdvisor = this.getAttribute('data-advisor');
        });
    });
    // Seleccionar el primero por defecto
    if (advisorBtns.length > 0) {
        advisorBtns[0].classList.add('selected');
        selectedAdvisor = advisorBtns[0].getAttribute('data-advisor');
    }
}

function setupAdvisorAffinity() {
    const radios = document.querySelectorAll('input[name="advisor-affinity"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            advisorAffinity = this.value;
        });
    });
    // Por defecto: ninguno
    advisorAffinity = null;
}

function setupAffinityCards() {
    const cards = document.querySelectorAll('.affinity-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            cards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            affinitySelection = this.getAttribute('data-affinity');
        });
    });
    // Por defecto: ninguno seleccionado
    affinitySelection = null;
} 