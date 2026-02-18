import { InternalBetaPage } from "@/components/internal-beta-page"
import { SHOW_COMMERCIAL_UI } from "@/lib/internal-beta"

export default function PurchasePage() {
  if (!SHOW_COMMERCIAL_UI) {
    return (
      <InternalBetaPage
        title="订阅开通暂未开放"
        description="当前为内测阶段，暂不支持前端订阅开通。"
      />
    )
  }

  return <InternalBetaPage title="订阅开通建设中" />
}
