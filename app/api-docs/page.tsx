import { InternalBetaPage } from "@/components/internal-beta-page"
import { SHOW_COMMERCIAL_UI } from "@/lib/internal-beta"

export default function ApiDocsPage() {
  if (!SHOW_COMMERCIAL_UI) {
    return (
      <InternalBetaPage
        title="开发者文档暂未开放"
        description="当前为内测阶段，API 文档与接入能力暂不对外开放。"
      />
    )
  }

  return (
    <InternalBetaPage
      title="开发者文档建设中"
      description="该页面正在完善中。"
    />
  )
}
