import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-xl! border! border-border! bg-card! text-foreground! text-sm! font-sans! shadow-none!',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
