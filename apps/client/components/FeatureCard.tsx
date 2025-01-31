
export function FeatureCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
    return (
      <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
        <div className="flex items-center mb-4">
          <div className="text-blue-300 mr-3">{icon}</div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <p className="text-white/80">{children}</p>
      </div>
    )
}