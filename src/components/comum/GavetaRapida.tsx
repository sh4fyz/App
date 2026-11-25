import type { ReactNode } from 'react'
import { useComputador } from '@/hooks/use-media-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

type Props = {
  aberta: boolean
  aoMudar: (aberta: boolean) => void
  titulo: string
  descricao?: string
  children: ReactNode
}

/** Ações rápidas: gaveta que sobe de baixo no celular, modal no computador. */
export function GavetaRapida({ aberta, aoMudar, titulo, descricao, children }: Props) {
  const computador = useComputador()

  if (computador) {
    return (
      <Dialog open={aberta} onOpenChange={aoMudar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            <DialogDescription className={descricao ? '' : 'sr-only'}>{descricao ?? titulo}</DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={aberta} onOpenChange={aoMudar}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{titulo}</DrawerTitle>
          <DrawerDescription className={descricao ? '' : 'sr-only'}>{descricao ?? titulo}</DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-5 pb-6 pt-4">{children}</div>
      </DrawerContent>
    </Drawer>
  )
}
