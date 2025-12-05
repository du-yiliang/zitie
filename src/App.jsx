import { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * 字帖生成器主组件
 * 功能：根据输入文字生成可定制样式的田字格字帖，支持导出PDF
 */
function App() {
  /**
   * 纸张配置对象
   * 定义不同纸张尺寸的宽度、高度以及每页可容纳的行列数
   */
  const paperConfig = {
    A4: { width: 210, height: 297, columns: 10, rows: 15 }, // A4纸张配置
    A3: { width: 297, height: 420, columns: 14, rows: 20 }, // A3纸张配置
    B5: { width: 176, height: 250, columns: 8, rows: 13 }   // B5纸张配置
  }

  // =========================================
  // 状态管理
  // =========================================
  const [text, setText] = useState('')                    // 输入的文字内容
  const [selectedFont, setSelectedFont] = useState('Ma Shan Zheng') // 选择的字体
  const [selectedPaperSize, setSelectedPaperSize] = useState('A4')   // 选择的纸张大小
  const [fontSize, setFontSize] = useState(70)           // 字体大小百分比
  const [fontColor, setFontColor] = useState('#333333')  // 字体颜色
  const [fontOpacity, setFontOpacity] = useState(100)    // 字体透明度
  const [pages, setPages] = useState([])                 // 生成的字帖页面数组
  
  // 格子样式相关状态
  const [gridColor, setGridColor] = useState('#000000')  // 格子颜色
  const [gridOpacity, setGridOpacity] = useState(30)     // 格子透明度
  
  // 纸张样式状态
  const [paperStyle, setPaperStyle] = useState('default') // 纸张样式（田字格、米字格等）
  
  // 文字样式状态
  const [isHollowText, setIsHollowText] = useState(false) // 是否为中空文字

  // 引用管理
  const calligraphyContainerRef = useRef(null) // 字帖容器的引用，用于PDF导出

  // =========================================
  // 文件上传处理
  // =========================================
  /**
   * 处理文件上传
   * @param {File} file - 上传的文件对象
   */
  const handleFileUpload = (file) => {
    if (!file) {
      return
    }

    // 检查文件大小（限制为1MB）
    const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB
    if (file.size > MAX_FILE_SIZE) {
      alert('文件大小不能超过1MB！')
      return
    }

    // 根据文件类型调用不同的处理函数
    if (file.name.endsWith('.txt')) {
      readTxtFile(file) // 处理TXT文件
    } else if (file.name.endsWith('.docx')) {
      readDocxFile(file) // 处理DOCX文件
    }
  }

  /**
   * 读取TXT文件内容
   * @param {File} file - TXT文件对象
   */
  const readTxtFile = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target.result
      setText(content) // 将文件内容设置到状态中
    }
    reader.readAsText(file, 'utf-8') // 使用UTF-8编码读取文件
  }

  /**
   * 读取DOCX文件内容
   * @param {File} file - DOCX文件对象
   */
  const readDocxFile = (file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result
      try {
        // 使用mammoth.js库提取DOCX文件中的纯文本
        const result = await window.mammoth.extractRawText({ arrayBuffer })
        const content = result.value
        setText(content) // 将文件内容设置到状态中
      } catch (error) {
        console.error('读取docx文件失败：', error)
        alert('读取docx文件失败，请检查文件格式是否正确！')
      }
    }
    reader.readAsArrayBuffer(file) // 以ArrayBuffer形式读取文件
  }

  // =========================================
  // 字帖生成核心逻辑
  // =========================================
  /**
   * 生成字帖函数
   * 根据输入文字和当前配置生成田字格字帖
   */
  const generateCalligraphy = () => {
    // 验证输入文字是否为空
    if (!text.trim()) {
      alert('请输入要生成字帖的文字！')
      return
    }

    // 获取当前纸张配置
    const config = paperConfig[selectedPaperSize]
    // 将输入文字拆分为字符数组
    const chars = text.split('')
    // 存储生成的页面
    const newPages = []
    // 当前处理的页面
    let currentPage = null
    // 当前行列位置
    let currentRow = 0
    let currentCol = 0

    // 计算每个格子的大小
    const margin = 20 // 纸张边距
    const gap = 2 // 格子间距（mm）
    // 计算最大格子宽度（考虑边距和间距）
    const maxGridWidth = Math.floor((config.width - margin - gap * (config.columns - 1)) / config.columns)
    // 计算最大格子高度（考虑边距和间距）
    const maxGridHeight = Math.floor((config.height - margin - gap * (config.rows - 1)) / config.rows)
    // 取宽高中的较小值作为格子大小（确保是正方形）
    const calculatedGridSize = {
      width: Math.min(maxGridWidth, maxGridHeight),
      height: Math.min(maxGridWidth, maxGridHeight)
    }

    // 遍历每个字符，生成字帖页面
    for (const char of chars) {
      // 如果是空格，跳过处理
      if (char === ' ') {
        continue
      }

      // 检查是否需要新页：
      // 1. 当前无页面
      // 2. 遇到#字符（强制分页）
      // 3. 当前页行数已满
      if (!currentPage || char === '#' || currentRow >= config.rows) {
        // 如果是#字符，跳过该字符，只新启一页
        if (char === '#') {
          if (currentPage) {
            newPages.push(currentPage) // 保存当前页
            currentPage = null
          }
          continue
        }
        
        // 如果当前页已存在，先保存当前页
        if (currentPage) {
          newPages.push(currentPage)
        }

        // 创建新页
        currentPage = { 
          chars: [], // 存储当前页的字符
          gridSize: calculatedGridSize // 当前页的格子大小
        }
        // 重置行列计数
        currentRow = 0
        currentCol = 0
      }

      // 如果是换行符，只重置列号，不增加行号
      // 这样可以避免文本中的换行导致提前分页
      if (char === '\n') {
        currentCol = 0
        continue
      }

      // 添加字符到当前页
      currentPage.chars.push({
        char // 只保存字符本身，样式通过状态动态渲染
      })

      // 更新行列计数
      currentCol++
      // 如果当前行已满，换行并增加行号
      if (currentCol >= config.columns) {
        currentCol = 0
        currentRow++
      }
    }

    // 添加最后一页到结果数组
    if (currentPage) {
      newPages.push(currentPage)
    }

    // 更新页面状态，触发重新渲染
    setPages(newPages)
  }

  // =========================================
  // PDF导出功能
  // =========================================
  /**
   * 导出PDF函数
   * 将生成的字帖页面转换为PDF文件并下载
   */
  const exportPDF = () => {
    // 验证是否已生成字帖
    if (pages.length === 0) {
      alert('请先生成字帖！')
      return
    }

    // 创建并显示导出进度提示
    const progressElement = document.createElement('div')
    progressElement.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 9999;
      font-size: 16px;
    `
    progressElement.textContent = '正在导出PDF，请勿关闭浏览器...'
    document.body.appendChild(progressElement)

    // 获取当前纸张配置
    const config = paperConfig[selectedPaperSize]
    // 创建PDF实例
    const pdf = new jsPDF({
      orientation: 'portrait', // 纵向
      unit: 'mm', // 单位：毫米
      format: selectedPaperSize // 纸张格式
    })

    // 获取所有纸张元素
    const papers = calligraphyContainerRef.current.querySelectorAll('.paper')
    let currentIndex = 0 // 当前处理的页码索引

    /**
     * 递归添加页面到PDF
     * 异步处理，避免大量页面导致的内存问题
     */
    const addPageToPDF = async () => {
      if (currentIndex < papers.length) {
        // 更新进度提示
        progressElement.textContent = `正在导出第 ${currentIndex + 1}/${papers.length} 页...`
        
        const paper = papers[currentIndex]
        
        // 临时移除纸张阴影，避免影响PDF渲染
        const originalPaperShadow = paper.style.boxShadow
        paper.style.boxShadow = 'none'
        
        // 临时简化田字格样式，避免渐变和伪元素导致的渲染问题
        const grids = paper.querySelectorAll('.grid')
        const originalStyles = [] // 存储原始样式，用于恢复
        
        grids.forEach(grid => {
          originalStyles.push({
            grid,
            background: grid.style.background,
            boxShadow: grid.style.boxShadow,
            filter: grid.style.filter
          })
          // 简化样式，移除可能导致阴影问题的复杂CSS
          grid.style.background = 'white'
          grid.style.boxShadow = 'none'
          grid.style.filter = 'none'
        })
        
        try {
          // 使用html2canvas将纸张元素转换为canvas
          const canvas = await html2canvas(paper, {
            scale: 2, // 缩放比例，影响PDF清晰度
            useCORS: true, // 允许跨域图片
            logging: false, // 关闭日志
            backgroundColor: '#ffffff', // 背景色
            windowWidth: paper.offsetWidth, // 窗口宽度
            windowHeight: paper.offsetHeight, // 窗口高度
            allowTaint: true, // 允许污染
            useForeignObjectForSVG: true, // 使用ForeignObject渲染SVG
            removeContainer: false, // 不删除临时容器
            timeout: 60000 // 超时设置（60秒）
          })
          
          // 恢复纸张和格子的原始样式
          paper.style.boxShadow = originalPaperShadow
          originalStyles.forEach(({ grid, background, boxShadow, filter }) => {
            grid.style.background = background
            grid.style.boxShadow = boxShadow
            grid.style.filter = filter
          })
          
          // 除第一页外，其他页需要添加新页面
          if (currentIndex > 0) {
            pdf.addPage(selectedPaperSize, 'portrait')
          }

          // 设置图片尺寸和数据
          const imgWidth = config.width
          const imgHeight = config.height
          const imgData = canvas.toDataURL('image/png') // 将canvas转换为PNG图片数据

          // 将图片添加到PDF
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
          currentIndex++ // 处理下一页
          
          // 使用setTimeout避免阻塞主线程
          setTimeout(addPageToPDF, 100)
        } catch (error) {
          console.error('生成PDF页面失败：', error)
          alert('生成PDF页面失败，请重试！')
          document.body.removeChild(progressElement) // 移除进度提示
        }
      } else {
        // 所有页面处理完成
        document.body.removeChild(progressElement) // 移除进度提示
        pdf.save('calligraphy.pdf') // 下载PDF文件
      }
    }

    // 开始执行PDF导出
    addPageToPDF()
  }

  // =========================================
  // 田字格渲染函数
  // =========================================
  /**
   * 渲染单个田字格
   * 根据纸张样式和配置渲染不同类型的格子（田字格、米字格等）
   * @param {Object} gridChar - 格子中的字符对象
   * @param {Object} gridSize - 格子大小对象
   * @returns {JSX.Element} 渲染后的田字格JSX元素
   */
  const renderGrid = (gridChar, gridSize) => {
    // 计算格子线的透明度（将0-100转为0-1）
    const gridOpacityValue = gridOpacity / 100
    
    // 生成带透明度的颜色（十六进制格式）
    const rgbaColor = `${gridColor.slice(0, 7)}${Math.round(gridOpacityValue * 255).toString(16).padStart(2, '0')}`
    
    // 边框样式
    const borderStyle = '1px solid ' + rgbaColor
    
    // 计算对角线长度（用于米字格）
    const diagonalLength = Math.sqrt(gridSize.width * gridSize.width + gridSize.height * gridSize.height)
    
    return (
      <div
        key={Math.random()} // 使用随机数作为key，避免渲染问题
        className="grid"
        style={{
          width: `${gridSize.width}mm`, // 格子宽度
          height: `${gridSize.height}mm`, // 格子高度
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'white',
          border: borderStyle // 格子边框
        }}
      >
        {/* 根据纸张样式绘制内部线条 */}
        {paperStyle === 'default' && (
          <> {/* 田字格样式 */}
            {/* 垂直中线 */}
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: '100%',
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                backgroundColor: rgbaColor
              }}
            />
            {/* 水平中线 */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                backgroundColor: rgbaColor
              }}
            />
          </>
        )}
        
        {paperStyle === 'lined' && (
          <> {/* 横线纸张样式 */}
            {/* 水平中线 */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                backgroundColor: rgbaColor
              }}
            />
          </>
        )}
        
        {paperStyle === 'rice' && (
          <> {/* 米字格样式 */}
            {/* 垂直中线 */}
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: '100%',
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                backgroundColor: rgbaColor
              }}
            />
            {/* 水平中线 */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '1px',
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                backgroundColor: rgbaColor
              }}
            />
            {/* 从左上到右下的对角线 */}
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: `${diagonalLength}mm`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                backgroundColor: rgbaColor
              }}
            />
            {/* 从右上到左下的对角线 */}
            <div
              style={{
                position: 'absolute',
                width: '1px',
                height: `${diagonalLength}mm`,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                backgroundColor: rgbaColor
              }}
            />
          </>
        )}
        
        {/* 字符元素 */}
        <span
          style={{
            fontFamily: selectedFont, // 字体
            fontSize: `${Math.floor(gridSize.width * (fontSize / 100))}px`, // 根据格子大小动态计算字体大小
            color: isHollowText ? 'transparent' : fontColor, // 中空文字时透明，否则使用设定颜色
            opacity: fontOpacity / 100, // 字体透明度
            lineHeight: `${gridSize.height}mm`, // 行高
            textAlign: 'center',
            display: 'block',
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            WebkitTextStroke: isHollowText ? `2px ${fontColor}` : 'none', // 中空文字时显示文字描边
            textStroke: isHollowText ? `2px ${fontColor}` : 'none' // 文字描边（标准属性）
          }}
        >
          {gridChar.char} {/* 显示格子中的字符 */}
        </span>
      </div>
    )
  }

  return (
    <div className="container">
      <h1>字帖生成器</h1>
      <form id="calligraphy-form">
        <div className="form-group">
          <label htmlFor="text-input">输入文字：</label>
          <textarea
            id="text-input"
            rows="10"
            placeholder="请输入要生成字帖的文字..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          ></textarea>
        </div>
        
        {/* 新增文件上传功能 */}
        <div className="form-group" style={{ marginTop: '15px' }}>
          <label htmlFor="file-upload">导入文件：</label>
          <input
            type="file"
            id="file-upload"
            accept=".txt,.docx"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            style={{ marginTop: '5px' }}
          />
          <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
            支持导入 .txt 和 .docx 格式文件，文件大小不超过 1MB
          </p>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="font-select">选择字体：</label>
            <select
              id="font-select"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
            >
              <option value="Ma Shan Zheng">行楷</option>
              <option value="ZCOOL XiaoWei">楷书</option>
              <option value="Kai Ti">楷体</option>
              <option value="SimSun">宋体</option>
              <option value="Noto Serif SC">衬线体</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="paper-size">纸张大小：</label>
            <select
              id="paper-size"
              value={selectedPaperSize}
              onChange={(e) => setSelectedPaperSize(e.target.value)}
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="B5">B5</option>
            </select>
          </div>
        </div>
        
        {/* 新增字体样式控制 */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="font-size-slider">
              字体大小：<span id="font-size-value">{fontSize}%</span>
            </label>
            <input
              type="range"
              id="font-size-slider"
              min="20"
              max="200"
              value={fontSize}
              step="5"
              onChange={(e) => setFontSize(parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="font-color">字体颜色：</label>
            <input
              type="color"
              id="font-color"
              value={fontColor}
              onChange={(e) => setFontColor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="font-opacity-slider">
              字体深浅度：<span id="font-opacity-value">{fontOpacity}%</span>
            </label>
            <input
              type="range"
              id="font-opacity-slider"
              min="30"
              max="100"
              value={fontOpacity}
              step="5"
              onChange={(e) => setFontOpacity(parseInt(e.target.value))}
            />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="hollow-text">中空文字：</label>
            <input
              type="checkbox"
              id="hollow-text"
              checked={isHollowText}
              onChange={(e) => setIsHollowText(e.target.checked)}
            />
          </div>
        </div>
        
        {/* 新增格子样式控制 */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="grid-color">格子颜色：</label>
            <input
              type="color"
              id="grid-color"
              value={gridColor}
              onChange={(e) => setGridColor(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="grid-opacity-slider">
              格子深浅度：<span id="grid-opacity-value">{gridOpacity}%</span>
            </label>
            <input
              type="range"
              id="grid-opacity-slider"
              min="10"
              max="100"
              value={gridOpacity}
              step="5"
              onChange={(e) => setGridOpacity(parseInt(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label htmlFor="paper-style">纸张样式：</label>
            <select
              id="paper-style"
              value={paperStyle}
              onChange={(e) => setPaperStyle(e.target.value)}
            >
              <option value="default">默认样式</option>
              <option value="lined">横线纸张</option>
              <option value="checked">方格纸张</option>
              <option value="rice">米字格纸张</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
          <button type="button" id="generate-btn" onClick={generateCalligraphy}>
            生成字帖
          </button>
          <button type="button" id="export-pdf-btn" onClick={exportPDF}>
            导出PDF
          </button>
        </div>
      </form>
      <div id="calligraphy-container" ref={calligraphyContainerRef}>
        {pages.map((page, pageIndex) => (
          <div key={pageIndex} className={`paper ${selectedPaperSize}`}>
            <div className="calligraphy-page">
              {page.chars.map((gridChar, charIndex) => (
                renderGrid(gridChar, page.gridSize)
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App