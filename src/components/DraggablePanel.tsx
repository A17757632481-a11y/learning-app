import { useState, useRef, useEffect, ReactNode } from 'react';
import './DraggablePanel.css';

interface DraggablePanelProps {
  children: ReactNode;
  title?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
}

export function DraggablePanel({
  children,
  title = '内容',
  defaultWidth = 400,
  defaultHeight = 300,
  minWidth = 200,
  minHeight = 150,
}: DraggablePanelProps) {
  const [isDetached, setIsDetached] = useState(false);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [fontSize, setFontSize] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDir, setResizeDir] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const sizeStart = useRef({ width: 0, height: 0 });

  // 拖拽移动
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('panel-header')) {
      setIsDragging(true);
      dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  // 调整大小
  const handleResizeStart = (e: React.MouseEvent, dir: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDir(dir);
    dragStart.current = { x: e.clientX, y: e.clientY };
    sizeStart.current = { width: size.width, height: size.height };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.current.x,
          y: e.clientY - dragStart.current.y,
        });
      }
      if (isResizing) {
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        let newWidth = sizeStart.current.width;
        let newHeight = sizeStart.current.height;

        if (resizeDir.includes('e')) newWidth = Math.max(minWidth, sizeStart.current.width + dx);
        if (resizeDir.includes('w')) newWidth = Math.max(minWidth, sizeStart.current.width - dx);
        if (resizeDir.includes('s')) newHeight = Math.max(minHeight, sizeStart.current.height + dy);
        if (resizeDir.includes('n')) newHeight = Math.max(minHeight, sizeStart.current.height - dy);

        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeDir, minWidth, minHeight]);

  // 分离/合并
  const toggleDetach = () => {
    if (!isDetached) {
      // 分离时设置初始位置在屏幕中央
      setPosition({
        x: (window.innerWidth - size.width) / 2,
        y: (window.innerHeight - size.height) / 2,
      });
    }
    setIsDetached(!isDetached);
  };

  // 内嵌模式
  if (!isDetached) {
    return (
      <div className="panel-inline">
        <div className="panel-toolbar">
          <div className="font-controls">
            <button onClick={() => setFontSize(Math.max(80, fontSize - 10))} title="缩小字体">A-</button>
            <span>{fontSize}%</span>
            <button onClick={() => setFontSize(Math.min(150, fontSize + 10))} title="放大字体">A+</button>
          </div>
          <button className="detach-btn" onClick={toggleDetach} title="分离窗口">
            ⧉ 分离
          </button>
        </div>
        <div className="panel-content" style={{ fontSize: `${fontSize}%` }}>
          {children}
        </div>
      </div>
    );
  }

  // 分离模式 - 可拖拽窗口
  return (
    <div
      ref={panelRef}
      className="panel-detached"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="panel-header">
        <span className="panel-title">{title}</span>
        <div className="panel-actions">
          <div className="font-controls-mini">
            <button onClick={() => setFontSize(Math.max(80, fontSize - 10))}>-</button>
            <span>{fontSize}%</span>
            <button onClick={() => setFontSize(Math.min(150, fontSize + 10))}>+</button>
          </div>
          <button className="merge-btn" onClick={toggleDetach} title="合并回页面">
            ✕
          </button>
        </div>
      </div>
      <div className="panel-body" style={{ fontSize: `${fontSize}%` }}>
        {children}
      </div>
      
      {/* 四角和四边的调整手柄 */}
      <div className="resize-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
      <div className="resize-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
      <div className="resize-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
      <div className="resize-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')} />
      <div className="resize-handle n" onMouseDown={(e) => handleResizeStart(e, 'n')} />
      <div className="resize-handle s" onMouseDown={(e) => handleResizeStart(e, 's')} />
      <div className="resize-handle e" onMouseDown={(e) => handleResizeStart(e, 'e')} />
      <div className="resize-handle w" onMouseDown={(e) => handleResizeStart(e, 'w')} />
    </div>
  );
}
