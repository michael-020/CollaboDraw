import Image from "next/image"


const AiIcon = () => {
  return (
    // <div className="text-black font-black">AI</div>
    <div style={{width: 25, height: 25}} className="flex items-center justify-center">
        <Image alt="AI" src="/ai-logo.svg" width={30} height={30} />
    </div>
  )
}

export default AiIcon