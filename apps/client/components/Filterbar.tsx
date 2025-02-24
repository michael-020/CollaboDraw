import { Color, Size, Stroke } from "@/hooks/useDraw";

interface FilterProps {
  setColor: (colirId: Color) => void;
  color: Color;
  setSize: (size: Size) => void;
  size: Size;
  stroke: Stroke;
  setStroke: (stroke: Stroke) => void;
}

const Filterbar = ({
  color,
  setColor,
  size,
  setSize,
  stroke,
  setStroke,
}: FilterProps) => {
  const colors = [
    "#ffffff" as Color,
    "#ed9824" as Color,
    "#ff0000" as Color,
    "#ff0080" as Color,
    "#9158f4" as Color,
    "#3bb273" as Color,
  ];
  const sizes = [
    { id: "S", size: 12 as Size },
    { id: "M", size: 16 as Size },
    { id: "L", size: 20 as Size },
    { id: "XL", size: 24 as Size },
  ];
  const strokes = [
    { id: "font-light", size: 1 as Stroke },
    { id: "font-normal", size: 2 as Stroke },
    { id: "font-semibold", size: 3 as Stroke },
    { id: "font-bold", size: 4 as Stroke },
    { id: "font-extrabold", size: 5 as Stroke },
  ];

  return (
    <div className="fixed bg-gray-100/30 backdrop-blur-sm bottom-0 m-4">
      <div className="border flex flex-col gap-2 px-2 py-4 rounded shadow-lg w-48 ">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col justify-center gap-1">
            <p className="text-xs text-gray-50 cursor-default">Stroke</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((colorId) => {
                return (
                  <button
                    onClick={() => setColor(colorId)}
                    key={colorId}
                    style={{ backgroundColor: colorId }}
                    className={`h-5 w-5 rounded ${colorId == color ? "border-2 border-gray-900" : ""}`}
                  ></button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1">
            <p className="text-xs text-gray-50 cursor-default">Stroke width</p>
            <div className="flex flex-wrap gap-2">
              {strokes.map((st) => {
                return (
                  <button
                    key={st.id}
                    onClick={() => setStroke(st.size)}
                    className={`${st.size == stroke ? "bg-purple-200" : ""} p-1 rounded transition-all duration-500 cursor-pointer bg-gray-200`}
                  >
                    <span className={`text-gray-700 ${st.id}`}>---</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-1">
            <p className="text-xs text-gray-50 cursor-default">Font size</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((sz) => {
                return (
                  <button
                    onClick={() => setSize(sz.size)}
                    key={sz.id}
                    className={`${sz.size == size ? "bg-purple-200" : ""} h-4 w-4 rounded flex justify-center items-center p-3 text-gray-700 transition-all duration-500 cursor-pointer bg-gray-200`}
                  >
                    {sz.id}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filterbar;