import { InternalBetaPage } from "@/components/internal-beta-page"
import { SHOW_COMMERCIAL_UI } from "@/lib/internal-beta"

export default function CheckoutPage() {
  if (!SHOW_COMMERCIAL_UI) {
    return (
      <InternalBetaPage
        title="支付页面暂未开放"
        description="当前为内测阶段，支付能力已关闭。"
      />
    )
  }

  return <InternalBetaPage title="支付页面建设中" />
}
