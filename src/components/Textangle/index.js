import React from 'react';
import Konva from 'konva';
import { Text, Circle, Transformer } from 'react-konva';
import { textTransformerOptions, generateTextarea } from '../../config';

// Editable Text Example
// see: https://konvajs.org/docs/sandbox/Editable_Text.html
function Textangle({ shapeProps, stageNode, layerNode, isSelected, onSelect, onChange, deleteItem }) {
    const shapeRef = React.useRef();
    const trRef = React.useRef();
    const ciRef = React.useRef();

    const stage = stageNode.current;
    const layer = layerNode.current;
    const textNode = shapeRef.current;

    React.useEffect(() => {
        if (isSelected) {
            const tr = trRef.current;
            // 将选择框固定在当前选中图层上
            tr.nodes([textNode]);

            // tr.nodes([ciRef.current]);
            // 更新涂层
            tr.getLayer().batchDraw();

            // tr.update = () => {
                Konva.Transformer.prototype.update.call(tr);
                let rot = tr.findOne('.rotater');

                // see: http://disq.us/p/2c6868x
                // see: https://stackoverflow.com/questions/63455286/is-it-possible-to-use-an-icon-as-a-rotater-in-react-konva-transformer
                // https://codesandbox.io/s/react-konva-rotater-customization-isn5l?file=/src/index.js
                // disaable fill
                // rot.fill(null);
                // enable icon
                // rot.fillPatternImage(iconCanvas);

                rot.position({
                    x: textNode.width() + textNode.padding() + 10,
                    y: -10
                })
            // };
            // tr.update();

        }
    }, [isSelected]);

    return (
        <React.Fragment>
            <Text
                ref={shapeRef}
                {...shapeProps}
                draggable
                onMouseDown={onSelect}
                onMouseEnter={() => stage.container().style.cursor = "move"}
                onMouseLeave={() => stage.container().style.cursor = "default"}
                onDragEnd={e => {
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
                    const tr = trRef.current;
                    // hide text node and transformer:
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
                    let textarea = generateTextarea(textNode);

                    // 应用多种样式以尽可能接近画布上的文本
                    // 请记住，画布上的文本呈现和文本区域上的文本呈现可能不同
                    // 有时很难做到100%相同。但我们会努力。。。
                    textarea.style.top = areaPosition.y + 'px';
                    textarea.style.left = areaPosition.x + 'px';

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

                    textarea.addEventListener('keydown', e => {
                        // on esc do not set value back to node
                        if (e.keyCode === 27) {
                            removeTextarea();
                        }
                    });

                    textarea.addEventListener('keydown', e => {
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
                <React.Fragment>
                    <Transformer
                        ref={trRef}
                        {...textTransformerOptions}
                        boundBoxFunc={(oldBox, newBox) => {
                            // let tr = trRef.current;
                            // tr.update();

                            // limit resize
                            if (newBox.width < 10 || newBox.height < 10) {
                                return oldBox;
                            }
                            return newBox;
                        }}
                    >
                        {/* see: https://github.com/konvajs/konva/issues/506 */}
                        <Circle
                            ref={ciRef}
                            x={-8}
                            y={-8}
                            radius={7}
                            fill="red"
                            onMouseEnter={() => stage.container().style.cursor = "pointer"}
                            onMouseLeave={() => stage.container().style.cursor = "default"}
                            onClick={deleteItem}
                        ></Circle>
                    </Transformer>
                </React.Fragment>
            )}
        </React.Fragment>
    )
}

export default Textangle;
