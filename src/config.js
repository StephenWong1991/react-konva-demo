export const textTransformerOptions = {
    anchorStroke: "#000000", // 定位点描边颜色
    anchorFill: "#ffffff", // 定位点填充颜色
    anchorSize: 14, // 定位点大小
    borderStroke: "#ffffff", // 选择框边框颜色
    keepRatio: true, // 是否保持比例
    enabledAnchors: ['bottom-left', 'bottom-right'], // 定位点
    rotationSnaps: [0, 90, 180, 270], // 旋转角度吸附
    rotationSnapTolerance: 5,
    padding: 10, // 距文字padding
    rotateAnchorOffset: 0,
};

export const textareaDefaultStyleOptions = {
    position: 'absolute',
    border: 'none',
    padding: '0px',
    margin: '0px',
    overflow: 'hidden',
    background: 'none',
    outline: 'none',
    resize: 'none',
    transformOrigin: 'left top',
};

// 创建 textarea 并设置样式
export const generateTextarea = (textNode) => {
    let textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    Object.keys(textareaDefaultStyleOptions).forEach(item => {
        textarea.style[item] = textareaDefaultStyleOptions[item];
    });
    if (!textNode) {
        return textarea;
    }
    textarea.value = textNode.text();
    textarea.style.height = textNode.height() - textNode.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = textNode.fontSize() + 'px';
    textarea.style.lineHeight = textNode.lineHeight();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill();
    let rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
        transform += 'rotateZ(' + rotation + 'deg)';
    }

    let px = 0;
    // also we need to slightly move textarea on firefox
    // because it jumps a bit
    if (isFirefox) {
        px += 2 + Math.round(textNode.fontSize() / 20);
    }
    transform += 'translateY(-' + px + 'px)';
    textarea.style.transform = transform;

    // reset height
    textarea.style.height = 'auto';
    // after browsers resized it we can set actual value
    textarea.style.height = textarea.scrollHeight + 3 + 'px';
    return textarea;
}

export const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

export const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

export const isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
