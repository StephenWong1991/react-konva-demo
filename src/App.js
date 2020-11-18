import React from 'react';
import { Stage, Layer } from 'react-konva';
import Textangle from './components/Textangle';

function generateText() {
    return [...Array(5)].map((_, i) => ({
        id: i.toString(),
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        width: 150,
        height: 150,
        rotation: Math.random() * 180,
        text: '你好啊',
        fill: 'red',
        fontSize: 50
    }));
}
const INIT_TEXT = generateText();

function App() {
    const [textList, setTextList] = React.useState(INIT_TEXT);
    const [selectedId, selectShape] = React.useState(null);
    const stageRef = React.useRef();
    const layerRef = React.useRef();

    const checkDeselect = e => {
        // 是否点击空白区域取消展示选择框
        // getStage 获取顶层元素
        // e.target 当前点击元素
        // 当点击的是顶层的 Stage 组件时，即表示当前未选中任何元素，需失去选择框
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            selectShape(null);
        }
    };

    return (
        <Stage
            ref={stageRef}
            width={window.innerWidth}
            height={window.innerHeight}
            onMouseDown={checkDeselect}
        >
            <Layer ref={layerRef}>
                {textList.map((item, index) => (
                    <Textangle
                        key={index}
                        stageNode={stageRef}
                        layerNode={layerRef}
                        shapeProps={item}
                        isSelected={item.id === selectedId}
                        onSelect={() => selectShape(item.id)}
                        onChange={newAttrs => {
                            const texts = textList.slice();
                            texts[index] = newAttrs;
                            setTextList(texts);
                        }}
                    ></Textangle>
                ))}
            </Layer>
        </Stage>
    )
}

export default App;
