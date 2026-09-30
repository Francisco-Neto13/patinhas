/**
 * Caixa de marcar com rótulo e explicação. Checkbox desmarcado não vai no
 * FormData, e é assim que as actions sabem que ficou "não".
 */
export function CampoMarcar({ nome, rotulo, ajuda, marcado }: { nome: string; rotulo: string; ajuda?: string; marcado: boolean }) {
  return (
    <div className="flex items-start gap-3">
      {/* `key`: mesmo motivo do <select> em campos.tsx, o reset do React 19. */}
      <input key={String(marcado)} id={`campo-${nome}`} name={nome} type="checkbox" defaultChecked={marcado} className="mt-0.5 size-4 accent-primary" />
      <label htmlFor={`campo-${nome}`} className="text-sm text-brown-dark">
        {rotulo}
        {ajuda && <span className="block text-xs text-taupe">{ajuda}</span>}
      </label>
    </div>
  );
}
