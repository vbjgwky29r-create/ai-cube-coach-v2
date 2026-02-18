import { InternalBetaPage } from "@/components/internal-beta-page"
import { SHOW_COMMERCIAL_UI } from "@/lib/internal-beta"

export default function PricingPage() {
  if (!SHOW_COMMERCIAL_UI) {
    return (
      <InternalBetaPage
        title="定价页面暂未开放"
        description="当前为内测阶段，订阅与付费能力已在前端隐藏。"
      />
    )
  }

  return <InternalBetaPage title="定价页面建设中" />
}
