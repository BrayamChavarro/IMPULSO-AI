// Variables globales
let currentToolKey = null;
let impactChart = null;
let autoRotateInterval = null;
let autoRotateTimeout = null;
let selectedAdvisor = 'chatgpt'; // Valor por defecto
let advisorAffinity = null;
let affinitySelection = null;
let savedStrategy = null; // Para mantener la estrategia guardada

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

// === SIDEBAR DE PERFIL ===
const profileMenuBtn = document.getElementById('profile-menu-btn');
const profileSidebarOverlay = document.getElementById('profile-sidebar-overlay');
const profileSidebar = document.getElementById('profile-sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const sidebarUsername = document.getElementById('sidebar-username');
const sidebarUseremail = document.getElementById('sidebar-useremail');
const logoutBtnSidebar = document.getElementById('logout-btn-sidebar');

// Inicializar Firebase solo si no está inicializado
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyCgT1jWF9JzLrfj15ed4_wZrJOKLmL3vJ8",
    authDomain: "empresa-ai.firebaseapp.com",
    projectId: "empresa-ai",
    storageBucket: "empresa-ai.appspot.com",
    messagingSenderId: "525047010078",
    appId: "1:525047010078:web:f8f5414def9b0701e26f0f",
    measurementId: "G-TKKJK5MBYL"
  });
}
const auth = firebase.auth();
const db = firebase.firestore();

// === FUNCIONES DE PERSISTENCIA DE ESTRATEGIA ===
function saveStrategyToStorage(strategyData) {
    try {
        const dataToSave = {
            content: strategyData.content,
            timestamp: Date.now(),
            businessData: strategyData.businessData
        };
        localStorage.setItem('saved_strategy', JSON.stringify(dataToSave));
        savedStrategy = dataToSave;
        console.log('Estrategia guardada en localStorage');
    } catch (error) {
        console.error('Error guardando estrategia:', error);
    }
}

function loadStrategyFromStorage() {
    try {
        const saved = localStorage.getItem('saved_strategy');
        if (saved) {
            savedStrategy = JSON.parse(saved);
            return savedStrategy;
        }
    } catch (error) {
        console.error('Error cargando estrategia:', error);
    }
    return null;
}

function clearSavedStrategy() {
    try {
        localStorage.removeItem('saved_strategy');
        savedStrategy = null;
        console.log('Estrategia eliminada del localStorage');
    } catch (error) {
        console.error('Error eliminando estrategia:', error);
    }
}

function displaySavedStrategy() {
    const saved = loadStrategyFromStorage();
    if (saved && strategyModalContent) {
        strategyModalContent.innerHTML = saved.content;
        
        // Recrear los botones y eventos
        setupStrategyModalButtons();
        

        
        return true;
    }
    return false;
}

function setupStrategyModalButtons() {
    // Evento botón PDF
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    if (downloadPdfBtn) {
        downloadPdfBtn.removeEventListener('click', downloadPDF);
        downloadPdfBtn.addEventListener('click', downloadPDF);
    }
    
    // Evento botón primeros pasos
    const firstStepsBtn = document.getElementById('first-steps-btn');
    if (firstStepsBtn) {
        firstStepsBtn.removeEventListener('click', handleFirstSteps);
        firstStepsBtn.addEventListener('click', handleFirstSteps);
    }
}





function showTemporaryMessage(message) {
    // Crear o actualizar el mensaje temporal
    let messageDiv = document.getElementById('temp-message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'temp-message';
        messageDiv.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300';
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.style.opacity = '1';
    
    // Ocultar después de 4 segundos
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => {
            if (messageDiv && messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 4000);
}

function updateGenerateStrategyButton() {
    const viewSavedStrategyBtn = document.getElementById('view-saved-strategy-btn');
    const statusMessage = document.querySelector('.mt-6 .text-sm');
    
    if (viewSavedStrategyBtn) {
        const saved = loadStrategyFromStorage();
        
        if (saved) {
            viewSavedStrategyBtn.disabled = false;
            viewSavedStrategyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            viewSavedStrategyBtn.classList.add('hover:bg-gray-700');
            
            if (statusMessage) {
                statusMessage.textContent = 'Tienes una estrategia guardada disponible';
                statusMessage.classList.remove('text-red-500');
                statusMessage.classList.add('text-gray-500', 'dark:text-gray-400');
            }
        } else {
            viewSavedStrategyBtn.disabled = true;
            viewSavedStrategyBtn.classList.add('opacity-50', 'cursor-not-allowed');
            viewSavedStrategyBtn.classList.remove('hover:bg-gray-700');
            
            if (statusMessage) {
                statusMessage.textContent = 'No hay estrategia guardada';
                statusMessage.classList.remove('text-gray-500', 'dark:text-gray-400');
                statusMessage.classList.add('text-red-500');
            }
        }
    }
}

async function handleFirstSteps() {
    const firstStepsResult = document.getElementById('first-steps-result');
    if (firstStepsResult) {
        firstStepsResult.innerHTML = '<div class="flex flex-col items-center justify-center h-32"><div class="loader"></div><p class="mt-4 text-gray-600 dark:text-gray-400">Generando primeros pasos prácticos...</p></div>';
        
        // Obtener datos del negocio desde la estrategia guardada o desde los formularios
        const saved = loadStrategyFromStorage();
        let businessData;
        
        if (saved && saved.businessData) {
            businessData = saved.businessData;
        } else {
            // Obtener datos de los formularios
            const companyType = companyTypeSelector?.options[companyTypeSelector.selectedIndex]?.text || '';
            const sector = sectorSelector?.options[sectorSelector.selectedIndex]?.text || '';
            let businessActivity = businessActivitySelector?.options[businessActivitySelector.selectedIndex]?.text || '';
            
            if (businessActivitySelector?.value === 'otro' && otherActivityInput?.value.trim()) {
                businessActivity = otherActivityInput.value.trim();
            }
            
            businessData = {
                companyType,
                sector,
                businessActivity,
                businessDescription: businessDescriptionInput?.value || '',
                improvementGoal: improvementGoalInput?.value || '',
                currentProblem: currentProblemInput?.value || '',
                toolNames: 'las herramientas recomendadas'
            };
        }
        
        // Prompt dinámico para primeros pasos
        const firstStepsPrompt = `Actúa como un experto en ${businessData.toolNames} para PYMES colombianas. Basado en este perfil de empresa: Tipo de Empresa: ${businessData.companyType}, Sector: ${businessData.sector}, Actividad: ${businessData.businessActivity}, Descripción: ${businessData.businessDescription}, Objetivo: ${businessData.improvementGoal}, Desafío: ${businessData.currentProblem}. Genera 3 ejemplos prácticos y listos para usar que ayuden a la empresa a dar sus primeros pasos con la herramienta recomendada. Si es de marketing, crea borradores de publicaciones; si es de productividad, redacta un email de presentación; si es de ventas, crea una plantilla de WhatsApp Business. Responde en HTML simple sin clases CSS, solo usando etiquetas básicas (<ul>, <li>, <strong>, <p>, <h4>). Mantén el texto corto y conciso para que sea fácil de leer en móvil.`;
        
        const apiUrl = `${GEMINI_CONFIG.baseUrl}?key=${GEMINI_CONFIG.apiKey}`;
        const payload = { contents: [{ parts: [{ text: firstStepsPrompt }] }] };
        
        try {
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
            const result = await response.json();
            let stepsText = result.candidates && result.candidates[0]?.content.parts[0].text ? result.candidates[0].content.parts[0].text : '';
            // Limpiar backticks del inicio y del final
            stepsText = stepsText.replace(/^```html\s*|^```\s*/i, '');
            stepsText = stepsText.replace(/\s*```\s*$/i, '');
            stepsText = stepsText.trim();
            
            // Crear el contenido con clases CSS responsivas
            const responsiveContent = `
                <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 sm:p-6 rounded-lg border border-green-200 dark:border-green-700 mt-6">
                    <h3 class="text-lg sm:text-xl font-bold mb-4 text-green-700 dark:text-green-300 flex items-center gap-2">
                        <span class="text-xl sm:text-2xl">🚀</span>
                        <span>Primeros pasos prácticos</span>
                    </h3>
                    <div class="responsive-content text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                        ${stepsText}
                    </div>
                </div>
            `;
            
            firstStepsResult.innerHTML = responsiveContent;
            
            // Aplicar estilos responsivos a los elementos generados
            const generatedContent = firstStepsResult.querySelector('.responsive-content');
            if (generatedContent) {
                // Aplicar clases a los elementos generados
                const paragraphs = generatedContent.querySelectorAll('p');
                paragraphs.forEach(p => {
                    p.classList.add('mb-3', 'text-gray-700', 'dark:text-gray-300', 'leading-relaxed');
                });
                
                const lists = generatedContent.querySelectorAll('ul');
                lists.forEach(ul => {
                    ul.classList.add('space-y-2', 'pl-4', 'sm:pl-6');
                });
                
                const listItems = generatedContent.querySelectorAll('li');
                listItems.forEach(li => {
                    li.classList.add('text-gray-700', 'dark:text-gray-300', 'leading-relaxed');
                });
                
                const headings = generatedContent.querySelectorAll('h4');
                headings.forEach(h => {
                    h.classList.add('font-semibold', 'text-base', 'sm:text-lg', 'mb-2', 'text-green-700', 'dark:text-green-300');
                });
                
                const strongElements = generatedContent.querySelectorAll('strong');
                strongElements.forEach(strong => {
                    strong.classList.add('font-semibold', 'text-green-700', 'dark:text-green-300');
                });
                
                // Scroll suave hacia el contenido de primeros pasos en móvil
                if (window.innerWidth <= 640) {
                    setTimeout(() => {
                        firstStepsResult.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                        });
                    }, 100);
                }
            }
        } catch (error) {
            firstStepsResult.innerHTML = `
                <div class="bg-red-50 dark:bg-red-900/20 p-4 sm:p-6 rounded-lg border border-red-200 dark:border-red-700 mt-6">
                    <p class="text-red-600 dark:text-red-400 text-sm sm:text-base">
                        ❌ No se pudieron generar los primeros pasos. Intenta de nuevo.
                    </p>
                </div>
            `;
        }
    }
}

// === PROTECCIÓN DE RUTA: SOLO USUARIOS AUTENTICADOS ===
const loader = document.getElementById('global-loader');
auth.onAuthStateChanged(function(user) {
  if (!user) {
    if (loader) loader.style.display = 'none';
    window.location.replace('login.html');
  } else {
    if (loader) loader.style.display = 'none';
    // --- INICIO DE INICIALIZACIÓN PRINCIPAL ---
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
    setupProfileMenu();
    // Cargar datos del perfil del usuario
    loadUserProfile();
    // Cargar estrategia guardada si existe
    loadStrategyFromStorage();
    console.log('Aplicación configurada correctamente');
    // --- FIN DE INICIALIZACIÓN PRINCIPAL ---
  }
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
            const card = document.createElement('div');
            card.className = 'carousel-logo-card';
            card.innerHTML = `<img src="${tool.logo}" alt="Logo de ${tool.name}" class="h-16 w-16 object-contain" draggable="false">`;
            scroller.appendChild(card);
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

    // Agregar event listeners para actualizar el botón cuando cambian los datos del formulario
    [companyTypeSelector, sectorSelector, businessDescriptionInput, improvementGoalInput, currentProblemInput, otherActivityInput].forEach(element => {
        if (element) {
            element.addEventListener('change', updateGenerateStrategyButton);
            element.addEventListener('input', updateGenerateStrategyButton);
        }
    });
    
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
            // Verificar si hay una estrategia guardada
            const saved = loadStrategyFromStorage();
            if (saved) {
                // Mostrar estrategia guardada
                if (strategyModal) {
                    strategyModal.classList.remove('hidden');
                    displaySavedStrategy();
                }
            } else {
                // Generar nueva estrategia
                const currentTools = Array.from(document.querySelectorAll('.recommended-tool-card')).map(card => card.getAttribute('data-tool-key'));
                const improvementGoal = improvementGoalInput?.value || '';
                const currentProblem = currentProblemInput?.value || '';
                generateStrategy(currentTools, improvementGoal, currentProblem);
            }
        }
    });

    // Generar ejemplos prácticos personalizados
    const generateExamplesBtn = document.getElementById('generate-examples-btn');
    if (generateExamplesBtn) {
        generateExamplesBtn.addEventListener('click', () => {
            // Reúne los datos del perfil del negocio
            const businessProfile = {
                companyType: companyTypeSelector?.value || '',
                sector: sectorSelector?.value || '',
                businessActivity: businessActivitySelector?.value || '',
                businessDescription: businessDescriptionInput?.value || '',
                improvementGoal: improvementGoalInput?.value || '',
                currentProblem: currentProblemInput?.value || ''
            };

            // Obtiene la primera herramienta recomendada como ejemplo
            const recommendedTools = Array.from(document.querySelectorAll('.recommended-tool-card'));
            if (recommendedTools.length > 0) {
                const primaryToolKey = recommendedTools[0].getAttribute('data-tool-key');
                generatePracticalExamples(primaryToolKey, businessProfile);
            } else {
                alert('Primero debes generar una recomendación de herramienta.');
            }
        });
    }
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
    
    // Actualizar el botón cuando cambian los datos
    updateGenerateStrategyButton();
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

    // Verificar si hay una estrategia guardada
    const saved = loadStrategyFromStorage();
    
    // Crear HTML para ambos botones
    const strategyButtonHTML = `<div class="mt-6 text-center space-y-3">
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button id="generate-new-strategy-btn" class="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors duration-300 flex items-center justify-center gap-2">
                <span>⚙️ Generar Nueva Estrategia</span>
            </button>
            <button id="view-saved-strategy-btn" class="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-300 flex items-center justify-center gap-2 ${saved ? '' : 'opacity-50 cursor-not-allowed'}" ${saved ? '' : 'disabled'}>
                <span>📋 Ver Estrategia Guardada</span>
            </button>
        </div>
        ${saved ? '<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Tienes una estrategia guardada disponible</p>' : '<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">No hay estrategia guardada</p>'}
    </div>`;

    recommendationResultContainer.innerHTML = `<p class="text-center text-gray-600 dark:text-gray-400">${justification}</p>${toolsHTML}${strategyButtonHTML}`;

    // Agregar eventos a los botones de estrategia
    const generateNewStrategyBtn = document.getElementById('generate-new-strategy-btn');
    const viewSavedStrategyBtn = document.getElementById('view-saved-strategy-btn');
    
    if (generateNewStrategyBtn) {
        generateNewStrategyBtn.addEventListener('click', () => {
            const currentTools = Array.from(document.querySelectorAll('.recommended-tool-card')).map(card => card.getAttribute('data-tool-key'));
            
            // Siempre limpiar la estrategia anterior y generar una nueva
            clearSavedStrategy();
            generateStrategy(currentTools, improvementGoal, currentProblem);
            
            // Actualizar el estado de los botones después de generar
            setTimeout(() => {
                updateGenerateStrategyButton();
            }, 100);
        });
    }
    
    if (viewSavedStrategyBtn) {
        viewSavedStrategyBtn.addEventListener('click', () => {
            if (displaySavedStrategy()) {
                strategyModal.classList.remove('hidden');
            }
                });
    }
    
    // Actualizar el estado de los botones después de crear la recomendación
    updateGenerateStrategyButton();
    
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

    const prompt = `Actúa como 'Impulso IA', un consultor élite en transformación digital, especializado en el ecosistema de PYMES y emprendimientos de Colombia. Tu tono debe ser experto, alentador y práctico. Tu misión es entregar un plan de acción estratégico que sea 100% aplicable en el contexto colombiano.

Basado en el siguiente perfil de empresa:

- **Tipo de Empresa:** ${companyType}
- **Sector Económico:** ${sector}
- **Actividad Específica:** ${businessActivity}
- **Descripción del Negocio:** "${businessDescription}"
- **Objetivo Principal:** "${improvementGoal}"
- **Desafío Actual:** "${currentProblem}"
- **Herramientas Seleccionadas:** ${toolNames}

Genera un plan de implementación detallado. La respuesta DEBE ser en formato HTML simple (<h3>, <ul>, <li>, <strong>, <p>) y debe incluir OBLIGATORIAMENTE las siguientes secciones:

<h3>1. Diagnóstico y Quick Wins (Victorias Tempranas)</h3>
<p>Basado en el perfil, haz un breve diagnóstico del desafío principal. Luego, lista 2-3 acciones de bajo costo y alto impacto que la empresa puede implementar en los próximos 7 días usando las herramientas recomendadas.</p>

<h3>2. Plan de Implementación 30-60-90 Días</h3>
<p>Detalla un plan de acción por fases. Sé específico en las tareas para cada fase y cómo las herramientas seleccionadas se aplican en cada paso.</p>

<h3>3. KPIs para Medir el Retorno de Inversión (ROI)</h3>
<p>Define 3 a 5 indicadores clave de rendimiento (KPIs) para medir el éxito del plan. Incluye al menos un KPI financiero (ej: reducción de costos, aumento de ingresos) y uno operativo (ej: horas ahorradas, leads generados).</p>

<h3>4. Radar de Oportunidades en Colombia</h3>
<p>Menciona al menos una iniciativa, programa o beneficio específico del gobierno colombiano o de gremios que esta empresa podría explorar. Basa tus sugerencias en programas como los Centros de Transformación Digital, iNNpulsa, MinTIC o beneficios tributarios por inversión en CTeI. Adapta la sugerencia al sector y tamaño de la empresa.</p>

<h3>5. Gestión de Riesgos y Desafíos Locales</h3>
<p>Identifica 2 posibles desafíos en la implementación (ej: resistencia al cambio, conectividad, curva de aprendizaje) y ofrece una solución práctica y realista para cada uno, pensando en la realidad de una PYME colombiana.</p>`;

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
            // Limpiar markdown y backticks del inicio y final
            strategyText = strategyText.replace(/^```html\s*|^```\s*/i, '');
            strategyText = strategyText.replace(/\s*```\s*$/i, '');
            strategyText = strategyText.replace(/<div class="flex justify-center mt-8">[\s\S]*?<\/div>/gi, '');
            strategyText = strategyText.trim();
            // Agregar título principal si no existe
            if (!/^<h1/i.test(strategyText.trim())) {
                strategyText = `<h1 style="font-size:2.2rem;font-weight:800;margin-bottom:1.5rem;text-align:center;" class="text-gray-900 dark:text-white">Estrategia de implementación</h1>` + strategyText;
            }
            // Agregar div para resultados de primeros pasos
            strategyText += `<div id="first-steps-result" class="mt-8 w-full max-w-none overflow-x-auto"></div>`;
            strategyModalContent.innerHTML = strategyText;
            
            // Guardar estrategia en localStorage
            const businessData = {
                companyType,
                sector,
                businessActivity,
                businessDescription,
                improvementGoal,
                currentProblem,
                toolNames
            };
            
            saveStrategyToStorage({
                content: strategyText,
                businessData: businessData
            });
            
            // Actualizar el estado de los botones
            updateGenerateStrategyButton();
            
            // Agregar botón de primeros pasos al div de acciones
            const strategyModalActions = document.getElementById('strategy-modal-actions');
            if (strategyModalActions) {
                // Eliminar botón existente si ya existe
                const existingBtn = document.getElementById('first-steps-btn');
                if (existingBtn) {
                    existingBtn.remove();
                }
                
                const firstStepsBtn = document.createElement('button');
                firstStepsBtn.id = 'first-steps-btn';
                firstStepsBtn.className = 'bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 sm:px-4 w-36 sm:w-44 lg:w-48 rounded-full shadow-2xl transition-colors text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2';
                firstStepsBtn.style.boxShadow = '0 8px 32px rgba(16,185,129,0.25)';
                firstStepsBtn.innerHTML = '<span class="hidden sm:inline">Ayúdame a empezar</span><span class="sm:hidden">Empezar</span>';
                
                // Insertar el botón al principio del div de acciones
                strategyModalActions.insertBefore(firstStepsBtn, strategyModalActions.firstChild);
            }
            // Evento botón PDF
            const downloadPdfBtn = document.getElementById('download-pdf-btn');
            if (downloadPdfBtn) {
                downloadPdfBtn.addEventListener('click', downloadPDF);
            }
            // Evento botón primeros pasos
            const firstStepsBtn = document.getElementById('first-steps-btn');
            if (firstStepsBtn) {
                firstStepsBtn.addEventListener('click', handleFirstSteps);
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

    // Deshabilitar botón de descarga
    const downloadBtn = document.getElementById('download-pdf-btn');
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.5';
        downloadBtn.textContent = 'Generando...';
    }

    // Mostrar indicador de progreso
    const progressIndicator = document.createElement('div');
    progressIndicator.innerHTML = `
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[70]">
            <div class="bg-white rounded-lg p-6 text-center">
                <div class="loader mb-4"></div>
                <p class="text-gray-700">Generando PDF...</p>
                <div class="mt-2 text-sm text-gray-500">Preparando contenido...</div>
            </div>
        </div>
    `;
    document.body.appendChild(progressIndicator);

    try {
        // Medidas PDF A4 en px (a 96dpi aprox)
        const PDF_WIDTH = 595;
        const PDF_HEIGHT = 842;
        const HEADER_HEIGHT = Math.floor(PDF_HEIGHT * 0.14); // 14% cabecera (más larga)
        const FOOTER_HEIGHT = Math.floor(PDF_HEIGHT * 0.06); // 6% pie
        const SCALE_FACTOR = 2; // Reducido de 3 a 2 para mejor rendimiento
        const PAGE_MARGIN = 30 * SCALE_FACTOR; // 30px de margen arriba y abajo (optimizado para mejor espaciado)
        const CONTENT_HEIGHT = PDF_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT; // Área total disponible para contenido
        const EFFECTIVE_CONTENT_HEIGHT = CONTENT_HEIGHT - (PAGE_MARGIN * 2 / SCALE_FACTOR); // Área efectiva después de márgenes

        // Cargar imágenes de cabecera y pie de forma paralela
        const loadImage = src => new Promise(resolve => { const img = new window.Image(); img.src = src; img.onload = () => resolve(img); });
        const [headerLeftImg, headerRightImg, footerImg] = await Promise.all([
            loadImage('img/plantilla-pdf-ue.png'),
            loadImage('img/fuso-plantilla-pdf.png'),
            loadImage('img/image003.png')
        ]);

            // Clonar el contenido para no afectar el DOM
        const clone = content.cloneNode(true);
        
        // Aplicar estilos optimizados una sola vez
        const applyStyles = (element) => {
            element.style.background = '#fff';
            element.style.color = '#000';
            element.style.fontSize = '10pt';
            element.style.lineHeight = '1.6';
            element.style.padding = '20px';
            element.style.paddingBottom = '30px'; // Margen inferior moderado
            element.style.width = content.offsetWidth + 'px';
            element.style.boxSizing = 'border-box';
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '-9999px';
            
            // Aplicar estilos a elementos hijos de forma más eficiente
            const style = document.createElement('style');
            style.textContent = `
                * { color: #000 !important; font-size: 10pt !important; line-height: 1.6 !important; margin-bottom: 8px !important; }
                h1 { font-size: 15pt !important; font-weight: bold !important; margin-bottom: 15px !important; }
                h2, h3 { font-size: 13pt !important; font-weight: bold !important; margin-bottom: 12px !important; }
                p { margin-bottom: 10px !important; }
                ul, ol { margin-bottom: 12px !important; }
                li { margin-bottom: 6px !important; }
                #first-steps-result { display: none !important; }
                body { margin-bottom: 25px !important; }
                .content-wrapper { padding-bottom: 25px !important; }
            `;
            element.appendChild(style);
        };
        
        applyStyles(clone);
        document.body.appendChild(clone);

            // Remover contenido innecesario que puede hacer lento el procesamiento
        const firstStepsResult = clone.querySelector('#first-steps-result');
        if (firstStepsResult) {
            firstStepsResult.remove();
        }
        
        // Esperar a que el DOM se actualice y medir correctamente
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Medir el alto total del contenido clonado de múltiples formas
        const totalHeight = Math.max(
            clone.scrollHeight,
            clone.offsetHeight,
            clone.getBoundingClientRect().height
        );
        
        // Usar un margen más conservador para el cálculo de páginas
        const pageContentHeight = EFFECTIVE_CONTENT_HEIGHT * SCALE_FACTOR;
        let numPages = Math.max(1, Math.ceil(totalHeight / pageContentHeight));
        
        // Verificación adicional: si el contenido es muy largo, ajustar el número de páginas
        if (totalHeight > numPages * pageContentHeight) {
            numPages = Math.ceil(totalHeight / pageContentHeight) + 1;
        }
        
        console.log('PDF Debug:', {
            totalHeight,
            scrollHeight: clone.scrollHeight,
            offsetHeight: clone.offsetHeight,
            boundingHeight: clone.getBoundingClientRect().height,
            CONTENT_HEIGHT,
            EFFECTIVE_CONTENT_HEIGHT,
            SCALE_FACTOR,
            PAGE_MARGIN,
            pageContentHeight,
            estimatedPages: numPages
        });

        // Crear PDF
        const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'pt', format: 'a4', compress: true });

        // Renderizar todo el contenido una sola vez con html2canvas
        const fullCanvas = await html2canvas(clone, { 
            backgroundColor: '#ffffff', 
            scale: SCALE_FACTOR, 
            useCORS: true,
            allowTaint: true,
            logging: false,
            letterRendering: true,
            height: totalHeight + 100, // Agregar margen extra para asegurar captura completa
            width: clone.scrollWidth,
            scrollX: 0,
            scrollY: 0
        });
        
        console.log('Canvas Debug:', {
            canvasWidth: fullCanvas.width,
            canvasHeight: fullCanvas.height,
            expectedHeight: totalHeight * SCALE_FACTOR,
            cloneWidth: clone.scrollWidth,
            cloneHeight: totalHeight
        });

        // Procesar páginas mientras haya contenido
        let currentPage = 0;
        let processedHeight = 0;
        
        // Calcular número real de páginas basado en el contenido actual
        const calculateRealPages = () => {
            return Math.ceil(fullCanvas.height / pageContentHeight);
        };
        
        const realNumPages = calculateRealPages();
        
        // Mostrar información inicial
        let progressText = progressIndicator.querySelector('.text-gray-500');
        if (progressText) {
            progressText.textContent = `Iniciando procesamiento de ${realNumPages} página${realNumPages > 1 ? 's' : ''}...`;
        }
        
        await new Promise(resolve => setTimeout(resolve, 500)); // Pequeña pausa para mostrar el mensaje
        
        while (processedHeight < fullCanvas.height && currentPage < realNumPages + 1) { // +1 como margen de seguridad
            if (currentPage > 0) pdf.addPage();
            
            // Actualizar progreso con información más precisa
            progressText = progressIndicator.querySelector('.text-gray-500');
            if (progressText) {
                const progressPercentage = Math.round((processedHeight / fullCanvas.height) * 100);
                progressText.textContent = `Procesando página ${currentPage + 1} de ${realNumPages} (${progressPercentage}%)`;
            }
            
            // Pequeño delay para permitir que el DOM se actualice
            await new Promise(resolve => setTimeout(resolve, 10));

            // Crear canvas final para la página
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = PDF_WIDTH * SCALE_FACTOR;
            pageCanvas.height = PDF_HEIGHT * SCALE_FACTOR;
            const ctx = pageCanvas.getContext('2d');
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            // Cabecera con dos imágenes
            // Limpiar área de cabecera con fondo blanco
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, pageCanvas.width, HEADER_HEIGHT * SCALE_FACTOR);
            
            // Calcular dimensiones para las imágenes de cabecera (más anchas y menos altas)
            const headerImageHeight = HEADER_HEIGHT * SCALE_FACTOR * 0.65; // 65% de la altura de la cabecera (menos altas)
            const headerImageWidth = pageCanvas.width * 0.42; // 42% del ancho para cada imagen (más anchas)
            const verticalOffset = (HEADER_HEIGHT * SCALE_FACTOR - headerImageHeight) / 2; // Centrar verticalmente
            
            // Calcular posiciones para centrar las imágenes
            const totalImagesWidth = headerImageWidth * 2;
            const gap = pageCanvas.width * 0.03; // 3% de separación entre imágenes (ajustado para imágenes más anchas)
            const startX = (pageCanvas.width - totalImagesWidth - gap) / 2;
            
            // Imagen izquierda (plantilla-pdf-ue)
            ctx.drawImage(headerLeftImg, startX, verticalOffset, headerImageWidth, headerImageHeight);
            
            // Imagen derecha (fuso-plantilla-pdf)
            const rightImageX = startX + headerImageWidth + gap;
            ctx.drawImage(headerRightImg, rightImageX, verticalOffset, headerImageWidth, headerImageHeight);
            
            // Contenido - cortar la porción correspondiente del canvas completo
            const sourceY = processedHeight;
            const remainingHeight = fullCanvas.height - sourceY;
            const sourceHeight = Math.min(pageContentHeight, remainingHeight);
            
            console.log(`Página ${currentPage + 1}:`, {
                sourceY,
                sourceHeight,
                remainingHeight,
                pageContentHeight,
                fullCanvasHeight: fullCanvas.height,
                processedHeight
            });
            
            if (sourceHeight > 0) {
                // Asegurar que el contenido se dibuje en el área correcta con margen inferior
                const maxContentHeight = pageCanvas.height - HEADER_HEIGHT * SCALE_FACTOR - FOOTER_HEIGHT * SCALE_FACTOR - (PAGE_MARGIN * 2);
                const finalHeight = Math.min(sourceHeight, maxContentHeight);
                
                ctx.drawImage(
                    fullCanvas,
                    0, sourceY, fullCanvas.width, finalHeight,
                    0, HEADER_HEIGHT * SCALE_FACTOR + PAGE_MARGIN,
                    pageCanvas.width,
                    finalHeight
                );
                
                console.log(`Página ${currentPage + 1} renderizada:`, {
                    finalHeight,
                    maxContentHeight,
                    position: HEADER_HEIGHT * SCALE_FACTOR + PAGE_MARGIN
                });
                
                // Actualizar altura procesada
                processedHeight += finalHeight;
            }
            
            // Pie (más delgado)
            ctx.drawImage(footerImg, 0, pageCanvas.height - FOOTER_HEIGHT * SCALE_FACTOR, pageCanvas.width, FOOTER_HEIGHT * SCALE_FACTOR);

            // Agregar al PDF (escalando a tamaño real)
            pdf.addImage(
                pageCanvas.toDataURL('image/png', 0.8), // Reducir calidad para mejor rendimiento
                'PNG',
                0, 0, PDF_WIDTH, PDF_HEIGHT
            );
            
            currentPage++;
            
            // Actualizar progreso después de completar la página
            progressText = progressIndicator.querySelector('.text-gray-500');
            if (progressText) {
                const progressPercentage = Math.round((processedHeight / fullCanvas.height) * 100);
                const remainingHeight = fullCanvas.height - processedHeight;
                const isLastPage = remainingHeight <= 0;
                
                if (isLastPage) {
                    progressText.textContent = `Finalizando PDF... (100%)`;
                } else {
                    progressText.textContent = `Página ${currentPage} de ${realNumPages} completada (${progressPercentage}%)`;
                }
            }
        }

        console.log('PDF Generado - Estadísticas finales:', {
            totalPagesGenerated: currentPage,
            originalEstimatedPages: numPages,
            realCalculatedPages: realNumPages,
            totalContentHeight: totalHeight,
            processedHeight: processedHeight,
            fullCanvasHeight: fullCanvas.height,
            contentCaptured: `${((processedHeight / fullCanvas.height) * 100).toFixed(1)}%`
        });

        // Limpiar
        document.body.removeChild(clone);

        pdf.save('plan-accion-ia.pdf');
        
    } catch (error) {
        console.error('Error generando PDF:', error);
        alert('Error al generar el PDF. Por favor, intenta nuevamente.');
    } finally {
        // Remover indicador de progreso
        document.body.removeChild(progressIndicator);
        
        // Restaurar botón de descarga
        const downloadBtn = document.getElementById('download-pdf-btn');
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.style.opacity = '1';
            downloadBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                </svg>
                Descargar PDF
            `;
        }
    }
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

// --- Generador de ejemplos prácticos personalizados ---
/**
 * Genera ejemplos prácticos y accionables basados en la principal herramienta recomendada.
 * @param {string} primaryToolKey - La clave de la herramienta principal recomendada (ej: 'flikiAI').
 * @param {object} businessProfile - Un objeto con la información del negocio del usuario.
 */
async function generatePracticalExamples(primaryToolKey, businessProfile) {
    // Mostramos un estado de carga mientras se genera el contenido
    const practicalContentContainer = document.getElementById('practical-examples-container');
    if (practicalContentContainer) {
        practicalContentContainer.innerHTML = `<div class="flex flex-col items-center justify-center h-48"><div class="loader"></div><p class="mt-4 text-gray-600 dark:text-gray-400">Generando ejemplos prácticos para ti...</p></div>`;
    }

    const toolData = aiData[primaryToolKey];
    if (!toolData) {
        if (practicalContentContainer) {
            practicalContentContainer.innerHTML = `<p class="text-red-500">Error: No se encontraron datos para la herramienta seleccionada.</p>`;
        }
        return;
    }

    let prompt = '';
    const { companyType, sector, businessActivity, businessDescription, improvementGoal, currentProblem } = businessProfile;
    const toolCategory = toolData.description ? toolData.description.toLowerCase() : '';

    if (toolCategory.includes('video') || toolCategory.includes('diseño') || toolCategory.includes('marketing')) {
        prompt = `Actúa como un estratega de contenido y community manager experto en PYMES de Colombia. El negocio es: "${businessDescription}". Su objetivo es "${improvementGoal}". La herramienta a usar es ${toolData.name}. Crea 3 ideas de contenido listas para publicar en Instagram o Facebook. El tono debe ser cercano y usar modismos colombianos si es apropiado. Para cada idea, genera: 1.  **Texto del Post:** Un párrafo corto y atractivo. 2.  **Sugerencia Visual:** Describe la imagen o video a crear con ${toolData.name}. 3.  **Hashtags:** Incluye 5 hashtags relevantes para Colombia (ej: #HechoEnColombia, #EmprendimientoColombiano, etc.). Formatea la respuesta en HTML simple (<h3> para el título de la idea, <p> para el texto, <strong> para los subtítulos).`;
    } else if (toolCategory.includes('ventas') || toolCategory.includes('crm')) {
        prompt = `Actúa como un coach de ventas práctico para una empresa colombiana que se dedica a: "${businessDescription}". Su objetivo principal es "${improvementGoal}". Genera 2 plantillas de comunicación listas para usar que el equipo de ventas puede implementar hoy mismo. 1.  **Plantilla de Correo de Seguimiento:** Un email corto para un cliente potencial que mostró interés pero no ha respondido. Debe ser amable y no sonar desesperado. 2.  **Plantilla de WhatsApp Business:** Un mensaje para reactivar a un cliente que no compra hace tiempo, ofreciendo algo de valor (un dato útil, no necesariamente un descuento). El tono debe ser profesional pero cercano, adaptado a la forma de hacer negocios en Colombia. Formatea en HTML simple.`;
    } else if (toolCategory.includes('productividad') || toolCategory.includes('gestión')) {
        prompt = `Actúa como un consultor de operaciones y productividad para una PYME en Colombia. El negocio, que se dedica a "${businessDescription}", tiene este desafío: "${currentProblem}". Diseña la estructura de una plantilla simple en Notion para resolver ese desafío. Describe la plantilla usando listas. La respuesta debe incluir: 1.  **Nombre Sugerido para la Página de Notion.** 2.  **Estructura de la Base de Datos Principal:** Lista las 4-5 columnas (propiedades) más importantes y el tipo de cada una (ej: Tarea (Texto), Responsable (Persona), Fecha Límite (Fecha), Estado (Selección)). 3.  **Guía Rápida de Uso:** Un párrafo explicando en términos sencillos cómo el equipo debe usar esta plantilla en su día a día. Formatea la respuesta en HTML simple.`;
    } else {
        prompt = `Actúa como un asistente de IA práctico. El negocio es "${businessDescription}". Genera 2 ejemplos concretos de cómo la herramienta ${toolData.name} puede ayudar a este negocio a alcanzar su objetivo de "${improvementGoal}". Sé breve, claro y enfócate en acciones que se puedan realizar hoy mismo. Formatea en HTML simple.`;
    }

    // Llamada real a la API de Gemini
    const apiUrl = `${GEMINI_CONFIG.baseUrl}?key=${GEMINI_CONFIG.apiKey}`;
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    try {
        const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`API request failed with status ${response.status}`);
        const result = await response.json();
        let generatedContent = result.candidates && result.candidates[0]?.content.parts[0].text ? result.candidates[0].content.parts[0].text : '';
        generatedContent = generatedContent.replace(/^```html\s*|^```\s*/i, '');
        if (practicalContentContainer) {
            practicalContentContainer.innerHTML = generatedContent;
        }
    } catch (error) {
        if (practicalContentContainer) {
            practicalContentContainer.innerHTML = `<p class='text-red-500'>No se pudieron generar los ejemplos prácticos. Intenta de nuevo.</p>`;
        }
    }
}

function setupProfileMenu() {
    const profileMenuContainer = document.getElementById('profile-menu-container');
    const profileMenuBtn = document.getElementById('profile-menu-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileUserName = document.getElementById('profile-user-name');
    const profileDropdownName = document.getElementById('profile-dropdown-name');
    const logoutBtn = document.getElementById('logout-btn');

    if (!profileMenuContainer || !profileMenuBtn || !profileDropdown || !profileUserName || !profileDropdownName || !logoutBtn) {
        // Si falta algún elemento, no hacer nada
        return;
    }

    // Mostrar el menú solo si hay usuario
    auth.onAuthStateChanged(function(user) {
        if (user) {
            let name = user.displayName || user.email || 'Usuario';
            profileUserName.textContent = name.split(' ')[0];
            profileDropdownName.textContent = name;
            profileMenuContainer.classList.remove('hidden');
        } else {
            profileMenuContainer.classList.add('hidden');
        }
    });

    // Mostrar/ocultar el dropdown
    let dropdownOpen = false;
    profileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownOpen = !dropdownOpen;
        profileDropdown.classList.toggle('hidden', !dropdownOpen);
    });
    // Cerrar el dropdown al hacer click fuera
    document.addEventListener('click', function(e) {
        if (dropdownOpen && !profileMenuContainer.contains(e.target)) {
            profileDropdown.classList.add('hidden');
            dropdownOpen = false;
        }
    });
    // Cerrar sesión
    logoutBtn.addEventListener('click', function() {
        auth.signOut().then(function() {
            window.location.replace('login.html');
        });
    });
}

if (profileMenuBtn && profileSidebarOverlay && profileSidebar) {
    // Función para abrir el sidebar
    function openSidebar() {
        profileSidebarOverlay.classList.remove('hidden');
        document.body.classList.add('sidebar-open');
        setTimeout(() => {
            profileSidebar.classList.remove('translate-x-full');
            profileSidebar.classList.add('translate-x-0');
        }, 10);
    }
    
    // Función para cerrar el sidebar
    function closeSidebar() {
        profileSidebar.classList.remove('translate-x-0');
        profileSidebar.classList.add('translate-x-full');
        document.body.classList.remove('sidebar-open');
        setTimeout(() => {
            profileSidebarOverlay.classList.add('hidden');
        }, 300);
    }
    
    // Evento del botón de perfil
    profileMenuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (profileSidebarOverlay.classList.contains('hidden')) {
            openSidebar();
        } else {
            closeSidebar();
        }
    });
    
    // Evento del botón de cerrar
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', closeSidebar);
    }
    
    // Cerrar al hacer clic en el backdrop
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (sidebarBackdrop) {
        sidebarBackdrop.addEventListener('click', closeSidebar);
    }
    
    // Cerrar con la tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !profileSidebarOverlay.classList.contains('hidden')) {
            closeSidebar();
        }
    });
}
// Poblar datos del usuario en el sidebar
if (auth && sidebarUsername && sidebarUseremail) {
    auth.onAuthStateChanged(function(user) {
        if (user) {
            sidebarUsername.textContent = user.displayName || 'Usuario';
            sidebarUseremail.textContent = user.email || '';
        }
    });
}
// Logout desde el sidebar
if (logoutBtnSidebar) {
    logoutBtnSidebar.addEventListener('click', function() {
        auth.signOut().then(() => {
            window.location.replace('login.html');
        });
    });
} 