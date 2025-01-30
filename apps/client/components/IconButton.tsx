import { ReactNode } from "react";

export function IconButton({
    icon, onClick, activated, isCircle
}: {
    icon: ReactNode,
    onClick: () => void,
    activated: boolean,
    isCircle?: boolean
}) {

    return <div className={`m-2 pointer hover:scale-105 cursor-pointer ${isCircle ? "rounded-full": "p-[0.9px] rounded-sm" } ${activated ? "text-red-500" : ""} `} onClick={onClick}>
        {icon}
    </div>
}