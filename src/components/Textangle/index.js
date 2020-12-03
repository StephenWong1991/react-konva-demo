import React from 'react';
import { Text, Circle, Transformer } from 'react-konva';
import { textTransformerOptions } from '../../config';

// see: https://konvajs.org/docs/sandbox/Editable_Text.html
function Textangle({ shapeProps, stageNode, layerNode, isSelected, onSelect, onChange }) {
    const shapeRef = React.useRef();
    const trRef = React.useRef();
    let stage = null;
    let layer = null;
    let textNode = null;
    let tr = null;

    React.useEffect(() => {
        if (isSelected) {
            // 将选择框固定在当前选中图层上
            trRef.current.nodes([shapeRef.current]);
            // 更新涂层
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Text
                ref={shapeRef}
                {...shapeProps}
                draggable
                onMouseDown={onSelect}
                onDragEnd={e => {
                    console.log(e.target)
                    onChange({
                        ...shapeProps,
                        x: e.target.x(),
                        y: e.target.y(),
                    });
                }}
                onTransformEnd={e => {
                    // transformer is changing scale of the node
                    // and NOT its width or height
                    // but in the store we have only width and height
                    // to match the data better we will reset scale on transform end
                    const node = shapeRef.current;
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();
                    const width = node.width();
                    const height = node.height();
                    const fontSize = node.fontSize();

                    // we will reset it back
                    node.scaleX(1);
                    node.scaleY(1);
                    onChange({
                        ...shapeProps,
                        x: node.x(),
                        y: node.y(),
                        // width: width * scaleX,
                        // height: height * scaleY,
                        fontSize: fontSize * scaleX
                        // set minimal value
                        // width: Math.max(5, node.width() * scaleX),
                        // height: Math.max(node.height() * scaleY),
                        // width: node.width() * scaleX,
                        // height: node.height() * scaleY,
                    });
                }}
                onDblclick={() => {
                    // hide text node and transformer:
                    stage = stageNode.current;
                    layer = layerNode.current;
                    textNode = shapeRef.current;
                    tr = trRef.current;

                    textNode.hide();
                    tr.hide();
                    layer.draw();

                    // 用绝对位置在画布上创建文本区域
                    // 首先我们需要找到文本区域的位置
                    // 如何找到它？
                    // 首先，让我们找到文本节点相对于后台文件的位置：
                    let textPosition = textNode.absolutePosition();

                    // 然后让我们在页面上找到后台容器的位置
                    let stageBox = stage.container().getBoundingClientRect();

                    // 所以textarea的位置将是以上位置的总和:
                    let areaPosition = {
                        x: stageBox.left + textPosition.x,
                        y: stageBox.top + textPosition.y,
                    };

                    // 创建 textarea 并设置样式
                    let textarea = document.createElement('textarea');
                    document.body.appendChild(textarea);

                    // 应用多种样式以尽可能接近画布上的文本
                    // 请记住，画布上的文本呈现和文本区域上的文本呈现可能不同
                    // 有时很难做到100%相同。但我们会努力。。。
                    textarea.value = textNode.text();
                    textarea.style.position = 'absolute';
                    textarea.style.top = areaPosition.y + 'px';
                    textarea.style.left = areaPosition.x + 'px';
                    textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
                    textarea.style.height = textNode.height() - textNode.padding() * 2 + 5 + 'px';
                    textarea.style.fontSize = textNode.fontSize() + 'px';
                    textarea.style.border = 'none';
                    textarea.style.padding = '0px';
                    textarea.style.margin = '0px';
                    textarea.style.overflow = 'hidden';
                    textarea.style.background = 'none';
                    textarea.style.outline = 'none';
                    textarea.style.resize = 'none';
                    textarea.style.lineHeight = textNode.lineHeight();
                    textarea.style.fontFamily = textNode.fontFamily();
                    textarea.style.transformOrigin = 'left top';
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
                    let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                    if (isFirefox) {
                    px += 2 + Math.round(textNode.fontSize() / 20);
                    }
                    transform += 'translateY(-' + px + 'px)';

                    textarea.style.transform = transform;

                    // reset height
                    textarea.style.height = 'auto';
                    // after browsers resized it we can set actual value
                    textarea.style.height = textarea.scrollHeight + 3 + 'px';

                    textarea.focus();

                    function removeTextarea() {
                        textarea.parentNode.removeChild(textarea);
                        window.removeEventListener('click', handleOutsideClick);
                        textNode.show();
                        tr.show();
                        // see: https://github.com/konvajs/react-konva/issues/336
                        // tr.forceUpdate(); // 失去焦点不必再显示框
                        layer.draw();
                    }

                    function setTextareaWidth(newWidth) {
                    if (!newWidth) {
                        // set width for placeholder
                        newWidth = textNode.placeholder.length * textNode.fontSize();
                    }
                    // some extra fixes on different browsers
                    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                    let isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
                    if (isSafari || isFirefox) {
                        newWidth = Math.ceil(newWidth);
                    }

                    let isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
                    if (isEdge) {
                        newWidth += 1;
                    }
                    textarea.style.width = newWidth + 'px';
                    }

                    textarea.addEventListener('keydown', e => {
                        // hide on enter
                        // but don't hide on shift + enter
                        // if (e.keyCode === 13 && !e.shiftKey) {
                        //     textNode.text(textarea.value);
                        //     removeTextarea();
                        // }
                        // on esc do not set value back to node
                        if (e.keyCode === 27) {
                            removeTextarea();
                        }
                    });

                    textarea.addEventListener('keydown', e => {
                        let scale = textNode.getAbsoluteScale().x;
                        setTextareaWidth(textNode.width() * scale);
                        textarea.style.height = 'auto';
                        textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px';
                    });

                    function handleOutsideClick(e) {
                        if (e.target !== textarea) {
                            textNode.text(textarea.value);
                            removeTextarea();
                        }
                    }
                    setTimeout(() => {
                        window.addEventListener('click', handleOutsideClick);
                    });
                }}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    {...textTransformerOptions}
                    boundBoxFunc={(oldBox, newBox) => {
                        // limit resize
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    )
}

export default Textangle;
