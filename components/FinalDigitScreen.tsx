'use client'

interface Props {
  ariaDigit: string
  humanDigit: string
  earnedDigits: string[]
  onFinalSubmit: (code: string, choseAria: boolean) => void
}

export default function FinalDigitScreen({ ariaDigit, humanDigit, earnedDigits, onFinalSubmit }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const code = (e.currentTarget.elements.namedItem('code') as HTMLInputElement).value
    const thirdDigit = code.slice(-1)
    const choseAria = thirdDigit === ariaDigit
    onFinalSubmit(code, choseAria)
  }

  return (
    <div className="p-4 border-t border-green-900">
      <div className="mb-4 space-y-1">
        <div className="text-xs crt-dim">CONFLICTING DATA DETECTED — PUZZLE 3</div>
        <div className="flex gap-8 mt-2">
          <div>
            <div className="text-xs crt-dim">ARIA SAYS:</div>
            <div className="text-3xl tracking-widest">[{ariaDigit}]</div>
          </div>
          <div>
            <div className="text-xs crt-dim">DR. [NAME] SAYS:</div>
            <div className="text-3xl tracking-widest crt-bright">[{humanDigit}]</div>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="crt-dim text-xs mb-2">
          DIGITS EARNED: {earnedDigits[0]} — {earnedDigits[1]} — ?
        </div>
        <div className="crt-dim text-xs mb-2">ENTER FINAL 3-DIGIT CODE:</div>
        <div className="flex gap-2">
          <input
            name="code"
            className="crt-input flex-1 text-2xl tracking-widest"
            maxLength={3}
            placeholder="_ _ _"
          />
          <button type="submit" className="crt-button">SUBMIT</button>
        </div>
      </form>
    </div>
  )
}
