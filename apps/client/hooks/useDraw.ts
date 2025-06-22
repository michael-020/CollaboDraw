import { useCallback, useState } from "react";

export type Tool =
  | "SELECT"
  | "PENCIL"
  | "RECTANGLE"
  | "CIRCLE"
  | "LINE"
  | "ARROW"
  | "TEXT"
  | "ERASER"
  | "UNDO"
  | "REDO"
  | "AI";
export type Color =
  | "#ffffff"
  | "#FAB072"
  | "#BB0000"
  | "#FF69B4"
  | "#9158f4"
  | "#00FF00";
export type Size = 12 | 16 | 20 | 24;
export type Stroke = 1 | 3 | 5;

export const useDraw = () => {
  const [tool, setTool] = useState<Tool | "">("");
  const [color, setColor] = useState<Color>("#ffffff");
  const [size, setSize] = useState<Size>(12);
  const [stroke, setStroke] = useState<Stroke>(1);

  const changeTool = useCallback((newTool: Tool) => {
    setTool(newTool);
  }, []);

  const changeColor = useCallback((newColor: Color) => {
    setColor(newColor);
  }, []);

  const changeSize = useCallback((newSize: Size) => {
    setSize(newSize);
  }, []);

  const changeStroke = useCallback((newStroke: Stroke) => {
    setStroke(newStroke);
  }, []);

  return {
    tool,
    setTool,
    changeTool,
    color,
    setColor,
    changeColor,
    size,
    setSize,
    changeSize,
    stroke,
    setStroke,
    changeStroke,
  };
};