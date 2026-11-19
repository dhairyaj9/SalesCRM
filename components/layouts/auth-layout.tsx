import { cn } from '@/lib/utils'

export function AuthLayout({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className={cn(
        'w-full max-w-[420px] relative z-10',
        className
      )}>
        <div className="glass-card rounded-2xl shadow-2xl shadow-black/20 p-8">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">{title}</h1>
            {description && (
              <p className="text-sm text-blue-100/50 mt-2">{description}</p>
            )}
          </div>
          {children}
        </div>

        <p className="text-center text-xs text-blue-100/30 mt-6">
          Enterprise Sales CRM Platform
        </p>
      </div>
    </div>
  )
}
