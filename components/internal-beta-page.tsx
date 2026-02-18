import Link from "next/link"
import { Button } from "@/components/ui/button"

type InternalBetaPageProps = {
  title: string
  description?: string
}

export function InternalBetaPage({ title, description }: InternalBetaPageProps) {
  return (
    <div className="container py-20 md:py-28">
      <div className="mx-auto max-w-2xl text-center rounded-2xl border bg-card p-8 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-8">
          {description ?? "当前为内测阶段，该功能暂不对外开放。"}
        </p>
        <Button asChild>
          <Link href="/analyze">前往分析</Link>
        </Button>
      </div>
    </div>
  )
}
