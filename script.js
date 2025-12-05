// 获取DOM元素
const generateBtn = document.getElementById('generate-btn');
const exportPdfBtn = document.getElementById('export-pdf-btn');
const textInput = document.getElementById('text-input');
const fontSelect = document.getElementById('font-select');
const paperSizeSelect = document.getElementById('paper-size');
const calligraphyContainer = document.getElementById('calligraphy-container');

// 新增字体样式控件
const fontSizeSlider = document.getElementById('font-size-slider');
const fontSizeValue = document.getElementById('font-size-value');
const fontColor = document.getElementById('font-color');
const fontOpacitySlider = document.getElementById('font-opacity-slider');
const fontOpacityValue = document.getElementById('font-opacity-value');

// 实时更新滑块值显示
fontSizeSlider.addEventListener('input', (e) => {
    fontSizeValue.textContent = `${e.target.value}%`;
});

fontOpacitySlider.addEventListener('input', (e) => {
    fontOpacityValue.textContent = `${e.target.value}%`;
});

// 纸张配置
const paperConfig = {
    A4: { width: 210, height: 297, columns: 10, rows: 15 },
    A3: { width: 297, height: 420, columns: 14, rows: 20 },
    B5: { width: 176, height: 250, columns: 8, rows: 13 }
};

// 生成字帖
function generateCalligraphy() {
    // 获取用户输入
    const text = textInput.value.trim();
    if (!text) {
        alert('请输入要生成字帖的文字！');
        return;
    }
    
    const selectedFont = fontSelect.value;
    const selectedPaperSize = paperSizeSelect.value;
    
    // 清空之前生成的字帖
    calligraphyContainer.innerHTML = '';
    
    // 分割文字为字符数组，保留换行符
    const chars = text.split('');
    
    // 获取纸张配置
    const config = paperConfig[selectedPaperSize];
    
    // 计算每个格子的大小（mm）- 考虑内边距，确保田字格是正方形，符合标准田字格比例
    const margin = 20; // 留适当边距（mm）
    const maxGridWidth = Math.floor((config.width - margin) / config.columns);
    const maxGridHeight = Math.floor((config.height - margin) / config.rows);
    const gridSizeValue = Math.min(maxGridWidth, maxGridHeight); // 取较小值，确保是正方形
    
    const gridSize = {
        width: gridSizeValue,
        height: gridSizeValue
    };
    
    let currentPage = null;
    let currentRow = 0;
    let currentCol = 0;
    
    // 遍历所有字符，生成田字格
    chars.forEach((char, index) => {
        // 如果是空格，跳过
        if (char === ' ') {
            return;
        }
        
        // 如果需要新页（初始状态或遇到#字符或当前页已满）
        if (!currentPage || char === '#' || currentRow >= config.rows) {
            if (char === '#') {
                // 如果是#字符，跳过该字符，只新启一页
                if (currentPage) {
                    currentPage = null; // 标记需要新页
                }
                return;
            }
            
            const paper = createNewPage(selectedPaperSize);
            calligraphyContainer.appendChild(paper);
            currentPage = paper.querySelector('.calligraphy-page'); // 获取内部的calligraphy-page元素
            currentRow = 0;
            currentCol = 0;
        }
        
        // 如果是换行符，换行
        if (char === '\n') {
            currentRow++;
            currentCol = 0;
            return;
        }
        
        // 创建田字格，传递字体样式参数
        const fontSizePercent = parseInt(fontSizeSlider.value) / 100;
        const opacity = parseInt(fontOpacitySlider.value) / 100;
        const grid = createGrid(char, selectedFont, gridSize, fontSizePercent, fontColor.value, opacity);
        currentPage.appendChild(grid);
        
        // 更新行列计数
        currentCol++;
        if (currentCol >= config.columns) {
            currentCol = 0;
            currentRow++;
        }
    });
    
    // 如果还有剩余字符，创建最后一页
    if (currentPage && (currentCol > 0 || currentRow > 0)) {
        // 填充空白格子
        for (let i = currentCol; i < config.columns; i++) {
            const emptyGrid = createGrid('', selectedFont, gridSize);
            currentPage.appendChild(emptyGrid);
        }
    }
    
    alert('字帖生成完成！');
}

// 创建新页面
function createNewPage(paperSize) {
    const paper = document.createElement('div');
    paper.className = `paper ${paperSize}`;
    
    const page = document.createElement('div');
    page.className = 'calligraphy-page';
    paper.appendChild(page);
    
    return paper; // 返回整个纸张元素
}

// 创建田字格
function createGrid(char, font, size, fontSizePercent = 0.7, color = '#333333', opacity = 1) {
    const grid = document.createElement('div');
    grid.className = 'grid';
    
    // 设置格子大小
    grid.style.width = `${size.width}mm`;
    grid.style.height = `${size.height}mm`;
    
    // 创建字符元素
    const charElement = document.createElement('span');
    charElement.textContent = char;
    charElement.style.fontFamily = font;
    
    // 根据格子大小和用户选择的百分比调整字体大小
    const fontSize = Math.floor(size.width * fontSizePercent);
    charElement.style.fontSize = `${fontSize}px`;
    
    // 设置字体颜色和透明度
    charElement.style.color = color;
    charElement.style.opacity = opacity;
    
    // 确保字体在格子中居中显示
    charElement.style.lineHeight = `${size.height}mm`;
    charElement.style.textAlign = 'center';
    charElement.style.display = 'block';
    
    grid.appendChild(charElement);
    
    return grid;
}

// 监听生成按钮点击事件
generateBtn.addEventListener('click', generateCalligraphy);

// 导出PDF功能
function exportPDF() {
    if (calligraphyContainer.innerHTML.trim() === '') {
        alert('请先生成字帖！');
        return;
    }
    
    // 引入jsPDF
    const { jsPDF } = window.jspdf;
    
    // 获取当前选择的纸张大小
    const selectedPaperSize = paperSizeSelect.value;
    const config = paperConfig[selectedPaperSize];
    
    // 创建PDF文档，设置页面大小
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: selectedPaperSize
    });
    
    // 获取所有纸张元素
    const papers = calligraphyContainer.querySelectorAll('.paper');
    
    // 遍历所有纸张，生成PDF
    papers.forEach((paper, index) => {
        if (index > 0) {
            pdf.addPage(selectedPaperSize, 'portrait');
        }
        
        // 将纸张内容转换为canvas，然后添加到PDF中
        html2canvas(paper, {
            scale: 3, // 提高清晰度，确保高质量打印
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: paper.offsetWidth,
            windowHeight: paper.offsetHeight
        }).then(canvas => {
            // 计算图像在PDF中的位置和大小，确保填满整个页面
            const imgWidth = config.width;
            const imgHeight = config.height;
            
            // 将canvas转换为图像数据
            const imgData = canvas.toDataURL('image/png');
            
            // 添加图像到PDF，确保填满整个页面
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            
            // 如果是最后一张纸，保存PDF
            if (index === papers.length - 1) {
                pdf.save('calligraphy.pdf');
            }
        }).catch(err => {
            console.error('生成PDF失败:', err);
            alert('生成PDF失败，请重试！');
        });
    });
}

// 监听导出PDF按钮点击事件
exportPdfBtn.addEventListener('click', exportPDF);

// 监听回车键，按住Ctrl+Enter可以快速生成
textInput.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        generateCalligraphy();
    }
});